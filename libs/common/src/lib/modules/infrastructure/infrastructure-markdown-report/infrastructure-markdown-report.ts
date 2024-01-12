import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { writeFile } from 'fs/promises';
import { ConfigModel, ConfigModelProperty } from '../../../config-model/decorators';
import { ConfigModelInfo } from '../../../config-model/types';
import { EnvModelInfo } from '../../../env-model/types';
import {
  NEST_MODULES_CONFIGURATION_DESCRIPTION,
  NEST_MODULES_ENVIRONMENTS_DESCRIPTION,
  NEST_MODULES_FEATURE_CONFIGURATION_DESCRIPTION,
  NEST_MODULES_STATIC_CONFIGURATION_DESCRIPTION,
  NEST_MODULES_STATIC_ENVIRONMENTS_DESCRIPTION,
  NEST_MODULE_CATEGORY_DESCRIPTION,
  NEST_MODULE_CATEGORY_TITLE,
} from '../../../nest-module/constants';
import { DynamicNestModuleMetadata, NestModuleCategory, WrapApplicationOptions } from '../../../nest-module/types';
import { createNestModule } from '../../../nest-module/utils';

@Injectable()
export class DynamicNestModuleMetadataMarkdownReportGenerator {
  async getReport(
    dynamicNestModuleMetadata: DynamicNestModuleMetadata,
    options: {
      nestModulesEnvironmentsDescription?: string;
      nestModulesStaticEnvironmentsDescription?: string;
      nestModulesConfigurationDescription?: string;
      nestModulesStaticConfigurationDescription?: string;
      nestModulesFeatureConfigurationDescription?: string;
    } = {
      nestModulesEnvironmentsDescription: NEST_MODULES_ENVIRONMENTS_DESCRIPTION,
      nestModulesStaticEnvironmentsDescription: NEST_MODULES_STATIC_ENVIRONMENTS_DESCRIPTION,
      nestModulesConfigurationDescription: NEST_MODULES_CONFIGURATION_DESCRIPTION,
      nestModulesStaticConfigurationDescription: NEST_MODULES_STATIC_CONFIGURATION_DESCRIPTION,
      nestModulesFeatureConfigurationDescription: NEST_MODULES_FEATURE_CONFIGURATION_DESCRIPTION,
    }
  ) {
    const lines: string[] = [];
    if (dynamicNestModuleMetadata.nestModuleMetadata?.moduleCategory) {
      lines.push(`### ${dynamicNestModuleMetadata.nestModuleMetadata?.moduleName}`);
      if (dynamicNestModuleMetadata.nestModuleMetadata?.moduleDescription) {
        lines.push(`${dynamicNestModuleMetadata.nestModuleMetadata?.moduleDescription}`);
        lines.push('');
      }
      const sharedProviders = dynamicNestModuleMetadata.nestModuleMetadata?.sharedProviders ?? [];
      if (sharedProviders?.length > 0) {
        lines.push('#### Shared providers');
        lines.push(
          sharedProviders
            .map(
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              (s: any) => `\`${s.name}\``
            )
            .join(', ')
        );
        lines.push('');
      }

      const sharedImports = dynamicNestModuleMetadata.nestModuleMetadata?.sharedImports ?? [];
      if (Array.isArray(sharedImports) && sharedImports?.length > 0) {
        lines.push('#### Shared imports');
        lines.push(
          sharedImports
            .map(
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              (s: any) => `\`${s.nestModuleMetadata?.moduleName ?? s.name}\``
            )
            .join(', ')
        );
        lines.push('');
      }

      const names = Object.keys(dynamicNestModuleMetadata.moduleSettings ?? { default: true });
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

        const featureModuleNames = Object.keys(
          dynamicNestModuleMetadata.moduleSettings?.[name].featureModuleConfigurations ?? {}
        );
        let titleAppended = false;
        if (featureModuleNames.length > 0) {
          for (const featureModuleName of featureModuleNames) {
            const featureConfigurations =
              dynamicNestModuleMetadata.moduleSettings?.[name]?.featureModuleConfigurations?.[featureModuleName] ?? [];
            for (const featureConfiguration of featureConfigurations) {
              if (!titleAppended) {
                lines.push('#### Modules that use feature configuration');
                titleAppended = true;
              }
              this.reportOfConfigModelInfo({
                titleSharps: '#####',
                lines,
                settingsModelInfo: featureConfiguration,
                settingsModelInfoTitle: `Module name: ${featureModuleName}`,
              });
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
      const description = settingsModelInfo.modelOptions.description ?? settingsModelInfoDescription ?? '';
      if (description !== undefined) {
        lines.push(`${description}`);
      }
      lines.push('');
      lines.push(
        [
          '| Key    | Description | Sources | Constraints | Default | Value |',
          '| ------ | ----------- | ------- | ----------- | ------- | ----- |',
          ...(settingsModelInfo?.modelPropertyOptions.map((modelPropertyOption) =>
            [
              '',
              // Key
              `\`${String(modelPropertyOption.originalName)}${
                modelPropertyOption.name ? ` (${modelPropertyOption.name})` : ''
              }\``,
              // Description
              modelPropertyOption.description ?? '-',
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
              this.safeValue(settingsModelInfo?.validations[modelPropertyOption.originalName].value),
              '',
            ].join('|')
          ) ?? []),
        ].join('\n')
      );
      lines.push('');
    }
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
      const description = settingsModelInfo.modelOptions.description ?? settingsModelInfoDescription ?? '';
      if (description !== undefined) {
        lines.push(`${description}`);
      }
      lines.push('');
      lines.push(
        [
          '| Key    | Description | Constraints | Default | Value |',
          '| ------ | ----------- | ----------- | ------- | ----- |',
          ...(settingsModelInfo?.modelPropertyOptions.map((modelPropertyOption) =>
            [
              '',
              // Key
              `\`${String(modelPropertyOption.originalName)}\``,
              // Description
              modelPropertyOption.description ?? '-',
              // Constraints
              Object.entries(settingsModelInfo?.validations[modelPropertyOption.originalName].constraints || {})
                .map(([key, value]) => `**${key}** (${value})`)
                .join(', ') || '**optional**',
              // Default
              this.safeValue(modelPropertyOption.default),
              // Value
              this.safeValue(settingsModelInfo?.validations[modelPropertyOption.originalName].value),
              '',
            ].join('|')
          ) ?? []),
        ].join('\n')
      );
      lines.push('');
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private safeValue(value?: any): string {
    try {
      if (!value) {
        return '-';
      }
      if (Array.isArray(value)) {
        if (value.filter((v) => Object.keys(v).length > 0).length > 0) {
          return `[ ${value.map((v) => this.safeValue(v)).join(', ')} ]`;
        } else {
          return '-';
        }
      }
      if (typeof value === 'object') {
        return JSON.stringify(value);
      }
      if (typeof value === 'function' && !/^class\s/.test(Function.prototype.toString.call(value))) {
        return 'Function';
      }
      try {
        if (value.name) {
          return value.name;
        }
      } catch (err) {
        // null
      }
      return typeof value.split === 'function' ? '```' + value.split('`').join('\\`') + '```' : '```' + value + '```';
    } catch (err) {
      return '-';
    }
  }
}
@Injectable()
export class InfrastructureMarkdownReportStorage {
  report!: string;
}
export const { InfrastructureMarkdownReport } = createNestModule({
  moduleName: 'InfrastructureMarkdownReport',
  moduleDescription: 'Infrastructure markdown report',
  moduleCategory: NestModuleCategory.core,
  sharedProviders: [InfrastructureMarkdownReportStorage],
});

@ConfigModel()
export class InfrastructureMarkdownReportGeneratorConfiguration {
  @ConfigModelProperty({
    description: 'Name of the markdown-file in which to save the infrastructure report',
  })
  markdownFile?: string;
}

function getInfrastructureMarkdownReportGeneratorBootstrap({
  project,
  modules,
}: Pick<WrapApplicationOptions, 'project' | 'modules'>) {
  @Injectable()
  class InfrastructureMarkdownReportGeneratorBootstrap implements OnApplicationBootstrap {
    constructor(
      private readonly dynamicNestModuleMetadataMarkdownReportGenerator: DynamicNestModuleMetadataMarkdownReportGenerator,
      private readonly infrastructureMarkdownReportStorage: InfrastructureMarkdownReportStorage,
      private readonly infrastructureMarkdownReportGeneratorConfiguration: InfrastructureMarkdownReportGeneratorConfiguration
    ) {}

    async onApplicationBootstrap() {
      this.infrastructureMarkdownReportStorage.report = await this.getReport();
      if (this.infrastructureMarkdownReportGeneratorConfiguration.markdownFile) {
        await writeFile(
          this.infrastructureMarkdownReportGeneratorConfiguration.markdownFile,
          this.infrastructureMarkdownReportStorage.report
        );
      }
    }

    async getReport(): Promise<string> {
      const lines: string[] = [];
      lines.push(`# ${project.name}`);
      lines.push('');
      if (project.description) {
        lines.push(`${project.description}`);
      }
      for (const category of Object.keys(modules)) {
        const nestModules: DynamicNestModuleMetadata[] = modules[category as NestModuleCategory] ?? [];
        if (nestModules.length > 0) {
          lines.push(`## ${NEST_MODULE_CATEGORY_TITLE[category as NestModuleCategory]}`);
          if (NEST_MODULE_CATEGORY_DESCRIPTION[category as NestModuleCategory]) {
            lines.push(NEST_MODULE_CATEGORY_DESCRIPTION[category as NestModuleCategory]);
          }
          lines.push('');
        }
        for (const nestModule of nestModules) {
          lines.push(await this.dynamicNestModuleMetadataMarkdownReportGenerator.getReport(nestModule));
        }
      }

      //lines
      return lines.join('\n');
    }
  }
  return InfrastructureMarkdownReportGeneratorBootstrap;
}

export const { InfrastructureMarkdownReportGenerator } = createNestModule({
  moduleName: 'InfrastructureMarkdownReportGenerator',
  staticConfigurationModel: InfrastructureMarkdownReportGeneratorConfiguration,
  sharedProviders: [DynamicNestModuleMetadataMarkdownReportGenerator],
  preWrapApplication: async ({ project, modules, current }) => {
    if (modules[current.category]) {
      modules[current.category]!.push(
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
          imports: [InfrastructureMarkdownReport.forFeature()],
          staticConfigurationModel: InfrastructureMarkdownReportGeneratorConfiguration,
          moduleCategory: NestModuleCategory.infrastructure,
        }).InfrastructureMarkdownReportGenerator.forRootAsync(current.asyncModuleOptions)
      );
    }
  },
});
