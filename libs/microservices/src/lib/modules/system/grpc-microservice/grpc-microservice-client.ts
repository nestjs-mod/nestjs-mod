import {
  NestModuleCategory,
  createNestModule,
  getFeatureDotEnvPropertyNameFormatter,
  getNestModuleDecorators,
} from '@nestjs-mod/common';
import { Injectable, OnApplicationBootstrap, OnModuleDestroy } from '@nestjs/common';
import { ClientProxy, ClientProxyFactory, Transport } from '@nestjs/microservices';
import { GrpcMicroserviceConfiguration, GrpcMicroserviceEnvironments } from './grpc-microservice';

export const GRPC_NEST_MICROSERVICE_CLIENT_MODULE = 'GrpcNestMicroserviceClientModule';
export const GRPC_NEST_MICROSERVICE_CLIENT = 'GrpcNestMicroserviceClient';

const { InjectService: InjectGrpcNestMicroserviceClientService } = getNestModuleDecorators({
  moduleName: GRPC_NEST_MICROSERVICE_CLIENT_MODULE,
});

export const InjectGrpcNestMicroserviceClient = (contextName?: string) =>
  InjectGrpcNestMicroserviceClientService(GRPC_NEST_MICROSERVICE_CLIENT, contextName);

function getClientProxyApplicationHooks(contextName?: string) {
  @Injectable()
  class ClientProxyApplicationHooks implements OnApplicationBootstrap, OnModuleDestroy {
    constructor(
      @InjectGrpcNestMicroserviceClient(contextName)
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

export const { GrpcNestMicroserviceClientModule } = createNestModule({
  moduleName: GRPC_NEST_MICROSERVICE_CLIENT_MODULE,
  moduleDescription: 'GRPC NestJS-mod microservice client @see https://docs.nestjs.com/microservices/grpc',
  moduleCategory: NestModuleCategory.system,
  staticConfigurationModel: GrpcMicroserviceConfiguration,
  staticEnvironmentsModel: GrpcMicroserviceEnvironments,
  wrapForRootAsync: (asyncModuleOptions) => {
    if (!asyncModuleOptions) {
      asyncModuleOptions = {};
    }
    if (asyncModuleOptions.staticConfiguration?.featureName) {
      const FomatterClass = getFeatureDotEnvPropertyNameFormatter(
        `${asyncModuleOptions.staticConfiguration?.featureName}_GRPC`,
        asyncModuleOptions.staticConfiguration?.microserviceProjectName
          ? { name: asyncModuleOptions.staticConfiguration.microserviceProjectName }
          : undefined
      );
      Object.assign(asyncModuleOptions, {
        environmentsOptions: {
          propertyNameFormatters: [new FomatterClass()],
          name: `${asyncModuleOptions.staticConfiguration?.featureName}_GRPC`,
        },
      });
    } else {
      const FomatterClass = getFeatureDotEnvPropertyNameFormatter(
        'GRPC',
        asyncModuleOptions.staticConfiguration?.microserviceProjectName
          ? { name: asyncModuleOptions.staticConfiguration.microserviceProjectName }
          : undefined
      );
      Object.assign(asyncModuleOptions, {
        environmentsOptions: {
          propertyNameFormatters: [new FomatterClass()],
          name: 'GRPC',
        },
      });
    }
    return { asyncModuleOptions };
  },
  sharedProviders: ({ contextName, staticConfiguration, staticEnvironments }) => [
    {
      provide: GRPC_NEST_MICROSERVICE_CLIENT,
      useFactory: async () => {
        const options = { ...staticConfiguration, ...staticEnvironments };
        // (staticConfiguration?.defaultLogger || new Logger()).debug(
        //   `⚙️  Microservice client created with options: ${JSON.stringify(options)}`
        // );
        return ClientProxyFactory.create({
          transport: Transport.GRPC,
          options,
        });
      },
    },
    getClientProxyApplicationHooks(contextName),
  ],
});
