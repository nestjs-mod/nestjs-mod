import { Logger, LoggerService } from '@nestjs/common';
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
  skipValidation?: boolean;
  debug?: boolean;
  logger?: Logger | LoggerService;
};

export type EnvModelRootOptions = Omit<EnvModelOptions, 'originalName'>;

export type EnvModelPropertyOptions = {
  name?: string;
  description?: string;
  originalName: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  default?: any;
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

export type EnvModelInfoValidationsPropertyNameFormatters = {
  name: string;
  value: string;
  example: {
    options: Record<string, string>;
    logic: string;
  };
};

export type EnvModelInfoValidationsPropertyValueExtractors = {
  name: string;
  example: {
    options: Record<string, string>;
    logic: string;
    example: string;
  };
  value: string | undefined;
};

export type EnvModelInfo = {
  modelOptions: EnvModelRootOptions;
  modelPropertyOptions: EnvModelPropertyOptions[];
  validations: Record<
    string | symbol,
    {
      propertyNameFormatters: EnvModelInfoValidationsPropertyNameFormatters[];
      propertyValueExtractors: EnvModelInfoValidationsPropertyValueExtractors[];
      value: string | undefined;
      constraints: Record<string, string>;
    }
  >;
};
