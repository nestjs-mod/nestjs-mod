/* eslint-disable no-useless-escape */
import { Injectable } from '@nestjs/common';
import { IsNotEmpty } from 'class-validator';
import { ConfigModel, ConfigModelProperty } from '../config-model/decorators';
import { EnvModel, EnvModelProperty } from '../env-model/decorators';
import {
  InfrastructureMarkdownReportGenerator,
  InfrastructureMarkdownReportStorage,
  InfrastructureMarkdownReportStorageService,
} from '../modules/infrastructure/infrastructure-markdown-report/infrastructure-markdown-report';
import { DefaultNestApplicationInitializer } from '../modules/system/default-nest-application/default-nest-application-initializer';
import { DefaultNestApplicationListener } from '../modules/system/default-nest-application/default-nest-application-listener';
import { InjectableFeatureConfigurationType } from '../nest-module/types';
import { createNestModule, getNestModuleDecorators } from '../nest-module/utils';
import { bootstrapNestApplication } from './utils';

describe('NestJS application: Utils', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let originalExit: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let exitStatus: any;

  beforeAll(() => {
    originalExit = process.exit;
    process.exit = (status) => {
      exitStatus = status;
      return null as never;
    };
  });

  afterAll(() => {
    process.exit = originalExit;
  });

  afterEach(() => {
    exitStatus = null;
  });

  describe('NestJS application with env model', () => {
    it('should return error if option of env not set', async () => {
      @EnvModel()
      class AppEnv {
        @EnvModelProperty()
        @IsNotEmpty()
        option!: string;
      }

      const { AppModule } = createNestModule({
        moduleName: 'AppModule',
        environmentsModel: AppEnv,
      });

      await bootstrapNestApplication({
        project: { name: 'TestApp', description: 'Test application' },
        modules: {
          system: [DefaultNestApplicationInitializer.forRoot()],
          feature: [AppModule.forRoot()],
        },
      });

      expect(exitStatus).toEqual(1);
    });

    it('should return option value from service', async () => {
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

      process.env['TEST_APP_OPTION'] = 'value1';

      const app = await bootstrapNestApplication({
        globalEnvironmentsOptions: { debug: true },
        project: { name: 'TestApp', description: 'Test application' },
        modules: {
          system: [DefaultNestApplicationInitializer.forRoot()],
          feature: [AppModule.forRoot()],
        },
      });

      const appService = app.get(AppService);

      expect(appService.getEnv()).toMatchObject({ option: 'value1' });
    });

    it('should return option value from service of other module', async () => {
      @EnvModel()
      class App1Env {
        @EnvModelProperty()
        @IsNotEmpty()
        option!: string;
      }

      @Injectable()
      class App1Service {
        constructor(private readonly appEnv: App1Env) {}

        getEnv() {
          return this.appEnv;
        }
      }

      const { App1Module } = createNestModule({
        moduleName: 'App1Module',
        environmentsModel: App1Env,
        sharedProviders: [App1Service],
      });

      @Injectable()
      class App2Service {
        constructor(private readonly appService: App1Service) {}

        getEnv() {
          return this.appService.getEnv();
        }
      }

      const { App2Module } = createNestModule({
        moduleName: 'App2Module',
        imports: [App1Module.forFeature()],
        providers: [App2Service],
      });

      process.env['TEST_APP_OPTION'] = 'value1';

      const app = await bootstrapNestApplication({
        project: { name: 'TestApp', description: 'Test application' },
        modules: {
          system: [DefaultNestApplicationInitializer.forRoot()],
          feature: [App1Module.forRoot({}), App2Module.forRoot()],
        },
      });

      const app2Service = app.get(App2Service);

      expect(app2Service.getEnv()).toMatchObject({ option: 'value1' });
    });
  });

  describe('NestJS application with config model', () => {
    it('should return error if option of env not set', async () => {
      @ConfigModel()
      class AppConfig {
        @ConfigModelProperty()
        @IsNotEmpty()
        option!: string;
      }

      const { AppModule } = createNestModule({
        moduleName: 'AppModule',
        configurationModel: AppConfig,
      });

      await bootstrapNestApplication({
        project: { name: 'TestApp', description: 'Test application' },
        modules: {
          system: [DefaultNestApplicationInitializer.forRoot()],
          feature: [AppModule.forRoot()],
        },
      });

      expect(exitStatus).toEqual(1);
    });

    it('should return option value from service', async () => {
      @ConfigModel()
      class AppConfig {
        @ConfigModelProperty()
        @IsNotEmpty()
        option!: string;
      }

      @Injectable()
      class AppService {
        constructor(private readonly appConfig: AppConfig) {}

        getConfig() {
          return this.appConfig;
        }
      }

      const { AppModule } = createNestModule({
        moduleName: 'AppModule',
        configurationModel: AppConfig,
        sharedProviders: [AppService],
      });

      const app = await bootstrapNestApplication({
        project: { name: 'TestApp', description: 'Test application' },
        modules: {
          system: [DefaultNestApplicationInitializer.forRoot()],
          feature: [AppModule.forRoot({ configuration: { option: 'value1' } })],
        },
      });

      const appService = app.get(AppService);

      expect(appService.getConfig()).toMatchObject({ option: 'value1' });
    });

    it('should return option value from service of other module', async () => {
      @ConfigModel()
      class App1Config {
        @ConfigModelProperty()
        @IsNotEmpty()
        option!: string;
      }

      @Injectable()
      class App1Service {
        constructor(private readonly appConfig: App1Config) {}

        getConfig() {
          return this.appConfig;
        }
      }

      const { App1Module } = createNestModule({
        moduleName: 'App1Module',
        configurationModel: App1Config,
        sharedProviders: [App1Service],
      });
      const { InjectService } = getNestModuleDecorators({
        moduleName: 'App1Module',
      });

      @Injectable()
      class App2Service {
        constructor(
          @InjectService(App1Service)
          private readonly appService: App1Service
        ) {}

        getConfig() {
          return this.appService.getConfig();
        }
      }
      const { App2Module } = createNestModule({
        moduleName: 'App2Module',
        imports: [App1Module.forFeature()],
        providers: [App2Service],
      });

      const app = await bootstrapNestApplication({
        project: { name: 'TestApp', description: 'Test application' },
        modules: {
          system: [DefaultNestApplicationInitializer.forRoot()],
          feature: [App1Module.forRoot({ configuration: { option: 'value1' } }), App2Module.forRoot()],
        },
      });

      const app2Service = app.get(App2Service);

      expect(app2Service.getConfig()).toMatchObject({ option: 'value1' });
    });
  });
  describe('NestJS application with anv and config model', () => {
    it('should use env model and config model', async () => {
      @ConfigModel()
      class AppConfig {
        @ConfigModelProperty()
        @IsNotEmpty()
        optionConfig!: string;
      }

      @EnvModel()
      class AppEnv {
        @EnvModelProperty()
        @IsNotEmpty()
        optionEnv!: string;
      }

      @Injectable()
      class AppService {
        constructor(private readonly appConfig: AppConfig, private readonly appEnv: AppEnv) {}

        getEnv() {
          return this.appEnv;
        }

        getConfig() {
          return this.appConfig;
        }
      }

      const { AppModule } = createNestModule({
        moduleName: 'AppModule',
        providers: [AppService],
        configurationModel: AppConfig,
        environmentsModel: AppEnv,
      });

      process.env['TEST_APP_OPTION_ENV'] = 'optionEnv1';

      const app = await bootstrapNestApplication({
        project: { name: 'TestApp', description: 'Test application' },
        modules: {
          system: [DefaultNestApplicationInitializer.forRoot()],
          feature: [
            AppModule.forRoot({
              configuration: { optionConfig: 'optionConfig1' },
            }),
          ],
        },
      });

      const appService = app.get(AppService);

      expect(appService.getConfig()).toMatchObject({
        optionConfig: 'optionConfig1',
      });
      expect(appService.getEnv()).toMatchObject({ optionEnv: 'optionEnv1' });
    });
  });
  describe('NestJS application with multi-providing options', () => {
    it('should return all feature options', async () => {
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
      class AppFeatureScannerService {
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
        sharedProviders: [AppFeatureScannerService],
        featureConfigurationModel: AppFeatureConfig,
      });

      @Injectable()
      class App2Service {
        constructor(private readonly appFeatureScannerService: AppFeatureScannerService) {}

        getFeatureConfigs() {
          return this.appFeatureScannerService.getFeatureConfigs();
        }
      }

      // App2Module

      const { App2Module } = createNestModule({
        moduleName: 'App2Module',
        imports: [
          App1Module.forFeature({
            featureModuleName: 'App1Module',
            featureConfiguration: { featureOptionConfig: 'featureOptionConfig-app2' },
          }),
        ],
        providers: [App2Service],
      });

      @Injectable()
      class App3Service {
        constructor(private readonly appFeatureScannerService: AppFeatureScannerService) {}

        getFeatureConfigs() {
          return this.appFeatureScannerService.getFeatureConfigs();
        }
      }

      const { App3Module } = createNestModule({
        moduleName: 'App3Module',
        imports: [
          App1Module.forFeatureAsync({
            featureModuleName: 'App3Module',
            featureConfiguration: { featureOptionConfig: 'featureOptionConfig-app3' },
          }),
        ],
        providers: [App3Service],
      });

      // Test
      const app = await bootstrapNestApplication({
        project: { name: 'TestApp', description: 'Test application' },
        modules: {
          system: [DefaultNestApplicationInitializer.forRoot()],
          feature: [App1Module.forRoot(), App2Module.forRoot(), App3Module.forRoot()],
        },
      });

      const appFeatureScannerService = app.get(AppFeatureScannerService);
      const app2Service = app.get(App2Service);
      const app3Service = app.get(App3Service);

      expect(app2Service.getFeatureConfigs()).toMatchObject([
        { featureOptionConfig: 'featureOptionConfig-app2' },
        { featureOptionConfig: 'featureOptionConfig-app3' },
      ]);
      expect(app3Service.getFeatureConfigs()).toMatchObject([
        { featureOptionConfig: 'featureOptionConfig-app2' },
        { featureOptionConfig: 'featureOptionConfig-app3' },
      ]);
      expect(appFeatureScannerService.getFeatureConfigs()).toMatchObject([
        { featureOptionConfig: 'featureOptionConfig-app2' },
        { featureOptionConfig: 'featureOptionConfig-app3' },
      ]);
    });
  });
  describe('NestJS application get markdown of infrastructure', () => {
    it('should return markdown of infrastructure', async () => {
      process.env['NESTJS_MODE'] = 'infrastructure';
      // App1Module

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

      // Test
      const app = await bootstrapNestApplication({
        project: { name: 'TestApp', description: 'Test application' },
        modules: {
          infrastructure: [
            InfrastructureMarkdownReportStorage.forRoot(),
            InfrastructureMarkdownReportGenerator.forRoot(),
          ],
          system: [
            DefaultNestApplicationInitializer.forRoot(),
            DefaultNestApplicationListener.forRoot({
              staticEnvironments: { port: 3012 },
            }),
          ],
          feature: [App1Module.forRoot()],
        },
      });

      const appReportService = app.get(AppReportService);
      expect(appReportService.getReport().split('  ').join('').split('\n').join('')).toEqual(
        `# TestApp

    Test application

    ## System modules
    System modules necessary for the operation of the entire application (examples: launching a NestJS application, launching microservices, etc.). Only NestJS-mod compatible modules.

    ### DefaultNestApplicationInitializer
    Default NestJS application initializer.

    #### Static configuration
    Static variables of primitive and complex types that are used in the module and can be used at the time of generating module metadata (import, controllers); values for them must be passed when connecting the module to the application.

    | Key| Description | Constraints | Default | Value |
    | ------ | ----------- | ----------- | ------- | ----- |
    |\`cors\`|CORS options from [CORS package](https://github.com/expressjs/cors#configuration-options)|**optional**|\`\`\`{\"credentials\":true,\"methods\":\"GET,HEAD,PUT,PATCH,POST,DELETE\"}\`\`\`|\`\`\`{\"credentials\":true,\"methods\":\"GET,HEAD,PUT,PATCH,POST,DELETE\"}\`\`\`|
    |\`bodyParser\`|Whether to use underlying platform body parser.|**optional**|-|-|
    |\`httpsOptions\`|Set of configurable HTTPS options|**optional**|-|-|
    |\`rawBody\`|Whether to register the raw request body on the request. Use \`req.rawBody\`.|**optional**|-|-|
    |\`defaultLogger\`|Default logger for application|**optional**|-|-|
    |\`logger\`|Specifies the logger to use.Pass \`false\` to turn off logging.|**optional**|-|-|
    |\`abortOnError\`|Whether to abort the process on Error. By default, the process is exited. Pass \`false\` to override the default behavior. If \`false\` is passed, Nest will not exit the application and instead will rethrow the exception. @default true|**optional**|-|-|
    |\`bufferLogs\`|If enabled, logs will be buffered until the \"Logger#flush\" method is called. @default false|**optional**|-|-|
    |\`autoFlushLogs\`|If enabled, logs will be automatically flushed and buffer detached when application initialization process either completes or fails. @default true|**optional**|-|-|
    |\`preview\`|Whether to run application in the preview mode. In the preview mode, providers/controllers are not instantiated & resolved. @default false|**optional**|-|-|
    |\`snapshot\`|Whether to generate a serialized graph snapshot. @default false|**optional**|-|-|
    |\`forceCloseConnections\`|Force close open HTTP connections. Useful if restarting your application hangs due to keep-alive connections in the HTTP adapter.|**optional**|\`\`\`true\`\`\`|\`\`\`true\`\`\`|

    ## Integration modules
    
    Integration modules are necessary to organize communication between feature or core modules (example: after creating a user in the UsersModule feature module, you need to send him a letter from the NotificationsModule core module). NestJS and NestJS-mod compatible modules.

    ### DefaultNestApplicationListener
    Default NestJS application listener.

    #### Static environments
    Static variables with primitive types used in the module and can be used at the time of generating module metadata (import, controllers), the values of which can be obtained from various sources, such as: process.env or consul key value.

    | Key| Description | Sources | Constraints | Default | Value |
    | ------ | ----------- | ------- | ----------- | ------- | ----- |
    |\`port\`|The port on which to run the server.|\`obj['port']\`, \`process.env['TEST_APP_PORT']\`|**optional**|\`\`\`3000\`\`\`|\`\`\`3012\`\`\`|
    |\`hostname\`|Hostname on which to listen for incoming packets.|\`obj['hostname']\`, \`process.env['TEST_APP_HOSTNAME']\`|**optional**|-|-|

    #### Static configuration
    Static variables of primitive and complex types that are used in the module and can be used at the time of generating module metadata (import, controllers); values for them must be passed when connecting the module to the application.

    | Key| Description | Constraints | Default | Value |
    | ------ | ----------- | ----------- | ------- | ----- |
    |\`mode\`|Mode of start application: init - for run NestJS life cycle, listen -  for full start NestJS application|**optional**|\`\`\`listen\`\`\`|\`\`\`listen\`\`\`|
    |\`preListen\`|Method for additional actions before listening|**optional**|-|-|
    |\`postListen\`|Method for additional actions after listening|**optional**|-|-|
    |\`defaultLogger\`|Default logger for application|**optional**|-|-|
    |\`enableShutdownHooks\`|Enable shutdown hooks|**optional**|\`\`\`false\`\`\`|\`\`\`false\`\`\`|
    |\`globalPrefix\`|Global prefix|**optional**|\`\`\`api\`\`\`|\`\`\`api\`\`\`|    
    |\`autoCloseTimeoutInInfrastructureMode\`|Timeout seconds for automatically closes the application in \`infrastructure mode\` if the application does not close itself (zero - disable)|**optional**|-|-|
    |\`logApplicationStart\`|Log application start|**optional**|\`\`\`true\`\`\`|\`\`\`true\`\`\`|

    ## Infrastructure modules
    Infrastructure modules are needed to create configurations that launch various external services (examples: docker-compose file for raising a database, gitlab configuration for deploying an application). Only NestJS-mod compatible modules.

    ### InfrastructureMarkdownReportStorage
    Infrastructure markdown report storage

    #### Shared providers
    \`InfrastructureMarkdownReportStorageService\`


    ### InfrastructureMarkdownReportGenerator
    Infrastructure markdown report generator.

    #### Shared providers
    \`DynamicNestModuleMetadataMarkdownReportGenerator\`

    #### Static configuration
    Static variables of primitive and complex types that are used in the module and can be used at the time of generating module metadata (import, controllers); values for them must be passed when connecting the module to the application.

    | Key| Description | Constraints | Default | Value |
    | ------ | ----------- | ----------- | ------- | ----- |
    |\`markdownFile\`|Name of the markdown-file in which to save the infrastructure report|**optional**|-|-|
    |\`skipEmptySettings\`|Skip empty values of env and config models|**optional**|-|-|
    |\`style\`|Report generation style|**optional**|\`\`\`full\`\`\`|\`\`\`full\`\`\`|

`
          .split('  ')
          .join('')
          .split('\n')
          .join('')
      );

      await app.close();

      process.env['NESTJS_MODE'] = undefined;
    });
  });
});
