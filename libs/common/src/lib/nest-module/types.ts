/* eslint-disable @typescript-eslint/no-explicit-any */
import { Abstract, DynamicModule, INestApplication, Logger, LoggerService, Provider, Type } from '@nestjs/common';
import { Observable } from 'rxjs';
import { ConfigModelInfo, ConfigModelOptions } from '../config-model/types';
import { EnvModelInfo, EnvModelOptions } from '../env-model/types';

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

export const NEST_MODULE_CATEGORY_LIST: (keyof typeof NestModuleCategory)[] = [
  'system',
  'core',
  'feature',
  'integrations',
  'infrastructure',
];

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
  TFeatureEnvironmentsModel = never,
  TForRootMethodName extends string = typeof DEFAULT_FOR_ROOT_METHOD_NAME,
  TForRootAsyncMethodName extends string = typeof DEFAULT_FOR_ROOT_ASYNC_METHOD_NAME,
  TForFeatureMethodName extends string = typeof DEFAULT_FOR_FEATURE_METHOD_NAME,
  TForFeatureAsyncMethodName extends string = typeof DEFAULT_FOR_FEATURE_ASYNC_METHOD_NAME,
  TDynamicModule = DynamicModule,
  TLinkOptions = {
    featureModule: TDynamicModule;
    settingsModule: TDynamicModule;
    featureConfiguration: TFeatureConfigurationModel;
    featureEnvironments: TFeatureEnvironmentsModel;
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
  | Promise<TDynamicModule> & {
      moduleSettings?: Record<string, TModuleSettings>;
      nestModuleMetadata?: NestModuleMetadata<
        TConfigurationModel,
        TStaticConfigurationModel,
        TEnvironmentsModel,
        TStaticEnvironmentsModel,
        TFeatureConfigurationModel,
        TFeatureEnvironmentsModel,
        TForRootMethodName,
        TForRootAsyncMethodName,
        TForFeatureMethodName,
        TForFeatureAsyncMethodName,
        TDynamicModule,
        TLinkOptions,
        TImportsWithStaticOptions,
        TControllersWithStaticOptions,
        TProvidersWithStaticOptions,
        TExportsWithStaticOptions,
        TNestApplication,
        TModuleName
      >;
      pathNestModuleMetadata?: (newNestModuleMetadata: Partial<NestModuleMetadata>) => NestModuleMetadata;
      forFeatureModules?: DynamicNestModuleMetadata<
        TConfigurationModel,
        TStaticConfigurationModel,
        TEnvironmentsModel,
        TStaticEnvironmentsModel,
        TFeatureConfigurationModel,
        TFeatureEnvironmentsModel,
        TForRootMethodName,
        TForRootAsyncMethodName,
        TForFeatureMethodName,
        TForFeatureAsyncMethodName,
        TDynamicModule,
        TLinkOptions,
        TImportsWithStaticOptions,
        TControllersWithStaticOptions,
        TProvidersWithStaticOptions,
        TExportsWithStaticOptions,
        TNestApplication
      >[];
    };

export type ProjectOptions = {
  name: string;
  description: string;
  version?: string;
};

export type WrapApplicationOptions<
  TNestApplication = any,
  TStaticConfigurationModel = any,
  TStaticEnvironmentsModel = any,
  TConfigurationModel = any,
  TEnvironmentsModel = any
> = {
  app?: TNestApplication;
  project?: ProjectOptions;
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
  globalEnvironmentsOptions?: Omit<EnvModelOptions, 'originalName'>;
  globalConfigurationOptions?: Omit<ConfigModelOptions, 'originalName'>;
  logger?: Logger | LoggerService;
};

export interface NestModuleMetadata<
  TConfigurationModel = any,
  TStaticConfigurationModel = any,
  TEnvironmentsModel = any,
  TStaticEnvironmentsModel = any,
  TFeatureConfigurationModel = never,
  TFeatureEnvironmentsModel = never,
  TForRootMethodName extends string = typeof DEFAULT_FOR_ROOT_METHOD_NAME,
  TForRootAsyncMethodName extends string = typeof DEFAULT_FOR_ROOT_ASYNC_METHOD_NAME,
  TForFeatureMethodName extends string = typeof DEFAULT_FOR_FEATURE_METHOD_NAME,
  TForFeatureAsyncMethodName extends string = typeof DEFAULT_FOR_FEATURE_ASYNC_METHOD_NAME,
  TDynamicModule = DynamicModule,
  TLinkOptions = {
    featureModule: TDynamicModule;
    settingsModule: TDynamicModule;
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
  moduleDisabled?: boolean;
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
  featureEnvironmentsModel?: Type<TFeatureEnvironmentsModel>;
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
   * Optional list of imported modules that export the providers which are
   * required in this module.
   */
  sharedImports?: Array<ImportsWithStaticOptionsResponse> | TImportsWithStaticOptions;
  /**
   * Optional list of providers that will be instantiated by the NestJS injector
   * and that may be shared at least across this module.
   */
  sharedProviders?: Provider[] | TProvidersWithStaticOptions;
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
  logger?: Logger | LoggerService;
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

export type ForFeatureMethodOptions<TFeatureConfigurationModel = any, TFeatureEnvironmentsModel = any> = {
  featureModuleName: string;
  contextName?: string;
} & {
  featureConfiguration?: TFeatureConfigurationModel;
  featureEnvironments?: TFeatureEnvironmentsModel;
  featureConfigurationOptions?: Omit<EnvModelOptions, 'originalName'>;
  featureEnvironmentsOptions?: Omit<EnvModelOptions, 'originalName'>;
};

export type ForFeatureAsyncMethodOptions<
  TConfigurationModel = never,
  TStaticConfigurationModel = never,
  TEnvironmentsModel = never,
  TStaticEnvironmentsModel = never,
  TFeatureConfigurationModel = any,
  TFeatureEnvironmentsModel = any
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
    TFeatureConfigurationModel,
    TFeatureEnvironmentsModel
  >,
  'imports'
> &
  ({ contextName?: string } & ForFeatureMethodOptions<TFeatureConfigurationModel, TFeatureEnvironmentsModel>);

export type TModuleSettings = {
  environments?: EnvModelInfo;
  staticEnvironments?: EnvModelInfo;
  configuration?: ConfigModelInfo;
  staticConfiguration?: ConfigModelInfo;
  featureConfiguration?: ConfigModelInfo;
  featureEnvironments?: ConfigModelInfo;
  featureModuleConfigurations?: Record<string, ConfigModelInfo[]>;
  featureModuleEnvironments?: Record<string, ConfigModelInfo[]>;
};
