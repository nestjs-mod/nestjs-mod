import { Injectable, OnApplicationBootstrap, Provider } from '@nestjs/common';
import { mkdir, writeFile } from 'fs/promises';
import { basename, dirname } from 'path';
import { ConfigModel, ConfigModelProperty } from '../../../config-model/decorators';
import { ConfigModelInfo } from '../../../config-model/types';
import { EnvModelInfo } from '../../../env-model/types';
import {
  NEST_MODULES_CONFIGURATION_DESCRIPTION,
  NEST_MODULES_ENVIRONMENTS_DESCRIPTION,
  NEST_MODULES_FEATURE_CONFIGURATION_DESCRIPTION,
  NEST_MODULES_FEATURE_ENVIRONMENTS_DESCRIPTION,
  NEST_MODULES_STATIC_CONFIGURATION_DESCRIPTION,
  NEST_MODULES_STATIC_ENVIRONMENTS_DESCRIPTION,
  NEST_MODULE_CATEGORY_DESCRIPTION,
  NEST_MODULE_CATEGORY_TITLE,
} from '../../../nest-module/constants';
import {
  DynamicNestModuleMetadata,
  NEST_MODULE_CATEGORY_LIST,
  NestModuleCategory,
  WrapApplicationOptions,
} from '../../../nest-module/types';
import { createNestModule } from '../../../nest-module/utils';
import { ProjectUtils } from '../../system/project-utils/project-utils.module';
import { PackageJsonService } from '../../system/project-utils/services/package-json.service';
import { lowerCase } from 'case-anything';
import { existsSync } from 'fs';

@ConfigModel()
export class InfrastructureMarkdownReportGeneratorConfiguration {
  @ConfigModelProperty({
    description: 'Name of the markdown-file in which to save the infrastructure report',
  })
  markdownFile?: string;

  @ConfigModelProperty({
    description: 'Skip empty values of env and config models',
  })
  skipEmptySettings?: boolean;
}

@Injectable()
export class DynamicNestModuleMetadataMarkdownReportGenerator {
  constructor(
    private readonly infrastructureMarkdownReportGeneratorConfiguration: InfrastructureMarkdownReportGeneratorConfiguration
  ) {}

  async getReport(
    dynamicNestModuleMetadata: DynamicNestModuleMetadata,
    options: {
      nestJsUsage?: string;
      nestJsModUsage?: string;
      nestModulesEnvironmentsDescription?: string;
      nestModulesStaticEnvironmentsDescription?: string;
      nestModulesConfigurationDescription?: string;
      nestModulesStaticConfigurationDescription?: string;
      nestModulesFeatureConfigurationDescription?: string;
      nestModulesFeatureEnvironmentsDescription?: string;
    } = {
      nestModulesEnvironmentsDescription: NEST_MODULES_ENVIRONMENTS_DESCRIPTION,
      nestModulesStaticEnvironmentsDescription: NEST_MODULES_STATIC_ENVIRONMENTS_DESCRIPTION,
      nestModulesConfigurationDescription: NEST_MODULES_CONFIGURATION_DESCRIPTION,
      nestModulesStaticConfigurationDescription: NEST_MODULES_STATIC_CONFIGURATION_DESCRIPTION,
      nestModulesFeatureConfigurationDescription: NEST_MODULES_FEATURE_CONFIGURATION_DESCRIPTION,
      nestModulesFeatureEnvironmentsDescription: NEST_MODULES_FEATURE_ENVIRONMENTS_DESCRIPTION,
    }
  ) {
    let lines: string[] = [];
    if (dynamicNestModuleMetadata.nestModuleMetadata?.moduleCategory) {
      lines.push(`### ${dynamicNestModuleMetadata.nestModuleMetadata?.moduleName}`);
      if (dynamicNestModuleMetadata.nestModuleMetadata?.moduleDescription) {
        lines.push(`${dynamicNestModuleMetadata.nestModuleMetadata?.moduleDescription}`);
        lines.push('');
      }

      if (options.nestJsUsage) {
        lines.push(`#### Use in NestJS`);
        lines.push(`${options.nestJsUsage}`);
        lines.push('');
      }

      if (options.nestJsModUsage) {
        lines.push(`#### Use in NestJS-mod`);
        lines.push(`${options.nestJsModUsage}`);
        lines.push('');
      }

      const sharedProvidersArr =
        !dynamicNestModuleMetadata.nestModuleMetadata?.sharedProviders ||
        Array.isArray(dynamicNestModuleMetadata.nestModuleMetadata.sharedProviders)
          ? dynamicNestModuleMetadata.nestModuleMetadata?.sharedProviders
          : // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (dynamicNestModuleMetadata.nestModuleMetadata.sharedProviders as any)({
              staticConfiguration: {},
              staticEnvironments: {},
            });
      const sharedProviders = ((!dynamicNestModuleMetadata.nestModuleMetadata.sharedProviders
        ? []
        : sharedProvidersArr) || []) as Provider[];

