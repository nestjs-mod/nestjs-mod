/* eslint-disable @nx/enforce-module-boundaries */

import {
  DefaultNestApplicationInitializer,
  DefaultNestApplicationListener,
  ProjectUtils,
  bootstrapNestApplication,
  isInfrastructureMode,
} from '@nestjs-mod/common';
import { NESTJS_MOD_ALL_README_GENERATOR_FOOTER, NestjsModAllReadmeGenerator } from '@nestjs-mod/reports';
import { join } from 'path';

bootstrapNestApplication({
  globalEnvironmentsOptions: { skipValidation: isInfrastructureMode() },
  globalConfigurationOptions: { skipValidation: isInfrastructureMode() },
  project: {
    name: 'nestjs-mod',
    description: 'A command line interface (CLI) for create and manipulation with NestJS-mod application',
  },
  modules: {
    system: [
      ProjectUtils.forRoot({
        staticConfiguration: { updateProjectOptions: false },
      }),
      DefaultNestApplicationInitializer.forRoot(),
      DefaultNestApplicationListener.forRoot({
        staticConfiguration: {
          mode: 'init',
        },
      }),
    ],
    infrastructure: [
      NestjsModAllReadmeGenerator.forRoot({
        contextName: 'common',
        staticConfiguration: {
          telegramGroup: 'https://t.me/nestjs_mod',
          packageFile: join(__dirname, '..', '..', '..', 'libs/common/package.json'),
          markdownFile: join(__dirname, '..', '..', '..', 'libs/common/README.md'),
          folderWithMarkdownFilesToUse: join(__dirname, '..', '..', '..', 'libs/common'),
          utilsFolders: [join(__dirname, '..', '..', '..', 'libs/common/src/lib')],
          modules: [import('@nestjs-mod/common')],
          markdownFooter: NESTJS_MOD_ALL_README_GENERATOR_FOOTER,
        },
      }),
      NestjsModAllReadmeGenerator.forRoot({
        contextName: 'reports',
        staticConfiguration: {
          telegramGroup: 'https://t.me/nestjs_mod',
          packageFile: join(__dirname, '..', '..', '..', 'libs/reports/package.json'),
          markdownFile: join(__dirname, '..', '..', '..', 'libs/reports/README.md'),
          folderWithMarkdownFilesToUse: join(__dirname, '..', '..', '..', 'libs/reports'),
          utilsFolders: [join(__dirname, '..', '..', '..', 'libs/reports/src/lib')],
          modules: [import('@nestjs-mod/reports')],
          markdownFooter: NESTJS_MOD_ALL_README_GENERATOR_FOOTER,
        },
      }),
      NestjsModAllReadmeGenerator.forRoot({
        contextName: 'testing',
        staticConfiguration: {
          telegramGroup: 'https://t.me/nestjs_mod',
          packageFile: join(__dirname, '..', '..', '..', 'libs/testing/package.json'),
          markdownFile: join(__dirname, '..', '..', '..', 'libs/testing/README.md'),
          folderWithMarkdownFilesToUse: join(__dirname, '..', '..', '..', 'libs/testing'),
          utilsFolders: [join(__dirname, '..', '..', '..', 'libs/testing/src/lib')],
          modules: [import('@nestjs-mod/testing')],
          markdownFooter: NESTJS_MOD_ALL_README_GENERATOR_FOOTER,
        },
      }),
    ],
  },
});
