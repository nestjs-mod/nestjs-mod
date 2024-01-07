import { ValidationError } from 'class-validator';
import { EnvModelInfo } from './types';

export class EnvModelValidationErrors extends Error {
  errors: ValidationError[];
  info: EnvModelInfo;

  constructor(errors: ValidationError[], info: EnvModelInfo, message?: string) {
    super(message);
    this.errors = errors;
    this.info = info;
  }
}
