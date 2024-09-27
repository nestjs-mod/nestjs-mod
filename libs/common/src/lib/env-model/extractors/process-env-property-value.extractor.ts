/* eslint-disable @typescript-eslint/no-explicit-any */
import { EnvModelOptions, EnvModelPropertyOptions, EnvModelRootOptions, PropertyValueExtractor } from '../types';

export class ProcessEnvPropertyValueExtractor implements PropertyValueExtractor {
  name = 'process.env';

  private processEnvStorage: any;

  setDemoMode(active: boolean) {
    if (active) {
      this.processEnvStorage = {};
    } else {
      this.processEnvStorage = null;
    }
  }

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
    if (this.processEnvStorage) {
      return {
        options: {
          'process.env': JSON.stringify({
            [formattedPropertyName]: this.processEnvStorage[formattedPropertyName],
          }),
          formattedPropertyName,
        },
        logic: `process.env[formattedPropertyName]`,
        example: `process.env['${formattedPropertyName}']`,
      };
    }
    return {
      options: {
        'process.env': JSON.stringify({
          [formattedPropertyName]: process.env[formattedPropertyName],
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
    if (this.processEnvStorage) {
      return this.processEnvStorage[formattedPropertyName];
    }
    const keys = Object.keys(process.env);

    let value = process.env[formattedPropertyName];
    if (value !== undefined) {
      for (const key of keys) {
        value = String(value).replace(new RegExp(`%${key}%`, 'ig'), process.env[key] || '');
      }
    }

    return value;
  }
}
