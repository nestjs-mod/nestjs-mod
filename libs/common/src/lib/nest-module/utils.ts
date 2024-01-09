/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  DynamicModule,
  INestApplication,
  Inject,
  InjectionToken,
  Module,
  OptionalFactoryDependency,
  Provider,
  Type,
} from '@nestjs/common';

import { randomUUID } from 'crypto';
import { configTransform } from '../config-model/utils';
import { envTransform } from '../env-model/utils';
import {
  DEFAULT_FOR_FEATURE_METHOD_NAME,
  DEFAULT_FOR_ROOT_ASYNC_METHOD_NAME,
  DEFAULT_FOR_ROOT_METHOD_NAME,
  DynamicNestModuleMetadata,
  ExportsWithStaticOptionsResponse,
  ForRootAsyncMethodOptions,
  ForRootMethodOptions,
  ImportsWithStaticOptionsResponse,
  NestModuleMetadata,
  TModuleInfoByName,
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

  function getModuleInfoToken(contextName?: string): InjectionToken {
    return `${moduleName}_${defaultContextName(contextName)}_module_info`;
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
    getModuleInfoToken,
  };
}

export function getNestModuleDecorators({
  moduleName,
}: {
  moduleName: string;
}) {
  const { getFeatureConfigurationsToken, getServiceToken, getModuleInfoToken } =
    getNestModuleInternalUtils({
      moduleName,
    });

  // TODO: not worked with ReturnType<typeof Inject>
  const InjectFeatures = (contextName?: string): any =>
    Inject(getFeatureConfigurationsToken(contextName));

  // TODO: not worked with ReturnType<typeof Inject>
  const InjectModuleInfo = (contextName?: string): any =>
    Inject(getModuleInfoToken(contextName));

  // TODO: not worked with ReturnType<typeof Inject>
  const InjectService =
    (service: any, contextName?: any): any =>
      (target: object, key: string, index: number) => {
        const token = getServiceToken(service.name, contextName);
        // TODO: not worked :( const type = Reflect.getMetadata('design:type', target, key);
        return Inject(token)(target, key, index);
      };

  return {
    InjectFeatures,
    InjectService,
    InjectModuleInfo,
  };
}

///////////////////////////

export function createNestModule<
  TStaticConfigurationModel = never,
  TConfigurationModel = never,
  TEnvironmentsModel = never,
  TStaticEnvironmentsModel = never,
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
  TFeatureConfigurationModel = never,
  TModuleName extends string = string
