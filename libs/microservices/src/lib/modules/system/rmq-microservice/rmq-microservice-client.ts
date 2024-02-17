import {
  NestModuleCategory,
  createNestModule,
  getFeatureDotEnvPropertyNameFormatter,
  getNestModuleDecorators,
} from '@nestjs-mod/common';
import { Injectable, OnApplicationBootstrap, OnModuleDestroy } from '@nestjs/common';
import { ClientProxy, ClientProxyFactory, Transport } from '@nestjs/microservices';
import { RmqMicroserviceConfiguration, RmqMicroserviceEnvironments } from './rmq-microservice';

export const RMQ_NEST_MICROSERVICE_CLIENT_MODULE = 'RmqNestMicroserviceClientModule';
export const RMQ_NEST_MICROSERVICE_CLIENT = 'RmqNestMicroserviceClient';

const { InjectService: InjectRmqNestMicroserviceClientService } = getNestModuleDecorators({
  moduleName: RMQ_NEST_MICROSERVICE_CLIENT_MODULE,
});

export const InjectRmqNestMicroserviceClient = (contextName?: string) =>
  InjectRmqNestMicroserviceClientService(RMQ_NEST_MICROSERVICE_CLIENT, contextName);

function getClientProxyApplicationHooks(contextName?: string) {
  @Injectable()
  class ClientProxyApplicationHooks implements OnApplicationBootstrap, OnModuleDestroy {
    constructor(
      @InjectRmqNestMicroserviceClient(contextName)
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

export const { RmqNestMicroserviceClientModule } = createNestModule({
  moduleName: RMQ_NEST_MICROSERVICE_CLIENT_MODULE,
  moduleDescription: 'RabbitMQ NestJS-mod microservice client @see https://docs.nestjs.com/microservices/rabbitmq',
  moduleCategory: NestModuleCategory.system,
  staticConfigurationModel: RmqMicroserviceConfiguration,
  staticEnvironmentsModel: RmqMicroserviceEnvironments,
  wrapForRootAsync: (asyncModuleOptions) => {
    if (!asyncModuleOptions) {
      asyncModuleOptions = {};
    }
    if (asyncModuleOptions.staticConfiguration?.featureName) {
      const FomatterClass = getFeatureDotEnvPropertyNameFormatter(
        `${asyncModuleOptions.staticConfiguration?.featureName}_RMQ`,
        asyncModuleOptions.staticConfiguration?.microserviceProjectName
          ? { name: asyncModuleOptions.staticConfiguration.microserviceProjectName }
          : undefined
      );
      Object.assign(asyncModuleOptions, {
        environmentsOptions: {
          propertyNameFormatters: [new FomatterClass()],
          name: `${asyncModuleOptions.staticConfiguration?.featureName}_RMQ`,
        },
      });
    } else {
      const FomatterClass = getFeatureDotEnvPropertyNameFormatter(
        'RMQ',
        asyncModuleOptions.staticConfiguration?.microserviceProjectName
          ? { name: asyncModuleOptions.staticConfiguration.microserviceProjectName }
          : undefined
      );
      Object.assign(asyncModuleOptions, {
        environmentsOptions: {
          propertyNameFormatters: [new FomatterClass()],
          name: 'RMQ',
        },
      });
    }
    return { asyncModuleOptions };
  },
  sharedProviders: ({ contextName, staticConfiguration, staticEnvironments }) => [
    {
      provide: RMQ_NEST_MICROSERVICE_CLIENT,
      useFactory: async () => {
        const options = { ...staticConfiguration, ...staticEnvironments };
        // (staticConfiguration?.defaultLogger || new Logger()).debug(
        //   `⚙️  Microservice client created with options: ${JSON.stringify(options)}`
        // );
        return ClientProxyFactory.create({
          transport: Transport.RMQ,
          options,
        });
      },
    },
    getClientProxyApplicationHooks(contextName),
  ],
});
