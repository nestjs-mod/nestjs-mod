/* eslint-disable @typescript-eslint/no-explicit-any */
import { EnvModelOptions, EnvModelPropertyOptions, EnvModelPropertyValueTransformer } from '../types';

export class NumberTransformer implements EnvModelPropertyValueTransformer {
  name = 'number';
  transform(params: {
    value: any;
    options: EnvModelPropertyOptions;
    modelRootOptions: EnvModelOptions;
    modelOptions: EnvModelOptions;
    obj: any;
  }) {
    return isNaN(+params.value) ? params.value : +params.value;
  }
}
