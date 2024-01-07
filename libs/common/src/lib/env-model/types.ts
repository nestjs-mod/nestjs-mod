import { ValidatorPackage } from '@nestjs/common/interfaces/external/validator-package.interface';
import { ValidatorOptions } from 'class-validator';

export type EnvModelOptions = {
  name?: string;
  description?: string;
  originalName?: string;
  propertyValueExtractors?: PropertyValueExtractor[];
  propertyNameFormatters?: PropertyNameFormatter[];
  validatorPackage?: ValidatorPackage;
  validatorOptions?: ValidatorOptions;
};

export type EnvModelRootOptions = Omit<EnvModelOptions, 'originalName'>;

export type EnvModelPropertyOptions = {
  name?: string;
  description?: string;
  originalName: string;
};

export interface PropertyNameFormatter {
  name: string;
  example(options: {
    modelRootOptions?: EnvModelRootOptions;
    modelOptions: EnvModelOptions;
    propertyOptions: EnvModelPropertyOptions;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  }): { options: any; logic: string };
  format(options: {
    modelRootOptions?: EnvModelRootOptions;
    modelOptions: EnvModelOptions;
    propertyOptions: EnvModelPropertyOptions;
  }): string;
}

export interface PropertyValueExtractor {
  name: string;
  example(options: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    obj: any;
    formattedPropertyName: string;
    modelRootOptions?: EnvModelRootOptions;
    modelOptions: EnvModelOptions;
    propertyOptions: EnvModelPropertyOptions;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  }): { options: any; logic: string; example: string };
  extract(options: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    obj: any;
    formattedPropertyName: string;
    modelRootOptions?: EnvModelRootOptions;
    modelOptions: EnvModelOptions;
    propertyOptions: EnvModelPropertyOptions;
  }): string | undefined;
}

export type EnvModelInfo = {
  modelOptions: EnvModelRootOptions;
  modelPropertyOptions: EnvModelPropertyOptions[];
  validations: Record<
    string | symbol,
    {
      propertyNameFormatters: {
        name: string;
        value: string;
        example: {
          options: Record<string, string>;
          logic: string;
        };
      }[];
      propertyValueExtractors: {
        name: string;
        example: {
          options: Record<string, string>;
          logic: string;
          example: string;
        };
        value: string | undefined;
      }[];
      value: string | undefined;
      constraints: Record<string, string>;
    }
  >;
};
