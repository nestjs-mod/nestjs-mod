import type { Tree } from '@nx/devkit';
import { readProjectConfiguration, updateJson } from '@nx/devkit';
import type { NormalizedOptions } from '../schema';

export function updateTsConfigLib(tree: Tree, options: NormalizedOptions): void {
  const project = readProjectConfiguration(tree, options.projectName);

  return updateJson(tree, `${project.root}/tsconfig.lib.json`, (json) => {
    json.compilerOptions.target = options.target;

    json.compilerOptions.skipLibCheck = true;
    json.compilerOptions.skipDefaultLibCheck = true;
    json.compilerOptions.allowJs = true;
    json.compilerOptions.allowSyntheticDefaultImports = true;
    json.compilerOptions.noImplicitOverride = true;
    json.compilerOptions.noImplicitReturns = true;
    json.compilerOptions.esModuleInterop = true;

    if (options.strict) {
      json.compilerOptions = {
        ...json.compilerOptions,
        strictNullChecks: true,
        noImplicitAny: true,
        strictBindCallApply: true,
        strictPropertyInitialization: true,
        forceConsistentCasingInFileNames: true,
        noFallthroughCasesInSwitch: true,
      };
    }

    return json;
  });
}
