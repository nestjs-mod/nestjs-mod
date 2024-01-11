/* eslint-disable @typescript-eslint/no-explicit-any */
import { Abstract, DynamicModule, INestApplication, Provider, Type } from '@nestjs/common';
import { ConfigModelInfo, ConfigModelOptions } from '../config-model/types';
import { EnvModelInfo, EnvModelOptions } from '../env-model/types';
import { Observable } from 'rxjs';

export const DEFAULT_FOR_ROOT_METHOD_NAME = 'forRoot';
export const DEFAULT_FOR_ROOT_ASYNC_METHOD_NAME = 'forRootAsync';
export const DEFAULT_FOR_FEATURE_METHOD_NAME = 'forFeature';
export const DEFAULT_FOR_FEATURE_ASYNC_METHOD_NAME = 'forFeatureAsync';

export enum NestModuleCategory {
  core = 'core',
  feature = 'feature',
  integrations = 'integrations',
  system = 'system',
  infrastructure = 'infrastructure',
}

export type ImportsWithStaticOptionsResponse = Type<any> | DynamicModule | Promise<DynamicModule>;

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
  TFeatureConfigurationModel = never,
  TForRootMethodName extends string = typeof DEFAULT_FOR_ROOT_METHOD_NAME,
  TForRootAsyncMethodName extends string = typeof DEFAULT_FOR_ROOT_ASYNC_METHOD_NAME,
  TForFeatureMethodName extends string = typeof DEFAULT_FOR_FEATURE_METHOD_NAME,
  TForFeatureAsyncMethodName extends string = typeof DEFAULT_FOR_FEATURE_ASYNC_METHOD_NAME,
  TLinkOptions = {
    featureModule: DynamicModule;
    settingsModule: DynamicModule;
    staticConfiguration: TStaticConfigurationModel;
    staticEnvironments: TStaticEnvironmentsModel;
  },
  TImportsWithStaticOptions = (linkOptions: TLinkOptions) => Array<ImportsWithStaticOptionsResponse>,
  TControllersWithStaticOptions = (inkOptions: TLinkOptions) => Type<any>[],
  TProvidersWithStaticOptions = (inkOptions: TLinkOptions) => Provider[],
  TExportsWithStaticOptions = (inkOptions: TLinkOptions) => ExportsWithStaticOptionsResponse[],
  TNestApplication = INestApplication,
  TModuleName extends string = string
