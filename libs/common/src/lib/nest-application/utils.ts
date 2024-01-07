import { INestApplication } from '@nestjs/common';
import {
  NestModuleCategory,
  WrapApplicationOptions,
} from '../nest-module/types';
import { getWrapModuleMetadataMethods } from '../nest-module/utils';
import { NestApplicationError } from './errors';
import { BootstrapNestApplicationOptions } from './types';

export async function bootstrapNestApplication<
  TNestApplication = INestApplication
>({ modules, project }: BootstrapNestApplicationOptions) {
  let app: TNestApplication | undefined = undefined;
  const nestModuleMetadataMethods = getWrapModuleMetadataMethods();
  for (const nestModuleMetadataMethod of nestModuleMetadataMethods) {
    for (const category of Object.keys(NestModuleCategory)) {
      let moduleIndex = 0;
      while (modules[category as NestModuleCategory]?.[moduleIndex]) {
        if (
          modules[category as NestModuleCategory]?.[moduleIndex]
            ?.nestModuleMetadata?.[nestModuleMetadataMethod]
        ) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const result: any = await modules[category as NestModuleCategory]?.[
            moduleIndex
          ].nestModuleMetadata?.[nestModuleMetadataMethod]!({
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
  if (!app) {
    throw new NestApplicationError('Application not created!');
  }
  return app;
}
