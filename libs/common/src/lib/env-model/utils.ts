import { ConsoleLogger, Type } from '@nestjs/common';
import { ValidatorPackage } from '@nestjs/common/interfaces/external/validator-package.interface';
import { loadPackage } from '../utils/load-package';
import { ENV_MODEL_CLASS_VALIDATOR_OPTIONS, ENV_MODEL_METADATA, ENV_MODEL_PROPERTIES_METADATA } from './constants';
import { EnvModelValidationErrors } from './errors';
import { EnvModelInfo, EnvModelOptions, EnvModelPropertyOptions, EnvModelRootOptions } from './types';

export async function envTransform<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TData extends Record<string, any>,
  TModel extends Type = Type
>({ model, data, rootOptions }: { model: TModel; data: Partial<TData>; rootOptions?: EnvModelRootOptions }) {
  if (rootOptions === undefined) {
    rootOptions = {};
  }
  if (rootOptions.logger === undefined) {
    rootOptions.logger = new ConsoleLogger('envTransform');
  }
  const loadValidator = (validatorPackage?: ValidatorPackage): ValidatorPackage => {
    return validatorPackage || loadPackage('class-validator', () => require('class-validator'));
  };

  const { modelPropertyOptions, modelOptions } = getEnvModelMetadata(model);
  const info: EnvModelInfo = {
    modelPropertyOptions,
    modelOptions: modelOptions || {},
    validations: {},
  };

  const propertyNameFormatters = rootOptions?.propertyNameFormatters || modelOptions?.propertyNameFormatters || [];

  for (const propertyOptions of modelPropertyOptions) {
    for (const propertyNameFormatter of propertyNameFormatters) {
      const formattedPropertyExample = propertyNameFormatter.example({
        modelRootOptions: rootOptions,
        modelOptions: modelOptions || {},
        propertyOptions,
      });
      const formattedPropertyName = propertyNameFormatter.format({
        modelRootOptions: rootOptions,
        modelOptions: modelOptions || {},
        propertyOptions,
      });

      const demoMode = rootOptions?.demoMode || modelOptions?.demoMode || false;

      const propertyValueExtractors = (
        rootOptions?.propertyValueExtractors ??
        modelOptions?.propertyValueExtractors ??
        []
      ).map((extractor) => {
        if (extractor.setDemoMode) {
          extractor.setDemoMode(demoMode);
        }
        const result = {
          name: extractor.name,
          example: extractor.example({
            obj: data,
            modelRootOptions: rootOptions,
            modelOptions: modelOptions || {},
            propertyOptions,
            formattedPropertyName,
          }),
          demoMode,
          value: extractor.extract({
            obj: data,
            modelRootOptions: rootOptions,
            modelOptions: modelOptions || {},
            propertyOptions,
            formattedPropertyName,
          }),
        };
        if (extractor.setDemoMode) {
          extractor.setDemoMode(false);
        }
        return result;
      });

      if (info.validations[propertyOptions.originalName] === undefined) {
        info.validations[propertyOptions.originalName] = {
          constraints: {},
          value: undefined,
          propertyNameFormatters: [],
          propertyValueExtractors: [],
        };
      }
      info.validations[propertyOptions.originalName].propertyNameFormatters.push({
        name: propertyNameFormatter.name,
        value: formattedPropertyName,
        example: formattedPropertyExample,
      });
      info.validations[propertyOptions.originalName].propertyValueExtractors = [
        ...info.validations[propertyOptions.originalName].propertyValueExtractors,
        ...propertyValueExtractors,
      ];
    }
    // console.dir({ f: info.validations, data }, { depth: 20 });
    if (propertyOptions.transform?.transform) {
      const extractedValue = info.validations[propertyOptions.originalName].propertyValueExtractors.find(
        (e) => e.value
      )?.value;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const value =
        extractedValue !== undefined
          ? extractedValue
          : // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (data as any)[propertyOptions.originalName];

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (data as any)[propertyOptions.originalName] =
        value !== undefined
          ? propertyOptions.transform.transform({
              modelRootOptions: rootOptions || {},
              modelOptions: modelOptions || {},
              obj: data,
              options: propertyOptions,
              value,
            })
          : propertyOptions.default;
    } else {
      const extractedValue = info.validations[propertyOptions.originalName].propertyValueExtractors.find(
        (e) => e.value
      )?.value;
      const value =
        extractedValue !== undefined
          ? extractedValue
          : // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (data as any)[propertyOptions.originalName];

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (data as any)[propertyOptions.originalName] = value !== undefined ? value : propertyOptions.default;
    }
    info.validations[propertyOptions.originalName].value = data[propertyOptions.originalName];
  }

  const classValidator = loadValidator(rootOptions?.validatorPackage || modelOptions?.validatorPackage);

  let emptyOptionsInstance: any;
  let optionsInstance: any;
  try {
    emptyOptionsInstance = new model();
    optionsInstance = Object.assign(new model(), data);
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
            rootOptions?.validatorOptions || modelOptions?.validatorOptions || ENV_MODEL_CLASS_VALIDATOR_OPTIONS
          )
        ).filter((validateError) => validateError.property);
  // collect constraints
  const validateErrorsForInfo = (
    await classValidator.validate(
      emptyOptionsInstance,
      rootOptions?.validatorOptions || modelOptions?.validatorOptions || ENV_MODEL_CLASS_VALIDATOR_OPTIONS
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
    const error = new EnvModelValidationErrors(validateErrors, info);
    if (logger?.error) {
      const validations = Object.fromEntries(
        Object.entries(info.validations).filter(([key, value]) => {
          return (
            Object.keys(value.constraints || {}).length &&
            !info.modelPropertyOptions.some((o) => o.hideValueFromOutputs && o.originalName === key)
          );
        })
      );
      logger.error(
        !debug
          ? error.message
          : {
              ...info,
              validations,
              modelPropertyOptions: info.modelPropertyOptions.filter(
                (o) => o.hideValueFromOutputs !== true && validations[o.originalName]
              ),
            }
      );
    }
    throw error;
  }

  if (debug && logger?.debug) {
    logger.debug(
      JSON.stringify({
        ...info,
        validations: Object.fromEntries(
          Object.entries(info.validations).filter(([key]) => {
            return !info.modelPropertyOptions.some((o) => o.hideValueFromOutputs && o.originalName === key);
          })
        ),
        modelPropertyOptions: info.modelPropertyOptions.filter((o) => o.hideValueFromOutputs !== true),
      })
    );
  }

  for (const configPropertyMetadata of modelPropertyOptions) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (data as any)[configPropertyMetadata.originalName] = optionsInstance[configPropertyMetadata.originalName];
  }
  return { data, info };
}

export function getEnvModelMetadata<TModel extends Type = Type>(model: TModel) {
  const modelPropertyOptions: EnvModelPropertyOptions[] =
    Reflect.getMetadata(ENV_MODEL_PROPERTIES_METADATA, model) || [];
  const modelOptions: EnvModelOptions | undefined = Reflect.getMetadata(ENV_MODEL_METADATA, model);
  return { modelPropertyOptions, modelOptions };
}
