import { getNestModuleDecorators } from '@nestjs-mod/common';
import { SAMPLE_WITH_SHARED_CONFIG_NAME } from './sample-with-shared-config.const';

export const { InjectService, InjectFeatures } = getNestModuleDecorators({
  moduleName: SAMPLE_WITH_SHARED_CONFIG_NAME,
});
