import { createNestModule, NestModuleCategory } from '@nestjs-mod/common';
import { Module } from '@nestjs/common';
import {
  SampleWithSharedConfigConfiguration,
  SampleWithSharedConfigEnvironments,
  SampleWithSharedConfigFeatureConfiguration,
  SampleWithSharedConfigFeatureEnvironments,
  SampleWithSharedConfigStaticConfiguration,
  SampleWithSharedConfigStaticEnvironments,
} from './sample-with-shared-config.config';
import { SAMPLE_WITH_SHARED_CONFIG_NAME } from './sample-with-shared-config.const';
import { getSampleWithSharedConfigController } from './sample-with-shared-config.controller';
import { SampleWithSharedConfigService } from './sample-with-shared-config.service';

@Module({})
export class SharedImport1Module {}

export const { SharedImport2Module } = createNestModule({
  moduleName: 'SharedImport2Module',
});

export const { SampleWithSharedConfig } = createNestModule({
  moduleName: SAMPLE_WITH_SHARED_CONFIG_NAME,
  moduleCategory: NestModuleCategory.feature,
  configurationModel: SampleWithSharedConfigConfiguration,
  staticConfigurationModel: SampleWithSharedConfigStaticConfiguration,
  environmentsModel: SampleWithSharedConfigEnvironments,
  staticEnvironmentsModel: SampleWithSharedConfigStaticEnvironments,
  featureConfigurationModel: SampleWithSharedConfigFeatureConfiguration,
  featureEnvironmentsModel: SampleWithSharedConfigFeatureEnvironments,
  controllers: ({ staticConfiguration, staticEnvironments }) => [
    getSampleWithSharedConfigController(staticConfiguration?.endpoint || staticEnvironments?.endpoint),
  ],
  sharedProviders: [SampleWithSharedConfigService],
  sharedImports: [SharedImport1Module, SharedImport2Module],
});
