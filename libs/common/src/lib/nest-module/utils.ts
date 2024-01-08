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
  function defaultName(name?: string) {
    return name ?? 'default';
  }

  function getModuleInfoToken(name?: string): InjectionToken {
    return `${moduleName}_${defaultName(name)}_module_info`;
  }

  function getFeatureConfigurationsToken(name?: string): InjectionToken {
    return `${moduleName}_${defaultName(name)}_feature_configurations`;
  }

  function getConfigurationLoaderToken(name?: string): InjectionToken {
    return `${moduleName}_${defaultName(name)}_configuration_loader`;
  }

  function getStaticConfigurationLoaderToken(name?: string): InjectionToken {
    return `${moduleName}_${defaultName(name)}_static_configuration_loader`;
  }

  function getEnvironmentsLoaderToken(name?: string): InjectionToken {
    return `${moduleName}_${defaultName(name)}_environments_loader`;
  }

  function getStaticEnvironmentsLoaderToken(name?: string): InjectionToken {
    return `${moduleName}_${defaultName(name)}_static_environments_loader`;
  }
  function getAsyncConfigurationToken(name?: string) {
    return `${moduleName}_${defaultName(name)}_options_async_loader`;
  }

  function getServiceToken(targetName: any, name?: string) {
    return `${moduleName}_${defaultName(name)}_service_${targetName}`;
  }

  function createUniqProvider() {
    const uniqValue = randomUUID();
    return {
      provide: `${uniqValue}_uniq_provider`,
      useValue: uniqValue,
    };
  }

  return {
    defaultName,
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
  const InjectFeatures = (name?: string): any =>
    Inject(getFeatureConfigurationsToken(name));

  // TODO: not worked with ReturnType<typeof Inject>
  const InjectModuleInfo = (name?: string): any =>
    Inject(getModuleInfoToken(name));

  // TODO: not worked with ReturnType<typeof Inject>
  const InjectService =
    (service: any, name?: any): any =>
      (target: object, key: string, index: number) => {
        const token = getServiceToken(service.name, name);
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
    defaultName,
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

  const getFeatureProvider = (name?: string) => {
    if (!featuresByName[defaultName(name)]) {
      featuresByName[defaultName(name)] = [];
    }
    return {
      provide: getFeatureConfigurationsToken(name),
      useValue: new Proxy(featuresByName[defaultName(name)], {
        get(target, prop) {
          if (prop === 'length') {
            return featuresByName[defaultName(name)].length;
          }
          if (prop !== undefined) {
            return featuresByName[defaultName(name)][prop as unknown as number];
          }
          return target[prop];
        },
      }),
    };
  };

  const getModuleInfoProvider = (name?: string) => {
    if (!moduleInfoByName[defaultName(name)]) {
      moduleInfoByName[defaultName(name)] = {
        nestModuleMetadata: nestModuleMetadata as NestModuleMetadata,
      };
    }
    return {
      provide: getModuleInfoToken(name),
      useValue: moduleInfoByName[defaultName(name)],
    };
  };

  const getSettingsModule = (name: string) => {
    @Module({
      providers: [
        ...(nestModuleMetadata.configurationModel
          ? [nestModuleMetadata.configurationModel]
          : []),
        ...(nestModuleMetadata.staticConfigurationModel
          ? [nestModuleMetadata.staticConfigurationModel]
          : []),
        getFeatureProvider(name),
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
        getFeatureConfigurationsToken(name),
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

  const getOrCreateSettingsModule = (name?: string) => {
    name = defaultName(name);
    if (!settingsModulesByName[name]) {
      settingsModulesByName[name] = getSettingsModule(name);
    }
    return { name, module: settingsModulesByName[name] };
  };

  const getSharedModule = (name: string) => {
    const { module: settingsModule } = getOrCreateSettingsModule(name);
    const sharedProviders = nestModuleMetadata.sharedProviders ?? [];
    @Module({
      imports: [settingsModule],
      providers: [
        getModuleInfoProvider(name),
        getModuleInfoProvider(),
        ...sharedProviders,
        ...sharedProviders.map((sharedService) =>
          'name' in sharedService
            ? {
              provide: getServiceToken(sharedService.name, name),
              useExisting: sharedService,
            }
            : sharedService
        ),
      ],
      exports: [
        getModuleInfoToken(name),
        getModuleInfoToken(),
        ...sharedProviders,
        ...sharedProviders.map((sharedService) =>
          'name' in sharedService
            ? getServiceToken(sharedService.name, name)
            : sharedService
        ),
      ],
    })
    class SharedModule { }
    return SharedModule;
  };

  const getOrCreateFeatureModule = async (
    name?: string,
    featureConfiguration?: TFeatureConfigurationModel
  ) => {
    name = defaultName(name);
    if (!modulesByName[name]) {
      modulesByName[name] = getSharedModule(name);
    }
    if (featureConfiguration) {
      if (!featuresByName[name]) {
        featuresByName[name] = [];
      }
      if (nestModuleMetadata.featureConfigurationModel) {
        const obj = await configTransform({
          model: nestModuleMetadata.featureConfigurationModel,
          data: featureConfiguration as any,
          rootOptions: {
            ...nestModuleMetadata.configurationOptions,
          },
        });
        if (!moduleInfoByName[defaultName(name)].featureConfigurations) {
          moduleInfoByName[defaultName(name)].featureConfigurations = [];
        }
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        moduleInfoByName[defaultName(name)].featureConfigurations!.push(
          obj.info
        );
        featuresByName[name].push(obj.data as TFeatureConfigurationModel);
      } else {
        featuresByName[name].push(featureConfiguration);
      }
    }
    return { name, module: modulesByName[name] };
  };

  @Module({})
  class InternalNestModule {
    static [forFeatureMethodName](
      name?: string | TFeatureConfigurationModel,
      featureConfiguration?: TFeatureConfigurationModel
    ): Promise<DynamicModule> {
      const getModule = async () => {
        if (typeof name !== 'string') {
          featureConfiguration = name;
          name = defaultName();
        } else {
          name = defaultName(name);
        }
        const { module: settingsModule } = getOrCreateSettingsModule(name);
        const { module: featureModule } = await getOrCreateFeatureModule(
          name,
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
      const { environments, name } = asyncModuleOptions ?? {};

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
            if (!moduleInfoByName[defaultName(name)]) {
              moduleInfoByName[defaultName(name)] = {
                nestModuleMetadata: nestModuleMetadata as NestModuleMetadata,
              };
            }
            moduleInfoByName[defaultName(name)].staticConfiguration = obj.info;
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
                name,
              },
              data: asyncModuleOptions?.staticEnvironments ?? {},
            });
            if (!moduleInfoByName[defaultName(name)]) {
              moduleInfoByName[defaultName(name)] = {
                nestModuleMetadata: nestModuleMetadata as NestModuleMetadata,
              };
            }
            moduleInfoByName[defaultName(name)].staticEnvironments = obj.info;
            staticEnvironments = obj.data as any;
          }
        }
      };

      const getModule = async (): Promise<DynamicModule> => {
        await loadStaticSettings();
        const asyncConfigurationProviderLoaderToken =
          getAsyncConfigurationToken(name);

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

        const { module: settingsModule } = getOrCreateSettingsModule(name);
        const { module: featureModule } = await getOrCreateFeatureModule(name);

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
                  provide: getEnvironmentsLoaderToken(name),
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
                        name,
                      },
                      data: environments ?? {},
                    });
                    if (!moduleInfoByName[defaultName(name)]) {
                      moduleInfoByName[defaultName(name)] = {
                        nestModuleMetadata:
                          nestModuleMetadata as NestModuleMetadata,
                      };
                    }
                    moduleInfoByName[defaultName(name)].environments =
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
                  provide: getStaticEnvironmentsLoaderToken(name),
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
                  provide: getConfigurationLoaderToken(name),
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
                        if (!moduleInfoByName[defaultName(name)]) {
                          moduleInfoByName[defaultName(name)] = {
                            nestModuleMetadata:
                              nestModuleMetadata as NestModuleMetadata,
                          };
                        }
                        moduleInfoByName[defaultName(name)].configuration =
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
                        if (!moduleInfoByName[defaultName(name)]) {
                          moduleInfoByName[defaultName(name)] = {
                            nestModuleMetadata:
                              nestModuleMetadata as NestModuleMetadata,
                          };
                        }
                        moduleInfoByName[defaultName(name)].configuration =
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
                  provide: getStaticConfigurationLoaderToken(name),
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
                      if (!moduleInfoByName[defaultName(name)]) {
                        moduleInfoByName[defaultName(name)] = {
                          nestModuleMetadata:
                            nestModuleMetadata as NestModuleMetadata,
                        };
                      }
                      moduleInfoByName[
                        defaultName(name)
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
                      if (!moduleInfoByName[defaultName(name)]) {
                        moduleInfoByName[defaultName(name)] = {
                          nestModuleMetadata:
                            nestModuleMetadata as NestModuleMetadata,
                        };
                      }
                      moduleInfoByName[
                        defaultName(name)
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
        name?: string | TFeatureConfigurationModel,
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