      if (Array.isArray(sharedProviders) && sharedProviders?.length > 0) {
        lines.push('#### Shared providers');
        lines.push(
          sharedProviders
            .map(
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              (s: any) => `\`${s.provide ? String(s.provide.name || s.provide) : s.name}\``
            )
            .join(', ')
        );
        lines.push('');
      }

      const sharedImportsArr =
        !dynamicNestModuleMetadata.nestModuleMetadata?.sharedImports ||
        Array.isArray(dynamicNestModuleMetadata.nestModuleMetadata.sharedImports)
          ? dynamicNestModuleMetadata.nestModuleMetadata?.sharedImports
          : // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (dynamicNestModuleMetadata.nestModuleMetadata.sharedImports as any)({
              project: {},
              settingsModule: {},
              staticConfiguration: {},
              staticEnvironments: {},
            });
      const sharedImports = (!dynamicNestModuleMetadata.nestModuleMetadata.sharedImports ? [] : sharedImportsArr) || [];

      if (Array.isArray(sharedImports) && sharedImports?.length > 0) {
        lines.push('#### Shared imports');
        lines.push(
          sharedImports
            .map(
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              (s: any) => `\`${s.nestModuleMetadata?.moduleName || s.name}\``
            )
            .join(', ')
        );
        lines.push('');
      }

      const names = Object.keys(dynamicNestModuleMetadata.moduleSettings || { default: true });
      for (const name of names) {
        this.reportOfEnvModelInfo({
          lines,
          settingsModelInfo: dynamicNestModuleMetadata.moduleSettings?.[name].environments,
          settingsModelInfoTitle: this.appendContextName('Environments', names.length > 1 ? name : undefined),
          settingsModelInfoDescription: options.nestModulesEnvironmentsDescription,
        });

        this.reportOfConfigModelInfo({
          lines,
          settingsModelInfo: dynamicNestModuleMetadata.moduleSettings?.[name].configuration,
          settingsModelInfoTitle: this.appendContextName('Configuration', names.length > 1 ? name : undefined),
          settingsModelInfoDescription: options.nestModulesConfigurationDescription,
        });

        this.reportOfEnvModelInfo({
          lines,
          settingsModelInfo: dynamicNestModuleMetadata.moduleSettings?.[name].staticEnvironments,
          settingsModelInfoTitle: this.appendContextName('Static environments', names.length > 1 ? name : undefined),
          settingsModelInfoDescription: options.nestModulesStaticEnvironmentsDescription,
        });

        this.reportOfConfigModelInfo({
          lines,
          settingsModelInfo: dynamicNestModuleMetadata.moduleSettings?.[name].staticConfiguration,
          settingsModelInfoTitle: this.appendContextName('Static configuration', names.length > 1 ? name : undefined),
          settingsModelInfoDescription: options.nestModulesStaticConfigurationDescription,
        });

        this.reportOfConfigModelInfo({
          lines,
          settingsModelInfo: dynamicNestModuleMetadata.moduleSettings?.[name].featureConfiguration,
          settingsModelInfoTitle: this.appendContextName('Feature configuration', names.length > 1 ? name : undefined),
          settingsModelInfoDescription: options.nestModulesFeatureConfigurationDescription,
        });

        this.reportOfEnvModelInfo({
          lines,
          settingsModelInfo: dynamicNestModuleMetadata.moduleSettings?.[name].featureEnvironments,
          settingsModelInfoTitle: this.appendContextName('Feature environments', names.length > 1 ? name : undefined),
          settingsModelInfoDescription: options.nestModulesFeatureEnvironmentsDescription,
        });

        const featureModuleNames = Object.keys(
          dynamicNestModuleMetadata.moduleSettings?.[name].featureModuleConfigurations || {}
        );
        const featureEnvironmentsModuleNames = Object.keys(
          dynamicNestModuleMetadata.moduleSettings?.[name].featureModuleEnvironments || {}
        );
        if (featureModuleNames.length > 0) {
          for (const featureModuleName of featureModuleNames) {
            const featureConfigurations =
              dynamicNestModuleMetadata.moduleSettings?.[name]?.featureModuleConfigurations?.[featureModuleName] || [];
            const newLines: string[] = ['#### Modules that use feature configuration'];
            for (const featureConfiguration of featureConfigurations) {
              this.reportOfConfigModelInfo({
                titleSharps: '#####',
                lines: newLines,
                settingsModelInfo: featureConfiguration,
                settingsModelInfoTitle: `Feature module name: ${featureModuleName}`,
              });
            }
            if (newLines.length > 0) {
              lines = [...lines, ...newLines];
            }
          }
        }

        if (featureEnvironmentsModuleNames.length > 0) {
          for (const featureModuleName of featureEnvironmentsModuleNames) {
            const featureEnvironments =
              dynamicNestModuleMetadata.moduleSettings?.[name]?.featureModuleEnvironments?.[featureModuleName] || [];
            const newLines: string[] = ['#### Modules that use feature environments'];
            for (const featureEnvironment of featureEnvironments) {
              this.reportOfEnvModelInfo({
                titleSharps: '#####',
                lines: newLines,
                settingsModelInfo: featureEnvironment,
                settingsModelInfoTitle: `Feature module name: ${featureModuleName}`,
              });
            }
            if (newLines.length > 0) {
              lines = [...lines, ...newLines];
            }
          }
        }
      }
    }
    return lines.join('\n');
  }

  appendContextName(title: string, contextName?: string) {
    if (contextName) {
      return `${title}(${contextName})`;
    }
    return title;
  }

  private reportOfEnvModelInfo({
    titleSharps,
    lines,
    settingsModelInfo,
    settingsModelInfoTitle,
    settingsModelInfoDescription,
  }: {
    titleSharps?: string;
    lines: string[];
    settingsModelInfo: EnvModelInfo | undefined;
    settingsModelInfoTitle: string;
    settingsModelInfoDescription?: string;
  }) {
    if (
      this.infrastructureMarkdownReportGeneratorConfiguration.skipEmptySettings &&
      !settingsModelInfo?.modelPropertyOptions.some(
        (modelPropertyOption) =>
          settingsModelInfo?.validations[modelPropertyOption.originalName].value !== undefined &&
          settingsModelInfo?.validations[modelPropertyOption.originalName].value !== modelPropertyOption.default
      )
    ) {
      return;
    }
    if (!titleSharps) {
      titleSharps = '####';
    }
    if (settingsModelInfo !== undefined) {
      lines.push(
        `${titleSharps} ${
          settingsModelInfo.modelOptions.name
            ? `${settingsModelInfoTitle}: ${settingsModelInfo.modelOptions.name}`
            : settingsModelInfoTitle
        }`
      );
      const description = settingsModelInfo.modelOptions.description || settingsModelInfoDescription || '';
      if (description !== undefined) {
        lines.push(`${description}`);
      }
      lines.push('');
      lines.push(
        [
          '| Key    | Description | Sources | Constraints | Default | Value |',
          '| ------ | ----------- | ------- | ----------- | ------- | ----- |',
          ...(settingsModelInfo?.modelPropertyOptions
            .filter(
              (modelPropertyOption) =>
                !this.infrastructureMarkdownReportGeneratorConfiguration.skipEmptySettings ||
                (this.infrastructureMarkdownReportGeneratorConfiguration.skipEmptySettings &&
                  settingsModelInfo?.validations[modelPropertyOption.originalName].value !== undefined &&
                  settingsModelInfo?.validations[modelPropertyOption.originalName].value !==
                    modelPropertyOption.default)
            )
            .map((modelPropertyOption) =>
              [
                '',
                // Key
                `\`${String(modelPropertyOption.originalName)}${
                  modelPropertyOption.name ? ` (${modelPropertyOption.name})` : ''
                }\``,
                // Description
                modelPropertyOption.description || '-',
                // Sources
                settingsModelInfo?.validations[modelPropertyOption.originalName].propertyValueExtractors
                  .map((propertyValueExtractor) => `\`${propertyValueExtractor.example.example}\``)
                  .join(', ') || '-',
                // Constraints
                Object.entries(settingsModelInfo?.validations[modelPropertyOption.originalName].constraints || {})
                  .map(([key, value]) => `**${key}** (${value})`)
                  .join(', ') || '**optional**',
                // Default
                this.safeValue(modelPropertyOption.default),
                // Value
                this.safeValue(
                  settingsModelInfo?.validations[modelPropertyOption.originalName].value,
                  modelPropertyOption.default
                ),
                '',
              ].join('|')
            ) || []),
        ].join('\n')
      );
      lines.push('');
    }
    return lines;
  }

  private reportOfConfigModelInfo({
    titleSharps,
    lines,
    settingsModelInfo,
    settingsModelInfoTitle,
    settingsModelInfoDescription,
  }: {
    titleSharps?: string;
    lines: string[];
    settingsModelInfo: ConfigModelInfo | undefined;
    settingsModelInfoTitle: string;
    settingsModelInfoDescription?: string;
  }) {
    if (
      this.infrastructureMarkdownReportGeneratorConfiguration.skipEmptySettings &&
      !settingsModelInfo?.modelPropertyOptions.some(
        (modelPropertyOption) =>
          settingsModelInfo?.validations[modelPropertyOption.originalName].value !== undefined &&
          settingsModelInfo?.validations[modelPropertyOption.originalName].value !== modelPropertyOption.default
      )
    ) {
      return;
    }
    if (!titleSharps) {
      titleSharps = '####';
    }
    if (settingsModelInfo) {
      lines.push(
        `${titleSharps} ${
          settingsModelInfo.modelOptions.name
            ? `${settingsModelInfoTitle}: ${settingsModelInfo.modelOptions.name}`
            : settingsModelInfoTitle
        }`
      );
      const description = settingsModelInfo.modelOptions.description || settingsModelInfoDescription || '';
      if (description !== undefined) {
        lines.push(`${description}`);
      }
      lines.push('');
      lines.push(
        [
          '| Key    | Description | Constraints | Default | Value |',
          '| ------ | ----------- | ----------- | ------- | ----- |',
          ...(settingsModelInfo?.modelPropertyOptions
            .filter(
              (modelPropertyOption) =>
                !this.infrastructureMarkdownReportGeneratorConfiguration.skipEmptySettings ||
                (this.infrastructureMarkdownReportGeneratorConfiguration.skipEmptySettings &&
                  settingsModelInfo?.validations[modelPropertyOption.originalName].value !== undefined &&
                  settingsModelInfo?.validations[modelPropertyOption.originalName].value !==
                    modelPropertyOption.default)
            )
            .map((modelPropertyOption) =>
              [
                '',
                // Key
                `\`${String(modelPropertyOption.originalName)}\``,
                // Description
                modelPropertyOption.description || '-',
                // Constraints
                Object.entries(settingsModelInfo?.validations[modelPropertyOption.originalName].constraints || {})
                  .map(([key, value]) => `**${key}** (${value})`)
                  .join(', ') || '**optional**',
                // Default
                this.safeValue(modelPropertyOption.default),
                // Value
                this.safeValue(
                  settingsModelInfo?.validations[modelPropertyOption.originalName].value,
                  modelPropertyOption.default
                ),
                '',
              ].join('|')
            ) || []),
        ].join('\n')
      );
      lines.push('');
    }
    return lines;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private safeValue(value?: any, defaultValue?: any): string {
    try {
      if (value === undefined || value === 'undefined') {
        return '-';
      }
      if (Array.isArray(value)) {
        if (value.filter((v) => Object.keys(v || {}).length > 0).length > 0) {
          return `[ ${value.map((v) => this.safeValue(v)).join(', ')} ]`;
        } else {
          return '-';
        }
      }
      if (typeof value === 'function') {
        if (!/^class\s/.test(Function.prototype.toString.call(value))) {
          return 'Function';
        } else {
          try {
            const n = Function.prototype.toString.call(value).split('class')[1].split('{')[0].trim();
            if (n !== 'Object') {
              return n;
            }
          } catch (err) {
            // null
          }
        }
      }
      if (typeof value === 'object') {
        try {
          if (value.constructor.name) {
            const n = value.constructor.name;
            if (n !== 'Object') {
              return n;
            }
          }
        } catch (error) {
          //
        }
        if (defaultValue) {
          const def = this.safeValue(defaultValue);
          const val = JSON.stringify(value);
          if (JSON.stringify(def) === val) {
            return String(defaultValue);
          }
        }
        return JSON.stringify(value);
      }
      try {
        if (value.name) {
          return value.name;
        }
      } catch (err) {
        // null
      }
      if (value === undefined || value === 'undefined') {
        return '-';
      }
      return typeof value.split === 'function' ? '```' + value.split('`').join('\\`') + '```' : '```' + value + '```';
    } catch (err) {
      return '-';
    }
  }
}
@Injectable()
export class InfrastructureMarkdownReportStorageService {
  report!: string;
}
export const { InfrastructureMarkdownReportStorage } = createNestModule({
  moduleName: 'InfrastructureMarkdownReportStorage',
  moduleDescription: 'Infrastructure markdown report storage',
  moduleCategory: NestModuleCategory.infrastructure,
  sharedProviders: [InfrastructureMarkdownReportStorageService],
});

