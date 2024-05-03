import { ConsoleLogger, INestApplication } from '@nestjs/common';
import {
  NEST_MODULE_CATEGORY_LIST,
  NestModuleCategory,
  ProjectOptions,
  WrapApplicationOptions,
} from '../nest-module/types';
import { getWrapModuleMetadataMethods } from '../nest-module/utils';
import { isInfrastructureMode } from '../utils/is-infrastructure';
import { NestApplicationError } from './errors';
import { BootstrapNestApplicationOptions } from './types';

export async function bootstrapNestApplicationWithOptions<TNestApplication = INestApplication>({
  modules,
  project,
  logger,
  wrapApplicationMethods,
  globalConfigurationOptions,
  globalEnvironmentsOptions,
}: BootstrapNestApplicationOptions & {
  wrapApplicationMethods: ('preWrapApplication' | 'wrapApplication' | 'postWrapApplication')[];
}) {
  let app: TNestApplication | undefined = undefined;

  const categories = NEST_MODULE_CATEGORY_LIST.filter(
    (category) => isInfrastructureMode() || category !== NestModuleCategory.infrastructure
  );
  const pathNestModuleMetadata = () => {
    if (!project) {
      project = {} as ProjectOptions;
    }

    if (!globalConfigurationOptions) {
      globalConfigurationOptions = {};
    }

    if (!globalEnvironmentsOptions) {
      globalEnvironmentsOptions = {};
    }

    if (!logger) {
      logger = new ConsoleLogger('bootstrapNestApplication');
    }

    for (const category of categories) {
      // any wrap methods can create new modules, we path all them
      for (let index = 0; index < (modules[category as NestModuleCategory] || []).length; index++) {
        if (modules[category as NestModuleCategory]?.[index]?.getNestModuleMetadata?.()) {
          if (!modules[category as NestModuleCategory]?.[index].getNestModuleMetadata?.()?.project) {
            // todo: change to pathNestModuleMetadata
            modules[category as NestModuleCategory]![index].getNestModuleMetadata!().project = project;
          } else {
            // todo: change to pathNestModuleMetadata
            Object.assign(
              modules[category as NestModuleCategory]![index].getNestModuleMetadata!().project!,
              project || {}
            );
          }
        }
        if (
          modules[category as NestModuleCategory] &&
          modules[category as NestModuleCategory]?.[index]?.pathNestModuleMetadata
        ) {
          if (project.name) {
            globalConfigurationOptions.name = project.name;
            globalEnvironmentsOptions.name = project.name;
          }
          modules[category as NestModuleCategory]?.[index].pathNestModuleMetadata!({
            project,
            globalEnvironmentsOptions,
            globalConfigurationOptions,
            logger,
          });
        }
      }
    }
  };

  pathNestModuleMetadata();

  for (const wrapApplicationMethod of wrapApplicationMethods) {
    for (const category of categories) {
      let moduleIndex = 0;
      while (modules[category as NestModuleCategory]?.[moduleIndex]) {
        if (!modules[category as NestModuleCategory]?.[moduleIndex]?.getNestModuleMetadata?.()?.moduleDisabled) {
          if (
            modules[category as NestModuleCategory]?.[moduleIndex]?.getNestModuleMetadata?.()?.[wrapApplicationMethod]
          ) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const result: any = await modules[category as NestModuleCategory]?.[
              moduleIndex
            ].getNestModuleMetadata?.()?.[wrapApplicationMethod]!({
              app,
              project,
              current: {
                category,
                index: moduleIndex,
              },
              logger,
              modules,
              globalEnvironmentsOptions,
              globalConfigurationOptions,
            } as WrapApplicationOptions);

            pathNestModuleMetadata();

            if (result) {
              app = result;
            }
          }
        }
        moduleIndex = moduleIndex + 1;
      }
    }
  }

  if (!isInfrastructureMode()) {
    delete modules[NestModuleCategory.infrastructure];
  }
  return { modules, app };
}

export async function bootstrapNestApplication<TNestApplication = INestApplication>(
  options: BootstrapNestApplicationOptions
) {
  const { app } = await bootstrapNestApplicationWithOptions<TNestApplication>({
    ...options,
    wrapApplicationMethods: getWrapModuleMetadataMethods(),
  });

  if (!app) {
    throw new NestApplicationError('Application not created!');
  }

  return app;
}
