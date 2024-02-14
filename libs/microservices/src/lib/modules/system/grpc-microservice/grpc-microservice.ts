/* eslint-disable @typescript-eslint/ban-types */
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
import { GrpcOptions, MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ChannelOptions } from '@nestjs/microservices/external/grpc-options.interface';
import { IsNotEmpty } from 'class-validator';

@EnvModel()
export class GrpcMicroserviceEnvironments implements Pick<Required<GrpcOptions>['options'], 'url'> {
  @EnvModelProperty({ description: 'Url' })
  url?: string;
}

@ConfigModel()
export class GrpcMicroserviceConfiguration
  implements Omit<Required<GrpcOptions>['options'] & NestMicroserviceOptions, 'url'>
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
    description: 'Max send message length',
  })
  maxSendMessageLength?: number;

  @ConfigModelProperty({
    description: 'Max receive message length',
  })
  maxReceiveMessageLength?: number;

  @ConfigModelProperty({
    description: 'Max metadata size',
  })
  maxMetadataSize?: number;

  @ConfigModelProperty({
    description: 'Keepalive',
  })
  keepalive?: {
    keepaliveTimeMs?: number;
    keepaliveTimeoutMs?: number;
    keepalivePermitWithoutCalls?: number;
    http2MaxPingsWithoutData?: number;
    http2MinTimeBetweenPingsMs?: number;
    http2MinPingIntervalWithoutDataMs?: number;
    http2MaxPingStrikes?: number;
  };

  @ConfigModelProperty({
    description: 'Channel options',
  })
  channelOptions?: ChannelOptions;

  @ConfigModelProperty({
    description: 'Credentials',
  })
  credentials?: any;

  @ConfigModelProperty({
    description: 'Proto path',
  })
  protoPath?: string[];

  @ConfigModelProperty({
    description: 'Package',
  })
  @IsNotEmpty()
  package!: string[];

  @ConfigModelProperty({
    description: 'Proto Loader',
  })
  protoLoader?: string;

  @ConfigModelProperty({
    description: 'Package definition',
  })
  packageDefinition?: any;

  @ConfigModelProperty({
    description: 'GracefulShutdown',
  })
  gracefulShutdown?: boolean;

  @ConfigModelProperty({
    description: 'Loader',
  })
  loader?: {
    keepCase?: boolean;
    alternateCommentMode?: boolean;
    longs?: Function;
    enums?: Function;
    bytes?: Function;
    defaults?: boolean;
    arrays?: boolean;
    objects?: boolean;
    oneofs?: boolean;
    json?: boolean;
    includeDirs?: string[];
  };
}

export const { GrpcNestMicroservice } = createNestModule({
  moduleName: 'GrpcNestMicroservice',
  moduleDescription:
    'GRPC NestJS-mod microservice initializer, no third party utilities required @see https://docs.nestjs.com/microservices/grpc',
  moduleCategory: NestModuleCategory.system,
  staticConfigurationModel: GrpcMicroserviceConfiguration,
  staticEnvironmentsModel: GrpcMicroserviceEnvironments,
  wrapForRootAsync: (asyncModuleOptions) => {
    if (!asyncModuleOptions) {
      asyncModuleOptions = {};
    }
    if (asyncModuleOptions.staticConfiguration?.featureName) {
      const FomatterClass = getFeatureDotEnvPropertyNameFormatter(
        `${asyncModuleOptions.staticConfiguration?.featureName}_GRPC`
      );
      Object.assign(asyncModuleOptions, {
        environmentsOptions: {
          propertyNameFormatters: [new FomatterClass()],
          name: `${asyncModuleOptions.staticConfiguration?.featureName}_GRPC`,
        },
      });
    } else {
      const FomatterClass = getFeatureDotEnvPropertyNameFormatter('GRPC');
      Object.assign(asyncModuleOptions, {
        environmentsOptions: {
          propertyNameFormatters: [new FomatterClass()],
          name: 'GRPC',
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
          transport: Transport.GRPC,
          options: {
            ...current.staticConfiguration,
            ...current.staticEnvironments,
            package: current.staticConfiguration?.package ?? [],
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
        transport: Transport.GRPC,
        options: {
          ...current.staticConfiguration,
          ...current.staticEnvironments,
          package: current.staticConfiguration?.package ?? [],
        },
      })) as unknown as NestApplication;
    }
    return app;
  },
});
