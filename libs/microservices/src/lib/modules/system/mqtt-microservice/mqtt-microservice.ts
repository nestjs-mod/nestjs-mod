import {
  ConfigModel,
  ConfigModelProperty,
  EnvModel,
  EnvModelProperty,
  NestModuleCategory,
  collectRootNestModules,
  createNestModule,
  getFeatureDotEnvPropertyNameFormatter,
} from '@nestjs-mod/common';
import { LogLevel, Logger, LoggerService, Module } from '@nestjs/common';
import { NestMicroserviceOptions } from '@nestjs/common/interfaces/microservices/nest-microservice-options.interface';
import { NestApplication, NestFactory } from '@nestjs/core';
import { Deserializer, MicroserviceOptions, MqttOptions, Serializer, Transport } from '@nestjs/microservices';
import { QoS } from '@nestjs/microservices/external/mqtt-options.interface';

@EnvModel()
export class MqttMicroserviceEnvironments implements Pick<Required<MqttOptions>['options'], 'url'> {
  @EnvModelProperty({ description: 'Url' })
  url?: string;
}

@ConfigModel()
export class MqttMicroserviceConfiguration
  implements Omit<Required<MqttOptions>['options'] & NestMicroserviceOptions, 'url'>
{
  @ConfigModelProperty({
    description: 'Default logger for application',
  })
  defaultLogger?: Logger | null;

  /**
   * Specifies the logger to use.  Pass `false` to turn off logging.
   */
  @ConfigModelProperty({
    description: 'Specifies the logger to use.  Pass `false` to turn off logging.',
  })
  logger?: LoggerService | LogLevel[] | false;

  /**
   * Whether to abort the process on Error. By default, the process is exited.
   * Pass `false` to override the default behavior. If `false` is passed, Nest will not exit
   * the application and instead will rethrow the exception.
   * @default true
   */
  @ConfigModelProperty({
    description:
      'Whether to abort the process on Error. By default, the process is exited. Pass `false` to override the default behavior. If `false` is passed, Nest will not exit the application and instead will rethrow the exception. @default true',
  })
  abortOnError?: boolean;

  /**
   * If enabled, logs will be buffered until the "Logger#flush" method is called.
   * @default false
   */
  @ConfigModelProperty({
    description: 'If enabled, logs will be buffered until the "Logger#flush" method is called. @default false',
  })
  bufferLogs?: boolean;

  /**
   * If enabled, logs will be automatically flushed and buffer detached when
   * application initialization process either completes or fails.
   * @default true
   */
  @ConfigModelProperty({
    description:
      'If enabled, logs will be automatically flushed and buffer detached when application initialization process either completes or fails. @default true',
  })
  autoFlushLogs?: boolean;

  /**
   * Whether to run application in the preview mode.
   * In the preview mode, providers/controllers are not instantiated & resolved.
   *
   * @default false
   */
  @ConfigModelProperty({
    description:
      'Whether to run application in the preview mode. In the preview mode, providers/controllers are not instantiated & resolved. @default false',
  })
  preview?: boolean;

  /**
   * Whether to generate a serialized graph snapshot.
   *
   * @default false
   */
  @ConfigModelProperty({
    description: 'Whether to generate a serialized graph snapshot. @default false',
  })
  snapshot?: boolean;

  @ConfigModelProperty({
    description: 'Feature name for generate prefix to environments keys',
  })
  featureName?: string;

  @ConfigModelProperty({
    description: 'Microservice project name for generate prefix to environments keys (need only for microservice client)',
  })
  microserviceProjectName?: string;

  // ms

  @ConfigModelProperty({
    description: 'Serializer',
  })
  serializer?: Serializer;

  @ConfigModelProperty({
    description: 'Deserializer',
  })
  deserializer?: Deserializer;

  @ConfigModelProperty({
    description: 'Subscribe options',
  })
  subscribeOptions?: {
    /**
     * The QoS
     */
    qos: QoS;
    nl?: boolean;
    rap?: boolean;
    rh?: number;
  };

  @ConfigModelProperty({
    description: 'User properties',
  })
  userProperties?: Record<string, string | string[]>;
}

export const { MqttNestMicroservice } = createNestModule({
  moduleName: 'MqttNestMicroservice',
  moduleDescription:
    'MQTT NestJS-mod microservice initializer @see https://docs.nestjs.com/microservices/mqtt',
  moduleCategory: NestModuleCategory.system,
  staticConfigurationModel: MqttMicroserviceConfiguration,
  staticEnvironmentsModel: MqttMicroserviceEnvironments,
  wrapForRootAsync: (asyncModuleOptions) => {
    if (!asyncModuleOptions) {
      asyncModuleOptions = {};
    }
    if (asyncModuleOptions.staticConfiguration?.featureName) {
      const FomatterClass = getFeatureDotEnvPropertyNameFormatter(
        `${asyncModuleOptions.staticConfiguration?.featureName}_MQTT`
      );
      Object.assign(asyncModuleOptions, {
        environmentsOptions: {
          propertyNameFormatters: [new FomatterClass()],
          name: `${asyncModuleOptions.staticConfiguration?.featureName}_MQTT`,
        },
      });
    } else {
      const FomatterClass = getFeatureDotEnvPropertyNameFormatter('MQTT');
      Object.assign(asyncModuleOptions, {
        environmentsOptions: {
          propertyNameFormatters: [new FomatterClass()],
          name: 'MQTT',
        },
      });
    }
    return { asyncModuleOptions };
  },
  // creating microservice
  wrapApplication: async ({ app, current, modules }) => {
    if (app) {
      app.connectMicroservice<MicroserviceOptions>(
        {
          transport: Transport.MQTT,
          options: { ...current.staticConfiguration, ...current.staticEnvironments },
        },
        { inheritAppConfig: true }
      );
    } else {
      @Module({
        imports: collectRootNestModules(modules),
      })
      class MicroserviceNestApp {}

      app = (await NestFactory.createMicroservice<MicroserviceOptions>(MicroserviceNestApp, {
        transport: Transport.MQTT,
        options: { ...current.staticConfiguration, ...current.staticEnvironments },
      })) as unknown as NestApplication;
    }
    return app;
  },
});
