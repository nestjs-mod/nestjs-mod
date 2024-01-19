import { Logger } from '@nestjs/common';
import { ProjectOptions } from '../../../../nest-module/types';
import { isInfrastructureMode } from '../../../../utils/is-infrastructure';
import { ProjectUtilsConfiguration } from '../project-utils.configuration';
import { ApplicationPackageJsonService } from './application-package-json.service';
import { WrapApplicationOptionsService } from './wrap-application-options.service';

export class ProjectUtilsPatcherService {
  private logger = new Logger(ProjectUtilsPatcherService.name);

  constructor(
    private readonly projectUtilsConfiguration: ProjectUtilsConfiguration,
    private readonly applicationPackageJsonService: ApplicationPackageJsonService,
    private readonly wrapApplicationOptionsService: WrapApplicationOptionsService
  ) {}

  async patch() {
    if (!this.projectUtilsConfiguration || !this.applicationPackageJsonService || !this.wrapApplicationOptionsService) {
      this.logger.warn(
        `projectUtilsConfiguration or applicationPackageJsonService or wrapApplicationOptionsService not set, patching not work`
      );
      return;
    }
    await this.patchProject();
    await this.patchGlobalConfigurationAndEnvironmentsOptions();
  }

  private async patchGlobalConfigurationAndEnvironmentsOptions() {
    if (this.projectUtilsConfiguration.patchGlobalConfigurationAndEnvironmentsOptions) {
      if (!this.wrapApplicationOptionsService.globalConfigurationOptions) {
        this.wrapApplicationOptionsService.globalConfigurationOptions = {};
      }
      Object.assign(
        this.wrapApplicationOptionsService.globalConfigurationOptions,
        this.getNewGlobalConfigurationAndEnvironmentsOptions()
      );

      if (!this.wrapApplicationOptionsService.globalEnvironmentsOptions) {
        this.wrapApplicationOptionsService.globalEnvironmentsOptions = {};
      }
      Object.assign(
        this.wrapApplicationOptionsService.globalEnvironmentsOptions,
        this.getNewGlobalConfigurationAndEnvironmentsOptions()
      );
    }
  }

  private getNewGlobalConfigurationAndEnvironmentsOptions() {
    return {
      ...((this.wrapApplicationOptionsService.globalConfigurationOptions?.debug !== undefined
        ? {
            debug: this.wrapApplicationOptionsService.globalConfigurationOptions?.debug,
          }
        : {}) ?? true),
      ...((this.wrapApplicationOptionsService.globalConfigurationOptions?.skipValidation !== undefined
        ? {
            skipValidation: this.wrapApplicationOptionsService.globalConfigurationOptions?.skipValidation,
          }
        : {}) ?? isInfrastructureMode()),
    };
  }

  private async patchProject() {
    const applicationPackageJson = await this.applicationPackageJsonService.read();
    if (!this.wrapApplicationOptionsService.project) {
      this.wrapApplicationOptionsService.project = {} as ProjectOptions;
    }
    if (this.projectUtilsConfiguration.patchProject) {
      if (!this.wrapApplicationOptionsService.project.name && applicationPackageJson?.name) {
        this.wrapApplicationOptionsService.project.name = applicationPackageJson?.name;
      }
      if (!this.wrapApplicationOptionsService.project.description && applicationPackageJson?.description) {
        this.wrapApplicationOptionsService.project.description = applicationPackageJson?.description;
      }
      if (!this.wrapApplicationOptionsService.project.version && applicationPackageJson?.version) {
        this.wrapApplicationOptionsService.project.version = applicationPackageJson?.version;
      }
    }
  }
}
