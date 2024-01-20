import { Injectable, Logger } from '@nestjs/common';
import { config } from 'dotenv';
import { writeFile } from 'fs/promises';
import { EnvModelInfoValidationsPropertyNameFormatters } from '../../../../env-model/types';
import { defaultContextName } from '../../../../utils/default-context-name';
import { ProjectUtilsConfiguration } from '../project-utils.configuration';
import { WrapApplicationOptionsService } from './wrap-application-options.service';

@Injectable()
export class DotEnvService {
  private logger = new Logger(DotEnvService.name);

  constructor(
    private readonly wrapApplicationOptionsService: WrapApplicationOptionsService,
    private readonly projectUtilsConfiguration: ProjectUtilsConfiguration
  ) {}

  getEnvFilePath() {
    return this.projectUtilsConfiguration.envFile;
  }

  keys() {
    const modules = Object.entries(this.wrapApplicationOptionsService.modules)
      .map(([, value]) => value)
      .flat()
      .filter((m) => m.nestModuleMetadata?.moduleCategory)
      .map((m) => m.moduleSettings);

    const contextName = defaultContextName();
    const keys = [
      ...new Set(
        [
          ...modules
            .map((m) =>
              Object.keys(m?.[contextName]?.staticEnvironments?.validations ?? {})
                .filter(
                  (key) =>
                    !m?.[contextName]?.staticEnvironments?.validations[key]?.propertyValueExtractors.some(
                      (e) => e.demoMode
                    )
                )
                .map((key) =>
                  m?.[contextName]?.staticEnvironments?.validations[key]?.propertyNameFormatters
                    .filter((f: EnvModelInfoValidationsPropertyNameFormatters) => f.name === 'dotenv')
                    .map((f: EnvModelInfoValidationsPropertyNameFormatters) => f.value)
                    .flat()
                )
                .flat()
            )
            .flat(),
          ...modules
            .map((m) =>
              Object.keys(m?.[contextName]?.environments?.validations ?? {})
                .filter(
                  (key) =>
                    !m?.[contextName]?.environments?.validations[key]?.propertyValueExtractors.some((e) => e.demoMode)
                )
                .map((key) =>
                  m?.[contextName]?.environments?.validations[key]?.propertyNameFormatters
                    .filter((f: EnvModelInfoValidationsPropertyNameFormatters) => f.name === 'dotenv')
                    .map((f: EnvModelInfoValidationsPropertyNameFormatters) => f.value)
                    .flat()
                )
                .flat()
            )
            .flat(),
          ...modules
            .map((m) =>
              Object.entries(m?.[contextName]?.featureModuleEnvironments ?? {})
                .map(([, v]) =>
                  (v ?? [])
                    .map((vItem) =>
                      Object.keys(vItem?.validations ?? {})
                        .filter((key) => !vItem?.validations[key]?.propertyValueExtractors.some((e) => e.demoMode))
                        .map((key) =>
                          vItem?.validations[key]?.propertyNameFormatters
                            .filter((f: EnvModelInfoValidationsPropertyNameFormatters) => f.name === 'dotenv')
                            .map((f: EnvModelInfoValidationsPropertyNameFormatters) => f.value)
                            .flat()
                        )
                    )
                    .flat()
                    .flat()
                )
                .flat()
            )
            .flat(),
        ].filter(Boolean)
      ),
    ];
    return keys;
  }

  read(): Record<string, string | undefined> | undefined {
    const bothEnvFile = this.getEnvFilePath();
    if (!bothEnvFile) {
      return;
    }
    try {
      const neededKeys = this.keys();
      const existsEnvJson =
        (config({ path: bothEnvFile, override: true }).parsed as Record<string, string | undefined>) ?? {};
      return neededKeys.reduce((all, key) => ({ ...all, [String(key)]: existsEnvJson[key!] ?? '' }), existsEnvJson);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      this.logger.error(err, err.stack);
      return undefined;
    }
  }

  async write(data: Record<string, string | undefined>) {
    const bothEnvFile = this.getEnvFilePath();
    if (!bothEnvFile) {
      return;
    }
    try {
      const neededKeys = this.keys();
      const existsEnvJson = this.read() ?? {};
      const newEnvJson = neededKeys.reduce(
        (all, key) => ({ ...all, [String(key)]: data[key!] ?? existsEnvJson?.[key!] ?? '' }),
        existsEnvJson
      );
      await writeFile(
        bothEnvFile,
        Object.entries(newEnvJson)
          .map(([key, value]) => `${key}=${value}`)
          .join('\n')
      );
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      this.logger.error(err, err.stack);
      return;
    }
  }
}