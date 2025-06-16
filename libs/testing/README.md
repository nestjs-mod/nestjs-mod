
# @nestjs-mod/testing

Modules and utilities for writing application tests

[![NPM version][npm-image]][npm-url] [![monthly downloads][downloads-image]][downloads-url] [![Telegram][telegram-image]][telegram-url] [![Discord][discord-image]][discord-url]

## Installation

```bash
npm i --save-dev @nestjs/testing @nestjs-mod/testing
```


## Modules

| Link | Category | Description |
| ---- | -------- | ----------- |
| [DefaultTestNestApplicationCreate](#defaulttestnestapplicationcreate) | system | Default test NestJS application creator. |
| [DefaultTestNestApplicationInitializer](#defaulttestnestapplicationinitializer) | system | Default test NestJS application initializer. |


## Modules descriptions

### DefaultTestNestApplicationCreate
Default test NestJS application creator.

#### Use in NestJS-mod
Use without options.

```typescript
import { bootstrapNestApplication } from '@nestjs-mod/common';
import { DefaultTestNestApplicationCreate } from '@nestjs-mod/testing';

bootstrapNestApplication({
  modules: {
    system: [DefaultTestNestApplicationCreate.forRoot()],
  },
});
```

Example of use with override provider.

```typescript
import { bootstrapNestApplication } from '@nestjs-mod/common';
import { DefaultTestNestApplicationCreate } from '@nestjs-mod/testing';
import { Injectable } from '@nestjs/common';

@Injectable()
export class CatsService {
  findAll() {
    return ['cats'];
  }
}

const fakeCatsService = { findAll: () => ['test'] };

bootstrapNestApplication({
  modules: {
    system: [
      DefaultTestNestApplicationCreate.forRoot({
        staticConfiguration: {
          wrapTestingModuleBuilder: (testingModuleBuilder) =>
            testingModuleBuilder.overrideProvider(CatsService).useValue(fakeCatsService),
        },
      }),
    ],
  },
});
```


#### Static configuration


| Key    | Description | Constraints | Default | Value |
| ------ | ----------- | ----------- | ------- | ----- |
|`wrapTestingModuleBuilder`|Method for additional actions with TestingModuleBuilder|**optional**|-|-|
|`defaultLogger`|Default logger for application|**optional**|-|-|

[Back to Top](#modules)

---
### DefaultTestNestApplicationInitializer
Default test NestJS application initializer.

#### Use in NestJS-mod
Use without options.

```typescript
import { bootstrapNestApplication } from '@nestjs-mod/common';
import { DefaultTestNestApplicationCreate, DefaultTestNestApplicationInitializer } from '@nestjs-mod/testing';

bootstrapNestApplication({
  modules: {
    system: [DefaultTestNestApplicationCreate.forRoot(), DefaultTestNestApplicationInitializer.forRoot()],
  },
});
```

An example of getting a provider after running a test application.

```typescript
import { bootstrapNestApplication } from '@nestjs-mod/common';
import { DefaultTestNestApplicationCreate, DefaultTestNestApplicationInitializer } from '@nestjs-mod/testing';
import { Injectable } from '@nestjs/common';

@Injectable()
export class CatsService {
  findAll() {
    return ['cats'];
  }
}

bootstrapNestApplication({
  modules: {
    system: [
      DefaultTestNestApplicationCreate.forRoot(),
      DefaultTestNestApplicationInitializer.forRoot({
        staticConfiguration: {
          postInit: async ({ app }) => {
            if (app) {
              const catsService = app.get(CatsService);
              console.log(catsService.findAll());
            }
          },
        },
      }),
    ],
  },
});
```


#### Static configuration


| Key    | Description | Constraints | Default | Value |
| ------ | ----------- | ----------- | ------- | ----- |
|`preInit`|Method for additional actions before init|**optional**|-|-|
|`postInit`|Method for additional actions after init|**optional**|-|-|
|`defaultLogger`|Default logger for test application|**optional**|-|-|

[Back to Top](#modules)

## Links

* https://github.com/nestjs-mod/nestjs-mod - A collection of utilities for unifying NestJS applications and modules
* https://github.com/nestjs-mod/nestjs-mod-contrib - Contrib repository for the NestJS-mod
* https://github.com/nestjs-mod/nestjs-mod-example - Example application built with [@nestjs-mod/schematics](https://github.com/nestjs-mod/nestjs-mod/tree/master/libs/schematics)
* https://github.com/nestjs-mod/nestjs-mod/blob/master/apps/example-basic/INFRASTRUCTURE.MD - A simple example of infrastructure documentation.
* https://github.com/nestjs-mod/nestjs-mod-contrib/blob/master/apps/example-prisma/INFRASTRUCTURE.MD - An extended example of infrastructure documentation with a docker-compose file and a data base.
* https://dev.to/endykaufman/collection-of-nestjs-mod-utilities-for-unifying-applications-and-modules-on-nestjs-5256 - Article about the project NestJS-mod
* https://habr.com/ru/articles/788916 - Коллекция утилит NestJS-mod для унификации приложений и модулей на NestJS


## License

MIT

[npm-image]: https://badgen.net/npm/v/@nestjs-mod/testing
[npm-url]: https://npmjs.org/package/@nestjs-mod/testing
[telegram-image]: https://img.shields.io/badge/group-telegram-blue.svg?maxAge=2592000
[telegram-url]: https://t.me/nestjs_mod
[discord-image]: https://img.shields.io/badge/discord-online-brightgreen.svg
[discord-url]: https://discord.gg/meY7UXaG
[downloads-image]: https://badgen.net/npm/dm/@nestjs-mod/testing
[downloads-url]: https://npmjs.org/package/@nestjs-mod/testing
