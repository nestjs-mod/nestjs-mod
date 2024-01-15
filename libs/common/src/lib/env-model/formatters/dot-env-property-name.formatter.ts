import { constantCase } from 'case-anything';
import { EnvModelOptions, EnvModelPropertyOptions, EnvModelRootOptions, PropertyNameFormatter } from '../types';

export const CLEAR_WORDS = ['NESTJS', 'NEST', 'ENVIRONMENTS', 'ENVIRONMENT'];

export class DotEnvPropertyNameFormatter implements PropertyNameFormatter {
  name = 'dotenv';
  example({
    modelOptions,
    propertyOptions,
    modelRootOptions,
  }: {
    modelRootOptions?: EnvModelRootOptions;
    modelOptions: EnvModelOptions;
    propertyOptions: EnvModelPropertyOptions;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  }) {
    return {
      options: {
        'modelRootOptions?.name': modelRootOptions?.name,
        'modelOptions?.name': modelOptions?.name,
        'propertyOptions.name': propertyOptions.name,
        'propertyOptions.originalName': propertyOptions.originalName,
      },
      logic: `concat all names and convert this to CONSTANT_CASE`,
    };
  }
  format({
    modelOptions,
    propertyOptions,
    modelRootOptions,
  }: {
    modelRootOptions?: EnvModelRootOptions;
    modelOptions: EnvModelOptions;
    propertyOptions: EnvModelPropertyOptions;
  }) {
    const prepareFullname = [
      modelRootOptions?.name ?? null,
      modelOptions?.name
        ? `${modelOptions?.name}_${String(propertyOptions.name ?? propertyOptions.originalName)}`
        : String(propertyOptions.name ?? propertyOptions.originalName),
    ]
      .filter(Boolean)
      .map((v: string | null) => {
        v = constantCase(v!);
        for (const word of CLEAR_WORDS) {
          v = v.replace(word, '');
        }
        return v;
      })
      .join('_');

    return prepareFullname.split('_').filter(Boolean).join('_');
  }
}