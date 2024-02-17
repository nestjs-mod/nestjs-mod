import {
  NestModuleCategory,
  createNestModule,
  getFeatureDotEnvPropertyNameFormatter,
  getNestModuleDecorators,
} from '@nestjs-mod/common';
import { Injectable, OnApplicationBootstrap, OnModuleDestroy } from '@nestjs/common';
import { ClientProxy, ClientProxyFactory, Transport } from '@nestjs/microservices';
import { KafkaMicroserviceConfiguration, KafkaMicroserviceEnvironments } from './kafka-microservice';

export const KAFKA_NEST_MICROSERVICE_CLIENT_MODULE = 'KafkaNestMicroserviceClientModule';
export const KAFKA_NEST_MICROSERVICE_CLIENT = 'KafkaNestMicroserviceClient';

const { InjectService: InjectKafkaNestMicroserviceClientService } = getNestModuleDecorators({
  moduleName: KAFKA_NEST_MICROSERVICE_CLIENT_MODULE,
});

export const InjectKafkaNestMicroserviceClient = (contextName?: string) =>
  InjectKafkaNestMicroserviceClientService(KAFKA_NEST_MICROSERVICE_CLIENT, contextName);

function getClientProxyApplicationHooks(contextName?: string) {
  @Injectable()
  class ClientProxyApplicationHooks implements OnApplicationBootstrap, OnModuleDestroy {
    constructor(
      @InjectKafkaNestMicroserviceClient(contextName)
      private readonly clientProxy: ClientProxy
    ) {}

    async onApplicationBootstrap() {
      await this.clientProxy.connect();
    }

    async onModuleDestroy() {
      await this.clientProxy.close();
    }
  }
  return ClientProxyApplicationHooks;
}

export const { KafkaNestMicroserviceClientModule } = createNestModule({
  moduleName: KAFKA_NEST_MICROSERVICE_CLIENT_MODULE,
  moduleDescription: 'Kafka NestJS-mod microservice client @see https://docs.nestjs.com/microservices/kafka',
  moduleCategory: NestModuleCategory.system,
  staticConfigurationModel: KafkaMicroserviceConfiguration,
  staticEnvironmentsModel: KafkaMicroserviceEnvironments,
  wrapForRootAsync: (asyncModuleOptions) => {
    if (!asyncModuleOptions) {
      asyncModuleOptions = {};
    }
    if (asyncModuleOptions.staticConfiguration?.featureName) {
      const FomatterClass = getFeatureDotEnvPropertyNameFormatter(
        `${asyncModuleOptions.staticConfiguration?.featureName}_KAFKA`,
        asyncModuleOptions.staticConfiguration?.microserviceProjectName
          ? { name: asyncModuleOptions.staticConfiguration.microserviceProjectName }
          : undefined
      );
      Object.assign(asyncModuleOptions, {
        environmentsOptions: {
          propertyNameFormatters: [new FomatterClass()],
          name: `${asyncModuleOptions.staticConfiguration?.featureName}_KAFKA`,
        },
      });
    } else {
      const FomatterClass = getFeatureDotEnvPropertyNameFormatter(
        'KAFKA',
        asyncModuleOptions.staticConfiguration?.microserviceProjectName
          ? { name: asyncModuleOptions.staticConfiguration.microserviceProjectName }
          : undefined
      );
      Object.assign(asyncModuleOptions, {
        environmentsOptions: {
          propertyNameFormatters: [new FomatterClass()],
          name: 'KAFKA',
        },
      });
    }
    return { asyncModuleOptions };
  },
  sharedProviders: ({ contextName, staticConfiguration, staticEnvironments }) => [
    {
      provide: KAFKA_NEST_MICROSERVICE_CLIENT,
      useFactory: async () => {
        const options = { ...staticConfiguration, ...staticEnvironments };
        // (staticConfiguration?.defaultLogger || new Logger()).debug(
        //   `⚙️  Microservice client created with options: ${JSON.stringify(options)}`
        // );
        return ClientProxyFactory.create({
          transport: Transport.KAFKA,
          options,
        });
      },
    },
    getClientProxyApplicationHooks(contextName),
  ],
});
