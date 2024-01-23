import { Logger, LoggerService } from '@nestjs/common';
import { ConfigModelOptions } from '../config-model/types';
import { EnvModelOptions } from '../env-model/types';
import { DynamicNestModuleMetadata, NestModuleCategory, ProjectOptions } from '../nest-module/types';

export type BootstrapNestApplicationOptions = {
  project?: ProjectOptions;
  modules: Partial<Record<NestModuleCategory, DynamicNestModuleMetadata[]>>;
  logger?: Logger | LoggerService;
  globalEnvironmentsOptions?: Omit<EnvModelOptions, 'originalName'>;
  globalConfigurationOptions?: Omit<ConfigModelOptions, 'originalName'>;
};
