/* eslint-disable @typescript-eslint/no-explicit-any */
import {
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
import { ConfigModelRootOptions } from '../config-model/types';
import { configTransform } from '../config-model/utils';
import { envTransform } from '../env-model/utils';
import { detectProviderName } from '../utils/detect-provider-name';
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
  NestModuleMetadata,
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

function getNestModuleInternalUtils({ moduleName }: { moduleName: string }) {
  function defaultContextName(contextName?: string) {
    return contextName ?? 'default';
  }

  function getFeatureConfigurationsToken(contextName?: string): InjectionToken {
    return `${moduleName}_${defaultContextName(contextName)}_feature_configurations`;
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
  };
}

export function getNestModuleDecorators({ moduleName }: { moduleName: string }) {
  const { getFeatureConfigurationsToken, getServiceToken } = getNestModuleInternalUtils({
    moduleName,
  });

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
  };
}

///////////////////////////

export function createNestModule<
  TStaticConfigurationModel = never,
  TConfigurationModel = never,
  TEnvironmentsModel = never,
  TStaticEnvironmentsModel = never,
  TFeatureConfigurationModel = never,
  TForRootMethodName extends string = typeof DEFAULT_FOR_ROOT_METHOD_NAME,
  TForRootAsyncMethodName extends string = typeof DEFAULT_FOR_ROOT_ASYNC_METHOD_NAME,
  TForFeatureMethodName extends string = typeof DEFAULT_FOR_FEATURE_METHOD_NAME,
  TForFeatureAsyncMethodName extends string = typeof DEFAULT_FOR_FEATURE_ASYNC_METHOD_NAME,
  TDynamicModule = DynamicModule,
  TLinkOptions = {
    featureModule: TDynamicModule;
    settingsModule: TDynamicModule;
    featureConfiguration: TFeatureConfigurationModel;
    staticConfiguration: TStaticConfigurationModel;
    staticEnvironments: TStaticEnvironmentsModel;
  },
  TImportsWithStaticOptions = (linkOptions: TLinkOptions) => Array<ImportsWithStaticOptionsResponse>,
  TControllersWithStaticOptions = (inkOptions: TLinkOptions) => Type<any>[],
  TProvidersWithStaticOptions = (inkOptions: TLinkOptions) => Provider[],
  TExportsWithStaticOptions = (inkOptions: TLinkOptions) => ExportsWithStaticOptionsResponse[],
  TNestApplication = INestApplication,
  TModuleName extends string = string
