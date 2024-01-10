import { ValidatorOptions } from 'class-validator';

export const ENV_MODEL_METADATA = 'ENV_MODEL_METADATA';
export const ENV_MODEL_PROPERTIES_METADATA = 'ENV_MODEL_PROPERTIES_METADATA';

export const ENV_MODEL_CLASS_VALIDATOR_OPTIONS: ValidatorOptions = {
  validationError: {
    target: false,
    value: false,
  },
};