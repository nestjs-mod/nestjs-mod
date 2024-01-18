import type { GeneratorCallback, Tree } from '@nx/devkit';
import { addDependenciesToPackageJson } from '@nx/devkit';
import { nestJsModVersion, nestJsSchematicsVersion } from '../../../utils/versions';

export function addDependencies(tree: Tree): GeneratorCallback {
  return addDependenciesToPackageJson(
    tree,
    {
      '@nestjs-mod/common': nestJsModVersion,
      '@nestjs-mod/reports': nestJsModVersion,
      '@nestjs/terminus': '^10.2.0',
      '@nestjs-mod/terminus': '>=1.2.2',
      '@nestjs-mod/pino': '>=1.3.2',
      '@nestjs-mod/pm2': '>=1.1.2',
      'case-anything': '^2.1.13',
      'class-validator': '^0.14.0',
      'nestjs-pino': '^4.0.0',
      'pino-http': '^9.0.0',
      'pino-pretty': '^10.3.1',
      pm2: '^5.3.0',
      dotenv: '>=16.3.1',
    },
    {
      "@commitlint/cli": "^17.0.0",
      "@commitlint/config-conventional": "^17.0.0",
      '@theunderscorer/nx-semantic-release': '^2.10.0',
      '@nestjs-mod/schematics': '>=1.0.1',
      '@nestjs/schematics': nestJsSchematicsVersion,
      '@nestjs-mod/testing': nestJsModVersion,
      "rucken": "^4.6.4",
      "prettier": "^2.6.2",
      "lint-staged": "^15.2.0",
    }
  );
}
