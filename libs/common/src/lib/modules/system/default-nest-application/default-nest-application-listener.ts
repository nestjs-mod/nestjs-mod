import { INestApplication, Logger } from '@nestjs/common';
import { ConfigModel, ConfigModelProperty } from '../../../config-model/decorators';
import { EnvModel, EnvModelProperty } from '../../../env-model/decorators';
import { NumberTransformer } from '../../../env-model/transformers/number.transformer';
import { NestModuleCategory, WrapApplicationOptions } from '../../../nest-module/types';
import { createNestModule } from '../../../nest-module/utils';
import { isInfrastructureMode } from '../../../utils/is-infrastructure';

@EnvModel()
export class DefaultNestApplicationListenerEnvironments {
  @EnvModelProperty({
    description: 'The port on which to run the server.',
    default: 3000,
    transform: new NumberTransformer(),
  })
  port?: number;

  @EnvModelProperty({
    description: 'Hostname on which to listen for incoming packets.',
    hidden: true,
  })
  hostname?: string;
}

@ConfigModel()
export class DefaultNestApplicationListenerConfiguration {
  @ConfigModelProperty({
    description:
      'Mode of start application: init - for run NestJS life cycle, listen -  for full start NestJS application',
    default: 'listen',
  })
  mode?: 'init' | 'listen' | 'silent';

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
      'Timeout seconds for automatically closes the application in `infrastructure mode` if the application does not close itself (zero - disable)',
    transform: new NumberTransformer(),
  })
  autoCloseTimeoutInInfrastructureMode?: number;

  @ConfigModelProperty({
    description: 'Log application start',
    default: true,
  })
  logApplicationStart?: boolean;
}

export const { DefaultNestApplicationListener } = createNestModule({
  moduleName: 'DefaultNestApplicationListener',
  moduleDescription: 'Default NestJS application listener.',
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
        moduleDescription: 'Default NestJS application listener.',
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
            if (current.staticConfiguration?.enableShutdownHooks) {
              app.enableShutdownHooks();
            }
            if (typeof app.setGlobalPrefix === 'function' && current.staticConfiguration.globalPrefix) {
              app.setGlobalPrefix(current.staticConfiguration.globalPrefix);
            }
            if (((typeof app?.getMicroservices === 'function' && app?.getMicroservices()) || []).length > 0) {
              await app.startAllMicroservices();
            }
            if (current?.staticEnvironments?.port) {
              if (current?.staticEnvironments?.hostname) {
                await app.listen(current.staticEnvironments.port, current.staticEnvironments.hostname);
              } else {
                await app.listen(current.staticEnvironments.port);
              }
            } else {
              if (typeof app?.getMicroservices === 'function') {
                (current.staticConfiguration.defaultLogger || new Logger()).warn('Application listener not started!');
              }
            }
          }

          if (app && (current.staticConfiguration?.mode === 'init' || current.staticConfiguration?.mode === 'silent')) {
            if (
              current.staticConfiguration?.mode !== 'silent' &&
              ((typeof app?.getMicroservices === 'function' && app?.getMicroservices()) || []).length > 0
            ) {
              await app.startAllMicroservices();
            }
            await app.init();
          }

          if (current.staticConfiguration?.postListen) {
            await current.staticConfiguration?.postListen({
              app,
              current,
            } as WrapApplicationOptions<INestApplication, DefaultNestApplicationListenerConfiguration, DefaultNestApplicationListenerEnvironments>);
          }

          if (current.staticConfiguration?.mode === 'listen' && current.staticConfiguration?.logApplicationStart) {
            if (typeof app?.getMicroservices === 'function') {
              (current.staticConfiguration.defaultLogger || new Logger()).log(
                `🚀 Application is running on: http://${current.staticEnvironments?.hostname ?? 'localhost'}:${
                  current.staticEnvironments?.port
                }/${current.staticConfiguration.globalPrefix || ''}`
              );
            } else {
              (current.staticConfiguration.defaultLogger || new Logger()).log(`🚀 All microservices is running`);
            }
          }

          if (current.staticConfiguration?.autoCloseTimeoutInInfrastructureMode && isInfrastructureMode()) {
            /**
             * When you start the application in infrastructure mode, it should automatically close;
             * if for some reason it does not close, we forcefully close it after XX seconds.
             */
            setTimeout(() => process.exit(0), current.staticConfiguration?.autoCloseTimeoutInInfrastructureMode * 1000);
          }
        },
      }).DefaultNestApplicationListener.forRootAsync(current.asyncModuleOptions)
    );
  },
});
