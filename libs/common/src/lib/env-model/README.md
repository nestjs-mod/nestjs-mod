## Env model

Decorators for describing module environment variables and functions for its serialization and verification.
Values can be automatically read from process.env.

### Decorators

`EnvModel`, `EnvModelProperty`

### Function

`envTransform`

### Usage

```typescript
import { EnvModel, EnvModelProperty, envTransform } from '@nestjs-mod/common';
import { DynamicModule, Module } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { IsNotEmpty } from 'class-validator';

// We describe the configuration.
@EnvModel()
class AppEnv {
  @EnvModelProperty()
  @IsNotEmpty()
  option!: string;
}

// We describe the module.
@Module({ providers: [AppEnv] })
class AppModule {
  static forRoot(env: Partial<AppEnv>): DynamicModule {
    return {
      module: AppModule,
      providers: [
        {
          provide: `${AppEnv.name}_loader`,
          useFactory: async (emptyAppEnv: AppEnv) => {
            if (env.constructor !== Object) {
              Object.setPrototypeOf(emptyAppEnv, env);
            }
            const obj = await envTransform({
              model: AppEnv,
              data: env,
            });
            Object.assign(emptyAppEnv, obj.data);
          },
          inject: [AppEnv],
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
  console.log(app.get(AppEnv)); // output: { option: 'value1' }
  await app.listen(3000);
}

bootstrap2();

// Let's try to launch the application - Example of use environment variables and start without error.
async function bootstrap3() {
  process.env['OPTION'] = 'value1';
  const app = await NestFactory.create(AppModule.forRoot({}));
  console.log(app.get(AppEnv)); // output: { option: 'value1' }
  await app.listen(3000);
}

bootstrap3();
```
