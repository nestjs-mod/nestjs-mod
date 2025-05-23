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

const rootFolder = join(__dirname, '..', '..', '..');

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
          mode: 'silent',
        },
      }),
    ],
    infrastructure: [
      NestjsModAllReadmeGenerator.forRoot({
        contextName: 'common',
        staticConfiguration: {
          telegramGroup: 'https://t.me/nestjs_mod',
          discord: 'https://discord.gg/meY7UXaG',
          packageFile: join(rootFolder, 'libs/microservices/package.json'),
          markdownFile: join(rootFolder, 'libs/microservices/README.md'),
          folderWithMarkdownFilesToUse: join(rootFolder, 'libs/microservices'),
          utilsFolders: [join(rootFolder, 'libs/microservices/src/lib')],
          modules: [import('@nestjs-mod/microservices')],
          markdownFooter: NESTJS_MOD_ALL_README_GENERATOR_FOOTER,
        },
      }),
      NestjsModAllReadmeGenerator.forRoot({
        contextName: 'common',
        staticConfiguration: {
          telegramGroup: 'https://t.me/nestjs_mod',
          discord: 'https://discord.gg/meY7UXaG',
          packageFile: join(rootFolder, 'libs/common/package.json'),
          markdownFile: join(rootFolder, 'libs/common/README.md'),
          folderWithMarkdownFilesToUse: join(rootFolder, 'libs/common'),
          utilsFolders: [join(rootFolder, 'libs/common/src/lib')],
          modules: [import('@nestjs-mod/common')],
          markdownFooter: NESTJS_MOD_ALL_README_GENERATOR_FOOTER,
        },
      }),
      NestjsModAllReadmeGenerator.forRoot({
        contextName: 'reports',
        staticConfiguration: {
          telegramGroup: 'https://t.me/nestjs_mod',
          discord: 'https://discord.gg/meY7UXaG',
          packageFile: join(rootFolder, 'libs/reports/package.json'),
          markdownFile: join(rootFolder, 'libs/reports/README.md'),
          folderWithMarkdownFilesToUse: join(rootFolder, 'libs/reports'),
          utilsFolders: [join(rootFolder, 'libs/reports/src/lib')],
          modules: [import('@nestjs-mod/reports')],
          markdownFooter: NESTJS_MOD_ALL_README_GENERATOR_FOOTER,
        },
      }),
      NestjsModAllReadmeGenerator.forRoot({
        contextName: 'testing',
        staticConfiguration: {
          telegramGroup: 'https://t.me/nestjs_mod',
          discord: 'https://discord.gg/meY7UXaG',
          packageFile: join(rootFolder, 'libs/testing/package.json'),
          markdownFile: join(rootFolder, 'libs/testing/README.md'),
          folderWithMarkdownFilesToUse: join(rootFolder, 'libs/testing'),
          utilsFolders: [join(rootFolder, 'libs/testing/src/lib')],
          modules: [import('@nestjs-mod/testing')],
          markdownFooter: NESTJS_MOD_ALL_README_GENERATOR_FOOTER,
        },
      }),
      NestjsModAllReadmeGenerator.forRoot({
        contextName: 'fastify',
        staticConfiguration: {
          telegramGroup: 'https://t.me/nestjs_mod',
          discord: 'https://discord.gg/meY7UXaG',
          packageFile: join(rootFolder, 'libs/fastify/package.json'),
          markdownFile: join(rootFolder, 'libs/fastify/README.md'),
          folderWithMarkdownFilesToUse: join(rootFolder, 'libs/fastify'),
          utilsFolders: [join(rootFolder, 'libs/fastify/src/lib')],
          modules: [import('@nestjs-mod/fastify')],
          markdownFooter: NESTJS_MOD_ALL_README_GENERATOR_FOOTER,
        },
      }),
      NestjsModAllReadmeGenerator.forRoot({
        contextName: 'misc',
        staticConfiguration: {
          telegramGroup: 'https://t.me/nestjs_mod',
          discord: 'https://discord.gg/meY7UXaG',
          packageFile: join(rootFolder, 'libs/misc/package.json'),
          markdownFile: join(rootFolder, 'libs/misc/README.md'),
          folderWithMarkdownFilesToUse: join(rootFolder, 'libs/misc'),
          utilsFolders: [join(rootFolder, 'libs/misc/src/lib')],
          modules: [import('@nestjs-mod/misc')],
          markdownFooter: NESTJS_MOD_ALL_README_GENERATOR_FOOTER,
        },
      }),
    ],
  },
});
