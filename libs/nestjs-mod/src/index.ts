import { Command } from 'commander';
import { migrator } from './commands/migrator';
import { version } from './commands/version';
import { getPackageJson } from './utils/get-package-json';

const program = new Command();
const packageJson = getPackageJson();

migrator(program);
version(program, packageJson);

program.parse(process.argv);

if (!program.args.length) {
  program.help();
}
