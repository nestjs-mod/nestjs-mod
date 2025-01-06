import { Command } from 'commander';
import { PackageJson } from '../types/package-json';

export function version(program: Command, packageJson: PackageJson) {
  program
    .name('nestjs-mod')
    .description('Command utilities of the NestJS-mod project')
    .version(packageJson['version'], '-v, --version');
}
