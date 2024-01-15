import {
  DefaultNestApplicationInitializer,
  DefaultNestApplicationListener,
  InfrastructureMarkdownReportGenerator,
  NestModuleCategory,
  bootstrapNestApplication,
  createNestModule,
  isInfrastructureMode,
  isProductionMode,
} from '@nestjs-mod/common';
import { RestInfrastructureHtmlReport } from '@nestjs-mod/reports';
import { Logger } from '@nestjs/common';
import { join } from 'path';
import { AppModule } from './app/app.module';
import { SampleWithSharedConfig } from './app/sample-with-shared-config/sample-with-shared-config.module';

const globalPrefix = 'api';

bootstrapNestApplication({
  globalConfigurationOptions: {
    debug: true,
    skipValidation: isInfrastructureMode(),
  },
  globalEnvironmentsOptions: {
    debug: true,
    skipValidation: isInfrastructureMode(),
  },
  project: {
    name: 'ExampleBasic',
    description: 'Example basic',
  },
  modules: {
    system: [
      DefaultNestApplicationInitializer.forRoot(),
      DefaultNestApplicationListener.forRoot({
        staticEnvironments: { port: 3000 },
        staticConfiguration: {
          mode: isInfrastructureMode() ? 'init' : 'listen',
          preListen: async ({ app }) => {
            if (app) {
              app.setGlobalPrefix(globalPrefix);
            }
          },
          postListen: async ({ current }) => {
            Logger.log(
              `🚀 Application is running on: http://${current.staticEnvironments?.hostname ?? 'localhost'}:${
                current.staticEnvironments?.port
              }/${globalPrefix}`
            );
          },
        },
      }),
    ],
    feature: [
      createNestModule({
        moduleName: AppModule.name,
        moduleDescription: 'Main app module',
        moduleCategory: NestModuleCategory.feature,
        imports: [
          AppModule,
          SampleWithSharedConfig.forFeature({
            featureModuleName: AppModule.name,
            featureConfiguration: { featureVar: 'featureVar41' },
          }),
        ],
      }).AppModule.forRootAsync(),
      SampleWithSharedConfig.forRoot({
        environments: { var1: 'var1value' },
      }),
    ],
    // Disable infrastructure modules in production
    ...(!isProductionMode() || isInfrastructureMode()
      ? {
          infrastructure: [
            InfrastructureMarkdownReportGenerator.forRoot({
              staticConfiguration: {
                markdownFile: join(__dirname, '..', '..', '..', 'apps', 'example-basic', 'INFRASTRUCTURE.MD'),
                skipEmptySettings: true,
              },
            }),
            RestInfrastructureHtmlReport.forRoot(),
          ],
        }
      : {}),
  },
});