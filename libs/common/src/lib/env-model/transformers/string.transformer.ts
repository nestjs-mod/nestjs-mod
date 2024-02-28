/* eslint-disable @typescript-eslint/no-explicit-any */
import { EnvModelOptions, EnvModelPropertyOptions, EnvModelPropertyValueTransformer } from '../types';

export class StringTransformer implements EnvModelPropertyValueTransformer {
  name = 'string';
  transform(params: {
    value: any;
    options: EnvModelPropertyOptions;
    modelRootOptions: EnvModelOptions;
    modelOptions: EnvModelOptions;
    obj: any;
  }) {
    return params.value === undefined || params.value === null ? params.value : String(params.value).trim();
  }
}
