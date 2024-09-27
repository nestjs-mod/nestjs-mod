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
  if (rootOptions === undefined) {
    rootOptions = {};
  }
  if (rootOptions.logger === undefined) {
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
      dataWithAllowedFields[propertyOptions.originalName] =
        data[propertyOptions.originalName] !== undefined
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
        data[propertyOptions.originalName] !== undefined ? data[propertyOptions.originalName] : propertyOptions.default;
    }

    info.validations[propertyOptions.originalName] = {
      constraints: {},
      value: data?.[propertyOptions.originalName],
    };
  }

  const classValidator = loadValidator(rootOptions?.validatorPackage || modelOptions?.validatorPackage);

  let emptyOptionsInstance: any;
  let optionsInstance: any;
  try {
    emptyOptionsInstance = new model();
    optionsInstance = Object.assign(new model(), dataWithAllowedFields);
  } catch (err) {
    emptyOptionsInstance = {};
    optionsInstance = {};
  }

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
      emptyOptionsInstance,
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
    if (logger?.error) {
      const validations = Object.fromEntries(
        Object.entries(info.validations).filter(([key, value]) => {
          return (
            Object.keys(value.constraints || {}).length &&
            !info.modelPropertyOptions.some((o) => o.hideValueFromOutputs && o.originalName === key)
          );
        })
      );
      logger.error({
        ...info,
        validations,
        modelPropertyOptions: info.modelPropertyOptions.filter(
          (o) => o.hideValueFromOutputs !== true && validations[o.originalName]
        ),
      });
    }
    throw new ConfigModelValidationErrors(validateErrors, info);
  }

  if (debug && logger?.debug) {
    logger.debug({
      ...info,
      validations: Object.fromEntries(
        Object.entries(info.validations).filter(([key]) => {
          return !info.modelPropertyOptions.some((o) => o.hideValueFromOutputs && o.originalName === key);
        })
      ),
      modelPropertyOptions: info.modelPropertyOptions.filter((o) => o.hideValueFromOutputs !== true),
    });
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