>(
  nestModuleMetadata: NestModuleMetadata<
    TConfigurationModel,
    TStaticConfigurationModel,
    TEnvironmentsModel,
    TStaticEnvironmentsModel,
    TFeatureConfigurationModel,
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
  >
) {
  const forRootMethodName = nestModuleMetadata.forRootMethodName ?? DEFAULT_FOR_ROOT_METHOD_NAME;
  const forRootAsyncMethodName = nestModuleMetadata.forRootAsyncMethodName ?? DEFAULT_FOR_ROOT_ASYNC_METHOD_NAME;
  const forFeatureMethodName = nestModuleMetadata.forFeatureMethodName ?? DEFAULT_FOR_FEATURE_METHOD_NAME;
  const forFeatureAsyncMethodName =
    nestModuleMetadata.forFeatureAsyncMethodName ?? DEFAULT_FOR_FEATURE_ASYNC_METHOD_NAME;

  const {
    defaultContextName,
    createUniqProvider,
    getEnvironmentsLoaderToken,
    getStaticEnvironmentsLoaderToken,
    getStaticConfigurationLoaderToken,
    getConfigurationLoaderToken,
    getServiceToken,
    getFeatureConfigurationsToken,
    getAsyncConfigurationToken,
  } = getNestModuleInternalUtils({
    moduleName: nestModuleMetadata.moduleName,
  });

  const moduleSettings: Record<string, TModuleSettings> = {};

  const modulesByName: Record<string, any> = {};
  const featuresByName: Record<string, TFeatureConfigurationModel[]> = {};
  const settingsModulesByName: Record<string, any> = {};

  const getFeatureProvider = (contextName?: string) => {
    contextName = defaultContextName(contextName);
    if (!featuresByName[contextName]) {
      featuresByName[contextName] = [];
    }
    return {
      provide: getFeatureConfigurationsToken(contextName),
      useValue: new Proxy(featuresByName[contextName], {
        get(target, prop) {
          contextName = defaultContextName(contextName);
          if (prop === 'length') {
            return featuresByName[contextName].length;
          }
          if (prop !== undefined) {
            return featuresByName[contextName][prop as unknown as number];
          }
          return target[prop];
        },
      }),
    };
  };

  const getSettingsModule = (contextName: string) => {
    @Module({
      providers: [
        ...(nestModuleMetadata.configurationModel ? [nestModuleMetadata.configurationModel] : []),
        ...(nestModuleMetadata.staticConfigurationModel ? [nestModuleMetadata.staticConfigurationModel] : []),
        getFeatureProvider(contextName),
        getFeatureProvider(),
        ...(nestModuleMetadata.environmentsModel ? [nestModuleMetadata.environmentsModel] : []),
        ...(nestModuleMetadata.staticEnvironmentsModel ? [nestModuleMetadata.staticEnvironmentsModel] : []),
      ],
      exports: [
        ...(nestModuleMetadata.configurationModel ? [nestModuleMetadata.configurationModel] : []),
        ...(nestModuleMetadata.staticConfigurationModel ? [nestModuleMetadata.staticConfigurationModel] : []),
        getFeatureConfigurationsToken(contextName),
        getFeatureConfigurationsToken(),
        ...(nestModuleMetadata.environmentsModel ? [nestModuleMetadata.environmentsModel] : []),
        ...(nestModuleMetadata.staticEnvironmentsModel ? [nestModuleMetadata.staticEnvironmentsModel] : []),
      ],
    })
    class SettingsModule {}
    return SettingsModule;
  };

  const getOrCreateSettingsModule = (contextName?: string) => {
    contextName = defaultContextName(contextName);
    if (!settingsModulesByName[contextName]) {
      settingsModulesByName[contextName] = getSettingsModule(contextName);
    }
    return { contextName, module: settingsModulesByName[contextName] };
  };

  const getSharedModule = (contextName: string) => {
    const { module: settingsModule } = getOrCreateSettingsModule(contextName);

    const sharedProvidersArr =
      !nestModuleMetadata?.sharedProviders || Array.isArray(nestModuleMetadata.sharedProviders)
        ? nestModuleMetadata?.sharedProviders
        : (nestModuleMetadata.sharedProviders as any)({
            staticConfiguration: moduleSettings[contextName].staticConfiguration,
            staticEnvironments: moduleSettings[contextName].staticEnvironments,
          } as TLinkOptions);
    const sharedProviders = ((!nestModuleMetadata.sharedProviders ? [] : sharedProvidersArr) ?? []) as Provider[];

    const sharedImportsArr =
      !nestModuleMetadata?.sharedImports || Array.isArray(nestModuleMetadata.sharedImports)
        ? nestModuleMetadata?.sharedImports
        : (nestModuleMetadata.sharedImports as any)({
            settingsModule,
            staticConfiguration: moduleSettings[contextName].staticConfiguration,
            staticEnvironments: moduleSettings[contextName].staticEnvironments,
          } as TLinkOptions);
    const sharedImports = (!nestModuleMetadata.sharedImports ? [] : sharedImportsArr) ?? [];

    const exports: ModuleMetadata['exports'] = [...sharedImports];
    const providers = sharedProviders
      .map((sharedService) => {
        try {
          const detectedProviderName = detectProviderName(sharedService);
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
          return [sharedService];
        } catch (err) {
          return undefined;
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
    return SharedModule;
  };

  const getFeatureModule = async ({ contextName }: { contextName?: string }) => {
    contextName = defaultContextName(contextName);
    if (!modulesByName[contextName]) {
      modulesByName[contextName] = getSharedModule(contextName);
    }
    if (!moduleSettings[contextName]) {
      moduleSettings[contextName] = {};
    }
    return { contextName, module: modulesByName[contextName], featureConfiguration: undefined };
  };

  const getOrCreateFeatureModule = async ({
    contextName,
    featureModuleName,
    featureConfiguration,
  }: {
    contextName?: string;
    featureModuleName: string;
    featureConfiguration?: TFeatureConfigurationModel;
  }) => {
    contextName = defaultContextName(contextName);
    if (!modulesByName[contextName]) {
      modulesByName[contextName] = getSharedModule(contextName);
    }
    if (!moduleSettings[contextName]) {
      moduleSettings[contextName] = {};
    }
    if (featureConfiguration) {
      if (!featuresByName[contextName]) {
        featuresByName[contextName] = [];
      }
      if (nestModuleMetadata.featureConfigurationModel) {
        const obj = await configTransform({
          model: nestModuleMetadata.featureConfigurationModel,
          data: featureConfiguration as any,
          rootOptions: getRootConfigurationValidationOptions({ nestModuleMetadata, contextName }),
        });
        if (!moduleSettings[contextName].featureModuleConfigurations) {
          moduleSettings[contextName].featureModuleConfigurations = {};
        }
        if (
          moduleSettings[contextName].featureModuleConfigurations &&
          !moduleSettings[contextName].featureModuleConfigurations![featureModuleName]
        ) {
          moduleSettings[contextName].featureModuleConfigurations![featureModuleName] = [];
        }
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        moduleSettings[contextName].featureModuleConfigurations![featureModuleName]!.push(obj.info);
        featuresByName[contextName].push(obj.data as TFeatureConfigurationModel);
        return { contextName, module: modulesByName[contextName], featureConfiguration: obj.data };
      } else {
        featuresByName[contextName].push(featureConfiguration);
        return { contextName, module: modulesByName[contextName], featureConfiguration };
      }
    }
    return { contextName, module: modulesByName[contextName], featureConfiguration: undefined };
  };

  @Module({})
  class InternalNestModule {
    static [forFeatureAsyncMethodName](
      asyncModuleOptions: ForFeatureAsyncMethodOptions<TFeatureConfigurationModel>
    ): DynamicNestModuleMetadata<
      TConfigurationModel,
      TStaticConfigurationModel,
      TEnvironmentsModel,
      TStaticEnvironmentsModel,
      TFeatureConfigurationModel,
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
    > {
      const getModule = async () => {
        const { featureConfiguration } = asyncModuleOptions ?? {};
        const contextName = defaultContextName(asyncModuleOptions?.contextName);

        const { module: settingsModule } = getOrCreateSettingsModule(contextName);
        const { module: featureModule } = await getOrCreateFeatureModule({
          contextName,
          featureModuleName: asyncModuleOptions.featureModuleName,
          featureConfiguration,
        });

        const importsArr =
          !asyncModuleOptions?.imports || Array.isArray(asyncModuleOptions.imports)
            ? asyncModuleOptions?.imports
            : (asyncModuleOptions.imports as any)({
                settingsModule,
                featureModule,
                featureConfiguration,
              } as TLinkOptions);
        const imports = (!nestModuleMetadata.imports ? [] : importsArr) ?? [];

        return {
          module: InternalNestModule,
          providers: [createUniqProvider()],
          imports: [settingsModule, featureModule, ...imports],
          exports: [featureModule],
        };
      };

      const result = getModule();
      Object.assign(result, {
        nestModuleMetadata,
        moduleSettings,
      });
      return result as DynamicNestModuleMetadata<
        TConfigurationModel,
        TStaticConfigurationModel,
        TEnvironmentsModel,
        TStaticEnvironmentsModel,
        TFeatureConfigurationModel,
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
      >;
    }

    static [forFeatureMethodName](
      moduleOptions?: ForFeatureMethodOptions<TFeatureConfigurationModel>
    ): Promise<TDynamicModule> {
      return (this as any)[forFeatureAsyncMethodName]({
        ...moduleOptions,
      });
    }

    static [forRootMethodName](
      moduleOptions?: ForRootMethodOptions<
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
    > {
      return (this as any)[forRootAsyncMethodName]({
        ...moduleOptions,
      });
    }

    static [forRootAsyncMethodName](
      asyncModuleOptions?: ForRootAsyncMethodOptions<
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
    > {
      const { environments } = asyncModuleOptions ?? {};
      const contextName = defaultContextName(asyncModuleOptions?.contextName);
      let staticConfiguration: Partial<TStaticConfigurationModel> | undefined;
      let staticEnvironments: Partial<TStaticEnvironmentsModel> | undefined;

      const loadStaticSettings = async () => {
        if (!moduleSettings[contextName]) {
          moduleSettings[contextName] = {};
        }

        // need for documentation
        if (!moduleSettings[contextName].featureConfiguration) {
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
        if (!moduleSettings[contextName].configuration) {
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
        if (!moduleSettings[contextName].staticConfiguration) {
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
        if (!moduleSettings[contextName].environments) {
          if (nestModuleMetadata.environmentsModel) {
            const obj = await envTransform({
              model: nestModuleMetadata.environmentsModel,
              data: {},
              rootOptions: {
                ...getRootConfigurationValidationOptions({ nestModuleMetadata, asyncModuleOptions, contextName }),
                skipValidation: true,
              },
            });
            moduleSettings[contextName].environments = obj.info;
          }
        }
        if (!moduleSettings[contextName].staticEnvironments) {
          if (nestModuleMetadata.staticEnvironmentsModel) {
            const obj = await envTransform({
              model: nestModuleMetadata.staticEnvironmentsModel,
              data: {},
              rootOptions: {
                ...getRootConfigurationValidationOptions({ nestModuleMetadata, asyncModuleOptions, contextName }),
                skipValidation: true,
              },
            });
            moduleSettings[contextName].staticEnvironments = obj.info;
          }
        }

        if (!staticConfiguration) {
          staticConfiguration = asyncModuleOptions?.staticConfiguration;
          if (nestModuleMetadata.staticConfigurationModel) {
            const obj = await configTransform({
              model: nestModuleMetadata.staticConfigurationModel,
              data: asyncModuleOptions?.staticConfiguration ?? {},
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

        if (!staticEnvironments) {
          staticEnvironments = asyncModuleOptions?.staticEnvironments;
          if (nestModuleMetadata.staticEnvironmentsModel) {
            const obj = await envTransform({
              model: nestModuleMetadata.staticEnvironmentsModel,
              rootOptions: getRootEnvironmentsValidationOptions({
                nestModuleMetadata,
                asyncModuleOptions,
                contextName,
              }),
              data: asyncModuleOptions?.staticEnvironments ?? {},
            });
            moduleSettings[contextName].staticEnvironments = obj.info;
            staticEnvironments = obj.data as any;
          }
        }
      };

      const getModule = async (): Promise<TDynamicModule> => {
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
                if (asyncModuleOptions.configurationStream) {
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
              useValue: asyncModuleOptions.configuration ?? {},
            };
          }
        }

        const { module: settingsModule } = getOrCreateSettingsModule(contextName);
        const { module: featureModule, featureConfiguration } = await getFeatureModule({ contextName });

        const importsArr =
          !nestModuleMetadata.imports || Array.isArray(nestModuleMetadata.imports)
            ? nestModuleMetadata.imports
            : (nestModuleMetadata.imports as any)({
                settingsModule,
                featureModule,
                staticConfiguration,
                staticEnvironments,
                featureConfiguration,
              } as TLinkOptions);
        const imports = (!nestModuleMetadata.imports ? [] : importsArr) ?? [];

        const asyncImportsArr =
          !asyncModuleOptions?.imports || Array.isArray(asyncModuleOptions.imports)
            ? asyncModuleOptions?.imports
            : (asyncModuleOptions.imports as any)({
                settingsModule,
                featureModule,
                staticConfiguration,
                staticEnvironments,
                featureConfiguration,
              } as TLinkOptions);
        const asyncImports = (!asyncModuleOptions?.imports ? [] : asyncImportsArr) ?? [];

        const controllersArr =
          !nestModuleMetadata.controllers || Array.isArray(nestModuleMetadata.controllers)
            ? nestModuleMetadata.controllers
            : (nestModuleMetadata.controllers as any)({
                settingsModule,
                featureModule,
                staticConfiguration,
                staticEnvironments,
                featureConfiguration,
              } as TLinkOptions);
        const controllers = (!nestModuleMetadata.controllers ? [] : controllersArr) ?? [];

        const providersArr =
          !nestModuleMetadata.providers || Array.isArray(nestModuleMetadata.providers)
            ? nestModuleMetadata.providers
            : (nestModuleMetadata.providers as any)({
                settingsModule,
                featureModule,
                staticConfiguration,
                staticEnvironments,
                featureConfiguration,
              } as TLinkOptions);
        const providers = (!nestModuleMetadata.providers ? [] : providersArr) ?? [];

        const exportsArr =
          !nestModuleMetadata.exports || Array.isArray(nestModuleMetadata.exports)
            ? nestModuleMetadata.exports
            : (nestModuleMetadata.exports as any)({
                settingsModule,
                featureModule,
                staticConfiguration,
                staticEnvironments,
                featureConfiguration,
              } as TLinkOptions);
        const exports = (!nestModuleMetadata.exports ? [] : exportsArr) ?? [];

        return <TDynamicModule>{
          module: InternalNestModule,
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
                      if (!moduleSettings[contextName]) {
                        moduleSettings[contextName] = {};
                      }
                      if (!nestModuleMetadata.environmentsModel) {
                        return environments ?? {};
                      }
                      const obj = await envTransform({
                        model: nestModuleMetadata.environmentsModel,
                        rootOptions: getRootEnvironmentsValidationOptions({
                          nestModuleMetadata,
                          asyncModuleOptions,
                          contextName,
                        }),
                        data: environments ?? {},
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
                      if (staticEnvironments && staticEnvironments?.constructor !== Object) {
                        Object.setPrototypeOf(emptyStaticEnvironments, staticEnvironments);
                        Object.assign(emptyStaticEnvironments as any, staticEnvironments);
                      } else {
                        Object.assign(emptyStaticEnvironments as any, staticEnvironments);
                      }
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
                      if (!moduleSettings[contextName]) {
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
                            data: configuration ?? {},
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
                      if (!moduleSettings[contextName]) {
                        moduleSettings[contextName] = {};
                      }
                      if (staticConfiguration && staticConfiguration?.constructor !== Object) {
                        Object.setPrototypeOf(emptyStaticConfiguration, staticConfiguration);
                      }
                      const obj = await configTransform({
                        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                        model: nestModuleMetadata.staticConfigurationModel!,
                        data: staticConfiguration ?? {},
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
          exports: [...exports],
        };
      };
      const result = getModule();
      const nestModuleMetadataMethods = getWrapModuleMetadataMethods();
      Object.assign(result, {
        nestModuleMetadata: {
          ...nestModuleMetadata,
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
                      return await nestModuleMetadata[method]!({
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
        },
        moduleSettings,
        // need to set global options for configurations and environments
        // todo: try remove it
        pathNestModuleMetadata: (newNestModuleMetadata: Partial<NestModuleMetadata>) => {
          Object.assign(nestModuleMetadata, newNestModuleMetadata);
          return nestModuleMetadata;
        },
      });
      return result as DynamicNestModuleMetadata<
        TConfigurationModel,
        TStaticConfigurationModel,
        TEnvironmentsModel,
        TStaticEnvironmentsModel,
        TFeatureConfigurationModel,
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
    }
  }

  return {
    [nestModuleMetadata.moduleName]: Object.assign(InternalNestModule, {
      // need to reports
      // todo: try remove it
      nestModuleMetadata,
    }),
  } as unknown as Record<
    TModuleName,
    Record<
      `${TForFeatureAsyncMethodName}`,
      (asyncModuleOptions?: ForFeatureAsyncMethodOptions<TFeatureConfigurationModel>) => Promise<TDynamicModule>
    > &
      Record<
        `${TForFeatureMethodName}`,
        (moduleOptions?: ForFeatureMethodOptions<TFeatureConfigurationModel>) => Promise<TDynamicModule>
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
          options?: ForRootAsyncMethodOptions<
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
    asyncModuleOptions?: ForRootAsyncMethodOptions<
      TStaticConfigurationModel,
      TConfigurationModel,
      TEnvironmentsModel,
      TStaticEnvironmentsModel
    >;
    contextName: string;
  }): ConfigModelRootOptions | undefined {
    return {
      ...nestModuleMetadata.configurationOptions,
      ...asyncModuleOptions?.configurationOptions,
      ...nestModuleMetadata.globalConfigurationOptions,
      ...(contextName && defaultContextName() !== contextName ? { name: contextName } : {}),
      ...(nestModuleMetadata.globalEnvironmentsOptions?.name
        ? { name: nestModuleMetadata.globalEnvironmentsOptions?.name }
        : {}),
    };
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
    asyncModuleOptions?: ForRootAsyncMethodOptions<
      TStaticConfigurationModel,
      TConfigurationModel,
      TEnvironmentsModel,
      TStaticEnvironmentsModel
    >;
    contextName: string;
  }): ConfigModelRootOptions | undefined {
    return {
      ...nestModuleMetadata.environmentsOptions,
      ...asyncModuleOptions?.environmentsOptions,
      ...nestModuleMetadata.globalConfigurationOptions,
      ...(contextName && defaultContextName() !== contextName ? { name: contextName } : {}),
      ...(nestModuleMetadata.globalEnvironmentsOptions?.name
        ? { name: nestModuleMetadata.globalEnvironmentsOptions?.name }
        : {}),
    };
  }
}
