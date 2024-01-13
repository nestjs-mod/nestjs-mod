import { DynamicModule} from '@nestjs/common';
import { Injectable, Module } from '@nestjs/common';
import { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { IsNotEmpty } from 'class-validator';
import { EnvModel, EnvModelProperty } from './decorators';
import { envTransform } from './utils';

describe('Env model: Utils', () => {
  it('should return error if option of env not set', async () => {
    @EnvModel()
    class AppEnv {
      @EnvModelProperty()
      @IsNotEmpty()
      option!: string;
    }

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

    await expect(
      Test.createTestingModule({
        imports: [AppModule.forRoot({})],
      }).compile()
    ).rejects.toHaveProperty(
      'errors.0.constraints.isNotEmpty',
      'option should not be empty'
    );
  });

  it('should return model info in error if option of env not set', async () => {
    @EnvModel({ name: 'model name', description: 'model description' })
    class AppEnv {
      @EnvModelProperty({ description: 'option description' })
      @IsNotEmpty()
      option!: string;
    }

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

    await expect(
      Test.createTestingModule({
        imports: [AppModule.forRoot({})],
      }).compile()
    ).rejects.toMatchObject({
      info: {
        modelPropertyOptions: [
          { description: 'option description', originalName: 'option' },
        ],
        modelOptions: {
          name: 'model name',
          description: 'model description',
          originalName: 'AppEnv',
        },
        validations: {
          option: { constraints: { isNotEmpty: 'option should not be empty' } },
        },
      },
    });
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

    @Module({ providers: [AppEnv, AppService] })
    class AppModule {
      static forRoot(env?: Partial<AppEnv>): DynamicModule {
        return {
          module: AppModule,
          providers: [
            {
              provide: `${AppEnv.name}_loader`,
              useFactory: async (emptyAppEnv: AppEnv) => {
                if (env && env.constructor !== Object) {
                  Object.setPrototypeOf(emptyAppEnv, env);
                }
                const obj = await envTransform({
                  model: AppEnv,
                  data: env ?? {},
                });
                Object.assign(emptyAppEnv, obj.data);
              },
              inject: [AppEnv],
            },
          ],
        };
      }
    }

    process.env['OPTION'] = 'value1';

    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [AppModule.forRoot({})],
    }).compile();
    const appService = moduleRef.get(AppService);

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

    @Module({
      imports: [App1Module.forShareEnv()],
      providers: [App1Service],
      exports: [App1Service],
    })
    class App1Module {
      static forShareEnv(): DynamicModule {
        return {
          module: App1Module,
          providers: [App1Env],
          exports: [App1Env],
        };
      }
      static forRoot(env?: Partial<App1Env>): DynamicModule {
        return {
          module: App1Module,
          providers: [
            {
              provide: `${App1Env.name}_loader`,
              useFactory: async (emptyAppEnv: App1Env) => {
                if (env && env.constructor !== Object) {
                  Object.setPrototypeOf(emptyAppEnv, env);
                }
                const obj = await envTransform({
                  model: App1Env,
                  data: env ?? {},
                });
                Object.assign(emptyAppEnv, obj.data);
              },
              inject: [App1Env],
            },
          ],
        };
      }
    }

    @Injectable()
    class App2Service {
      constructor(private readonly appService: App1Service) {}

      getEnv() {
        return this.appService.getEnv();
      }
    }

    @Module({
      imports: [App1Module],
      providers: [App2Service],
    })
    class App2Module {}

    process.env['OPTION'] = 'value1';

    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [App1Module.forRoot({}), App2Module],
    }).compile();
    const app2Service = moduleRef.get(App2Service);

    expect(app2Service.getEnv()).toMatchObject({ option: 'value1' });
  });
});
