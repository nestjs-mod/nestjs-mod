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
    implements OnApplicationBootstrap
  {
    constructor(
      private readonly infrastructureMarkdownReportStorage: InfrastructureMarkdownReportStorage,
      private readonly infrastructureMarkdownReportGeneratorConfiguration: InfrastructureMarkdownReportGeneratorConfiguration
    ) {}

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
          if (nestModule.nestModuleMetadata?.moduleCategory) {
            lines.push(`### ${nestModule.nestModuleMetadata?.moduleName}`);
            if (nestModule.nestModuleMetadata?.moduleDescription) {
              lines.push(`${nestModule.nestModuleMetadata?.moduleDescription}`);
              lines.push('');
            }
            if (nestModule.nestModuleMetadata?.sharedProviders) {
              lines.push(
                `Shared providers: ${nestModule.nestModuleMetadata?.sharedProviders.map(
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  (s: any) => s.name
                )}`
              );
              lines.push('');
            }

            const names = Object.keys(
              nestModule.moduleInfo ?? { default: true }
            );
            for (const name of names) {
              this.reportOfEnvModelInfo({
                lines,
                settingsModelInfo: nestModule.moduleInfo?.[name].environments,
                settingsModelInfoTitle: `Environments (${name})`,
                settingsModelInfoDescription:
                  NEST_MODULES_ENVIRONMENTS_DESCRIPTION,
              });

              this.reportOfConfigModelInfo({
                lines,
                settingsModelInfo: nestModule.moduleInfo?.[name].configuration,
                settingsModelInfoTitle: `Configuration (${name})`,
                settingsModelInfoDescription:
                  NEST_MODULES_CONFIGURATION_DESCRIPTION,
              });

              this.reportOfEnvModelInfo({
                lines,
                settingsModelInfo:
                  nestModule.moduleInfo?.[name].staticEnvironments,
                settingsModelInfoTitle: `Static environments (${name})`,
                settingsModelInfoDescription:
                  NEST_MODULES_STATIC_ENVIRONMENTS_DESCRIPTION,
              });

              this.reportOfConfigModelInfo({
                lines,
                settingsModelInfo:
                  nestModule.moduleInfo?.[name].staticConfiguration,
                settingsModelInfoTitle: `Static configuration (${name})`,
                settingsModelInfoDescription:
                  NEST_MODULES_STATIC_CONFIGURATION_DESCRIPTION,
              });

              const featureConfigurations =
                nestModule.moduleInfo?.[name].featureConfigurations ?? [];
              for (
                let index = 0;
                index < featureConfigurations.length;
                index++
              ) {
                this.reportOfConfigModelInfo({
                  lines,
                  settingsModelInfo: featureConfigurations[index],
                  settingsModelInfoTitle:
                    featureConfigurations.length === 0
                      ? `Feature configuration (${name})`
                      : `Feature configuration (${name}) #${index + 1}`,
                  settingsModelInfoDescription:
                    NEST_MODULES_FEATURE_CONFIGURATION_DESCRIPTION,
                });
              }
            }
          }
        }
      }

      //lines
      return lines.join('\n');
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
      settingsModelInfoDescription: string;
    }) {
      if (settingsModelInfo) {
        lines.push(
          `#### ${
            settingsModelInfo.modelOptions.name
              ? `${settingsModelInfoTitle}: ${settingsModelInfo.modelOptions.name}`
              : settingsModelInfoTitle
          }`
        );
        lines.push(
          `${
            settingsModelInfo.modelOptions.description ??
            settingsModelInfoDescription
          }`
        );
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
                  `\`${String(modelPropertyOption.originalName)}${
                    modelPropertyOption.name
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
      settingsModelInfoDescription: string;
    }) {
      if (settingsModelInfo) {
        lines.push(
          `#### ${
            settingsModelInfo.modelOptions.name
              ? `${settingsModelInfoTitle}: ${settingsModelInfo.modelOptions.name}`
              : settingsModelInfoTitle
          }`
        );
        lines.push(
          `${
            settingsModelInfo.modelOptions.description ??
            settingsModelInfoDescription
          }`
        );
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
  return InfrastructureMarkdownReportGeneratorBootstrap;
}

export const { InfrastructureMarkdownReportGenerator } = createNestModule({
  moduleName: 'InfrastructureMarkdownReportGenerator',
  staticConfigurationModel: InfrastructureMarkdownReportGeneratorConfiguration,
  preWrapApplication: async ({ project, modules, current }) => {
    if (modules[current.category]) {
      modules[current.category]!.push(
        createNestModule({
          moduleName: 'InfrastructureMarkdownReportGenerator',
          moduleDescription: 'Infrastructure markdown report generator.',
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
