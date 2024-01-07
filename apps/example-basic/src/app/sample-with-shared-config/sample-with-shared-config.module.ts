import { createNestModule, NestModuleCategory } from '@nestjs-mod/common';
import {
  SampleWithSharedConfigConfiguration,
  SampleWithSharedConfigEnvironments,
  SampleWithSharedConfigFeatureConfiguration,
  SampleWithSharedConfigStaticConfiguration,
  SampleWithSharedConfigStaticEnvironments,
} from './sample-with-shared-config.config';
import { SAMPLE_WITH_SHARED_CONFIG_NAME } from './sample-with-shared-config.const';
import { getSampleWithSharedConfigController } from './sample-with-shared-config.controller';
import { SampleWithSharedConfigService } from './sample-with-shared-config.service';

export const { SampleWithSharedConfig } = createNestModule({
  moduleName: SAMPLE_WITH_SHARED_CONFIG_NAME,
  moduleCategory: NestModuleCategory.feature,
  configurationModel: SampleWithSharedConfigConfiguration,
  staticConfigurationModel: SampleWithSharedConfigStaticConfiguration,
  environmentsModel: SampleWithSharedConfigEnvironments,
  staticEnvironmentsModel: SampleWithSharedConfigStaticEnvironments,
  featureConfigurationModel: SampleWithSharedConfigFeatureConfiguration,
  controllers: (
    staticOptions?: SampleWithSharedConfigStaticConfiguration,
    staticEnvironments?: SampleWithSharedConfigStaticEnvironments
  ) => [
    getSampleWithSharedConfigController(
      staticOptions?.endpoint ?? staticEnvironments?.endpoint
    ),
  ],
  sharedProviders: [SampleWithSharedConfigService],
});