function getInfrastructureMarkdownReportGeneratorBootstrap({
  project,
  modules,
}: Pick<WrapApplicationOptions, 'project' | 'modules'>) {
  @Injectable()
  class InfrastructureMarkdownReportGeneratorBootstrap implements OnApplicationBootstrap {
    constructor(
      private readonly dynamicNestModuleMetadataMarkdownReportGenerator: DynamicNestModuleMetadataMarkdownReportGenerator,
      private readonly infrastructureMarkdownReportStorage: InfrastructureMarkdownReportStorageService,
      private readonly infrastructureMarkdownReportGeneratorConfiguration: InfrastructureMarkdownReportGeneratorConfiguration,
      private readonly packageJsonService: PackageJsonService
    ) {}

    async onApplicationBootstrap() {
      this.infrastructureMarkdownReportStorage.report = await this.getReport();
      if (this.infrastructureMarkdownReportGeneratorConfiguration.markdownFile) {
        const fileDir = dirname(this.infrastructureMarkdownReportGeneratorConfiguration.markdownFile);
        if (!existsSync(fileDir)) {
          await mkdir(fileDir, { recursive: true });
        }
        await writeFile(
          this.infrastructureMarkdownReportGeneratorConfiguration.markdownFile,
          this.infrastructureMarkdownReportStorage.report
        );
      }
    }

    async getReport(): Promise<string> {
      const lines: string[] = [];
      const packageJson = await this.packageJsonService.read();

      try {
        if (project) {
          lines.push(`# ${project.name}`);
          if (project?.version) {
            lines.push(`> Version: ${project.version}`);
          }
          lines.push('');
          if (project.description) {
            lines.push(`${project.description}`);
          }
        }
        if (project?.repository) {
          const rep = (typeof project.repository === 'string' ? project.repository : project.repository.url).replace(
            'git+',
            ''
          );
          const projectName = basename(rep).replace('.git', '');
          lines.push(`## Installation`);
          lines.push(`\`\`\`bash
git clone ${rep}
cd ${projectName}
npm install
\`\`\``);
        }

        if (project?.devScripts) {
          lines.push(`## Running the app in watch mode`);
          lines.push(`\`\`\`bash
${project?.devScripts
  .map((s) =>
    [
      packageJson?.scriptsComments?.[s]?.length ? `# ${lowerCase(packageJson?.scriptsComments?.[s].join(' '))}` : '',
      `npm run ${s}`,
    ]
      .filter(Boolean)
      .join('\n')
  )
  .join('\n\n')}
\`\`\``);
        }

        if (project?.prodScripts) {
          lines.push(`## Running the app in production mode`);
          lines.push(`\`\`\`bash
${project?.prodScripts
  .map((s) =>
    [
      packageJson?.scriptsComments?.[s]?.length ? `# ${lowerCase(packageJson?.scriptsComments?.[s].join(' '))}` : '',
      `npm run ${s}`,
    ]
      .filter(Boolean)
      .join('\n')
  )
  .join('\n\n')}
