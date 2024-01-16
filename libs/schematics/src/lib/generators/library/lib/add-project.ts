import type { Tree } from '@nx/devkit';
import { readProjectConfiguration, updateProjectConfiguration } from '@nx/devkit';
import type { NormalizedOptions } from '../schema';

export function addProjectLib(tree: Tree, options: NormalizedOptions): void {
  if (!options.publishable && !options.buildable) {
    return;
  }

  const project = readProjectConfiguration(tree, options.projectName);
  if (project?.targets) {
    project.targets['build'] = {
      executor: '@nx/js:tsc',
      outputs: ['{options.outputPath}'],
      options: {
        outputPath: `dist/${options.projectRoot}`,
        tsConfig: `${options.projectRoot}/tsconfig.lib.json`,
        packageJson: `${options.projectRoot}/package.json`,
        main: `${options.projectRoot}/src/index.ts`,
        assets: [`${options.projectRoot}/*.md`],
      },
    };
    project.targets['semantic-release'] = {
      executor: '@theunderscorer/nx-semantic-release:semantic-release',
      options: {
        buildTarget: '${PROJECT_NAME}:build',
        outputPath: `dist/${options.projectRoot}`,
      },
    };
  }
  updateProjectConfiguration(tree, options.projectName, project);
}
