import {
  BasicPackageJsonType,
  ConfigModel,
  ConfigModelProperty,
  DEFAULT_FOR_ROOT_METHOD_NAME,
  DynamicNestModuleMetadataMarkdownReportGenerator,
  InfrastructureMarkdownReportGenerator,
  NestModuleCategory,
  bootstrapNestApplicationWithOptions,
  createNestModule,
  isInfrastructureMode,
} from '@nestjs-mod/common';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { constantCase, kebabCase } from 'case-anything';
import { IsNotEmpty } from 'class-validator';
import fg from 'fast-glob';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import markdownit from 'markdown-it';
import { dirname, join } from 'path';

export const NESTJS_MOD_ALL_README_GENERATOR_FOOTER = `
## Links

* https://github.com/nestjs-mod/nestjs-mod - A collection of utilities for unifying NestJS applications and modules
* https://github.com/nestjs-mod/nestjs-mod-contrib - Contrib repository for the NestJS-mod
* https://github.com/nestjs-mod/nestjs-mod-example - Example application built with [@nestjs-mod/schematics](https://github.com/nestjs-mod/nestjs-mod/tree/master/libs/schematics)
* https://github.com/nestjs-mod/nestjs-mod/blob/master/apps/example-basic/INFRASTRUCTURE.MD - A simple example of infrastructure documentation.
* https://github.com/nestjs-mod/nestjs-mod-contrib/blob/master/apps/example-prisma/INFRASTRUCTURE.MD - An extended example of infrastructure documentation with a docker-compose file and a data base.
* https://dev.to/endykaufman/collection-of-nestjs-mod-utilities-for-unifying-applications-and-modules-on-nestjs-5256 - Article about the project NestJS-mod
* https://habr.com/ru/articles/788916 - Коллекция утилит NestJS-mod для унификации приложений и модулей на NestJS
`;

@ConfigModel()
class NestjsModAllReadmeGeneratorConfiguration {
  @ConfigModelProperty({
    description: 'Folders with utilities',
  })
  @IsNotEmpty()
  utilsFolders!: string[];

  @ConfigModelProperty({
    description: 'NodeJS modules with NestJS-mod modules',
    hideValueFromOutputs: true,
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
    description:
      'A folder of markdown files with instructions for using modules in NestJS and NestJS-mod applications (example of file names: /libs/reports/NESTJS_MOD_ALL_README_GENERATOR_USE_IN_NEST_JS.md, /libs/reports/NESTJS_MOD_ALL_README_GENERATOR_USE_IN_NEST_JS_MOD.md)',
  })
  folderWithMarkdownFilesToUse?: string;

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

  @ConfigModelProperty({
    description: 'Discord',
  })
  discord?: string;
}

@Injectable()
export class NestjsModAllReadmeGeneratorService implements OnModuleInit {
  constructor(
    private readonly nestjsModAllReadmeGeneratorConfig: NestjsModAllReadmeGeneratorConfiguration,
    private readonly dynamicNestModuleMetadataMarkdownReportGenerator: DynamicNestModuleMetadataMarkdownReportGenerator
  ) {}

  async onModuleInit() {
    const utilsListInfo = await this.getUtilsListInfo();
    const moduleListInfo = await this.getModuleListInfo();
    const packageJsonInfo = this.getPackageJsonInfo();

    let deps = [
      ...Object.entries(packageJsonInfo?.dependenciesInfo || {})
        .filter(([, info]) => info.docs)
        .map(([name]) => name),
    ].filter(Boolean);
    const devDeps = Object.entries(packageJsonInfo?.devDependenciesInfo || {})
      .filter(([, info]) => info.docs)
      .map(([name]) => name)
      .filter(Boolean);

    if (packageJsonInfo && !deps.includes(packageJsonInfo?.name) && !devDeps.includes(packageJsonInfo?.name)) {
      deps = [...deps, packageJsonInfo?.name];
    }
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
      if (!this.nestjsModAllReadmeGeneratorConfig.markdownFile) {
        return;
      }
      if (isInfrastructureMode()) {
        const fileDir = dirname(this.nestjsModAllReadmeGeneratorConfig.markdownFile);
        if (!existsSync(fileDir)) {
          mkdirSync(fileDir, { recursive: true });
        }
        writeFileSync(this.nestjsModAllReadmeGeneratorConfig.markdownFile, readmeContent);
      }
      return;
    }

