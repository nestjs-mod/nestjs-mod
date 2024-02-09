import { InfrastructureMarkdownReportGenerator, bootstrapNestApplication, createNestModule } from '@nestjs-mod/common';
import { DefaultTestNestApplicationCreate, DefaultTestNestApplicationInitializer } from '@nestjs-mod/testing';
import { Controller, Get, Injectable, Module } from '@nestjs/common';
import { join } from 'path';
import request from 'supertest';
import { SampleWithSharedConfigConfiguration } from './sample-with-shared-config.config';
import { SampleWithSharedConfig } from './sample-with-shared-config.module';
import { SampleWithSharedConfigService } from './sample-with-shared-config.service';
import { InjectService } from './sample-with-shared-config.utils';

describe('SampleWithSharedConfigController (async)', () => {
  it('should return "Hello World! (var1: var1value)", use static value in forRoot options', async () => {
    const originalNodeEnv = process.env['NODE_ENV'];
    process.env['NODE_ENV'] = 'infrastructure';

    const rootFolder = join(__dirname, '..', '..', '..');

    const app = await bootstrapNestApplication({
      project: {
        name: 'TestApplication',
        description: 'Test application',
      },
      modules: {
        system: [DefaultTestNestApplicationCreate.forRoot(), DefaultTestNestApplicationInitializer.forRoot()],
        feature: [
          SampleWithSharedConfig.forRootAsync({
            environments: { var1: 'var1value' },
            configurationFactory: () => ({ dynamicVar1: 'dyno' }),
          }),
        ],
        infrastructure: [
          InfrastructureMarkdownReportGenerator.forRoot({
            staticConfiguration: {
              markdownFile: join(rootFolder, 'TESTING_INFRASTRUCTURE.MD'),
            },
          }),
        ],
      },
    });

    await request(app.getHttpServer()).get('/get-hello').expect(200).expect('Hello World! (var1: var1value)');

    await request(app.getHttpServer())
      .get('/get-options')
      .expect(200)
      .expect(JSON.stringify({ dynamicVar1: 'dyno' }));

    await request(app.getHttpServer()).get('/get-static-options').expect(200).expect(JSON.stringify({}));

    await request(app.getHttpServer())
      .get('/get-environments')
      .expect(200)
      .expect(JSON.stringify({ var1: 'var1value' }));

    await app.close();
    process.env['NODE_ENV'] = originalNodeEnv;
  });

  it('should return "Hello World! (var1: var1value)", use process.env value in forRoot options', async () => {
    process.env['TEST_APPLICATION_SAMPLE_WITH_SHARED_CONFIG_VAR_1'] = 'var1value';
    class DynoClass implements SampleWithSharedConfigConfiguration {
      dynamicVar1 = 'dyno';
    }
    const app = await bootstrapNestApplication({
      globalEnvironmentsOptions: { debug: true },
      project: {
        name: 'TestApplication',
        description: 'Test application',
      },
      modules: {
        system: [DefaultTestNestApplicationCreate.forRoot(), DefaultTestNestApplicationInitializer.forRoot()],
        feature: [
          SampleWithSharedConfig.forRootAsync({
            configurationClass: DynoClass,
          }),
        ],
      },
    });

    await request(app.getHttpServer()).get('/get-hello').expect(200).expect('Hello World! (var1: var1value)');

    await request(app.getHttpServer())
      .get('/get-options')
      .expect(200)
      .expect(JSON.stringify({ dynamicVar1: 'dyno' }));

    await request(app.getHttpServer()).get('/get-static-options').expect(200).expect(JSON.stringify({}));

    await request(app.getHttpServer())
      .get('/get-environments')
      .expect(200)
      .expect(JSON.stringify({ var1: 'var1value' }));

    await app.close();
  });

  it('should return "Hello World! (var1: var1value)", use process.env value in forRoot options and name for append prefix to property name', async () => {
    process.env['TEST_APPLICATION_APP_11_SAMPLE_WITH_SHARED_CONFIG_VAR_1'] = 'var1value';
    const app = await bootstrapNestApplication({
      globalEnvironmentsOptions: { debug: true },
      globalConfigurationOptions: { debug: true },
      project: {
        name: 'TestApplication',
        description: 'Test application',
      },
      modules: {
        system: [DefaultTestNestApplicationCreate.forRoot(), DefaultTestNestApplicationInitializer.forRoot()],
        feature: [
          SampleWithSharedConfig.forRootAsync({
            contextName: 'app11',
            configuration: { dynamicVar1: 'dyno' },
          }),
        ],
      },
    });

    await request(app.getHttpServer()).get('/get-hello').expect(200).expect('Hello World! (var1: var1value)');

    await request(app.getHttpServer())
      .get('/get-options')
      .expect(200)
      .expect(JSON.stringify({ dynamicVar1: 'dyno' }));

    await request(app.getHttpServer()).get('/get-static-options').expect(200).expect(JSON.stringify({}));

    await request(app.getHttpServer())
      .get('/get-environments')
      .expect(200)
      .expect(JSON.stringify({ var1: 'var1value' }));

    await app.close();
  });

  it('should return "Hello World! (var1: api1var1value)" and "Hello World! (var1: api2var1value)", use process.env value in forRoot options, run two different instance of module', async () => {
    process.env['TEST_APPLICATION_API_21_SAMPLE_WITH_SHARED_CONFIG_VAR_1'] = 'api1var1value';
    process.env['TEST_APPLICATION_API_22_SAMPLE_WITH_SHARED_CONFIG_VAR_1'] = 'api2var1value';
    class DynoClass implements SampleWithSharedConfigConfiguration {
      dynamicVar1 = 'dyno';
    }
    const app = await bootstrapNestApplication({
      project: {
        name: 'TestApplication',
        description: 'Test application',
      },
      modules: {
        system: [DefaultTestNestApplicationCreate.forRoot(), DefaultTestNestApplicationInitializer.forRoot()],
        feature: [
          SampleWithSharedConfig.forRootAsync({
            contextName: 'api21',
            configuration: { dynamicVar1: 'dyno' },
            staticConfiguration: {
              endpoint: 'api1',
            },
          }),
          SampleWithSharedConfig.forRootAsync({
            contextName: 'api22',
            configurationClass: DynoClass,
            staticConfiguration: {
              endpoint: 'api2',
            },
          }),
        ],
      },
    });

    await request(app.getHttpServer()).get('/api1/get-hello').expect(200).expect('Hello World! (var1: api1var1value)');

    await request(app.getHttpServer()).get('/api2/get-hello').expect(200).expect('Hello World! (var1: api2var1value)');

    await request(app.getHttpServer())
      .get('/api1/get-options')
      .expect(200)
      .expect(JSON.stringify({ dynamicVar1: 'dyno' }));

    await request(app.getHttpServer())
      .get('/api1/get-static-options')
      .expect(200)
      .expect(JSON.stringify({ endpoint: 'api1' }));

    await request(app.getHttpServer())
      .get('/api1/get-environments')
      .expect(200)
      .expect(JSON.stringify({ var1: 'api1var1value' }));

    await request(app.getHttpServer())
      .get('/api2/get-options')
      .expect(200)
      .expect(JSON.stringify({ dynamicVar1: 'dyno' }));

    await request(app.getHttpServer())
      .get('/api2/get-static-options')
      .expect(200)
      .expect(JSON.stringify({ endpoint: 'api2' }));

    await request(app.getHttpServer())
      .get('/api2/get-environments')
      .expect(200)
      .expect(JSON.stringify({ var1: 'api2var1value' }));

    await app.close();
  });

  it('should return "First Hello World! (var1: api1var1value)" and "Second Hello World! (var1: api2var1value)", use process.env value in forRoot options, run two different instance of one service', async () => {
    process.env['TEST_APPLICATION_API_31_SAMPLE_WITH_SHARED_CONFIG_VAR_1'] = 'api1var1value';
    process.env['TEST_APPLICATION_API_32_SAMPLE_WITH_SHARED_CONFIG_VAR_1'] = 'api2var1value';
    process.env['TEST_APPLICATION_API_33_SAMPLE_WITH_SHARED_CONFIG_VAR_1'] = 'api3var1value';

    // first
    @Injectable()
    class FirstService {
      constructor(
        @InjectService(SampleWithSharedConfigService, 'api31')
        private readonly sampleWithSharedConfigService1: SampleWithSharedConfigService,
        @InjectService(SampleWithSharedConfigService, 'api33')
        private readonly sampleWithSharedConfigService3: SampleWithSharedConfigService,
        private readonly sampleWithSharedConfigService: SampleWithSharedConfigService
      ) {}

      getHello(): string {
        return `First ${this.sampleWithSharedConfigService.getHello()}`;
      }

      getHello31(): string {
        return this.sampleWithSharedConfigService1.getHello();
      }

      getHello33(): string {
        return this.sampleWithSharedConfigService3.getHello();
      }
    }

    @Controller('first')
    class FirstController {
      constructor(readonly firstService: FirstService) {}

      @Get()
      getHello(): string {
        return this.firstService.getHello();
      }

      @Get('31')
      getHello31(): string {
        return this.firstService.getHello31();
      }

      @Get('33')
      getHello33(): string {
        return this.firstService.getHello33();
      }
    }

    @Module({
      imports: [
        SampleWithSharedConfig.forFeature({ featureModuleName: 'SampleWithSharedConfig', contextName: 'api31' }),
        SampleWithSharedConfig.forFeature({ featureModuleName: 'SampleWithSharedConfig', contextName: 'api33' }),
      ],
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
      imports: [
        SampleWithSharedConfig.forFeature({ featureModuleName: 'SampleWithSharedConfig', contextName: 'api32' }),
      ],
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
          SampleWithSharedConfig.forRootAsync({
            contextName: 'api31',
            configuration: { dynamicVar1: 'dyno' },
            staticConfiguration: {
              endpoint: 'api1',
            },
          }),
          SampleWithSharedConfig.forRootAsync({
            contextName: 'api32',
            configuration: { dynamicVar1: 'dyno' },
            staticConfiguration: {
              endpoint: 'api2',
            },
          }),
          SampleWithSharedConfig.forRootAsync({
            contextName: 'api33',
            configuration: { dynamicVar1: 'dyno' },
            staticConfiguration: {
              endpoint: 'api3',
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

    await request(app.getHttpServer()).get('/first/31').expect(200).expect('Hello World! (var1: api1var1value)');

    await request(app.getHttpServer()).get('/first/33').expect(200).expect('Hello World! (var1: api3var1value)');
    await app.close();
  });

  it('should return "Hello World! (var1: api1var1value)" and "Hello World! (var1: api2var1value)", use process.env value in forRoot from staticEnvironments, run two different instance of module', async () => {
    process.env['TEST_APPLICATION_API_41_SAMPLE_WITH_SHARED_CONFIG_VAR_1'] = 'api1var1value';
    process.env['TEST_APPLICATION_API_42_SAMPLE_WITH_SHARED_CONFIG_VAR_1'] = 'api2var1value';
    process.env['TEST_APPLICATION_API_41_SAMPLE_WITH_SHARED_CONFIG_ENDPOINT'] = 'api1';
    class DynoClass implements SampleWithSharedConfigConfiguration {
      dynamicVar1 = 'dyno';
    }
    const app = await bootstrapNestApplication({
      project: {
        name: 'TestApplication',
        description: 'Test application',
      },
      modules: {
        system: [DefaultTestNestApplicationCreate.forRoot(), DefaultTestNestApplicationInitializer.forRoot()],
        feature: [
          SampleWithSharedConfig.forRootAsync({
            contextName: 'api41',
            configuration: { dynamicVar1: 'dyno' },
          }),
          SampleWithSharedConfig.forRootAsync({
            contextName: 'api42',
            configurationClass: DynoClass,
            staticEnvironments: { endpoint: 'api2' },
          }),
        ],
      },
    });

    await request(app.getHttpServer()).get('/api1/get-hello').expect(200).expect('Hello World! (var1: api1var1value)');

    await request(app.getHttpServer()).get('/api2/get-hello').expect(200).expect('Hello World! (var1: api2var1value)');

    await request(app.getHttpServer())
      .get('/api1/get-options')
      .expect(200)
      .expect(JSON.stringify({ dynamicVar1: 'dyno' }));

    await request(app.getHttpServer()).get('/api1/get-static-options').expect(200).expect(JSON.stringify({}));

    await request(app.getHttpServer())
      .get('/api1/get-environments')
      .expect(200)
      .expect(JSON.stringify({ var1: 'api1var1value' }));

    await request(app.getHttpServer())
      .get('/api1/get-static-environments')
      .expect(200)
      .expect(JSON.stringify({ endpoint: 'api1' }));

    await request(app.getHttpServer())
      .get('/api2/get-options')
      .expect(200)
      .expect(JSON.stringify({ dynamicVar1: 'dyno' }));

    await request(app.getHttpServer()).get('/api2/get-static-options').expect(200).expect(JSON.stringify({}));

    await request(app.getHttpServer())
      .get('/api2/get-environments')
      .expect(200)
      .expect(JSON.stringify({ var1: 'api2var1value' }));

    await request(app.getHttpServer())
      .get('/api2/get-static-environments')
      .expect(200)
      .expect(JSON.stringify({ endpoint: 'api2' }));

    await app.close();
  });
});
