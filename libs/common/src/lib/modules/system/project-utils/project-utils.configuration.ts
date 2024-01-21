/* eslint-disable @typescript-eslint/no-explicit-any */
import { ConfigModel, ConfigModelProperty } from '../../../config-model/decorators';

@ConfigModel()
export class ProjectUtilsConfiguration {
  @ConfigModelProperty({
    description: 'Application package.json-file',
  })
  applicationPackageJsonFile?: string;

  @ConfigModelProperty({
    description: 'Root package.json-file',
  })
  packageJsonFile?: string;

  @ConfigModelProperty({
    description: 'Application project.json-file (nx)',
  })
  nxProjectJsonFile?: string;

  @ConfigModelProperty({
    description: 'Dot-env file with environment variables',
  })
  envFile?: string;

  @ConfigModelProperty({
    description: 'Update env-file',
    default: true,
  })
  updateEnvFile?: boolean;

  @ConfigModelProperty({
    description: 'Update project properties',
    default: true,
  })
  updateProjectOptions?: boolean;

  @ConfigModelProperty({
    description: 'Update configuration and environments options',
    default: true,
  })
  updateGlobalConfigurationAndEnvironmentsOptions?: boolean;
}
