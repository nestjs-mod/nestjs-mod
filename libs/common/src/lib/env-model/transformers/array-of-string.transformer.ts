/* eslint-disable @typescript-eslint/no-explicit-any */
import { EnvModelOptions, EnvModelPropertyOptions, EnvModelPropertyValueTransformer } from '../types';

export class ArrayOfStringTransformer implements EnvModelPropertyValueTransformer {
  name = 'array-of-string';
  transform(params: {
    value: any;
    options: EnvModelPropertyOptions;
    modelRootOptions: EnvModelOptions;
    modelOptions: EnvModelOptions;
    obj: any;
  }) {
    if (Array.isArray(params.value)) {
      return params.value;
    }
    return (
      (params.value?.split &&
        params.value
          .split(',')
          .map((s: string) => s.trim())
          .filter(Boolean)) ||
      []
    );
  }
}
