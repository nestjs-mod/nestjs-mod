export const SCRIPTS_KEY_NAME = 'scripts';
export const SCRIPTS_COMMENTS_KEY_NAME = 'scriptsComments';
export const DEFAULT_SCRIPTS_CATEGORY_NAME = 'utils';

export type ProjectOptions = {
  name: string;
  description: string;
  version?: string;
  license?: string;
  repository?:
    | {
        type: string;
        url: string;
      }
    | string;
  maintainers?: [
    {
      name: string;
      email: string;
    }
  ];
  devScripts?: string[];
  prodScripts?: string[];
  dockerDevScripts?: string[];
  dockerProdScripts?: string[];
  k8sDevScripts?: string[];
  k8sProdScripts?: string[];
  testsScripts?: string[];
  frontendDevScripts?: string[];
  frontendProdScripts?: string[];
};

export type PackageJsonScriptType = { commands: string[]; comments: string[] };
export type PackageJsonCategoryType = Record<string, PackageJsonScriptType>;

export type PackageJsonType = ProjectOptions & {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  dependenciesInfo?: Record<string, { docs: true }>;
  devDependenciesInfo?: Record<string, { docs: true }>;
  [SCRIPTS_KEY_NAME]?: Record<string, PackageJsonCategoryType>;
  [SCRIPTS_COMMENTS_KEY_NAME]?: Record<string, string[]>;
};

export type BasicPackageJsonType = ProjectOptions & {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  dependenciesInfo?: Record<string, { docs: true }>;
  devDependenciesInfo?: Record<string, { docs: true }>;
  [SCRIPTS_KEY_NAME]?: Record<string, string>;
  [SCRIPTS_COMMENTS_KEY_NAME]?: Record<string, string[]>;
};

