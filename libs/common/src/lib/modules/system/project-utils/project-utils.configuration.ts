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

  @ConfigModelProperty({
    description: 'All application environments',
    default: true,
  })
  allApplicationEnvironments?: boolean;

  @ConfigModelProperty({
    description: 'Create environments key with checksum in value of some files',
  })
  filesCheckSumToEnvironments?: Record<
    string,
    {
      /**
       * Folders for search files
       */
      folders: string[];
      /**
       * Glob patterns for search files
       */
      glob: string | string[];
      /**
       * Prepare files before calculate checksum of file
       */
      prepare?: (content: string) => string;
    }
  >;

  @ConfigModelProperty({
    description: 'Some logic for prepare processed files checksums',
  })
  prepareProcessedFilesCheckSumToEnvironments?: (
    processed: Record<string, { fileList: string[]; sha256: string }>
  ) => Record<string, { fileList: string[]; sha256: string }>;

  @ConfigModelProperty({
    description: 'Create json file with options and files used for create environments key with checksum',
    default: true,
  })
  debugFilesCheckSumToEnvironments?: boolean;
}
