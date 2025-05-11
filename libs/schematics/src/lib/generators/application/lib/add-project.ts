import type { Tree } from '@nx/devkit';
import { readProjectConfiguration, updateProjectConfiguration } from '@nx/devkit';
import type { NormalizedOptions } from '../schema';

export function addProject(tree: Tree, options: NormalizedOptions): void {
  const project = readProjectConfiguration(tree, options.appProjectName);
  const distFile = project.targets?.['build']?.options.outputPath
    ? `${project.targets['build']?.options.outputPath}/main.js`
    : `dist/apps/${options.appProjectName}/main.js`;
  if (project?.targets) {
    project.targets['start'] = {
      executor: 'nx:run-commands',
      options: {
        commands: [`node ${distFile}`],
        parallel: false,
      },
    };
  }
  updateProjectConfiguration(tree, options.appProjectName, project);
}
