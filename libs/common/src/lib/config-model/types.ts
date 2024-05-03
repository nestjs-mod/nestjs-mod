/* eslint-disable @typescript-eslint/no-explicit-any */
import { Logger, LoggerService } from '@nestjs/common';
import { ValidatorPackage } from '@nestjs/common/interfaces/external/validator-package.interface';
import { ValidatorOptions } from 'class-validator';

export type ConfigModelOptions = {
  name?: string;
  description?: string;
  originalName?: string;
  validatorPackage?: ValidatorPackage;
  validatorOptions?: ValidatorOptions;
  skipValidation?: boolean;
  debug?: boolean;
  logger?: Logger | LoggerService;
};

export type ConfigModelRootOptions = Omit<ConfigModelOptions, 'originalName'>;

export type ConfigModelPropertyOptions = {
  description?: string;
  originalName: string;
  default?: any;
  transform?: ConfigModelPropertyValueTransformer;
  /**
   * When we pass a large object in an option, during debugging it clogs the output; to prevent this from happening, you can exclude this object from the output
   */
  hideValueFromOutputs?: boolean;
};

export interface ConfigModelPropertyValueTransformer {
  name?: string;
  transform(params: {
    value: any;
    options: ConfigModelPropertyOptions;
    modelRootOptions: ConfigModelOptions;
    modelOptions: ConfigModelOptions;
    obj: any;
  }): any;
}

export type ConfigModelInfo = {
  modelOptions: ConfigModelRootOptions;
  modelPropertyOptions: ConfigModelPropertyOptions[];
  validations: Record<
    string | symbol,
    {
      value: string | undefined;
      constraints: Record<string, string>;
    }
  >;
};
