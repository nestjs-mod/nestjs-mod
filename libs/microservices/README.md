
# @nestjs-mod/microservices

NestJS microservice modules for NestJS-mod

[![NPM version][npm-image]][npm-url] [![monthly downloads][downloads-image]][downloads-url] [![Telegram bot][telegram-image]][telegram-url]

## Installation

```bash
npm i --save @nestjs/microservices @nestjs-mod/microservices
```


## Modules

| Link | Category | Description |
| ---- | -------- | ----------- |
| [TcpNestMicroservice](#tcpnestmicroservice) | system | TCP NestJS-mod microservice initializer, no third party utilities required @see https://docs.nestjs.com/microservices/basics |


## Modules descriptions

### TcpNestMicroservice
TCP NestJS-mod microservice initializer, no third party utilities required @see https://docs.nestjs.com/microservices/basics

#### Static environments


| Key    | Description | Sources | Constraints | Default | Value |
| ------ | ----------- | ------- | ----------- | ------- | ----- |
|`host`|Host|`obj['host']`, `process.env['TCP_HOST']`|**optional**|-|-|
|`port`|Port|`obj['port']`, `process.env['TCP_PORT']`|**optional**|-|-|

#### Static configuration


| Key    | Description | Constraints | Default | Value |
| ------ | ----------- | ----------- | ------- | ----- |
|`defaultLogger`|Default logger for application|**optional**|-|-|
|`logger`|Specifies the logger to use.  Pass `false` to turn off logging.|**optional**|-|-|
|`abortOnError`|Whether to abort the process on Error. By default, the process is exited. Pass `false` to override the default behavior. If `false` is passed, Nest will not exit the application and instead will rethrow the exception. @default true|**optional**|-|-|
|`bufferLogs`|If enabled, logs will be buffered until the "Logger#flush" method is called. @default false|**optional**|-|-|
|`autoFlushLogs`|If enabled, logs will be automatically flushed and buffer detached when application initialization process either completes or fails. @default true|**optional**|-|-|
|`preview`|Whether to run application in the preview mode. In the preview mode, providers/controllers are not instantiated & resolved. @default false|**optional**|-|-|
|`snapshot`|Whether to generate a serialized graph snapshot. @default false|**optional**|-|-|
|`featureName`|Feature name for generate prefix to environments keys|**optional**|-|-|
|`retryAttempts`|Retry attempts|**optional**|-|-|
|`retryDelay`|Retry delay|**optional**|-|-|
|`serializer`|Serializer|**optional**|-|-|
|`tlsOptions`|TLS options|**optional**|-|-|
|`deserializer`|Deserializer|**optional**|-|-|
|`socketClass`|Socket class|**optional**|-|-|

[Back to Top](#modules)

## Links

* https://github.com/nestjs-mod/nestjs-mod - A collection of utilities for unifying NestJS applications and modules
* https://github.com/nestjs-mod/nestjs-mod-contrib - Contrib repository for the NestJS-mod
* https://github.com/nestjs-mod/nestjs-mod-example - Example application built with [@nestjs-mod/schematics](https://github.com/nestjs-mod/nestjs-mod/tree/master/libs/schematics)
* https://github.com/nestjs-mod/nestjs-mod/blob/master/apps/example-basic/INFRASTRUCTURE.MD - A simple example of infrastructure documentation.
* https://github.com/nestjs-mod/nestjs-mod-contrib/blob/master/apps/example-prisma/INFRASTRUCTURE.MD - An extended example of infrastructure documentation with a docker-compose file and a data base.
* https://dev.to/endykaufman/collection-of-nestjs-mod-utilities-for-unifying-applications-and-modules-on-nestjs-5256 - Article about the project NestJS-mod


## License

MIT

[npm-image]: https://badgen.net/npm/v/@nestjs-mod/microservices
[npm-url]: https://npmjs.org/package/@nestjs-mod/microservices
[telegram-image]: https://img.shields.io/badge/group-telegram-blue.svg?maxAge=2592000
[telegram-url]: https://t.me/nestjs_mod
[downloads-image]: https://badgen.net/npm/dm/@nestjs-mod/microservices
[downloads-url]: https://npmjs.org/package/@nestjs-mod/microservices
