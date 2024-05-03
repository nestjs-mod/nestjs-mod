import { NestModuleCategory } from '../../../nest-module/types';
import { createNestModule } from '../../../nest-module/utils';
import { ProjectUtilsConfiguration } from './project-utils.configuration';
import { PROJECT_UTILS_MODULE_NAME } from './project-utils.constants';
import { ProjectUtilsEnvironments } from './project-utils.environments';
import { ApplicationPackageJsonService } from './services/application-package-json.service';
import { DotEnvService } from './services/dot-env.service';
import { GitignoreService } from './services/gitignore-file';
import { NxProjectJsonService } from './services/nx-project-json.service';
import { PackageJsonService } from './services/package-json.service';
import { ProjectUtilsPatcherService } from './services/project-utils-patcher.service';
import { WrapApplicationOptionsService } from './services/wrap-application-options.service';

const wrapApplicationOptionsService = new WrapApplicationOptionsService();
const packageJsonService = new PackageJsonService({});
const gitignoreService = new GitignoreService(packageJsonService);
const dotEnvService = new DotEnvService(wrapApplicationOptionsService, {}, {}, gitignoreService);
const applicationPackageJsonService = new ApplicationPackageJsonService({});
const nxProjectJsonService = new NxProjectJsonService(
  {},
  applicationPackageJsonService,
  packageJsonService,
  dotEnvService
);

let projectUtilsPatcherService: ProjectUtilsPatcherService | undefined = undefined;

export const { ProjectUtils } = createNestModule({
  moduleName: PROJECT_UTILS_MODULE_NAME,
  moduleDescription:
    'Utilities for setting global application parameters, such as project name, description, and settings validation parameters.',
  moduleCategory: NestModuleCategory.system,
  staticConfigurationModel: ProjectUtilsConfiguration,
  staticEnvironmentsModel: ProjectUtilsEnvironments,
  sharedProviders: [
    { provide: WrapApplicationOptionsService, useValue: wrapApplicationOptionsService },
    { provide: DotEnvService, useValue: dotEnvService },
    { provide: PackageJsonService, useValue: packageJsonService },
    { provide: ApplicationPackageJsonService, useValue: applicationPackageJsonService },
    { provide: GitignoreService, useValue: gitignoreService },
    { provide: NxProjectJsonService, useValue: nxProjectJsonService },
    ProjectUtilsPatcherService,
  ],
  // we use wrapApplication to modify some of the files after connecting all modules, since modules can add additional data that will be used when modifying files
  wrapApplication: async () => {
    if (projectUtilsPatcherService) {
      projectUtilsPatcherService.patchModules();
    }
  },
  // we use postWrapApplication to modify some of the files after connecting all modules, since modules can add additional data that will be used when modifying files
  postWrapApplication: async () => {
    if (projectUtilsPatcherService) {
      projectUtilsPatcherService.patchModules();
    }
  },
  // we use preWrapApplication because we need to get project data and install it globally - before running the application on NestJS
  preWrapApplication: async (options) => {
    Object.assign(wrapApplicationOptionsService, options);

    if (options.current.staticConfiguration) {
      // PackageJsonService
      const tempPackageJsonService = new PackageJsonService(
        wrapApplicationOptionsService.current.staticConfiguration as ProjectUtilsConfiguration
      );
      Object.setPrototypeOf(packageJsonService, tempPackageJsonService);
      Object.assign(packageJsonService, tempPackageJsonService);

      // ApplicationPackageJsonService
      const tempApplicationPackageJsonService = new ApplicationPackageJsonService(
        wrapApplicationOptionsService.current.staticConfiguration as ProjectUtilsConfiguration
      );
      Object.setPrototypeOf(applicationPackageJsonService, tempApplicationPackageJsonService);
      Object.assign(applicationPackageJsonService, tempApplicationPackageJsonService);

      // GitignoreService
      const tempGitignoreService = new GitignoreService(packageJsonService);
      Object.setPrototypeOf(gitignoreService, tempGitignoreService);
      Object.assign(gitignoreService, tempGitignoreService);

      // DotEnvService
      const tempDotEnvService = new DotEnvService(
        wrapApplicationOptionsService,
        wrapApplicationOptionsService.current.staticConfiguration as ProjectUtilsConfiguration,
        wrapApplicationOptionsService.current.staticEnvironments as ProjectUtilsEnvironments,
        tempGitignoreService
      );
      tempDotEnvService.read();

      Object.setPrototypeOf(dotEnvService, tempDotEnvService);
      Object.assign(dotEnvService, tempDotEnvService);

      // NxProjectJsonService
      const tempNxProjectJsonService = new NxProjectJsonService(
        wrapApplicationOptionsService.current.staticConfiguration as ProjectUtilsConfiguration,
        applicationPackageJsonService,
        packageJsonService,
        dotEnvService
      );
      Object.setPrototypeOf(nxProjectJsonService, tempNxProjectJsonService);
      Object.assign(nxProjectJsonService, tempNxProjectJsonService);

      // ProjectUtilsPatcherService
      projectUtilsPatcherService = new ProjectUtilsPatcherService(
        wrapApplicationOptionsService.current.staticConfiguration as ProjectUtilsConfiguration,
        wrapApplicationOptionsService.current.staticEnvironments as ProjectUtilsEnvironments,
        new ApplicationPackageJsonService(
          wrapApplicationOptionsService.current.staticConfiguration as ProjectUtilsConfiguration
        ),
        wrapApplicationOptionsService,
        dotEnvService,
        packageJsonService
      );
      projectUtilsPatcherService.patchModules();
    }
  },
});
