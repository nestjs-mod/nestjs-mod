import { DynamicModule } from '@nestjs/common';
import { Injectable, Module } from '@nestjs/common';
import { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { IsNotEmpty } from 'class-validator';
import { ConfigModel, ConfigModelProperty } from './decorators';
import { configTransform } from './utils';

describe('Config model: Utils', () => {
  it('should return error if option of config not set', async () => {
    @ConfigModel()
    class AppConfig {
      @ConfigModelProperty()
      @IsNotEmpty()
      option!: string;
    }

    @Module({ providers: [AppConfig] })
    class AppModule {
      static forRoot(config: Partial<AppConfig>): DynamicModule {
        return {
          module: AppModule,
          providers: [
            {
              provide: `${AppConfig.name}_loader`,
              useFactory: async (emptyAppConfig: AppConfig) => {
                if (config.constructor !== Object) {
                  Object.setPrototypeOf(emptyAppConfig, config);
                }
                const obj = await configTransform({
                  model: AppConfig,
                  data: config,
                });
                Object.assign(emptyAppConfig, obj.data);
              },
              inject: [AppConfig],
            },
          ],
        };
      }
    }

    await expect(
      Test.createTestingModule({
        imports: [AppModule.forRoot({})],
      }).compile()
    ).rejects.toHaveProperty('errors.0.constraints.isNotEmpty', 'option should not be empty');
  });

  it('should return model info in error if option of config not set', async () => {
    @ConfigModel({ name: 'model name', description: 'model description' })
    class AppConfig {
      @ConfigModelProperty({ description: 'option description' })
      @IsNotEmpty()
      option!: string;
    }

    @Module({ providers: [AppConfig] })
    class AppModule {
      static forRoot(config: Partial<AppConfig>): DynamicModule {
        return {
          module: AppModule,
          providers: [
            {
              provide: `${AppConfig.name}_loader`,
              useFactory: async (emptyAppConfig: AppConfig) => {
                if (config.constructor !== Object) {
                  Object.setPrototypeOf(emptyAppConfig, config);
                }
                const obj = await configTransform({
                  model: AppConfig,
                  data: config,
                });
                Object.assign(emptyAppConfig, obj.data);
              },
              inject: [AppConfig],
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
        modelPropertyOptions: [{ description: 'option description', originalName: 'option' }],
        modelOptions: {
          name: 'model name',
          description: 'model description',
          originalName: 'AppConfig',
        },
        validations: {
          option: { constraints: { isNotEmpty: 'option should not be empty' } },
        },
      },
    });
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

    @Module({ providers: [AppConfig, AppService] })
    class AppModule {
      static forRoot(config: Partial<AppConfig>): DynamicModule {
        return {
          module: AppModule,
          providers: [
            {
              provide: `${AppConfig.name}_loader`,
              useFactory: async (emptyAppConfig: AppConfig) => {
                if (config.constructor !== Object) {
                  Object.setPrototypeOf(emptyAppConfig, config);
                }
                const obj = await configTransform({
                  model: AppConfig,
                  data: config,
                });
                Object.assign(emptyAppConfig, obj.data);
              },
              inject: [AppConfig],
            },
          ],
        };
      }
    }

    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [AppModule.forRoot({ option: 'value1' })],
    }).compile();
    const appService = moduleRef.get(AppService);

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

    @Module({
      imports: [App1Module.forShareConfig()],
      providers: [App1Service],
      exports: [App1Service],
    })
    class App1Module {
      static forShareConfig(): DynamicModule {
        return {
          module: App1Module,
          providers: [App1Config],
          exports: [App1Config],
        };
      }
      static forRoot(config: Partial<App1Config>): DynamicModule {
        return {
          module: App1Module,
          providers: [
            {
              provide: `${App1Config.name}_loader`,
              useFactory: async (emptyAppConfig: App1Config) => {
                if (config.constructor !== Object) {
                  Object.setPrototypeOf(emptyAppConfig, config);
                }
                const obj = await configTransform({
                  model: App1Config,
                  data: config,
                });
                Object.assign(emptyAppConfig, obj.data);
              },
              inject: [App1Config],
            },
          ],
        };
      }
    }

    @Injectable()
    class App2Service {
      constructor(private readonly appService: App1Service) {}

      getConfig() {
        return this.appService.getConfig();
      }
    }

    @Module({
      imports: [App1Module],
      providers: [App2Service],
    })
    class App2Module {}

    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [App1Module.forRoot({ option: 'value1' }), App2Module],
    }).compile();
    const app2Service = moduleRef.get(App2Service);

    expect(app2Service.getConfig()).toMatchObject({ option: 'value1' });
  });
});
