import {
  EnvModelOptions,
  EnvModelPropertyOptions,
  EnvModelRootOptions,
  PropertyValueExtractor,
} from '../types';

export class ProcessEnvPropertyValueExtractor
  implements PropertyValueExtractor {
  name = 'process.env';
  example({
    formattedPropertyName,
  }: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    obj: any;
    formattedPropertyName: string;
    modelRootOptions?: EnvModelRootOptions;
    modelOptions: EnvModelOptions;
    propertyOptions: EnvModelPropertyOptions;
  }) {
    return {
      options: {
        'process.env': JSON.stringify({
          formattedPropertyName: process.env[formattedPropertyName],
        }),
        formattedPropertyName,
      },
      logic: `process.env[formattedPropertyName]`,
      example: `process.env['${formattedPropertyName}']`,
    };
  }
  extract({
    formattedPropertyName,
  }: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    obj: any;
    formattedPropertyName: string;
    modelRootOptions?: EnvModelRootOptions;
    modelOptions: EnvModelOptions;
    propertyOptions: EnvModelPropertyOptions;
  }) {
    return process.env[formattedPropertyName];
  }
}
