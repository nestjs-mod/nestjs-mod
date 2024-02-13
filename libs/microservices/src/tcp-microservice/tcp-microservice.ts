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
import { Module, Type } from '@nestjs/common';
import { NestApplication, NestFactory } from '@nestjs/core';
import { Deserializer, MicroserviceOptions, Serializer, TcpOptions, TcpSocket, Transport } from '@nestjs/microservices';
import { ConnectionOptions } from 'tls';

@EnvModel()
export class TcpMicroserviceEnvironments implements Pick<Required<TcpOptions>['options'], 'host' | 'port'> {
  @EnvModelProperty({ description: 'Host' })
  host?: string;

  @EnvModelProperty({ description: 'Port' })
  port?: number;
}

@ConfigModel()
export class TcpMicroserviceConfiguration implements Omit<Required<TcpOptions>['options'], 'host' | 'port'> {
  @ConfigModelProperty({
    description: 'Feature name for generate prefix to environments keys',
  })
  featureName?: string;

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
  moduleDescription:
    'TCP NestJS microservice initializer, no third party utilities required @see https://docs.nestjs.com/microservices/basics',
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
    if (app) {
      app.connectMicroservice<MicroserviceOptions>({
        transport: Transport.TCP,
        options: { ...current.staticConfiguration, ...current.staticEnvironments },
      });
    } else {
      @Module({
        imports: collectRootNestModules(modules),
      })
      class MicroserviceNestApp {}

      app = (await NestFactory.createMicroservice<MicroserviceOptions>(MicroserviceNestApp, {
        transport: Transport.TCP,
        options: { ...current.staticConfiguration, ...current.staticEnvironments },
      })) as unknown as NestApplication;
    }
    return app;
  },
});
