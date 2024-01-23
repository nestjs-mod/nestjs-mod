# [2.5.0](https://github.com/nestjs-mod/nestjs-mod/compare/common-v2.4.1...common-v2.5.0) (2024-01-23)


### Features

*  add full disable infrastructure modules in production, fix many errors ([8797115](https://github.com/nestjs-mod/nestjs-mod/commit/8797115ee98710e9c1d6ec353294a7a68211b9c6))

## [2.4.1](https://github.com/nestjs-mod/nestjs-mod/compare/common-v2.4.0...common-v2.4.1) (2024-01-22)


### Bug Fixes

* full disable load infrastructure section of application in isInfrastructureMode ([d4d4f02](https://github.com/nestjs-mod/nestjs-mod/commit/d4d4f02a895d0d370cd152252b450af5e933e685))

# [2.4.0](https://github.com/nestjs-mod/nestjs-mod/compare/common-v2.3.1...common-v2.4.0) (2024-01-21)


### Bug Fixes

* update read and write logic with envs in DotEnvService ([174f865](https://github.com/nestjs-mod/nestjs-mod/commit/174f86598e61796f160a5b65b0a51ba5a5d6e534))


### Features

* add NxProjectJsonService for work with nx project.json-file to project-utils ([7f8bdbc](https://github.com/nestjs-mod/nestjs-mod/commit/7f8bdbcb49563550a1c512e1b5e8d58614df901c))

## [2.3.1](https://github.com/nestjs-mod/nestjs-mod/compare/common-v2.3.0...common-v2.3.1) (2024-01-21)


### Bug Fixes

* add ignore exists env in example file ([7a227a8](https://github.com/nestjs-mod/nestjs-mod/commit/7a227a8182ee8b485b2e49afa55077ce2b5eddd9))

# [2.3.0](https://github.com/nestjs-mod/nestjs-mod/compare/common-v2.2.0...common-v2.3.0) (2024-01-21)


### Features

* add GitignoreService to project-utils, add all need options to DefaultNestApplicationInitializer, add generate example.env file and add .env file to .gitignore ([33fb0a1](https://github.com/nestjs-mod/nestjs-mod/commit/33fb0a10e04ab89d22c567d7dd523ad1be71ec4d))

# [2.2.0](https://github.com/nestjs-mod/nestjs-mod/compare/common-v2.1.0...common-v2.2.0) (2024-01-20)


### Features

* check and update all logic for work with project options in nestModules and application, add normal class name for dynamic modules ([f0c1aca](https://github.com/nestjs-mod/nestjs-mod/commit/f0c1aca1828be667695aa6173690a911818e8f77))

# [2.1.0](https://github.com/nestjs-mod/nestjs-mod/compare/common-v2.0.2...common-v2.1.0) (2024-01-19)


### Features

* add support pathNestModuleMetadata for forFeatureModules ([492e685](https://github.com/nestjs-mod/nestjs-mod/commit/492e6854e835d90bf287c186f49b9f540297f295))

## [2.0.2](https://github.com/nestjs-mod/nestjs-mod/compare/common-v2.0.1...common-v2.0.2) (2024-01-19)


### Bug Fixes

* disable errors in ProjectUtilsPatcherService if version of common module is incorrect ([d2b0583](https://github.com/nestjs-mod/nestjs-mod/commit/d2b058393d8dc7f1019c53083ac07c09423e864b))

## [2.0.1](https://github.com/nestjs-mod/nestjs-mod/compare/common-v2.0.0...common-v2.0.1) (2024-01-19)


### Bug Fixes

* **reports:** update logic safeValue in InfrastructureMarkdownReportGenerator ([630d7c9](https://github.com/nestjs-mod/nestjs-mod/commit/630d7c9a7dff593ec2e926eaed06a3ba0b4e30c3))

# [2.0.0](https://github.com/nestjs-mod/nestjs-mod/compare/common-v1.10.0...common-v2.0.0) (2024-01-19)


### Features

* changed logic for detect env key name ([c51ddaf](https://github.com/nestjs-mod/nestjs-mod/commit/c51ddaf808f3cc11bcd66e69b95a39ce200f03e4))


### BREAKING CHANGES

* sample key correct for DotEnvPropertyNameFormatter = `PROJECT_NAME_CONTEXT_NAME_PROPERTY_NAME`.
Sample key if we use env for feature: `PROJECT_NAME_CONTEXT_NAME_FEATURE_NAME_PROPERTY_NAME`.
If we not set contextName, formatter try search key by `PROJECT_NAME_PROPERTY_NAME` or `PROJECT_NAME_FEATURE_NAME_PROPERTY_NAME`

# [1.10.0](https://github.com/nestjs-mod/nestjs-mod/compare/common-v1.9.2...common-v1.10.0) (2024-01-18)


### Features

* update detect default context name in formatter, add disableInfrastructureModulesInProduction ([fa6b4c9](https://github.com/nestjs-mod/nestjs-mod/commit/fa6b4c9d1962020f36c9f88e745bfbb64e25c9d4))

## [1.9.2](https://github.com/nestjs-mod/nestjs-mod/compare/common-v1.9.1...common-v1.9.2) (2024-01-18)


### Bug Fixes

* add peerDependenciesMeta ([aee0cbe](https://github.com/nestjs-mod/nestjs-mod/commit/aee0cbeec91462d2a5d967edcae04b89ed7b81b4))

## [1.9.1](https://github.com/nestjs-mod/nestjs-mod/compare/common-v1.9.0...common-v1.9.1) (2024-01-17)


### Bug Fixes

* **reports:** remove not needed title ([ecfa43d](https://github.com/nestjs-mod/nestjs-mod/commit/ecfa43db840727d6560d8ed77a71493dfab86830))

# [1.9.0](https://github.com/nestjs-mod/nestjs-mod/compare/common-v1.8.0...common-v1.9.0) (2024-01-17)


### Features

* add featureEnvironments and InjectFeatureEnvironments, InjectAllFeatureEnvironments ([c46c9b5](https://github.com/nestjs-mod/nestjs-mod/commit/c46c9b5de0b3a853432246fdc88edeec2015c3c7))

# [1.8.0](https://github.com/nestjs-mod/nestjs-mod/compare/common-v1.7.2...common-v1.8.0) (2024-01-17)


### Bug Fixes

* remove preWrapApplication, postWrapApplication, wrapApplication from feature internal module ([ad58cd7](https://github.com/nestjs-mod/nestjs-mod/commit/ad58cd72b95a96c7e052bfc47f877c1c45489aaf))


### Features

* **nest-module:** add InjectAllFeatures to get all features from module ([60de7e7](https://github.com/nestjs-mod/nestjs-mod/commit/60de7e76edd8b712c82d83d74271a749acebba86))

## [1.7.2](https://github.com/nestjs-mod/nestjs-mod/compare/common-v1.7.1...common-v1.7.2) (2024-01-17)


### Bug Fixes

* updaet git ignore in schematics ([e39948b](https://github.com/nestjs-mod/nestjs-mod/commit/e39948b5a30f48025da9871b341f39ad12c0cfb2))

## [1.7.1](https://github.com/nestjs-mod/nestjs-mod/compare/common-v1.7.0...common-v1.7.1) (2024-01-17)


### Bug Fixes

* **schematics:** tune @nestjs-mod/schematics generators for NestJS-mod ([0ca77b2](https://github.com/nestjs-mod/nestjs-mod/commit/0ca77b2e0913855da1dbfebc080e8f4822ef4b30))

# [1.7.0](https://github.com/nestjs-mod/nestjs-mod/compare/common-v1.6.1...common-v1.7.0) (2024-01-16)


### Features

* add ProjectUtils module and many small fix ([8069aec](https://github.com/nestjs-mod/nestjs-mod/commit/8069aec70e8109ddac6632db08ebd9da23c6e802))

## [1.6.1](https://github.com/nestjs-mod/nestjs-mod/compare/common-v1.6.0...common-v1.6.1) (2024-01-15)


### Bug Fixes

* **reports:** hide empty settings from report ([ea005e6](https://github.com/nestjs-mod/nestjs-mod/commit/ea005e69bab8960b065e5cec6463e3105c38fdb8))

# [1.6.0](https://github.com/nestjs-mod/nestjs-mod/compare/common-v1.5.4...common-v1.6.0) (2024-01-15)


### Bug Fixes

* ignore port and hostname on start nest application in "init" mode ([f27e042](https://github.com/nestjs-mod/nestjs-mod/commit/f27e042e0abf2c255a9013204a5e3f8e07afbca7))


### Features

* **reports:** add skipEmptySettings to DynamicNestModuleMetadataMarkdownReportGenerator ([d51aad4](https://github.com/nestjs-mod/nestjs-mod/commit/d51aad4b578e1eb71a4d0568e86d494315570d92))

## [1.5.4](https://github.com/nestjs-mod/nestjs-mod/compare/common-v1.5.3...common-v1.5.4) (2024-01-12)


### Bug Fixes

* update logic for generate metadata for reports, add featureModuleName to forFeature methods ([baf0856](https://github.com/nestjs-mod/nestjs-mod/commit/baf0856fe2a3a5cad45e4897748686d9f206227f))

## [1.5.3](https://github.com/nestjs-mod/nestjs-mod/compare/common-v1.5.2...common-v1.5.3) (2024-01-11)


### Bug Fixes

* add sharedImports ([bc320ec](https://github.com/nestjs-mod/nestjs-mod/commit/bc320ec9b5736cd3de0db9f9e7601f124aab6c71))

## [1.5.2](https://github.com/nestjs-mod/nestjs-mod/compare/common-v1.5.1...common-v1.5.2) (2024-01-11)


### Bug Fixes

* update types for forRoot ([11c8b8d](https://github.com/nestjs-mod/nestjs-mod/commit/11c8b8d4cecd073d74abd1c7366396ddbbb11aa0))

## [1.5.1](https://github.com/nestjs-mod/nestjs-mod/compare/common-v1.5.0...common-v1.5.1) (2024-01-11)


### Bug Fixes

* update types for forRoot ([3612cb8](https://github.com/nestjs-mod/nestjs-mod/commit/3612cb8bbff730cce0989be4f24bbc8529d166fb))
* update types for TLinkOptions ([73ca726](https://github.com/nestjs-mod/nestjs-mod/commit/73ca72691a3f6d8f8b7b74e4a87d1b1d661975cc))

# [1.5.0](https://github.com/nestjs-mod/nestjs-mod/compare/common-v1.4.0...common-v1.5.0) (2024-01-11)


### Features

* add asyncModuleOptions for forFeature, add TLinkOptions to imports in module options ([abec61c](https://github.com/nestjs-mod/nestjs-mod/commit/abec61cecf9f3120a7e7efeac0697db3fdb7e664))

# [1.4.0](https://github.com/nestjs-mod/nestjs-mod/compare/common-v1.3.0...common-v1.4.0) (2024-01-11)


### Features

* add default options to ConfigModelPropertyOptions and EnvModelPropertyOptions ([7656981](https://github.com/nestjs-mod/nestjs-mod/commit/7656981f2bc73184c2c23bcad33711dc13ce2906))

# [1.3.0](https://github.com/nestjs-mod/nestjs-mod/compare/common-v1.2.0...common-v1.3.0) (2024-01-10)


### Features

* add configurationStream ([d7a8d0e](https://github.com/nestjs-mod/nestjs-mod/commit/d7a8d0ec10ff28bb0516d388d5b5e7ad48da2656))

# [1.2.0](https://github.com/nestjs-mod/nestjs-mod/compare/common-v1.1.0...common-v1.2.0) (2024-01-09)


### Bug Fixes

* add sort and update format of markdown reports, add CLEAR_WORDS in DotEnvPropertyNameFormatter ([8a660ca](https://github.com/nestjs-mod/nestjs-mod/commit/8a660ca0fac1bb31c4e7ec84cd127a0822950364))
* **common:** add isProductionMode ([9cfe997](https://github.com/nestjs-mod/nestjs-mod/commit/9cfe9978008f8f313565457de2770aa38bb45e67))


### Features

* add globalEnvironmentsOptions and globalConfigurationOptions ([f3bc30a](https://github.com/nestjs-mod/nestjs-mod/commit/f3bc30aeb6eff40d66b6dc477b694c3632d13dad))
* rename name to contextName ([c0c3849](https://github.com/nestjs-mod/nestjs-mod/commit/c0c3849da258753ceaa16a709dd32e6a0eea6afd))

# [1.1.0](https://github.com/nestjs-mod/nestjs-mod/compare/common-v1.0.0...common-v1.1.0) (2024-01-08)


### Features

* **reports:** add nestjs-mod-all-readme-generator and update code for it ([b43fff6](https://github.com/nestjs-mod/nestjs-mod/commit/b43fff651b3c5dd6a6bff7457bc42c91ee83f20e))

# 1.0.0 (2024-01-07)

### Features

- first commit ([d5fec78](https://github.com/nestjs-mod/nestjs-mod/commit/d5fec7888bf58d4a0d6fc249823523361b738d56))
