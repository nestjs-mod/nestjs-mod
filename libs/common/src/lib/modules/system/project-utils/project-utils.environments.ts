/* eslint-disable @typescript-eslint/no-explicit-any */
import { EnvModel, EnvModelProperty } from '../../../env-model/decorators';
import { BooleanTransformer } from '../../../env-model/transformers/boolean.transformer';

@EnvModel()
export class ProjectUtilsEnvironments {
  @EnvModelProperty({
    description: 'Update env-file',
    default: true,
    transform: new BooleanTransformer(),
    hidden: true,
  })
  updateEnvFile?: boolean;

  @EnvModelProperty({
    description: 'Update project properties',
    default: true,
    transform: new BooleanTransformer(),
    hidden: true,
  })
  updateProjectOptions?: boolean;

  @EnvModelProperty({
    description: 'Update configuration and environments options',
    default: true,
    transform: new BooleanTransformer(),
    hidden: true,
  })
  updateGlobalConfigAndEnvsOptions?: boolean;

  @EnvModelProperty({
    description: 'Print all application environments',
    default: true,
    transform: new BooleanTransformer(),
    hidden: true,
  })
  printAllApplicationEnvs?: boolean;

  @EnvModelProperty({
    description: 'Create json file with options and files used for create environments key with checksum',
    default: true,
    transform: new BooleanTransformer(),
    hidden: true,
  })
  saveFilesWithCheckSum?: boolean;
}
