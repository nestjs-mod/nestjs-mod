import { constantCase } from 'case-anything';
import {
  EnvModelOptions,
  EnvModelPropertyOptions,
  EnvModelRootOptions,
  PropertyNameFormatter,
} from '../types';


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
      logic: `[
      modelRootOptions?.name ?? null,
      modelOptions?.name
        ? constantCase(
          \`\${modelOptions?.name}_\${String(
            propertyOptions.name ?? propertyOptions.originalName
          )}\`
        )
        : constantCase(
          String(propertyOptions.name ?? propertyOptions.originalName)
        ),
    ]
      .filter(Boolean)
      .map((v: string | null) => {
        v = constantCase(v!)
        for (const word of ['NESTJS', 'NEST', 'ENVIRONMENTS', 'ENVIRONMENT']) {
          v = v.replace(new RegExp(word, 'g'), '')
        }
        return v
      })
      .join('_')`,
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
    return [
      modelRootOptions?.name ?? null,
      modelOptions?.name
        ? constantCase(
          `${modelOptions?.name}_${String(
            propertyOptions.name ?? propertyOptions.originalName
          )}`
        )
        : constantCase(
          String(propertyOptions.name ?? propertyOptions.originalName)
        ),
    ]
      .filter(Boolean)
      .map((v: string | null) => {
        v = constantCase(v!)
        for (const word of CLEAR_WORDS) {
          v = v.replace(word, '')
        }
        return v
      })
      .join('_');
  }
}
