import { ValidationError } from 'class-validator';
import { ConfigModelInfo } from './types';

export class ConfigModelValidationErrors extends Error {
  errors: ValidationError[];
  info: ConfigModelInfo;

  constructor(
    errors: ValidationError[],
    info: ConfigModelInfo,
    message?: string
  ) {
    super(message);
    this.errors = errors;
    this.info = info;
  }
}
