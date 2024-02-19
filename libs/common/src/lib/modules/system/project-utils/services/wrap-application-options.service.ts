/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable } from '@nestjs/common';
import { ConfigModelOptions } from '../../../../config-model/types';
import { EnvModelOptions } from '../../../../env-model/types';
import {
  DynamicNestModuleMetadata,
  InternalForRootAsyncMethodOptions,
  NestModuleCategory,
  ProjectOptions,
  WrapApplicationOptions,
} from '../../../../nest-module/types';

@Injectable()
export class WrapApplicationOptionsService<
  TNestApplication = any,
  TStaticConfigurationModel = any,
  TStaticEnvironmentsModel = any,
  TConfigurationModel = any,
  TEnvironmentsModel = any
> implements
    WrapApplicationOptions<
      TNestApplication,
      TStaticConfigurationModel,
      TStaticEnvironmentsModel,
      TConfigurationModel,
      TEnvironmentsModel
    >
{
  app?: TNestApplication;
  project?: ProjectOptions;
  current!: {
    category: NestModuleCategory;
    index: number;
    asyncModuleOptions: InternalForRootAsyncMethodOptions<
      TStaticConfigurationModel,
      TConfigurationModel,
      TEnvironmentsModel,
      TStaticEnvironmentsModel
    >;
    staticConfiguration?: Partial<TStaticConfigurationModel>;
    staticEnvironments?: Partial<TStaticEnvironmentsModel>;
  };
  modules!: Partial<Record<NestModuleCategory, DynamicNestModuleMetadata[]>>;
  globalEnvironmentsOptions?: Omit<EnvModelOptions, 'originalName'>;
  globalConfigurationOptions?: Omit<ConfigModelOptions, 'originalName'>;
}
