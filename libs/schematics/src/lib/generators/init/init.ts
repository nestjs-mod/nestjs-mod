import type { GeneratorCallback, Tree } from '@nx/devkit';
import { formatFiles } from '@nx/devkit';

import { addDependencies } from './lib/add-dependencies';
import type { InitGeneratorOptions } from './schema';

export async function initGenerator(tree: Tree, options: InitGeneratorOptions): Promise<GeneratorCallback> {
  let installPackagesTask: GeneratorCallback = () => {};
  if (!options.skipPackageJson) {
    installPackagesTask = addDependencies(tree);
  }

  if (!options.skipFormat) {
    await formatFiles(tree);
  }

  return installPackagesTask;
}

export default initGenerator;
