import { NestModuleCategory } from './types';

export const NEST_MODULES_ENVIRONMENTS_DESCRIPTION =
  'Variables with primitive types used in the module, the values of which can be obtained from various sources, such as: process.env or consul key value.';

export const NEST_MODULES_CONFIGURATION_DESCRIPTION =
  'Variables of primitive and complex types that are used in the module; values for them must be passed when connecting the module to the application.';

export const NEST_MODULES_STATIC_ENVIRONMENTS_DESCRIPTION =
  'Static variables with primitive types used in the module and can be used at the time of generating module metadata (import, controllers), the values of which can be obtained from various sources, such as: process.env or consul key value.';

export const NEST_MODULES_STATIC_CONFIGURATION_DESCRIPTION =
  'Static variables of primitive and complex types that are used in the module and can be used at the time of generating module metadata (import, controllers); values for them must be passed when connecting the module to the application.';

export const NEST_MODULES_FEATURE_CONFIGURATION_DESCRIPTION =
  'Feature variables of primitive and complex types that can be added to the current module from other modules (example: a transport for sending a message can be defined as a generalized interface, but the implementation itself will be added from a module for working with a specific transport or from an integration module).';

export const NEST_MODULES_FEATURE_ENVIRONMENTS_DESCRIPTION =
  'Feature variables with primitive types used in the module, the values of which can be obtained from various sources, such as: process.env or consul key value.';

export const NEST_MODULE_CATEGORY_TITLE: Record<NestModuleCategory, string> = {
  [NestModuleCategory.core]: 'Core modules',
  [NestModuleCategory.feature]: 'Feature modules',
  [NestModuleCategory.integrations]: 'Integration modules',
  [NestModuleCategory.system]: 'System modules',
  [NestModuleCategory.infrastructure]: 'Infrastructure modules',
};

export const NEST_MODULE_CATEGORY_DESCRIPTION: Record<NestModuleCategory, string> = {
  [NestModuleCategory.core]:
    'Core modules necessary for the operation of feature and integration modules (examples: main module with connection to the database, main module for connecting to aws, etc.). NestJS and NestJS-mod compatible modules.',
  [NestModuleCategory.feature]: 'Feature modules with business logic of the application. NestJS and NestJS-mod compatible modules.',
  [NestModuleCategory.integrations]:
    'Integration modules are necessary to organize communication between feature or core modules (example: after creating a user in the UsersModule feature module, you need to send him a letter from the NotificationsModule core module). NestJS and NestJS-mod compatible modules.',
  [NestModuleCategory.system]:
    'System modules necessary for the operation of the entire application (examples: launching a NestJS application, launching microservices, etc.). Only NestJS-mod compatible modules.',
  [NestModuleCategory.infrastructure]:
    'Infrastructure modules are needed to create configurations that launch various external services (examples: docker-compose file for raising a database, gitlab configuration for deploying an application). Only NestJS-mod compatible modules.',
};
