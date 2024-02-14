import {
  ConfigModel,
  ConfigModelProperty,
  EnvModel,
  EnvModelProperty,
  NestModuleCategory,
  WrapApplicationOptions,
  createNestModule,
} from '@nestjs-mod/common';
import { Logger } from '@nestjs/common';
import { NestFastifyApplication } from '@nestjs/platform-fastify';

@EnvModel()
export class FastifyNestApplicationListenerEnvironments {
  @EnvModelProperty({ description: 'The port on which to run the server.', default: 3000 })
  port?: number;

  @EnvModelProperty({
    description: 'Hostname on which to listen for incoming packets.',
    default: '0.0.0.0',
  })
  hostname?: string;
}

@ConfigModel()
export class FastifyNestApplicationListenerConfiguration {
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
      NestFastifyApplication,
      FastifyNestApplicationListenerConfiguration,
      FastifyNestApplicationListenerEnvironments
    >
  ) => Promise<void>;

  @ConfigModelProperty({
    description: 'Method for additional actions after listening',
  })
  postListen?: (
    options: WrapApplicationOptions<
      NestFastifyApplication,
      FastifyNestApplicationListenerConfiguration,
      FastifyNestApplicationListenerEnvironments
    >
  ) => Promise<void>;

  @ConfigModelProperty({
    description: 'Fastify logger for application',
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
    description: 'Log application start',
    default: true,
  })
  logApplicationStart?: boolean;
}

export const { FastifyNestApplicationListener } = createNestModule({
  moduleName: 'FastifyNestApplicationListener',
  moduleDescription: 'Fastify NestJS application listener, no third party utilities required.',
  staticEnvironmentsModel: FastifyNestApplicationListenerEnvironments,
  staticConfigurationModel: FastifyNestApplicationListenerConfiguration,
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
        moduleName: 'FastifyNestApplicationListener',
        moduleDescription: 'Fastify NestJS application listener, no third party utilities required.',
        staticEnvironmentsModel: FastifyNestApplicationListenerEnvironments,
        staticConfigurationModel: FastifyNestApplicationListenerConfiguration,
        moduleCategory: NestModuleCategory.system,
        // we use postWrapApplication because we need to launch it after enabling all modules
        postWrapApplication: async ({ app, current }) => {
          if (current.staticConfiguration?.preListen) {
            await current.staticConfiguration?.preListen({
              app,
              current,
            } as WrapApplicationOptions<NestFastifyApplication, FastifyNestApplicationListenerConfiguration, FastifyNestApplicationListenerEnvironments>);
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

          if (app && current.staticConfiguration?.mode === 'init') {
            if (((typeof app?.getMicroservices === 'function' && app?.getMicroservices()) || []).length > 0) {
              await app.startAllMicroservices();
            }
            await app.init();
          }

          if (current.staticConfiguration?.postListen) {
            await current.staticConfiguration?.postListen({
              app,
              current,
            } as WrapApplicationOptions<NestFastifyApplication, FastifyNestApplicationListenerConfiguration, FastifyNestApplicationListenerEnvironments>);
          }

          if (current.staticConfiguration?.mode === 'listen' && current.staticConfiguration?.logApplicationStart) {
            if (typeof app?.getMicroservices === 'function') {
              (current.staticConfiguration.defaultLogger || new Logger()).log(
                `🚀 Application is running on: http://${current.staticEnvironments?.hostname ?? 'localhost'}:${
                  current.staticEnvironments?.port
                }/${current.staticConfiguration.globalPrefix || ''}`
              );
            } else {
              (current.staticConfiguration.defaultLogger || new Logger()).log(`🚀 Microservice is running`);
            }
          }
        },
      }).FastifyNestApplicationListener.forRootAsync(current.asyncModuleOptions)
    );
  },
});
