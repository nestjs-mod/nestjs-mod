import {
  InfrastructureMarkdownReportGenerator,
  PACKAGE_JSON_FILE,
  ProjectUtils,
  bootstrapNestApplication,
  isInfrastructureMode,
} from '@nestjs-mod/common';
import { FastifyNestApplicationInitializer, FastifyNestApplicationListener } from '@nestjs-mod/fastify';
import { join } from 'path';
import { AppModule } from './app/app.module';

bootstrapNestApplication({
  modules: {
    system: [
      ProjectUtils.forRoot({
        staticConfiguration: {
          applicationPackageJsonFile: join(__dirname, '..', '..', '..', 'apps/example-fastify', PACKAGE_JSON_FILE),
          packageJsonFile: join(__dirname, '..', '..', '..', PACKAGE_JSON_FILE),
          envFile: join(__dirname, '..', '..', '..', '.env'),
        },
      }),
      FastifyNestApplicationInitializer.forRoot({
        staticConfiguration: {
          wrapFastifyAdapter: (fastifyAdapter) => {
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            fastifyAdapter.register(require('@fastify/cookie'));
          },
        },
      }),
      FastifyNestApplicationListener.forRoot({
        staticConfiguration: {
          // When running in infrastructure mode, the backend server does not start.
          mode: isInfrastructureMode() ? 'init' : 'listen',
        },
      }),
    ],
    feature: [AppModule.forRoot()],
    infrastructure: [
      InfrastructureMarkdownReportGenerator.forRoot({
        staticConfiguration: {
          markdownFile: join(__dirname, '..', '..', '..', 'apps/example-fastify', 'INFRASTRUCTURE.MD'),
          skipEmptySettings: true,
        },
      }),
    ],
  },
});
