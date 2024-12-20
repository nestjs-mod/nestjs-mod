/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  ConsoleLogger,
  DynamicModule,
  INestApplication,
  Inject,
  Injectable,
  InjectionToken,
  Module,
  ModuleMetadata,
  OnModuleDestroy,
  OptionalFactoryDependency,
  Provider,
  Type,
} from '@nestjs/common';

import { randomUUID } from 'crypto';
import { Observable, Subject, concatMap, isObservable, takeUntil } from 'rxjs';
import { ConfigModelOptions, ConfigModelRootOptions } from '../config-model/types';
import { configTransform } from '../config-model/utils';
import { EnvModelOptions, EnvModelRootOptions } from '../env-model/types';
import { envTransform } from '../env-model/utils';
import { defaultContextName } from '../utils/default-context-name';
import { detectProviderName } from '../utils/detect-provider-name';
import { isInfrastructureMode } from '../utils/is-infrastructure';
import { nameItClass } from '../utils/name-it-class';
import { NestModuleError } from './errors';
import {
  DEFAULT_FOR_FEATURE_ASYNC_METHOD_NAME,
  DEFAULT_FOR_FEATURE_METHOD_NAME,
  DEFAULT_FOR_ROOT_ASYNC_METHOD_NAME,
  DEFAULT_FOR_ROOT_METHOD_NAME,
  DynamicNestModuleMetadata,
  ExportsWithStaticOptionsResponse,
  ForFeatureAsyncMethodOptions,
  ForFeatureMethodOptions,
  ForRootAsyncMethodOptions,
  ForRootMethodOptions,
  ImportsWithStaticOptionsResponse,
  InjectableFeatureConfigurationType,
  InjectableFeatureEnvironmentsType,
  InternalForFeatureAsyncMethodOptions,
  InternalForFeatureMethodOptions,
  InternalForRootAsyncMethodOptions,
  InternalForRootMethodOptions,
  NestModuleCategory,
  NestModuleMetadata,
  ProjectOptions,
  TModuleSettings,
  WrapApplicationOptions,
} from './types';

export function getWrapModuleMetadataMethods() {
  const nestModuleMetadataMethods: (keyof Pick<
    NestModuleMetadata,
    'preWrapApplication' | 'postWrapApplication' | 'wrapApplication'
  >)[] = ['preWrapApplication', 'wrapApplication', 'postWrapApplication'];
  return nestModuleMetadataMethods;
}

export function getNestModuleInternalUtils({ moduleName }: { moduleName: string }) {
  function getFeatureEnvironmentsToken(contextName?: string): InjectionToken {
    return `${moduleName}_${defaultContextName(contextName)}_feature_environments`;
  }

  function getAllFeatureEnvironmentsToken(): InjectionToken {
    return `${moduleName}_all_feature_environments`;
  }

  function getFeatureConfigurationsToken(contextName?: string): InjectionToken {
    return `${moduleName}_${defaultContextName(contextName)}_feature_configurations`;
  }

  function getAllFeatureConfigurationsToken(): InjectionToken {
    return `${moduleName}_all_feature_configurations`;
  }

  function getConfigurationLoaderToken(contextName?: string): InjectionToken {
    return `${moduleName}_${defaultContextName(contextName)}_configuration_loader`;
  }

  function getStaticConfigurationLoaderToken(contextName?: string): InjectionToken {
    return `${moduleName}_${defaultContextName(contextName)}_static_configuration_loader`;
  }

  function getEnvironmentsLoaderToken(contextName?: string): InjectionToken {
    return `${moduleName}_${defaultContextName(contextName)}_environments_loader`;
  }

  function getStaticEnvironmentsLoaderToken(contextName?: string): InjectionToken {
    return `${moduleName}_${defaultContextName(contextName)}_static_environments_loader`;
  }
  function getAsyncConfigurationToken(contextName?: string) {
    return `${moduleName}_${defaultContextName(contextName)}_options_async_loader`;
  }

  function getServiceToken(targetName: any, contextName?: string) {
    return `${moduleName}_${defaultContextName(contextName)}_service_${targetName}`;
  }

  function getAllModuleSettingsToken() {
    return `${moduleName}_all_module_settings`;
  }

  function getModuleSettingsToken(contextName?: string) {
    return `${moduleName}_${defaultContextName(contextName)}_module_settings`;
  }

  function createUniqProvider() {
    const uniqValue = randomUUID();
    return {
      provide: `${uniqValue}_uniq_provider`,
      useValue: uniqValue,
    };
  }

  return {
    defaultContextName,
    createUniqProvider,
    getEnvironmentsLoaderToken,
    getStaticEnvironmentsLoaderToken,
    getStaticConfigurationLoaderToken,
    getConfigurationLoaderToken,
    getServiceToken,
    getFeatureConfigurationsToken,
    getAsyncConfigurationToken,
    getAllFeatureConfigurationsToken,
    getFeatureEnvironmentsToken,
    getAllFeatureEnvironmentsToken,
    getModuleSettingsToken,
    getAllModuleSettingsToken,
  };
}

export function getNestModuleDecorators({ moduleName }: { moduleName: string }) {
  const {
    getFeatureConfigurationsToken,
    getServiceToken,
    getAllFeatureConfigurationsToken,
    getFeatureEnvironmentsToken,
    getAllFeatureEnvironmentsToken,
    getModuleSettingsToken,
    getAllModuleSettingsToken,
  } = getNestModuleInternalUtils({
    moduleName,
  });

  // TODO: not worked with ReturnType<typeof Inject>
  const InjectAllModuleSettings = (): any => Inject(getAllModuleSettingsToken());

  // TODO: not worked with ReturnType<typeof Inject>
  const InjectModuleSettings = (contextName?: string): any => Inject(getModuleSettingsToken(contextName));

  // TODO: not worked with ReturnType<typeof Inject>
  const InjectAllFeatureEnvironments = (): any => Inject(getAllFeatureEnvironmentsToken());

  // TODO: not worked with ReturnType<typeof Inject>
  const InjectFeatureEnvironments = (contextName?: string): any => Inject(getFeatureEnvironmentsToken(contextName));

  // TODO: not worked with ReturnType<typeof Inject>
  const InjectAllFeatures = (): any => Inject(getAllFeatureConfigurationsToken());

  // TODO: not worked with ReturnType<typeof Inject>
  const InjectFeatures = (contextName?: string): any => Inject(getFeatureConfigurationsToken(contextName));

  // TODO: not worked with ReturnType<typeof Inject>
  const InjectService =
    (service: any, contextName?: any): any =>
    (target: object, key: string, index: number) => {
      const token = getServiceToken(detectProviderName(service), contextName);
      // TODO: not worked :( const type = Reflect.getMetadata('design:type', target, key);
      return Inject(token)(target, key, index);
    };

  return {
    InjectFeatures,
    InjectService,
    InjectAllFeatures,
    InjectFeatureEnvironments,
    InjectAllFeatureEnvironments,
    InjectModuleSettings,
    InjectAllModuleSettings,
  };
}

///////////////////////////

// todo: fast bad hotfix for correct work staticEnvironmentsModel without staticConfigurationModel
class DummyClass {}

