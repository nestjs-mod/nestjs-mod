import { ConsoleLogger, INestApplication } from '@nestjs/common';
import {
  NEST_MODULE_CATEGORY_LIST,
  NestModuleCategory,
  ProjectOptions,
  WrapApplicationOptions,
} from '../nest-module/types';
import { getWrapModuleMetadataMethods } from '../nest-module/utils';
import { isInfrastructureMode } from '../utils/is-infrastructure';
import { isProductionMode } from '../utils/is-production';
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
  if (!logger) {
    logger = new ConsoleLogger('bootstrapNestApplication');
  }
  let app: TNestApplication | undefined = undefined;
  project = project ?? ({} as ProjectOptions);
  globalConfigurationOptions = globalConfigurationOptions ?? {};
  globalEnvironmentsOptions = globalEnvironmentsOptions ?? {};
  if (disableInfrastructureModulesInProduction === undefined) {
    disableInfrastructureModulesInProduction = true;
  }

  const categories =
    disableInfrastructureModulesInProduction && isProductionMode() && !isInfrastructureMode()
      ? NEST_MODULE_CATEGORY_LIST.filter((c) => c !== NestModuleCategory.infrastructure)
      : NEST_MODULE_CATEGORY_LIST;

  for (const wrapApplicationMethod of wrapApplicationMethods) {
    for (const category of categories) {
      let moduleIndex = 0;
      while (modules[category as NestModuleCategory]?.[moduleIndex]) {
        if (!modules[category as NestModuleCategory]?.[moduleIndex]?.nestModuleMetadata?.moduleDisabled) {
          if (
            modules[category as NestModuleCategory]?.[moduleIndex] &&
            modules[category as NestModuleCategory]?.[moduleIndex]?.pathNestModuleMetadata
          ) {
            if (project.name) {
              globalConfigurationOptions.name = project.name;
              globalEnvironmentsOptions.name = project.name;
            }
            modules[category as NestModuleCategory]?.[moduleIndex].pathNestModuleMetadata!({
              globalEnvironmentsOptions,
              globalConfigurationOptions,
              logger,
            });
          }

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
            if (result) {
              app = result;
            }
          }

          // any wrap methods can create new modules, we path all them
          for (let index = 0; index < (modules[category as NestModuleCategory] ?? []).length; index++) {
            if (
              modules[category as NestModuleCategory] &&
              modules[category as NestModuleCategory]?.[index]?.pathNestModuleMetadata
            ) {
              if (project.name) {
                globalConfigurationOptions.name = project.name;
                globalEnvironmentsOptions.name = project.name;
              }
              modules[category as NestModuleCategory]?.[index].pathNestModuleMetadata!({
                globalEnvironmentsOptions,
                globalConfigurationOptions,
                logger,
              });
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
