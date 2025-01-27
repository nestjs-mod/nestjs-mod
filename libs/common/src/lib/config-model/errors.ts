import { ValidationError } from 'class-validator';
import { ConfigModelInfo } from './types';

export class ConfigModelValidationErrors extends Error {
  errors: ValidationError[];
  info: ConfigModelInfo;

  constructor(errors: ValidationError[], info: ConfigModelInfo, message?: string) {
    super(
      message ||
        Object.entries(info.validations)
          .map(([k, v]) => `${k}-${Object.keys(v.constraints).join(',')}`)
          .join('\n')
    );
    this.errors = errors;
    this.info = info;
  }
}
