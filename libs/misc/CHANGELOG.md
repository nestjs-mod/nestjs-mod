## [1.4.3](https://github.com/nestjs-mod/nestjs-mod/compare/misc-v1.4.2...misc-v1.4.3) (2025-07-08)


### Bug Fixes

* add getHttpErrorResponseData ([651a3a4](https://github.com/nestjs-mod/nestjs-mod/commit/651a3a4117442a23feb0e42709d9958177a83a62))

## [1.4.2](https://github.com/nestjs-mod/nestjs-mod/compare/misc-v1.4.1...misc-v1.4.2) (2025-05-22)

### Bug Fixes

- added many different common utilities from fullstack and sso projects ([b70826c](https://github.com/nestjs-mod/nestjs-mod/commit/b70826c00d5e528cc3cb7a56292156394e8919b8))

## [1.4.1](https://github.com/nestjs-mod/nestjs-mod/compare/misc-v1.4.0...misc-v1.4.1) (2025-04-24)

### Bug Fixes

- change node isDeepStrictEqual to lodash isequal ([c4dd950](https://github.com/nestjs-mod/nestjs-mod/commit/c4dd950a5ac979d03b17d3d6d82f9cd29050749d))

# [1.4.0](https://github.com/nestjs-mod/nestjs-mod/compare/misc-v1.3.2...misc-v1.4.0) (2025-04-24)

### Features

- append new utils: compare, searchIn and ts utils MakeOptional ([5fbb50c](https://github.com/nestjs-mod/nestjs-mod/commit/5fbb50ca84fb5984c2b1795795f9c55fd7edc73f))

## [1.3.2](https://github.com/nestjs-mod/nestjs-mod/compare/misc-v1.3.1...misc-v1.3.2) (2025-01-22)

### Bug Fixes

- lock version of case-anything ([6603cc0](https://github.com/nestjs-mod/nestjs-mod/commit/6603cc0b793ecbd24d751d2a2dc809daab737841))

## [1.3.1](https://github.com/nestjs-mod/nestjs-mod/compare/misc-v1.3.0...misc-v1.3.1) (2025-01-06)

### Bug Fixes

- add empty command for migrator ([357397a](https://github.com/nestjs-mod/nestjs-mod/commit/357397a2ecdd74fcbc1cb2de8a6cd554ff1e368b))
- rename nx library from cli to nestjs-mod ([30333eb](https://github.com/nestjs-mod/nestjs-mod/commit/30333eb21a491cb66996af11b3740aa25675b2da))

# [1.3.0](https://github.com/nestjs-mod/nestjs-mod/compare/misc-v1.2.0...misc-v1.3.0) (2024-12-30)

### Features

- update versions of nx libraries to version 20.3.0 and fix all errors after it [skip integrations, skip contrib] ([9011173](https://github.com/nestjs-mod/nestjs-mod/commit/9011173fa6eafecc4ce580956bef6fac4613fa1a))

# [1.2.0](https://github.com/nestjs-mod/nestjs-mod/compare/misc-v1.1.2...misc-v1.2.0) (2024-09-19)

### Features

- update to nx@19.5.3 and nestjs@10.4.3 ([4979173](https://github.com/nestjs-mod/nestjs-mod/commit/4979173af1f53a277ae28ee64fb7379446bc0242))

## [1.1.2](https://github.com/nestjs-mod/nestjs-mod/compare/misc-v1.1.1...misc-v1.1.2) (2024-08-15)

### Bug Fixes

- update readmes ([0e02eb3](https://github.com/nestjs-mod/nestjs-mod/commit/0e02eb3235f036566cece2e4960ee2c4458ed545))

## [1.1.1](https://github.com/nestjs-mod/nestjs-mod/compare/misc-v1.1.0...misc-v1.1.1) (2024-07-29)

### Bug Fixes

- update all readme files, update schematic for correct create new nx project with version 19.5.3 [skip integrations, skip contrib] ([a5c73e8](https://github.com/nestjs-mod/nestjs-mod/commit/a5c73e83473592cee25cb12d89ed523fb0a6b7ed))

# [1.1.0](https://github.com/nestjs-mod/nestjs-mod/compare/misc-v1.0.0...misc-v1.1.0) (2024-07-27)

### Features

- npm run nx -- update && npx nx migrate --run-migrations ([f551f8a](https://github.com/nestjs-mod/nestjs-mod/commit/f551f8abe1f8cce299a5ced4d02f77a4ab2a6923))
- npm run update:lib-versions && npm run manual:prepare ([f73daec](https://github.com/nestjs-mod/nestjs-mod/commit/f73daec02869108296d5c2d6a26defefa31ef9ea))

# 1.0.0 (2024-02-26)

### Bug Fixes

- **schematics:** tune @nestjs-mod/schematics generators for NestJS-mod ([0ca77b2](https://github.com/nestjs-mod/nestjs-mod/commit/0ca77b2e0913855da1dbfebc080e8f4822ef4b30))
- updaet git ignore in schematics ([e39948b](https://github.com/nestjs-mod/nestjs-mod/commit/e39948b5a30f48025da9871b341f39ad12c0cfb2))
- update logic for addRunCommands to project.json, remove empty feature sections from report ([6b10f7f](https://github.com/nestjs-mod/nestjs-mod/commit/6b10f7f22186255698ae7b230c484956f03cbd34))

### Features

- add @nestjs-mod/fastify ([9441c63](https://github.com/nestjs-mod/nestjs-mod/commit/9441c6314a3b3d04160cfa7d53eccd5c7f05e79a))
- add misc libs with functions and helpers used in NestJS mod modules ([25e361c](https://github.com/nestjs-mod/nestjs-mod/commit/25e361c3c469704fda38d86719f6c6e01c764453))
- add TcpNestMicroservice in @nestjs-mod/microservices ([852d29a](https://github.com/nestjs-mod/nestjs-mod/commit/852d29ad7ebbf9f8c61fc2ee45bd285b7cff84fb))
- first commit ([d5fec78](https://github.com/nestjs-mod/nestjs-mod/commit/d5fec7888bf58d4a0d6fc249823523361b738d56))
- remove all async work with fs, add enableShutdownHooks, globalPrefix, autoCloseInInfrastructureMode and logApplicationStart inside DefaultNestApplicationListener, add contextName to TLinkOptions, change work with update options for nested modules from root, share feature module when we use forFeature ([0a52d10](https://github.com/nestjs-mod/nestjs-mod/commit/0a52d10b62eaeadcb4c308edbfb49ec7c5b910f3))
- **reports:** add nestjs-mod-all-readme-generator and update code for it ([b43fff6](https://github.com/nestjs-mod/nestjs-mod/commit/b43fff651b3c5dd6a6bff7457bc42c91ee83f20e))
