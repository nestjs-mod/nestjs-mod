
# @nestjs-mod/reports

Modules and utilities for generating reports on infrastructure and features

[![NPM version][npm-image]][npm-url] [![monthly downloads][downloads-image]][downloads-url] [![Telegram][telegram-image]][telegram-url] [![Discord][discord-image]][discord-url]

## Installation

```bash
npm i --save @nestjs-mod/reports
```


## Modules

| Link | Category | Description |
| ---- | -------- | ----------- |
| [NestjsModAllReadmeGenerator](#nestjsmodallreadmegenerator) | infrastructure | Readme generator for nestjs-mod modules. |


## Modules descriptions

### NestjsModAllReadmeGenerator
Readme generator for nestjs-mod modules.

#### Use in NestJS-mod
Example of use with all need options.

```typescript
import { bootstrapNestApplication } from '@nestjs-mod/common';
import { NestjsModAllReadmeGenerator } from '@nestjs-mod/reports';
import { join } from 'path';

const libFolder = join(__dirname, '..', '..', '..', 'libs/common');

bootstrapNestApplication({
  modules: {
    infrastructure: [
      NestjsModAllReadmeGenerator.forRoot({
        contextName: 'common',
        staticConfiguration: {
          telegramGroup: 'https://t.me/nestjs_mod',
          discord:'https://discord.gg/meY7UXaG',
          packageFile: join(libFolder, 'package.json'),
          markdownFile: join(libFolder, 'README.md'),
          folderWithMarkdownFilesToUse: libFolder,
          utilsFolders: [join(libFolder, 'src/lib')],
          modules: [import('@nestjs-mod/common')],
          markdownFooter: `
## Links

* https://github.com/nestjs-mod/nestjs-mod - A collection of utilities for unifying NestJS applications and modules
* https://github.com/nestjs-mod/nestjs-mod-contrib - Contrib repository for the NestJS-mod
`,
        },
      }),
    ],
  },
});
```


#### Static configuration


| Key    | Description | Constraints | Default | Value |
| ------ | ----------- | ----------- | ------- | ----- |
|`utilsFolders`|Folders with utilities|**isNotEmpty** (utilsFolders should not be empty)|-|-|
|`modules`|NodeJS modules with NestJS-mod modules|**isNotEmpty** (modules should not be empty)|-|**hidden**|
|`packageFile`|Name of the package.json file with information|**isNotEmpty** (packageFile should not be empty)|-|-|
|`markdownFile`|Name of the markdown file in which to save|**isNotEmpty** (markdownFile should not be empty)|-|-|
|`folderWithMarkdownFilesToUse`|A folder of markdown files with instructions for using modules in NestJS and NestJS-mod applications (example of file names: /libs/reports/NESTJS_MOD_ALL_README_GENERATOR_USE_IN_NEST_JS.md, /libs/reports/NESTJS_MOD_ALL_README_GENERATOR_USE_IN_NEST_JS_MOD.md)|**optional**|-|-|
|`markdownHeader`|Custom header markdown string|**optional**|-|-|
|`markdownFooter`|Custom footer markdown string|**optional**|-|-|
|`telegramGroup`|Telegram group|**optional**|-|-|
|`discord`|Discord|**optional**|-|-|

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

[npm-image]: https://badgen.net/npm/v/@nestjs-mod/reports
[npm-url]: https://npmjs.org/package/@nestjs-mod/reports
[telegram-image]: https://img.shields.io/badge/group-telegram-blue.svg?maxAge=2592000
[telegram-url]: https://t.me/nestjs_mod
[discord-image]: https://img.shields.io/badge/discord-online-brightgreen.svg
[discord-url]: https://discord.gg/meY7UXaG
[downloads-image]: https://badgen.net/npm/dm/@nestjs-mod/reports
[downloads-url]: https://npmjs.org/package/@nestjs-mod/reports
