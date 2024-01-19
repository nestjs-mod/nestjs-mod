import {
  ConfigModel,
  ConfigModelProperty,
  DEFAULT_FOR_ROOT_METHOD_NAME,
  DynamicNestModuleMetadataMarkdownReportGenerator,
  InfrastructureMarkdownReportGenerator,
  NestModuleCategory,
  bootstrapNestApplicationWithOptions,
  createNestModule,
} from '@nestjs-mod/common';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { kebabCase } from 'case-anything';
import { IsNotEmpty } from 'class-validator';
import fg from 'fast-glob';
import { readFile, writeFile } from 'fs/promises';
import markdownit from 'markdown-it';
import { join } from 'path';

export const NESTJS_MOD_ALL_README_GENERATOR_FOOTER = `
## Links

* https://github.com/nestjs-mod/nestjs-mod - A collection of utilities for unifying NestJS applications and modules
* https://github.com/nestjs-mod/nestjs-mod-contrib - Contrib repository for the NestJS-mod
* https://github.com/nestjs-mod/nestjs-mod-example - Example application built with [@nestjs-mod/schematics](https://github.com/nestjs-mod/nestjs-mod/tree/master/libs/schematics)
`;

@ConfigModel()
class NestjsModAllReadmeGeneratorConfig {
  @ConfigModelProperty({
    description: 'Folders with utilities',
  })
  @IsNotEmpty()
  utilsFolders!: string[];

  @ConfigModelProperty({
    description: 'Folders with modules',
  })
  @IsNotEmpty()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  modules!: any[];

  @ConfigModelProperty({
    description: 'Name of the package.json file with information',
  })
  @IsNotEmpty()
  packageFile!: string;

  @ConfigModelProperty({
    description: 'Name of the markdown file in which to save',
  })
  @IsNotEmpty()
  markdownFile!: string;

  @ConfigModelProperty({
    description: 'Custom header markdown string',
  })
  markdownHeader?: string;

  @ConfigModelProperty({
    description: 'Custom footer markdown string',
  })
  markdownFooter?: string;

  @ConfigModelProperty({
    description: 'Telegram group',
  })
  telegramGroup?: string;
}

@Injectable()
export class NestjsModAllReadmeGeneratorService implements OnModuleInit {
  constructor(
    private readonly nestjsModAllReadmeGeneratorConfig: NestjsModAllReadmeGeneratorConfig,
    private readonly dynamicNestModuleMetadataMarkdownReportGenerator: DynamicNestModuleMetadataMarkdownReportGenerator
  ) {}

