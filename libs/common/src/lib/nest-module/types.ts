/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Abstract,
  DynamicModule,
  INestApplication,
  Provider,
  Type,
} from '@nestjs/common';
import { ConfigModelInfo, ConfigModelOptions } from '../config-model/types';
import {
  EnvModelInfo,
  EnvModelOptions,
  EnvModelRootOptions,
} from '../env-model/types';

export const DEFAULT_FOR_ROOT_METHOD_NAME = 'forRoot';
export const DEFAULT_FOR_ROOT_ASYNC_METHOD_NAME = 'forRootAsync';
export const DEFAULT_FOR_FEATURE_METHOD_NAME = 'forFeature';

export enum NestModuleCategory {
  core = 'core',
  feature = 'feature',
  integrations = 'integrations',
  system = 'system',
  infrastructure = 'infrastructure',
}

export type ImportsWithStaticOptionsResponse =
  | Type<any>
  | DynamicModule
  | Promise<DynamicModule>;

export type ExportsWithStaticOptionsResponse =
  | DynamicModule
  | Promise<DynamicModule>
  | string
  | symbol
  | Provider
  | Abstract<any>
  // eslint-disable-next-line @typescript-eslint/ban-types
  | Function;

export type DynamicNestModuleMetadata<
  TConfigurationModel = any,
  TStaticConfigurationModel = any,
  TEnvironmentsModel = any,
  TStaticEnvironmentsModel = any,
  TForRootMethodName extends string = typeof DEFAULT_FOR_ROOT_METHOD_NAME,
  TForRootAsyncMethodName extends string = typeof DEFAULT_FOR_ROOT_ASYNC_METHOD_NAME,
  TForFeatureMethodName extends string = typeof DEFAULT_FOR_FEATURE_METHOD_NAME,
  TImportsWithStaticOptions = (
    staticConfiguration?: TStaticConfigurationModel,
    staticEnvironments?: TStaticEnvironmentsModel
  ) => Array<ImportsWithStaticOptionsResponse>,
  TControllersWithStaticOptions = (
    staticConfiguration?: TStaticConfigurationModel,
    staticEnvironments?: TStaticEnvironmentsModel
  ) => Type<any>[],
  TProvidersWithStaticOptions = (
    staticConfiguration?: TStaticConfigurationModel,
    staticEnvironments?: TStaticEnvironmentsModel
  ) => Provider[],
  TExportsWithStaticOptions = (
    staticConfiguration?: TStaticConfigurationModel,
    staticEnvironments?: TStaticEnvironmentsModel
  ) => ExportsWithStaticOptionsResponse[],
  TNestApplication = INestApplication,
  TFeatureConfigurationModel = any,
  TModuleName extends string = string
> =
  | Promise<DynamicModule> & {
      moduleInfo?: Record<string, TModuleInfoByName>;
      nestModuleMetadata?: NestModuleMetadata<
        TConfigurationModel,
        TStaticConfigurationModel,
        TEnvironmentsModel,
        TStaticEnvironmentsModel,
        TForRootMethodName,
        TForRootAsyncMethodName,
        TForFeatureMethodName,
        TImportsWithStaticOptions,
        TControllersWithStaticOptions,
        TProvidersWithStaticOptions,
        TExportsWithStaticOptions,
        TNestApplication,
        TFeatureConfigurationModel,
        TModuleName
      >;
    };

export type ProjectOptions = {
  name: string;
  description: string;
};

export type WrapApplicationOptions<
  TNestApplication = any,
  TStaticConfigurationModel = any,
  TStaticEnvironmentsModel = any,
  TConfigurationModel = any,
  TEnvironmentsModel = any
> = {
  app?: TNestApplication;
  project: ProjectOptions;
  current: {
    category: NestModuleCategory;
    index: number;
    asyncModuleOptions: ForRootAsyncMethodOptions<
      TStaticConfigurationModel,
      TConfigurationModel,
      TEnvironmentsModel,
      TStaticEnvironmentsModel
    >;
    staticConfiguration?: Partial<TStaticConfigurationModel>;
    staticEnvironments?: Partial<TStaticEnvironmentsModel>;
  };
  modules: Partial<Record<NestModuleCategory, DynamicNestModuleMetadata[]>>;
};

export interface NestModuleMetadata<
  TConfigurationModel = any,
  TStaticConfigurationModel = any,
  TEnvironmentsModel = any,
  TStaticEnvironmentsModel = any,
  TForRootMethodName extends string = typeof DEFAULT_FOR_ROOT_METHOD_NAME,
  TForRootAsyncMethodName extends string = typeof DEFAULT_FOR_ROOT_ASYNC_METHOD_NAME,
  TForFeatureMethodName extends string = typeof DEFAULT_FOR_FEATURE_METHOD_NAME,
  TImportsWithStaticOptions = (
    staticConfiguration?: TStaticConfigurationModel,
    staticEnvironments?: TStaticEnvironmentsModel
  ) => Array<ImportsWithStaticOptionsResponse>,
  TControllersWithStaticOptions = (
    staticConfiguration?: TStaticConfigurationModel,
    staticEnvironments?: TStaticEnvironmentsModel
  ) => Type<any>[],
  TProvidersWithStaticOptions = (
    staticConfiguration?: TStaticConfigurationModel,
    staticEnvironments?: TStaticEnvironmentsModel
  ) => Provider[],
  TExportsWithStaticOptions = (
    staticConfiguration?: TStaticConfigurationModel,
    staticEnvironments?: TStaticEnvironmentsModel
  ) => ExportsWithStaticOptionsResponse[],
  TNestApplication = INestApplication,
  TFeatureConfigurationModel = any,
  TModuleName extends string = string
