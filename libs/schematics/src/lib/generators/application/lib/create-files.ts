import type { Tree } from '@nx/devkit';
import { generateFiles, joinPathFragments, readProjectConfiguration } from '@nx/devkit';
import type { NormalizedOptions } from '../schema';

export function createFiles(tree: Tree, options: NormalizedOptions): void {
  const project = readProjectConfiguration(tree, options.appProjectName);
  const sourceRootArr = project.sourceRoot?.split('/') ?? [];
  generateFiles(tree, joinPathFragments(__dirname, '..', 'files'), joinPathFragments(options.appProjectRoot, 'src'), {
    tmpl: '',
    name: options.appProjectName,
    root: options.appProjectRoot,
    pathToRoot: sourceRootArr.map(() => `'..'`).join(', '),
    pathToApp: [
      ...sourceRootArr.map(() => `'..'`),
      `'${sourceRootArr.slice(0, sourceRootArr.length - 1).join('/')}'`,
    ].join(', '),
    distFile: `'${
      project.targets
        ? `${project.targets['build'].options.outputPath}/main.js`
        : `dist/apps/${options.appProjectName}/main.js`
    }'`,
  });
}
