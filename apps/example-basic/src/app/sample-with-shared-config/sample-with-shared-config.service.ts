import { Injectable } from '@nestjs/common';
import {
  SampleWithSharedConfigConfiguration,
  SampleWithSharedConfigEnvironments,
  SampleWithSharedConfigFeatureConfiguration,
  SampleWithSharedConfigStaticConfiguration,
  SampleWithSharedConfigStaticEnvironments,
} from './sample-with-shared-config.config';
import { InjectFeatures } from './sample-with-shared-config.utils';

@Injectable()
export class SampleWithSharedConfigService {
  constructor(
    @InjectFeatures()
    private readonly features: SampleWithSharedConfigFeatureConfiguration[],
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
    return this.features;
  }
}
