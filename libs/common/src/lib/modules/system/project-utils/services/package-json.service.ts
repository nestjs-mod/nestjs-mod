import { Injectable } from '@nestjs/common';
import { readFile, writeFile } from 'fs/promises';
import { ProjectUtilsConfiguration } from '../project-utils.configuration';
import { DEFAULT_SCRIPTS_CATEGORY_NAME, SCRIPTS_KEY_NAME } from '../project-utils.constants';
import { PackageJsonType } from '../project-utils.types';

@Injectable()
export class PackageJsonService {
  constructor(protected readonly projectUtilsConfiguration: ProjectUtilsConfiguration) {}

  getPackageJsonFilePath() {
    return this.projectUtilsConfiguration.packageJsonFile;
  }

  async read(): Promise<PackageJsonType | undefined> {
    const bothPackageJsonFile = this.getPackageJsonFilePath();
    if (!bothPackageJsonFile) {
      return undefined;
    }
    try {
      const packageJson = JSON.parse((await readFile(bothPackageJsonFile)).toString());
      const scripts: PackageJsonType[typeof SCRIPTS_KEY_NAME] = {};
      let category: string = DEFAULT_SCRIPTS_CATEGORY_NAME;
      for (const key of Object.keys(packageJson[SCRIPTS_KEY_NAME] ?? {})) {
        if (key.startsWith('_____')) {
          category = key.split('_____')[1];
        } else {
          if (!scripts[category]) {
            scripts[category] = {};
          }
          scripts[category][key] = packageJson[SCRIPTS_KEY_NAME][key];
        }
      }
      packageJson[SCRIPTS_KEY_NAME] = scripts;
      return packageJson as PackageJsonType;
    } catch (err) {
      return undefined;
    }
  }

  async write(data: PackageJsonType) {
    const bothPackageJsonFile = this.getPackageJsonFilePath();
    if (!bothPackageJsonFile) {
      return;
    }
    const scripts: Record<string, string> = {};
    const scriptsKeys = Object.keys(data.scripts ?? {});
    for (const category of scriptsKeys) {
      const categoryName = `_____${category}_____`;
      if (!scripts[categoryName] && (scriptsKeys.length > 0 || category !== DEFAULT_SCRIPTS_CATEGORY_NAME)) {
        scripts[categoryName] = categoryName;
      }
      for (const key of Object.keys(data.scripts?.[category] ?? {})) {
        scripts[key] = data.scripts?.[category][key] ?? '';
      }
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data[SCRIPTS_KEY_NAME] = scripts as any;
    try {
      await writeFile(bothPackageJsonFile, JSON.stringify(data, null, 2));
    } catch (err) {
      //
    }
  }
}
