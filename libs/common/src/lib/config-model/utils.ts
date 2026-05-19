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

// ============= Validation Helpers =============

/**
 * Loads the class-validator package, using provided package or loading it dynamically
 */
function loadValidator(validatorPackage?: ValidatorPackage): ValidatorPackage {
  return validatorPackage || loadPackage('class-validator', () => require('class-validator'));
}

/**
 * Transforms and validates configuration data based on model metadata
 */
export async function configTransform<
  TData extends Record<string, any> = Record<string, any>,
  TModel extends Type = Type,
>({ model, data, rootOptions }: { model: TModel; data: Partial<TData>; rootOptions?: ConfigModelRootOptions }) {
  // Initialize root options
  const options: ConfigModelRootOptions = {
    logger: new ConsoleLogger('configTransform'),
    ...rootOptions,
  };

  const validator = loadValidator(options?.validatorPackage);
  const { modelPropertyOptions, modelOptions } = getConfigModelMetadata(model);

  // Build info object for documentation and debugging
  const info: ConfigModelInfo = {
    modelPropertyOptions,
    modelOptions: modelOptions || {},
    validations: {},
  };

  // Transform data with allowed fields
  const transformedData = transformDataFields(data, modelPropertyOptions, options, modelOptions);

  // Build validation info
  buildValidationInfo(transformedData, modelPropertyOptions, info);

  // Create model instances for validation
  const { emptyInstance, dataInstance } = createModelInstances(model, transformedData);

  // Validate the configuration
  await validateConfiguration(emptyInstance, dataInstance, validator, options, modelOptions, info);

  // Log debug information if enabled
  logDebugInfo(options, modelOptions, info);

  // Copy validated data back to original data object
  copyValidatedData(data, dataInstance, modelPropertyOptions);

  return { data, info };
}

// ============= Transformation Helpers =============

/**
 * Transforms data fields based on model property options
 */
function transformDataFields(
  data: Record<string, any>,
  modelPropertyOptions: ConfigModelPropertyOptions[],
  rootOptions: ConfigModelRootOptions,
  modelOptions?: ConfigModelOptions,
): Record<string, any> {
  const transformedData: Record<string, any> = {};

  for (const propertyOptions of modelPropertyOptions) {
    const hasValue = data[propertyOptions.originalName] !== undefined;

    if (propertyOptions.transform?.transform) {
      transformedData[propertyOptions.originalName] = hasValue
        ? propertyOptions.transform.transform({
            modelRootOptions: rootOptions,
            modelOptions: modelOptions || {},
            obj: data,
            options: propertyOptions,
            value: data[propertyOptions.originalName],
          })
        : propertyOptions.default;
    } else {
      transformedData[propertyOptions.originalName] = hasValue
        ? data[propertyOptions.originalName]
        : propertyOptions.default;
    }
  }

  return transformedData;
}

/**
 * Builds validation info from model property options
 */
function buildValidationInfo(
  data: Record<string, any>,
  modelPropertyOptions: ConfigModelPropertyOptions[],
  info: ConfigModelInfo,
): void {
  for (const propertyOptions of modelPropertyOptions) {
    info.validations[propertyOptions.originalName] = {
      constraints: {},
      value: data?.[propertyOptions.originalName],
    };
  }
}

/**
 * Creates empty and data-filled model instances
 */
function createModelInstances<TModel extends Type>(
  model: TModel,
  data: Record<string, any>,
): { emptyInstance: any; dataInstance: any } {
  try {
    const emptyInstance = new model();
    const dataInstance = Object.assign(new model(), data);
    return { emptyInstance, dataInstance };
  } catch {
    return { emptyInstance: {}, dataInstance: {} };
  }
}

// ============= Validation Logic =============

/**
 * Validates the configuration and populates validation constraints
 */
