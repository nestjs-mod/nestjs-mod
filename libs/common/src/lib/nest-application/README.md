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
