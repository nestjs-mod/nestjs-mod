import { INestApplication, Logger } from '@nestjs/common';
import { IsNotEmpty } from 'class-validator';
import { ConfigModel, ConfigModelProperty } from '../../../config-model/decorators';
import { EnvModel, EnvModelProperty } from '../../../env-model/decorators';
import { NestModuleCategory, WrapApplicationOptions } from '../../../nest-module/types';
import { createNestModule } from '../../../nest-module/utils';
import { isInfrastructureMode } from '../../../utils/is-infrastructure';

@EnvModel()
class DefaultNestApplicationListenerEnvironments {
  @EnvModelProperty({ description: 'The port on which to run the server.' })
  @IsNotEmpty()
  port!: number;

  @EnvModelProperty({
    description: 'Hostname on which to listen for incoming packets.',
  })
  hostname?: string;
}

@ConfigModel()
class DefaultNestApplicationListenerConfiguration {
  @ConfigModelProperty({
    description:
      'Mode of start application: init - for run NestJS life cycle, listen -  for full start NestJS application',
    default: 'listen',
  })
  mode?: 'init' | 'listen';

  @ConfigModelProperty({
    description: 'Method for additional actions before listening',
  })
  preListen?: (
    options: WrapApplicationOptions<
      INestApplication,
      DefaultNestApplicationListenerConfiguration,
      DefaultNestApplicationListenerEnvironments
    >
  ) => Promise<void>;

  @ConfigModelProperty({
    description: 'Method for additional actions after listening',
  })
  postListen?: (
    options: WrapApplicationOptions<
      INestApplication,
      DefaultNestApplicationListenerConfiguration,
      DefaultNestApplicationListenerEnvironments
    >
  ) => Promise<void>;

  @ConfigModelProperty({
    description: 'Default logger for application',
  })
  defaultLogger?: Logger | null;

  @ConfigModelProperty({
    description: 'Enable shutdown hooks',
    default: true,
  })
  enableShutdownHooks?: boolean;

  @ConfigModelProperty({
    description: 'Global prefix',
    default: 'api',
  })
  globalPrefix?: string;

  @ConfigModelProperty({
    description:
      'Automatically closes the application in `infrastructure mode` after 30 seconds if the application does not close itself',
    default: true,
  })
  autoCloseInInfrastructureMode?: boolean;

  @ConfigModelProperty({
    description: 'Log application start',
    default: true,
  })
  logApplicationStart?: boolean;
}

export const { DefaultNestApplicationListener } = createNestModule({
  moduleName: 'DefaultNestApplicationListener',
  moduleDescription: 'Default NestJS application listener, no third party utilities required.',
  staticEnvironmentsModel: DefaultNestApplicationListenerEnvironments,
  staticConfigurationModel: DefaultNestApplicationListenerConfiguration,
  globalConfigurationOptions: { skipValidation: true },
  globalEnvironmentsOptions: { skipValidation: true },
  // we use preWrapApplication for create new module and place it to after all modules
  preWrapApplication: async ({ current, modules }) => {
    if (!modules[NestModuleCategory.integrations]) {
      modules[NestModuleCategory.integrations] = [];
    }
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    modules[NestModuleCategory.integrations]!.push(
      createNestModule({
        moduleName: 'DefaultNestApplicationListener',
        moduleDescription: 'Default NestJS application listener, no third party utilities required.',
        staticEnvironmentsModel: DefaultNestApplicationListenerEnvironments,
        staticConfigurationModel: DefaultNestApplicationListenerConfiguration,
        moduleCategory: NestModuleCategory.system,
        // we use postWrapApplication because we need to launch it after enabling all modules
        postWrapApplication: async ({ app, current }) => {
          if (current.staticConfiguration?.preListen) {
            await current.staticConfiguration?.preListen({
              app,
              current,
            } as WrapApplicationOptions<INestApplication, DefaultNestApplicationListenerConfiguration, DefaultNestApplicationListenerEnvironments>);
          }

          if (app && current.staticConfiguration?.mode === 'listen') {
            if (app && current.staticConfiguration?.enableShutdownHooks) {
              app.enableShutdownHooks();
            }
            if (current.staticConfiguration.globalPrefix) {
              app.setGlobalPrefix(current.staticConfiguration.globalPrefix);
            }
            if (current?.staticEnvironments?.port) {
              if (current?.staticEnvironments?.hostname) {
                await app.listen(current.staticEnvironments.port, current.staticEnvironments.hostname);
              } else {
                await app.listen(current.staticEnvironments.port);
              }
            } else {
              (current.staticConfiguration.defaultLogger || new Logger()).warn('Application listener not started!');
            }
          }

          if (app && current.staticConfiguration?.mode === 'init') {
            await app.init();
          }

          if (current.staticConfiguration?.postListen) {
            await current.staticConfiguration?.postListen({
              app,
              current,
            } as WrapApplicationOptions<INestApplication, DefaultNestApplicationListenerConfiguration, DefaultNestApplicationListenerEnvironments>);
          }

          if (current.staticConfiguration?.autoCloseInInfrastructureMode && isInfrastructureMode()) {
            /**
             * When you start the application in infrastructure mode, it should automatically close;
             * if for some reason it does not close, we forcefully close it after 30 seconds.
             */
            setTimeout(() => process.exit(0), 30000);
          }

          if (current.staticConfiguration?.mode === 'listen' && current.staticConfiguration?.logApplicationStart) {
            (current.staticConfiguration.defaultLogger || new Logger()).log(
              `🚀 Application is running on: http://${current.staticEnvironments?.hostname ?? 'localhost'}:${
                current.staticEnvironments?.port
              }/${current.staticConfiguration.globalPrefix || ''}`
            );
          }
        },
      }).DefaultNestApplicationListener.forRootAsync(current.asyncModuleOptions)
    );
  },
});
