import { Injectable, Logger } from '@nestjs/common';
import { snakeCase } from 'case-anything';
import { config } from 'dotenv';
import { existsSync } from 'fs';
import { writeFile } from 'fs/promises';
import { basename } from 'path';
import { EnvModelInfoValidationsPropertyNameFormatters } from '../../../../env-model/types';
import { defaultContextName } from '../../../../utils/default-context-name';
import { ProjectUtilsConfiguration } from '../project-utils.configuration';
import { GitignoreService } from './gitignore-file';
import { WrapApplicationOptionsService } from './wrap-application-options.service';

@Injectable()
export class DotEnvService {
  private logger = new Logger(DotEnvService.name);

  constructor(
    private readonly wrapApplicationOptionsService: WrapApplicationOptionsService,
    private readonly projectUtilsConfiguration: ProjectUtilsConfiguration,
    private readonly gitignoreService: GitignoreService
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
    const envFile = this.getEnvFilePath();
    if (!envFile) {
      return;
    }
    try {
      const neededKeys = this.keys();
      const existsEnvJson =
        (config({ path: envFile, override: true }).parsed as Record<string, string | undefined>) ?? {};
      return neededKeys.reduce((all, key) => ({ ...all, [String(key)]: existsEnvJson[key!] ?? '' }), existsEnvJson);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      this.logger.error(err, err.stack);
      return undefined;
    }
  }

  async write(data: Record<string, string | undefined>) {
    const envFile = this.getEnvFilePath();
    if (!envFile) {
      return;
    }
    const envExampleFile = envFile.replace('.env', '-example.env').replace('/-example.env', '/example.env');

    try {
      const neededKeys = this.keys();
      const existsEnvJson = this.read() ?? {};
      const newEnvJson = neededKeys.reduce(
        (all, key) => ({ ...all, [String(key)]: data[key!] ?? existsEnvJson?.[key!] ?? '' }),
        existsEnvJson
      );

      const envContent = Object.entries(newEnvJson)
        .map(([key, value]) => `${key}=${value}`)
        .join('\n');
      await writeFile(envFile, envContent);

      if (existsSync(envExampleFile)) {
        const exampleProcessEnv = {};
        const existsExampleEnvJson =
          (config({ path: envExampleFile, processEnv: exampleProcessEnv }).parsed as Record<
            string,
            string | undefined
          >) ?? {};

        const envContentExample = Object.entries(newEnvJson)
          .map(([key]) => `${key}=${snakeCase(existsExampleEnvJson[key] ?? `value_for_${key}`)}`)
          .join('\n');
        await writeFile(envExampleFile, envContentExample);
      } else {
        const envContentExample = Object.entries(newEnvJson)
          .map(([key]) => `${key}=${snakeCase(`value_for_${key}`)}`)
          .join('\n');
        await writeFile(envExampleFile, envContentExample);
      }

      await this.gitignoreService.addGitIgnoreEntry([basename(envFile)]);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      this.logger.error(err, err.stack);
      return;
    }
  }
}
