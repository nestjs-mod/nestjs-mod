import {
  DOT_ENV_FILE,
  DefaultNestApplicationInitializer,
  DefaultNestApplicationListener,
  InfrastructureMarkdownReportGenerator,
  NestModuleCategory,
  PACKAGE_JSON_FILE,
  ProjectUtils,
  bootstrapNestApplication,
  createNestModule,
  isInfrastructureMode,
} from '@nestjs-mod/common';
import { join } from 'path';
import { AppModule } from './app/app.module';
import { SampleWithSharedConfig } from './app/sample-with-shared-config/sample-with-shared-config.module';

bootstrapNestApplication({
  modules: {
    system: [
      ProjectUtils.forRoot({
        staticConfiguration: {
          applicationPackageJsonFile: join(__dirname, '..', '..', '..', 'apps', 'example-basic', PACKAGE_JSON_FILE),
          packageJsonFile: join(__dirname, '..', '..', '..', PACKAGE_JSON_FILE),
          envFile: join(__dirname, '..', '..', '..', DOT_ENV_FILE),
        },
      }),
      DefaultNestApplicationInitializer.forRoot(),
      DefaultNestApplicationListener.forRoot({
        // staticEnvironments: { port: 3000 },
        staticConfiguration: {
          mode: isInfrastructureMode() ? 'init' : 'listen',
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
    infrastructure: [
      InfrastructureMarkdownReportGenerator.forRoot({
        staticConfiguration: {
          markdownFile: join(__dirname, '..', '..', '..', 'apps', 'example-basic', 'INFRASTRUCTURE.MD'),
          skipEmptySettings: true,
        },
      }),
    ],
  },
});
