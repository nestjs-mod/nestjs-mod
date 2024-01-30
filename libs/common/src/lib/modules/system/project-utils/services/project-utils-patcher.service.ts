import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { ProjectOptions } from '../../../../nest-module/types';
import { isInfrastructureMode } from '../../../../utils/is-infrastructure';
import { ProjectUtilsConfiguration } from '../project-utils.configuration';
import { ApplicationPackageJsonService } from './application-package-json.service';
import { DotEnvService } from './dot-env.service';
import { WrapApplicationOptionsService } from './wrap-application-options.service';
import { PackageJsonService } from './package-json.service';

@Injectable()
export class ProjectUtilsPatcherService implements OnApplicationBootstrap {
  private logger = new Logger(ProjectUtilsPatcherService.name);

  constructor(
    private readonly projectUtilsConfiguration: ProjectUtilsConfiguration,
    private readonly applicationPackageJsonService: ApplicationPackageJsonService,
    private readonly wrapApplicationOptionsService: WrapApplicationOptionsService,
    private readonly dotEnvService: DotEnvService,
    private readonly packageJsonService: PackageJsonService
  ) {}

  async onApplicationBootstrap() {
    await this.updatePackage();
    await this.updateProject();
    await this.updateEnvFile();
    await this.updateGlobalConfigurationAndEnvironmentsOptions();
  }

  private async updatePackage() {
    if (!this.packageJsonService) {
      this.logger.warn(`packageJsonService not set, updating not work`);
      return;
    }
    const existsJson = await this.packageJsonService.read();
    if (existsJson) {
      await this.packageJsonService.write(existsJson);
    }
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
      const packageJson = await this.packageJsonService.read();
      const applicationPackageJson = await this.applicationPackageJsonService.read();
      if (!this.wrapApplicationOptionsService.project) {
        this.wrapApplicationOptionsService.project = {} as ProjectOptions;
      }
      if (!this.wrapApplicationOptionsService.project.name) {
        this.wrapApplicationOptionsService.project.name = applicationPackageJson?.name ?? packageJson?.name ?? '';
      }
      if (!this.wrapApplicationOptionsService.project.description) {
        this.wrapApplicationOptionsService.project.description =
          applicationPackageJson?.description ?? packageJson?.description ?? '';
      }
      if (!this.wrapApplicationOptionsService.project.version) {
        this.wrapApplicationOptionsService.project.version = applicationPackageJson?.version ?? packageJson?.version;
      }
      if (!this.wrapApplicationOptionsService.project.license) {
        this.wrapApplicationOptionsService.project.license = applicationPackageJson?.license ?? packageJson?.license;
      }
      if (!this.wrapApplicationOptionsService.project.maintainers) {
        this.wrapApplicationOptionsService.project.maintainers =
          applicationPackageJson?.maintainers ?? packageJson?.maintainers;
      }
      if (!this.wrapApplicationOptionsService.project.repository) {
        this.wrapApplicationOptionsService.project.repository =
          applicationPackageJson?.repository ?? packageJson?.repository;
      }
      if (!this.wrapApplicationOptionsService.project.devScripts) {
        this.wrapApplicationOptionsService.project.devScripts =
          applicationPackageJson?.devScripts ?? packageJson?.devScripts;
      }
      if (!this.wrapApplicationOptionsService.project.prodScripts) {
        this.wrapApplicationOptionsService.project.prodScripts =
          applicationPackageJson?.prodScripts ?? packageJson?.prodScripts;
      }
      if (!this.wrapApplicationOptionsService.project.testsScripts) {
        this.wrapApplicationOptionsService.project.testsScripts =
          applicationPackageJson?.testsScripts ?? packageJson?.testsScripts;
      }
    }
  }
}
