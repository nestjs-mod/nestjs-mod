import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { writeFile } from 'fs/promises';
import {
  ConfigModel,
  ConfigModelProperty,
} from '../../../config-model/decorators';
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
import {
  DynamicNestModuleMetadata,
  NestModuleCategory,
  WrapApplicationOptions,
} from '../../../nest-module/types';
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
        nestModulesStaticEnvironmentsDescription:
          NEST_MODULES_STATIC_ENVIRONMENTS_DESCRIPTION,
        nestModulesConfigurationDescription:
          NEST_MODULES_CONFIGURATION_DESCRIPTION,
        nestModulesStaticConfigurationDescription:
          NEST_MODULES_STATIC_CONFIGURATION_DESCRIPTION,
        nestModulesFeatureConfigurationDescription:
          NEST_MODULES_FEATURE_CONFIGURATION_DESCRIPTION,
      }
  ) {
    const lines: string[] = [];
    if (dynamicNestModuleMetadata.nestModuleMetadata?.moduleCategory) {
      lines.push(
        `### ${dynamicNestModuleMetadata.nestModuleMetadata?.moduleName}`
      );
      if (dynamicNestModuleMetadata.nestModuleMetadata?.moduleDescription) {
        lines.push(
          `${dynamicNestModuleMetadata.nestModuleMetadata?.moduleDescription}`
        );
        lines.push('');
      }
      const sharedProviders =
        dynamicNestModuleMetadata.nestModuleMetadata?.sharedProviders ?? [];
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

      const names = Object.keys(
        dynamicNestModuleMetadata.moduleInfo ?? { default: true }
      );
      for (const name of names) {
        this.reportOfEnvModelInfo({
          lines,
          settingsModelInfo:
            dynamicNestModuleMetadata.moduleInfo?.[name].environments,
          settingsModelInfoTitle: this.appendName(
            'Environments',
            names.length > 1 ? name : undefined
          ),
          settingsModelInfoDescription:
            options.nestModulesEnvironmentsDescription,
        });

        this.reportOfConfigModelInfo({
          lines,
          settingsModelInfo:
            dynamicNestModuleMetadata.moduleInfo?.[name].configuration,
          settingsModelInfoTitle: this.appendName(
            'Configuration',
            names.length > 1 ? name : undefined
          ),
          settingsModelInfoDescription:
            options.nestModulesConfigurationDescription,
        });

        this.reportOfEnvModelInfo({
          lines,
          settingsModelInfo:
            dynamicNestModuleMetadata.moduleInfo?.[name].staticEnvironments,
          settingsModelInfoTitle: this.appendName(
            'Static environments',
            names.length > 1 ? name : undefined
          ),
          settingsModelInfoDescription:
            options.nestModulesStaticEnvironmentsDescription,
        });

        this.reportOfConfigModelInfo({
          lines,
          settingsModelInfo:
            dynamicNestModuleMetadata.moduleInfo?.[name].staticConfiguration,
          settingsModelInfoTitle: this.appendName(
            'Static configuration',
            names.length > 1 ? name : undefined
          ),
          settingsModelInfoDescription:
            options.nestModulesStaticConfigurationDescription,
        });

        const featureConfigurations =
          dynamicNestModuleMetadata.moduleInfo?.[name].featureConfigurations ??
          [];
        for (let index = 0; index < featureConfigurations.length; index++) {
          this.reportOfConfigModelInfo({
            lines,
            settingsModelInfo: featureConfigurations[index],
            settingsModelInfoTitle:
              featureConfigurations.length === 0
                ? this.appendName(
                  'Feature configuration',
                  names.length > 1 ? name : undefined
                )
                : `${this.appendName(
                  'Feature configuration',
                  names.length > 1 ? name : undefined
                )} #${index + 1}`,
            settingsModelInfoDescription:
              options.nestModulesFeatureConfigurationDescription,
          });
        }
      }
    }
    return lines.join('\n');
  }

  appendName(title: string, name?: string) {
    if (name) {
      return `${title}(${name})`;
    }
    return title;
  }

  private reportOfEnvModelInfo({
    lines,
    settingsModelInfo,
    settingsModelInfoTitle,
    settingsModelInfoDescription,
  }: {
    lines: string[];
    settingsModelInfo: EnvModelInfo | undefined;
    settingsModelInfoTitle: string;
    settingsModelInfoDescription?: string;
  }) {
    if (settingsModelInfo) {
      lines.push(
        `#### ${settingsModelInfo.modelOptions.name
          ? `${settingsModelInfoTitle}: ${settingsModelInfo.modelOptions.name}`
          : settingsModelInfoTitle
        }`
      );
      const description =
        settingsModelInfo.modelOptions.description ??
        settingsModelInfoDescription ??
        '';
      if (description) {
        lines.push(`${description}`);
      }
      lines.push('');
      lines.push(
        [
          '| Key    | Description | Source | Constraints | Value |',
          '| ------ | ----------- | ------ | ----------- | ----- |',
          ...(settingsModelInfo?.modelPropertyOptions.map(
            (modelPropertyOption) =>
              [
                '',
                // Key
                `\`${String(modelPropertyOption.originalName)}${modelPropertyOption.name
                  ? ` (${modelPropertyOption.name})`
                  : ''
                }\``,
                // Description
                modelPropertyOption.description ?? '-',
                // Source
                settingsModelInfo?.validations[
                  modelPropertyOption.originalName
                ].propertyValueExtractors
                  .map(
                    (propertyValueExtractor) =>
                      `\`${propertyValueExtractor.example.example}\``
                  )
                  .join(', ') || '-',
                // Constraints
                Object.entries(
                  settingsModelInfo?.validations[
                    modelPropertyOption.originalName
                  ].constraints || {}
                )
                  .map(([key, value]) => `**${key}** (${value})`)
                  .join(', ') || '**optional**',
                // Value
                this.safeValue(
                  settingsModelInfo?.validations[
                    modelPropertyOption.originalName
                  ].value
                ),
                '',
              ].join('|')
          ) ?? []),
        ].join('\n')
      );
      lines.push('');
    }
  }

  private reportOfConfigModelInfo({
    lines,
    settingsModelInfo,
    settingsModelInfoTitle,
    settingsModelInfoDescription,
  }: {
    lines: string[];
    settingsModelInfo: ConfigModelInfo | undefined;
    settingsModelInfoTitle: string;
    settingsModelInfoDescription?: string;
  }) {
    if (settingsModelInfo) {
      lines.push(
        `#### ${settingsModelInfo.modelOptions.name
          ? `${settingsModelInfoTitle}: ${settingsModelInfo.modelOptions.name}`
          : settingsModelInfoTitle
        }`
      );
      const description =
        settingsModelInfo.modelOptions.description ??
        settingsModelInfoDescription ??
        '';
      if (description) {
        lines.push(`${description}`);
      }
      lines.push('');
      lines.push(
        [
          '| Key    | Description | Constraints | Value |',
          '| ------ | ----------- | ----------- | ----- |',
          ...(settingsModelInfo?.modelPropertyOptions.map(
            (modelPropertyOption) =>
              [
                '',
                // Key
                `\`${String(modelPropertyOption.originalName)}\``,
                // Description
                modelPropertyOption.description ?? '-',
                // Constraints
                Object.entries(
                  settingsModelInfo?.validations[
                    modelPropertyOption.originalName
                  ].constraints || {}
                )
                  .map(([key, value]) => `**${key}** (${value})`)
                  .join(', ') || '**optional**',
                // Value
                this.safeValue(
                  settingsModelInfo?.validations[
                    modelPropertyOption.originalName
                  ].value
                ),
                '',
              ].join('|')
          ) ?? []),
        ].join('\n')
      );
      lines.push('');
    }
  }

  private safeValue(value?: string) {
    if (!value) {
      return '-';
    }
    if (typeof value === 'object') {
      return JSON.stringify(value);
    }
    if (typeof value === 'function') {
      return 'Function';
    }
    return typeof value.split === 'function'
      ? '```' + value.split('`').join('\\`') + '```'
      : '```' + value + '```';
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
    description:
      'Name of the markdown-file in which to save the infrastructure report',
  })
  markdownFile?: string;
}

