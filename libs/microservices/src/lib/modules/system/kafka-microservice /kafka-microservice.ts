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
import {
  Deserializer,
  KafkaOptions,
  KafkaParserConfig,
  MicroserviceOptions,
  Serializer,
  Transport,
} from '@nestjs/microservices';
import {
  ConsumerConfig,
  ConsumerRunConfig,
  ConsumerSubscribeTopics,
  KafkaConfig,
  ProducerConfig,
  ProducerRecord,
} from '@nestjs/microservices/external/kafka.interface';

@EnvModel()
export class KafkaMicroserviceEnvironments {
  // todo: add transformer
  // implements Pick<Required<KafkaOptions['options']['client']>, 'brokers'> {
  @EnvModelProperty({ description: 'Brokers' })
  brokers?: string;
}

@ConfigModel()
export class KafkaMicroserviceConfiguration
  implements Omit<Required<KafkaOptions>['options'] & NestMicroserviceOptions, 'host' | 'port'>
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
    description: 'Serializer',
  })
  serializer?: Serializer;

  @ConfigModelProperty({
    description: 'Deserializer',
  })
  deserializer?: Deserializer;

  /**
   * Defaults to `"-server"` on server side and `"-client"` on client side.
   */
  @ConfigModelProperty({
    description: 'Defaults to `"-server"` on server side and `"-client"` on client side',
  })
  postfixId?: string;

  @ConfigModelProperty({
    description: 'Client',
  })
  client?: KafkaConfig;

  @ConfigModelProperty({
    description: 'Consumer config',
  })
  consumer?: ConsumerConfig;

  @ConfigModelProperty({
    description: 'Consumer run config',
  })
  run?: Omit<ConsumerRunConfig, 'eachBatch' | 'eachMessage'>;

  @ConfigModelProperty({
    description: 'Subscribe',
  })
  subscribe?: Omit<ConsumerSubscribeTopics, 'topics'>;

  @ConfigModelProperty({
    description: 'Producer config',
  })
  producer?: ProducerConfig;

  @ConfigModelProperty({
    description: 'Send producer record',
  })
  send?: Omit<ProducerRecord, 'topic' | 'messages'>;

  @ConfigModelProperty({
    description: 'Kafka parser config',
  })
  parser?: KafkaParserConfig;

  @ConfigModelProperty({
    description: 'Producer only mode',
  })
  producerOnlyMode?: boolean;
}

export const { KafkaNestMicroservice } = createNestModule({
  moduleName: 'KafkaNestMicroservice',
  moduleDescription:
    'Kafka NestJS-mod microservice initializer, no third party utilities required @see https://docs.nestjs.com/microservices/kafka',
  moduleCategory: NestModuleCategory.system,
  staticConfigurationModel: KafkaMicroserviceConfiguration,
  staticEnvironmentsModel: KafkaMicroserviceEnvironments,
  wrapForRootAsync: (asyncModuleOptions) => {
    if (!asyncModuleOptions) {
      asyncModuleOptions = {};
    }
    if (asyncModuleOptions.staticConfiguration?.featureName) {
      const FomatterClass = getFeatureDotEnvPropertyNameFormatter(
        `${asyncModuleOptions.staticConfiguration?.featureName}_KAFKA`
      );
      Object.assign(asyncModuleOptions, {
        environmentsOptions: {
          propertyNameFormatters: [new FomatterClass()],
          name: `${asyncModuleOptions.staticConfiguration?.featureName}_KAFKA`,
        },
      });
    } else {
      const FomatterClass = getFeatureDotEnvPropertyNameFormatter('KAFKA');
      Object.assign(asyncModuleOptions, {
        environmentsOptions: {
          propertyNameFormatters: [new FomatterClass()],
          name: 'KAFKA',
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
          transport: Transport.KAFKA,
          options: {
            ...current.staticConfiguration,
            ...current.staticEnvironments,
            client: {
              ...current.staticConfiguration?.client,
              brokers: current.staticEnvironments?.brokers?.split(',') || [],
            },
          },
        },
        { inheritAppConfig: true }
      );
    } else {
      @Module({
        imports: collectRootNestModules(modules),
      })
      class MicroserviceNestApp {}

      app = (await NestFactory.createMicroservice<MicroserviceOptions>(MicroserviceNestApp, {
        transport: Transport.KAFKA,
        options: {
          ...current.staticConfiguration,
          ...current.staticEnvironments,
          client: {
            ...current.staticConfiguration?.client,
            brokers: current.staticEnvironments?.brokers?.split(',') || [],
          },
        },
      })) as unknown as NestApplication;
    }
    return app;
  },
});
