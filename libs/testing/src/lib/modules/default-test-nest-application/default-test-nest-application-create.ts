import {
  ConfigModel,
  ConfigModelProperty,
  NestModuleCategory,
  createNestModule,
  isInfrastructureMode,
} from '@nestjs-mod/common';
import { Logger } from '@nestjs/common';
import { Test, TestingModule, TestingModuleBuilder } from '@nestjs/testing';

@ConfigModel()
class DefaultTestNestApplicationCreateConfig {
  @ConfigModelProperty({
    description: 'Method for additional actions with TestingModuleBuilder',
  })
  wrapTestingModuleBuilder?: (testingModuleBuilder: TestingModuleBuilder) => TestingModuleBuilder | void;

  @ConfigModelProperty({
    description: 'Default logger for application',
  })
  defaultLogger?: Logger | null;
}

export const { DefaultTestNestApplicationCreate } = createNestModule({
  moduleName: 'DefaultTestNestApplicationCreate',
  moduleDescription: 'Default test NestJS application creator, no third party utilities required.',
  moduleCategory: NestModuleCategory.system,
  staticConfigurationModel: DefaultTestNestApplicationCreateConfig,
  // creating test application
  wrapApplication: async ({ modules, current }) => {
    let testingModuleBuilder = Test.createTestingModule({
      imports: Object.entries(modules)
        .filter(([category]) => isInfrastructureMode() || category !== NestModuleCategory.infrastructure)
        .map(([, value]) => value)
        .flat(),
    });
    if (current?.staticConfiguration?.wrapTestingModuleBuilder) {
      const newTestingModuleBuilder = current?.staticConfiguration.wrapTestingModuleBuilder(testingModuleBuilder);
      if (newTestingModuleBuilder) {
        testingModuleBuilder = newTestingModuleBuilder;
      }
    }

    const moduleRef: TestingModule = await testingModuleBuilder.compile();

    const app = moduleRef.createNestApplication();

    if (current.staticConfiguration?.defaultLogger) {
      app.useLogger(current.staticConfiguration?.defaultLogger);
    }

    return app;
  },
});
