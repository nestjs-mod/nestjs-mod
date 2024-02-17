import {
  NestModuleCategory,
  createNestModule,
  getFeatureDotEnvPropertyNameFormatter,
  getNestModuleDecorators,
} from '@nestjs-mod/common';
import { Injectable, OnApplicationBootstrap, OnModuleDestroy } from '@nestjs/common';
import { ClientProxy, ClientProxyFactory, Transport } from '@nestjs/microservices';
import { NatsMicroserviceConfiguration, NatsMicroserviceEnvironments } from './nats-microservice';

export const NATS_NEST_MICROSERVICE_CLIENT_MODULE = 'NatsNestMicroserviceClientModule';
export const NATS_NEST_MICROSERVICE_CLIENT = 'NatsNestMicroserviceClient';

const { InjectService: InjectNatsNestMicroserviceClientService } = getNestModuleDecorators({
  moduleName: NATS_NEST_MICROSERVICE_CLIENT_MODULE,
});

export const InjectNatsNestMicroserviceClient = (contextName?: string) =>
  InjectNatsNestMicroserviceClientService(NATS_NEST_MICROSERVICE_CLIENT, contextName);

function getClientProxyApplicationHooks(contextName?: string) {
  @Injectable()
  class ClientProxyApplicationHooks implements OnApplicationBootstrap, OnModuleDestroy {
    constructor(
      @InjectNatsNestMicroserviceClient(contextName)
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

export const { NatsNestMicroserviceClientModule } = createNestModule({
  moduleName: NATS_NEST_MICROSERVICE_CLIENT_MODULE,
  moduleDescription: 'Nats NestJS-mod microservice client @see https://docs.nestjs.com/microservices/nats',
  moduleCategory: NestModuleCategory.system,
  staticConfigurationModel: NatsMicroserviceConfiguration,
  staticEnvironmentsModel: NatsMicroserviceEnvironments,
  wrapForRootAsync: (asyncModuleOptions) => {
    if (!asyncModuleOptions) {
      asyncModuleOptions = {};
    }
    if (asyncModuleOptions.staticConfiguration?.featureName) {
      const FomatterClass = getFeatureDotEnvPropertyNameFormatter(
        `${asyncModuleOptions.staticConfiguration?.featureName}_NATS`,
        asyncModuleOptions.staticConfiguration?.microserviceProjectName
          ? { name: asyncModuleOptions.staticConfiguration.microserviceProjectName }
          : undefined
      );
      Object.assign(asyncModuleOptions, {
        environmentsOptions: {
          propertyNameFormatters: [new FomatterClass()],
          name: `${asyncModuleOptions.staticConfiguration?.featureName}_NATS`,
        },
      });
    } else {
      const FomatterClass = getFeatureDotEnvPropertyNameFormatter(
        'NATS',
        asyncModuleOptions.staticConfiguration?.microserviceProjectName
          ? { name: asyncModuleOptions.staticConfiguration.microserviceProjectName }
          : undefined
      );
      Object.assign(asyncModuleOptions, {
        environmentsOptions: {
          propertyNameFormatters: [new FomatterClass()],
          name: 'NATS',
        },
      });
    }
    return { asyncModuleOptions };
  },
  sharedProviders: ({ contextName, staticConfiguration, staticEnvironments }) => [
    {
      provide: NATS_NEST_MICROSERVICE_CLIENT,
      useFactory: async () => {
        const options = { ...staticConfiguration, ...staticEnvironments };
        // (staticConfiguration?.defaultLogger || new Logger()).debug(
        //   `⚙️  Microservice client created with options: ${JSON.stringify(options)}`
        // );
        return ClientProxyFactory.create({
          transport: Transport.NATS,
          options,
        });
      },
    },
    getClientProxyApplicationHooks(contextName),
  ],
});
