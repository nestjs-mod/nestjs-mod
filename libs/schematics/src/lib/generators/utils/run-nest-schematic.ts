import type { Tree } from '@nx/devkit';
import { formatFiles } from '@nx/devkit';
import type { NestSchematic, NormalizedOptions } from './types';

export async function runNestSchematic(
  tree: Tree,
  schematic: NestSchematic,
  options: NormalizedOptions
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<any> {
  const { skipFormat, ...schematicOptions } = options;

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { wrapAngularDevkitSchematic } = require('@nx/devkit/ngcli-adapter');
  const nestSchematic = wrapAngularDevkitSchematic('@nestjs/schematics', schematic);
  const result = await nestSchematic(tree, schematicOptions);

  if (!skipFormat) {
    await formatFiles(tree);
  }

  return result;
}
