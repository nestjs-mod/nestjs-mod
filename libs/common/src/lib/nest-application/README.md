### NestJS application

Function for sequential import of nestModules.
When importing, all preWrapApplication methods of modules are run at the beginning, then all wrapApplication methods, and at the very end all postWrapApplication methods.

Types of modules (list in order of processing):

- `Core modules` - Core modules necessary for the operation of feature and integration modules (examples: main module with connection to the database, main module for connecting to aws, etc.).
- `Feature modules` - Feature modules with business logic of the application.
- `Integration modules` - Integration modules are necessary to organize communication between feature or core modules (example: after creating a user in the UsersModule feature module, you need to send him a letter from the NotificationsModule core module).
- `System modules` - System modules necessary for the operation of the entire application (examples: launching a NestJS application, launching microservices, etc.).
- `Infrastructure modules` - Infrastructure modules are needed to create configurations that launch various external services (examples: docker-compose file for raising a database, gitlab configuration for deploying an application).

#### Decorators

`InjectFeatures`, `InjectService`, `InjectAllFeatures`

#### Function

`createNestModule`, `getNestModuleDecorators`

#### Usage

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
