import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { capitalCase } from 'case-anything';
import { EnvModelInfoValidationsPropertyNameFormatters } from '../../../../env-model/types';
import { ProjectOptions } from '../../../../nest-module/types';
import { isInfrastructureMode } from '../../../../utils/is-infrastructure';
import { ProjectUtilsConfiguration } from '../project-utils.configuration';
import { ApplicationPackageJsonService } from './application-package-json.service';
import { DotEnvService } from './dot-env.service';
import { PackageJsonService } from './package-json.service';
import { WrapApplicationOptionsService } from './wrap-application-options.service';

@Injectable()
export class ProjectUtilsPatcherService implements OnApplicationBootstrap {
  private logger = new Logger(ProjectUtilsPatcherService.name);
  private printDotenv = true;

  constructor(
    private readonly projectUtilsConfiguration: ProjectUtilsConfiguration,
    private readonly applicationPackageJsonService: ApplicationPackageJsonService,
    private readonly wrapApplicationOptionsService: WrapApplicationOptionsService,
    private readonly dotEnvService: DotEnvService,
    private readonly packageJsonService: PackageJsonService
  ) {}

  async onApplicationBootstrap() {
    this.patchModules();

    this.updatePackage();
    await this.updateEnvFile();
    this.printDotenvKeys();
  }

  patchModules() {
    this.updateProject();
    this.updateGlobalConfigurationAndEnvironmentsOptions();
  }

  private updatePackage() {
    if (!this.packageJsonService) {
      this.logger.warn(`packageJsonService not set, updating not work`);
      return;
    }
    const existsJson = this.packageJsonService.read();
    if (isInfrastructureMode()) {
      if (existsJson) {
        this.packageJsonService.write(existsJson);
      }
    }
  }

  private printDotenvKeys() {
    if (!this.printDotenv || !this.projectUtilsConfiguration.printAllApplicationEnvs) {
      return;
    }
    this.printDotenv = false;
    const modules = Object.entries(this.wrapApplicationOptionsService.modules || {})
      .map(([, value]) => value)
      .flat()
      .filter((m) => m.getNestModuleMetadata?.()?.moduleCategory)
      .map((m) => m.moduleSettings);

    const contextName = 'default';

    const keys = [
      ...new Set(
        [
          ...modules
            .map((m) =>
              Object.keys(m?.[contextName]?.staticEnvironments?.validations || {})
                .map((key) =>
                  m?.[contextName]?.staticEnvironments?.validations[key]?.propertyNameFormatters
                    .filter((f: EnvModelInfoValidationsPropertyNameFormatters) => f.name === 'dotenv')
                    .map((f: EnvModelInfoValidationsPropertyNameFormatters) => ({
                      [f.value]: {
                        model: m?.[contextName]?.environments?.modelOptions.name,
                        ...m?.[contextName]?.staticEnvironments?.modelPropertyOptions.find(
                          (o) => (o.name === f.name || o.originalName === key) && o.hideValueFromOutputs !== true
                        ),
                      },
                    }))
                    .flat()
                )
                .flat()
            )
            .flat(),
          ...modules
            .map((m) =>
              Object.keys(m?.[contextName]?.environments?.validations || {})
                .map((key) =>
                  m?.[contextName]?.environments?.validations[key]?.propertyNameFormatters
                    .filter((f: EnvModelInfoValidationsPropertyNameFormatters) => f.name === 'dotenv')
                    .map((f: EnvModelInfoValidationsPropertyNameFormatters) => ({
                      [f.value]: {
                        model: m?.[contextName]?.environments?.modelOptions.name,
                        ...m?.[contextName]?.environments?.modelPropertyOptions.find(
                          (o) => (o.name === f.name || o.originalName === key) && o.hideValueFromOutputs
                        ),
                      },
                    }))
                    .flat()
                )
                .flat()
            )
            .flat(),
          ...modules
            .map((m) =>
              Object.entries(m?.[contextName]?.featureModuleEnvironments || {})
                .map(([, v]) =>
                  (v || [])
                    .map((vItem) =>
                      Object.keys(vItem?.validations || {}).map((key) =>
                        vItem?.validations[key]?.propertyNameFormatters
                          .filter((f: EnvModelInfoValidationsPropertyNameFormatters) => f.name === 'dotenv')
                          .map((f: EnvModelInfoValidationsPropertyNameFormatters) => ({
                            [f.value]: {
                              model: vItem.modelOptions.name,
                              ...vItem?.modelPropertyOptions.find(
                                (o) => (o.name === key || o.originalName === key) && o.hideValueFromOutputs !== true
                              ),
                            },
                          }))
                          .flat()
                      )
                    )
                    .flat()
                    .flat()
                )
                .flat()
            )
            .flat(),
        ].filter(Boolean)
      ),
    ];
    if (keys.length > 0) {
      const all = keys.reduce((all, cur) => ({ ...all, ...cur }), {});
      new Logger('All application environments').debug(
        JSON.stringify(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          Object.entries(all || {}).map(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ([key, value]: [string, any]) =>
              `${key}: ${Object.keys(value || {})
                .filter((key) => value[key] && key !== 'transform' && key !== 'hidden')
                .map((key) => `${capitalCase(key)}='${value ? value[key] : ''}'`)
                .join(', ')}`
          )
        )
      );
    }
  }

