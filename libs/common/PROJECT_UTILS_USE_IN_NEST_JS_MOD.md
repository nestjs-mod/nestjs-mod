Use with options.

```typescript
import { DOT_ENV_FILE, PACKAGE_JSON_FILE, ProjectUtils, bootstrapNestApplication } from '@nestjs-mod/common';
import { join } from 'path';

const appFolder = join(__dirname, '..', '..', '..', 'apps', 'example-basic');
const rootFolder = join(__dirname, '..', '..', '..');

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
  isInfrastructureMode,
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
    return this.dotEnvService.keys();
  }
}
const { AppModule } = createNestModule({
  moduleName: 'AppModule',
  imports: [ProjectUtils.forFeature()],
  providers: [GetEnv],
});

const appFolder = join(__dirname, '..', '..', '..', 'apps', 'example-basic');
const rootFolder = join(__dirname, '..', '..', '..');

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
          mode: 'init',
          postListen: async ({ app }) => {
            if (app) {
              const getEnv = app.get(GetEnv);
              console.log(await getEnv.getEnv()); // output: { TEST_APP_PORT: '2000', TEST_APP_HOSTNAME: 'host' }
            }
            if (isInfrastructureMode()) {
              /**
               * When you start the application in infrastructure mode, it should automatically close;
               * if for some reason it does not close, we forcefully close it after 30 seconds.
               */
              setTimeout(() => process.exit(0), 30000);
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
