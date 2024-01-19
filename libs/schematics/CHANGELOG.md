# [2.0.0](https://github.com/nestjs-mod/nestjs-mod/compare/schematics-v1.2.0...schematics-v2.0.0) (2024-01-19)


### Features

* changed logic for detect env key name ([c51ddaf](https://github.com/nestjs-mod/nestjs-mod/commit/c51ddaf808f3cc11bcd66e69b95a39ce200f03e4))


### BREAKING CHANGES

* sample key correct for DotEnvPropertyNameFormatter = `PROJECT_NAME_CONTEXT_NAME_PROPERTY_NAME`.
Sample key if we use env for feature: `PROJECT_NAME_CONTEXT_NAME_FEATURE_NAME_PROPERTY_NAME`.
If we not set contextName, formatter try search key by `PROJECT_NAME_PROPERTY_NAME` or `PROJECT_NAME_FEATURE_NAME_PROPERTY_NAME`

# [1.2.0](https://github.com/nestjs-mod/nestjs-mod/compare/schematics-v1.1.3...schematics-v1.2.0) (2024-01-18)


### Features

* update detect default context name in formatter, add disableInfrastructureModulesInProduction ([fa6b4c9](https://github.com/nestjs-mod/nestjs-mod/commit/fa6b4c9d1962020f36c9f88e745bfbb64e25c9d4))

## [1.1.3](https://github.com/nestjs-mod/nestjs-mod/compare/schematics-v1.1.2...schematics-v1.1.3) (2024-01-18)


### Bug Fixes

* update script for run tests ([fb00684](https://github.com/nestjs-mod/nestjs-mod/commit/fb00684d63534af48069063048154dcf5d873b3b))

## [1.1.2](https://github.com/nestjs-mod/nestjs-mod/compare/schematics-v1.1.1...schematics-v1.1.2) (2024-01-18)


### Bug Fixes

* update main package json, for exclude root project ([2ca7401](https://github.com/nestjs-mod/nestjs-mod/commit/2ca7401336abd5ffd451775d0fb66254c0b6da33))

## [1.1.1](https://github.com/nestjs-mod/nestjs-mod/compare/schematics-v1.1.0...schematics-v1.1.1) (2024-01-18)


### Bug Fixes

* add peerDependenciesMeta ([aee0cbe](https://github.com/nestjs-mod/nestjs-mod/commit/aee0cbeec91462d2a5d967edcae04b89ed7b81b4))

# [1.1.0](https://github.com/nestjs-mod/nestjs-mod/compare/schematics-v1.0.2...schematics-v1.1.0) (2024-01-17)


### Features

* **schematics:** update [@nestjs-mod](https://github.com/nestjs-mod) versions from 1.7.2 to 1.9.0 ([63edf6d](https://github.com/nestjs-mod/nestjs-mod/commit/63edf6df86d4225256edb84a4ba44e36ebc0fc6f))

## [1.0.2](https://github.com/nestjs-mod/nestjs-mod/compare/schematics-v1.0.1...schematics-v1.0.2) (2024-01-17)


### Bug Fixes

* **schematics:** add new readme to generated application ([e4709fe](https://github.com/nestjs-mod/nestjs-mod/commit/e4709fe61e387ec5ff3be025ef4ad659357027cb))

## [1.0.1](https://github.com/nestjs-mod/nestjs-mod/compare/schematics-v1.0.0...schematics-v1.0.1) (2024-01-17)


### Bug Fixes

* updaet git ignore in schematics ([e39948b](https://github.com/nestjs-mod/nestjs-mod/commit/e39948b5a30f48025da9871b341f39ad12c0cfb2))

# 1.0.0 (2024-01-17)


### Bug Fixes

* **schematics:** tune @nestjs-mod/schematics generators for NestJS-mod ([0ca77b2](https://github.com/nestjs-mod/nestjs-mod/commit/0ca77b2e0913855da1dbfebc080e8f4822ef4b30))


### Features

* first commit ([d5fec78](https://github.com/nestjs-mod/nestjs-mod/commit/d5fec7888bf58d4a0d6fc249823523361b738d56))
* **reports:** add nestjs-mod-all-readme-generator and update code for it ([b43fff6](https://github.com/nestjs-mod/nestjs-mod/commit/b43fff651b3c5dd6a6bff7457bc42c91ee83f20e))
* **schematics:** add application schematic ([fbc3995](https://github.com/nestjs-mod/nestjs-mod/commit/fbc39950a52fe3d697f88bd3afcc6254921cf7c8))
* **schematics:** add library schematic ([9667276](https://github.com/nestjs-mod/nestjs-mod/commit/96672762b3afd177ce6dad2953f5326fbfa162b1))
