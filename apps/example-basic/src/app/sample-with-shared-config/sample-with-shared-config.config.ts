import {
  ConfigModel,
  ConfigModelProperty,
  EnvModel,
  EnvModelProperty,
} from '@nestjs-mod/common';
import { IsNotEmpty } from 'class-validator';
import { SAMPLE_WITH_SHARED_CONFIG_NAME } from './sample-with-shared-config.const';

@EnvModel({ name: SAMPLE_WITH_SHARED_CONFIG_NAME })
export class SampleWithSharedConfigEnvironments {
  @EnvModelProperty()
  @IsNotEmpty()
  var1!: string;
}

@EnvModel({ name: SAMPLE_WITH_SHARED_CONFIG_NAME })
export class SampleWithSharedConfigStaticEnvironments {
  @EnvModelProperty()
  endpoint?: string;
}

@ConfigModel()
export class SampleWithSharedConfigConfiguration {
  @ConfigModelProperty()
  dynamicVar1?: string;
}

@ConfigModel()
export class SampleWithSharedConfigStaticConfiguration {
  @ConfigModelProperty()
  endpoint?: string;
}

@ConfigModel()
export class SampleWithSharedConfigFeatureConfiguration {
  @ConfigModelProperty()
  @IsNotEmpty()
  featureVar!: string;
}
