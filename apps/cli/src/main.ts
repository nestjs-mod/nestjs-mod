/* eslint-disable @nx/enforce-module-boundaries */

import {
  DefaultNestApplicationInitializer,
  DefaultNestApplicationListener,
  InfrastructureMarkdownReportGenerator,
  bootstrapNestApplication,
} from '@nestjs-mod/common';
import { NestjsModAllReadmeGenerator } from '@nestjs-mod/reports';
import { join } from 'path';

bootstrapNestApplication({
  globalConfigurationOptions: {
    skipValidation: true,
  },
  globalEnvironmentsOptions: {
    skipValidation: true,
  },
  project: {
    name: 'nestjs-mod',
    description: 'A command line interface (CLI) for create and manipulation with NestJS-mod application',
  },
  modules: {
    system: [
      DefaultNestApplicationInitializer.forRoot(),
      DefaultNestApplicationListener.forRoot({
        staticConfiguration: {
          mode: 'init',
        },
      }),
    ],
    infrastructure: [
      InfrastructureMarkdownReportGenerator.forRoot({
        contextName: 'cli',
        staticConfiguration: {
          markdownFile: join(__dirname, '..', '..', '..', 'apps', 'cli', 'INFRASTRUCTURE.MD'),
          skipEmptySettings: false,
        },
      }),
      NestjsModAllReadmeGenerator.forRoot({
        contextName: 'common',
        staticConfiguration: {
          telegramGroup: 'https://t.me/nestjs_mod',
          packageFile: join(__dirname, '..', '..', '..', 'libs/common/package.json'),
          markdownFile: join(__dirname, '..', '..', '..', 'libs/common/README.md'),
          utilsFolders: [join(__dirname, '..', '..', '..', 'libs/common/src/lib')],
          modules: [import('@nestjs-mod/common')],
        },
      }),
      NestjsModAllReadmeGenerator.forRoot({
        contextName: 'reports',
        staticConfiguration: {
          telegramGroup: 'https://t.me/nestjs_mod',
          packageFile: join(__dirname, '..', '..', '..', 'libs/reports/package.json'),
          markdownFile: join(__dirname, '..', '..', '..', 'libs/reports/README.md'),
          utilsFolders: [join(__dirname, '..', '..', '..', 'libs/reports/src/lib')],
          modules: [import('@nestjs-mod/reports')],
        },
      }),
      NestjsModAllReadmeGenerator.forRoot({
        contextName: 'testing',
        staticConfiguration: {
          telegramGroup: 'https://t.me/nestjs_mod',
          packageFile: join(__dirname, '..', '..', '..', 'libs/testing/package.json'),
          markdownFile: join(__dirname, '..', '..', '..', 'libs/testing/README.md'),
          utilsFolders: [join(__dirname, '..', '..', '..', 'libs/testing/src/lib')],
          modules: [import('@nestjs-mod/testing')],
        },
      }),
    ],
  },
});
