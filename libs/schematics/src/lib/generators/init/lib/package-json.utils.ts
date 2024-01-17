export const SCRIPTS_KEY_NAME = 'scripts';
export const DEFAULT_SCRIPTS_CATEGORY_NAME = 'default';

export type PackageJsonType = {
  name: string;
  description: string;
  version?: string;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  scripts?: Record<string, Record<string, string>>;
};

export class PackageJsonUtils {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  toStructure(packageJson: any): PackageJsonType {
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
  }

  toPlain(data: PackageJsonType) {
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
    return data;
  }
}
