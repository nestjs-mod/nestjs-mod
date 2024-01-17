import { Controller, Get, Param } from '@nestjs/common';
import { SampleWithSharedConfigService } from './sample-with-shared-config.service';

export function getSampleWithSharedConfigController(endpoint?: string) {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  @Controller(endpoint!)
  class SampleWithSharedConfigController {
    constructor(readonly appService: SampleWithSharedConfigService) {}

    @Get('get-hello')
    getHello(): string {
      return this.appService.getHello();
    }

    @Get('get-options')
    getOptions() {
      return JSON.stringify(this.appService.getConfiguration());
    }

    @Get('get-static-options')
    getStaticOptions() {
      return JSON.stringify(this.appService.getStaticConfiguration());
    }

    @Get('get-environments')
    getEnvironments() {
      return JSON.stringify(this.appService.getEnvironments());
    }

    @Get('get-static-environments')
    getStaticEnvironments() {
      return JSON.stringify(this.appService.getStaticEnvironments());
    }

    @Get('get-features')
    getFeatures(): string {
      return JSON.stringify(this.appService.getFeatures());
    }

    @Get('get-feature-environments/:contextName')
    getFeatureEnvironments(@Param('contextName') contextName: string): string {
      return JSON.stringify(this.appService.getFeatureEnvironments(contextName));
    }
  }
  return SampleWithSharedConfigController;
}
