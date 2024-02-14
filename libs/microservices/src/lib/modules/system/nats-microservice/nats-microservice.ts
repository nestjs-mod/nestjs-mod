/* eslint-disable @typescript-eslint/no-explicit-any */
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
import { Deserializer, MicroserviceOptions, NatsOptions, Serializer, Transport } from '@nestjs/microservices';

@EnvModel() // todo: add  | 'servers'>
export class NatsMicroserviceEnvironments implements Pick<Required<NatsOptions>['options'], 'name' | 'user' | 'pass'> {
  @EnvModelProperty({ description: 'Name' })
  name?: string;

  @EnvModelProperty({ description: 'User' })
  user?: string;

  @EnvModelProperty({ description: 'Pass' })
  pass?: string;

  @EnvModelProperty({ description: 'Servers' })
  servers?: string;
}

@ConfigModel()
export class NatsMicroserviceConfiguration
  implements Omit<Required<NatsOptions>['options'] & NestMicroserviceOptions, 'name' | 'user' | 'pass' | 'servers'>
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
    description: 'Headers',
  })
  headers?: Record<string, string>;

  @ConfigModelProperty({
    description: 'Authenticator',
  })
  authenticator?: any;

  @ConfigModelProperty({
    description: 'Debug',
  })
  debug?: boolean;

  @ConfigModelProperty({
    description: 'Ignore cluster updates',
  })
  ignoreClusterUpdates?: boolean;

  @ConfigModelProperty({
    description: 'Inbox prefix',
  })
  inboxPrefix?: string;

  @ConfigModelProperty({
    description: 'Encoding',
  })
  encoding?: string;

  @ConfigModelProperty({
    description: 'Max ping out',
  })
  maxPingOut?: number;

  @ConfigModelProperty({
    description: 'Max reconnect attempts',
  })
  maxReconnectAttempts?: number;

  @ConfigModelProperty({
    description: 'Reconnect time wait',
  })
  reconnectTimeWait?: number;

  @ConfigModelProperty({
    description: 'Reconnect jitter',
  })
  reconnectJitter?: number;

  @ConfigModelProperty({
    description: 'Reconnect jitter TLS',
  })
  reconnectJitterTLS?: number;

  @ConfigModelProperty({
    description: 'Reconnect delay handler',
  })
  reconnectDelayHandler?: any;

  @ConfigModelProperty({
    description: 'Nkey',
  })
  nkey?: any;

  @ConfigModelProperty({
    description: 'Reconnect',
  })
  reconnect?: boolean;

  @ConfigModelProperty({
    description: 'Pedantic',
  })
  pedantic?: boolean;

  @ConfigModelProperty({
    description: 'TLS',
  })
  tls?: any;

  @ConfigModelProperty({
    description: 'Queue',
  })
  queue?: string;

  @ConfigModelProperty({
    description: 'Serializer',
  })
  serializer?: Serializer;

  @ConfigModelProperty({
    description: 'Deserializer',
  })
  deserializer?: Deserializer;

  @ConfigModelProperty({
    description: 'User JWT',
  })
  userJWT?: string;

  @ConfigModelProperty({
    description: 'Nonce signer',
  })
  nonceSigner?: any;

  @ConfigModelProperty({
    description: 'User creds',
  })
  userCreds?: any;

  @ConfigModelProperty({
    description: 'Use old request style',
  })
  useOldRequestStyle?: boolean;

  @ConfigModelProperty({
    description: 'Ping interval',
  })
  pingInterval?: number;

  @ConfigModelProperty({
    description: 'Preserve buffers',
  })
  preserveBuffers?: boolean;

  @ConfigModelProperty({
    description: 'Wait on first connect',
  })
  waitOnFirstConnect?: boolean;

  @ConfigModelProperty({
    description: 'Verbose',
  })
  verbose?: boolean;

  @ConfigModelProperty({
    description: 'No echo',
  })
  noEcho?: boolean;

  @ConfigModelProperty({
    description: 'No randomize',
  })
  noRandomize?: boolean;

  @ConfigModelProperty({
    description: 'Timeout',
  })
  timeout?: number;

  @ConfigModelProperty({
    description: 'Token',
  })
  token?: string;

  @ConfigModelProperty({
    description: 'Yield time',
  })
  yieldTime?: number;

  @ConfigModelProperty({
    description: 'Token handler',
  })
  tokenHandler?: any;
}

export const { NatsNestMicroservice } = createNestModule({
  moduleName: 'NatsNestMicroservice',
  moduleDescription:
    'Nats NestJS-mod microservice initializer, no third party utilities required @see https://docs.nestjs.com/microservices/nats',
  moduleCategory: NestModuleCategory.system,
  staticConfigurationModel: NatsMicroserviceConfiguration,
  staticEnvironmentsModel: NatsMicroserviceEnvironments,
  wrapForRootAsync: (asyncModuleOptions) => {
    if (!asyncModuleOptions) {
      asyncModuleOptions = {};
    }
    if (asyncModuleOptions.staticConfiguration?.featureName) {
      const FomatterClass = getFeatureDotEnvPropertyNameFormatter(
        `${asyncModuleOptions.staticConfiguration?.featureName}_NATS`
      );
      Object.assign(asyncModuleOptions, {
        environmentsOptions: {
          propertyNameFormatters: [new FomatterClass()],
          name: `${asyncModuleOptions.staticConfiguration?.featureName}_NATS`,
        },
      });
    } else {
      const FomatterClass = getFeatureDotEnvPropertyNameFormatter('NATS');
      Object.assign(asyncModuleOptions, {
        environmentsOptions: {
          propertyNameFormatters: [new FomatterClass()],
          name: 'NATS',
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
          transport: Transport.NATS,
          options: {
            ...current.staticConfiguration,
            ...current.staticEnvironments,
            servers: current.staticEnvironments?.servers?.split(','),
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
        transport: Transport.NATS,
        options: {
          ...current.staticConfiguration,
          ...current.staticEnvironments,
          servers: current.staticEnvironments?.servers?.split(','),
        },
      })) as unknown as NestApplication;
    }
    return app;
  },
});