  async onModuleInit() {
    const utilsListInfo = await this.getUtilsListInfo();
    const moduleListInfo = await this.getModuleListInfo();
    const packageJsonInfo = await this.getPackageJsonInfo();

    const utilitiesHeader =
      utilsListInfo.length > 0
        ? `
## Utilities

| Link | Description |
| ---- | ----------- |
${utilsListInfo.map((u) => `| ${u.link} | ${u.description?.split('\n')[0]} |`).join('\n')}
`
        : '';

    const utilitiesBody =
      utilsListInfo.length > 0
        ? `\n## Utilities descriptions\n\n${utilsListInfo
            .map((u) => `${u.body}\n[Back to Top](#utilities)`)
            .join('\n\n---\n')}`
        : '';

    const modulesHeader =
      moduleListInfo.length > 0
        ? `
## Modules

| Link | Category | Description |
| ---- | -------- | ----------- |
${moduleListInfo.map((m) => `| ${m.link} | ${m.category} | ${m.description?.split('\n')[0]} |`).join('\n')}
`
        : '';

    const modulesBody =
      moduleListInfo.length > 0
        ? `\n## Modules descriptions\n\n${moduleListInfo
            .map((m) => `${m.body}\n[Back to Top](#modules)`)
            .join('\n\n---\n')}`
        : '';

    if (!this.nestjsModAllReadmeGeneratorConfig.markdownFile) {
      return;
    }

    if (!packageJsonInfo) {
      const readmeContent = [
        this.nestjsModAllReadmeGeneratorConfig.markdownHeader,
        utilitiesHeader,
        modulesHeader,
        utilitiesBody,
        modulesBody,
        this.nestjsModAllReadmeGeneratorConfig.markdownFooter,
      ]
        .filter(Boolean)
        .join('\n');
      await writeFile(this.nestjsModAllReadmeGeneratorConfig.markdownFile, readmeContent);
      return;
    }

    const readmeContent = `
# ${packageJsonInfo.name}

${packageJsonInfo.description}

[![NPM version][npm-image]][npm-url] [![monthly downloads][downloads-image]][downloads-url] ${
      this.nestjsModAllReadmeGeneratorConfig.telegramGroup ? `[![Telegram bot][telegram-image]][telegram-url]` : ''
    }

## Installation

\`\`\`bash
npm i --save ${packageJsonInfo.name}
\`\`\`

${[
  this.nestjsModAllReadmeGeneratorConfig.markdownHeader,
  utilitiesHeader,
  modulesHeader,
  utilitiesBody,
  modulesBody,
  this.nestjsModAllReadmeGeneratorConfig.markdownFooter,
]
  .filter(Boolean)
  .join('\n')}

## License

MIT

[npm-image]: https://badgen.net/npm/v/${packageJsonInfo.name}
[npm-url]: https://npmjs.org/package/${packageJsonInfo.name}
${
  this.nestjsModAllReadmeGeneratorConfig.telegramGroup
    ? `[telegram-image]: https://img.shields.io/badge/group-telegram-blue.svg?maxAge=2592000`
    : ''
}
${
  this.nestjsModAllReadmeGeneratorConfig.telegramGroup
    ? `[telegram-url]: ${this.nestjsModAllReadmeGeneratorConfig.telegramGroup}`
    : ''
}
[downloads-image]: https://badgen.net/npm/dm/${packageJsonInfo.name}
[downloads-url]: https://npmjs.org/package/${packageJsonInfo.name}
`;
    await writeFile(this.nestjsModAllReadmeGeneratorConfig.markdownFile, readmeContent);
  }

  private async getPackageJsonInfo() {
    if (!this.nestjsModAllReadmeGeneratorConfig.packageFile) {
      return undefined;
    }
    const packageJson: { name: string; description: string } = JSON.parse(
      (await readFile(this.nestjsModAllReadmeGeneratorConfig.packageFile)).toString()
    );
    return packageJson;
  }

  private async getUtilsListInfo() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const readmeList: any[] = [];
    const readmeFileList = await fg(
      (this.nestjsModAllReadmeGeneratorConfig?.utilsFolders ?? [])?.map((folder) => join(folder, '**', '*.md')),
      { dot: true }
    );

    const md = markdownit({
      html: true,
      linkify: true,
      typographer: true,
    });
    for (const readmeFile of readmeFileList) {
      const readmeContent = (await readFile(readmeFile)).toString();
      const readmeParsed = md.parse(readmeContent, {});
      const [utilName, description] = readmeParsed.map((p) => p.content).filter(Boolean);
      readmeList.push({
        name: utilName,
        link: `[${utilName}](#${kebabCase(utilName)})`,
        description,
        body: readmeContent,
      });
    }
    return readmeList.sort((a, b) => a.name.length - b.name.length);
  }

  private async getModuleListInfo() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const moduleList: any[] = [];
    const contextName = 'nest';
    for (const module of this.nestjsModAllReadmeGeneratorConfig?.modules ?? []) {
      const allClasses = await module;
      const onlyNestModules = Object.entries(allClasses).filter(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ([, value]: [string, any]) => value['nestModuleMetadata']
      );
      const asyncModules = onlyNestModules
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .map(([, value]: [string, any]) =>
          value[value.nestModuleMetadata['forRootMethodName'] ?? DEFAULT_FOR_ROOT_METHOD_NAME]({
            contextName,
          })
        );
      const tempPreparedModules = await bootstrapNestApplicationWithOptions({
        globalEnvironmentsOptions: { skipValidation: true },
        globalConfigurationOptions: { skipValidation: true },
        modules: { feature: asyncModules },
        wrapApplicationMethods: ['preWrapApplication'],
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const modules: any[] = [];
      for (const asyncModule of tempPreparedModules.modules['feature'] ?? []) {
        await asyncModule;
        const moduleName = asyncModule.nestModuleMetadata!.moduleName;
        const category = asyncModule.nestModuleMetadata!.moduleCategory;
        if (category) {
          asyncModule.moduleSettings = { [contextName]: asyncModule.moduleSettings?.[contextName] ?? {} };

          const description = asyncModule.nestModuleMetadata!.moduleDescription;
          if (!asyncModule.nestModuleMetadata?.moduleDisabled) {
            modules.push({
              name: moduleName,
              link: `[${moduleName}](#${moduleName.toLowerCase()})`,
              category,
              description,
              body: await this.dynamicNestModuleMetadataMarkdownReportGenerator.getReport(asyncModule, {}),
            });
          }
        }
      }
      moduleList.push(modules);
    }
    return moduleList
      .flat()
      .sort((a, b) => (a.name - b.name ? 0 : a.name.length - b.name.length))
      .sort((a, b) => (a.category - b.category ? 0 : a.category.length - b.category.length));
  }
}

export const { NestjsModAllReadmeGenerator } = createNestModule({
  moduleName: 'NestjsModAllReadmeGenerator',
  moduleDescription: 'Readme generator for nestjs-mod project.',
  moduleCategory: NestModuleCategory.infrastructure,
  staticConfigurationModel: NestjsModAllReadmeGeneratorConfig,
  imports: [InfrastructureMarkdownReportGenerator.forFeature()],
  providers: [NestjsModAllReadmeGeneratorService],
});
