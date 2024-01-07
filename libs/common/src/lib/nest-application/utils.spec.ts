import { Injectable } from '@nestjs/common';
import { IsNotEmpty } from 'class-validator';
import { ConfigModel, ConfigModelProperty } from '../config-model/decorators';
import { EnvModel, EnvModelProperty } from '../env-model/decorators';
import {
  InfrastructureMarkdownReport,
  InfrastructureMarkdownReportGenerator,
  InfrastructureMarkdownReportStorage,
} from '../modules/infrastructure/infrastructure-markdown-report/infrastructure-markdown-report';
import { DefaultNestApplicationInitializer } from '../modules/system/default-nest-application/default-nest-application-initializer';
import { DefaultNestApplicationListener } from '../modules/system/default-nest-application/default-nest-application-listener';
import {
  createNestModule,
  getNestModuleDecorators,
} from '../nest-module/utils';
import { bootstrapNestApplication } from './utils';

describe('Nest application: Utils', () => {
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

  describe('Nest application with env model', () => {
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

      process.env['OPTION'] = 'value1';

      const app = await bootstrapNestApplication({
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

      process.env['OPTION'] = 'value1';

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

  describe('Nest application with config model', () => {
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
          feature: [
            App1Module.forRoot({ configuration: { option: 'value1' } }),
            App2Module.forRoot(),
          ],
        },
      });

      const app2Service = app.get(App2Service);

      expect(app2Service.getConfig()).toMatchObject({ option: 'value1' });
    });
  });
  describe('Nest application with anv and config model', () => {
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
        constructor(
          private readonly appConfig: AppConfig,
          private readonly appEnv: AppEnv
        ) {}

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

      process.env['OPTION_ENV'] = 'optionEnv1';

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
  describe('Nest application with multi-providing options', () => {
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
          private readonly appFeatureConfigs: AppFeatureConfig[]
        ) {}

        getFeatureConfigs() {
          return this.appFeatureConfigs;
        }
      }

      const { App1Module } = createNestModule({
        moduleName: 'App1Module',
        sharedProviders: [AppFeatureScannerService],
        featureConfigurationModel: AppFeatureConfig,
      });

      @Injectable()
      class App2Service {
        constructor(
          private readonly appFeatureScannerService: AppFeatureScannerService
        ) {}

        getFeatureConfigs() {
          return this.appFeatureScannerService.getFeatureConfigs();
        }
      }

      // App2Module

      const { App2Module } = createNestModule({
        moduleName: 'App2Module',
        imports: [
          App1Module.forFeature({
            featureOptionConfig: 'featureOptionConfig-app2',
          }),
        ],
        providers: [App2Service],
      });

      @Injectable()
      class App3Service {
        constructor(
          private readonly appFeatureScannerService: AppFeatureScannerService
        ) {}

        getFeatureConfigs() {
          return this.appFeatureScannerService.getFeatureConfigs();
        }
      }

      const { App3Module } = createNestModule({
        moduleName: 'App3Module',
        imports: [
          App1Module.forFeature({
            featureOptionConfig: 'featureOptionConfig-app3',
          }),
        ],
        providers: [App3Service],
      });

      // Test
      const app = await bootstrapNestApplication({
        project: { name: 'TestApp', description: 'Test application' },
        modules: {
          system: [DefaultNestApplicationInitializer.forRoot()],
          feature: [
            App1Module.forRoot(),
            App2Module.forRoot(),
            App3Module.forRoot(),
          ],
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
  describe('Nest application get markdown of infrastructure', () => {
    it('should return markdown of infrastructure', async () => {
      // App1Module

      @Injectable()
      class AppReportService {
        constructor(
          private readonly infrastructureMarkdownReportStorage: InfrastructureMarkdownReportStorage
        ) {}

        getReport() {
          return this.infrastructureMarkdownReportStorage.report;
        }
      }

      const { App1Module } = createNestModule({
        moduleName: 'App1Module',
        imports: [InfrastructureMarkdownReport.forFeature()],
        providers: [AppReportService],
      });

      // Test
      const app = await bootstrapNestApplication({
        project: { name: 'TestApp', description: 'Test application' },
        modules: {
          infrastructure: [
            InfrastructureMarkdownReport.forRoot(),
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
      expect(appReportService.getReport().split('    ').join('')).toEqual(
        `# TestApp

    Test application
    ## Infrastructure modules
    Infrastructure modules are needed to create configurations that launch various external services (examples: docker-compose file for raising a database, gitlab configuration for deploying an application).

    ### InfrastructureMarkdownReport
    Infrastructure markdown report

    Shared providers: InfrastructureMarkdownReportStorage

    ### InfrastructureMarkdownReportGenerator
    Infrastructure markdown report generator.

    #### Static configuration (default)
    Static variables of primitive and complex types that are used in the module and can be used at the time of generating module metadata (import, controllers), values can be obtained from various sources, such as: process.env or the value of the consul key.

    | Key| Description | Constraints | Value |
    | ------ | ----------- | ----------- | ----- |
    |\`markdownFile\`|Name of the markdown-file in which to save the infrastructure report|**optional**|-|

    ## System modules
    System modules necessary for the operation of the entire application (examples: launching a nestjs application, launching microservices, etc.).

    ### DefaultNestApplicationInitializer
    Default NestJS application initializer, no third party utilities required.

    #### Static configuration (default)
    Static variables of primitive and complex types that are used in the module and can be used at the time of generating module metadata (import, controllers), values can be obtained from various sources, such as: process.env or the value of the consul key.

    | Key| Description | Constraints | Value |
    | ------ | ----------- | ----------- | ----- |
    |\`cors\`|CORS options from [CORS package](https://github.com/expressjs/cors#configuration-options)|**optional**|-|
    |\`bodyParser\`|Whether to use underlying platform body parser.|**optional**|-|
    |\`httpsOptions\`|Set of configurable HTTPS options|**optional**|-|
    |\`rawBody\`|Whether to register the raw request body on the request. Use \`req.rawBody\`.|**optional**|-|

    ### DefaultNestApplicationListener
    Default NestJS application listener, no third party utilities required.

    #### Static environments (default)
    Static variables with primitive types used in the module and can be used at the time of generating module metadata (import, controllers), the values of which can be obtained from various sources, such as: process.env or consul key value.

    | Key| Description | Source | Constraints | Value |
    | ------ | ----------- | ------ | ----------- | ----- |
    |\`port\`|The port on which to run the server.|\`obj['port']\`, \`process.env['PORT']\`|**isNotEmpty** (port should not be empty)|\`\`\`3012\`\`\`|
    |\`hostname\`|Hostname on which to listen for incoming packets.|\`obj['hostname']\`, \`process.env['HOSTNAME']\`|**optional**|-|

    #### Static configuration (default)
    Static variables of primitive and complex types that are used in the module and can be used at the time of generating module metadata (import, controllers), values can be obtained from various sources, such as: process.env or the value of the consul key.

    | Key| Description | Constraints | Value |
    | ------ | ----------- | ----------- | ----- |
    |\`preListen\`|Method for additional actions before listening|**optional**|-|
    |\`postListen\`|Method for additional actions after listening|**optional**|-|

    ## Feature modules
    Feature modules with business logic of the application.
    `
          .split('    ')
          .join('')
      );

      await app.close();
    });
  });
});
