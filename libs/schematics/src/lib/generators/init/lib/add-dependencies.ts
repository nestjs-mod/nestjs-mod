import type { GeneratorCallback, Tree } from '@nx/devkit';
import { addDependenciesToPackageJson } from '@nx/devkit';
import { nestJsModDeps, nestJsModDevDeps, nestJsSchematicsVersion } from '../../../utils/versions';

export function addDependencies(tree: Tree): GeneratorCallback {
  const nestJsModSchematicsVersion = '2.9.4';
  return addDependenciesToPackageJson(
    tree,
    {
      ...nestJsModDeps,
      '@nestjs/terminus': '^10.2.3',
      'case-anything': '^2.1.13',
      'class-validator': '^0.14.0',
      'nestjs-pino': '^4.1.0',
      'pino-http': '^10.2.0',
      'pino-pretty': '^11.2.2',
      pm2: '^5.3.0',
      dotenv: '>=16.3.1',
      // https://github.com/webpack-contrib/mini-css-extract-plugin/issues/875
      ajv: '^8.17.1',
    },
    {
      ...nestJsModDevDeps,
      '@nestjs-mod/schematics': nestJsModSchematicsVersion,
      '@commitlint/cli': '^17.0.0',
      '@commitlint/config-conventional': '^17.0.0',
      '@theunderscorer/nx-semantic-release': '^2.11.0',
      '@nestjs/schematics': nestJsSchematicsVersion,
      rucken: '^4.8.1',
      prettier: '^2.6.2',
      'lint-staged': '^15.2.0',
    }
  );
}
