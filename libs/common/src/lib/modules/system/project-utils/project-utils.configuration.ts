/* eslint-disable @typescript-eslint/no-explicit-any */
import { ConfigModel, ConfigModelProperty } from '../../../config-model/decorators';
import { IsNotEmpty } from 'class-validator';

@ConfigModel()
export class ProjectUtilsConfiguration {
  @ConfigModelProperty({
    description: 'Application package.json-file',
  })
  @IsNotEmpty()
  applicationPackageJsonFile!: string;

  @ConfigModelProperty({
    description: 'Root package.json-file.',
  })
  packageJsonFile?: string;

  @ConfigModelProperty({
    description: 'Dot-env file with environment variables.',
  })
  envFile?: string;

  @ConfigModelProperty({
    description: 'Patch project properties',
    default: true,
  })
  patchProject?: boolean;

  @ConfigModelProperty({
    description: 'Patch configuration and environments options',
    default: true,
  })
  patchGlobalConfigurationAndEnvironmentsOptions?: boolean;
}
