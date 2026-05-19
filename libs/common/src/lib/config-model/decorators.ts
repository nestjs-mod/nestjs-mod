import { applyDecorators, Injectable } from '@nestjs/common';
import { CONFIG_MODEL_METADATA, CONFIG_MODEL_PROPERTIES_METADATA } from './constants';
import { ConfigModelOptions, ConfigModelPropertyOptions, ConfigModelRootOptions } from './types';

/**
 * Decorator to mark a class as a configuration model
 * @param options Optional configuration for the model
 */
export function ConfigModel(options?: ConfigModelRootOptions) {
  return applyDecorators(Injectable(), (target: any): void => {
    Reflect.defineMetadata(
      CONFIG_MODEL_METADATA,
      <ConfigModelOptions>{
        ...options,
        originalName: target.name,
      },
      target,
    );
  });
}

/**
 * Decorator to define a property within a configuration model
 * @param options Property configuration options (excluding originalName and propertyKey)
 */
export function ConfigModelProperty(options?: Omit<ConfigModelPropertyOptions, 'propertyKey' | 'originalName'>) {
  return (target: any, propertyKey: string): void => {
    const existingMetadata: ConfigModelPropertyOptions[] =
      Reflect.getOwnMetadata(CONFIG_MODEL_PROPERTIES_METADATA, target.constructor) || [];

    existingMetadata.push({ ...options, originalName: propertyKey });

    Reflect.defineMetadata(CONFIG_MODEL_PROPERTIES_METADATA, existingMetadata, target.constructor);
  };
}