export function createNestModule<
  TStaticConfigurationModel = never,
  TConfigurationModel = never,
  TEnvironmentsModel = never,
  TStaticEnvironmentsModel = never,
  TFeatureConfigurationModel = never,
  TFeatureEnvironmentsModel = never,
  TForRootMethodName extends string = typeof DEFAULT_FOR_ROOT_METHOD_NAME,
  TForRootAsyncMethodName extends string = typeof DEFAULT_FOR_ROOT_ASYNC_METHOD_NAME,
  TForFeatureMethodName extends string = typeof DEFAULT_FOR_FEATURE_METHOD_NAME,
  TForFeatureAsyncMethodName extends string = typeof DEFAULT_FOR_FEATURE_ASYNC_METHOD_NAME,
  TDynamicModule = DynamicModule,
  TLinkOptions = {
    // todo: try add asyncOptions
    project: ProjectOptions;
    contextName?: string;
    featureModule: TDynamicModule;
    settingsModule: TDynamicModule;
    featureConfiguration: TFeatureConfigurationModel;
    featureEnvironments: TFeatureEnvironmentsModel;
    staticConfiguration: TStaticConfigurationModel;
    staticEnvironments: TStaticEnvironmentsModel;
    globalEnvironmentsOptions: Omit<EnvModelOptions, 'originalName'>;
    globalConfigurationOptions: Omit<ConfigModelOptions, 'originalName'>;
  },
  TImportsWithStaticOptions = (linkOptions: TLinkOptions) => Array<ImportsWithStaticOptionsResponse>,
  TControllersWithStaticOptions = (linkOptions: TLinkOptions) => Type<any>[],
  TProvidersWithStaticOptions = (linkOptions: TLinkOptions) => Provider[],
  TSharedProvidersWithStaticOptions = (linkOptions: TLinkOptions) => Provider[],
  TExportsWithStaticOptions = (linkOptions: TLinkOptions) => ExportsWithStaticOptionsResponse[],
  TNestApplication = INestApplication,
  TModuleName extends string = string