  private async updateEnvFile() {
    if (!this.dotEnvService) {
      this.logger.warn(`dotEnvService not set, updating not work`);
      return;
    }
    const existsEnvJson = this.dotEnvService.read() || {};
    if (this.projectUtilsConfiguration.updateEnvFile) {
      await this.dotEnvService.write(existsEnvJson);
    }
  }

  private updateGlobalConfigurationAndEnvironmentsOptions() {
    if (!this.projectUtilsConfiguration || !this.wrapApplicationOptionsService) {
      this.logger.warn(
        `projectUtilsConfiguration or applicationPackageJsonService or wrapApplicationOptionsService not set, updating not work`
      );
      return;
    }
    if (this.projectUtilsConfiguration.updateGlobalConfigAndEnvsOptions) {
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
      ...(this.wrapApplicationOptionsService.globalConfigurationOptions?.skipValidation === undefined
        ? {
            skipValidation: isInfrastructureMode(),
          }
        : {}),
    };
  }

  private getNewGlobalEnvironments() {
    return {
      ...(this.wrapApplicationOptionsService.globalEnvironmentsOptions?.skipValidation === undefined
        ? {
            skipValidation: isInfrastructureMode(),
          }
        : {}),
    };
  }

  private updateProject() {
    if (!this.projectUtilsConfiguration || !this.applicationPackageJsonService || !this.wrapApplicationOptionsService) {
      this.logger.warn(
        `projectUtilsConfiguration or applicationPackageJsonService or wrapApplicationOptionsService not set, updating not work`
      );
      return;
    }
    if (this.projectUtilsConfiguration.updateProjectOptions) {
      const packageJson = this.packageJsonService.read();
      const applicationPackageJson = this.applicationPackageJsonService.read();
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
      if (!this.wrapApplicationOptionsService.project.dockerDevScripts) {
        this.wrapApplicationOptionsService.project.dockerDevScripts =
          applicationPackageJson?.dockerDevScripts ?? packageJson?.dockerDevScripts;
      }
      if (!this.wrapApplicationOptionsService.project.dockerProdScripts) {
        this.wrapApplicationOptionsService.project.dockerProdScripts =
          applicationPackageJson?.dockerProdScripts ?? packageJson?.dockerProdScripts;
      }
      if (!this.wrapApplicationOptionsService.project.frontendDevScripts) {
        this.wrapApplicationOptionsService.project.frontendDevScripts =
          applicationPackageJson?.frontendDevScripts ?? packageJson?.frontendDevScripts;
      }
      if (!this.wrapApplicationOptionsService.project.frontendProdScripts) {
        this.wrapApplicationOptionsService.project.frontendProdScripts =
          applicationPackageJson?.frontendProdScripts ?? packageJson?.frontendProdScripts;
      }
      if (!this.wrapApplicationOptionsService.project.k8sDevScripts) {
        this.wrapApplicationOptionsService.project.k8sDevScripts =
          applicationPackageJson?.k8sDevScripts ?? packageJson?.k8sDevScripts;
      }
      if (!this.wrapApplicationOptionsService.project.k8sProdScripts) {
        this.wrapApplicationOptionsService.project.k8sProdScripts =
          applicationPackageJson?.k8sProdScripts ?? packageJson?.k8sProdScripts;
      }
    }
  }
}
