import type { Tree } from '@nx/devkit';
import { generateFiles, joinPathFragments } from '@nx/devkit';

export function createFilesInit(tree: Tree): void {
  generateFiles(tree, joinPathFragments(__dirname, '..', 'files'), joinPathFragments('.'), {
    tmpl: '',
  });
}
