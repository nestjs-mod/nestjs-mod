import {
  EnvModel,
  EnvModelProperty,
  NestModuleCategory,
  bootstrapNestApplication,
  createNestModule,
} from '@nestjs-mod/common';
import { DefaultTestNestApplicationCreate, DefaultTestNestApplicationInitializer } from '@nestjs-mod/testing';
import { Controller, Get, Injectable, Module } from '@nestjs/common';
import { IsNotEmpty, setClassValidatorMessages } from 'class-validator-multi-lang';
import { readFile } from 'fs/promises';
import { resolve } from 'path';
import request from 'supertest';
import { SampleWithSharedConfig } from './sample-with-shared-config.module';
import { SampleWithSharedConfigService } from './sample-with-shared-config.service';

describe('SampleWithSharedConfigController', () => {
  it('should return error if environment not set', async () => {
    await expect(
      bootstrapNestApplication({
        project: {
          name: 'TestApplication',
          description: 'Test application',
        },
        modules: {
          system: [DefaultTestNestApplicationCreate.forRoot(), DefaultTestNestApplicationInitializer.forRoot()],
          feature: [SampleWithSharedConfig.forRoot()],
        },
      })
    ).rejects.toHaveProperty('errors.0.constraints.isNotEmpty', 'var1 should not be empty');
  });

  it('should return error if environment not set (translated errors)', async () => {
    const RU_I18N_MESSAGES = JSON.parse(
      (
        await readFile(resolve(__dirname, '../../../../../node_modules/class-validator-multi-lang/i18n/ru.json'))
      ).toString()
    );
    setClassValidatorMessages(RU_I18N_MESSAGES);

    const TEST_APP_NAME = 'TestAppModule';

    @EnvModel({ name: TEST_APP_NAME })
    class TestAppEnvironments {
      @EnvModelProperty()
      @IsNotEmpty()
      var1!: string;
    }
    const { TestAppModule } = createNestModule({
      moduleName: TEST_APP_NAME,
      moduleCategory: NestModuleCategory.feature,
      staticEnvironmentsModel: TestAppEnvironments,
      environmentsOptions: {
        validatorPackage: require('class-validator-multi-lang'),
      },
    });

    await expect(
      bootstrapNestApplication({
        project: {
          name: 'TestApplication',
          description: 'Test application',
        },
        modules: {
          system: [DefaultTestNestApplicationCreate.forRoot(), DefaultTestNestApplicationInitializer.forRoot()],
          feature: [TestAppModule.forRoot()],
        },
      })
    ).rejects.toHaveProperty('errors.0.constraints.isNotEmpty', 'var1 не может быть пустым');
  });

  it('should return "Hello World! (var1: var1value)", use static value in forRoot options', async () => {
    const app = await bootstrapNestApplication({
      project: {
        name: 'TestApplication',
        description: 'Test application',
      },
      modules: {
        system: [DefaultTestNestApplicationCreate.forRoot(), DefaultTestNestApplicationInitializer.forRoot()],
        feature: [
          SampleWithSharedConfig.forRoot({
            environments: { var1: 'var1value' },
          }),
        ],
      },
    });

    await request(app.getHttpServer()).get('/get-hello').expect(200).expect('Hello World! (var1: var1value)');

    await app.close();
  });

  it('should return "Hello World! (var1: var1value)", use process.env value in forRoot options', async () => {
    process.env['SAMPLE_WITH_SHARED_CONFIG_VAR_1'] = 'var1value';
    const app = await bootstrapNestApplication({
      project: {
        name: 'TestApplication',
        description: 'Test application',
      },
      modules: {
        system: [DefaultTestNestApplicationCreate.forRoot(), DefaultTestNestApplicationInitializer.forRoot()],
        feature: [SampleWithSharedConfig.forRoot()],
      },
    });

    await request(app.getHttpServer()).get('/get-hello').expect(200).expect('Hello World! (var1: var1value)');

    await app.close();
  });

  it('should return "Hello World! (var1: var1value)", use process.env value in forRoot options and name for append prefix to property name', async () => {
    process.env['APP_11_SAMPLE_WITH_SHARED_CONFIG_VAR_1'] = 'var1value';
    const app = await bootstrapNestApplication({
      project: {
        name: 'TestApplication',
        description: 'Test application',
      },
      modules: {
        system: [DefaultTestNestApplicationCreate.forRoot(), DefaultTestNestApplicationInitializer.forRoot()],
        feature: [SampleWithSharedConfig.forRoot({ contextName: 'app11' })],
      },
    });

    await request(app.getHttpServer()).get('/get-hello').expect(200).expect('Hello World! (var1: var1value)');

    await app.close();
  });

  it('should return "Hello World! (var1: api1var1value)" and "Hello World! (var1: api2var1value)", use process.env value in forRoot options, run two different instance of module', async () => {
    process.env['API_21_SAMPLE_WITH_SHARED_CONFIG_VAR_1'] = 'api1var1value';
    process.env['API_22_SAMPLE_WITH_SHARED_CONFIG_VAR_1'] = 'api2var1value';
    const app = await bootstrapNestApplication({
      project: {
        name: 'TestApplication',
        description: 'Test application',
      },
      modules: {
        system: [DefaultTestNestApplicationCreate.forRoot(), DefaultTestNestApplicationInitializer.forRoot()],
        feature: [
          SampleWithSharedConfig.forRoot({
            contextName: 'api21',
            staticConfiguration: {
              endpoint: 'api1',
            },
          }),
          SampleWithSharedConfig.forRoot({
            contextName: 'api22',
            staticConfiguration: {
              endpoint: 'api2',
            },
          }),
        ],
      },
    });

    await request(app.getHttpServer()).get('/api1/get-hello').expect(200).expect('Hello World! (var1: api1var1value)');

    await request(app.getHttpServer()).get('/api2/get-hello').expect(200).expect('Hello World! (var1: api2var1value)');

    await app.close();
  });

  it('should return "First Hello World! (var1: api1var1value)" and "Second Hello World! (var1: api2var1value)", use process.env value in forRoot options, run two different instance of one service', async () => {
    process.env['API_31_SAMPLE_WITH_SHARED_CONFIG_VAR_1'] = 'api1var1value';
    process.env['API_32_SAMPLE_WITH_SHARED_CONFIG_VAR_1'] = 'api2var1value';

    // first
    @Injectable()
    class FirstService {
      constructor(private readonly sampleWithSharedConfigService: SampleWithSharedConfigService) {}

      getHello(): string {
        return `First ${this.sampleWithSharedConfigService.getHello()}`;
      }
    }

    @Controller('first')
    class FirstController {
      constructor(readonly firstService: FirstService) {}

      @Get()
      getHello(): string {
        return this.firstService.getHello();
      }
    }

    @Module({
      imports: [SampleWithSharedConfig.forFeature({ contextName: 'api31' })],
      providers: [FirstService],
      controllers: [FirstController],
    })
    class FirstModule {}

    // second
    @Injectable()
    class SecondService {
      constructor(private readonly sampleWithSharedConfigService: SampleWithSharedConfigService) {}

      getHello(): string {
        return `Second ${this.sampleWithSharedConfigService.getHello()}`;
      }
    }

    @Controller('second')
    class SecondController {
      constructor(readonly secondService: SecondService) {}

      @Get()
      getHello(): string {
        return this.secondService.getHello();
      }
    }

    @Module({
      imports: [SampleWithSharedConfig.forFeature({ contextName: 'api32' })],
      providers: [SecondService],
      controllers: [SecondController],
    })
    class SecondModule {}

    const app = await bootstrapNestApplication({
      project: {
        name: 'TestApplication',
        description: 'Test application',
      },
      modules: {
        system: [DefaultTestNestApplicationCreate.forRoot(), DefaultTestNestApplicationInitializer.forRoot()],
        feature: [
          SampleWithSharedConfig.forRoot({
            contextName: 'api31',
            staticConfiguration: {
              endpoint: 'api1',
            },
          }),
          SampleWithSharedConfig.forRoot({
            contextName: 'api32',
            staticConfiguration: {
              endpoint: 'api2',
            },
          }),
          createNestModule({
            moduleName: 'ChildModules',
            moduleDescription: 'Child modules',
            imports: [SecondModule, FirstModule],
          }).ChildModules.forRoot(),
        ],
      },
    });

    await request(app.getHttpServer()).get('/api2/get-hello').expect(200).expect('Hello World! (var1: api2var1value)');

    await request(app.getHttpServer()).get('/api1/get-hello').expect(200).expect('Hello World! (var1: api1var1value)');

    await request(app.getHttpServer()).get('/second').expect(200).expect('Second Hello World! (var1: api2var1value)');

    await request(app.getHttpServer()).get('/first').expect(200).expect('First Hello World! (var1: api1var1value)');

    await app.close();
  });

  it('should return many feature options', async () => {
    // first

    @Module({
      imports: [
        SampleWithSharedConfig.forFeature({
          featureConfiguration: { featureVar: 'featureVar41' },
        }),
      ],
    })
    class FirstModule {}

    // second

    @Module({
      imports: [
        SampleWithSharedConfig.forFeature({
          featureConfiguration: { featureVar: 'featureVar42' },
        }),
      ],
    })
    class SecondModule {}

    const app = await bootstrapNestApplication({
      project: {
        name: 'TestApplication',
        description: 'Test application',
      },
      modules: {
        system: [DefaultTestNestApplicationCreate.forRoot(), DefaultTestNestApplicationInitializer.forRoot()],
        feature: [
          SampleWithSharedConfig.forRoot({
            environments: { var1: 'var1value' },
          }),
          createNestModule({
            moduleName: 'ChildModules',
            moduleDescription: 'Child modules',
            imports: [SecondModule, FirstModule],
          }).ChildModules.forRoot(),
        ],
      },
    });

    await request(app.getHttpServer())
      .get('/get-features')
      .expect(200)
      .expect('[{"featureVar":"featureVar41"},{"featureVar":"featureVar42"}]');

    await app.close();
  });
});
