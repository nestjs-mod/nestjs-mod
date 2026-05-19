import { applyDecorators, Injectable } from '@nestjs/common';
import { ENV_MODEL_METADATA, ENV_MODEL_PROPERTIES_METADATA } from './constants';
import { DefaultPropertyValueExtractor } from './extractors/default-property-value.extractor';
import { ProcessEnvPropertyValueExtractor } from './extractors/process-env-property-value.extractor';
import { DotEnvPropertyNameFormatter } from './formatters/dot-env-property-name.formatter';
import { EnvModelOptions, EnvModelPropertyOptions, EnvModelRootOptions } from './types';

/**
 * Decorator to mark a class as an environment model
 * Sets up default property value extractors and name formatters if not provided
 * @param options Optional configuration for the environment model
 */
export function EnvModel(options?: EnvModelRootOptions) {
  const modelOptions: EnvModelRootOptions = {
    ...options,
  };

  // Set default property value extractors if not provided
  if (!modelOptions.propertyValueExtractors) {
    modelOptions.propertyValueExtractors = [
      new DefaultPropertyValueExtractor(),
      new ProcessEnvPropertyValueExtractor(),
    ];
  }

  // Set default property name formatters if not provided
  if (!modelOptions.propertyNameFormatters) {
    modelOptions.propertyNameFormatters = [new DotEnvPropertyNameFormatter()];
  }

  return applyDecorators(Injectable(), (target: any): void => {
    Reflect.defineMetadata(
      ENV_MODEL_METADATA,
      <EnvModelOptions>{
        ...modelOptions,
        originalName: target.name,
      },
      target,
    );
  });
}

/**
 * Decorator to define a property within an environment model
 * @param options Property configuration options (excluding originalName)
 */
export function EnvModelProperty(options?: Omit<EnvModelPropertyOptions, 'originalName'>) {
  return (target: any, propertyKey: string): void => {
    const existingMetadata: EnvModelPropertyOptions[] =
      Reflect.getOwnMetadata(ENV_MODEL_PROPERTIES_METADATA, target.constructor) || [];

    existingMetadata.push({ ...options, originalName: propertyKey });

    Reflect.defineMetadata(ENV_MODEL_PROPERTIES_METADATA, existingMetadata, target.constructor);
  };
}