> {
  moduleName: TModuleName;
  moduleDescription?: string;
  moduleCategory?: NestModuleCategory;
  forRootMethodName?: TForRootMethodName;
  forRootAsyncMethodName?: TForRootAsyncMethodName;
  forFeatureMethodName?: TForFeatureMethodName;
  configurationModel?: Type<TConfigurationModel>;
  staticConfigurationModel?: Type<TStaticConfigurationModel>;
  featureConfigurationModel?: Type<TFeatureConfigurationModel>;
  environmentsModel?: Type<TEnvironmentsModel>;
  staticEnvironmentsModel?: Type<TStaticEnvironmentsModel>;
  environmentsOptions?: Pick<
    EnvModelOptions,
    | 'skipValidation'
    | 'propertyNameFormatters'
    | 'propertyValueExtractors'
    | 'validatorPackage'
    | 'validatorOptions'
  >;
  configurationOptions?: Pick<
    ConfigModelOptions,
    'skipValidation' | 'validatorPackage' | 'validatorOptions'
  >;
  /**
   * Optional list of imported modules that export the providers which are
   * required in this module.
   */
  imports?: Array<ImportsWithStaticOptionsResponse> | TImportsWithStaticOptions;
  /**
   * Optional list of controllers defined in this module which have to be
   * instantiated.
   */
  controllers?: Type<any>[] | TControllersWithStaticOptions;
  /**
   * Optional list of providers that will be instantiated by the NestJS injector
   * and that may be shared at least across this module.
   */
  providers?: Provider[] | TProvidersWithStaticOptions;
  /**
   * Optional list of providers that will be instantiated by the NestJS injector
   * and that may be shared at least across this module.
   */
  sharedProviders?: Provider[];
  /**
   * Optional list of the subset of providers that are provided by this module
   * and should be available in other modules which import this module.
   */
  exports?: ExportsWithStaticOptionsResponse[] | TExportsWithStaticOptions;
  preWrapApplication?: (
    options: WrapApplicationOptions<
      TNestApplication,
      TStaticConfigurationModel,
      TStaticEnvironmentsModel,
      TConfigurationModel,
      TEnvironmentsModel
    >
  ) => Promise<void>;
  wrapApplication?: (
    options: WrapApplicationOptions<
      TNestApplication,
      TStaticConfigurationModel,
      TStaticEnvironmentsModel,
      TConfigurationModel,
      TEnvironmentsModel
    >
  ) => Promise<TNestApplication | void>;
  postWrapApplication?: (
    options: WrapApplicationOptions<
      TNestApplication,
      TStaticConfigurationModel,
      TStaticEnvironmentsModel,
      TConfigurationModel,
      TEnvironmentsModel
    >
  ) => Promise<void>;
}

export type CommonNestModuleMetadata = Partial<
  DynamicModule &
    Pick<
      NestModuleMetadata,
      | 'wrapApplication'
      | 'preWrapApplication'
      | 'postWrapApplication'
      | 'moduleName'
      | 'moduleCategory'
      | 'moduleDescription'
    >
>;

export type ForRootMethodOptions<
  TStaticConfigurationModel,
  TConfigurationModel,
  TEnvironmentsModel,
  TStaticEnvironmentsModel
> = EnvModelRootOptions & {
  environmentsOptions?: Pick<
    EnvModelOptions,
    | 'skipValidation'
    | 'propertyNameFormatters'
    | 'propertyValueExtractors'
    | 'validatorPackage'
    | 'validatorOptions'
  >;
  configurationOptions?: Pick<
    ConfigModelOptions,
    'skipValidation' | 'validatorPackage' | 'validatorOptions'
  >;
  configuration?: TConfigurationModel;
  staticConfiguration?: TStaticConfigurationModel;
  environments?: Partial<TEnvironmentsModel>;
  staticEnvironments?: Partial<TStaticEnvironmentsModel>;
};

export type ForRootAsyncMethodOptions<
  TStaticConfigurationModel,
  TConfigurationModel,
  TEnvironmentsModel,
  TStaticEnvironmentsModel
> = {
  configurationExisting?: any;
  configurationClass?: Type<TConfigurationModel>;
  configurationFactory?: (
    ...args: any[]
  ) => Promise<TConfigurationModel> | TConfigurationModel;
  inject?: any[];
} & Pick<DynamicModule, 'imports'> &
  (EnvModelRootOptions &
    ForRootMethodOptions<
      TStaticConfigurationModel,
      TConfigurationModel,
      TEnvironmentsModel,
      TStaticEnvironmentsModel
    >);

export type TModuleInfoByName = {
  environments?: EnvModelInfo;
  staticEnvironments?: EnvModelInfo;
  configuration?: ConfigModelInfo;
  staticConfiguration?: ConfigModelInfo;
  featureConfigurations?: ConfigModelInfo[];
  nestModuleMetadata?: NestModuleMetadata;
};
