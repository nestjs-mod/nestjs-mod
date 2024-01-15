
# @nestjs-mod/testing

Modules and utilities for writing application tests.

[![NPM version][npm-image]][npm-url] [![monthly downloads][downloads-image]][downloads-url] [![Telegram bot][telegram-image]][telegram-url]

## Installation

```bash
npm i --save @nestjs-mod/testing
```



## Modules

| Link | Category | Description |
| ---- | -------- | ----------- |
| [DefaultTestNestApplicationCreate](#defaulttestnestapplicationcreate) | system | Default test NestJS application creator, no third party utilities required. |
| [DefaultTestNestApplicationInitializer](#defaulttestnestapplicationinitializer) | system | Default test NestJS application initializer, no third party utilities required. |



## Modules descriptions

### DefaultTestNestApplicationCreate
Default test NestJS application creator, no third party utilities required.

#### Static configuration


| Key    | Description | Constraints | Default | Value |
| ------ | ----------- | ----------- | ------- | ----- |
|`wrapTestingModuleBuilder`|Method for additional actions with TestingModuleBuilder|**optional**|-|-|

[Back to Top](#modules)

---
### DefaultTestNestApplicationInitializer
Default test NestJS application initializer, no third party utilities required.

#### Static configuration


| Key    | Description | Constraints | Default | Value |
| ------ | ----------- | ----------- | ------- | ----- |
|`preInit`|Method for additional actions before init|**optional**|-|-|
|`postInit`|Method for additional actions after init|**optional**|-|-|

[Back to Top](#modules)

## License

MIT

[npm-image]: https://badgen.net/npm/v/@nestjs-mod/testing
[npm-url]: https://npmjs.org/package/@nestjs-mod/testing
[telegram-image]: https://img.shields.io/badge/group-telegram-blue.svg?maxAge=2592000
[telegram-url]: https://t.me/nestjs_mod
[downloads-image]: https://badgen.net/npm/dm/@nestjs-mod/testing
[downloads-url]: https://npmjs.org/package/@nestjs-mod/testing