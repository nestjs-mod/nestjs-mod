import { applyDecorators, Injectable } from '@nestjs/common';
import { ENV_MODEL_METADATA, ENV_MODEL_PROPERTIES_METADATA } from './constants';
import { DefaultPropertyValueExtractor } from './extractors/default-property-value.extractor';
import { ProcessEnvPropertyValueExtractor } from './extractors/process-env-property-value.extractor';
import { DotEnvPropertyNameFormatter } from './formatters/dot-env-property-name.formatter';
import {
  EnvModelOptions,
  EnvModelPropertyOptions,
  EnvModelRootOptions,
} from './types';

export function EnvModel(options?: EnvModelRootOptions) {
  if (!options) {
    options = {};
  }
  if (!options.propertyNameFormatters) {
    options.propertyValueExtractors = [
      new DefaultPropertyValueExtractor(),
      new ProcessEnvPropertyValueExtractor(),
    ];
  }
  if (!options.propertyNameFormatters) {
    options.propertyNameFormatters = [new DotEnvPropertyNameFormatter()];
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return applyDecorators(Injectable(), (target: any): void => {
    Reflect.defineMetadata(
      ENV_MODEL_METADATA,
      <EnvModelOptions>{
        ...options,
        originalName: target.name,
      },
      target
    );
  });
}

export function EnvModelProperty(
  options?: Omit<EnvModelPropertyOptions, 'originalName'>
) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (target: any, propertyKey: string): void => {
    const envModelPropertyMetadata: EnvModelPropertyOptions[] =
      Reflect.getOwnMetadata(
        ENV_MODEL_PROPERTIES_METADATA,
        target.constructor
      ) || [];
    envModelPropertyMetadata.push({ ...options, originalName: propertyKey });
    Reflect.defineMetadata(
      ENV_MODEL_PROPERTIES_METADATA,
      envModelPropertyMetadata,
      target.constructor
    );
  };
}
