import {
  NestModuleCategory,
  createNestModule,
  getFeatureDotEnvPropertyNameFormatter,
  getNestModuleDecorators,
} from '@nestjs-mod/common';
import { Injectable, OnApplicationBootstrap, OnModuleDestroy } from '@nestjs/common';
import { ClientProxy, ClientProxyFactory, Transport } from '@nestjs/microservices';
import { TcpMicroserviceConfiguration, TcpMicroserviceEnvironments } from './tcp-microservice';

export const TCP_NEST_MICROSERVICE_CLIENT_MODULE = 'TcpNestMicroserviceClientModule';
export const TCP_NEST_MICROSERVICE_CLIENT = 'TcpNestMicroserviceClient';

const { InjectService: InjectTcpNestMicroserviceClientService } = getNestModuleDecorators({
  moduleName: TCP_NEST_MICROSERVICE_CLIENT_MODULE,
});

export const InjectTcpNestMicroserviceClient = (contextName?: string) =>
  InjectTcpNestMicroserviceClientService(TCP_NEST_MICROSERVICE_CLIENT, contextName);

function getClientProxyApplicationHooks(contextName?: string) {
  @Injectable()
  class ClientProxyApplicationHooks implements OnApplicationBootstrap, OnModuleDestroy {
    constructor(
      @InjectTcpNestMicroserviceClient(contextName)
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

export const { TcpNestMicroserviceClientModule } = createNestModule({
  moduleName: TCP_NEST_MICROSERVICE_CLIENT_MODULE,
  moduleDescription: 'TCP NestJS-mod microservice client @see https://docs.nestjs.com/microservices/basics',
  moduleCategory: NestModuleCategory.system,
  staticConfigurationModel: TcpMicroserviceConfiguration,
  staticEnvironmentsModel: TcpMicroserviceEnvironments,
  wrapForRootAsync: (asyncModuleOptions) => {
    if (!asyncModuleOptions) {
      asyncModuleOptions = {};
    }
    if (asyncModuleOptions.staticConfiguration?.featureName) {
      const FomatterClass = getFeatureDotEnvPropertyNameFormatter(
        `${asyncModuleOptions.staticConfiguration?.featureName}_TCP`,
        asyncModuleOptions.staticConfiguration?.microserviceProjectName
          ? { name: asyncModuleOptions.staticConfiguration.microserviceProjectName }
          : undefined
      );
      Object.assign(asyncModuleOptions, {
        environmentsOptions: {
          propertyNameFormatters: [new FomatterClass()],
          name: `${asyncModuleOptions.staticConfiguration?.featureName}_TCP`,
        },
      });
    } else {
      const FomatterClass = getFeatureDotEnvPropertyNameFormatter(
        'TCP',
        asyncModuleOptions.staticConfiguration?.microserviceProjectName
          ? { name: asyncModuleOptions.staticConfiguration.microserviceProjectName }
          : undefined
      );
      Object.assign(asyncModuleOptions, {
        environmentsOptions: {
          propertyNameFormatters: [new FomatterClass()],
          name: 'TCP',
        },
      });
    }
    return { asyncModuleOptions };
  },
  sharedProviders: ({ contextName, staticConfiguration, staticEnvironments }) => [
    {
      provide: TCP_NEST_MICROSERVICE_CLIENT,
      useFactory: async () => {
        const options = { ...staticConfiguration, ...staticEnvironments };
        // (staticConfiguration?.defaultLogger || new Logger()).debug(
        //   `⚙️  Microservice client created with options: ${JSON.stringify(options)}`
        // );
        return ClientProxyFactory.create({
          transport: Transport.TCP,
          options,
        });
      },
    },
    getClientProxyApplicationHooks(contextName),
  ],
});
