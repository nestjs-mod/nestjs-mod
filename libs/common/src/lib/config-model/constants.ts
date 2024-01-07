import { ValidatorOptions } from 'class-validator';

export const CONFIG_MODEL_METADATA = 'CONFIG_MODEL_METADATA';
export const CONFIG_MODEL_PROPERTIES_METADATA =
  'CONFIG_MODEL_PROPERTIES_METADATA';

export const CONFIG_MODEL_CLASS_VALIDATOR_OPTIONS: ValidatorOptions = {
  validationError: {
    target: false,
    value: false,
  },
};
