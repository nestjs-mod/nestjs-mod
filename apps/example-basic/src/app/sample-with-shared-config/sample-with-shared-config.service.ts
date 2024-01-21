import { InjectableFeatureConfigurationType, InjectableFeatureEnvironmentsType } from '@nestjs-mod/common';
import { Injectable } from '@nestjs/common';
import {
  SampleWithSharedConfigConfiguration,
  SampleWithSharedConfigEnvironments,
  SampleWithSharedConfigFeatureConfiguration,
  SampleWithSharedConfigFeatureEnvironments,
  SampleWithSharedConfigStaticConfiguration,
  SampleWithSharedConfigStaticEnvironments,
} from './sample-with-shared-config.config';
import { InjectAllFeatureEnvironments, InjectFeatures } from './sample-with-shared-config.utils';

@Injectable()
export class SampleWithSharedConfigService {
  constructor(
    @InjectFeatures()
    private readonly features: InjectableFeatureConfigurationType<SampleWithSharedConfigFeatureConfiguration>[],
    @InjectAllFeatureEnvironments()
    private readonly featureEnvironments: Record<
      string,
      InjectableFeatureEnvironmentsType<SampleWithSharedConfigFeatureEnvironments>[]
    >,
    private readonly configuration: SampleWithSharedConfigConfiguration,
    private readonly staticConfiguration: SampleWithSharedConfigStaticConfiguration,
    private readonly environments: SampleWithSharedConfigEnvironments,
    private readonly staticEnvironments: SampleWithSharedConfigStaticEnvironments
  ) {}

  getHello(): string {
    return `Hello World! (var1: ${this.environments.var1})`;
  }

  getConfiguration() {
    return this.configuration;
  }

  getEnvironments() {
    return this.environments;
  }

  getStaticConfiguration() {
    return this.staticConfiguration;
  }

  getStaticEnvironments() {
    return this.staticEnvironments;
  }

  getFeatures() {
    return this.features.map(({ featureConfiguration }) => featureConfiguration);
  }

  getFeatureEnvironments(contextName: string) {
    return Object.entries(this.featureEnvironments[contextName]).map(([, value]) => value.featureEnvironments);
  }
}
