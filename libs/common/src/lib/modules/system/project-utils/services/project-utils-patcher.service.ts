import { ProjectOptions } from '../../../../nest-module/types';
import { isInfrastructureMode } from '../../../../utils/is-infrastructure';
import { ProjectUtilsConfiguration } from '../project-utils.configuration';
import { ApplicationPackageJsonService } from './application-package-json.service';
import { WrapApplicationOptionsService } from './wrap-application-options.service';

export class ProjectUtilsPatcherService {
  constructor(
    private readonly projectUtilsConfiguration: ProjectUtilsConfiguration,
    private readonly applicationPackageJsonService: ApplicationPackageJsonService,
    private readonly wrapApplicationOptionsService: WrapApplicationOptionsService
  ) {}

  async patch() {
    if (!this.wrapApplicationOptionsService.project) {
      this.wrapApplicationOptionsService.project = {} as ProjectOptions;
    }
    await this.patchProject();
    await this.patchGlobalConfigurationAndEnvironmentsOptions();
  }

  private async patchGlobalConfigurationAndEnvironmentsOptions() {
    if (
      this.projectUtilsConfiguration.patchGlobalConfigurationAndEnvironmentsOptions &&
      this.wrapApplicationOptionsService.project
    ) {
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
    if (!this.wrapApplicationOptionsService.project) {
      return {};
    }
    return {
      name: this.wrapApplicationOptionsService.project.name,
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

    if (this.projectUtilsConfiguration.patchProject && this.wrapApplicationOptionsService.project) {
      if (applicationPackageJson?.name) {
        this.wrapApplicationOptionsService.project.name = applicationPackageJson?.name;
      }
      if (applicationPackageJson?.description) {
        this.wrapApplicationOptionsService.project.description = applicationPackageJson?.description;
      }
      if (applicationPackageJson?.version) {
        this.wrapApplicationOptionsService.project.version = applicationPackageJson?.version;
      }
    }
  }
}
