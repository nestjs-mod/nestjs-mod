import { ProjectOptions } from '../../../nest-module/types';

export type PackageJsonType = Partial<ProjectOptions> & {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  scripts?: Record<string, Record<string, string>>;
};
