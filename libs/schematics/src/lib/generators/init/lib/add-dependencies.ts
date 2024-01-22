import type { GeneratorCallback, Tree } from '@nx/devkit';
import { addDependenciesToPackageJson } from '@nx/devkit';
import { nestJsModDeps, nestJsModDevDeps, nestJsSchematicsVersion } from '../../../utils/versions';

export function addDependencies(tree: Tree): GeneratorCallback {
  const nestJsModSchematicsVersion = '2.0.7';
  return addDependenciesToPackageJson(
    tree,
    {
      ...nestJsModDeps,
      '@nestjs/terminus': '^10.2.0',
      'case-anything': '^2.1.13',
      'class-validator': '^0.14.0',
      'nestjs-pino': '^4.0.0',
      'pino-http': '^9.0.0',
      'pino-pretty': '^10.3.1',
      pm2: '^5.3.0',
      dotenv: '>=16.3.1',
    },
    {
      ...nestJsModDevDeps,
      '@nestjs-mod/schematics': nestJsModSchematicsVersion,
      '@commitlint/cli': '^17.0.0',
      '@commitlint/config-conventional': '^17.0.0',
      '@theunderscorer/nx-semantic-release': '^2.10.0',
      '@nestjs/schematics': nestJsSchematicsVersion,
      rucken: '^4.6.4',
      prettier: '^2.6.2',
      'lint-staged': '^15.2.0',
    }
  );
}
