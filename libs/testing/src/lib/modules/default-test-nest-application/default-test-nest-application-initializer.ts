import {
  ConfigModel,
  ConfigModelProperty,
  NestModuleCategory,
  WrapApplicationOptions,
  createNestModule,
} from '@nestjs-mod/common';
import { ConsoleLogger, INestApplication, Logger } from '@nestjs/common';

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

  @ConfigModelProperty({
    description: 'Default logger for test application',
    default: new ConsoleLogger(),
  })
  defaultLogger?: Logger | null;
}

export const { DefaultTestNestApplicationInitializer } = createNestModule({
  moduleName: 'DefaultTestNestApplicationInitializer',
  staticConfigurationModel: DefaultTestNestApplicationInitializerConfiguration,
  configurationOptions: { skipValidation: true },
  environmentsOptions: { skipValidation: true },
  // we use preWrapApplication for create new module and place it to after all modules
  preWrapApplication: async ({ current, modules }) => {
    if (!modules[NestModuleCategory.integrations]) {
      modules[NestModuleCategory.integrations] = [];
    }
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    modules[NestModuleCategory.integrations].push(
      createNestModule({
        moduleName: 'DefaultTestNestApplicationInitializer',
        moduleDescription: 'Default test NestJS application initializer, no third party utilities required.',
        moduleCategory: NestModuleCategory.system,
        staticConfigurationModel: DefaultTestNestApplicationInitializerConfiguration,
        // we use postWrapApplication because we need to launch it after enabling all modules
        postWrapApplication: async ({ app, current }) => {
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
          } else {
            current.staticConfiguration?.defaultLogger?.warn('Test application listener not started!');
          }
        },
      }).DefaultTestNestApplicationInitializer.forRootAsync(current.asyncModuleOptions)
    );
  },
});
