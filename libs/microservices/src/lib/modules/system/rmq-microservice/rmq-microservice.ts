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
import { Deserializer, MicroserviceOptions, RmqOptions, Serializer, Transport } from '@nestjs/microservices';
import {
  AmqpConnectionManagerSocketOptions,
  AmqplibQueueOptions,
} from '@nestjs/microservices/external/rmq-url.interface';

@EnvModel()
export class RmqMicroserviceEnvironments {
  // todo: add class transformer and use real type
  // implements Pick<Required<RmqOptions>['options'], 'urls'> {
  @EnvModelProperty({ description: 'Urls' })
  urls?: string;
}

@ConfigModel()
export class RmqMicroserviceConfiguration
  implements Omit<Required<RmqOptions>['options'] & NestMicroserviceOptions, 'urls'>
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

  // ms

  @ConfigModelProperty({
    description: 'Queue',
  })
  queue?: string;

  @ConfigModelProperty({
    description: 'Prefetch count',
  })
  prefetchCount?: number;

  @ConfigModelProperty({
    description: 'Is global prefetch count',
  })
  isGlobalPrefetchCount?: boolean;

  @ConfigModelProperty({
    description: 'Queue options',
  })
  queueOptions?: AmqplibQueueOptions;

  @ConfigModelProperty({
    description: 'Socket options',
  })
  socketOptions?: AmqpConnectionManagerSocketOptions;

  @ConfigModelProperty({
    description: 'No ack',
  })
  noAck?: boolean;

  @ConfigModelProperty({
    description: 'Consumer tag',
  })
  consumerTag?: string;

  @ConfigModelProperty({
    description: 'Serializer',
  })
  serializer?: Serializer;

  @ConfigModelProperty({
    description: 'Deserializer',
  })
  deserializer?: Deserializer;

  @ConfigModelProperty({
    description: 'Reply queue',
  })
  replyQueue?: string;

  @ConfigModelProperty({
    description: 'Persistent',
  })
  persistent?: boolean;

  @ConfigModelProperty({
    description: 'Headers',
  })
  headers?: Record<string, string>;

  @ConfigModelProperty({
    description: 'No assert',
  })
  noAssert?: boolean;

  /**
   * Maximum number of connection attempts.
   * Applies only to the consumer configuration.
   * -1 === infinite
   * @default -1
   */
  @ConfigModelProperty({
    description: 'Maximum number of connection attempts, applies only to the consumer configuration (-1 - infinite)',
  })
  maxConnectionAttempts?: number;
}

export const { RmqNestMicroservice } = createNestModule({
  moduleName: 'RmqNestMicroservice',
  moduleDescription:
    'RabbitMQ NestJS-mod microservice initializer, no third party utilities required @see https://docs.nestjs.com/microservices/rabbitmq',
  moduleCategory: NestModuleCategory.system,
  staticConfigurationModel: RmqMicroserviceConfiguration,
  staticEnvironmentsModel: RmqMicroserviceEnvironments,
  wrapForRootAsync: (asyncModuleOptions) => {
    if (!asyncModuleOptions) {
      asyncModuleOptions = {};
    }
    if (asyncModuleOptions.staticConfiguration?.featureName) {
      const FomatterClass = getFeatureDotEnvPropertyNameFormatter(
        `${asyncModuleOptions.staticConfiguration?.featureName}_RMQ`
      );
      Object.assign(asyncModuleOptions, {
        environmentsOptions: {
          propertyNameFormatters: [new FomatterClass()],
          name: `${asyncModuleOptions.staticConfiguration?.featureName}_RMQ`,
        },
      });
    } else {
      const FomatterClass = getFeatureDotEnvPropertyNameFormatter('RMQ');
      Object.assign(asyncModuleOptions, {
        environmentsOptions: {
          propertyNameFormatters: [new FomatterClass()],
          name: 'RMQ',
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
          transport: Transport.RMQ,
          options: { ...current.staticConfiguration, urls: current.staticEnvironments?.urls?.split(',') ?? [] },
        },
        { inheritAppConfig: true }
      );
    } else {
      @Module({
        imports: collectRootNestModules(modules),
      })
      class MicroserviceNestApp {}

      app = (await NestFactory.createMicroservice<MicroserviceOptions>(MicroserviceNestApp, {
        transport: Transport.RMQ,
        options: { ...current.staticConfiguration, urls: current.staticEnvironments?.urls?.split(',') ?? [] },
      })) as unknown as NestApplication;
    }
    return app;
  },
});
