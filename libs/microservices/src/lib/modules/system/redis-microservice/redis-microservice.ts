/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  ConfigModel,
  ConfigModelProperty,
  EnvModel,
  EnvModelProperty,
  NestModuleCategory,
  NumberTransformer,
  StringTransformer,
  collectRootNestModules,
  createNestModule,
  getFeatureDotEnvPropertyNameFormatter,
} from '@nestjs-mod/common';
import { LogLevel, Logger, LoggerService, Module } from '@nestjs/common';
import { NestMicroserviceOptions } from '@nestjs/common/interfaces/microservices/nest-microservice-options.interface';
import { NestApplication, NestFactory } from '@nestjs/core';
import { Deserializer, MicroserviceOptions, RedisOptions, Serializer, Transport } from '@nestjs/microservices';
import { ConnectionOptions } from 'tls';

@EnvModel()
export class RedisMicroserviceEnvironments implements Pick<Required<RedisOptions>['options'], 'host' | 'port'> {
  @EnvModelProperty({ description: 'Host', hidden: true, transform: new StringTransformer() })
  host?: string;

  @EnvModelProperty({
    description: 'Port',
    default: 6379,
    transform: new NumberTransformer(),
  })
  port?: number;

  /**
   * If set, client will send AUTH command with the value of this option as the first argument when connected.
   * This is supported since Redis 6.
   */
  @EnvModelProperty({
    description:
      'If set, client will send AUTH command with the value of this option as the first argument when connected, this is supported since Redis 6',
    hidden: true,
    transform: new StringTransformer(),
  })
  username?: string;

  /**
   * If set, client will send AUTH command with the value of this option when connected.
   */
  @EnvModelProperty({
    description: 'If set, client will send AUTH command with the value of this option when connected',
    transform: new StringTransformer(),
  })
  password?: string;

  /**
   * Database index to use.
   *
   * @default 0
   */
  @EnvModelProperty({
    default: 0,
    description: 'Database index to use',
    hidden: true,
    transform: new NumberTransformer(),
  })
  db?: number;
}

