import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { ProjectOptions } from '../../../../nest-module/types';
import { isInfrastructureMode } from '../../../../utils/is-infrastructure';
import { ProjectUtilsConfiguration } from '../project-utils.configuration';
import { ApplicationPackageJsonService } from './application-package-json.service';
import { DotEnvService } from './dot-env.service';
import { WrapApplicationOptionsService } from './wrap-application-options.service';

@Injectable()
export class ProjectUtilsPatcherService implements OnApplicationBootstrap {
  private logger = new Logger(ProjectUtilsPatcherService.name);

  constructor(
    private readonly projectUtilsConfiguration: ProjectUtilsConfiguration,
    private readonly applicationPackageJsonService: ApplicationPackageJsonService,
    private readonly wrapApplicationOptionsService: WrapApplicationOptionsService,
    private readonly dotEnvService: DotEnvService
  ) {}

  async onApplicationBootstrap() {
    await this.updateProject();
    await this.updateEnvFile();
    await this.updateGlobalConfigurationAndEnvironmentsOptions();
  }

  private async updateEnvFile() {
    if (!this.dotEnvService && this.projectUtilsConfiguration.updateEnvFile) {
      this.logger.warn(`dotEnvService not set, updating not work`);
      return;
    }
    const existsEnvJson = (await this.dotEnvService.read()) || {};
    await this.dotEnvService.write(existsEnvJson);
  }

  private async updateGlobalConfigurationAndEnvironmentsOptions() {
    if (!this.projectUtilsConfiguration || !this.wrapApplicationOptionsService) {
      this.logger.warn(
        `projectUtilsConfiguration or applicationPackageJsonService or wrapApplicationOptionsService not set, updating not work`
      );
      return;
    }
    if (this.projectUtilsConfiguration.updateGlobalConfigurationAndEnvironmentsOptions) {
      if (!this.wrapApplicationOptionsService.globalConfigurationOptions) {
        this.wrapApplicationOptionsService.globalConfigurationOptions = {};
      }
      Object.assign(this.wrapApplicationOptionsService.globalConfigurationOptions, this.getNewGlobalConfiguration());

      if (!this.wrapApplicationOptionsService.globalEnvironmentsOptions) {
        this.wrapApplicationOptionsService.globalEnvironmentsOptions = {};
      }
      Object.assign(this.wrapApplicationOptionsService.globalEnvironmentsOptions, this.getNewGlobalEnvironments());
    }
  }

  private getNewGlobalConfiguration() {
    return {
      ...(this.wrapApplicationOptionsService.globalConfigurationOptions?.debug === undefined
        ? {
            debug: true,
          }
        : {}),
      ...(this.wrapApplicationOptionsService.globalConfigurationOptions?.skipValidation === undefined
        ? {
            skipValidation: isInfrastructureMode(),
          }
        : {}),
    };
  }

  private getNewGlobalEnvironments() {
    return {
      ...(this.wrapApplicationOptionsService.globalEnvironmentsOptions?.debug === undefined
        ? {
            debug: true,
          }
        : {}),
      ...(this.wrapApplicationOptionsService.globalEnvironmentsOptions?.skipValidation === undefined
        ? {
            skipValidation: isInfrastructureMode(),
          }
        : {}),
    };
  }

  private async updateProject() {
    if (!this.projectUtilsConfiguration || !this.applicationPackageJsonService || !this.wrapApplicationOptionsService) {
      this.logger.warn(
        `projectUtilsConfiguration or applicationPackageJsonService or wrapApplicationOptionsService not set, updating not work`
      );
      return;
    }
    if (this.projectUtilsConfiguration.updateProjectOptions) {
      const applicationPackageJson = await this.applicationPackageJsonService.read();
      if (!this.wrapApplicationOptionsService.project) {
        this.wrapApplicationOptionsService.project = {} as ProjectOptions;
      }
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
