import { Injectable } from '@nestjs/common';
import { bootstrapNestApplication } from '../../../nest-application/utils';
import { createNestModule } from '../../../nest-module/utils';
import {
  InfrastructureMarkdownReportGenerator,
  InfrastructureMarkdownReportStorageService,
} from '../../infrastructure/infrastructure-markdown-report/infrastructure-markdown-report';
import { DefaultNestApplicationInitializer } from '../../system/default-nest-application/default-nest-application-initializer';
import { DefaultNestApplicationListener } from '../../system/default-nest-application/default-nest-application-listener';
import { ProjectUtils } from './project-utils.module';
import { ApplicationPackageJsonService } from './services/application-package-json.service';
import { DotEnvService } from './services/dot-env.service';
import { PackageJsonService } from './services/package-json.service';

describe('Project Utils', () => {
  let originalNodeEnv: string | undefined;

  beforeAll(() => {
    originalNodeEnv = process.env['NODE_ENV'];
    process.env['NODE_ENV'] = 'infrastructure';
  });

  afterAll(() => {
    process.env['NODE_ENV'] = originalNodeEnv;
  });

  it('should return report with application name from settings and source key with prefix for env', async () => {
    const { AppModule } = createNestModule({
      moduleName: 'AppModule',
      // type checking
      wrapForRootAsync: (asyncModuleOptions) => {
        return { asyncModuleOptions };
      },
      wrapForFeatureAsync: (asyncModuleOptions) => {
        return { asyncModuleOptions };
      },
    });

    const app = await bootstrapNestApplication({
      globalConfigurationOptions: { skipValidation: true },
      globalEnvironmentsOptions: { skipValidation: true },
      project: { name: 'TestApp', description: 'Test application' },
      modules: {
        system: [
          DefaultNestApplicationInitializer.forRoot(),
          DefaultNestApplicationListener.forRoot({ staticConfiguration: { mode: 'init' } }),
        ],
        feature: [AppModule.forRoot()],
        infrastructure: [InfrastructureMarkdownReportGenerator.forRoot()],
      },
    });
    const infrastructureMarkdownReportStorage = app.get(InfrastructureMarkdownReportStorageService);

    expect(infrastructureMarkdownReportStorage.report).toContain('# TestApp');
    expect(infrastructureMarkdownReportStorage.report).toContain('Test application');
    expect(infrastructureMarkdownReportStorage.report).toContain("process.env['TEST_APP_PORT']");
    expect(infrastructureMarkdownReportStorage.report).toContain("process.env['TEST_APP_HOSTNAME']");
  });

  it('should return report without override application name from package.json', async () => {
    const { AppModule } = createNestModule({
      moduleName: 'AppModule',
    });

    const app = await bootstrapNestApplication({
      globalConfigurationOptions: { skipValidation: true, debug: true },
      globalEnvironmentsOptions: { skipValidation: true, debug: true },
      project: { name: 'TestApp', description: 'Test application' },
      modules: {
        system: [
          ProjectUtils.forRoot({ staticConfiguration: { applicationPackageJsonFile: `${__filename}-package.json` } }),
          DefaultNestApplicationInitializer.forRoot(),
          DefaultNestApplicationListener.forRoot({ staticConfiguration: { mode: 'init' } }),
        ],
        feature: [AppModule.forRoot()],
        infrastructure: [InfrastructureMarkdownReportGenerator.forRoot()],
      },
    });
    const infrastructureMarkdownReportStorage = app.get(InfrastructureMarkdownReportStorageService);

    expect(infrastructureMarkdownReportStorage.report).toContain('# TestApp');
    expect(infrastructureMarkdownReportStorage.report).toContain('Test application');
    expect(infrastructureMarkdownReportStorage.report).toContain("process.env['TEST_APP_PORT']");
    expect(infrastructureMarkdownReportStorage.report).toContain("process.env['TEST_APP_HOSTNAME']");
  });

  it('should return report with application name from package.json and extended source key for env', async () => {
    const { AppModule } = createNestModule({
      moduleName: 'AppModule',
    });

    process.env['TEST_APP_PORT'] = '1000';

    const app = await bootstrapNestApplication({
      modules: {
        system: [
          ProjectUtils.forRoot({ staticConfiguration: { applicationPackageJsonFile: `${__filename}-package.json` } }),
          DefaultNestApplicationInitializer.forRoot(),
          DefaultNestApplicationListener.forRoot({ staticConfiguration: { mode: 'init' } }),
        ],
        feature: [AppModule.forRoot()],
        infrastructure: [InfrastructureMarkdownReportGenerator.forRoot()],
      },
    });
    const infrastructureMarkdownReportStorage = app.get(InfrastructureMarkdownReportStorageService);

    expect(infrastructureMarkdownReportStorage.report).toContain('# test-app');
    expect(infrastructureMarkdownReportStorage.report).toContain('Description for test-app');
    expect(infrastructureMarkdownReportStorage.report).toContain("process.env['TEST_APP_PORT']");
    expect(infrastructureMarkdownReportStorage.report).toContain("process.env['TEST_APP_HOSTNAME']");
    expect(infrastructureMarkdownReportStorage.report).toContain('```1000```');
    process.env['TEST_APP_PORT'] = undefined;
  });

  it('should return report with application name from package.json and extended source key for env and use contextName, use .env file for receiving', async () => {
    const { AppModule } = createNestModule({
      moduleName: 'AppModule',
    });

    const app = await bootstrapNestApplication({
      globalEnvironmentsOptions: { debug: true },
      modules: {
        system: [
          ProjectUtils.forRoot({
            contextName: 'new',
            staticConfiguration: {
              applicationPackageJsonFile: `${__filename}-package.json`,
              envFile: `${__filename}-.env`,
            },
          }),
          DefaultNestApplicationInitializer.forRoot({
            contextName: 'new',
          }),
          DefaultNestApplicationListener.forRoot({
            contextName: 'new',
            staticConfiguration: { mode: 'init' },
          }),
        ],
        feature: [
          AppModule.forRoot({
            contextName: 'new',
          }),
        ],
        infrastructure: [
          InfrastructureMarkdownReportGenerator.forRoot({
            contextName: 'new',
          }),
        ],
      },
    });

    const infrastructureMarkdownReportStorage = app.get(InfrastructureMarkdownReportStorageService);

    expect(infrastructureMarkdownReportStorage.report).toContain('# test-app');
    expect(infrastructureMarkdownReportStorage.report).toContain('Description for test-app');
    expect(infrastructureMarkdownReportStorage.report).toContain("process.env['TEST_APP_NEW_PORT']");
    expect(infrastructureMarkdownReportStorage.report).toContain("process.env['TEST_APP_NEW_HOSTNAME']");
    expect(infrastructureMarkdownReportStorage.report).toContain('```2000```');
    process.env['TEST_APP_NEW_PORT'] = undefined;
  });

  it('should return data from env-file', async () => {
    @Injectable()
    class GetEnv {
      constructor(private readonly dotEnvService: DotEnvService) {}
      getEnv() {
        return this.dotEnvService.read();
      }

      getKeys() {
        return this.dotEnvService.keys();
      }
    }
    const { AppModule } = createNestModule({
      moduleName: 'AppModule',
      imports: [ProjectUtils.forFeature()],
      providers: [GetEnv],
    });

    const app = await bootstrapNestApplication({
      globalEnvironmentsOptions: { debug: true },
      modules: {
        system: [
          ProjectUtils.forRoot({
            staticConfiguration: {
              applicationPackageJsonFile: `${__filename}-package.json`,
              envFile: `${__filename}-.env`,
            },
          }),
          DefaultNestApplicationInitializer.forRoot(),
          DefaultNestApplicationListener.forRoot({ staticConfiguration: { mode: 'init' } }),
        ],
        feature: [AppModule.forRoot()],
        infrastructure: [InfrastructureMarkdownReportGenerator.forRoot()],
      },
    });
    const getEnv = app.get(GetEnv);

    expect(getEnv.getEnv()).toMatchObject({ TEST_APP_PORT: '2000', TEST_APP_HOSTNAME: 'host' });
    expect(getEnv.getKeys()).toEqual(['TEST_APP_PORT', 'TEST_APP_HOSTNAME']);
  });

  it('should return data from package.json-file', async () => {
    @Injectable()
    class GetPackageJson {
      constructor(
        private readonly applicationPackageJsonService: ApplicationPackageJsonService,
        private readonly packageJsonService: PackageJsonService
      ) {}

      getApplicationPackageJson() {
        return this.applicationPackageJsonService.read();
      }

      getPackageJson() {
        return this.packageJsonService.read();
      }
    }
    const { AppModule } = createNestModule({
      moduleName: 'AppModule',
      imports: [ProjectUtils.forFeature()],
      providers: [GetPackageJson],
    });

    const app = await bootstrapNestApplication({
      globalEnvironmentsOptions: { debug: true },
      modules: {
        system: [
          ProjectUtils.forRoot({
            staticConfiguration: {
              packageJsonFile: `${__filename}-second-package.json`,
              applicationPackageJsonFile: `${__filename}-package.json`,
              envFile: `${__filename}-.env`,
            },
          }),
          DefaultNestApplicationInitializer.forRoot(),
          DefaultNestApplicationListener.forRoot({ staticConfiguration: { mode: 'init' } }),
        ],
        feature: [AppModule.forRoot()],
        infrastructure: [InfrastructureMarkdownReportGenerator.forRoot()],
      },
    });
    const getPackageJson = app.get(GetPackageJson);

    expect(getPackageJson.getApplicationPackageJson()).toEqual({
      name: 'test-app',
      description: 'Description for test-app',
      version: '1.0.0',
    });
    expect(getPackageJson.getPackageJson()).toEqual({
      name: 'second-test-app',
      description: 'Description for second-test-app',
      version: '1.0.0',
    });
  });
});
