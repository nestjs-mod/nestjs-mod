import { Injectable } from '@nestjs/common';
import { config } from 'dotenv';
import { writeFile } from 'fs/promises';
import { EnvModelInfoValidationsPropertyNameFormatters } from '../../../../env-model/types';
import { defaultContextName } from '../../../../utils/default-context-name';
import { ProjectUtilsConfiguration } from '../project-utils.configuration';
import { WrapApplicationOptionsService } from './wrap-application-options.service';

@Injectable()
export class DotEnvService {
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

    const keys = [
      ...new Set(
        [
          ...modules
            .map((module) =>
              Object.keys(module?.[defaultContextName()]?.staticEnvironments?.validations ?? {})
                .map((key) =>
                  module?.[defaultContextName()]?.staticEnvironments?.validations[key]?.propertyNameFormatters
                    .filter((f: EnvModelInfoValidationsPropertyNameFormatters) => f.name === 'dotenv')
                    .map((f: EnvModelInfoValidationsPropertyNameFormatters) => f.value)
                    .flat()
                )
                .flat()
            )
            .flat(),
          ...modules
            .map((module) =>
              Object.keys(module?.[defaultContextName()]?.environments?.validations ?? {})
                .map((key) =>
                  module?.[defaultContextName()]?.environments?.validations[key]?.propertyNameFormatters
                    .filter((f: EnvModelInfoValidationsPropertyNameFormatters) => f.name === 'dotenv')
                    .map((f: EnvModelInfoValidationsPropertyNameFormatters) => f.value)
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

  async read(): Promise<Record<string, string | undefined> | undefined> {
    const bothEnvFile = this.getEnvFilePath();
    if (!bothEnvFile) {
      return;
    }
    try {
      const neededKeys = this.keys();
      const existsEnvJson = (config({ path: bothEnvFile }).parsed as Record<string, string | undefined>) ?? {};
      return neededKeys.reduce((all, key) => ({ ...all, [String(key)]: existsEnvJson[key!] ?? '' }), existsEnvJson);
    } catch (err) {
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
      const existsEnvJson = (await this.read()) ?? {};
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
    } catch (err) {
      return;
    }
  }
}
