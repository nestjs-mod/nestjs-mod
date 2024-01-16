import type { Tree } from '@nx/devkit';
import { readProjectConfiguration, updateProjectConfiguration } from '@nx/devkit';
import type { NormalizedOptions } from '../schema';

export function addProject(tree: Tree, options: NormalizedOptions): void {
  const project = readProjectConfiguration(tree, options.appProjectName);
  if (project?.targets) {
    project.targets['start'] = {
      executor: 'nx:run-commands',
      options: {
        commands: [`node ${project.targets['build'].options.outputPath}/main.js`],
        parallel: false,
      },
    };
  }
  updateProjectConfiguration(tree, options.appProjectName, project);
}
