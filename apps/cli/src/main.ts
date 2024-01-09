/* eslint-disable @nx/enforce-module-boundaries */

import {
  DefaultNestApplicationInitializer,
  DefaultNestApplicationListener,
  bootstrapNestApplication,
} from '@nestjs-mod/common';
import { NestjsModAllReadmeGenerator } from '@nestjs-mod/reports';
import { join } from 'path';

bootstrapNestApplication({
  project: {
    name: 'nestjs-mod',
    description:
      'A command line interface (CLI) for create and manipulation with NestJS-mod application',
  },
  modules: {
    system: [
      DefaultNestApplicationInitializer.forRoot(),
      DefaultNestApplicationListener.forRoot({
        staticEnvironments: { port: 3000 },
        staticConfiguration: { mode: 'init' },
      }),
    ],
    infrastructure: [
      NestjsModAllReadmeGenerator.forRoot({
        contextName: 'common',
        configuration: {
          telegramGroup: 'https://t.me/nestjs_mod',
          packageFile: join(
            __dirname,
            '..',
            '..',
            '..',
            'libs/common/package.json'
          ),
          markdownFile: join(
            __dirname,
            '..',
            '..',
            '..',
            'libs/common/README.md'
          ),
          utilsFolders: [
            join(__dirname, '..', '..', '..', 'libs/common/src/lib'),
          ],
          modules: [import('@nestjs-mod/common')],
        },
      }),
      NestjsModAllReadmeGenerator.forRoot({
        contextName: 'reports',
        configuration: {
          telegramGroup: 'https://t.me/nestjs_mod',
          packageFile: join(
            __dirname,
            '..',
            '..',
            '..',
            'libs/reports/package.json'
          ),
          markdownFile: join(
            __dirname,
            '..',
            '..',
            '..',
            'libs/reports/README.md'
          ),
          utilsFolders: [
            join(__dirname, '..', '..', '..', 'libs/reports/src/lib'),
          ],
          modules: [import('@nestjs-mod/reports')],
        },
      }),
      NestjsModAllReadmeGenerator.forRoot({
        contextName: 'testing',
        configuration: {
          telegramGroup: 'https://t.me/nestjs_mod',
          packageFile: join(
            __dirname,
            '..',
            '..',
            '..',
            'libs/testing/package.json'
          ),
          markdownFile: join(
            __dirname,
            '..',
            '..',
            '..',
            'libs/testing/README.md'
          ),
          utilsFolders: [
            join(__dirname, '..', '..', '..', 'libs/testing/src/lib'),
          ],
          modules: [import('@nestjs-mod/testing')],
        },
      }),
    ],
  },
});
