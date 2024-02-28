/* eslint-disable @typescript-eslint/no-explicit-any */
import { EnvModelOptions, EnvModelPropertyOptions, EnvModelPropertyValueTransformer } from '../types';

export class BooleanTransformer implements EnvModelPropertyValueTransformer {
  name = 'boolean';
  transform(params: {
    value: any;
    options: EnvModelPropertyOptions;
    modelRootOptions: EnvModelOptions;
    modelOptions: EnvModelOptions;
    obj: any;
  }) {
    return params.value === undefined || params.value === null
      ? params.value
      : params.value === true || String(params.value).toLowerCase() === 'true';
  }
}
