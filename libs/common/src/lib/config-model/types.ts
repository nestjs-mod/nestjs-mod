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
};

export type ConfigModelRootOptions = Omit<ConfigModelOptions, 'originalName'>;

export type ConfigModelPropertyOptions = {
  description?: string;
  originalName: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  default?: any;
};

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
