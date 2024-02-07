import { constantCase } from 'case-anything';
import { defaultContextName } from '../../utils/default-context-name';
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
    const modelRootOptionsName = modelRootOptions?.name?.trim().split(' ').join('_');
    const modelOptionsName = modelOptions?.name?.trim().split(' ').join('_');

    const prepareFullname = [
      defaultContextName() !== modelRootOptionsName && modelRootOptionsName ? modelRootOptionsName : null,
      defaultContextName() !== modelOptionsName && modelOptionsName ? modelOptionsName : null,
      String(propertyOptions.name || propertyOptions.originalName),
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
