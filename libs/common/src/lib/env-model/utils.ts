import { ConsoleLogger, Type } from '@nestjs/common';
import { ValidatorPackage } from '@nestjs/common/interfaces/external/validator-package.interface';
import { loadPackage } from '../utils/load-package';
import { ENV_MODEL_CLASS_VALIDATOR_OPTIONS, ENV_MODEL_METADATA, ENV_MODEL_PROPERTIES_METADATA } from './constants';
import { EnvModelValidationErrors } from './errors';
import { EnvModelInfo, EnvModelOptions, EnvModelPropertyOptions, EnvModelRootOptions } from './types';

// ============= Validation Helpers =============

/**
 * Loads the class-validator package, using provided package or loading it dynamically
 */
function loadValidator(validatorPackage?: ValidatorPackage): ValidatorPackage {
  return validatorPackage || loadPackage('class-validator', () => require('class-validator'));
}

// ============= Main Transformation Function =============

/**
 * Transforms and validates environment data based on model metadata
 */
export async function envTransform<TData extends Record<string, any>, TModel extends Type = Type>({
  model,
  data,
  rootOptions,
}: {
  model: TModel;
  data: Partial<TData>;
  rootOptions?: EnvModelRootOptions;
}) {
  const options: EnvModelRootOptions = {
    logger: new ConsoleLogger('envTransform'),
    ...rootOptions,
  };

  const validator = loadValidator(options?.validatorPackage);
  const { modelPropertyOptions, modelOptions } = getEnvModelMetadata(model);

  const info: EnvModelInfo = {
    modelPropertyOptions,
    modelOptions: modelOptions || {},
    validations: {},
  };

  const propertyNameFormatters = options?.propertyNameFormatters || modelOptions?.propertyNameFormatters || [];

  // Process each property with formatters and extractors
  for (const propertyOptions of modelPropertyOptions) {
    processPropertyWithFormatters(propertyOptions, data, propertyNameFormatters, options, modelOptions, info);
  }

  // Transform property values
  transformPropertyValues(data, modelPropertyOptions, options, modelOptions, info);

  // Create model instances for validation
  const { emptyInstance, dataInstance } = createModelInstances(model, data);

  // Validate the environment configuration
  await validateEnvironment(emptyInstance, dataInstance, validator, options, modelOptions, info);

  // Log debug information if enabled
  logDebugInfo(options, modelOptions, info);

  // Copy validated data back to original data object
  copyValidatedData(data, dataInstance, modelPropertyOptions);

  return { data, info };
}

// ============= Property Processing =============

/**
 * Processes a single property with all formatters and extractors
 */
function processPropertyWithFormatters(
  propertyOptions: EnvModelPropertyOptions,
  data: Record<string, any>,
  propertyNameFormatters: any[],
  rootOptions: EnvModelRootOptions,
  modelOptions: EnvModelOptions | undefined,
  info: EnvModelInfo,
): void {
  const demoMode = rootOptions?.demoMode || modelOptions?.demoMode || false;

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

    // Extract property values from various sources
    const propertyValueExtractors = extractPropertyValues(
      data,
      propertyOptions,
      formattedPropertyName,
      demoMode,
      rootOptions,
      modelOptions,
    );

    // Initialize validation info for this property
    initializeValidationInfo(propertyOptions, info);

    // Add formatter and extractor info to validation
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
}

/**
 * Extracts property values from all configured extractors
 */
function extractPropertyValues(
  data: Record<string, any>,
  propertyOptions: EnvModelPropertyOptions,
  formattedPropertyName: string,
  demoMode: boolean,
  rootOptions: EnvModelRootOptions,
  modelOptions: EnvModelOptions | undefined,
): any[] {
  const propertyValueExtractors = (
    rootOptions?.propertyValueExtractors ??
    modelOptions?.propertyValueExtractors ??
    []
  ).map((extractor) => {
    // Set demo mode if extractor supports it
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

    // Reset demo mode
    if (extractor.setDemoMode) {
      extractor.setDemoMode(false);
    }

    return result;
  });

  return propertyValueExtractors;
}

/**
 * Initializes validation info for a property if not already present
 */
function initializeValidationInfo(propertyOptions: EnvModelPropertyOptions, info: EnvModelInfo): void {
  if (info.validations[propertyOptions.originalName] === undefined) {
    info.validations[propertyOptions.originalName] = {
      constraints: {},
      value: undefined,
      propertyNameFormatters: [],
      propertyValueExtractors: [],
    };
  }
}

// ============= Value Transformation =============

/**
 * Transforms property values using transformers or extracted values
 */
function transformPropertyValues(
  data: Record<string, any>,
  modelPropertyOptions: EnvModelPropertyOptions[],
  rootOptions: EnvModelRootOptions,
  modelOptions: EnvModelOptions | undefined,
  info: EnvModelInfo,
): void {
  for (const propertyOptions of modelPropertyOptions) {
    const extractedValue = info.validations[propertyOptions.originalName].propertyValueExtractors.find(
      (e) => e.value !== undefined,
    )?.value;

    const currentValue = (data as any)[propertyOptions.originalName];
    const value = extractedValue !== undefined ? extractedValue : currentValue;

    if (propertyOptions.transform?.transform) {
      (data as any)[propertyOptions.originalName] =
        value !== undefined
          ? propertyOptions.transform.transform({
              modelRootOptions: rootOptions,
              modelOptions: modelOptions || {},
              obj: data,
              options: propertyOptions,
              value,
            })
          : propertyOptions.default;
    } else {
      (data as any)[propertyOptions.originalName] = value !== undefined ? value : propertyOptions.default;
    }

    info.validations[propertyOptions.originalName].value = data[propertyOptions.originalName];
  }
}

// ============= Validation Logic =============

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

/**
 * Validates the environment configuration
 */
async function validateEnvironment(
  emptyInstance: any,
  dataInstance: any,
  validator: ValidatorPackage,
  rootOptions: EnvModelRootOptions,
  modelOptions: EnvModelOptions | undefined,
  info: EnvModelInfo,
): Promise<void> {
  const shouldSkipValidation = rootOptions?.skipValidation || modelOptions?.skipValidation;

  if (shouldSkipValidation) {
    return;
  }

  const validatorOptions =
    rootOptions?.validatorOptions || modelOptions?.validatorOptions || ENV_MODEL_CLASS_VALIDATOR_OPTIONS;

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
  info: EnvModelInfo,
  rootOptions: EnvModelRootOptions,
  modelOptions: EnvModelOptions | undefined,
): never {
  const error = new EnvModelValidationErrors(errors, info);
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
function buildVisibleValidations(info: EnvModelInfo): Record<string, any> {
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
  rootOptions: EnvModelRootOptions,
  modelOptions: EnvModelOptions | undefined,
  info: EnvModelInfo,
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
  modelPropertyOptions: EnvModelPropertyOptions[],
): void {
  for (const propertyMetadata of modelPropertyOptions) {
    (data as any)[propertyMetadata.originalName] = dataInstance[propertyMetadata.originalName];
  }
}

// ============= Metadata Extraction =============

/**
 * Extracts environment model metadata from the model class
 */
export function getEnvModelMetadata<TModel extends Type = Type>(model: TModel) {
  const modelPropertyOptions: EnvModelPropertyOptions[] =
    Reflect.getMetadata(ENV_MODEL_PROPERTIES_METADATA, model) || [];
  const modelOptions: EnvModelOptions | undefined = Reflect.getMetadata(ENV_MODEL_METADATA, model);

  return { modelPropertyOptions, modelOptions };
}
