/* eslint-disable @typescript-eslint/no-explicit-any */
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
  demoMode?: boolean;
  debug?: boolean;
  logger?: Logger | LoggerService;
};

export type EnvModelRootOptions = Omit<EnvModelOptions, 'originalName'>;

export type EnvModelPropertyOptions = {
  name?: string;
  description?: string;
  originalName: string;
  default?: any;
  transform?: EnvModelPropertyValueTransformer;
  /**
   * Not use in this module, but use when we generate env files
   */
  hidden?: boolean;
  /**
   * When we pass a large object in an option, during debugging it clogs the output; to prevent this from happening, you can exclude this object from the output
   */
  hideValueFromOutputs?: boolean;
};

export interface EnvModelPropertyValueTransformer {
  name?: string;
  transform(params: {
    value: any;
    options: EnvModelPropertyOptions;
    modelRootOptions: EnvModelOptions;
    modelOptions: EnvModelOptions;
    obj: any;
  }): any;
}

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
  setDemoMode?: (active: boolean) => void;
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
  demoMode?: boolean;
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