async function validateConfiguration(
  emptyInstance: any,
  dataInstance: any,
  validator: ValidatorPackage,
  rootOptions: ConfigModelRootOptions,
  modelOptions: ConfigModelOptions | undefined,
  info: ConfigModelInfo,
): Promise<void> {
  const shouldSkipValidation = rootOptions?.skipValidation || modelOptions?.skipValidation;

  if (shouldSkipValidation) {
    return;
  }

  const validatorOptions =
    rootOptions?.validatorOptions || modelOptions?.validatorOptions || CONFIG_MODEL_CLASS_VALIDATOR_OPTIONS;

  // Validate data instance for errors
  const validationErrors = (await validator.validate(dataInstance, validatorOptions)).filter((error) => error.property);

  // Validate empty instance to collect constraints for documentation
  const emptyValidationErrors = (await validator.validate(emptyInstance, validatorOptions)).filter(
    (error) => error.property,
  );

  // Collect constraints from empty instance validation
  for (const error of emptyValidationErrors) {
    if (info.validations[error.property]) {
      info.validations[error.property].constraints = error?.constraints || {};
    }
  }

  // Throw error if validation failed
  if (validationErrors.length > 0) {
    throwError(validationErrors, info, rootOptions, modelOptions);
  }
}

/**
 * Throws validation error with proper logging
 */
function throwError(
  errors: any[],
  info: ConfigModelInfo,
  rootOptions: ConfigModelRootOptions,
  modelOptions: ConfigModelOptions | undefined,
): never {
  const error = new ConfigModelValidationErrors(errors, info);
  const logger = rootOptions?.logger || modelOptions?.logger;

  if (logger?.error) {
    const debug = rootOptions?.debug || modelOptions?.debug || process.env['DEBUG'];
    const visibleValidations = buildVisibleValidations(info);

    logger.error(
      !debug
        ? error.message
        : {
            ...info,
            validations: visibleValidations,
            modelPropertyOptions: info.modelPropertyOptions.filter(
              (o) => !o.hideValueFromOutputs && visibleValidations[o.originalName],
            ),
          },
    );
  }

  throw error;
}

/**
 * Builds visible validations (excluding hidden values)
 */
function buildVisibleValidations(info: ConfigModelInfo): Record<string, any> {
  return Object.fromEntries(
    Object.entries(info.validations).filter(([key, value]) => {
      return (
        Object.keys(value.constraints || {}).length > 0 &&
        !info.modelPropertyOptions.some((o) => o.hideValueFromOutputs && o.originalName === key)
      );
    }),
  );
}

/**
 * Logs debug information if debug mode is enabled
 */
function logDebugInfo(
  rootOptions: ConfigModelRootOptions,
  modelOptions: ConfigModelOptions | undefined,
  info: ConfigModelInfo,
): void {
  const debug = rootOptions?.debug || modelOptions?.debug || process.env['DEBUG'];
  const logger = rootOptions?.logger || modelOptions?.logger;

  if (debug && logger?.debug) {
    logger.debug(
      JSON.stringify({
        ...info,
        validations: Object.fromEntries(
          Object.entries(info.validations).filter(([key]) => {
            return !info.modelPropertyOptions.some((o) => o.hideValueFromOutputs && o.originalName === key);
          }),
        ),
        modelPropertyOptions: info.modelPropertyOptions.filter((o) => !o.hideValueFromOutputs),
      }),
    );
  }
}

/**
 * Copies validated data from instance back to original data object
 */
function copyValidatedData(
  data: Record<string, any>,
  dataInstance: any,
  modelPropertyOptions: ConfigModelPropertyOptions[],
): void {
  for (const propertyMetadata of modelPropertyOptions) {
    data[propertyMetadata.originalName] = dataInstance[propertyMetadata.originalName];
  }
}

// ============= Metadata Extraction =============

/**
 * Extracts configuration model metadata from the model class
 */
export function getConfigModelMetadata<TModel extends Type = Type>(model: TModel) {
  const modelPropertyOptions: ConfigModelPropertyOptions[] =
    Reflect.getMetadata(CONFIG_MODEL_PROPERTIES_METADATA, model) || [];
  const modelOptions: ConfigModelOptions | undefined = Reflect.getMetadata(CONFIG_MODEL_METADATA, model);

  return { modelPropertyOptions, modelOptions };
}
