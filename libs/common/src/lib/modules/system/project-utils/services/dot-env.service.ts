import { Injectable, Logger } from '@nestjs/common';
import { createHash } from 'crypto';
import { config } from 'dotenv';
import fg from 'fast-glob';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { basename, dirname, join } from 'path';
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

  keys(includeHiddenKeys = false) {
    const modules = Object.entries(this.wrapApplicationOptionsService.modules || {})
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
                    .filter(
                      (f: EnvModelInfoValidationsPropertyNameFormatters) =>
                        (!f.value ||
                          includeHiddenKeys ||
                          (!includeHiddenKeys &&
                            !m?.[contextName]?.staticEnvironments?.modelPropertyOptions.find(
                              (p) => (p.originalName === key || p.name) && p.hidden
                            ))) &&
                        f.name === 'dotenv'
                    )
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
                    .filter(
                      (f: EnvModelInfoValidationsPropertyNameFormatters) =>
                        (!f.value ||
                          includeHiddenKeys ||
                          (!includeHiddenKeys &&
                            !m?.[contextName]?.environments?.modelPropertyOptions.find(
                              (p) => (p.originalName === key || p.name) && p.hidden
                            ))) &&
                        f.name === 'dotenv'
                    )
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
                            .filter(
                              (f: EnvModelInfoValidationsPropertyNameFormatters) =>
                                (!f.value ||
                                  includeHiddenKeys ||
                                  (!includeHiddenKeys &&
                                    !vItem?.modelPropertyOptions.find(
                                      (p) => (p.originalName === key || p.name) && p.hidden
                                    ))) &&
                                f.name === 'dotenv'
                            )
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
        .map(([key, value]) => {
          if (key.trim().startsWith('#')) {
            return `${key}${value ? value : ''}`;
          }
          if (value !== undefined && value !== null && !isNaN(+value)) {
            return `${key}=${value}`;
          }
          if (value && (value.includes('*') || value.includes('!') || value.includes('$') || value.includes(' '))) {
            if (value.includes("'")) {
              return `${key}='${value.split("'").join("\\'")}'`;
            }
            return `${key}='${value}'`;
          }
          return `${key}=${value}`;
        })
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

  async getEnvironmentsFromFilesCheckSum() {
    const processed: Record<string, { fileList: string[]; sha256: string }> = {};
    for (const [name, rule] of Object.entries(this.projectUtilsConfiguration.filesCheckSumToEnvironments || {})) {
      const folders = rule.folders.map((folder) => join(folder, rule.glob));

      const fileList = await fg(folders, { dot: true });
      const filesContent = fileList.map((filePath) => {
        const fileContent = rule.prepare
          ? rule.prepare(readFileSync(filePath).toString())
          : readFileSync(filePath).toString();
        return {
          filePath,
          fileContent: fileContent.split(' ').join('').split('\n').join().split('\r').join().split('\t').join(),
        };
      });
      processed[name] = {
        fileList: filesContent.map((fileContent) => fileContent.filePath).sort(),
        sha256: createHash('sha256')
          .update(JSON.stringify(filesContent.map((c) => c.fileContent)))
          .digest('hex'),
      };
    }
    if (this.projectUtilsConfiguration.prepareProcessedFilesCheckSumToEnvironments) {
      return { processed: this.projectUtilsConfiguration.prepareProcessedFilesCheckSumToEnvironments(processed) };
    }
    return { processed };
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

  async write(data: Record<string, string | undefined>, ignoreCheckNeededKeys: boolean = false) {
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
      const checksumEnvs = await this.getEnvironmentsFromFilesCheckSum();
      const checksumKeys = Object.keys(checksumEnvs.processed);
      if (checksumKeys.length > 0) {
        for (const key of checksumKeys) {
          delete newEnvJson[key];
        }
        delete newEnvJson['# file checksums'];
        newEnvJson['# file checksums'] = '';
        for (const key of checksumKeys) {
          delete newEnvJson[key];
          newEnvJson[key] = checksumEnvs.processed[key].sha256;
        }
        if (this.projectUtilsConfiguration.debugFilesCheckSumToEnvironments) {
          writeFileSync(envFile + '.checksum.json', JSON.stringify(checksumEnvs.processed, null, 4));
        }
      }
      this.writeFile(envFile, newEnvJson);

      const envExampleFile = envFile.replace('.env', '-example.env').replace('/-example.env', '/example.env');
      if (existsSync(envExampleFile)) {
        const existsExampleEnvJson = this.readFile(envExampleFile, false) || {};
        const newEnvJson = [...neededKeys, ...(ignoreCheckNeededKeys ? Object.keys(data) : [])].reduce(
          (all, key) => ({
            ...all,
            [String(key)]: existsExampleEnvJson?.[key!] || (key?.trim().startsWith('#') ? '' : `value_for_${key}`),
          }),
          existsExampleEnvJson
        );
        if (checksumKeys.length > 0) {
          for (const key of checksumKeys) {
            delete newEnvJson[key];
          }
          delete newEnvJson['# file checksums'];
          newEnvJson['# file checksums'] = '';
          for (const key of checksumKeys) {
            delete newEnvJson[key];
            newEnvJson[key] = checksumEnvs.processed[key].sha256;
          }
        }
        this.writeFile(envExampleFile, newEnvJson);
      } else {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const newEnvJson: any = [...neededKeys, ...(ignoreCheckNeededKeys ? Object.keys(data) : [])].reduce(
          (all, key) => ({ ...all, [String(key)]: key?.trim().startsWith('#') ? '' : `value_for_${key}` }),
          {}
        );
        if (checksumKeys.length > 0) {
          for (const key of checksumKeys) {
            delete newEnvJson[key];
          }
          delete newEnvJson['# file checksums'];
          newEnvJson['# file checksums'] = '';
          for (const key of checksumKeys) {
            delete newEnvJson[key];
            newEnvJson[key] = checksumEnvs.processed[key].sha256;
          }
        }
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
