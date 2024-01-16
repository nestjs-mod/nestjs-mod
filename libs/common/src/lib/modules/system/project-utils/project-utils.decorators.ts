import { getNestModuleDecorators } from '../../../nest-module/utils';
import { PROJECT_UTILS_MODULE_NAME } from './project-utils.constants';

export const { InjectService: InjectProjectUtilsService, InjectFeatures: InjectProjectUtilsFeatures } =
  getNestModuleDecorators({
    moduleName: PROJECT_UTILS_MODULE_NAME,
  });
