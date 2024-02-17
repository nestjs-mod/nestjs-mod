import {
  NestModuleCategory,
  createNestModule,
  getFeatureDotEnvPropertyNameFormatter,
  getNestModuleDecorators,
} from '@nestjs-mod/common';
import { Injectable, OnApplicationBootstrap, OnModuleDestroy } from '@nestjs/common';
import { ClientProxy, ClientProxyFactory, Transport } from '@nestjs/microservices';
import { MqttMicroserviceConfiguration, MqttMicroserviceEnvironments } from './mqtt-microservice';

export const MQTT_NEST_MICROSERVICE_CLIENT_MODULE = 'MqttNestMicroserviceClientModule';
export const MQTT_NEST_MICROSERVICE_CLIENT = 'MqttNestMicroserviceClient';

const { InjectService: InjectMqttNestMicroserviceClientService } = getNestModuleDecorators({
  moduleName: MQTT_NEST_MICROSERVICE_CLIENT_MODULE,
});

export const InjectMqttNestMicroserviceClient = (contextName?: string) =>
  InjectMqttNestMicroserviceClientService(MQTT_NEST_MICROSERVICE_CLIENT, contextName);

function getClientProxyApplicationHooks(contextName?: string) {
  @Injectable()
  class ClientProxyApplicationHooks implements OnApplicationBootstrap, OnModuleDestroy {
    constructor(
      @InjectMqttNestMicroserviceClient(contextName)
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

export const { MqttNestMicroserviceClientModule } = createNestModule({
  moduleName: MQTT_NEST_MICROSERVICE_CLIENT_MODULE,
  moduleDescription: 'MQTT NestJS-mod microservice client @see https://docs.nestjs.com/microservices/mqtt',
  moduleCategory: NestModuleCategory.system,
  staticConfigurationModel: MqttMicroserviceConfiguration,
  staticEnvironmentsModel: MqttMicroserviceEnvironments,
  wrapForRootAsync: (asyncModuleOptions) => {
    if (!asyncModuleOptions) {
      asyncModuleOptions = {};
    }
    if (asyncModuleOptions.staticConfiguration?.featureName) {
      const FomatterClass = getFeatureDotEnvPropertyNameFormatter(
        `${asyncModuleOptions.staticConfiguration?.featureName}_MQTT`,
        asyncModuleOptions.staticConfiguration?.microserviceProjectName
          ? { name: asyncModuleOptions.staticConfiguration.microserviceProjectName }
          : undefined
      );
      Object.assign(asyncModuleOptions, {
        environmentsOptions: {
          propertyNameFormatters: [new FomatterClass()],
          name: `${asyncModuleOptions.staticConfiguration?.featureName}_MQTT`,
        },
      });
    } else {
      const FomatterClass = getFeatureDotEnvPropertyNameFormatter(
        'MQTT',
        asyncModuleOptions.staticConfiguration?.microserviceProjectName
          ? { name: asyncModuleOptions.staticConfiguration.microserviceProjectName }
          : undefined
      );
      Object.assign(asyncModuleOptions, {
        environmentsOptions: {
          propertyNameFormatters: [new FomatterClass()],
          name: 'MQTT',
        },
      });
    }
    return { asyncModuleOptions };
  },
  sharedProviders: ({ contextName, staticConfiguration, staticEnvironments }) => [
    {
      provide: MQTT_NEST_MICROSERVICE_CLIENT,
      useFactory: async () => {
        const options = { ...staticConfiguration, ...staticEnvironments };
        // (staticConfiguration?.defaultLogger || new Logger()).debug(
        //   `⚙️  Microservice client created with options: ${JSON.stringify(options)}`
        // );
        return ClientProxyFactory.create({
          transport: Transport.MQTT,
          options,
        });
      },
    },
    getClientProxyApplicationHooks(contextName),
  ],
});
