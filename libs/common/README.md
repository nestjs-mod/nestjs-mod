# @nestjs-mod/common

A collection of utilities for unifying NestJS applications and modules

[![NPM version][npm-image]][npm-url] [![monthly downloads][downloads-image]][downloads-url] [![Telegram][telegram-image]][telegram-url] [![Discord][discord-image]][discord-url]

## Installation

```bash
npm i --save @nestjs-mod/common
```

## Utilities

| Link                                      | Description                                                                                                  |
| ----------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| [Config model](#config-model)             | Decorators for describing the module configuration and a function for its serialization and validation.      |
| [Env model](#env-model)                   | Decorators for describing module environment variables and functions for its serialization and verification. |
| [NestJS application](#nestjs-application) | Function for sequential import of nestModules.                                                               |
| [NestJS module](#nestjs-module)           | Function for creating a configurable module with the ability to use multi-providing.                         |

## Modules

| Link                                                                            | Category       | Description                                                                                                                 |
| ------------------------------------------------------------------------------- | -------------- | --------------------------------------------------------------------------------------------------------------------------- |
| [InfrastructureMarkdownReportGenerator](#infrastructuremarkdownreportgenerator) | infrastructure | Infrastructure markdown report generator.                                                                                   |
| [InfrastructureMarkdownReportStorage](#infrastructuremarkdownreportstorage)     | infrastructure | Infrastructure markdown report storage                                                                                      |
| [DefaultNestApplicationInitializer](#defaultnestapplicationinitializer)         | system         | Default NestJS application initializer.                                                                                     |
| [DefaultNestApplicationListener](#defaultnestapplicationlistener)               | system         | Default NestJS application listener.                                                                                        |
| [ProjectUtils](#projectutils)                                                   | system         | Utilities for setting global application parameters, such as project name, description, and settings validation parameters. |

## Utilities descriptions

### Config model

Decorators for describing the module configuration and a function for its serialization and validation.
Values for this type of configuration must be described in code.

#### Decorators

`ConfigModel`, `ConfigModelProperty`

#### Function

`configTransform`

#### Usage

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

[Back to Top](#utilities)

---

### Env model

Decorators for describing module environment variables and functions for its serialization and verification.
Values can be automatically read from process.env.

#### Decorators

`EnvModel`, `EnvModelProperty`

#### Function

`envTransform`

#### Usage

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

[Back to Top](#utilities)

---

### NestJS application

Function for sequential import of nestModules.
When importing, all preWrapApplication methods of modules are run at the beginning, then all wrapApplication methods, and at the very end all postWrapApplication methods.

Types of modules (list in order of processing):

- `System modules` - System modules necessary for the operation of the entire application (examples: launching a NestJS application, launching microservices, etc.). Only NestJS-mod compatible modules.
- `Core modules` - Core modules necessary for the operation of feature and integration modules (examples: main module with connection to the database, main module for connecting to aws, etc.). NestJS and NestJS-mod compatible modules.
- `Feature modules` - Feature modules with business logic of the application. NestJS and NestJS-mod compatible modules.
- `Integration modules` - Integration modules are necessary to organize communication between feature or core modules (example: after creating a user in the UsersModule feature module, you need to send him a letter from the NotificationsModule core module). NestJS and NestJS-mod compatible modules.
- `Infrastructure modules` - Infrastructure modules are needed to create configurations that launch various external services (examples: docker-compose file for raising a database, gitlab configuration for deploying an application). Only NestJS-mod compatible modules.

### Function

`bootstrapNestApplication`

#### Usage

```typescript
import {
  isInfrastructureMode,
  DefaultNestApplicationInitializer,
  DefaultNestApplicationListener,
  EnvModel,
  EnvModelProperty,
  bootstrapNestApplication,
  createNestModule,
} from '@nestjs-mod/common';
import { Injectable } from '@nestjs/common';
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

bootstrapNestApplication({
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
            }
          },
        },
      }),
    ],
    feature: [AppModule.forRoot()],
  },
});
```

#### Usage with project name and contextName

```typescript
  isInfrastructureMode,
import {
  DefaultNestApplicationInitializer,
  DefaultNestApplicationListener,
  EnvModel,
  EnvModelProperty,
  bootstrapNestApplication,
  createNestModule,
} from '@nestjs-mod/common';
import { Injectable } from '@nestjs/common';
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

process.env['TEST_APP_CTX_OPTION'] = 'value1';

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
            }
          },
        },
      }),
    ],
    feature: [AppModule.forRoot({ contextName: 'CTX' })],
  },
});
```

[Back to Top](#utilities)

---

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
- `featureEnvironmentsModel` - Feature variables with primitive types used in the module, the values of which can be obtained from various sources, such as: process.env or consul key value.

#### Decorators

`InjectFeatures`, `InjectService`, `InjectAllFeatures`, `InjectFeatureEnvironments`, `InjectAllFeatureEnvironments`

#### Function

`createNestModule`, `getNestModuleDecorators`

### Usage

```typescript
import {
  ConfigModel,
  ConfigModelProperty,
  EnvModel,
  EnvModelProperty,
  createNestModule,
  getNestModuleDecorators,
  InjectableFeatureConfigurationType,
} from '@nestjs-mod/common';
import { Injectable } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { IsNotEmpty } from 'class-validator';

// App1Module

const { InjectFeatures } = getNestModuleDecorators({
  moduleName: 'App1Module',
});

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
    private readonly appFeatureConfigs: InjectableFeatureConfigurationType<AppFeatureConfig>[]
  ) {}

  getFeatureConfigs() {
    return this.appFeatureConfigs.map(({ featureConfiguration }) => featureConfiguration);
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
  imports: [
    App1Module.forFeature({
      featureModuleName: 'App2Module',
      featureConfiguration: { featureOptionConfig: 'featureOptionConfig-app2' },
    }),
  ],
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
  imports: [
    App1Module.forFeature({
      featureModuleName: 'App2Module',
      featureConfiguration: { featureOptionConfig: 'featureOptionConfig-app3' },
    }),
  ],
  providers: [App3Service],
  environmentsModel: App3Env,
});

const { AppModule } = createNestModule({
  moduleName: 'AppModule',
  imports: [
    App1Module.forRoot(),
    App2Module.forRoot({ configuration: { option: 'appConfig3value' } }),
    App3Module.forRoot({ environments: { option: 'appEnv2value' } }),
  ],
});

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

[Back to Top](#utilities)

## Modules descriptions

### InfrastructureMarkdownReportGenerator

Infrastructure markdown report generator.

#### Use in NestJS-mod

Use with options.

```typescript
import { bootstrapNestApplication, InfrastructureMarkdownReportGenerator } from '@nestjs-mod/common';
import { join } from 'path';

const appFolder = join(__dirname, '..', '..', '..', 'apps', 'example-basic');

bootstrapNestApplication({
  modules: {
    infrastructure: [
      InfrastructureMarkdownReportGenerator.forRoot({
        staticConfiguration: {
          markdownFile: join(appFolder, 'INFRASTRUCTURE.MD'),
          skipEmptySettings: true,
        },
      }),
    ],
  },
});
```

#### Shared providers

`DynamicNestModuleMetadataMarkdownReportGenerator`

#### Static configuration

| Key                 | Description                                                          | Constraints  | Default | Value |
| ------------------- | -------------------------------------------------------------------- | ------------ | ------- | ----- |
| `markdownFile`      | Name of the markdown-file in which to save the infrastructure report | **optional** | -       | -     |
| `skipEmptySettings` | Skip empty values of env and config models                           | **optional** | -       | -     |

[Back to Top](#modules)

---

### InfrastructureMarkdownReportStorage

Infrastructure markdown report storage

#### Use in NestJS-mod

Use the forRoot method to create a global report store.

```typescript
import { bootstrapNestApplication, InfrastructureMarkdownReportStorage } from '@nestjs-mod/common';

bootstrapNestApplication({
  modules: {
    infrastructure: [InfrastructureMarkdownReportStorage.forRoot()],
  },
});
```

An example of using global storage in a module.

```typescript
import {
  bootstrapNestApplication,
  createNestModule,
  DefaultNestApplicationInitializer,
  DefaultNestApplicationListener,
  InfrastructureMarkdownReportGenerator,
  InfrastructureMarkdownReportStorage,
  InfrastructureMarkdownReportStorageService,
} from '@nestjs-mod/common';
import { Injectable } from '@nestjs/common';

@Injectable()
class AppReportService {
  constructor(private readonly infrastructureMarkdownReportStorage: InfrastructureMarkdownReportStorageService) {}

  getReport() {
    return this.infrastructureMarkdownReportStorage.report;
  }
}

const { App1Module } = createNestModule({
  moduleName: 'App1Module',
  imports: [InfrastructureMarkdownReportStorage.forFeature()],
  providers: [AppReportService],
});

bootstrapNestApplication({
  modules: {
    infrastructure: [InfrastructureMarkdownReportStorage.forRoot(), InfrastructureMarkdownReportGenerator.forRoot()],
    system: [
      DefaultNestApplicationInitializer.forRoot(),
      DefaultNestApplicationListener.forRoot({
        staticConfiguration: {
          postListen: async ({ app }) => {
            if (app) {
              const appReportService = app.get(AppReportService);

              console.log(appReportService.getReport()); // # TestApp ...
            }
          },
        },
        staticEnvironments: { port: 3012 },
      }),
    ],
    feature: [App1Module.forRoot()],
  },
});
```

#### Shared providers

`InfrastructureMarkdownReportStorageService`

[Back to Top](#modules)

---

### DefaultNestApplicationInitializer

Default NestJS application initializer.

#### Use in NestJS-mod

Use without options.

```typescript
import { bootstrapNestApplication, DefaultNestApplicationInitializer } from '@nestjs-mod/common';

bootstrapNestApplication({
  modules: {
    system: [DefaultNestApplicationInitializer.forRoot()],
  },
});
```

Example of change cors options.

```typescript
import { bootstrapNestApplication, DefaultNestApplicationInitializer } from '@nestjs-mod/common';

bootstrapNestApplication({
  modules: {
    system: [
      DefaultNestApplicationInitializer.forRoot({
        staticConfiguration: {
          cors: {
            origin: '*',
            methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
            preflightContinue: false,
            optionsSuccessStatus: 204,
          },
        },
      }),
    ],
  },
});
```

#### Static configuration

| Key                     | Description                                                                                                                                                                                                                             | Constraints  | Default                                                           | Value |
| ----------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------ | ----------------------------------------------------------------- | ----- |
| `cors`                  | CORS options from [CORS package](https://github.com/expressjs/cors#configuration-options)                                                                                                                                               | **optional** | `{"credentials":true,"methods":"GET,HEAD,PUT,PATCH,POST,DELETE"}` | -     |
| `bodyParser`            | Whether to use underlying platform body parser.                                                                                                                                                                                         | **optional** | -                                                                 | -     |
| `httpsOptions`          | Set of configurable HTTPS options                                                                                                                                                                                                       | **optional** | -                                                                 | -     |
| `rawBody`               | Whether to register the raw request body on the request. Use `req.rawBody`.                                                                                                                                                             | **optional** | -                                                                 | -     |
| `defaultLogger`         | Default logger for application                                                                                                                                                                                                          | **optional** | -                                                                 | -     |
| `logger`                | Specifies the logger to use. Pass `false` to turn off logging.                                                                                                                                                                          | **optional** | -                                                                 | -     |
| `abortOnError`          | Whether to abort the process on Error. By default, the process is exited. Pass `false` to override the default behavior. If `false` is passed, Nest will not exit the application and instead will rethrow the exception. @default true | **optional** | -                                                                 | -     |
| `bufferLogs`            | If enabled, logs will be buffered until the "Logger#flush" method is called. @default false                                                                                                                                             | **optional** | -                                                                 | -     |
| `autoFlushLogs`         | If enabled, logs will be automatically flushed and buffer detached when application initialization process either completes or fails. @default true                                                                                     | **optional** | -                                                                 | -     |
| `preview`               | Whether to run application in the preview mode. In the preview mode, providers/controllers are not instantiated & resolved. @default false                                                                                              | **optional** | -                                                                 | -     |
| `snapshot`              | Whether to generate a serialized graph snapshot. @default false                                                                                                                                                                         | **optional** | -                                                                 | -     |
| `forceCloseConnections` | Force close open HTTP connections. Useful if restarting your application hangs due to keep-alive connections in the HTTP adapter.                                                                                                       | **optional** | `true`                                                            | -     |

[Back to Top](#modules)

---

### DefaultNestApplicationListener

Default NestJS application listener.

#### Use in NestJS-mod

Use with manual environments and custom configuration.

```typescript
import {
  bootstrapNestApplication,
  DefaultNestApplicationInitializer,
  DefaultNestApplicationListener,
  isInfrastructureMode,
} from '@nestjs-mod/common';
import { Logger } from '@nestjs/common';

bootstrapNestApplication({
  modules: {
    system: [
      DefaultNestApplicationInitializer.forRoot(),
      DefaultNestApplicationListener.forRoot({
        staticEnvironments: { port: 3000 },
        staticConfiguration: {
          mode: isInfrastructureMode() ? 'silent' : 'listen',
          preListen: async ({ app }) => {
            if (app) {
              app.setGlobalPrefix('api');
            }
          },
          postListen: async ({ current }) => {
            Logger.log(
              `🚀 Application is running on: http://${current.staticEnvironments?.hostname || 'localhost'}:${
                current.staticEnvironments?.port
              }/api`
            );
          },
        },
      }),
    ],
  },
});
```

#### Static environments

| Key        | Description                                       | Sources                                      | Constraints                               | Default | Value |
| ---------- | ------------------------------------------------- | -------------------------------------------- | ----------------------------------------- | ------- | ----- |
| `port`     | The port on which to run the server.              | `obj['port']`, `process.env['PORT']`         | **isNotEmpty** (port should not be empty) | -       | -     |
| `hostname` | Hostname on which to listen for incoming packets. | `obj['hostname']`, `process.env['HOSTNAME']` | **optional**                              | -       | -     |

#### Static configuration

| Key                   | Description                                                                                             | Constraints  | Default  | Value |
| --------------------- | ------------------------------------------------------------------------------------------------------- | ------------ | -------- | ----- |
| `mode`                | Mode of start application: init - for run NestJS life cycle, listen - for full start NestJS application | **optional** | `listen` | -     |
| `preListen`           | Method for additional actions before listening                                                          | **optional** | -        | -     |
| `postListen`          | Method for additional actions after listening                                                           | **optional** | -        | -     |
| `defaultLogger`       | Default logger for application                                                                          | **optional** | -        | -     |
| `enableShutdownHooks` | Enable shutdown hooks                                                                                   | **optional** | `true`   | -     |
| `globalPrefix`        | Global prefix                                                                                           | **optional** | `api`    | -     |
| `logApplicationStart` | Log application start                                                                                   | **optional** | `true`   | -     |

[Back to Top](#modules)

---

### ProjectUtils

Utilities for setting global application parameters, such as project name, description, and settings validation parameters.

#### Use in NestJS-mod

Use with options.

```typescript
import { DOT_ENV_FILE, PACKAGE_JSON_FILE, ProjectUtils, bootstrapNestApplication } from '@nestjs-mod/common';
import { join } from 'path';

const rootFolder = join(__dirname, '..', '..', '..');
const appFolder = join(rootFolder, 'apps', 'example-basic');

bootstrapNestApplication({
  modules: {
    system: [
      ProjectUtils.forRoot({
        staticConfiguration: {
          applicationPackageJsonFile: join(appFolder, PACKAGE_JSON_FILE),
          packageJsonFile: join(rootFolder, PACKAGE_JSON_FILE),
          envFile: join(rootFolder, DOT_ENV_FILE),
        },
      }),
    ],
  },
});
```

An example of access to module services with forFeature.

```typescript
import {
  DOT_ENV_FILE,
  DefaultNestApplicationInitializer,
  DefaultNestApplicationListener,
  DotEnvService,
  PACKAGE_JSON_FILE,
  ProjectUtils,
  bootstrapNestApplication,
  createNestModule,
} from '@nestjs-mod/common';
import { Injectable } from '@nestjs/common';
import { join } from 'path';

@Injectable()
class GetEnv {
  constructor(private readonly dotEnvService: DotEnvService) {}
  getEnv() {
    return this.dotEnvService.read();
  }

  getKeys() {
    return this.dotEnvService.keys(true);
  }
}
const { AppModule } = createNestModule({
  moduleName: 'AppModule',
  imports: [ProjectUtils.forFeature()],
  providers: [GetEnv],
});

const rootFolder = join(__dirname, '..', '..', '..');
const appFolder = join(rootFolder, 'apps', 'example-basic');

process.env.TEST_APP_PORT = '2000';
process.env.TEST_APP_HOSTNAME = 'host';

bootstrapNestApplication({
  project: {
    name: 'test-app',
    description: 'Description for test-app',
  },
  globalEnvironmentsOptions: { debug: true },
  modules: {
    system: [
      ProjectUtils.forRoot({
        staticConfiguration: {
          applicationPackageJsonFile: join(appFolder, PACKAGE_JSON_FILE),
          envFile: join(rootFolder, DOT_ENV_FILE),
        },
      }),
      DefaultNestApplicationInitializer.forRoot(),
      DefaultNestApplicationListener.forRoot({
        staticConfiguration: {
          mode: 'silent',
          postListen: async ({ app }) => {
            if (app) {
              const getEnv = app.get(GetEnv);
              console.log(await getEnv.getEnv()); // output: { TEST_APP_PORT: '2000', TEST_APP_HOSTNAME: 'host' }
            }
          },
        },
      }),
    ],
    feature: [AppModule.forRoot()],
  },
});
```

When launched in the infrastructure documentation generation mode, the module creates an `.env` file with a list of all required variables, as well as an example `example.env`, where you can enter example variable values.

#### Shared providers

`WrapApplicationOptionsService`, `DotEnvService`, `PackageJsonService`, `ApplicationPackageJsonService`, `GitignoreService`, `NxProjectJsonService`, `ProjectUtilsPatcherService`

#### Static configuration

| Key                                               | Description                                   | Constraints  | Default | Value |
| ------------------------------------------------- | --------------------------------------------- | ------------ | ------- | ----- |
| `applicationPackageJsonFile`                      | Application package.json-file                 | **optional** | -       | -     |
| `packageJsonFile`                                 | Root package.json-file                        | **optional** | -       | -     |
| `nxProjectJsonFile`                               | Application project.json-file (nx)            | **optional** | -       | -     |
| `envFile`                                         | Dot-env file with environment variables       | **optional** | -       | -     |
| `updateEnvFile`                                   | Update env-file                               | **optional** | `true`  | -     |
| `updateProjectOptions`                            | Update project properties                     | **optional** | `true`  | -     |
| `updateGlobalConfigurationAndEnvironmentsOptions` | Update configuration and environments options | **optional** | `true`  | -     |

[Back to Top](#modules)

## Links

- https://github.com/nestjs-mod/nestjs-mod - A collection of utilities for unifying NestJS applications and modules
- https://github.com/nestjs-mod/nestjs-mod-contrib - Contrib repository for the NestJS-mod
- https://github.com/nestjs-mod/nestjs-mod-example - Example application built with [@nestjs-mod/schematics](https://github.com/nestjs-mod/nestjs-mod/tree/master/libs/schematics)
- https://github.com/nestjs-mod/nestjs-mod/blob/master/apps/example-basic/INFRASTRUCTURE.MD - A simple example of infrastructure documentation.
- https://github.com/nestjs-mod/nestjs-mod-contrib/blob/master/apps/example-prisma/INFRASTRUCTURE.MD - An extended example of infrastructure documentation with a docker-compose file and a data base.
- https://dev.to/endykaufman/collection-of-nestjs-mod-utilities-for-unifying-applications-and-modules-on-nestjs-5256 - Article about the project NestJS-mod

* https://habr.com/ru/articles/788916 - Коллекция утилит NestJS-mod для унификации приложений и модулей на NestJS

## License

MIT

[npm-image]: https://badgen.net/npm/v/@nestjs-mod/common
[npm-url]: https://npmjs.org/package/@nestjs-mod/common
[telegram-image]: https://img.shields.io/badge/group-telegram-blue.svg?maxAge=2592000
[telegram-url]: https://t.me/nestjs_mod
[discord-image]: https://img.shields.io/badge/discord-online-brightgreen.svg
[discord-url]: https://discord.gg/meY7UXaG
[downloads-image]: https://badgen.net/npm/dm/@nestjs-mod/common
[downloads-url]: https://npmjs.org/package/@nestjs-mod/common
