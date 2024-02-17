import { ConsoleLogger, Type } from '@nestjs/common';
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
  if (!rootOptions) {
    rootOptions = {};
  }
  if (!rootOptions.logger) {
    rootOptions.logger = new ConsoleLogger('configTransform');
  }
  const loadValidator = (validatorPackage?: ValidatorPackage): ValidatorPackage => {
    return validatorPackage || loadPackage('class-validator', () => require('class-validator'));
  };

  const { modelPropertyOptions, modelOptions } = getConfigModelMetadata(model);

  const info: ConfigModelInfo = {
    modelPropertyOptions,
    modelOptions: modelOptions || {},
    validations: {},
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const dataWithAllowedFields: any = {};
  for (const propertyOptions of modelPropertyOptions) {
    if (propertyOptions.transform?.transform) {
      dataWithAllowedFields[propertyOptions.originalName] = data[propertyOptions.originalName]
        ? propertyOptions.transform.transform({
            modelRootOptions: rootOptions || {},
            modelOptions: modelOptions || {},
            obj: data,
            options: propertyOptions,
            value: data[propertyOptions.originalName],
          })
        : propertyOptions.default;
    } else {
      dataWithAllowedFields[propertyOptions.originalName] =
        data[propertyOptions.originalName] ?? propertyOptions.default;
    }

    info.validations[propertyOptions.originalName] = {
      constraints: {},
      value: data?.[propertyOptions.originalName],
    };
  }

  const classValidator = loadValidator(rootOptions?.validatorPackage || modelOptions?.validatorPackage);

  const optionsInstance = Object.assign(new model(), dataWithAllowedFields);

  const validateErrors =
    rootOptions?.skipValidation || modelOptions?.skipValidation
      ? []
      : (
          await classValidator.validate(
            optionsInstance,
            rootOptions?.validatorOptions || modelOptions?.validatorOptions || CONFIG_MODEL_CLASS_VALIDATOR_OPTIONS
          )
        ).filter((validateError) => validateError.property);

  // collect constraints
  const validateErrorsForInfo = (
    await classValidator.validate(
      new model(),
      rootOptions?.validatorOptions || modelOptions?.validatorOptions || CONFIG_MODEL_CLASS_VALIDATOR_OPTIONS
    )
  ).filter((validateError) => validateError.property);

  for (const validateError of validateErrorsForInfo) {
    if (info.validations[validateError.property]) {
      info.validations[validateError.property].constraints = validateError?.constraints || {};
    }
  }
  const debug = rootOptions?.debug || modelOptions?.debug || process.env['DEBUG'];
  const logger = rootOptions?.logger || modelOptions?.logger;

  if (validateErrors.length > 0) {
    if (debug && logger?.debug) {
      logger.debug(info);
    }
    throw new ConfigModelValidationErrors(validateErrors, info);
  }

  if (process.env['DEBUG'] && logger?.debug) {
    logger.debug(info);
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