@ConfigModel()
export class RedisMicroserviceConfiguration
  implements
    Omit<Required<RedisOptions>['options'] & NestMicroserviceOptions, 'host' | 'port' | 'username' | 'password'>
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
    description:
      'Microservice project name for generate prefix to environments keys (need only for microservice client)',
  })
  microserviceProjectName?: string;

  // ms

  @ConfigModelProperty({
    description: 'Retry attempts',
  })
  retryAttempts?: number;

  @ConfigModelProperty({
    description: 'Retry delay',
  })
  retryDelay?: number;

  /**
   * Use `psubscribe`/`pmessage` to enable wildcards in the patterns
   */
  @ConfigModelProperty({
    description: 'Wildcards',
  })
  wildcards?: boolean;

  @ConfigModelProperty({
    description: 'Serializer',
  })
  serializer?: Serializer;

  @ConfigModelProperty({
    description: 'Deserializer',
  })
  deserializer?: Deserializer;

  @ConfigModelProperty({
    description: 'Connector',
  })
  Connector?: any;

  @ConfigModelProperty({
    description: 'Retry strategy',
  })
  retryStrategy?: (times: number) => number | void | null;

  /**
   * If a command does not return a reply within a set number of milliseconds,
   * a "Command timed out" error will be thrown.
   */
  @ConfigModelProperty({
    description: 'Command timeout',
  })
  commandTimeout?: number;

  /**
   * Enable/disable keep-alive functionality.
   * @link https://nodejs.org/api/net.html#socketsetkeepaliveenable-initialdelay
   * @default 0
   */
  @ConfigModelProperty({
    description: 'Keep alive',
  })
  keepAlive?: number;

  /**
   * Enable/disable the use of Nagle's algorithm.
   * @link https://nodejs.org/api/net.html#socketsetnodelaynodelay
   * @default true
   */
  @ConfigModelProperty({
    description: 'No delay',
  })
  noDelay?: boolean;

  /**
   * Set the name of the connection to make it easier to identity the connection
   * in client list.
   * @link https://redis.io/commands/client-setname
   */
  @ConfigModelProperty({
    description: 'Connection name',
  })
  connectionName?: string;

  /**
   * When the client reconnects, channels subscribed in the previous connection will be
   * resubscribed automatically if `autoResubscribe` is `true`.
   * @default true
   */
  @ConfigModelProperty({
    description: 'Auto resubscribe',
  })
  autoResubscribe?: boolean;

  /**
   * Whether or not to resend unfulfilled commands on reconnect.
   * Unfulfilled commands are most likely to be blocking commands such as `brpop` or `blpop`.
   * @default true
   */
  @ConfigModelProperty({
    description: 'Auto resend unfulfilled commands',
  })
  autoResendUnfulfilledCommands?: boolean;

  /**
   * Whether or not to reconnect on certain Redis errors.
   * This options by default is `null`, which means it should never reconnect on Redis errors.
   * You can pass a function that accepts an Redis error, and returns:
   * - `true` or `1` to trigger a reconnection.
   * - `false` or `0` to not reconnect.
   * - `2` to reconnect and resend the failed command (who triggered the error) after reconnection.
   * @example
   * ```js
   * const redis = new Redis({
   *   reconnectOnError(err) {
   *     const targetError = "READONLY";
   *     if (err.message.includes(targetError)) {
   *       // Only reconnect when the error contains "READONLY"
   *       return true; // or `return 1;`
   *     }
   *   },
   * });
   * ```
   * @default null
   */
  @ConfigModelProperty({
    description: 'Reconnect on error',
  })
  reconnectOnError?: ((err: Error) => boolean | 1 | 2) | null;

  /**
   * @default false
   */
  @ConfigModelProperty({
    description: 'Read only',
  })
  readOnly?: boolean;

  /**
   * When enabled, numbers returned by Redis will be converted to JavaScript strings instead of numbers.
   * This is necessary if you want to handle big numbers (above `Number.MAX_SAFE_INTEGER` === 2^53).
   * @default false
   */
  @ConfigModelProperty({
    description: 'String numbers',
  })
  stringNumbers?: boolean;

  /**
   * How long the client will wait before killing a socket due to inactivity during initial connection.
   * @default 10000
   */
  @ConfigModelProperty({
    description: 'Connect timeout',
  })
  connectTimeout?: number;

  /**
   * This option is used internally when you call `redis.monitor()` to tell Redis
   * to enter the monitor mode when the connection is established.
   *
   * @default false
   */
  @ConfigModelProperty({
    description: 'Monitor',
  })
  monitor?: boolean;

  /**
   * The commands that don't get a reply due to the connection to the server is lost are
   * put into a queue and will be resent on reconnect (if allowed by the `retryStrategy` option).
   * This option is used to configure how many reconnection attempts should be allowed before
   * the queue is flushed with a `MaxRetriesPerRequestError` error.
   * Set this options to `null` instead of a number to let commands wait forever
   * until the connection is alive again.
   *
   * @default 20
   */
  @ConfigModelProperty({
    description: 'Max retries per request',
  })
  maxRetriesPerRequest?: number | null;

  /**
   * @default 10000
   */
  @ConfigModelProperty({
    description: 'Max loading retry time',
  })
  maxLoadingRetryTime?: number;

  /**
   * @default false
   */
  @ConfigModelProperty({
    description: 'Enable auto pipelining',
  })
  enableAutoPipelining?: boolean;

  /**
   * @default []
   */
  @ConfigModelProperty({
    description: 'Auto pipelining ignored commands',
  })
  autoPipeliningIgnoredCommands?: string[];

  @ConfigModelProperty({
    description: 'Offline queue',
  })
  offlineQueue?: boolean;

  @ConfigModelProperty({
    description: 'Command queue',
  })
  commandQueue?: boolean;

  /**
   *
   * By default, if the connection to Redis server has not been established, commands are added to a queue
   * and are executed once the connection is "ready" (when `enableReadyCheck` is true, "ready" means
   * the Redis server has loaded the database from disk, otherwise means the connection to the Redis
   * server has been established). If this option is false, when execute the command when the connection
   * isn't ready, an error will be returned.
   *
   * @default true
   */
  @ConfigModelProperty({
    description: 'Enable offline queue',
  })
  enableOfflineQueue?: boolean;

  /**
   * The client will sent an INFO command to check whether the server is still loading data from the disk (
   * which happens when the server is just launched) when the connection is established, and only wait until
   * the loading process is finished before emitting the `ready` event.
   *
   * @default true
   */
  @ConfigModelProperty({
    description:
      'The client will sent an INFO command to check whether the server is still loading data from the disk ( which happens when the server is just launched) when the connection is established, and only wait until the loading process is finished before emitting the `ready` event (default: true).',
  })
  enableReadyCheck?: boolean;

  /**
   * When a Redis instance is initialized, a connection to the server is immediately established. Set this to
   * true will delay the connection to the server until the first command is sent or `redis.connect()` is called
   * explicitly.
   *
   * @default false
   */
  @ConfigModelProperty({
    description:
      'When a Redis instance is initialized, a connection to the server is immediately established. Set this to true will delay the connection to the server until the first command is sent or `redis.connect()` is called explicitly (default: false).',
  })
  lazyConnect?: boolean;

  /**
   * @default undefined
   */
  @ConfigModelProperty({
    description: 'Scripts',
  })
  scripts?: Record<
    string,
    {
      lua: string;
      numberOfKeys?: number;
      readOnly?: boolean;
    }
  >;

  @ConfigModelProperty({
    description: 'Key prefix',
  })
  keyPrefix?: string;

  @ConfigModelProperty({
    description: 'Show friendly error stack',
  })
  showFriendlyErrorStack?: boolean;

  @ConfigModelProperty({
    description: 'Disconnect timeout',
  })
  disconnectTimeout?: number;

  @ConfigModelProperty({
    description: 'Connection options',
  })
  tls?: ConnectionOptions;

  /**
   * Master group name of the Sentinel
   */
  @ConfigModelProperty({
    description: 'Master group name of the Sentinel',
  })
  name?: string;

  /**
   * @default "master"
   */
  @ConfigModelProperty({
    description: 'Role',
  })
  role?: 'master' | 'slave';

  @ConfigModelProperty({
    description: 'Sentinel username',
  })
  sentinelUsername?: string;

  @ConfigModelProperty({
    description: 'Sentinel password',
  })
  sentinelPassword?: string;

  @ConfigModelProperty({
    description: 'Sentinels',
  })
  sentinels?: Array<Partial<any>>;

  @ConfigModelProperty({
    description: 'Sentinel retry strategy',
  })
  sentinelRetryStrategy?: (retryAttempts: number) => number | void | null;

  @ConfigModelProperty({
    description: 'Sentinel reconnect strategy',
  })
  sentinelReconnectStrategy?: (retryAttempts: number) => number | void | null;

  @ConfigModelProperty({
    description: 'Preferred slaves',
  })
  preferredSlaves?: any;

  @ConfigModelProperty({
    description: 'Sentinel command timeout',
  })
  sentinelCommandTimeout?: number;

  @ConfigModelProperty({
    description: 'Enable TLS for sentinel mode',
  })
  enableTLSForSentinelMode?: boolean;

  @ConfigModelProperty({
    description: 'Sentinel TLS',
  })
  sentinelTLS?: ConnectionOptions;

  @ConfigModelProperty({
    description: 'Nat map',
  })
  natMap?: any;

  @ConfigModelProperty({
    description: 'Update sentinels',
  })
  updateSentinels?: boolean;

  /**
   * @default 10
   */
  @ConfigModelProperty({
    description: 'Sentinel max connections',
  })
  sentinelMaxConnections?: number;

  @ConfigModelProperty({
    description: 'Failover detector',
  })
  failoverDetector?: boolean;
}

