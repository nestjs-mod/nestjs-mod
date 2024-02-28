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
import { LogLevel, Logger, LoggerService, Module, Type } from '@nestjs/common';
import { NestMicroserviceOptions } from '@nestjs/common/interfaces/microservices/nest-microservice-options.interface';
import { NestApplication, NestFactory } from '@nestjs/core';
import { Deserializer, MicroserviceOptions, Serializer, TcpOptions, TcpSocket, Transport } from '@nestjs/microservices';
import { ConnectionOptions } from 'tls';

@EnvModel()
export class TcpMicroserviceEnvironments implements Pick<Required<TcpOptions>['options'], 'host' | 'port'> {
  @EnvModelProperty({ description: 'Host', hidden: true, transform: new StringTransformer() })
  host?: string;

  @EnvModelProperty({ description: 'Port', transform: new NumberTransformer() })
  port?: number;
}

@ConfigModel()
export class TcpMicroserviceConfiguration
  implements Omit<Required<TcpOptions>['options'] & NestMicroserviceOptions, 'host' | 'port'>
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

  @ConfigModelProperty({
    description: 'Serializer',
  })
  serializer?: Serializer;

  @ConfigModelProperty({
    description: 'TLS options',
  })
  tlsOptions?: ConnectionOptions;

  @ConfigModelProperty({
    description: 'Deserializer',
  })
  deserializer?: Deserializer;

  @ConfigModelProperty({
    description: 'Socket class',
  })
  socketClass?: Type<TcpSocket>;
}

export const { TcpNestMicroservice } = createNestModule({
  moduleName: 'TcpNestMicroservice',
  moduleDescription: 'TCP NestJS-mod microservice initializer @see https://docs.nestjs.com/microservices/basics',
  moduleCategory: NestModuleCategory.system,
  staticConfigurationModel: TcpMicroserviceConfiguration,
  staticEnvironmentsModel: TcpMicroserviceEnvironments,
  wrapForRootAsync: (asyncModuleOptions) => {
    if (!asyncModuleOptions) {
      asyncModuleOptions = {};
    }
    if (asyncModuleOptions.staticConfiguration?.featureName) {
      const FomatterClass = getFeatureDotEnvPropertyNameFormatter(
        `${asyncModuleOptions.staticConfiguration?.featureName}_TCP`
      );
      Object.assign(asyncModuleOptions, {
        environmentsOptions: {
          propertyNameFormatters: [new FomatterClass()],
          name: `${asyncModuleOptions.staticConfiguration?.featureName}_TCP`,
        },
      });
    } else {
      const FomatterClass = getFeatureDotEnvPropertyNameFormatter('TCP');
      Object.assign(asyncModuleOptions, {
        environmentsOptions: {
          propertyNameFormatters: [new FomatterClass()],
          name: 'TCP',
        },
      });
    }
    return { asyncModuleOptions };
  },
  // creating microservice
  wrapApplication: async ({ app, current, modules }) => {
    const options = { ...current.staticConfiguration, ...current.staticEnvironments };
    if (app) {
      app.connectMicroservice<MicroserviceOptions>(
        {
          transport: Transport.TCP,
          options,
        },
        { inheritAppConfig: true }
      );
    } else {
      @Module({
        imports: collectRootNestModules(modules),
      })
      class MicroserviceNestApp {}

      app = (await NestFactory.createMicroservice<MicroserviceOptions>(MicroserviceNestApp, {
        transport: Transport.TCP,
        options,
      })) as unknown as NestApplication;
    }
    // (current.staticConfiguration?.defaultLogger || new Logger()).debug(
    //   `⚙️  Microservice created with options: ${JSON.stringify(options)}`
    // );
    return app;
  },
});
