import { Injectable, Logger } from '@nestjs/common';
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
              Object.keys(m?.[contextName]?.staticEnvironments?.validations || {})
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
              Object.keys(m?.[contextName]?.environments?.validations || {})
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
              Object.entries(m?.[contextName]?.featureModuleEnvironments || {})
                .map(([, v]) =>
                  (v || [])
                    .map((vItem) =>
                      Object.keys(vItem?.validations || {})
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

  async readFile(
    envFile: string,
    updateProcessEnv: boolean = true
  ): Promise<Record<string, string | undefined> | undefined> {
    return new Promise((resolve) =>
      process.nextTick(() => {
        try {
          const virtualEnv = {};
          const loadedEnvJson =
            (config({ path: envFile, processEnv: virtualEnv }).parsed as Record<string, string | undefined>) || {};

          if (updateProcessEnv) {
            for (const [key, value] of Object.entries(loadedEnvJson)) {
              if (process.env[key] === undefined && value !== undefined) {
                process.env[key] = value;
              }
            }
          }
          resolve(loadedEnvJson);
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
          this.logger.error(err, err.stack);
          resolve(undefined);
        }
      })
    );
  }

  async writeFile(envFile: string, data: Record<string, string | undefined>) {
    try {
      const envContent = Object.entries(data)
        .map(([key, value]) => `${key}=${value}`)
        .join('\n');
      await writeFile(envFile, envContent);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      this.logger.error(err, err.stack);
      return;
    }
  }

  async read(updateProcessEnv: boolean = true): Promise<Record<string, string | undefined> | undefined> {
    const envFile = this.getEnvFilePath();
    if (!envFile) {
      return;
    }
    try {
      const neededKeys = this.keys();
      const existsEnvJson = (await this.readFile(envFile, false)) || {};
      const neededEnvs = neededKeys.reduce(
        (all, key) => ({ ...all, [String(key)]: existsEnvJson[key!] || '' }),
        existsEnvJson
      );
      if (updateProcessEnv) {
        for (const [key, value] of Object.entries(neededEnvs)) {
          if (process.env[key] === undefined && value !== undefined) {
            process.env[key] = value;
          }
        }
      }
      return neededEnvs;
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

    try {
      const neededKeys = this.keys();
      const existsEnvJson = (await this.readFile(envFile, false)) || {};
      const newEnvJson = neededKeys.reduce(
        (all, key) => ({ ...all, [String(key)]: data[key!] || existsEnvJson?.[key!] || '' }),
        existsEnvJson
      );
      await this.writeFile(envFile, newEnvJson);

      const envExampleFile = envFile.replace('.env', '-example.env').replace('/-example.env', '/example.env');
      if (existsSync(envExampleFile)) {
        const existsExampleEnvJson = (await this.readFile(envExampleFile, false)) || {};
        const newEnvJson = neededKeys.reduce(
          (all, key) => ({ ...all, [String(key)]: existsExampleEnvJson?.[key!] || `value_for_${key}` }),
          existsExampleEnvJson
        );
        await this.writeFile(envExampleFile, newEnvJson);
      } else {
        const newEnvJson = neededKeys.reduce((all, key) => ({ ...all, [String(key)]: `value_for_${key}` }), {});
        await this.writeFile(envExampleFile, newEnvJson);
      }

      await this.gitignoreService.addGitIgnoreEntry([basename(envFile)]);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      this.logger.error(err, err.stack);
      return;
    }
  }
}