export const { RedisNestMicroservice } = createNestModule({
  moduleName: 'RedisNestMicroservice',
  moduleDescription: 'Redis NestJS-mod microservice initializer @see https://docs.nestjs.com/microservices/redis',
  moduleCategory: NestModuleCategory.system,
  staticConfigurationModel: RedisMicroserviceConfiguration,
  staticEnvironmentsModel: RedisMicroserviceEnvironments,
  wrapForRootAsync: (asyncModuleOptions) => {
    if (!asyncModuleOptions) {
      asyncModuleOptions = {};
    }
    if (asyncModuleOptions.staticConfiguration?.featureName) {
      const FomatterClass = getFeatureDotEnvPropertyNameFormatter(
        `${asyncModuleOptions.staticConfiguration?.featureName}_REDIS`
      );
      Object.assign(asyncModuleOptions, {
        environmentsOptions: {
          propertyNameFormatters: [new FomatterClass()],
          name: `${asyncModuleOptions.staticConfiguration?.featureName}_REDIS`,
        },
      });
    } else {
      const FomatterClass = getFeatureDotEnvPropertyNameFormatter('REDIS');
      Object.assign(asyncModuleOptions, {
        environmentsOptions: {
          propertyNameFormatters: [new FomatterClass()],
          name: 'REDIS',
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
          transport: Transport.REDIS,
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
        transport: Transport.REDIS,
        options: { ...current.staticConfiguration, ...current.staticEnvironments },
      })) as unknown as NestApplication;
    }
    return app;
  },
});