    const readmeContent = `
# ${packageJsonInfo.name}

${packageJsonInfo.description ? packageJsonInfo.description : ''}

[![NPM version][npm-image]][npm-url] [![monthly downloads][downloads-image]][downloads-url] ${
      this.nestjsModAllReadmeGeneratorConfig.telegramGroup ? `[![Telegram][telegram-image]][telegram-url]` : ''
    } ${
      this.nestjsModAllReadmeGeneratorConfig.discord ? `[![Discord][discord-image]][discord-url]` : ''
    }

## Installation

\`\`\`bash
${[
  devDeps.length > 0 ? `npm i --save-dev ${devDeps.join(' ')}` : '',
  deps.length > 0 ? `npm i --save ${deps.join(' ')}` : '',
]
  .filter(Boolean)
  .join('\n')}
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
${
  this.nestjsModAllReadmeGeneratorConfig.discord
    ? `[discord-image]: https://img.shields.io/badge/discord-online-brightgreen.svg`
    : ''
}
${
  this.nestjsModAllReadmeGeneratorConfig.discord
    ? `[discord-url]: ${this.nestjsModAllReadmeGeneratorConfig.discord}`
    : ''
}
[downloads-image]: https://badgen.net/npm/dm/${packageJsonInfo.name}
[downloads-url]: https://npmjs.org/package/${packageJsonInfo.name}
`;
    if (!this.nestjsModAllReadmeGeneratorConfig.markdownFile) {
      return;
    }
    if (isInfrastructureMode()) {
      const fileDir = dirname(this.nestjsModAllReadmeGeneratorConfig.markdownFile);
      if (!existsSync(fileDir)) {
        mkdirSync(fileDir, { recursive: true });
      }
      writeFileSync(this.nestjsModAllReadmeGeneratorConfig.markdownFile, readmeContent);
    }
  }

  private getPackageJsonInfo() {
    if (!this.nestjsModAllReadmeGeneratorConfig.packageFile) {
      return undefined;
    }
    const packageJson: BasicPackageJsonType = JSON.parse(
      readFileSync(this.nestjsModAllReadmeGeneratorConfig.packageFile).toString()
    );
    return packageJson;
  }

  private async getUtilsListInfo() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const readmeList: any[] = [];
    const readmeFileList = await fg(
      (this.nestjsModAllReadmeGeneratorConfig?.utilsFolders || [])?.map((folder) => join(folder, '**', '*.md')),
      { dot: true }
    );

    const md = markdownit({
      html: true,
      linkify: true,
      typographer: true,
    });
    for (const readmeFile of readmeFileList) {
      const readmeContent = readFileSync(readmeFile).toString();
      const readmeParsed = md.parse(readmeContent, {});
      const [utilName, description] = readmeParsed.map((p) => p.content).filter(Boolean);
      readmeList.push({
        name: utilName,
        link: `[${utilName}](#${kebabCase(utilName)})`,
        description,
        body: readmeContent,
      });
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return readmeList.sort((a, b) => a.name.localeCompare(b?.name));
  }

  private async getModuleListInfo() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const moduleList: any[] = [];
    const contextName = 'nest';
    for (const m of this.nestjsModAllReadmeGeneratorConfig?.modules || []) {
      const allClasses = await m;

      const onlyNestModules = Object.entries(allClasses).filter(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ([, value]: [string, any]) => value['getNestModuleMetadata']
      );
      const asyncModules = onlyNestModules
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .map(([, value]: [string, any]) =>
          value[value.getNestModuleMetadata()['forRootMethodName'] || DEFAULT_FOR_ROOT_METHOD_NAME]({
            contextName,
          })
        );
      // collect new modules
      const tempPreparedModules = await bootstrapNestApplicationWithOptions({
        globalEnvironmentsOptions: { skipValidation: true },
        globalConfigurationOptions: { skipValidation: true },
        modules: { feature: asyncModules },
        wrapApplicationMethods: ['preWrapApplication'],
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const modules: any[] = [];
      for (const asyncModule of Object.entries(tempPreparedModules.modules || {})
        .map(([, m]) => m)
        .flat() || []) {
        await asyncModule;
        const moduleName = asyncModule.getNestModuleMetadata?.()!.moduleName;
        if (!moduleName) {
          throw new Error('moduleName not set');
        }
        const category = asyncModule.getNestModuleMetadata?.()!.moduleCategory;
        if (category) {
          asyncModule.moduleSettings = { [contextName]: asyncModule.moduleSettings?.[contextName] || {} };

          const description = asyncModule.getNestModuleMetadata?.()!.moduleDescription;
          if (!asyncModule.getNestModuleMetadata?.()?.moduleDisabled) {
            let nestJsModUsage = '';
            let nestJsUsage = '';

            if (this.nestjsModAllReadmeGeneratorConfig.folderWithMarkdownFilesToUse) {
              try {
                const filePath = join(
                  this.nestjsModAllReadmeGeneratorConfig.folderWithMarkdownFilesToUse,
                  `${constantCase(moduleName)}_USE_IN_NEST_JS.md`
                );
                nestJsUsage = readFileSync(filePath).toString();
              } catch (err) {
                //
              }
              try {
                const filePath = join(
                  this.nestjsModAllReadmeGeneratorConfig.folderWithMarkdownFilesToUse,
                  `${constantCase(moduleName)}_USE_IN_NEST_JS_MOD.md`
                );
                nestJsModUsage = readFileSync(filePath).toString();
              } catch (err) {
                //
              }
            }

            modules.push({
              name: moduleName,
              link: `[${moduleName}](#${moduleName.toLowerCase()})`,
              category,
              description,
              body: this.dynamicNestModuleMetadataMarkdownReportGenerator.getReport(asyncModule, {
                nestJsModUsage,
                nestJsUsage,
              }),
            });
          }
        }
      }
      moduleList.push(modules);
    }
    return moduleList
      .flat()
      .sort((a, b) => (a?.name as string).localeCompare(b?.name))
      .sort((a, b) => a.category.localeCompare(b.category));
  }
}

export const { NestjsModAllReadmeGenerator } = createNestModule({
  moduleName: 'NestjsModAllReadmeGenerator',
  moduleDescription: 'Readme generator for nestjs-mod modules.',
  moduleCategory: NestModuleCategory.infrastructure,
  staticConfigurationModel: NestjsModAllReadmeGeneratorConfiguration,
  imports: [InfrastructureMarkdownReportGenerator.forFeature({ featureModuleName: 'NestjsModAllReadmeGenerator' })],
  providers: [NestjsModAllReadmeGeneratorService],
});
