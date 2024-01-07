# NestJS-Mod: Common

A collection of decorators and functions for unifying nestjs applications and modules.

[![NPM version][npm-image]][npm-url] [![monthly downloads][downloads-image]][downloads-url] [![Telegram bot][telegram-image]][telegram-url]

## Installation

```bash
npm i --save @nestjs-mod/common
```

## Decorators and functions

| Link                                  | Decorators                           | Function                                     | Description                                                                                                  |
| ------------------------------------- | ------------------------------------ | -------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| [Config model](#config-model)         | `ConfigModel`, `ConfigModelProperty` | `configTransform`                            | Decorators for describing the module configuration and a function for its serialization and validation.      |
| [Env model](#env-model)               | `EnvModel`, `EnvModelProperty`       | `envTransform`                               | Decorators for describing module environment variables and functions for its serialization and verification. |
| [Nest module](#nest-module)           | `InjectFeatures`, `InjectService`    | `createNestModule`,`getNestModuleDecorators` | Function for creating a configurable module with the ability to use multi-providing.                         |
| [Nest application](#nest-application) | -                                    | `bootstrapNestApplication`                   | Function for sequential import of nestModules.                                                               |

## Modules

| Link                                                                            | Category         | Description                                                                |
| ------------------------------------------------------------------------------- | ---------------- | -------------------------------------------------------------------------- |
| [InfrastructureMarkdownReportGenerator](#infrastructuremarkdownreportgenerator) | `infrastructure` | Infrastructure markdown report generator.                                  |
| [DefaultNestApplicationInitializer](#defaultnestapplicationinitializer)         | `system`         | Default NestJS application initializer, no third party utilities required. |
| [DefaultNestApplicationListener](#defaultnestapplicationlistener)               | `system`         | Default NestJS application listener, no third party utilities required.    |

## Config model

Decorators for describing the module configuration and a function for its serialization and validation.
Values for this type of configuration must be described in code.

### Usage

```typescript
import { ConfigModel, ConfigModelProperty, configTransform } from '@nestjs-mod/common';
import { DynamicModule, Module } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { IsNotEmpty } from 'class-validator';

// We describe the configuration.
@ConfigModel()
class AppConfig {
  @ConfigModelProperty()
  @IsNotEmpty()
  option!: string;
}

// We describe the module.
@Module({ providers: [AppConfig] })
class AppModule {
  static forRoot(config: Partial<AppConfig>): DynamicModule {
    return {
      module: AppModule,
      providers: [
        {
          provide: `${AppConfig.name}_loader`,
          useFactory: async (emptyAppConfig: AppConfig) => {
            if (config.constructor !== Object) {
              Object.setPrototypeOf(emptyAppConfig, config);
            }
            const obj = await configTransform({
              model: AppConfig,
              data: config,
            });
            Object.assign(emptyAppConfig, obj.data);
          },
          inject: [AppConfig],
        },
      ],
    };
  }
}

// Let's try to launch the application - Example with throw validation error.
async function bootstrap1() {
  const app = await NestFactory.create(AppModule.forRoot({}));
  await app.listen(3000);
}

// Now we get a config validation error.
// throw new ConfigModelValidationErrors(validateErrors);
// isNotEmpty: option should not be empty
bootstrap1();

// Let's try to launch the application - Example of start without error.
async function bootstrap2() {
  const app = await NestFactory.create(AppModule.forRoot({ option: 'value1' }));
  console.log(app.get(AppConfig)); // output: { option: 'value1' }
  await app.listen(3000);
}

bootstrap2();
```

[Back to Top](#decorators-and-functions)

## Env model

Decorators for describing module environment variables and functions for its serialization and verification.
Values can be automatically read from process.env.

### Usage

```typescript
import { EnvModel, EnvModelProperty, envTransform } from '@nestjs-mod/common';
import { DynamicModule, Module } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { IsNotEmpty } from 'class-validator';

// We describe the configuration.
@EnvModel()
class AppEnv {
  @EnvModelProperty()
  @IsNotEmpty()
  option!: string;
}

// We describe the module.
@Module({ providers: [AppEnv] })
class AppModule {
  static forRoot(env: Partial<AppEnv>): DynamicModule {
    return {
      module: AppModule,
      providers: [
        {
          provide: `${AppEnv.name}_loader`,
          useFactory: async (emptyAppEnv: AppEnv) => {
            if (env.constructor !== Object) {
              Object.setPrototypeOf(emptyAppEnv, env);
            }
            const obj = await envTransform({
              model: AppEnv,
              data: env,
            });
            Object.assign(emptyAppEnv, obj.data);
          },
          inject: [AppEnv],
        },
      ],
    };
  }
}

// Let's try to launch the application - Example with throw validation error.
async function bootstrap1() {
  const app = await NestFactory.create(AppModule.forRoot({}));
  await app.listen(3000);
}

// Now we get a config validation error.
// throw new ConfigModelValidationErrors(validateErrors);
// isNotEmpty: option should not be empty
bootstrap1();

// Let's try to launch the application - Example of start without error.
async function bootstrap2() {
  const app = await NestFactory.create(AppModule.forRoot({ option: 'value1' }));
  console.log(app.get(AppEnv)); // output: { option: 'value1' }
  await app.listen(3000);
}

bootstrap2();

// Let's try to launch the application - Example of use environment variables and start without error.
async function bootstrap3() {
  process.env['OPTION'] = 'value1';
  const app = await NestFactory.create(AppModule.forRoot({}));
  console.log(app.get(AppEnv)); // output: { option: 'value1' }
  await app.listen(3000);
}

bootstrap3();
```

[Back to Top](#decorators-and-functions)

## NestJS module

Function for creating a configurable module with the ability to use multi-providing.
It is possible to create and work with named module instances.
Modules can contain code for creating and managing the application (preWrapApplication, wrapApplication, postWrapApplication).

Type of config or env models used in module:

- `environmentsModel` - Variables with primitive types used in the module, the values of which can be obtained from various sources, such as: process.env or consul key value.
- `configurationModel` - Variables of primitive and complex types that are used in the module; values for them must be passed when connecting the module to the application.
- `staticEnvironmentsModel` - Static variables with primitive types used in the module and can be used at the time of generating module metadata (import, controllers), the values of which can be obtained from various sources, such as: process.env or consul key value.
- `staticConfigurationModel` - Static variables of primitive and complex types that are used in the module and can be used at the time of generating module metadata (import, controllers), values can be obtained from various sources, such as: process.env or the value of the consul key.
- `featureConfigurationModel` - Feature variables of primitive and complex types that can be added to the current module from other modules (example: a transport for sending a message can be defined as a generalized interface, but the implementation itself will be added from a module for working with a specific transport or from an integration module).

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

[Back to Top](#decorators-and-functions)

## NestJS application

Function for sequential import of nestModules.
When importing, all preWrapApplication methods of modules are run at the beginning, then all wrapApplication methods, and at the very end all postWrapApplication methods.

Types of modules (list in order of processing):

- `Core modules` - Core modules necessary for the operation of feature and integration modules (examples: main module with connection to the database, main module for connecting to aws, etc.).
- `Feature modules` - Feature modules with business logic of the application.
- `Integration modules` - Integration modules are necessary to organize communication between feature or core modules (example: after creating a user in the UsersModule feature module, you need to send him a letter from the NotificationsModule core module).
- `System modules` - System modules necessary for the operation of the entire application (examples: launching a nestjs application, launching microservices, etc.).
- `Infrastructure modules` - Infrastructure modules are needed to create configurations that launch various external services (examples: docker-compose file for raising a database, gitlab configuration for deploying an application).

### Usage

```typescript
import { DefaultNestApplicationInitializer, DefaultNestApplicationListener, EnvModel, EnvModelProperty, bootstrapNestApplication, createNestModule } from '@nestjs-mod/common';
import { Injectable, Logger } from '@nestjs/common';
import { IsNotEmpty } from 'class-validator';

@EnvModel()
class AppEnv {
  @EnvModelProperty()
  @IsNotEmpty()
  option!: string;
}

@Injectable()
class AppService {
  constructor(private readonly appEnv: AppEnv) {}

  getEnv() {
    return this.appEnv;
  }
}

const { AppModule } = createNestModule({
  moduleName: 'AppModule',
  environmentsModel: AppEnv,
  providers: [AppService],
});

process.env['OPTION'] = 'value1';

const globalPrefix = 'api';

bootstrapNestApplication({
  project: { name: 'TestApp', description: 'Test application' },
  modules: {
    system: [
      DefaultNestApplicationInitializer.forRoot(),
      DefaultNestApplicationListener.forRoot({
        staticEnvironments: { port: 3000 },
        staticConfiguration: {
          preListen: async ({ app }) => {
            if (app) {
              const appService = app.get(AppService);
              console.log(appService.getEnv()); // output: { option: 'value1' }
              app.setGlobalPrefix(globalPrefix);
            }
          },
          postListen: async ({ current }) => {
            Logger.log(`🚀 Application is running on: http://${current.staticEnvironments?.hostname ?? 'localhost'}:${current.staticEnvironments?.port}/${globalPrefix}`);
          },
        },
      }),
    ],
    feature: [AppModule.forRoot()],
  },
});
```

[Back to Top](#decorators-and-functions)

## InfrastructureMarkdownReportGenerator

Infrastructure markdown report generator.

#### Static configuration (default)

| Key            | Description                                                          | Constraints  | Value                                                                 |
| -------------- | -------------------------------------------------------------------- | ------------ | --------------------------------------------------------------------- |
| `markdownFile` | Name of the markdown-file in which to save the infrastructure report | **optional** | `/home/endy/Projects/nestjs-mod/apps/example-basic/INFRASTRUCTURE.MD` |

[Back to Top](#modules)

## DefaultNestApplicationInitializer

Default NestJS application initializer, no third party utilities required.

#### Static configuration (default)

| Key            | Description                                                                               | Constraints  | Value |
| -------------- | ----------------------------------------------------------------------------------------- | ------------ | ----- |
| `cors`         | CORS options from [CORS package](https://github.com/expressjs/cors#configuration-options) | **optional** | -     |
| `bodyParser`   | Whether to use underlying platform body parser.                                           | **optional** | -     |
| `httpsOptions` | Set of configurable HTTPS options                                                         | **optional** | -     |
| `rawBody`      | Whether to register the raw request body on the request. Use `req.rawBody`.               | **optional** | -     |

[Back to Top](#modules)

## DefaultNestApplicationListener

Default NestJS application listener, no third party utilities required.

#### Static environments (default)

| Key        | Description                                       | Source                                       | Constraints                               | Value  |
| ---------- | ------------------------------------------------- | -------------------------------------------- | ----------------------------------------- | ------ |
| `port`     | The port on which to run the server.              | `obj['port']`, `process.env['PORT']`         | **isNotEmpty** (port should not be empty) | `3000` |
| `hostname` | Hostname on which to listen for incoming packets. | `obj['hostname']`, `process.env['HOSTNAME']` | **optional**                              | -      |

#### Static configuration (default)

| Key          | Description                                    | Constraints  | Value    |
| ------------ | ---------------------------------------------- | ------------ | -------- |
| `preListen`  | Method for additional actions before listening | **optional** | Function |
| `postListen` | Method for additional actions after listening  | **optional** | Function |

[Back to Top](#modules)

## License

MIT

[npm-image]: https://badgen.net/npm/v/@nestjs-mod/common
[npm-url]: https://npmjs.org/package/@nestjs-mod/common
[telegram-image]: https://img.shields.io/badge/bot-group-blue.svg?maxAge=2592000
[telegram-url]: https://t.me/nestjs_mod
[downloads-image]: https://badgen.net/npm/dm/@nestjs-mod/common
[downloads-url]: https://npmjs.org/package/@nestjs-mod/common
