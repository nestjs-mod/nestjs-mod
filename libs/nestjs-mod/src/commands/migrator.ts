import { Command } from 'commander';

export function migrator(program: Command) {
  program
    .command('migrator')
    .description(
      'There is no functionality now, this name is reserved for future command utilities of the NestJS-mod project.'
    )
    .action(async () => {
      console.error(
        `There is no functionality now, this name is reserved for future command utilities of the NestJS-mod project.`
      );
    });
}