export class PackageJsonUtils {
  addScripts(category: string, commands: PackageJsonCategoryType, structuredJson: PackageJsonType) {
    if (!structuredJson[SCRIPTS_KEY_NAME]) {
      structuredJson[SCRIPTS_KEY_NAME] = {};
    }
    if (!structuredJson[SCRIPTS_KEY_NAME][category]) {
      structuredJson[SCRIPTS_KEY_NAME][category] = {};
    }
    for (const commandName of Object.keys(commands)) {
      if (!structuredJson[SCRIPTS_KEY_NAME][category][commandName]) {
        structuredJson[SCRIPTS_KEY_NAME][category][commandName] = { commands: [], comments: [] };
      }
      if (structuredJson[SCRIPTS_KEY_NAME][category][commandName].commands.length === 0) {
        structuredJson[SCRIPTS_KEY_NAME][category][commandName].commands = commands[commandName].commands;
      }
      if (structuredJson[SCRIPTS_KEY_NAME][category][commandName].comments.length === 0) {
        structuredJson[SCRIPTS_KEY_NAME][category][commandName].comments = commands[commandName].comments;
      }
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  toStructure(basicJson: BasicPackageJsonType): PackageJsonType {
    let categoryIsExists = false;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const def: PackageJsonCategoryType = {};
    for (const keyD of Object.keys(basicJson[SCRIPTS_KEY_NAME] || {})) {
      if (!keyD.startsWith('_____') && !categoryIsExists) {
        def[keyD] = {
          commands: basicJson[SCRIPTS_KEY_NAME]?.[keyD].split('&&').map((s) => s.trim()) || [],
          comments: basicJson[SCRIPTS_COMMENTS_KEY_NAME]?.[keyD] || [],
        };
        delete basicJson[SCRIPTS_KEY_NAME]?.[keyD];
      } else {
        categoryIsExists = true;
      }
    }

    const structuredJson = { ...basicJson } as PackageJsonType;

    const scripts: PackageJsonType[typeof SCRIPTS_KEY_NAME] = {};

    let category: string = DEFAULT_SCRIPTS_CATEGORY_NAME;

    if (!categoryIsExists) {
      scripts[category] = def;
    }

    for (const key of Object.keys(basicJson[SCRIPTS_KEY_NAME] || {})) {
      if (key.startsWith('_____')) {
        category = key?.split('_____')[1];
      } else {
        if (!scripts[category]) {
          scripts[category] = {};
        }
        if (!scripts[category][key]) {
          scripts[category][key] = {
            commands: [],
            comments: [],
          };
        }
        scripts[category][key].commands = basicJson[SCRIPTS_KEY_NAME]?.[key]?.split(' && ') || [];
        scripts[category][key].comments = basicJson[SCRIPTS_COMMENTS_KEY_NAME]?.[key] || [];
      }
    }

    const { utils, ...other } = scripts;
    structuredJson[SCRIPTS_KEY_NAME] = {
      ...Object.entries(other)
        .sort((a, b) => {
          let posA = 100,
            posB = 100;
          if (a[0].includes('dev')) {
            posA = 1;
          }
          if (b[0].includes('dev')) {
            posB = 1;
          }
          if (a[0].includes('prod')) {
            posA = 2;
          }
          if (b[0].includes('prod')) {
            posB = 2;
          }
          if (a[0].includes('doc')) {
            posA = 3;
          }
          if (b[0].includes('doc')) {
            posB = 3;
          }
          if (a[0].includes('test')) {
            posA = 4;
          }
          if (b[0].includes('test')) {
            posB = 4;
          }
          if (a[0].includes('lint')) {
            posA = 5;
          }
          if (b[0].includes('lint')) {
            posB = 5;
          }
          return posA - posB;
        })
        .reduce((all, [key, value]) => ({ ...all, [key]: value }), {}),
      utils: utils || {},
    };
    const categories = Object.keys(structuredJson[SCRIPTS_KEY_NAME] || {});
    for (const category of categories) {
      if (Object.keys(structuredJson[SCRIPTS_KEY_NAME]?.[category] || {}).length === 0) {
        if (structuredJson[SCRIPTS_KEY_NAME]?.[category]) {
          delete structuredJson[SCRIPTS_KEY_NAME]?.[category];
        }
      }
    }

    if (Object.keys(structuredJson[SCRIPTS_KEY_NAME]?.[DEFAULT_SCRIPTS_CATEGORY_NAME] || {}).length === 0) {
      if (structuredJson[SCRIPTS_KEY_NAME]?.[DEFAULT_SCRIPTS_CATEGORY_NAME]) {
        delete structuredJson[SCRIPTS_KEY_NAME]?.[DEFAULT_SCRIPTS_CATEGORY_NAME];
      }
    }
    if (Object.keys(structuredJson[SCRIPTS_KEY_NAME] || {}).length === 0) {
      if (structuredJson[SCRIPTS_KEY_NAME]) {
        delete structuredJson[SCRIPTS_KEY_NAME];
      }
    }
    if (Object.keys(structuredJson[SCRIPTS_COMMENTS_KEY_NAME] || {}).length === 0) {
      if (structuredJson[SCRIPTS_COMMENTS_KEY_NAME]) {
        delete structuredJson[SCRIPTS_COMMENTS_KEY_NAME];
      }
    }
    return structuredJson;
  }

  toPlain(basicJson: BasicPackageJsonType, structuredJson: PackageJsonType) {
    const categories = Object.keys(structuredJson[SCRIPTS_KEY_NAME] || {});
    basicJson[SCRIPTS_KEY_NAME] = {};
    basicJson[SCRIPTS_COMMENTS_KEY_NAME] = {};
    for (const category of categories) {
      const categoryName = `_____${category}_____`;
      if (!basicJson[SCRIPTS_KEY_NAME][categoryName]) {
        basicJson[SCRIPTS_KEY_NAME][categoryName] = categoryName;
      }
      for (const key of Object.keys(structuredJson[SCRIPTS_KEY_NAME]?.[category] || {})) {
        basicJson[SCRIPTS_KEY_NAME][key] =
          structuredJson[SCRIPTS_KEY_NAME]?.[category][key].commands.join(' && ') || '';
        basicJson[SCRIPTS_COMMENTS_KEY_NAME][key] = structuredJson[SCRIPTS_KEY_NAME]?.[category][key].comments || [];
      }
    }
    return basicJson;
  }
}