\`\`\``);
        }

        if (project?.testsScripts) {
          lines.push(`## Test`);
          lines.push(`\`\`\`bash
${project?.testsScripts
  .map((s) =>
    [
      packageJson?.scriptsComments?.[s]?.length ? `# ${lowerCase(packageJson?.scriptsComments?.[s].join(' '))}` : '',
      `npm run ${s}`,
    ]
      .filter(Boolean)
      .join('\n')
  )
  .join('\n\n')}
\`\`\``);
        }
      } catch (err) {
        // todo: add checks
        // skip all errors
      }

      const categories = Object.keys(packageJson?.scripts || {});
      if (categories.length > 0) {
        lines.push('## All scripts');
        lines.push(`|Script|Description|`);
        lines.push(`|---|---|`);
        for (const category of categories) {
          lines.push(`|**${category}**|`);
          const keys = Object.keys(packageJson?.scripts?.[category] || {});
          for (const key of keys) {
            lines.push(`|\`npm run ${key}\`|${packageJson?.scripts?.[category]?.[key].comments.join(' ') || ''}|`);
          }
        }
      }
      for (const category of NEST_MODULE_CATEGORY_LIST) {
        const nestModules: DynamicNestModuleMetadata[] = (modules[category] || []).filter(
          (m) => m.nestModuleMetadata?.moduleCategory
        );
        if (nestModules.length > 0) {
          lines.push(`## ${NEST_MODULE_CATEGORY_TITLE[category]}`);
          if (NEST_MODULE_CATEGORY_DESCRIPTION[category]) {
            lines.push(NEST_MODULE_CATEGORY_DESCRIPTION[category]);
          }
          lines.push('');
        }
        for (const nestModule of nestModules) {
          lines.push(await this.dynamicNestModuleMetadataMarkdownReportGenerator.getReport(nestModule));
        }
      }
      if (project?.maintainers) {
        lines.push('');
        lines.push('## Maintainers');
        for (const m of project.maintainers) {
          if (typeof m === 'string') {
            lines.push(`- ${m}`);
          } else {
            lines.push(`- [${m.name}](${m.email})`);
          }
        }
      }

      if (project?.license) {
        lines.push('');
        lines.push('## License');
        lines.push(`[${project?.license}](LICENSE)`);
      }

      //lines
      return lines.join('\n');
    }
  }
  return InfrastructureMarkdownReportGeneratorBootstrap;
}

