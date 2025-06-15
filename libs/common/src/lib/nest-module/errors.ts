import { DynamicNestModuleMetadata } from './types';

export class NestModuleError extends Error {
  dynamicNestModuleMetadata?: DynamicNestModuleMetadata;

  constructor(message?: string, dynamicNestModuleMetadata?: DynamicNestModuleMetadata) {
    super(message);
    this.dynamicNestModuleMetadata = dynamicNestModuleMetadata;
  }
}
