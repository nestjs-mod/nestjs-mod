import { ValidationError } from 'class-validator';
import { EnvModelInfo } from './types';

export class EnvModelValidationErrors extends Error {
  errors: ValidationError[];
  info: EnvModelInfo;

  constructor(errors: ValidationError[], info: EnvModelInfo, message?: string) {
    super(
      message ||
        Object.values(info.validations)
          .map(
            (v) => `${v.propertyValueExtractors.map((e) => e.example.example)}-${Object.keys(v.constraints).join(',')}`
          )
          .join('\n')
    );
    this.errors = errors;
    this.info = info;
  }
}
