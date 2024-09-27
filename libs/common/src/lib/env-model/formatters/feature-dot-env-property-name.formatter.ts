import { constantCase, upperCamelCase } from 'case-anything';
import { defaultContextName } from '../../utils/default-context-name';
import { nameItClass } from '../../utils/name-it-class';
import { EnvModelOptions, EnvModelPropertyOptions, EnvModelRootOptions } from '../types';
import { CLEAR_WORDS, DotEnvPropertyNameFormatter } from './dot-env-property-name.formatter';

export function getFeatureDotEnvPropertyNameFormatter(
  featureName: string,
  rootOptions?: EnvModelRootOptions,
  options?: EnvModelOptions
) {
  class FeatureDotEnvPropertyNameFormatter extends DotEnvPropertyNameFormatter {
    override format({
      modelOptions,
      propertyOptions,
      modelRootOptions,
    }: {
      modelRootOptions?: EnvModelRootOptions;
      modelOptions: EnvModelOptions;
      propertyOptions: EnvModelPropertyOptions;
    }) {
      const modelRootOptionsName = (rootOptions !== undefined ? rootOptions : modelRootOptions)?.name
        ?.trim()
        .split(' ')
        .join('_');
      const modelOptionsName = (options !== undefined ? options : modelOptions)?.name?.trim().split(' ').join('_');
      const modelFeatureName = featureName?.trim().split(' ').join('_');

      const prepareFullname = [
        defaultContextName() !== modelRootOptionsName && modelRootOptionsName ? modelRootOptionsName : null,
        !modelRootOptionsName?.endsWith(modelFeatureName) ? modelFeatureName : '',
        defaultContextName() !== modelOptionsName && modelOptionsName ? modelOptionsName : null,
        String(propertyOptions.name !== undefined ? propertyOptions.name : propertyOptions.originalName),
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
  return nameItClass(`${upperCamelCase(featureName)}DotEnvPropertyNameFormatter`, FeatureDotEnvPropertyNameFormatter);
}
