import {
  EnvModelOptions,
  EnvModelPropertyOptions,
  EnvModelRootOptions,
  PropertyValueExtractor,
} from '../types';

export class DefaultPropertyValueExtractor implements PropertyValueExtractor {
  name = 'default';
  example({
    obj,
    propertyOptions,
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
        obj: JSON.stringify(obj),
        'propertyOptions.name': propertyOptions.name,
        'propertyOptions.originalName': propertyOptions.originalName,
      },
      logic: `obj[propertyOptions.name ?? propertyOptions.originalName]`,
      example: `obj['${propertyOptions.name ?? propertyOptions.originalName}']`,
    };
  }
  extract({
    obj,
    propertyOptions,
  }: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    obj: any;
    formattedPropertyName: string;
    modelRootOptions?: EnvModelRootOptions;
    modelOptions: EnvModelOptions;
    propertyOptions: EnvModelPropertyOptions;
  }) {
    return obj[propertyOptions.name ?? propertyOptions.originalName];
  }
}
