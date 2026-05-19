import { ValidationError } from 'class-validator';
import { ConfigModelInfo } from './types';

/**
 * Error thrown when configuration model validation fails
 * Contains both the validation errors and metadata info for debugging
 */
export class ConfigModelValidationErrors extends Error {
  errors: ValidationError[];
  info: ConfigModelInfo;

  constructor(errors: ValidationError[], info: ConfigModelInfo, message?: string) {
    const defaultMessage = Object.entries(info.validations)
      .filter(([key, _value]) => errors.some((err) => err.property === key))
      .map(([key, value]) => `${key}-${Object.keys(value.constraints || {}).join(',')}`)
      .join(';');

    super(message || defaultMessage);

    this.name = 'ConfigModelValidationErrors';
    this.errors = errors;
    this.info = info;
  }
}