>(
  nestModuleMetadata: NestModuleMetadata<
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
    TSharedProvidersWithStaticOptions,
    TExportsWithStaticOptions,
    TNestApplication,
    TModuleName
  >
) {
  // todo: fast bad hotfix for correct work staticEnvironmentsModel without staticConfigurationModel
  if (nestModuleMetadata.staticEnvironmentsModel && !nestModuleMetadata.staticConfigurationModel) {
    nestModuleMetadata.staticConfigurationModel = DummyClass as any;
  }

  if (!nestModuleMetadata.logger) {
    nestModuleMetadata.logger = new ConsoleLogger('createNestModule');
  }
  const forRootMethodName = nestModuleMetadata.forRootMethodName || DEFAULT_FOR_ROOT_METHOD_NAME;
  const forRootAsyncMethodName = nestModuleMetadata.forRootAsyncMethodName || DEFAULT_FOR_ROOT_ASYNC_METHOD_NAME;
  const forFeatureMethodName = nestModuleMetadata.forFeatureMethodName || DEFAULT_FOR_FEATURE_METHOD_NAME;
  const forFeatureAsyncMethodName =
    nestModuleMetadata.forFeatureAsyncMethodName || DEFAULT_FOR_FEATURE_ASYNC_METHOD_NAME;

  const {
    defaultContextName,
    createUniqProvider,
    getEnvironmentsLoaderToken,
    getStaticEnvironmentsLoaderToken,
    getStaticConfigurationLoaderToken,
    getConfigurationLoaderToken,
    getServiceToken,
    getFeatureConfigurationsToken,
    getFeatureEnvironmentsToken,
    getAllFeatureConfigurationsToken,
    getAllFeatureEnvironmentsToken,
    getAsyncConfigurationToken,
    getModuleSettingsToken,
    getAllModuleSettingsToken,
  } = getNestModuleInternalUtils({
    moduleName: nestModuleMetadata.moduleName,
  });

  const forFeatureModules: DynamicNestModuleMetadata<
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
    TSharedProvidersWithStaticOptions,
    TExportsWithStaticOptions,
    TNestApplication
  >[] = [];
  const moduleSettings: Record<string, TModuleSettings> = {};

  const modulesByContextName: Record<string, any> = {};
  const featuresConfigurationByContextName: Record<
    string,
    InjectableFeatureConfigurationType<TFeatureConfigurationModel>[]
  > = {};
  const featuresEnvironmentsByContextName: Record<
    string,
    InjectableFeatureEnvironmentsType<TFeatureEnvironmentsModel>[]
  > = {};
  const settingsModulesByContextName: Record<string, any> = {};

  const getFeatureProviders = (contextName?: string) => {
    contextName = defaultContextName(contextName);
    if (featuresConfigurationByContextName[contextName] === undefined) {
      featuresConfigurationByContextName[contextName] = [];
    }
    if (featuresEnvironmentsByContextName[contextName] === undefined) {
      featuresEnvironmentsByContextName[contextName] = [];
    }
    if (moduleSettings[contextName] === undefined) {
      moduleSettings[contextName] = {};
    }
    return [
      {
        provide: getAllFeatureConfigurationsToken(),
        useValue: new Proxy(featuresConfigurationByContextName, {
          get(target, prop) {
            if (prop !== undefined) {
              return featuresConfigurationByContextName[prop as unknown as number];
            } else {
              return featuresConfigurationByContextName;
            }
          },
        }),
      },
      {
        provide: getFeatureConfigurationsToken(contextName),
        useValue: new Proxy(featuresConfigurationByContextName[contextName], {
          get(target, prop) {
            contextName = defaultContextName(contextName);
            if (prop === 'length') {
              return featuresConfigurationByContextName[contextName].length;
            }
            if (prop !== undefined) {
              return featuresConfigurationByContextName[contextName][prop as unknown as number];
            }
            return target[prop];
          },
        }),
      },
      //
      {
        provide: getAllFeatureEnvironmentsToken(),
        useValue: new Proxy(featuresEnvironmentsByContextName, {
          get(target, prop) {
            if (prop !== undefined) {
              return featuresEnvironmentsByContextName[prop as unknown as number];
            } else {
              return featuresEnvironmentsByContextName;
            }
          },
        }),
      },
      {
        provide: getFeatureEnvironmentsToken(contextName),
        useValue: new Proxy(featuresEnvironmentsByContextName[contextName], {
          get(target, prop) {
            contextName = defaultContextName(contextName);
            if (prop === 'length') {
              return featuresEnvironmentsByContextName[contextName].length;
            }
            if (prop !== undefined) {
              return featuresEnvironmentsByContextName[contextName][prop as unknown as number];
            }
            return target[prop];
          },
        }),
      },
      //
      {
        provide: getAllModuleSettingsToken(),
        useValue: new Proxy(moduleSettings, {
          get(target, prop) {
            if (prop !== undefined) {
              return moduleSettings[prop as unknown as number];
            } else {
              return moduleSettings;
            }
          },
        }),
      },
      {
        provide: getModuleSettingsToken(contextName),
        useValue: new Proxy(moduleSettings[contextName], {
          get(target, prop) {
            contextName = defaultContextName(contextName);
            if (prop !== undefined) {
              return moduleSettings[contextName]?.[prop as keyof TModuleSettings];
            } else {
              return moduleSettings[contextName];
            }
          },
        }),
      },
    ];
  };

  const getSettingsModule = (contextName: string) => {
    @Module({
      providers: [
        ...(nestModuleMetadata.configurationModel ? [nestModuleMetadata.configurationModel] : []),
        ...(nestModuleMetadata.staticConfigurationModel ? [nestModuleMetadata.staticConfigurationModel] : []),
        ...getFeatureProviders(contextName),
        ...getFeatureProviders(),
        ...(nestModuleMetadata.environmentsModel ? [nestModuleMetadata.environmentsModel] : []),
        ...(nestModuleMetadata.staticEnvironmentsModel ? [nestModuleMetadata.staticEnvironmentsModel] : []),
      ],
      exports: [
        ...(nestModuleMetadata.configurationModel ? [nestModuleMetadata.configurationModel] : []),
        ...(nestModuleMetadata.staticConfigurationModel ? [nestModuleMetadata.staticConfigurationModel] : []),
        getAllFeatureConfigurationsToken(),
        getAllFeatureEnvironmentsToken(),
        getFeatureConfigurationsToken(contextName),
        getFeatureConfigurationsToken(),
        getFeatureEnvironmentsToken(contextName),
        getFeatureEnvironmentsToken(),
        getAllModuleSettingsToken(),
        getModuleSettingsToken(contextName),
        ...(nestModuleMetadata.environmentsModel ? [nestModuleMetadata.environmentsModel] : []),
        ...(nestModuleMetadata.staticEnvironmentsModel ? [nestModuleMetadata.staticEnvironmentsModel] : []),
      ],
    })
    class SettingsModule {}
    return nameItClass(`${nestModuleMetadata.moduleName}Settings`, SettingsModule);
  };

  const getOrCreateSettingsModule = (contextName?: string) => {
    contextName = defaultContextName(contextName);
    if (settingsModulesByContextName[contextName] === undefined) {
      settingsModulesByContextName[contextName] = getSettingsModule(contextName);
    }
    return { contextName, module: settingsModulesByContextName[contextName] };
  };

  let sharedStaticConfiguration: Partial<TStaticConfigurationModel> | undefined;
  let sharedStaticEnvironments: Partial<TStaticEnvironmentsModel> | undefined;

  const getSharedModule = (
    contextName: string,
    staticConfiguration?: Partial<TStaticConfigurationModel>,
    staticEnvironments?: Partial<TStaticEnvironmentsModel>
  ) => {
    if (sharedStaticConfiguration === undefined) {
      sharedStaticConfiguration = staticConfiguration;
    }
    if (sharedStaticEnvironments === undefined) {
      sharedStaticEnvironments = staticEnvironments;
    }
    const { module: settingsModule } = getOrCreateSettingsModule(contextName);

    const sharedProvidersArr =
      !nestModuleMetadata?.sharedProviders || Array.isArray(nestModuleMetadata.sharedProviders)
        ? nestModuleMetadata?.sharedProviders
        : (nestModuleMetadata.sharedProviders as any)({
            project: nestModuleMetadata.project,
            contextName,
            staticConfiguration,
            staticEnvironments,
            globalConfigurationOptions: getRootConfigurationValidationOptions({
              nestModuleMetadata,
              contextName,
            }),
            globalEnvironmentsOptions: getRootEnvironmentsValidationOptions({
              nestModuleMetadata,
              contextName,
            }),
          } as TLinkOptions);
    const sharedProviders = ((nestModuleMetadata.sharedProviders === undefined ? [] : sharedProvidersArr) ||
      []) as Provider[];

    const sharedImportsArr =
      nestModuleMetadata?.sharedImports === undefined || Array.isArray(nestModuleMetadata.sharedImports)
        ? nestModuleMetadata?.sharedImports
        : (nestModuleMetadata.sharedImports as any)({
            project: nestModuleMetadata.project,
            contextName,
            settingsModule,
            staticConfiguration,
            staticEnvironments,
            globalConfigurationOptions: getRootConfigurationValidationOptions({
              nestModuleMetadata,
              contextName,
            }),
            globalEnvironmentsOptions: getRootEnvironmentsValidationOptions({
              nestModuleMetadata,
              contextName,
            }),
          } as TLinkOptions);
    const sharedImports = (nestModuleMetadata.sharedImports === undefined ? [] : sharedImportsArr) || [];

    const exports: ModuleMetadata['exports'] = [];
    const providers = sharedProviders
      .map((sharedService) => {
        try {
          const detectedProviderName = detectProviderName(sharedService);
          if (typeof sharedService !== 'string') {
            if ('provide' in sharedService) {
              const providers = [
                sharedService,
                {
                  provide: getServiceToken(detectedProviderName, contextName),
                  useExisting: sharedService.provide,
                },
              ];
              exports.push(providers[0].provide);
              exports.push(getServiceToken(detectedProviderName, contextName));
              return providers;
            }
            if ('name' in sharedService) {
              const providers = [
                sharedService,
                {
                  provide: getServiceToken(detectedProviderName, contextName),
                  useExisting: sharedService,
                },
              ];
              exports.push(sharedService);
              exports.push(getServiceToken(detectedProviderName, contextName));
              return providers;
            }
          }
          exports.push(sharedService);
          exports.push(getServiceToken(detectedProviderName, contextName));
          return [sharedService];
        } catch (err: any) {
          throw new NestModuleError(err.message);
        }
      })
      .filter(Boolean)
      .flat() as Provider[];

    @Module({
      imports: [settingsModule, ...sharedImports],
      providers,
      exports,
    })
    class SharedModule {}
    return nameItClass(`${nestModuleMetadata.moduleName}Shared`, SharedModule);
  };

  const getFeatureModule = ({
    contextName,
    staticConfiguration,
    staticEnvironments,
  }: {
    contextName?: string;
    staticConfiguration?: Partial<TStaticConfigurationModel>;
    staticEnvironments?: Partial<TStaticEnvironmentsModel>;
  }) => {
    contextName = defaultContextName(contextName);
    if (modulesByContextName[contextName] === undefined) {
      modulesByContextName[contextName] = getSharedModule(contextName, staticConfiguration, staticEnvironments);
    }
    if (moduleSettings[contextName] === undefined) {
      moduleSettings[contextName] = {};
    }
    return {
      contextName,
      module: modulesByContextName[contextName],
      featureConfiguration: undefined,
      featureEnvironments: undefined,
    };
  };

  const getOrCreateFeatureModule = async ({
    contextName,
    featureModuleName,
    featureConfiguration,
    featureEnvironments,
    featureConfigurationOptions,
    featureEnvironmentsOptions,
  }: {
    contextName?: string;
    featureModuleName: string;
    featureConfiguration?: TFeatureConfigurationModel;
    featureEnvironments?: TFeatureEnvironmentsModel;
    featureConfigurationOptions?: Omit<EnvModelOptions, 'originalName'>;
    featureEnvironmentsOptions?: Omit<EnvModelOptions, 'originalName'>;
  }) => {
    contextName = defaultContextName(contextName);
    if (modulesByContextName[contextName] === undefined) {
      modulesByContextName[contextName] = getSharedModule(contextName);
    }
    if (moduleSettings[contextName] === undefined) {
      moduleSettings[contextName] = {};
    }

    if (featureConfiguration) {
      if (featuresConfigurationByContextName[contextName] === undefined) {
        featuresConfigurationByContextName[contextName] = [];
      }
      if (nestModuleMetadata.featureConfigurationModel) {
        const obj = await configTransform({
          model: nestModuleMetadata.featureConfigurationModel,
          data: featureConfiguration as any,
          rootOptions: {
            ...featureConfigurationOptions,
            ...getRootConfigurationValidationOptions({ nestModuleMetadata, contextName }),
          },
        });
        if (moduleSettings[contextName].featureModuleConfigurations === undefined) {
          moduleSettings[contextName].featureModuleConfigurations = {};
        }
        if (
          moduleSettings[contextName].featureModuleConfigurations &&
          moduleSettings[contextName].featureModuleConfigurations![featureModuleName] === undefined
        ) {
          moduleSettings[contextName].featureModuleConfigurations![featureModuleName] = [];
        }
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        moduleSettings[contextName].featureModuleConfigurations![featureModuleName]!.push(obj.info);
        featuresConfigurationByContextName[contextName].push({
          featureModuleName,
          featureConfiguration: obj.data as TFeatureConfigurationModel,
        });
        featureConfiguration = obj.data as TFeatureConfigurationModel;
      } else {
        featuresConfigurationByContextName[contextName].push({ featureModuleName, featureConfiguration });
      }
    }

    if (featuresEnvironmentsByContextName[contextName] === undefined) {
      featuresEnvironmentsByContextName[contextName] = [];
    }
    if (nestModuleMetadata.featureEnvironmentsModel) {
      if (featureEnvironments === undefined) {
        featureEnvironments = {} as TFeatureEnvironmentsModel;
      }
      const obj = await envTransform({
        model: nestModuleMetadata.featureEnvironmentsModel,
        data: featureEnvironments as any,
        rootOptions: {
          ...featureEnvironmentsOptions,
          ...getRootEnvironmentsValidationOptions({
            nestModuleMetadata,
            contextName:
              defaultContextName() !== contextName ? `${contextName}_${featureModuleName}` : featureModuleName,
          }),
        },
      });
      if (moduleSettings[contextName].featureModuleEnvironments === undefined) {
        moduleSettings[contextName].featureModuleEnvironments = {};
      }
      if (
        moduleSettings[contextName].featureModuleEnvironments &&
        moduleSettings[contextName].featureModuleEnvironments![featureModuleName] === undefined
      ) {
        moduleSettings[contextName].featureModuleEnvironments![featureModuleName] = [];
      }
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      moduleSettings[contextName].featureModuleEnvironments![featureModuleName]!.push(obj.info);
      featuresEnvironmentsByContextName[contextName].push({
        featureModuleName,
        featureEnvironments: obj.data as TFeatureEnvironmentsModel,
      });
      featureEnvironments = obj.data as TFeatureEnvironmentsModel;
    }

    return { contextName, module: modulesByContextName[contextName], featureConfiguration, featureEnvironments };
  };

  @Module({})
  class InternalNestModule {
    static [forFeatureAsyncMethodName](
      asyncModuleOptions: InternalForFeatureAsyncMethodOptions<
        TConfigurationModel,
        TStaticConfigurationModel,
        TEnvironmentsModel,
        TStaticEnvironmentsModel,
        TFeatureConfigurationModel,
        TFeatureEnvironmentsModel
      >
    ): DynamicNestModuleMetadata<
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
      TSharedProvidersWithStaticOptions,
      TExportsWithStaticOptions,
      TNestApplication
    > {
      if (!asyncModuleOptions) {
        asyncModuleOptions = {} as unknown as InternalForFeatureAsyncMethodOptions<
          TConfigurationModel,
          TStaticConfigurationModel,
          TEnvironmentsModel,
          TStaticEnvironmentsModel,
          TFeatureConfigurationModel,
          TFeatureEnvironmentsModel
        >;
      }
      if (nestModuleMetadata.wrapForFeatureAsync) {
        const { asyncModuleOptions: newAsyncModuleOptions, module: wrapForFeatureAsyncModule } =
          nestModuleMetadata.wrapForFeatureAsync(asyncModuleOptions);
        if (wrapForFeatureAsyncModule) {
          return wrapForFeatureAsyncModule;
        }
        if (asyncModuleOptions && newAsyncModuleOptions) {
          Object.assign(asyncModuleOptions, newAsyncModuleOptions);
        }
      }

      const { featureConfiguration, featureEnvironments } = asyncModuleOptions || {};

      let { featureConfigurationOptions, featureEnvironmentsOptions } = asyncModuleOptions || {};
      const contextName = defaultContextName(asyncModuleOptions?.contextName);

      if (featureConfigurationOptions === undefined) {
        featureConfigurationOptions = {};
      }

      if (featureEnvironmentsOptions === undefined) {
        featureEnvironmentsOptions = {};
      }

      async function getModule() {
        // console.log('getModule:feature', nestModuleMetadata.moduleName);
        const { module: settingsModule } = getOrCreateSettingsModule(contextName);
        const { module: featureModule } = await getOrCreateFeatureModule({
          contextName,
          featureModuleName: asyncModuleOptions.featureModuleName,
          featureConfiguration,
          featureEnvironments,
          featureConfigurationOptions,
          featureEnvironmentsOptions,
        });

        const importsArr =
          asyncModuleOptions?.imports === undefined || Array.isArray(asyncModuleOptions.imports)
            ? asyncModuleOptions?.imports
            : (asyncModuleOptions.imports as any)({
                project: nestModuleMetadata.project,
                contextName,
                settingsModule,
                featureModule,
                featureConfiguration,
                featureEnvironments,
                globalConfigurationOptions: getRootConfigurationValidationOptions({
                  nestModuleMetadata,
                  asyncModuleOptions: { configurationOptions: featureConfigurationOptions },
                  contextName,
                }),
                globalEnvironmentsOptions: getRootEnvironmentsValidationOptions({
                  nestModuleMetadata,
                  asyncModuleOptions: { environmentsOptions: featureEnvironmentsOptions },
                  contextName,
                }),
              } as TLinkOptions);
        const imports = (nestModuleMetadata.imports === undefined ? [] : importsArr) || [];

        const exportsArr =
          nestModuleMetadata.exports === undefined || Array.isArray(nestModuleMetadata.exports)
            ? nestModuleMetadata.exports
            : (nestModuleMetadata.exports as any)({
                project: nestModuleMetadata.project,
                contextName,
                settingsModule,
                featureModule,
                featureConfiguration,
                featureEnvironments,
                globalConfigurationOptions: getRootConfigurationValidationOptions({
                  nestModuleMetadata,
                  contextName,
                }),
                globalEnvironmentsOptions: getRootEnvironmentsValidationOptions({
                  nestModuleMetadata,
                  contextName,
                }),
              } as TLinkOptions);
        const exports = (nestModuleMetadata.exports === undefined ? [] : exportsArr) || [];

        return {
          module: nameItClass(nestModuleMetadata.moduleName, InternalNestModule),
          providers: [createUniqProvider()],
          imports: [settingsModule, featureModule, ...imports],
          exports: [...exports, settingsModule, featureModule],
        };
      }

      // hack for disable auto resolving promise in nodejs
      // console.log('getModule:feature:before', nestModuleMetadata.moduleName);
      const result = Promise.resolve().then(() => getModule()) as DynamicNestModuleMetadata<
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
        TSharedProvidersWithStaticOptions,
        TExportsWithStaticOptions,
        TNestApplication
      >;
      // console.log('getModule:feature:after', nestModuleMetadata.moduleName);
      const nestModuleMetadataMethods = getWrapModuleMetadataMethods();
      Object.assign(result, {
        getNestModuleMetadata: () => {
          return {
            ...nestModuleMetadata,
            project: nestModuleMetadata.project || {},
            ...nestModuleMetadataMethods
              .map((method) => ({ [method]: undefined }))
              .reduce((all, cur) => ({ ...all, ...cur }), {}),
          };
        },
        moduleSettings,
        // need to set global options for configurations and environments
        // todo: try remove it
        pathNestModuleMetadata: (newNestModuleMetadata: Partial<NestModuleMetadata>) => {
          const keys = Object.keys(newNestModuleMetadata);

          const globalConfigurationOptions = newNestModuleMetadata.globalConfigurationOptions;
          const globalEnvironmentsOptions = newNestModuleMetadata.globalEnvironmentsOptions;
          const logger = newNestModuleMetadata.logger;

          if (featureConfigurationOptions && nestModuleMetadata?.globalConfigurationOptions) {
            Object.assign(featureConfigurationOptions, nestModuleMetadata.globalConfigurationOptions || {});
          }
          if (featureEnvironmentsOptions && nestModuleMetadata?.globalEnvironmentsOptions) {
            Object.assign(featureEnvironmentsOptions, nestModuleMetadata.globalEnvironmentsOptions || {});
          }

          for (const key of keys) {
            if ((newNestModuleMetadata as any)[key].constructor !== Object) {
              Object.setPrototypeOf((nestModuleMetadata as any)[key], (newNestModuleMetadata as any)[key]);
            }
            if ((nestModuleMetadata as any)[key]) {
              Object.assign((nestModuleMetadata as any)[key], (newNestModuleMetadata as any)[key] || {});
            } else {
              (nestModuleMetadata as any)[key] = (newNestModuleMetadata as any)[key];
            }
          }

          const imports = nestModuleMetadata?.imports || [];
          if (Array.isArray(imports)) {
            for (const imp of imports) {
              if ('pathNestModuleMetadata' in imp && imp.pathNestModuleMetadata) {
                (imp as any).pathNestModuleMetadata({
                  ...(newNestModuleMetadata.project ? { project: newNestModuleMetadata.project } : {}),
                  ...(globalConfigurationOptions ? { globalConfigurationOptions } : {}),
                  ...(globalEnvironmentsOptions ? { globalEnvironmentsOptions } : {}),
                  ...(logger ? { logger } : {}),
                });
              }
            }
          }

          const sharedImports = nestModuleMetadata?.sharedImports || [];
          if (Array.isArray(sharedImports)) {
            for (const imp of sharedImports) {
              if ('pathNestModuleMetadata' in imp && imp.pathNestModuleMetadata) {
                (imp as any).pathNestModuleMetadata({
                  ...(newNestModuleMetadata.project ? { project: newNestModuleMetadata.project } : {}),
                  ...(globalConfigurationOptions ? { globalConfigurationOptions } : {}),
                  ...(globalEnvironmentsOptions ? { globalEnvironmentsOptions } : {}),
                  ...(logger ? { logger } : {}),
                });
              }
            }
          }
        },
      });
      forFeatureModules.push(
        result as DynamicNestModuleMetadata<
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
          TSharedProvidersWithStaticOptions,
          TExportsWithStaticOptions,
          TNestApplication
        >
      );
      return result as DynamicNestModuleMetadata<
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
        TSharedProvidersWithStaticOptions,
        TExportsWithStaticOptions,
        TNestApplication
      >;
    }

    static [forFeatureMethodName](
      moduleOptions?: InternalForFeatureMethodOptions<TFeatureConfigurationModel, TFeatureEnvironmentsModel>
    ): Promise<TDynamicModule> {
      return (this as any)[forFeatureAsyncMethodName]({
        ...(moduleOptions || {}),
      });
    }

    static [forRootMethodName](
      moduleOptions?: InternalForRootMethodOptions<
        TStaticConfigurationModel,
        TConfigurationModel,
        TEnvironmentsModel,
        TStaticEnvironmentsModel
      >
    ): DynamicNestModuleMetadata<
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
      TSharedProvidersWithStaticOptions,
      TExportsWithStaticOptions,
      TNestApplication
    > {
      return (this as any)[forRootAsyncMethodName]({
        ...(moduleOptions || {}),
      });
    }

    static [forRootAsyncMethodName](
      asyncModuleOptions?: InternalForRootAsyncMethodOptions<
        TStaticConfigurationModel,
        TConfigurationModel,
        TEnvironmentsModel,
        TStaticEnvironmentsModel
      >
    ): DynamicNestModuleMetadata<
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
      TSharedProvidersWithStaticOptions,
      TExportsWithStaticOptions,
      TNestApplication
    > {
      if (!asyncModuleOptions) {
        asyncModuleOptions = {};
      }
      if (nestModuleMetadata.wrapForRootAsync) {
        const { asyncModuleOptions: newAsyncModuleOptions, module: wrapForRootAsync } =
          nestModuleMetadata.wrapForRootAsync(asyncModuleOptions);
        if (wrapForRootAsync) {
          return wrapForRootAsync;
        }
        if (asyncModuleOptions && newAsyncModuleOptions) {
          Object.assign(asyncModuleOptions, newAsyncModuleOptions);
        }
      }

      const contextName = defaultContextName(asyncModuleOptions?.contextName);
      let staticConfiguration: Partial<TStaticConfigurationModel> | undefined;
      let staticEnvironments: Partial<TStaticEnvironmentsModel> | undefined;

      async function loadStaticSettingsForInfo() {
        if (moduleSettings[contextName] === undefined) {
          moduleSettings[contextName] = {};
        }

        // need for documentation
        if (moduleSettings[contextName].featureConfiguration === undefined) {
          if (nestModuleMetadata.featureConfigurationModel) {
            const obj = await configTransform({
              model: nestModuleMetadata.featureConfigurationModel,
              data: {},
              rootOptions: {
                ...getRootConfigurationValidationOptions({ nestModuleMetadata, asyncModuleOptions, contextName }),
                skipValidation: true,
              },
            });
            moduleSettings[contextName].featureConfiguration = obj.info;
          }
        }
        if (moduleSettings[contextName].featureEnvironments === undefined) {
          if (nestModuleMetadata.featureEnvironmentsModel) {
            const obj = await envTransform({
              model: nestModuleMetadata.featureEnvironmentsModel,
              data: {},
              rootOptions: {
                ...getRootEnvironmentsValidationOptions({
                  nestModuleMetadata,
                  asyncModuleOptions,
                  contextName:
                    defaultContextName() !== contextName ? `${contextName}_FEATURE_MODULE_NAME` : 'FEATURE_MODULE_NAME',
                }),
                skipValidation: true,
                demoMode: true,
              },
            });
            moduleSettings[contextName].featureEnvironments = obj.info;
          }
        }
        if (moduleSettings[contextName].configuration === undefined) {
          if (nestModuleMetadata.configurationModel) {
            const obj = await configTransform({
              model: nestModuleMetadata.configurationModel,
              data: {},
              rootOptions: {
                ...getRootConfigurationValidationOptions({ nestModuleMetadata, asyncModuleOptions, contextName }),
                skipValidation: true,
              },
            });
            moduleSettings[contextName].configuration = obj.info;
          }
        }
        if (moduleSettings[contextName].staticConfiguration === undefined) {
          if (nestModuleMetadata.staticConfigurationModel) {
            const obj = await configTransform({
              model: nestModuleMetadata.staticConfigurationModel,
              data: {},
              rootOptions: {
                ...getRootConfigurationValidationOptions({ nestModuleMetadata, asyncModuleOptions, contextName }),
                skipValidation: true,
              },
            });
            moduleSettings[contextName].staticConfiguration = obj.info;
          }
        }
        if (moduleSettings[contextName].environments === undefined) {
          if (nestModuleMetadata.environmentsModel) {
            const obj = await envTransform({
              model: nestModuleMetadata.environmentsModel,
              data: {},
              rootOptions: {
                ...getRootEnvironmentsValidationOptions({ nestModuleMetadata, asyncModuleOptions, contextName }),
                skipValidation: true,
                demoMode: true,
              },
            });
            moduleSettings[contextName].environments = obj.info;
          }
        }
        if (moduleSettings[contextName].staticEnvironments === undefined) {
          if (nestModuleMetadata.staticEnvironmentsModel) {
            const obj = await envTransform({
              model: nestModuleMetadata.staticEnvironmentsModel,
              data: {},
              rootOptions: {
                ...getRootEnvironmentsValidationOptions({ nestModuleMetadata, asyncModuleOptions, contextName }),
                skipValidation: true,
                demoMode: true,
              },
            });
            moduleSettings[contextName].staticEnvironments = obj.info;
          }
        }
      }

      const loadStaticSettings = async () => {
        await loadStaticSettingsForInfo();

        if (moduleSettings[contextName] === undefined) {
          moduleSettings[contextName] = {};
        }
        if (staticConfiguration === undefined) {
          staticConfiguration = asyncModuleOptions?.staticConfiguration;
          if (nestModuleMetadata.staticConfigurationModel) {
            const obj = await configTransform({
              model: nestModuleMetadata.staticConfigurationModel,
              data: staticConfiguration || {},
              rootOptions: getRootConfigurationValidationOptions({
                nestModuleMetadata,
                asyncModuleOptions,
                contextName,
              }),
            });
            moduleSettings[contextName].staticConfiguration = obj.info;
            staticConfiguration = obj.data as any;
          }
        }

        if (staticEnvironments === undefined) {
          staticEnvironments = asyncModuleOptions?.staticEnvironments;
          if (nestModuleMetadata.staticEnvironmentsModel) {
            const obj = await envTransform({
              model: nestModuleMetadata.staticEnvironmentsModel,
              rootOptions: getRootEnvironmentsValidationOptions({
                nestModuleMetadata,
                asyncModuleOptions,
                contextName,
              }),
              data: staticEnvironments || {},
            });
            moduleSettings[contextName].staticEnvironments = obj.info;
            staticEnvironments = obj.data as any;
          }
        }
      };

      async function getModule() {
        // console.log('getModule:root', nestModuleMetadata.moduleName);
        await loadStaticSettings();
        const asyncConfigurationProviderLoaderToken = getAsyncConfigurationToken(contextName);

        let asyncOptionsProviderLoader: Provider = {
          provide: asyncConfigurationProviderLoaderToken,
          useValue: {},
        };

        @Injectable()
        class OnModuleDestroyService implements OnModuleDestroy {
          unsubscribe$ = new Subject();
          onModuleDestroy() {
            this.unsubscribe$.next(true);
            this.unsubscribe$.complete();
          }
        }

        if (asyncModuleOptions) {
          if ('configurationClass' in asyncModuleOptions) {
            asyncOptionsProviderLoader = {
              provide: asyncConfigurationProviderLoaderToken,
              useClass: asyncModuleOptions.configurationClass as Type<TConfigurationModel>,
            };
          }
          if ('configurationExisting' in asyncModuleOptions) {
            asyncOptionsProviderLoader = {
              provide: asyncConfigurationProviderLoaderToken,
              useExisting: asyncModuleOptions.configurationExisting,
            };
          }
          if ('configurationFactory' in asyncModuleOptions) {
            asyncOptionsProviderLoader = {
              provide: asyncConfigurationProviderLoaderToken,
              useFactory: asyncModuleOptions.configurationFactory as (...args: any[]) => TConfigurationModel,
              inject:
                'inject' in asyncModuleOptions
                  ? (asyncModuleOptions.inject as (InjectionToken | OptionalFactoryDependency)[])
                  : [],
            };
          }
          if ('configurationStream' in asyncModuleOptions) {
            asyncOptionsProviderLoader = {
              provide: asyncConfigurationProviderLoaderToken,
              useFactory: (...args) => {
                if (asyncModuleOptions?.configurationStream) {
                  return asyncModuleOptions.configurationStream(args);
                }
                return undefined;
              },
              inject:
                'inject' in asyncModuleOptions
                  ? [...(asyncModuleOptions.inject as (InjectionToken | OptionalFactoryDependency)[])]
                  : [],
            };
          }
          if ('configuration' in asyncModuleOptions) {
            asyncOptionsProviderLoader = {
              provide: asyncConfigurationProviderLoaderToken,
              useValue: asyncModuleOptions.configuration || {},
            };
          }
        }

        // console.log({ n: nestModuleMetadata.moduleName, p: nestModuleMetadata.project });
        const { module: settingsModule } = getOrCreateSettingsModule(contextName);
        const {
          module: featureModule,
          featureConfiguration,
          featureEnvironments,
        } = getFeatureModule({ contextName, staticConfiguration, staticEnvironments });

        const importsArr =
          nestModuleMetadata.imports === undefined || Array.isArray(nestModuleMetadata.imports)
            ? nestModuleMetadata.imports
            : (nestModuleMetadata.imports as any)({
                project: nestModuleMetadata.project,
                contextName,
                settingsModule,
                featureModule,
                staticConfiguration,
                staticEnvironments,
                featureConfiguration,
                featureEnvironments,
                globalConfigurationOptions: getRootConfigurationValidationOptions({
                  nestModuleMetadata,
                  asyncModuleOptions,
                  contextName,
                }),
                globalEnvironmentsOptions: getRootEnvironmentsValidationOptions({
                  nestModuleMetadata,
                  asyncModuleOptions,
                  contextName,
                }),
              } as TLinkOptions);
        const imports = (nestModuleMetadata.imports === undefined ? [] : importsArr) || [];

        const asyncImportsArr =
          asyncModuleOptions?.imports === undefined || Array.isArray(asyncModuleOptions.imports)
            ? asyncModuleOptions?.imports
            : (asyncModuleOptions.imports as any)({
                project: nestModuleMetadata.project,
                contextName,
                settingsModule,
                featureModule,
                staticConfiguration,
                staticEnvironments,
                featureConfiguration,
                featureEnvironments,
                globalConfigurationOptions: getRootConfigurationValidationOptions({
                  nestModuleMetadata,
                  asyncModuleOptions,
                  contextName,
                }),
                globalEnvironmentsOptions: getRootEnvironmentsValidationOptions({
                  nestModuleMetadata,
                  asyncModuleOptions,
                  contextName,
                }),
              } as TLinkOptions);
        const asyncImports = (asyncModuleOptions?.imports === undefined ? [] : asyncImportsArr) || [];

        const controllersArr =
          nestModuleMetadata.controllers === undefined || Array.isArray(nestModuleMetadata.controllers)
            ? nestModuleMetadata.controllers
            : (nestModuleMetadata.controllers as any)({
                project: nestModuleMetadata.project,
                contextName,
                settingsModule,
                featureModule,
                staticConfiguration,
                staticEnvironments,
                featureConfiguration,
                featureEnvironments,
                globalConfigurationOptions: getRootConfigurationValidationOptions({
                  nestModuleMetadata,
                  asyncModuleOptions,
                  contextName,
                }),
                globalEnvironmentsOptions: getRootEnvironmentsValidationOptions({
                  nestModuleMetadata,
                  asyncModuleOptions,
                  contextName,
                }),
              } as TLinkOptions);
        const controllers = (nestModuleMetadata.controllers === undefined ? [] : controllersArr) || [];

        const providersArr =
          nestModuleMetadata.providers === undefined || Array.isArray(nestModuleMetadata.providers)
            ? nestModuleMetadata.providers
            : (nestModuleMetadata.providers as any)({
                project: nestModuleMetadata.project,
                contextName,
                settingsModule,
                featureModule,
                staticConfiguration,
                staticEnvironments,
                featureConfiguration,
                featureEnvironments,
                globalConfigurationOptions: getRootConfigurationValidationOptions({
                  nestModuleMetadata,
                  asyncModuleOptions,
                  contextName,
                }),
                globalEnvironmentsOptions: getRootEnvironmentsValidationOptions({
                  nestModuleMetadata,
                  asyncModuleOptions,
                  contextName,
                }),
              } as TLinkOptions);
        const providers = (nestModuleMetadata.providers === undefined ? [] : providersArr) || [];

        const exportsArr =
          nestModuleMetadata.exports === undefined || Array.isArray(nestModuleMetadata.exports)
            ? nestModuleMetadata.exports
            : (nestModuleMetadata.exports as any)({
                project: nestModuleMetadata.project,
                contextName,
                settingsModule,
                featureModule,
                staticConfiguration,
                staticEnvironments,
                featureConfiguration,
                featureEnvironments,
                globalConfigurationOptions: getRootConfigurationValidationOptions({
                  nestModuleMetadata,
                  asyncModuleOptions,
                  contextName,
                }),
                globalEnvironmentsOptions: getRootEnvironmentsValidationOptions({
                  nestModuleMetadata,
                  asyncModuleOptions,
                  contextName,
                }),
              } as TLinkOptions);
        const exports = (nestModuleMetadata.exports === undefined ? [] : exportsArr) || [];

        return <TDynamicModule>{
          module: nameItClass(nestModuleMetadata.moduleName, InternalNestModule),
          imports: [settingsModule, featureModule, ...imports, ...asyncImports],
          providers: [
            createUniqProvider(),
            OnModuleDestroyService,
            asyncOptionsProviderLoader,
            ...(nestModuleMetadata.environmentsModel
              ? [
                  {
                    provide: getEnvironmentsLoaderToken(contextName),
                    useFactory: async (emptyConfigOptions: TEnvironmentsModel) => {
                      if (moduleSettings[contextName] === undefined) {
                        moduleSettings[contextName] = {};
                      }
                      if (nestModuleMetadata.environmentsModel === undefined) {
                        return asyncModuleOptions?.environments || {};
                      }
                      const obj = await envTransform({
                        model: nestModuleMetadata.environmentsModel,
                        rootOptions: getRootEnvironmentsValidationOptions({
                          nestModuleMetadata,
                          asyncModuleOptions,
                          contextName,
                        }),
                        data: asyncModuleOptions?.environments || {},
                      });
                      moduleSettings[contextName].environments = obj.info;
                      Object.assign(emptyConfigOptions as any, obj.data);
                      return emptyConfigOptions;
                    },
                    inject: [nestModuleMetadata.environmentsModel],
                  },
                ]
              : []),
            ...(nestModuleMetadata.staticEnvironmentsModel
              ? [
                  {
                    provide: getStaticEnvironmentsLoaderToken(contextName),
                    useFactory: async (emptyStaticEnvironments: TStaticEnvironmentsModel) => {
                      if (moduleSettings[contextName] === undefined) {
                        moduleSettings[contextName] = {};
                      }
                      const obj = await envTransform({
                        model: nestModuleMetadata.staticEnvironmentsModel!,
                        rootOptions: getRootEnvironmentsValidationOptions({
                          nestModuleMetadata,
                          asyncModuleOptions,
                          contextName,
                        }),
                        data: asyncModuleOptions?.staticEnvironments || {},
                      });
                      moduleSettings[contextName].staticEnvironments = obj.info;
                      Object.assign(emptyStaticEnvironments as any, obj.data);
                    },
                    inject: [nestModuleMetadata.staticEnvironmentsModel],
                  },
                ]
              : []),
            ...(nestModuleMetadata.configurationModel
              ? [
                  {
                    provide: getConfigurationLoaderToken(contextName),
                    useFactory: async (
                      emptyConfiguration: TConfigurationModel,
                      configuration: TConfigurationModel | Observable<TConfigurationModel>,
                      onModuleDestroyService: OnModuleDestroyService
                    ) => {
                      if (moduleSettings[contextName] === undefined) {
                        moduleSettings[contextName] = {};
                      }
                      const updateEmptyConfiguration = async function (
                        configuration: TConfigurationModel | Observable<TConfigurationModel>,
                        emptyConfiguration: TConfigurationModel
                      ) {
                        if (configuration && configuration?.constructor !== Object) {
                          Object.setPrototypeOf(emptyConfiguration, configuration);
                        }
                        if (nestModuleMetadata.configurationModel) {
                          const obj = await configTransform({
                            model: nestModuleMetadata.configurationModel,
                            data: configuration || {},
                            rootOptions: getRootConfigurationValidationOptions({
                              nestModuleMetadata,
                              asyncModuleOptions,
                              contextName,
                            }),
                          });
                          moduleSettings[contextName].configuration = obj.info;
                          Object.assign(emptyConfiguration as any, obj.data);
                        } else {
                          Object.assign(emptyConfiguration as any, configuration);
                        }
                      };
                      if (asyncModuleOptions?.configurationStream && isObservable(configuration)) {
                        configuration
                          .pipe(
                            concatMap((data) => updateEmptyConfiguration(data, emptyConfiguration)),
                            takeUntil(onModuleDestroyService.unsubscribe$)
                          )
                          .subscribe();
                      } else {
                        await updateEmptyConfiguration(configuration, emptyConfiguration);
                      }
                    },
                    inject: [
                      nestModuleMetadata.configurationModel,
                      asyncConfigurationProviderLoaderToken,
                      OnModuleDestroyService,
                    ],
                  },
                ]
              : []),
            ...(nestModuleMetadata.staticConfigurationModel
              ? [
                  {
                    provide: getStaticConfigurationLoaderToken(contextName),
                    useFactory: async (emptyStaticConfiguration: TStaticConfigurationModel) => {
                      if (moduleSettings[contextName] === undefined) {
                        moduleSettings[contextName] = {};
                      }
                      if (staticConfiguration && staticConfiguration?.constructor !== Object) {
                        Object.setPrototypeOf(emptyStaticConfiguration, staticConfiguration);
                      }
                      const obj = await configTransform({
                        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                        model: nestModuleMetadata.staticConfigurationModel!,
                        data: staticConfiguration || {},
                        rootOptions: getRootConfigurationValidationOptions({
                          nestModuleMetadata,
                          asyncModuleOptions,
                          contextName,
                        }),
                      });
                      moduleSettings[contextName].staticConfiguration = obj.info;
                      Object.assign(emptyStaticConfiguration as any, obj.data);
                    },
                    inject: [nestModuleMetadata.staticConfigurationModel],
                  },
                ]
              : []),
            ...providers,
          ],
          controllers: [...controllers],
          exports: [featureModule, ...exports],
        };
      }

      // hack for disable auto resolving promise in nodejs
      // console.log('getModule:root:before', nestModuleMetadata.moduleName);
      const result = Promise.resolve().then(() => getModule()) as DynamicNestModuleMetadata<
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
        TSharedProvidersWithStaticOptions,
        TExportsWithStaticOptions,
        TNestApplication,
        TModuleName
      >;
      // console.log('getModule:root:after', nestModuleMetadata.moduleName);
      const nestModuleMetadataMethods = getWrapModuleMetadataMethods();
      Object.assign(result, {
        getNestModuleMetadata: () => {
          return {
            ...nestModuleMetadata,
            project: nestModuleMetadata.project || {},
            ...nestModuleMetadataMethods
              .map((method) =>
                nestModuleMetadata[method]
                  ? {
                      [method]: async (
                        options: WrapApplicationOptions<
                          TNestApplication,
                          TStaticConfigurationModel,
                          TStaticEnvironmentsModel,
                          TConfigurationModel,
                          TEnvironmentsModel
                        >
                      ) => {
                        await loadStaticSettings();
                        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                        return await nestModuleMetadata?.[method]!({
                          ...options,
                          current: {
                            ...options.current,
                            staticConfiguration,
                            staticEnvironments,
                            asyncModuleOptions,
                          },
                        } as WrapApplicationOptions<TNestApplication, TStaticConfigurationModel, TStaticEnvironmentsModel, TConfigurationModel, TEnvironmentsModel>);
                      },
                    }
                  : {}
              )
              .reduce((all, cur) => ({ ...all, ...cur }), {}),
          };
        },
        moduleSettings,
        // need to set global options for configurations and environments
        // todo: try remove it
        pathNestModuleMetadata: (newNestModuleMetadata: Partial<NestModuleMetadata>) => {
          const keys = Object.keys(newNestModuleMetadata);

          const globalConfigurationOptions = newNestModuleMetadata.globalConfigurationOptions;
          const globalEnvironmentsOptions = newNestModuleMetadata.globalEnvironmentsOptions;
          const logger = newNestModuleMetadata.logger;

          for (const key of keys) {
            if ((newNestModuleMetadata as any)[key].constructor !== Object) {
              Object.setPrototypeOf((nestModuleMetadata as any)[key], (newNestModuleMetadata as any)[key] || {});
            }
            if ((nestModuleMetadata as any)[key]) {
              Object.assign((nestModuleMetadata as any)[key], (newNestModuleMetadata as any)[key] || {});
            } else {
              (nestModuleMetadata as any)[key] = (newNestModuleMetadata as any)[key];
            }
          }

          const imports = nestModuleMetadata?.imports || [];
          if (Array.isArray(imports)) {
            for (const imp of imports) {
              if ('pathNestModuleMetadata' in imp && imp.pathNestModuleMetadata) {
                (imp as any).pathNestModuleMetadata({
                  ...(newNestModuleMetadata.project ? { project: newNestModuleMetadata.project } : {}),
                  ...(globalConfigurationOptions ? { globalConfigurationOptions } : {}),
                  ...(globalEnvironmentsOptions ? { globalEnvironmentsOptions } : {}),
                  ...(logger ? { logger } : {}),
                });
              }
            }
          }

          const sharedImports = nestModuleMetadata?.sharedImports || [];
          if (Array.isArray(sharedImports)) {
            for (const imp of sharedImports) {
              if ('pathNestModuleMetadata' in imp && imp.pathNestModuleMetadata) {
                (imp as any).pathNestModuleMetadata({
                  ...(newNestModuleMetadata.project ? { project: newNestModuleMetadata.project } : {}),
                  ...(globalConfigurationOptions ? { globalConfigurationOptions } : {}),
                  ...(globalEnvironmentsOptions ? { globalEnvironmentsOptions } : {}),
                  ...(logger ? { logger } : {}),
                });
              }
            }
          }

          for (const forFeatureModule of forFeatureModules) {
            if (forFeatureModule.pathNestModuleMetadata) {
              forFeatureModule.pathNestModuleMetadata({
                ...(newNestModuleMetadata.project ? { project: newNestModuleMetadata.project } : {}),
                ...(globalConfigurationOptions ? { globalConfigurationOptions } : {}),
                ...(globalEnvironmentsOptions ? { globalEnvironmentsOptions } : {}),
                ...(logger ? { logger } : {}),
              });
            }
          }
        },
        forFeatureModules,
      });
      return result as DynamicNestModuleMetadata<
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
        TSharedProvidersWithStaticOptions,
        TExportsWithStaticOptions,
        TNestApplication,
        TModuleName
      >;
    }
  }

  return {
    [nestModuleMetadata.moduleName]: Object.assign(nameItClass(nestModuleMetadata.moduleName, InternalNestModule), {
      // need to reports
      // todo: try remove it
      getNestModuleMetadata: () => nestModuleMetadata,
    }),
  } as unknown as Record<
    TModuleName,
    Record<
      `${TForFeatureAsyncMethodName}`,
      (
        asyncOptions?: ForFeatureAsyncMethodOptions<
          TConfigurationModel,
          TStaticConfigurationModel,
          TEnvironmentsModel,
          TStaticEnvironmentsModel,
          TFeatureConfigurationModel,
          TFeatureEnvironmentsModel
        >
      ) => Promise<TDynamicModule>
    > &
      Record<
        `${TForFeatureMethodName}`,
        (
          options?: ForFeatureMethodOptions<TFeatureConfigurationModel, TFeatureEnvironmentsModel>
        ) => Promise<TDynamicModule>
      > &
      Record<
        `${TForRootMethodName}`,
        (
          options?: ForRootMethodOptions<
            TStaticConfigurationModel,
            TConfigurationModel,
            TEnvironmentsModel,
            TStaticEnvironmentsModel
          >
        ) => Promise<TDynamicModule>
      > &
      Record<
        `${TForRootAsyncMethodName}`,
        (
          asyncOptions?: ForRootAsyncMethodOptions<
            TStaticConfigurationModel,
            TConfigurationModel,
            TEnvironmentsModel,
            TStaticEnvironmentsModel
          >
        ) => Promise<TDynamicModule>
      >
  >;

  function getRootConfigurationValidationOptions({
    nestModuleMetadata,
    asyncModuleOptions,
    contextName,
  }: {
    nestModuleMetadata: NestModuleMetadata<
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
      TSharedProvidersWithStaticOptions,
      TExportsWithStaticOptions,
      TNestApplication,
      TModuleName
    >;
    asyncModuleOptions?: InternalForRootAsyncMethodOptions<
      TStaticConfigurationModel,
      TConfigurationModel,
      TEnvironmentsModel,
      TStaticEnvironmentsModel
    >;
    contextName: string;
  }): ConfigModelRootOptions | undefined {
    // console.log('getRootConfigurationValidationOptions', nestModuleMetadata.moduleName);
    const { name: globalName, ...globalOptions } = nestModuleMetadata.globalConfigurationOptions || {};
    const { contextName: asyncContextName, configurationOptions } = asyncModuleOptions || {};
    const both = {
      ...configurationOptions,
      ...nestModuleMetadata.configurationOptions,
      ...globalOptions,
    };

    const nameArr: string[] = [];
    if (globalName && globalName !== defaultContextName()) {
      nameArr.push(globalName);
    }
    if (asyncContextName && asyncContextName !== defaultContextName()) {
      nameArr.push(asyncContextName);
    } else {
      if (contextName && contextName !== defaultContextName()) {
        nameArr.push(contextName);
      }
    }
    if (both.name && both.name !== defaultContextName()) {
      nameArr.push(both.name);
    }

    return { ...both, name: [...new Set(nameArr)].join('_') };
  }

  function getRootEnvironmentsValidationOptions({
    nestModuleMetadata,
    asyncModuleOptions,
    contextName,
  }: {
    nestModuleMetadata: NestModuleMetadata<
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
      TSharedProvidersWithStaticOptions,
      TExportsWithStaticOptions,
      TNestApplication,
      TModuleName
    >;
    asyncModuleOptions?: InternalForRootAsyncMethodOptions<
      TStaticConfigurationModel,
      TConfigurationModel,
      TEnvironmentsModel,
      TStaticEnvironmentsModel
    >;
    contextName: string;
  }): EnvModelRootOptions | undefined {
    const { name: globalName, ...globalOptions } = nestModuleMetadata.globalEnvironmentsOptions || {};
    const { contextName: asyncContextName, environmentsOptions } = asyncModuleOptions || {};
    const both = {
      ...environmentsOptions,
      ...nestModuleMetadata.environmentsOptions,
      ...globalOptions,
    };

    const nameArr: string[] = [];
    if (globalName && globalName !== defaultContextName()) {
      nameArr.push(globalName);
    }
    if (asyncContextName && asyncContextName !== defaultContextName()) {
      nameArr.push(asyncContextName);
    } else {
      if (contextName && contextName !== defaultContextName()) {
        nameArr.push(contextName);
      }
    }
    if (both.name && both.name !== defaultContextName()) {
      nameArr.push(both.name);
    }

    return { ...both, name: [...new Set(nameArr)].join('_') };
  }
}

export function collectRootNestModules(modules: Partial<Record<NestModuleCategory, DynamicNestModuleMetadata[]>>) {
  return Object.entries(modules)
    .filter(([category]) => isInfrastructureMode() || category !== NestModuleCategory.infrastructure)
    .map(([, value]) => value)
    .flat()
    .filter((m: DynamicNestModuleMetadata) => !m.getNestModuleMetadata?.()?.moduleDisabled);
}
