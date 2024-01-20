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
  if (!rootOptions) {
    rootOptions = {};
  }
  if (!rootOptions.logger) {
    rootOptions.logger = new ConsoleLogger('envTransform');
  }
  const loadValidator = (validatorPackage?: ValidatorPackage): ValidatorPackage => {
    return validatorPackage ?? loadPackage('class-validator', () => require('class-validator'));
  };

  const { modelPropertyOptions, modelOptions } = getEnvModelMetadata(model);
  const info: EnvModelInfo = {
    modelPropertyOptions,
    modelOptions: modelOptions ?? {},
    validations: {},
  };

  const propertyNameFormatters = modelOptions?.propertyNameFormatters ?? rootOptions?.propertyNameFormatters ?? [];
  for (const propertyOptions of modelPropertyOptions) {
    for (const propertyNameFormatter of propertyNameFormatters) {
      const formattedPropertyExample = propertyNameFormatter.example({
        modelRootOptions: rootOptions,
        modelOptions: modelOptions ?? {},
        propertyOptions,
      });
      const formattedPropertyName = propertyNameFormatter.format({
        modelRootOptions: rootOptions,
        modelOptions: modelOptions ?? {},
        propertyOptions,
      });

      const demoMode = modelOptions?.demoMode ?? rootOptions?.demoMode ?? false;

      const propertyValueExtractors = (
        modelOptions?.propertyValueExtractors ??
        rootOptions?.propertyValueExtractors ??
        []
      ).map((extractor) => {
        if (extractor.setDemoMode) {
          extractor.setDemoMode(demoMode);
        }
        return {
          name: extractor.name,
          example: extractor.example({
            obj: data,
            modelRootOptions: rootOptions,
            modelOptions: modelOptions ?? {},
            propertyOptions,
            formattedPropertyName,
          }),
          demoMode,
          value: extractor.extract({
            obj: data,
            modelRootOptions: rootOptions,
            modelOptions: modelOptions ?? {},
            propertyOptions,
            formattedPropertyName,
          }),
        };
      });

      if (!info.validations[propertyOptions.originalName]) {
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (data as any)[propertyOptions.originalName] =
      info.validations[propertyOptions.originalName].propertyValueExtractors.find((e) => e.value)?.value ??
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (data as any)[propertyOptions.originalName] ??
      propertyOptions.default;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    info.validations[propertyOptions.originalName].value = (data as any)[propertyOptions.originalName];
  }

  const classValidator = loadValidator(modelOptions?.validatorPackage ?? rootOptions?.validatorPackage);

  const optionsInstance = Object.assign(new model(), data);
  const validateErrors =
    modelOptions?.skipValidation ?? rootOptions?.skipValidation
      ? []
      : (
          await classValidator.validate(
            optionsInstance,
            modelOptions?.validatorOptions ?? rootOptions?.validatorOptions ?? ENV_MODEL_CLASS_VALIDATOR_OPTIONS
          )
        ).filter((validateError) => validateError.property);

  // collect constraints
  const validateErrorsForInfo = (
    await classValidator.validate(
      new model(),
      modelOptions?.validatorOptions ?? rootOptions?.validatorOptions ?? ENV_MODEL_CLASS_VALIDATOR_OPTIONS
    )
  ).filter((validateError) => validateError.property);
  for (const validateError of validateErrorsForInfo) {
    if (info.validations[validateError.property]) {
      info.validations[validateError.property].constraints = validateError?.constraints ?? {};
    }
  }

  if (validateErrors.length > 0) {
    const debug = modelOptions?.debug ?? rootOptions?.debug;
    const logger = modelOptions?.logger ?? rootOptions?.logger;
    if (debug && logger?.debug) {
      logger.debug(info);
    }
    throw new EnvModelValidationErrors(validateErrors, info);
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
