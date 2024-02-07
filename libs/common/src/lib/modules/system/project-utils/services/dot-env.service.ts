import { Injectable, Logger } from '@nestjs/common';
import { config } from 'dotenv';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { basename, dirname } from 'path';
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
      .filter((m) => m.getNestModuleMetadata?.()?.moduleCategory)
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

  readFile(envFile: string, updateProcessEnv: boolean = true): Record<string, string | undefined> | undefined {
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
    return loadedEnvJson;
  }

  writeFile(envFile: string, data: Record<string, string | undefined>) {
    try {
      const envContent = Object.entries(data)
        .map(([key, value]) => `${key}=${value}`)
        .join('\n');
      if (!envFile) {
        return;
      }
      const fileDir = dirname(envFile);
      if (!existsSync(fileDir)) {
        mkdirSync(fileDir, { recursive: true });
      }
      writeFileSync(envFile, envContent);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      this.logger.error(err, err.stack);
      return;
    }
  }

  read(
    updateProcessEnv: boolean = true,
    ignoreCheckNeededKeys: boolean = false
  ): Record<string, string | undefined> | undefined {
    const envFile = this.getEnvFilePath();
    if (!envFile) {
      return;
    }
    try {
      const neededKeys = this.keys();
      const existsEnvJson = this.readFile(envFile, false) || {};
      const neededEnvs = {
        ...(ignoreCheckNeededKeys ? existsEnvJson : {}),
        ...neededKeys.reduce((all, key) => ({ ...all, [String(key)]: existsEnvJson[key!] || '' }), existsEnvJson),
      };
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

  write(data: Record<string, string | undefined>, ignoreCheckNeededKeys: boolean = false) {
    const envFile = this.getEnvFilePath();
    if (!envFile) {
      return;
    }

    try {
      const neededKeys = this.keys();
      const existsEnvJson = this.readFile(envFile, false) || {};
      const newEnvJson = {
        ...(ignoreCheckNeededKeys ? data : {}),
        ...neededKeys.reduce(
          (all, key) => ({ ...all, [String(key)]: data[key!] || existsEnvJson?.[key!] || '' }),
          existsEnvJson
        ),
      };
      this.writeFile(envFile, newEnvJson);

      const envExampleFile = envFile.replace('.env', '-example.env').replace('/-example.env', '/example.env');
      if (existsSync(envExampleFile)) {
        const existsExampleEnvJson = this.readFile(envExampleFile, false) || {};
        const newEnvJson = [...neededKeys, ...(ignoreCheckNeededKeys ? Object.keys(data) : [])].reduce(
          (all, key) => ({ ...all, [String(key)]: existsExampleEnvJson?.[key!] || `value_for_${key}` }),
          existsExampleEnvJson
        );
        this.writeFile(envExampleFile, newEnvJson);
      } else {
        const newEnvJson = [...neededKeys, ...(ignoreCheckNeededKeys ? Object.keys(data) : [])].reduce(
          (all, key) => ({ ...all, [String(key)]: `value_for_${key}` }),
          {}
        );
        this.writeFile(envExampleFile, newEnvJson);
      }

      this.gitignoreService.addGitIgnoreEntry([basename(envFile)]);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      this.logger.error(err, err.stack);
      return;
    }
  }
}
