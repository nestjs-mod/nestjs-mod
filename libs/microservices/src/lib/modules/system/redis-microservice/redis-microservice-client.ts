import {
  NestModuleCategory,
  createNestModule,
  getFeatureDotEnvPropertyNameFormatter,
  getNestModuleDecorators,
} from '@nestjs-mod/common';
import { Injectable, OnApplicationBootstrap, OnModuleDestroy } from '@nestjs/common';
import { ClientProxy, ClientProxyFactory, Transport } from '@nestjs/microservices';
import { RedisMicroserviceConfiguration, RedisMicroserviceEnvironments } from './redis-microservice';

export const REDIS_NEST_MICROSERVICE_CLIENT_MODULE = 'RedisNestMicroserviceClientModule';
export const REDIS_NEST_MICROSERVICE_CLIENT = 'RedisNestMicroserviceClient';

const { InjectService: InjectRedisNestMicroserviceClientService } = getNestModuleDecorators({
  moduleName: REDIS_NEST_MICROSERVICE_CLIENT_MODULE,
});

export const InjectRedisNestMicroserviceClient = (contextName?: string) =>
  InjectRedisNestMicroserviceClientService(REDIS_NEST_MICROSERVICE_CLIENT, contextName);

function getClientProxyApplicationHooks(contextName?: string) {
  @Injectable()
  class ClientProxyApplicationHooks implements OnApplicationBootstrap, OnModuleDestroy {
    constructor(
      @InjectRedisNestMicroserviceClient(contextName)
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

export const { RedisNestMicroserviceClientModule } = createNestModule({
  moduleName: REDIS_NEST_MICROSERVICE_CLIENT_MODULE,
  moduleDescription: 'Redis NestJS-mod microservice client @see https://docs.nestjs.com/microservices/redis',
  moduleCategory: NestModuleCategory.system,
  staticConfigurationModel: RedisMicroserviceConfiguration,
  staticEnvironmentsModel: RedisMicroserviceEnvironments,
  wrapForRootAsync: (asyncModuleOptions) => {
    if (!asyncModuleOptions) {
      asyncModuleOptions = {};
    }
    if (asyncModuleOptions.staticConfiguration?.featureName) {
      const FomatterClass = getFeatureDotEnvPropertyNameFormatter(
        `${asyncModuleOptions.staticConfiguration?.featureName}_REDIS`,
        asyncModuleOptions.staticConfiguration?.microserviceProjectName
          ? { name: asyncModuleOptions.staticConfiguration.microserviceProjectName }
          : undefined
      );
      Object.assign(asyncModuleOptions, {
        environmentsOptions: {
          propertyNameFormatters: [new FomatterClass()],
          name: `${asyncModuleOptions.staticConfiguration?.featureName}_REDIS`,
        },
      });
    } else {
      const FomatterClass = getFeatureDotEnvPropertyNameFormatter(
        'REDIS',
        asyncModuleOptions.staticConfiguration?.microserviceProjectName
          ? { name: asyncModuleOptions.staticConfiguration.microserviceProjectName }
          : undefined
      );
      Object.assign(asyncModuleOptions, {
        environmentsOptions: {
          propertyNameFormatters: [new FomatterClass()],
          name: 'REDIS',
        },
      });
    }
    return { asyncModuleOptions };
  },
  sharedProviders: ({ contextName, staticConfiguration, staticEnvironments }) => [
    {
      provide: REDIS_NEST_MICROSERVICE_CLIENT,
      useFactory: async () => {
        const options = { ...staticConfiguration, ...staticEnvironments };
        // (staticConfiguration?.defaultLogger || new Logger()).debug(
        //   `⚙️  Microservice client created with options: ${JSON.stringify(options)}`
        // );
        return ClientProxyFactory.create({
          transport: Transport.REDIS,
          options,
        });
      },
    },
    getClientProxyApplicationHooks(contextName),
  ],
});
