import {
  DynamicNestModuleMetadata,
  NestModuleCategory,
  ProjectOptions,
} from '../nest-module/types';

export type BootstrapNestApplicationOptions = {
  project: ProjectOptions;
  modules: Partial<Record<NestModuleCategory, DynamicNestModuleMetadata[]>>;
};
