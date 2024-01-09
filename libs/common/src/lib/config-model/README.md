### Config model

Decorators for describing the module configuration and a function for its serialization and validation.
Values for this type of configuration must be described in code.

#### Decorators

`ConfigModel`, `ConfigModelProperty`

#### Function

`configTransform`

#### Usage

```typescript
import { ConfigModel, ConfigModelProperty, configTransform } from '@nestjs-mod/common';
import { DynamicModule, Module } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { IsNotEmpty } from 'class-validator';

// We describe the configuration.
@ConfigModel()
class AppConfig {
  @ConfigModelProperty()
  @IsNotEmpty()
  option!: string;
}

// We describe the module.
@Module({ providers: [AppConfig] })
class AppModule {
  static forRoot(config: Partial<AppConfig>): DynamicModule {
    return {
      module: AppModule,
      providers: [
        {
          provide: `${AppConfig.name}_loader`,
          useFactory: async (emptyAppConfig: AppConfig) => {
            if (config.constructor !== Object) {
              Object.setPrototypeOf(emptyAppConfig, config);
            }
            const obj = await configTransform({
              model: AppConfig,
              data: config,
            });
            Object.assign(emptyAppConfig, obj.data);
          },
          inject: [AppConfig],
        },
      ],
    };
  }
}

// Let's try to launch the application - Example with throw validation error.
async function bootstrap1() {
  const app = await NestFactory.create(AppModule.forRoot({}));
  await app.listen(3000);
}

// Now we get a config validation error.
// throw new ConfigModelValidationErrors(validateErrors);
// isNotEmpty: option should not be empty
bootstrap1();

// Let's try to launch the application - Example of start without error.
async function bootstrap2() {
  const app = await NestFactory.create(AppModule.forRoot({ option: 'value1' }));
  console.log(app.get(AppConfig)); // output: { option: 'value1' }
  await app.listen(3000);
}

bootstrap2();
```