> =
  | Promise<DynamicModule> & {
      moduleSettings?: Record<string, TModuleSettings>;
      nestModuleMetadata?: NestModuleMetadata<
        TConfigurationModel,
        TStaticConfigurationModel,
        TEnvironmentsModel,
        TStaticEnvironmentsModel,
        TFeatureConfigurationModel,
        TForRootMethodName,
        TForRootAsyncMethodName,
        TForFeatureMethodName,
        TForFeatureAsyncMethodName,
        TLinkOptions,
        TImportsWithStaticOptions,
        TControllersWithStaticOptions,
        TProvidersWithStaticOptions,
        TExportsWithStaticOptions,
        TNestApplication,
        TModuleName
      >;
      pathNestModuleMetadata?: (newNestModuleMetadata: Partial<NestModuleMetadata>) => NestModuleMetadata;
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
  TFeatureConfigurationModel = never,
  TForRootMethodName extends string = typeof DEFAULT_FOR_ROOT_METHOD_NAME,
  TForRootAsyncMethodName extends string = typeof DEFAULT_FOR_ROOT_ASYNC_METHOD_NAME,
  TForFeatureMethodName extends string = typeof DEFAULT_FOR_FEATURE_METHOD_NAME,
  TForFeatureAsyncMethodName extends string = typeof DEFAULT_FOR_FEATURE_ASYNC_METHOD_NAME,
  TLinkOptions = {
    featureModule: DynamicModule;
    settingsModule: DynamicModule;
    staticConfiguration: TStaticConfigurationModel;
    staticEnvironments: TStaticEnvironmentsModel;
  },
  TImportsWithStaticOptions = (linkOptions: TLinkOptions) => Array<ImportsWithStaticOptionsResponse>,
  TControllersWithStaticOptions = (inkOptions: TLinkOptions) => Type<any>[],
  TProvidersWithStaticOptions = (inkOptions: TLinkOptions) => Provider[],
  TExportsWithStaticOptions = (inkOptions: TLinkOptions) => ExportsWithStaticOptionsResponse[],
  TNestApplication = INestApplication,
  TModuleName extends string = string
> {
  moduleName: TModuleName;
  moduleDescription?: string;
  moduleCategory?: NestModuleCategory;
  forRootMethodName?: TForRootMethodName;
  forRootAsyncMethodName?: TForRootAsyncMethodName;
  forFeatureMethodName?: TForFeatureMethodName;
  forFeatureAsyncMethodName?: TForFeatureAsyncMethodName;
  configurationModel?: Type<TConfigurationModel>;
  staticConfigurationModel?: Type<TStaticConfigurationModel>;
  featureConfigurationModel?: Type<TFeatureConfigurationModel>;
  environmentsModel?: Type<TEnvironmentsModel>;
  staticEnvironmentsModel?: Type<TStaticEnvironmentsModel>;
  environmentsOptions?: Omit<EnvModelOptions, 'originalName'>;
  configurationOptions?: Omit<ConfigModelOptions, 'originalName'>;
  globalEnvironmentsOptions?: Omit<EnvModelOptions, 'originalName'>;
  globalConfigurationOptions?: Omit<ConfigModelOptions, 'originalName'>;
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
> = { contextName?: string } & {
  environmentsOptions?: Omit<EnvModelOptions, 'originalName'>;
  configurationOptions?: Omit<ConfigModelOptions, 'originalName'>;
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
  configurationFactory?: (...args: any[]) => Promise<TConfigurationModel> | TConfigurationModel;
  configurationStream?: (...args: any[]) => Observable<TConfigurationModel>;
  inject?: any[];
} & Pick<
  NestModuleMetadata<TConfigurationModel, TStaticConfigurationModel, TEnvironmentsModel, TStaticEnvironmentsModel>,
  'imports'
> &
  ({ contextName?: string } & ForRootMethodOptions<
    TStaticConfigurationModel,
    TConfigurationModel,
    TEnvironmentsModel,
    TStaticEnvironmentsModel
  >);

export type ForFeatureMethodOptions<TFeatureConfigurationModel = any> = { contextName?: string } & {
  featureConfiguration?: TFeatureConfigurationModel;
};

export type ForFeatureAsyncMethodOptions<
  TConfigurationModel = never,
  TStaticConfigurationModel = never,
  TEnvironmentsModel = never,
  TStaticEnvironmentsModel = never,
  TFeatureConfigurationModel = any
> = {
  // todo: need add later
  // featureConfigurationExisting?: any;
  // featureConfigurationClass?: Type<TFeatureConfigurationModel>;
  // featureConfigurationStream?: (...args: any[]) => Observable<TFeatureConfigurationModel>;
  // featureConfigurationFactory?: (...args: any[]) => Promise<TFeatureConfigurationModel> | TFeatureConfigurationModel;
  // inject?: any[];
} & Pick<
  NestModuleMetadata<
    TConfigurationModel,
    TStaticConfigurationModel,
    TEnvironmentsModel,
    TStaticEnvironmentsModel,
    TFeatureConfigurationModel
  >,
  'imports'
> &
  ({ contextName?: string } & ForFeatureMethodOptions<TFeatureConfigurationModel>);

export type TModuleSettings = {
  environments?: EnvModelInfo;
  staticEnvironments?: EnvModelInfo;
  configuration?: ConfigModelInfo;
  staticConfiguration?: ConfigModelInfo;
  featureConfigurations?: ConfigModelInfo[];
};