export const { InfrastructureMarkdownReportGenerator } = createNestModule({
  moduleName: 'InfrastructureMarkdownReportGenerator',
  moduleDescription: 'Infrastructure markdown report generator.',
  environmentsOptions: { skipValidation: true },
  configurationOptions: { skipValidation: true },
  staticConfigurationModel: InfrastructureMarkdownReportGeneratorConfiguration,
  sharedProviders: [DynamicNestModuleMetadataMarkdownReportGenerator],
  // we want collect report about all modules
  // for than we should place new report collector to end of infrastructure section
  preWrapApplication: async ({ project, modules, current }) => {
    if (!modules[NestModuleCategory.infrastructure]) {
      modules[NestModuleCategory.infrastructure] = [];
    }
    modules[NestModuleCategory.infrastructure]!.push(
      createNestModule({
        moduleName: 'InfrastructureMarkdownReportGenerator',
        moduleDescription: 'Infrastructure markdown report generator.',
        sharedProviders: [DynamicNestModuleMetadataMarkdownReportGenerator],
        providers: [
          getInfrastructureMarkdownReportGeneratorBootstrap({
            modules,
            project,
          }),
        ],
        imports: [
          ProjectUtils.forFeature({ featureModuleName: 'InfrastructureMarkdownReportGenerator' }),
          InfrastructureMarkdownReportStorage.forFeature({
            featureModuleName: 'InfrastructureMarkdownReportGenerator',
            contextName: current.asyncModuleOptions.contextName,
          }),
        ],
        staticConfigurationModel: InfrastructureMarkdownReportGeneratorConfiguration,
        moduleCategory: NestModuleCategory.infrastructure,
      }).InfrastructureMarkdownReportGenerator.forRootAsync(current.asyncModuleOptions)
    );
  },
});
