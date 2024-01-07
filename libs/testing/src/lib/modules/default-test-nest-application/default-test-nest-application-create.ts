import {
  ConfigModel,
  ConfigModelProperty,
  DynamicNestModuleMetadata,
  NestModuleCategory,
  createNestModule,
} from '@nestjs-mod/common';
import { Test, TestingModule, TestingModuleBuilder } from '@nestjs/testing';

@ConfigModel()
class DefaultTestNestApplicationCreateConfig {
  @ConfigModelProperty({
    description: 'Method for additional actions with TestingModuleBuilder',
  })
  wrapTestingModuleBuilder?: (
    testingModuleBuilder: TestingModuleBuilder
  ) => TestingModuleBuilder | void;
}

export const { DefaultTestNestApplicationCreate } = createNestModule({
  moduleName: 'DefaultTestNestApplicationCreate',
  moduleDescription:
    'Default test NestJS application creator, no third party utilities required.',
  moduleCategory: NestModuleCategory.system,
  staticConfigurationModel: DefaultTestNestApplicationCreateConfig,
  wrapApplication: async ({ modules, current }) => {
    let testingModuleBuilder = Test.createTestingModule({
      imports: Object.values(modules)
        .flat()
        .filter(
          (m: DynamicNestModuleMetadata) =>
            !m.nestModuleMetadata?.preWrapApplication &&
            !m.nestModuleMetadata?.postWrapApplication
        ),
    });
    if (current?.staticConfiguration?.wrapTestingModuleBuilder) {
      const newTestingModuleBuilder =
        current?.staticConfiguration.wrapTestingModuleBuilder(
          testingModuleBuilder
        );
      if (newTestingModuleBuilder) {
        testingModuleBuilder = newTestingModuleBuilder;
      }
    }
    const moduleRef: TestingModule = await testingModuleBuilder.compile();

    return moduleRef.createNestApplication();
  },
});
