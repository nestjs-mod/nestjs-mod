import { applyDecorators, Injectable } from '@nestjs/common';
import { CONFIG_MODEL_METADATA, CONFIG_MODEL_PROPERTIES_METADATA } from './constants';
import { ConfigModelOptions, ConfigModelPropertyOptions, ConfigModelRootOptions } from './types';

export function ConfigModel(options?: ConfigModelRootOptions) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return applyDecorators(Injectable(), (target: any): void => {
    Reflect.defineMetadata(
      CONFIG_MODEL_METADATA,
      <ConfigModelOptions>{
        ...options,
        originalName: target.name,
      },
      target
    );
  });
}

export function ConfigModelProperty(options?: Omit<ConfigModelPropertyOptions, 'propertyKey' | 'originalName'>) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (target: any, propertyKey: string): void => {
    const configModelPropertyMetadata: ConfigModelPropertyOptions[] =
      Reflect.getOwnMetadata(CONFIG_MODEL_PROPERTIES_METADATA, target.constructor) || [];
    configModelPropertyMetadata.push({ ...options, originalName: propertyKey });
    Reflect.defineMetadata(CONFIG_MODEL_PROPERTIES_METADATA, configModelPropertyMetadata, target.constructor);
  };
}
