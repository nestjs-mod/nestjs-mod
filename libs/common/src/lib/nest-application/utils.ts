import { INestApplication } from '@nestjs/common';
import {
  NestModuleCategory,
  WrapApplicationOptions,
} from '../nest-module/types';
import { getWrapModuleMetadataMethods } from '../nest-module/utils';
import { NestApplicationError } from './errors';
import { BootstrapNestApplicationOptions } from './types';

export async function bootstrapNestApplicationWithOptions<
  TNestApplication = INestApplication
>({
  modules,
  project,
  wrapApplicationMethods,
  globalConfigurationOptions,
  globalEnvironmentsOptions
}: BootstrapNestApplicationOptions & {
  wrapApplicationMethods: (
    | 'preWrapApplication'
    | 'wrapApplication'
    | 'postWrapApplication'
  )[];
}) {
  let app: TNestApplication | undefined = undefined;
  for (const wrapApplicationMethod of wrapApplicationMethods) {
    for (const category of Object.keys(NestModuleCategory)) {
      let moduleIndex = 0;
      while (modules[category as NestModuleCategory]?.[moduleIndex]) {

        if (globalConfigurationOptions && modules[category as NestModuleCategory]?.[moduleIndex]
          ?.nestModuleMetadata) {
          modules[category as NestModuleCategory]![moduleIndex]!.nestModuleMetadata!.globalConfigurationOptions
            = globalConfigurationOptions
        }

        if (globalEnvironmentsOptions && modules[category as NestModuleCategory]?.[moduleIndex]
          ?.nestModuleMetadata) {
          modules[category as NestModuleCategory]![moduleIndex]!.nestModuleMetadata!.globalEnvironmentsOptions
            = globalEnvironmentsOptions
        }

        if (
          modules[category as NestModuleCategory]?.[moduleIndex]
            ?.nestModuleMetadata?.[wrapApplicationMethod]
        ) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const result: any = await modules[category as NestModuleCategory]?.[
            moduleIndex
          ].nestModuleMetadata?.[wrapApplicationMethod]!({
            app,
            project,
            current: {
              category,
              index: moduleIndex,
            },
            modules,
          } as WrapApplicationOptions);
          if (result) {
            app = result;
          }
        }
        moduleIndex = moduleIndex + 1;
      }
    }
  }
  return { modules, app };
}

export async function bootstrapNestApplication<
  TNestApplication = INestApplication
>(options: BootstrapNestApplicationOptions) {
  const { app } = await bootstrapNestApplicationWithOptions<TNestApplication>({
    ...options,
    wrapApplicationMethods: getWrapModuleMetadataMethods(),
  });

  if (!app) {
    throw new NestApplicationError('Application not created!');
  }

  return app;
}
