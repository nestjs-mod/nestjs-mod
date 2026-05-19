import { ValidationError } from 'class-validator';
import { EnvModelInfo } from './types';

/**
 * Error thrown when environment model validation fails
 * Contains both the validation errors and metadata info for debugging
 */
export class EnvModelValidationErrors extends Error {
  errors: ValidationError[];
  info: EnvModelInfo;

  constructor(errors: ValidationError[], info: EnvModelInfo, message?: string) {
    const defaultMessage = Object.entries(info.validations)
      .filter(([key, _value]) => errors.some((err) => err.property === key))
      .map(([key, value]) => {
        const extractors = value.propertyValueExtractors.map((e) => e.example.example).join(',');
        const constraints = Object.keys(value.constraints || {}).join(',');
        return `${extractors}-${constraints}`;
      })
      .join(';');

    super(message || defaultMessage);

    this.name = 'EnvModelValidationErrors';
    this.errors = errors;
    this.info = info;
  }
}
