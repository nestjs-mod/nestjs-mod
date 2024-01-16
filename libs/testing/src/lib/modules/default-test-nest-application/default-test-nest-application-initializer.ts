import {
  ConfigModel,
  ConfigModelProperty,
  NestModuleCategory,
  NestModuleError,
  WrapApplicationOptions,
  createNestModule,
} from '@nestjs-mod/common';
import { INestApplication } from '@nestjs/common';

@ConfigModel()
class DefaultTestNestApplicationInitializerConfiguration {
  @ConfigModelProperty({
    description: 'Method for additional actions before init',
  })
  preInit?: (
    options: WrapApplicationOptions<INestApplication, DefaultTestNestApplicationInitializerConfiguration>
  ) => Promise<void>;

  @ConfigModelProperty({
    description: 'Method for additional actions after init',
  })
  postInit?: (
    options: WrapApplicationOptions<INestApplication, DefaultTestNestApplicationInitializerConfiguration>
  ) => Promise<void>;
}

export const { DefaultTestNestApplicationInitializer } = createNestModule({
  moduleName: 'DefaultTestNestApplicationInitializer',
  staticConfigurationModel: DefaultTestNestApplicationInitializerConfiguration,
  configurationOptions: { skipValidation: true },
  environmentsOptions: { skipValidation: true },
  preWrapApplication: async ({ current, modules }) => {
    if (modules[current.category]) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      modules[current.category]!.push(
        createNestModule({
          moduleName: 'DefaultTestNestApplicationInitializer',
          moduleDescription: 'Default test NestJS application initializer, no third party utilities required.',
          moduleCategory: NestModuleCategory.system,
          staticConfigurationModel: DefaultTestNestApplicationInitializerConfiguration,
          wrapApplication: async ({ app, current }) => {
            if (app) {
              if (current.staticConfiguration?.preInit) {
                await current.staticConfiguration?.preInit({
                  app,
                  current,
                } as WrapApplicationOptions<INestApplication, DefaultTestNestApplicationInitializerConfiguration>);
              }
              await app.init();
              if (current.staticConfiguration?.postInit) {
                await current.staticConfiguration?.postInit({
                  app,
                  current,
                } as WrapApplicationOptions<INestApplication, DefaultTestNestApplicationInitializerConfiguration>);
              }
              return;
            }
            throw new NestModuleError(
              'Test application listener not started!',
              modules[current.category]?.[current.index]
            );
          },
        }).DefaultTestNestApplicationInitializer.forRootAsync(current.asyncModuleOptions)
      );
    }
  },
});
