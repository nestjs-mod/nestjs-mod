import type { GeneratorCallback, Tree } from '@nx/devkit';
import { formatFiles } from '@nx/devkit';
import { libraryGenerator as jsLibraryGenerator } from '@nx/js';
import { addDependencies } from '../init/lib/add-dependencies';
import { addExportsToBarrelFile } from './lib/add-exports-to-barrel';
import { addProjectLib } from './lib/add-project';
import { createFilesLib } from './lib/create-files';
import { deleteFiles } from './lib/delete-files';
import { normalizeOptionsLib, toJsLibraryGeneratorOptions } from './lib/normalize-options';
import { updateTsConfigLib } from './lib/update-tsconfig';
import type { LibraryGeneratorOptions } from './schema';

export async function libraryGenerator(tree: Tree, rawOptions: LibraryGeneratorOptions): Promise<GeneratorCallback> {
  return await libraryGeneratorInternal(tree, {
    projectNameAndRootFormat: 'derived',
    ...rawOptions,
  });
}

export async function libraryGeneratorInternal(
  tree: Tree,
  rawOptions: LibraryGeneratorOptions
): Promise<GeneratorCallback> {
  const options = await normalizeOptionsLib(tree, rawOptions);
  await jsLibraryGenerator(tree, toJsLibraryGeneratorOptions(options));
  const installDepsTask = addDependencies(tree);
  deleteFiles(tree, options);
  createFilesLib(tree, options);
  addExportsToBarrelFile(tree, options);
  updateTsConfigLib(tree, options);
  addProjectLib(tree, options);

  if (!options.skipFormat) {
    await formatFiles(tree);
  }

  return installDepsTask;
}

export default libraryGenerator;