function getInfrastructureMarkdownReportGeneratorBootstrap({
  project,
  modules,
}: Pick<WrapApplicationOptions, 'project' | 'modules'>) {
  @Injectable()
  class InfrastructureMarkdownReportGeneratorBootstrap
    implements OnApplicationBootstrap {
    constructor(
      private readonly dynamicNestModuleMetadataMarkdownReportGenerator:
        DynamicNestModuleMetadataMarkdownReportGenerator,
      private readonly infrastructureMarkdownReportStorage:
        InfrastructureMarkdownReportStorage,
      private readonly infrastructureMarkdownReportGeneratorConfiguration:
        InfrastructureMarkdownReportGeneratorConfiguration
    ) { }

    async onApplicationBootstrap() {
      this.infrastructureMarkdownReportStorage.report = await this.getReport();
      if (
        this.infrastructureMarkdownReportGeneratorConfiguration.markdownFile
      ) {
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
        const nestModules: DynamicNestModuleMetadata[] =
          modules[category as NestModuleCategory] ?? [];
        if (nestModules.length > 0) {
          lines.push(
            `## ${NEST_MODULE_CATEGORY_TITLE[category as NestModuleCategory]}`
          );
          if (
            NEST_MODULE_CATEGORY_DESCRIPTION[category as NestModuleCategory]
          ) {
            lines.push(
              NEST_MODULE_CATEGORY_DESCRIPTION[category as NestModuleCategory]
            );
          }
          lines.push('');
        }
        for (const nestModule of nestModules) {
          lines.push(
            await this.dynamicNestModuleMetadataMarkdownReportGenerator.getReport(
              nestModule
            )
          );
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
          staticConfigurationModel:
            InfrastructureMarkdownReportGeneratorConfiguration,
          moduleCategory: NestModuleCategory.infrastructure,
        }).InfrastructureMarkdownReportGenerator.forRootAsync({
          ...current.asyncModuleOptions,
        })
      );
    }
  },
});
