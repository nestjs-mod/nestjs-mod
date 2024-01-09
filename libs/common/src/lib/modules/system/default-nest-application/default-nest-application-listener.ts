import { INestApplication } from '@nestjs/common';
import { IsNotEmpty } from 'class-validator';
import {
  ConfigModel,
  ConfigModelProperty,
} from '../../../config-model/decorators';
import { EnvModel, EnvModelProperty } from '../../../env-model/decorators';
import { NestModuleError } from '../../../nest-module/errors';
import {
  NestModuleCategory,
  WrapApplicationOptions,
} from '../../../nest-module/types';
import { createNestModule } from '../../../nest-module/utils';

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
}

export const { DefaultNestApplicationListener } = createNestModule({
  moduleName: 'DefaultNestApplicationListener',
  staticEnvironmentsModel: DefaultNestApplicationListenerEnvironments,
  staticConfigurationModel: DefaultNestApplicationListenerConfiguration,
  preWrapApplication: async ({ current, modules }) => {
    if (modules[current.category]) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      modules[current.category]!.push(
        createNestModule({
          moduleName: 'DefaultNestApplicationListener',
          moduleDescription:
            'Default NestJS application listener, no third party utilities required.',
          staticEnvironmentsModel: DefaultNestApplicationListenerEnvironments,
          staticConfigurationModel: DefaultNestApplicationListenerConfiguration,
          moduleCategory: NestModuleCategory.system,
          wrapApplication: async ({ app, current }) => {
            if (app && current?.staticEnvironments?.port) {
              if (current.staticEnvironments?.hostname) {
                if (current.staticConfiguration?.preListen) {
                  await current.staticConfiguration?.preListen({
                    app,
                    current,
                  } as WrapApplicationOptions<INestApplication,
                    DefaultNestApplicationListenerConfiguration,
                    DefaultNestApplicationListenerEnvironments>);
                }
                if (current.staticConfiguration?.mode === 'listen') {
                  await app.listen(
                    current.staticEnvironments.port,
                    current.staticEnvironments.hostname
                  );
                }
                if (current.staticConfiguration?.mode === 'init') {
                  await app.init();
                }
                if (current.staticConfiguration?.postListen) {
                  await current.staticConfiguration?.postListen({
                    app,
                    current,
                  } as WrapApplicationOptions<INestApplication,
                    DefaultNestApplicationListenerConfiguration,
                    DefaultNestApplicationListenerEnvironments>);
                }
                return;
              }
              if (current.staticConfiguration?.preListen) {
                await current.staticConfiguration?.preListen({
                  app,
                  current,
                } as WrapApplicationOptions<INestApplication,
                  DefaultNestApplicationListenerConfiguration,
                  DefaultNestApplicationListenerEnvironments>);
              }
              if (current.staticConfiguration?.mode === 'listen') {
                await app.listen(current.staticEnvironments.port);
              }
              if (current.staticConfiguration?.mode === 'init') {
                await app.init();
              }
              if (current.staticConfiguration?.postListen) {
                await current.staticConfiguration?.postListen({
                  app,
                  current,
                } as WrapApplicationOptions<INestApplication,
                  DefaultNestApplicationListenerConfiguration,
                  DefaultNestApplicationListenerEnvironments>);
              }
              return;
            }
            throw new NestModuleError(
              'Application listener not started!',
              modules[current.category]?.[current.index]
            );
          },
        }).DefaultNestApplicationListener.forRootAsync({
          ...current.asyncModuleOptions,
          staticConfiguration: { ...current.asyncModuleOptions.staticConfiguration, mode: current.asyncModuleOptions.staticConfiguration?.mode ?? 'listen' }
        })
      );
    }
  },
});
