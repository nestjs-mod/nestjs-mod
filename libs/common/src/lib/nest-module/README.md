## NestJS module

Function for creating a configurable module with the ability to use multi-providing.
It is possible to create and work with named module instances.
Modules can contain code for creating and managing the application (preWrapApplication, wrapApplication, postWrapApplication).

Type of config or env models used in module:

- `environmentsModel` - Variables with primitive types used in the module, the values of which can be obtained from various sources, such as: process.env or consul key value.
- `configurationModel` - Variables of primitive and complex types that are used in the module; values for them must be passed when connecting the module to the application.
- `staticEnvironmentsModel` - Static variables with primitive types used in the module and can be used at the time of generating module metadata (import, controllers), the values of which can be obtained from various sources, such as: process.env or consul key value.
- `staticConfigurationModel` - Static variables of primitive and complex types that are used in the module and can be used at the time of generating module metadata (import, controllers); values for them must be passed when connecting the module to the application.
- `featureConfigurationModel` - Feature variables of primitive and complex types that can be added to the current module from other modules (example: a transport for sending a message can be defined as a generalized interface, but the implementation itself will be added from a module for working with a specific transport or from an integration module).

### Function

`bootstrapNestApplication`

### Usage

```typescript
import { ConfigModel, ConfigModelProperty, EnvModel, EnvModelProperty, createNestModule, getNestModuleDecorators } from '@nestjs-mod/common';
import { Injectable } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { IsNotEmpty } from 'class-validator';

// App1Module

const { InjectFeatures } = getNestModuleDecorators({ moduleName: 'App1Module' });

@ConfigModel()
class AppFeatureConfig {
  @ConfigModelProperty()
  @IsNotEmpty()
  featureOptionConfig!: string;
}

@Injectable()
class AppFeaturesService {
  constructor(
    @InjectFeatures()
    private readonly appFeatureConfigs: AppFeatureConfig[]
  ) {}

  getFeatureConfigs() {
    return this.appFeatureConfigs;
  }
}

const { App1Module } = createNestModule({
  moduleName: 'App1Module',
  sharedProviders: [AppFeaturesService],
  featureConfigurationModel: AppFeatureConfig,
});

@ConfigModel()
class App2Config {
  @ConfigModelProperty()
  @IsNotEmpty()
  option!: string;
}

@Injectable()
class App2Service {
  constructor(private readonly appFeaturesService: AppFeaturesService, private readonly app2Config: App2Config) {}

  getFeatureConfigs() {
    return this.appFeaturesService.getFeatureConfigs();
  }

  getConfig() {
    return this.app2Config;
  }
}

// App2Module

const { App2Module } = createNestModule({
  moduleName: 'App2Module',
  imports: [App1Module.forFeature({ featureOptionConfig: 'featureOptionConfig-app2' })],
  providers: [App2Service],
  configurationModel: App2Config,
});

@EnvModel()
class App3Env {
  @EnvModelProperty()
  @IsNotEmpty()
  option!: string;
}

@Injectable()
class App3Service {
  constructor(private readonly appFeaturesService: AppFeaturesService, private readonly app3Env: App3Env) {}

  getFeatureConfigs() {
    return this.appFeaturesService.getFeatureConfigs();
  }

  getEnv() {
    return this.app3Env;
  }
}

const { App3Module } = createNestModule({
  moduleName: 'App3Module',
  imports: [App1Module.forFeature({ featureOptionConfig: 'featureOptionConfig-app3' })],
  providers: [App3Service],
  environmentsModel: App3Env,
});

// Test

const { AppModule } = createNestModule({
  moduleName: 'AppModule',
  imports: [App1Module.forRoot(), App2Module.forRoot({ configuration: { option: 'appConfig3value' } }), App3Module.forRoot({ environments: { option: 'appEnv2value' } })],
});

// Let's try to launch the application
async function bootstrap() {
  const app = await NestFactory.create(AppModule.forRoot());
  const appFeatureScannerService = app.get(AppFeaturesService);
  const app2Service = app.get(App2Service);
  const app3Service = app.get(App3Service);

  console.log(appFeatureScannerService.getFeatureConfigs()); // output: [{ featureOptionConfig: 'featureOptionConfig-app2' }, { featureOptionConfig: 'featureOptionConfig-app3' }]
  console.log(app2Service.getFeatureConfigs()); // output: [{ featureOptionConfig: 'featureOptionConfig-app2' }, { featureOptionConfig: 'featureOptionConfig-app3' }]
  console.log(app3Service.getFeatureConfigs()); // output: [{ featureOptionConfig: 'featureOptionConfig-app2' }, { featureOptionConfig: 'featureOptionConfig-app3' }]
  console.log(app2Service.getConfig()); // output: { option: 'appConfig3value' }
  console.log(app3Service.getEnv()); // output: { option: 'appEnv2value' }
}

bootstrap();
```
