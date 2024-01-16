import type { Tree } from '@nx/devkit';
import { joinPathFragments, updateJson } from '@nx/devkit';
import type { NormalizedOptions } from '../schema';

export function updateTsConfig(tree: Tree, options: NormalizedOptions): void {
  updateJson(tree, joinPathFragments(options.appProjectRoot, 'tsconfig.app.json'), (json) => {
    json.compilerOptions.emitDecoratorMetadata = true;

    json.compilerOptions.skipLibCheck = true;
    json.compilerOptions.skipDefaultLibCheck = true;
    json.compilerOptions.allowJs = true;
    json.compilerOptions.allowSyntheticDefaultImports = true;
    json.compilerOptions.noImplicitOverride = true;
    json.compilerOptions.strictPropertyInitialization = true;
    json.compilerOptions.noImplicitReturns = true;
    json.compilerOptions.esModuleInterop = true;

    json.compilerOptions.target = 'es2021';
    if (options.strict) {
      json.compilerOptions = {
        ...json.compilerOptions,
        strictNullChecks: true,
        noImplicitAny: true,
        strictBindCallApply: true,
        forceConsistentCasingInFileNames: true,
        noFallthroughCasesInSwitch: true,
      };
    }
    return json;
  });
}
