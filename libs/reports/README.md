
# @nestjs-mod/reports

Modules and utilities for generating reports on infrastructure and features.

[![NPM version][npm-image]][npm-url] [![monthly downloads][downloads-image]][downloads-url] [![Telegram bot][telegram-image]][telegram-url]

## Installation

```bash
npm i --save @nestjs-mod/reports
```



## Modules

| Link | Category | Description |
| ---- | -------- | ----------- |
| [NestjsModAllReadmeGenerator](#nestjsmodallreadmegenerator) | infrastructure | Readme generator for nestjs-mod project. |
| [RestInfrastructureHtmlReport](#restinfrastructurehtmlreport) | infrastructure | Rest infrastructure HTML-report |



## Modules descriptions

### NestjsModAllReadmeGenerator
Readme generator for nestjs-mod project.

#### Static configuration


| Key    | Description | Constraints | Default | Value |
| ------ | ----------- | ----------- | ------- | ----- |
|`utilsFolders`|Folders with utilities|**isNotEmpty** (utilsFolders should not be empty)|-|-|
|`modules`|Folders with modules|**isNotEmpty** (modules should not be empty)|-|-|
|`packageFile`|Name of the package.json file with information|**isNotEmpty** (packageFile should not be empty)|-|-|
|`markdownFile`|Name of the markdown file in which to save|**isNotEmpty** (markdownFile should not be empty)|-|-|
|`telegramGroup`|Telegram group|**optional**|-|-|

[Back to Top](#modules)

---
### RestInfrastructureHtmlReport
Rest infrastructure HTML-report

[Back to Top](#modules)

## License

MIT

[npm-image]: https://badgen.net/npm/v/@nestjs-mod/reports
[npm-url]: https://npmjs.org/package/@nestjs-mod/reports
[telegram-image]: https://img.shields.io/badge/group-telegram-blue.svg?maxAge=2592000
[telegram-url]: https://t.me/nestjs_mod
[downloads-image]: https://badgen.net/npm/dm/@nestjs-mod/reports
[downloads-url]: https://npmjs.org/package/@nestjs-mod/reports
