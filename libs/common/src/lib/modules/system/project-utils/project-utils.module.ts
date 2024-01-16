import { NestModuleCategory } from '../../../nest-module/types';
import { createNestModule } from '../../../nest-module/utils';
import { ProjectUtilsConfiguration } from './project-utils.configuration';
import { PROJECT_UTILS_MODULE_NAME } from './project-utils.constants';
import { ApplicationPackageJsonService } from './services/application-package-json.service';
import { DotEnvService } from './services/dot-env.service';
import { PackageJsonService } from './services/package-json.service';
import { ProjectUtilsPatcherService } from './services/project-utils-patcher.service';
import { WrapApplicationOptionsService } from './services/wrap-application-options.service';

const wrapApplicationOptionsService = new WrapApplicationOptionsService();
const dotEnvService = new DotEnvService(wrapApplicationOptionsService, {} as ProjectUtilsConfiguration);
const packageJsonService = new PackageJsonService({} as ProjectUtilsConfiguration);
const applicationPackageJsonService = new ApplicationPackageJsonService({} as ProjectUtilsConfiguration);

export const { ProjectUtils } = createNestModule({
  moduleName: PROJECT_UTILS_MODULE_NAME,
  moduleDescription:
    'Utilities for setting global application parameters, such as project name, description, and settings validation parameters.',
  moduleCategory: NestModuleCategory.system,
  staticConfigurationModel: ProjectUtilsConfiguration,
  sharedProviders: [
    { provide: WrapApplicationOptionsService, useValue: wrapApplicationOptionsService },
    { provide: DotEnvService, useValue: dotEnvService },
    { provide: PackageJsonService, useValue: packageJsonService },
    { provide: ApplicationPackageJsonService, useValue: applicationPackageJsonService },
  ],
  preWrapApplication: async (options) => {
    Object.assign(wrapApplicationOptionsService, options);

    if (options.current.staticConfiguration) {
      // DotEnvService
      const tempDotEnvService = new DotEnvService(
        wrapApplicationOptionsService,
        options.current.staticConfiguration as ProjectUtilsConfiguration
      );
      await tempDotEnvService.read();
      Object.assign(dotEnvService, tempDotEnvService);

      // PackageJsonService
      const tempPackageJsonService = new PackageJsonService(
        options.current.staticConfiguration as ProjectUtilsConfiguration
      );
      Object.assign(packageJsonService, tempPackageJsonService);

      // ApplicationPackageJsonService
      const tempApplicationPackageJsonService = new ApplicationPackageJsonService(
        options.current.staticConfiguration as ProjectUtilsConfiguration
      );
      Object.assign(applicationPackageJsonService, tempApplicationPackageJsonService);

      // ProjectUtilsPatcherService
      const projectUtilsPatcherService = new ProjectUtilsPatcherService(
        options.current.staticConfiguration as ProjectUtilsConfiguration,
        new ApplicationPackageJsonService(options.current.staticConfiguration as ProjectUtilsConfiguration),
        wrapApplicationOptionsService
      );
      await projectUtilsPatcherService.patch();
    }
  },
});
