import { Logger, Type } from '@nestjs/common';
import { ValidatorPackage } from '@nestjs/common/interfaces/external/validator-package.interface';
import { loadPackage } from '../utils/load-package';
import {
  CONFIG_MODEL_CLASS_VALIDATOR_OPTIONS,
  CONFIG_MODEL_METADATA,
  CONFIG_MODEL_PROPERTIES_METADATA,
} from './constants';
import { ConfigModelValidationErrors } from './errors';
import { ConfigModelInfo, ConfigModelOptions, ConfigModelPropertyOptions, ConfigModelRootOptions } from './types';

export async function configTransform<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TData extends Record<string, any> = Record<string, any>,
  TModel extends Type = Type
>({ model, data, rootOptions }: { model: TModel; data: Partial<TData>; rootOptions?: ConfigModelRootOptions }) {
  const loadValidator = (validatorPackage?: ValidatorPackage): ValidatorPackage => {
    return validatorPackage ?? loadPackage('class-validator', () => require('class-validator'));
  };

  const { modelPropertyOptions, modelOptions } = getConfigModelMetadata(model);

  const info: ConfigModelInfo = {
    modelPropertyOptions,
    modelOptions: modelOptions ?? {},
    validations: {},
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const dataWithAllowedFields: any = {};
  for (const propertyOptions of modelPropertyOptions) {
    dataWithAllowedFields[propertyOptions.originalName] = data?.[propertyOptions.originalName] ?? propertyOptions.default;
    info.validations[propertyOptions.originalName] = {
      constraints: {},
      value: data?.[propertyOptions.originalName],
    };
  }

  const classValidator = loadValidator(modelOptions?.validatorPackage ?? rootOptions?.validatorPackage);

  const optionsInstance = Object.assign(new model(), dataWithAllowedFields);

  const validateErrors =
    modelOptions?.skipValidation ?? rootOptions?.skipValidation
      ? []
      : (
          await classValidator.validate(
            optionsInstance,
            modelOptions?.validatorOptions ?? rootOptions?.validatorOptions ?? CONFIG_MODEL_CLASS_VALIDATOR_OPTIONS
          )
        ).filter((validateError) => validateError.property);

  // collect constraints
  const validateErrorsForInfo = (
    await classValidator.validate(
      new model(),
      modelOptions?.validatorOptions ?? rootOptions?.validatorOptions ?? CONFIG_MODEL_CLASS_VALIDATOR_OPTIONS
    )
  ).filter((validateError) => validateError.property);

  for (const validateError of validateErrorsForInfo) {
    if (info.validations[validateError.property]) {
      info.validations[validateError.property].constraints = validateError?.constraints ?? {};
    }
  }

  if (validateErrors.length > 0) {
    const debug = modelOptions?.debug ?? rootOptions?.debug;
    if (debug) {
      Logger.debug(info);
    }
    throw new ConfigModelValidationErrors(validateErrors, info);
  }

  for (const configPropertyMetadata of modelPropertyOptions) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (data as any)[configPropertyMetadata.originalName] = optionsInstance[configPropertyMetadata.originalName];
  }
  return { data, info };
}

export function getConfigModelMetadata<TModel extends Type = Type>(model: TModel) {
  const modelPropertyOptions: ConfigModelPropertyOptions[] =
    Reflect.getMetadata(CONFIG_MODEL_PROPERTIES_METADATA, model) || [];
  const modelOptions: ConfigModelOptions | undefined = Reflect.getMetadata(CONFIG_MODEL_METADATA, model);
  return { modelPropertyOptions, modelOptions };
}
