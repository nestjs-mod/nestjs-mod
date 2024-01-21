import { ProjectOptions } from '../../../nest-module/types';

export type PackageJsonType = Partial<ProjectOptions> & {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  scripts?: Record<string, Record<string, string>>;
};

export interface JSONSchemaForNxProjects {
  /**
   * Configures all the targets which define what tasks you can run against the project
   */
  targets?: {
    [k: string]: {
      /**
       * The function that Nx will invoke when you run this target
       */
      executor?: string;
      options?: {
        [k: string]: unknown;
      };
      outputs?: string[];
      /**
       * The name of a configuration to use as the default if a configuration is not provided
       */
      defaultConfiguration?: string;
      /**
       * provides extra sets of values that will be merged into the options map
       */
      configurations?: {
        [k: string]: {
          [k: string]: unknown;
        };
      };
      /**
       * A shorthand for using the nx:run-commands executor
       */
      command?: string;
      /**
       * Specifies if the given target should be cacheable
       */
      cache?: boolean;
      [k: string]: unknown;
    };
  };
  tags?: string[];
  implicitDependencies?: string[];
  [k: string]: unknown;
}