>(
  nestModuleMetadata: NestModuleMetadata<
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
  >
) {
  const forRootMethodName =
    nestModuleMetadata.forRootMethodName ?? DEFAULT_FOR_ROOT_METHOD_NAME;
  const forRootAsyncMethodName =
    nestModuleMetadata.forRootAsyncMethodName ??
    DEFAULT_FOR_ROOT_ASYNC_METHOD_NAME;
  const forFeatureMethodName =
    nestModuleMetadata.forFeatureMethodName ?? DEFAULT_FOR_FEATURE_METHOD_NAME;

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
    getModuleInfoToken,
  } = getNestModuleInternalUtils({
    moduleName: nestModuleMetadata.moduleName,
  });

  const moduleInfoByName: Record<string, TModuleInfoByName> = {};

  const modulesByName: Record<string, any> = {};
  const featuresByName: Record<string, TFeatureConfigurationModel[]> = {};
  const settingsModulesByName: Record<string, any> = {};

  const getFeatureProvider = (contextName?: string) => {
    if (!featuresByName[defaultContextName(contextName)]) {
      featuresByName[defaultContextName(contextName)] = [];
    }
    return {
      provide: getFeatureConfigurationsToken(contextName),
      useValue: new Proxy(featuresByName[defaultContextName(contextName)], {
        get(target, prop) {
          if (prop === 'length') {
            return featuresByName[defaultContextName(contextName)].length;
          }
          if (prop !== undefined) {
            return featuresByName[defaultContextName(contextName)][prop as unknown as number];
          }
          return target[prop];
        },
      }),
    };
  };

  const getModuleInfoProvider = (contextName?: string) => {
    if (!moduleInfoByName[defaultContextName(contextName)]) {
      moduleInfoByName[defaultContextName(contextName)] = {
        nestModuleMetadata: nestModuleMetadata as NestModuleMetadata,
      };
    }
    return {
      provide: getModuleInfoToken(contextName),
      useValue: moduleInfoByName[defaultContextName(contextName)],
    };
  };

  const getSettingsModule = (contextName: string) => {
    @Module({
      providers: [
        ...(nestModuleMetadata.configurationModel
          ? [nestModuleMetadata.configurationModel]
          : []),
        ...(nestModuleMetadata.staticConfigurationModel
          ? [nestModuleMetadata.staticConfigurationModel]
          : []),
        getFeatureProvider(contextName),
        getFeatureProvider(),
        ...(nestModuleMetadata.environmentsModel
          ? [nestModuleMetadata.environmentsModel]
          : []),
        ...(nestModuleMetadata.staticEnvironmentsModel
          ? [nestModuleMetadata.staticEnvironmentsModel]
          : []),
      ],
      exports: [
        ...(nestModuleMetadata.configurationModel
          ? [nestModuleMetadata.configurationModel]
          : []),
        ...(nestModuleMetadata.staticConfigurationModel
          ? [nestModuleMetadata.staticConfigurationModel]
          : []),
        getFeatureConfigurationsToken(contextName),
        getFeatureConfigurationsToken(),
        ...(nestModuleMetadata.environmentsModel
          ? [nestModuleMetadata.environmentsModel]
          : []),
        ...(nestModuleMetadata.staticEnvironmentsModel
          ? [nestModuleMetadata.staticEnvironmentsModel]
          : []),
      ],
    })
    class SettingsModule { }
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
    const sharedProviders = nestModuleMetadata.sharedProviders ?? [];
    @Module({
      imports: [settingsModule],
      providers: [
        getModuleInfoProvider(contextName),
        getModuleInfoProvider(),
        ...sharedProviders,
        ...sharedProviders.map((sharedService) =>
          'name' in sharedService
            ? {
              provide: getServiceToken(sharedService.name, contextName),
              useExisting: sharedService,
            }
            : sharedService
        ),
      ],
      exports: [
        getModuleInfoToken(contextName),
        getModuleInfoToken(),
        ...sharedProviders,
        ...sharedProviders.map((sharedService) =>
          'name' in sharedService
            ? getServiceToken(sharedService.name, contextName)
            : sharedService
        ),
      ],
    })
    class SharedModule { }
    return SharedModule;
  };

  const getOrCreateFeatureModule = async (
    contextName?: string,
    featureConfiguration?: TFeatureConfigurationModel
  ) => {
    contextName = defaultContextName(contextName);
    if (!modulesByName[contextName]) {
      modulesByName[contextName] = getSharedModule(contextName);
    }
    if (featureConfiguration) {
      if (!featuresByName[contextName]) {
        featuresByName[contextName] = [];
      }
      if (nestModuleMetadata.featureConfigurationModel) {
        const obj = await configTransform({
          model: nestModuleMetadata.featureConfigurationModel,
          data: featureConfiguration as any,
          rootOptions: {
            ...nestModuleMetadata.configurationOptions,
          },
        });
        if (!moduleInfoByName[defaultContextName(contextName)].featureConfigurations) {
          moduleInfoByName[defaultContextName(contextName)].featureConfigurations = [];
        }
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        moduleInfoByName[defaultContextName(contextName)].featureConfigurations!.push(
          obj.info
        );
        featuresByName[contextName].push(obj.data as TFeatureConfigurationModel);
      } else {
        featuresByName[contextName].push(featureConfiguration);
      }
    }
    return { contextName, module: modulesByName[contextName] };
  };

  @Module({})
  class InternalNestModule {
    static [forFeatureMethodName](
      contextName?: string | TFeatureConfigurationModel,
      featureConfiguration?: TFeatureConfigurationModel
    ): Promise<DynamicModule> {
      const getModule = async () => {
        if (typeof contextName !== 'string') {
          featureConfiguration = contextName;
          contextName = defaultContextName();
        } else {
          contextName = defaultContextName(contextName);
        }
        const { module: settingsModule } = getOrCreateSettingsModule(contextName);
        const { module: featureModule } = await getOrCreateFeatureModule(
          contextName,
          featureConfiguration
        );
        return {
          module: InternalNestModule,
          providers: [createUniqProvider()],
          imports: [settingsModule, featureModule],
          exports: [featureModule],
        };
      };

      const result = getModule();
      Object.assign(result, {
        nestModuleMetadata,
        modulesByName: moduleInfoByName,
      });
      return result;
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
      TForRootMethodName,
      TForRootAsyncMethodName,
      TForFeatureMethodName,
      TImportsWithStaticOptions,
      TControllersWithStaticOptions,
      TProvidersWithStaticOptions,
      TExportsWithStaticOptions,
      TNestApplication,
      TFeatureConfigurationModel
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
      TForRootMethodName,
      TForRootAsyncMethodName,
      TForFeatureMethodName,
      TImportsWithStaticOptions,
      TControllersWithStaticOptions,
      TProvidersWithStaticOptions,
      TExportsWithStaticOptions,
      TNestApplication,
      TFeatureConfigurationModel
    > {
      const { environments, contextName } = asyncModuleOptions ?? {};

      let staticConfiguration: Partial<TStaticConfigurationModel> | undefined;
      let staticEnvironments: Partial<TStaticEnvironmentsModel> | undefined;

      const loadStaticSettings = async () => {
        if (!staticConfiguration) {
          staticConfiguration = asyncModuleOptions?.staticConfiguration;

          if (nestModuleMetadata.staticConfigurationModel) {
            const obj = await configTransform({
              model: nestModuleMetadata.staticConfigurationModel,
              data: asyncModuleOptions?.staticConfiguration ?? {},
              rootOptions: {
                ...nestModuleMetadata.configurationOptions,
                ...asyncModuleOptions?.configurationOptions,
              },
            });
            if (!moduleInfoByName[defaultContextName(contextName)]) {
              moduleInfoByName[defaultContextName(contextName)] = {
                nestModuleMetadata: nestModuleMetadata as NestModuleMetadata,
              };
            }
            moduleInfoByName[defaultContextName(contextName)].staticConfiguration = obj.info;
            staticConfiguration = obj.data as any;
          }
        }

        if (!staticEnvironments) {
          staticEnvironments = asyncModuleOptions?.staticEnvironments;

          if (nestModuleMetadata.staticEnvironmentsModel) {
            const obj = await envTransform({
              model: nestModuleMetadata.staticEnvironmentsModel,
              rootOptions: {
                ...nestModuleMetadata.environmentsOptions,
                ...asyncModuleOptions?.environmentsOptions,
                ...(contextName ? { name: contextName, } : {})
              },
              data: asyncModuleOptions?.staticEnvironments ?? {},
            });
            if (!moduleInfoByName[defaultContextName(contextName)]) {
              moduleInfoByName[defaultContextName(contextName)] = {
                nestModuleMetadata: nestModuleMetadata as NestModuleMetadata,
              };
            }
            moduleInfoByName[defaultContextName(contextName)].staticEnvironments = obj.info;
            staticEnvironments = obj.data as any;
          }
        }
      };

      const getModule = async (): Promise<DynamicModule> => {
        await loadStaticSettings();
        const asyncConfigurationProviderLoaderToken =
          getAsyncConfigurationToken(contextName);

        let asyncOptionsProviderLoader: Provider = {
          provide: asyncConfigurationProviderLoaderToken,
          useValue: {},
        };

        if (asyncModuleOptions) {
          if ('configurationClass' in asyncModuleOptions) {
            asyncOptionsProviderLoader = {
              provide: asyncConfigurationProviderLoaderToken,
              useClass:
                asyncModuleOptions.configurationClass as Type<TConfigurationModel>,
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
              useFactory: asyncModuleOptions.configurationFactory as (
                ...args: any[]
              ) => TConfigurationModel,
              inject:
                'inject' in asyncModuleOptions
                  ? (asyncModuleOptions.inject as (
                    | InjectionToken
                    | OptionalFactoryDependency
                  )[])
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
        const { module: featureModule } = await getOrCreateFeatureModule(contextName);

        const importsArr =
          !nestModuleMetadata.imports ||
            Array.isArray(nestModuleMetadata.imports)
            ? nestModuleMetadata.imports
            : (nestModuleMetadata.imports as any)(
              staticConfiguration,
              staticEnvironments
            );
        const imports = (!nestModuleMetadata.imports ? [] : importsArr) ?? [];

        const controllersArr =
          !nestModuleMetadata.controllers ||
            Array.isArray(nestModuleMetadata.controllers)
            ? nestModuleMetadata.controllers
            : (nestModuleMetadata.controllers as any)(
              staticConfiguration,
              staticEnvironments
            );
        const controllers =
          (!nestModuleMetadata.controllers ? [] : controllersArr) ?? [];

        const providersArr =
          !nestModuleMetadata.providers ||
            Array.isArray(nestModuleMetadata.providers)
            ? nestModuleMetadata.providers
            : (nestModuleMetadata.providers as any)(
              staticConfiguration,
              staticEnvironments
            );
        const providers =
          (!nestModuleMetadata.providers ? [] : providersArr) ?? [];

        const exportsArr =
          !nestModuleMetadata.exports ||
            Array.isArray(nestModuleMetadata.exports)
            ? nestModuleMetadata.exports
            : (nestModuleMetadata.exports as any)(
              staticConfiguration,
              staticEnvironments
            );
        const exports = (!nestModuleMetadata.exports ? [] : exportsArr) ?? [];

        return <DynamicModule>{
          module: InternalNestModule,
          imports: [settingsModule, featureModule, ...imports],
          providers: [
            createUniqProvider(),
            asyncOptionsProviderLoader,
            ...(nestModuleMetadata.environmentsModel
              ? [
                {
                  provide: getEnvironmentsLoaderToken(contextName),
                  useFactory: async (
                    emptyConfigOptions: TEnvironmentsModel
                  ) => {
                    if (!nestModuleMetadata.environmentsModel) {
                      return environments ?? {};
                    }
                    const obj = await envTransform({
                      model: nestModuleMetadata.environmentsModel,
                      rootOptions: {
                        ...nestModuleMetadata.environmentsOptions,
                        ...asyncModuleOptions?.environmentsOptions,
                        ...(contextName ? { name: contextName, } : {})
                      },
                      data: environments ?? {},
                    });
                    if (!moduleInfoByName[defaultContextName(contextName)]) {
                      moduleInfoByName[defaultContextName(contextName)] = {
                        nestModuleMetadata:
                          nestModuleMetadata as NestModuleMetadata,
                      };
                    }
                    moduleInfoByName[defaultContextName(contextName)].environments =
                      obj.info;
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
                  useFactory: async (
                    emptyStaticEnvironments: TStaticEnvironmentsModel
                  ) => {
                    if (
                      staticEnvironments &&
                      staticEnvironments?.constructor !== Object
                    ) {
                      Object.setPrototypeOf(
                        emptyStaticEnvironments,
                        staticEnvironments
                      );
                      Object.assign(
                        emptyStaticEnvironments as any,
                        staticEnvironments
                      );
                    } else {
                      Object.assign(
                        emptyStaticEnvironments as any,
                        staticEnvironments
                      );
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
                    configuration: TConfigurationModel
                  ) => {
                    if (
                      configuration &&
                      configuration?.constructor !== Object
                    ) {
                      Object.setPrototypeOf(
                        emptyConfiguration,
                        configuration
                      );
                      if (nestModuleMetadata.configurationModel) {
                        const obj = await configTransform({
                          model: nestModuleMetadata.configurationModel,
                          data: configuration,
                          rootOptions: {
                            ...nestModuleMetadata.configurationOptions,
                            ...asyncModuleOptions?.configurationOptions,
                          },
                        });
                        if (!moduleInfoByName[defaultContextName(contextName)]) {
                          moduleInfoByName[defaultContextName(contextName)] = {
                            nestModuleMetadata:
                              nestModuleMetadata as NestModuleMetadata,
                          };
                        }
                        moduleInfoByName[defaultContextName(contextName)].configuration =
                          obj.info;
                        Object.assign(emptyConfiguration as any, obj.data);
                      } else {
                        Object.assign(
                          emptyConfiguration as any,
                          configuration
                        );
                      }
                    } else {
                      if (nestModuleMetadata.configurationModel) {
                        const obj = await configTransform({
                          model: nestModuleMetadata.configurationModel,
                          data: configuration ?? {},
                          rootOptions: {
                            ...nestModuleMetadata.configurationOptions,
                            ...asyncModuleOptions?.configurationOptions,
                          },
                        });
                        if (!moduleInfoByName[defaultContextName(contextName)]) {
                          moduleInfoByName[defaultContextName(contextName)] = {
                            nestModuleMetadata:
                              nestModuleMetadata as NestModuleMetadata,
                          };
                        }
                        moduleInfoByName[defaultContextName(contextName)].configuration =
                          obj.info;
                        Object.assign(emptyConfiguration as any, obj.data);
                      } else {
                        Object.assign(
                          emptyConfiguration as any,
                          configuration
                        );
                      }
                    }
                  },
                  inject: [
                    nestModuleMetadata.configurationModel,
                    asyncConfigurationProviderLoaderToken,
                  ],
                },
              ]
              : []),
            ...(nestModuleMetadata.staticConfigurationModel
              ? [
                {
                  provide: getStaticConfigurationLoaderToken(contextName),
                  useFactory: async (
                    emptyStaticConfiguration: TStaticConfigurationModel
                  ) => {
                    if (
                      staticConfiguration &&
                      staticConfiguration?.constructor !== Object
                    ) {
                      Object.setPrototypeOf(
                        emptyStaticConfiguration,
                        staticConfiguration
                      );
                      const obj = await configTransform({
                        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                        model: nestModuleMetadata.staticConfigurationModel!,
                        data: staticConfiguration,
                        rootOptions: {
                          ...nestModuleMetadata.configurationOptions,
                          ...asyncModuleOptions?.configurationOptions,
                        },
                      });
                      if (!moduleInfoByName[defaultContextName(contextName)]) {
                        moduleInfoByName[defaultContextName(contextName)] = {
                          nestModuleMetadata:
                            nestModuleMetadata as NestModuleMetadata,
                        };
                      }
                      moduleInfoByName[
                        defaultContextName(contextName)
                      ].staticConfiguration = obj.info;
                      Object.assign(
                        emptyStaticConfiguration as any,
                        obj.data
                      );
                    } else {
                      const obj = await configTransform({
                        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                        model: nestModuleMetadata.staticConfigurationModel!,
                        data: staticConfiguration ?? {},
                        rootOptions: {
                          ...nestModuleMetadata.configurationOptions,
                          ...asyncModuleOptions?.configurationOptions,
                        },
                      });
                      if (!moduleInfoByName[defaultContextName(contextName)]) {
                        moduleInfoByName[defaultContextName(contextName)] = {
                          nestModuleMetadata:
                            nestModuleMetadata as NestModuleMetadata,
                        };
                      }
                      moduleInfoByName[
                        defaultContextName(contextName)
                      ].staticConfiguration = obj.info;
                      Object.assign(
                        emptyStaticConfiguration as any,
                        obj.data
                      );
                    }
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
                    } as WrapApplicationOptions<TNestApplication,
                      TStaticConfigurationModel,
                      TStaticEnvironmentsModel,
                      TConfigurationModel,
                      TEnvironmentsModel>);
                  },
                }
                : {}
            )
            .reduce((all, cur) => ({ ...all, ...cur }), {}),
        },
        moduleInfo: moduleInfoByName,
      });
      return result;
    }
  }

  return {
    [nestModuleMetadata.moduleName]: Object.assign(InternalNestModule, {
      nestModuleMetadata,
    }),
  } as unknown as Record<
    TModuleName,
    Record<
      `${TForFeatureMethodName}`,
      (
        contextName?: string | TFeatureConfigurationModel,
        featureConfiguration?: TFeatureConfigurationModel
      ) => Promise<DynamicModule>
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
      ) => Promise<DynamicModule>
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
      ) => Promise<DynamicModule>
    >
  >;
}
