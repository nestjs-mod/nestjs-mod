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
  disableInfrastructureModulesInProduction,
}: BootstrapNestApplicationOptions & {
  wrapApplicationMethods: ('preWrapApplication' | 'wrapApplication' | 'postWrapApplication')[];
}) {
  if (disableInfrastructureModulesInProduction === undefined) {
    disableInfrastructureModulesInProduction = true;
  }

  let app: TNestApplication | undefined = undefined;

  const categories =
    disableInfrastructureModulesInProduction && !isInfrastructureMode()
      ? NEST_MODULE_CATEGORY_LIST.filter((c) => c !== NestModuleCategory.infrastructure)
      : NEST_MODULE_CATEGORY_LIST;

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
      let moduleIndex = 0;
      // any wrap methods can create new modules, we path all them
      for (let index = 0; index < (modules[category as NestModuleCategory] ?? []).length; index++) {
        if (!modules[category as NestModuleCategory]?.[moduleIndex].nestModuleMetadata?.project) {
          modules[category as NestModuleCategory]![moduleIndex].nestModuleMetadata!.project = project;
        } else {
          Object.assign(
            modules[category as NestModuleCategory]![moduleIndex].nestModuleMetadata!.project!,
            project ?? {}
          );
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
      moduleIndex = moduleIndex + 1;
    }
  };

  pathNestModuleMetadata();

  for (const wrapApplicationMethod of wrapApplicationMethods) {
    for (const category of categories) {
      let moduleIndex = 0;
      while (modules[category as NestModuleCategory]?.[moduleIndex]) {
        if (!modules[category as NestModuleCategory]?.[moduleIndex]?.nestModuleMetadata?.moduleDisabled) {
          if (modules[category as NestModuleCategory]?.[moduleIndex]?.nestModuleMetadata?.[wrapApplicationMethod]) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const result: any = await modules[category as NestModuleCategory]?.[moduleIndex].nestModuleMetadata?.[
              wrapApplicationMethod
            ]!({
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
