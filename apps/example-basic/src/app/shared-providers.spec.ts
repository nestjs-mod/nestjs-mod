import {
  bootstrapNestApplication,
  ConfigModel,
  ConfigModelProperty,
  createNestModule,
  EnvModel,
  EnvModelProperty,
} from '@nestjs-mod/common';
import { DefaultTestNestApplicationCreate, DefaultTestNestApplicationInitializer } from '@nestjs-mod/testing';
import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';

describe('NestJS modules with shared providers and imports', () => {
  it('should activate onModuleInit only once', async () => {
    let constructorSharedCount = 0;
    let onModuleInitSharedCount = 0;
    let onModuleDestroySharedCount = 0;

    let constructorLocalCount = 0;
    let onModuleInitLocalCount = 0;
    let onModuleDestroyLocalCount = 0;

    @ConfigModel()
    class SubModuleWithSharedServiceFeatureConfig {
      @ConfigModelProperty()
      increment!: number;
    }

    @ConfigModel()
    class SubModuleWithSharedServiceConfig {
      @ConfigModelProperty()
      increment!: number;
    }

    @EnvModel()
    class SubModuleWithSharedServiceEnv {
      @EnvModelProperty()
      increment!: number;
    }

    @Injectable()
    class LocalService implements OnModuleInit, OnModuleDestroy {
      constructor() {
        console.log('LocalService');
        constructorLocalCount = constructorLocalCount + 1;
      }
      onModuleInit() {
        onModuleInitLocalCount = onModuleInitLocalCount + 1;
      }
      onModuleDestroy() {
        onModuleDestroyLocalCount = onModuleDestroyLocalCount + 1;
      }
    }

    @Injectable()
    class SharedService implements OnModuleInit, OnModuleDestroy {
      constructor() {
        console.log('SharedService');
        constructorSharedCount = constructorSharedCount + 1;
      }
      onModuleInit() {
        onModuleInitSharedCount = onModuleInitSharedCount + 1;
      }
      onModuleDestroy() {
        onModuleDestroySharedCount = onModuleDestroySharedCount + 1;
      }
    }

    const { SubModuleWithSharedService } = createNestModule({
      moduleName: 'SubModuleWithSharedService',
      providers: [LocalService],
      sharedProviders: [SharedService],
      featureConfigurationModel: SubModuleWithSharedServiceFeatureConfig,
      configurationModel: SubModuleWithSharedServiceConfig,
      environmentsModel: SubModuleWithSharedServiceEnv,
    });

    const { AppModuleWithSharedService } = createNestModule({
      moduleName: 'AppModuleWithSharedService',
      sharedImports: [SubModuleWithSharedService.forFeature()],
    });

    const app = await bootstrapNestApplication({
      project: {
        name: 'TestApplication',
        description: 'Test application',
      },
      modules: {
        system: [DefaultTestNestApplicationCreate.forRoot(), DefaultTestNestApplicationInitializer.forRoot()],
        feature: [
          SubModuleWithSharedService.forRootAsync({
            configuration: {
              increment: 1,
            },
          }),
          AppModuleWithSharedService.forRootAsync(),
        ],
      },
    });

    await app.close();

    expect(constructorSharedCount).toEqual(1);
    expect(onModuleInitSharedCount).toEqual(1);
    expect(onModuleDestroySharedCount).toEqual(1);

    expect(constructorLocalCount).toEqual(1);
    expect(onModuleInitLocalCount).toEqual(1);
    expect(onModuleDestroyLocalCount).toEqual(1);
  });
});
