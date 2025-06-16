
# @nestjs-mod/fastify

Application modules with Fastify adapter for NestJS-mod

[![NPM version][npm-image]][npm-url] [![monthly downloads][downloads-image]][downloads-url] [![Telegram][telegram-image]][telegram-url] [![Discord][discord-image]][discord-url]

## Installation

```bash
npm i --save fastify @nestjs/platform-fastify @nestjs-mod/fastify
```


## Modules

| Link | Category | Description |
| ---- | -------- | ----------- |
| [FastifyNestApplicationInitializer](#fastifynestapplicationinitializer) | system | Fastify NestJS application initializer. |
| [FastifyNestApplicationListener](#fastifynestapplicationlistener) | system | Fastify NestJS application listener. |


## Modules descriptions

### FastifyNestApplicationInitializer
Fastify NestJS application initializer.

#### Use in NestJS-mod
Use without options.

```typescript
import { bootstrapNestApplication } from '@nestjs-mod/common';
import { FastifyNestApplicationInitializer } from '@nestjs-mod/fastify';

bootstrapNestApplication({
  modules: {
    system: [FastifyNestApplicationInitializer.forRoot()],
  },
});
```

Example of register fastify plugin.

```typescript
import { bootstrapNestApplication } from '@nestjs-mod/common';
import { FastifyNestApplicationInitializer } from '@nestjs-mod/fastify';
import * as fmp from 'fastify-multipart';

bootstrapNestApplication({
  modules: {
    system: [
      FastifyNestApplicationInitializer.forRoot({
        staticConfiguration: {
          wrapFastifyAdapter: (fastifyAdapter: FastifyAdapter) => {
            fastifyAdapter.register(fmp);
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
|`cors`|CORS options from [CORS package](https://github.com/expressjs/cors#configuration-options)|**optional**|-|-|
|`bodyParser`|Whether to use underlying platform body parser.|**optional**|-|-|
|`httpsOptions`|Set of configurable HTTPS options|**optional**|-|-|
|`rawBody`|Whether to register the raw request body on the request. Use `req.rawBody`.|**optional**|-|-|
|`defaultLogger`|Fastify logger for application|**optional**|-|-|
|`logger`|Specifies the logger to use.  Pass `false` to turn off logging.|**optional**|-|-|
|`abortOnError`|Whether to abort the process on Error. By default, the process is exited. Pass `false` to override the default behavior. If `false` is passed, Nest will not exit the application and instead will rethrow the exception. @default true|**optional**|-|-|
|`bufferLogs`|If enabled, logs will be buffered until the "Logger#flush" method is called. @default false|**optional**|-|-|
|`autoFlushLogs`|If enabled, logs will be automatically flushed and buffer detached when application initialization process either completes or fails. @default true|**optional**|-|-|
|`preview`|Whether to run application in the preview mode. In the preview mode, providers/controllers are not instantiated & resolved. @default false|**optional**|-|-|
|`snapshot`|Whether to generate a serialized graph snapshot. @default false|**optional**|-|-|
|`forceCloseConnections`|Force close open HTTP connections. Useful if restarting your application hangs due to keep-alive connections in the HTTP adapter.|**optional**|```true```|-|
|`wrapFastifyAdapter`|Method for additional actions before listening|**optional**|-|-|

[Back to Top](#modules)

---
### FastifyNestApplicationListener
Fastify NestJS application listener.

#### Use in NestJS-mod
Use with manual environments and custom configuration.

```typescript
import { bootstrapNestApplication, isInfrastructureMode } from '@nestjs-mod/common';
import { FastifyNestApplicationInitializer, FastifyNestApplicationListener } from '@nestjs-mod/fastify';
import { Logger } from '@nestjs/common';

bootstrapNestApplication({
  modules: {
    system: [
      FastifyNestApplicationInitializer.forRoot(),
      FastifyNestApplicationListener.forRoot({
        staticEnvironments: { port: 3000 },
        staticConfiguration: {
          mode: isInfrastructureMode() ? 'silent' : 'listen',
          preListen: async ({ app }) => {
            if (app) {
              app.setGlobalPrefix('api');
            }
          },
          postListen: async ({ current }) => {
            Logger.log(
              `🚀 Application is running on: http://${current.staticEnvironments?.hostname || 'localhost'}:${
                current.staticEnvironments?.port
              }/api`
            );
          },
        },
      }),
    ],
  },
});
```


#### Static environments


| Key    | Description | Sources | Constraints | Default | Value |
| ------ | ----------- | ------- | ----------- | ------- | ----- |
|`port`|The port on which to run the server.|`obj['port']`, `process.env['PORT']`|**optional**|```3000```|```3000```|
|`hostname`|Hostname on which to listen for incoming packets.|`obj['hostname']`, `process.env['HOSTNAME']`|**optional**|```0.0.0.0```|```0.0.0.0```|

#### Static configuration


| Key    | Description | Constraints | Default | Value |
| ------ | ----------- | ----------- | ------- | ----- |
|`mode`|Mode of start application: init - for run NestJS life cycle, listen -  for full start NestJS application|**optional**|```listen```|-|
|`preListen`|Method for additional actions before listening|**optional**|-|-|
|`postListen`|Method for additional actions after listening|**optional**|-|-|
|`defaultLogger`|Fastify logger for application|**optional**|-|-|
|`enableShutdownHooks`|Enable shutdown hooks|**optional**|```true```|-|
|`globalPrefix`|Global prefix|**optional**|```api```|-|
|`autoCloseTimeoutInInfrastructureMode`|Timeout seconds for automatically closes the application in `infrastructure mode` if the application does not close itself (zero - disable)|**optional**|-|-|
|`logApplicationStart`|Log application start|**optional**|```true```|-|

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

[npm-image]: https://badgen.net/npm/v/@nestjs-mod/fastify
[npm-url]: https://npmjs.org/package/@nestjs-mod/fastify
[telegram-image]: https://img.shields.io/badge/group-telegram-blue.svg?maxAge=2592000
[telegram-url]: https://t.me/nestjs_mod
[discord-image]: https://img.shields.io/badge/discord-online-brightgreen.svg
[discord-url]: https://discord.gg/meY7UXaG
[downloads-image]: https://badgen.net/npm/dm/@nestjs-mod/fastify
[downloads-url]: https://npmjs.org/package/@nestjs-mod/fastify
