## [1.7.4](https://github.com/nestjs-mod/nestjs-mod/compare/microservices-v1.7.3...microservices-v1.7.4) (2024-12-09)


### Bug Fixes

* add support work with WS in getRequestFromExecutionContext ([245344f](https://github.com/nestjs-mod/nestjs-mod/commit/245344fa084062d2ffdd60d7ac82fa62790801e1))

## [1.7.3](https://github.com/nestjs-mod/nestjs-mod/compare/microservices-v1.7.2...microservices-v1.7.3) (2024-11-03)


### Bug Fixes

* add default empty object value to asyncModuleOptions in forXXXAsync ([6378228](https://github.com/nestjs-mod/nestjs-mod/commit/6378228c56ac127ae01d2dae501d64af95a03362))

## [1.7.2](https://github.com/nestjs-mod/nestjs-mod/compare/microservices-v1.7.1...microservices-v1.7.2) (2024-09-27)


### Bug Fixes

* update for correct work staticEnvironmentsModel without staticConfigurationModel ([64c29e9](https://github.com/nestjs-mod/nestjs-mod/commit/64c29e9ca2e0631ac8947a8185fbb84e1f12e04b))

## [1.7.1](https://github.com/nestjs-mod/nestjs-mod/compare/microservices-v1.7.0...microservices-v1.7.1) (2024-09-27)


### Bug Fixes

* update for correct with false value in env config ([7cfbb42](https://github.com/nestjs-mod/nestjs-mod/commit/7cfbb42563b75af66115416315fc3cfc74afca67))

# [1.7.0](https://github.com/nestjs-mod/nestjs-mod/compare/microservices-v1.6.0...microservices-v1.7.0) (2024-09-22)


### Features

* add support custom nx project file ([f9f6e41](https://github.com/nestjs-mod/nestjs-mod/commit/f9f6e410f43dde56f28c45e3d4d3d9a74934af28))

# [1.6.0](https://github.com/nestjs-mod/nestjs-mod/compare/microservices-v1.5.2...microservices-v1.6.0) (2024-09-19)


### Features

* update to nx@19.5.3 and nestjs@10.4.3 ([4979173](https://github.com/nestjs-mod/nestjs-mod/commit/4979173af1f53a277ae28ee64fb7379446bc0242))

## [1.5.2](https://github.com/nestjs-mod/nestjs-mod/compare/microservices-v1.5.1...microservices-v1.5.2) (2024-08-15)


### Bug Fixes

* update readmes ([0e02eb3](https://github.com/nestjs-mod/nestjs-mod/commit/0e02eb3235f036566cece2e4960ee2c4458ed545))

## [1.5.1](https://github.com/nestjs-mod/nestjs-mod/compare/microservices-v1.5.0...microservices-v1.5.1) (2024-07-29)


### Bug Fixes

* update all readme files, update schematic for correct create new nx project with version 19.5.3 [skip integrations, skip contrib] ([a5c73e8](https://github.com/nestjs-mod/nestjs-mod/commit/a5c73e83473592cee25cb12d89ed523fb0a6b7ed))

# [1.5.0](https://github.com/nestjs-mod/nestjs-mod/compare/microservices-v1.4.4...microservices-v1.5.0) (2024-07-27)


### Features

* npm run nx -- update && npx nx migrate --run-migrations ([f551f8a](https://github.com/nestjs-mod/nestjs-mod/commit/f551f8abe1f8cce299a5ced4d02f77a4ab2a6923))
* npm run update:lib-versions && npm run manual:prepare ([f73daec](https://github.com/nestjs-mod/nestjs-mod/commit/f73daec02869108296d5c2d6a26defefa31ef9ea))

## [1.4.4](https://github.com/nestjs-mod/nestjs-mod/compare/microservices-v1.4.3...microservices-v1.4.4) (2024-05-04)


### Bug Fixes

* remove ProjectUtilsEnvironments ([f873c48](https://github.com/nestjs-mod/nestjs-mod/commit/f873c4851dbb5d1a9d8248d116438142a5d1eafc))

## [1.4.3](https://github.com/nestjs-mod/nestjs-mod/compare/microservices-v1.4.2...microservices-v1.4.3) (2024-05-03)


### Bug Fixes

* exclude correct properties from validation errors [skip integrations, skip contrib] ([57ecb85](https://github.com/nestjs-mod/nestjs-mod/commit/57ecb8598984f6ef6d4e65251612fbf206b103d1))

## [1.4.2](https://github.com/nestjs-mod/nestjs-mod/compare/microservices-v1.4.1...microservices-v1.4.2) (2024-05-03)


### Bug Fixes

* change log type on validation errors from debug to error, disable set debug=true when we use ProjectUtilsPatcherService [skip integrations, skip contrib] ([fbf901a](https://github.com/nestjs-mod/nestjs-mod/commit/fbf901a869fcc60bc90ea254a8075a116dfe7034))

## [1.4.1](https://github.com/nestjs-mod/nestjs-mod/compare/microservices-v1.4.0...microservices-v1.4.1) (2024-05-03)


### Bug Fixes

* always show debug info if we catch validations errors in env and config models, and show only invalid properties [skip integrations, skip contrib] ([06a263c](https://github.com/nestjs-mod/nestjs-mod/commit/06a263cf524a38e27a00b6c3ad6b7842ace80480))
* hide all ProjectUtilsEnvironments keys from env file generator logics ([7f832c3](https://github.com/nestjs-mod/nestjs-mod/commit/7f832c38158e171cea44626055d4b2d4bc859881))

# [1.4.0](https://github.com/nestjs-mod/nestjs-mod/compare/microservices-v1.3.10...microservices-v1.4.0) (2024-05-03)


### Features

* disable write any files from nestjs-mod libs if we not in infrastructure mode, add options to env and config models - hideValueFromOutputs, add ProjectUtilsEnvironments and move in some options from ProjectUtilsConfiguration [skip contrib] ([c1ff732](https://github.com/nestjs-mod/nestjs-mod/commit/c1ff7323f47b68e1bd5dd4e48ace8af91b9cd052))

## [1.3.10](https://github.com/nestjs-mod/nestjs-mod/compare/microservices-v1.3.9...microservices-v1.3.10) (2024-05-03)


### Bug Fixes

* full exclude infrastructure section if we run application without NESTJS_MODE=infrastructure ([298f03a](https://github.com/nestjs-mod/nestjs-mod/commit/298f03ae73601b2af4a44c2050df799652472e87))

## [1.3.9](https://github.com/nestjs-mod/nestjs-mod/compare/microservices-v1.3.8...microservices-v1.3.9) (2024-04-09)


### Bug Fixes

* add prepareHeaders function for convert header names to lower case ([e613f72](https://github.com/nestjs-mod/nestjs-mod/commit/e613f72492c4a1d6586ee362ae13e1a950a465b3))

## [1.3.8](https://github.com/nestjs-mod/nestjs-mod/compare/microservices-v1.3.7...microservices-v1.3.8) (2024-03-07)


### Bug Fixes

* remove apply default value for env if it not exists (replace "value_for_XXX" to empty string '') ([4093fbd](https://github.com/nestjs-mod/nestjs-mod/commit/4093fbda49372b30b51800e48dfdeceeccff0151))

## [1.3.7](https://github.com/nestjs-mod/nestjs-mod/compare/microservices-v1.3.6...microservices-v1.3.7) (2024-03-06)


### Bug Fixes

* show function name if default value of config property is function ([b887920](https://github.com/nestjs-mod/nestjs-mod/commit/b887920522aec1163eb362ee99fc123d199aa8ad))

## [1.3.6](https://github.com/nestjs-mod/nestjs-mod/compare/microservices-v1.3.5...microservices-v1.3.6) (2024-03-04)


### Bug Fixes

* add check exists searchCommand in current commands before add ([603f1bc](https://github.com/nestjs-mod/nestjs-mod/commit/603f1bcd340fdaa7845f07f3c0103270d8c62207))

## [1.3.5](https://github.com/nestjs-mod/nestjs-mod/compare/microservices-v1.3.4...microservices-v1.3.5) (2024-03-02)


### Bug Fixes

* add filePath as second argument to prepare function in getEnvironmentsFromFilesCheckSum ([6f371eb](https://github.com/nestjs-mod/nestjs-mod/commit/6f371eb08e90e4e0fc9e80f191c706d5a381f0f7))

## [1.3.4](https://github.com/nestjs-mod/nestjs-mod/compare/microservices-v1.3.3...microservices-v1.3.4) (2024-03-01)


### Bug Fixes

* add support multi glob to filesCheckSumToEnvironments option in ProjectUtilsConfiguration ([b91dd1a](https://github.com/nestjs-mod/nestjs-mod/commit/b91dd1ab639972050c89a89aa2ed55b79532ff80))

## [1.3.3](https://github.com/nestjs-mod/nestjs-mod/compare/microservices-v1.3.2...microservices-v1.3.3) (2024-02-28)


### Bug Fixes

* add write checksum info for any dotenv file ([21a3bc0](https://github.com/nestjs-mod/nestjs-mod/commit/21a3bc07badd0cc8ca1c96cd2b4ee93ac85928f7))

## [1.3.2](https://github.com/nestjs-mod/nestjs-mod/compare/microservices-v1.3.1...microservices-v1.3.2) (2024-02-28)


### Bug Fixes

* add support correct order on write env key values ([6302eb1](https://github.com/nestjs-mod/nestjs-mod/commit/6302eb122c25be5d7f18cc6b4cefc8c3c82dab53))

## [1.3.1](https://github.com/nestjs-mod/nestjs-mod/compare/microservices-v1.3.0...microservices-v1.3.1) (2024-02-28)


### Bug Fixes

* update logic for getEnvironmentsFromFilesCheckSum, ignore filepath from calculate checksum ([7eef191](https://github.com/nestjs-mod/nestjs-mod/commit/7eef19146c4f824c0efe181ff671d9cffcdf34e9))

# [1.3.0](https://github.com/nestjs-mod/nestjs-mod/compare/microservices-v1.2.2...microservices-v1.3.0) (2024-02-28)


### Bug Fixes

* add autoCloseTimeoutInInfrastructureMode options to app listeners ([0a4a371](https://github.com/nestjs-mod/nestjs-mod/commit/0a4a371febf43148d47f933637465391264fe89a))
* add boolean and string transformers for env model properties ([7654d9f](https://github.com/nestjs-mod/nestjs-mod/commit/7654d9f4d646ee70e992e92b34532787e430e9d7))
* add pretty style mode when we generate reports, now we exclude all descriptions text and columns with default values ([ae5ec0b](https://github.com/nestjs-mod/nestjs-mod/commit/ae5ec0bba803183dc3f6fb1d981170f98af8313c))


### Features

* add options to project-utils for add checksum of some files in env file (example: https://github.com/nestjs-mod/nestjs-mod/blob/master/libs/common/src/lib/modules/system/project-utils/project-utils.module.spec.ts-2-test.env) ([54825b7](https://github.com/nestjs-mod/nestjs-mod/commit/54825b75cce1efd527f199ea5f65ce5ee64714ba))

## [1.2.2](https://github.com/nestjs-mod/nestjs-mod/compare/microservices-v1.2.1...microservices-v1.2.2) (2024-02-26)


### Bug Fixes

* update helpers and add depricate title ([a81c61b](https://github.com/nestjs-mod/nestjs-mod/commit/a81c61b1af979080988cbc02a0b02d8e7973bc5c))

## [1.2.1](https://github.com/nestjs-mod/nestjs-mod/compare/microservices-v1.2.0...microservices-v1.2.1) (2024-02-19)


### Bug Fixes

* add correct options types when we call forRoot, forRootAsync, forFeature, forFeatureAsync ([270f7ff](https://github.com/nestjs-mod/nestjs-mod/commit/270f7fff408b8ac10560c4f4fa69e07ccac3aba4))

# [1.2.0](https://github.com/nestjs-mod/nestjs-mod/compare/microservices-v1.1.0...microservices-v1.2.0) (2024-02-17)


### Features

* add clients for all nestjs microservice modules ([6cbd90a](https://github.com/nestjs-mod/nestjs-mod/commit/6cbd90a782610540af2724b0bce10ab591c39b2a))
* add detect headers for rpc request, but it not work :(, add silent mode for disable start microservice ([de57558](https://github.com/nestjs-mod/nestjs-mod/commit/de57558510f37b815060251a63d194329e620cb0))

# [1.1.0](https://github.com/nestjs-mod/nestjs-mod/compare/microservices-v1.0.0...microservices-v1.1.0) (2024-02-14)


### Features

* add support grpc, kafka, mqtt, nats, redis and rmq in @nestjs-mod/microservices ([14271a7](https://github.com/nestjs-mod/nestjs-mod/commit/14271a70419ff51487ec83a658cdefcaf037bb40))

# 1.0.0 (2024-02-14)


### Bug Fixes

* add create directory when we try create or update some files from infrastructure logic ([d613800](https://github.com/nestjs-mod/nestjs-mod/commit/d613800dc7e3042e52470da8ffecde2b348c0591))
* add forceCloseConnections to DefaultNestApplicationInitializerConfig, remove autoCloseInInfrastructureMode from NestApplicationListenerEnvironments ([90aecc1](https://github.com/nestjs-mod/nestjs-mod/commit/90aecc173f79fa954298fb8e63f83107248fa9d5))
* add ignore exists env in example file ([7a227a8](https://github.com/nestjs-mod/nestjs-mod/commit/7a227a8182ee8b485b2e49afa55077ce2b5eddd9))
* add new scripts categories for use in generate, disable cors by default in DefaultNestApplicationInitializer ([4e8e58b](https://github.com/nestjs-mod/nestjs-mod/commit/4e8e58bb299bd52b0b2a7698705c6f6b2ed07edb))
* add peerDependenciesMeta ([aee0cbe](https://github.com/nestjs-mod/nestjs-mod/commit/aee0cbeec91462d2a5d967edcae04b89ed7b81b4))
* add sharedImports ([bc320ec](https://github.com/nestjs-mod/nestjs-mod/commit/bc320ec9b5736cd3de0db9f9e7601f124aab6c71))
* add sort and update format of markdown reports, add CLEAR_WORDS in DotEnvPropertyNameFormatter ([8a660ca](https://github.com/nestjs-mod/nestjs-mod/commit/8a660ca0fac1bb31c4e7ec84cd127a0822950364))
* add support work with microservices, now port options is optional ([012ee0d](https://github.com/nestjs-mod/nestjs-mod/commit/012ee0d385434d784a95317c95e6577387d5f6ea))
* **common:** add isProductionMode ([9cfe997](https://github.com/nestjs-mod/nestjs-mod/commit/9cfe9978008f8f313565457de2770aa38bb45e67))
* disable errors in ProjectUtilsPatcherService if version of common module is incorrect ([d2b0583](https://github.com/nestjs-mod/nestjs-mod/commit/d2b058393d8dc7f1019c53083ac07c09423e864b))
* full disable load infrastructure section of application in isInfrastructureMode ([d4d4f02](https://github.com/nestjs-mod/nestjs-mod/commit/d4d4f02a895d0d370cd152252b450af5e933e685))
* ignore port and hostname on start nest application in "init" mode ([f27e042](https://github.com/nestjs-mod/nestjs-mod/commit/f27e042e0abf2c255a9013204a5e3f8e07afbca7))
* remove preWrapApplication, postWrapApplication, wrapApplication from feature internal module ([ad58cd7](https://github.com/nestjs-mod/nestjs-mod/commit/ad58cd72b95a96c7e052bfc47f877c1c45489aaf))
* **reports:** hide empty settings from report ([ea005e6](https://github.com/nestjs-mod/nestjs-mod/commit/ea005e69bab8960b065e5cec6463e3105c38fdb8))
* **reports:** remove not needed title ([ecfa43d](https://github.com/nestjs-mod/nestjs-mod/commit/ecfa43db840727d6560d8ed77a71493dfab86830))
* **reports:** update logic safeValue in InfrastructureMarkdownReportGenerator ([630d7c9](https://github.com/nestjs-mod/nestjs-mod/commit/630d7c9a7dff593ec2e926eaed06a3ba0b4e30c3))
* **schematics:** tune @nestjs-mod/schematics generators for NestJS-mod ([0ca77b2](https://github.com/nestjs-mod/nestjs-mod/commit/0ca77b2e0913855da1dbfebc080e8f4822ef4b30))
* updaet git ignore in schematics ([e39948b](https://github.com/nestjs-mod/nestjs-mod/commit/e39948b5a30f48025da9871b341f39ad12c0cfb2))
* update code for run pathNestModuleMetadata to root modules ([c2889ba](https://github.com/nestjs-mod/nestjs-mod/commit/c2889ba017510ad5d8398793c0a0970cd2d153ef))
* update code for run pathNestModuleMetadata to root modules ([85bcf42](https://github.com/nestjs-mod/nestjs-mod/commit/85bcf420f133577655c8a8fa19c5ec83ec5e09ae))
* update logic for addRunCommands to project.json, remove empty feature sections from report ([6b10f7f](https://github.com/nestjs-mod/nestjs-mod/commit/6b10f7f22186255698ae7b230c484956f03cbd34))
* update logic for generate metadata for reports, add featureModuleName to forFeature methods ([baf0856](https://github.com/nestjs-mod/nestjs-mod/commit/baf0856fe2a3a5cad45e4897748686d9f206227f))
* update logic for generate package json scripts, add order for categories ([bb95cf5](https://github.com/nestjs-mod/nestjs-mod/commit/bb95cf56b668f65c7876bce89bead99186bb61e4))
* update read and write logic with envs in DotEnvService ([174f865](https://github.com/nestjs-mod/nestjs-mod/commit/174f86598e61796f160a5b65b0a51ba5a5d6e534))
* update readme ([851f5d0](https://github.com/nestjs-mod/nestjs-mod/commit/851f5d0f2f7b96449b604489e31f8c5e3149c02b))
* update readme and configuration for tcp microservice module ([9d02422](https://github.com/nestjs-mod/nestjs-mod/commit/9d02422b0bb86c9fccac4d2f20de796b5061f3d6))
* update types for forRoot ([11c8b8d](https://github.com/nestjs-mod/nestjs-mod/commit/11c8b8d4cecd073d74abd1c7366396ddbbb11aa0))
* update types for forRoot ([3612cb8](https://github.com/nestjs-mod/nestjs-mod/commit/3612cb8bbff730cce0989be4f24bbc8529d166fb))
* update types for TLinkOptions ([73ca726](https://github.com/nestjs-mod/nestjs-mod/commit/73ca72691a3f6d8f8b7b74e4a87d1b1d661975cc))


### Features

*  add full disable infrastructure modules in production, fix many errors ([8797115](https://github.com/nestjs-mod/nestjs-mod/commit/8797115ee98710e9c1d6ec353294a7a68211b9c6))
* add @nestjs-mod/fastify ([9441c63](https://github.com/nestjs-mod/nestjs-mod/commit/9441c6314a3b3d04160cfa7d53eccd5c7f05e79a))
* add asyncModuleOptions for forFeature, add TLinkOptions to imports in module options ([abec61c](https://github.com/nestjs-mod/nestjs-mod/commit/abec61cecf9f3120a7e7efeac0697db3fdb7e664))
* add configurationStream ([d7a8d0e](https://github.com/nestjs-mod/nestjs-mod/commit/d7a8d0ec10ff28bb0516d388d5b5e7ad48da2656))
* add default options to ConfigModelPropertyOptions and EnvModelPropertyOptions ([7656981](https://github.com/nestjs-mod/nestjs-mod/commit/7656981f2bc73184c2c23bcad33711dc13ce2906))
* add featureEnvironments and InjectFeatureEnvironments, InjectAllFeatureEnvironments ([c46c9b5](https://github.com/nestjs-mod/nestjs-mod/commit/c46c9b5de0b3a853432246fdc88edeec2015c3c7))
* add GitignoreService to project-utils, add all need options to DefaultNestApplicationInitializer, add generate example.env file and add .env file to .gitignore ([33fb0a1](https://github.com/nestjs-mod/nestjs-mod/commit/33fb0a10e04ab89d22c567d7dd523ad1be71ec4d))
* add globalEnvironmentsOptions and globalConfigurationOptions ([f3bc30a](https://github.com/nestjs-mod/nestjs-mod/commit/f3bc30aeb6eff40d66b6dc477b694c3632d13dad))
* add NxProjectJsonService for work with nx project.json-file to project-utils ([7f8bdbc](https://github.com/nestjs-mod/nestjs-mod/commit/7f8bdbcb49563550a1c512e1b5e8d58614df901c))
* add ProjectUtils module and many small fix ([8069aec](https://github.com/nestjs-mod/nestjs-mod/commit/8069aec70e8109ddac6632db08ebd9da23c6e802))
* add support pathNestModuleMetadata for forFeatureModules ([492e685](https://github.com/nestjs-mod/nestjs-mod/commit/492e6854e835d90bf287c186f49b9f540297f295))
* add TcpNestMicroservice in @nestjs-mod/microservices ([852d29a](https://github.com/nestjs-mod/nestjs-mod/commit/852d29ad7ebbf9f8c61fc2ee45bd285b7cff84fb))
* changed logic for detect env key name ([c51ddaf](https://github.com/nestjs-mod/nestjs-mod/commit/c51ddaf808f3cc11bcd66e69b95a39ce200f03e4))
* check and update all logic for work with project options in nestModules and application, add normal class name for dynamic modules ([f0c1aca](https://github.com/nestjs-mod/nestjs-mod/commit/f0c1aca1828be667695aa6173690a911818e8f77))
* deactivate default ConsoleLogger for all modules, update work with logger for correct use pino logger if it need, add function getRequestFromExecutionContext and Request decorator work with express and fastify ([bcd6635](https://github.com/nestjs-mod/nestjs-mod/commit/bcd6635add07cd5abfc8c246dfd7eea17e726a3a))
* first commit ([d5fec78](https://github.com/nestjs-mod/nestjs-mod/commit/d5fec7888bf58d4a0d6fc249823523361b738d56))
* **nest-module:** add InjectAllFeatures to get all features from module ([60de7e7](https://github.com/nestjs-mod/nestjs-mod/commit/60de7e76edd8b712c82d83d74271a749acebba86))
* remove all async work with fs, add enableShutdownHooks, globalPrefix, autoCloseInInfrastructureMode and logApplicationStart inside DefaultNestApplicationListener, add contextName to TLinkOptions, change work with update options for nested modules from root, share feature module when we use forFeature ([0a52d10](https://github.com/nestjs-mod/nestjs-mod/commit/0a52d10b62eaeadcb4c308edbfb49ec7c5b910f3))
* rename name to contextName ([c0c3849](https://github.com/nestjs-mod/nestjs-mod/commit/c0c3849da258753ceaa16a709dd32e6a0eea6afd))
* **reports:** add nestjs-mod-all-readme-generator and update code for it ([b43fff6](https://github.com/nestjs-mod/nestjs-mod/commit/b43fff651b3c5dd6a6bff7457bc42c91ee83f20e))
* **reports:** add skipEmptySettings to DynamicNestModuleMetadataMarkdownReportGenerator ([d51aad4](https://github.com/nestjs-mod/nestjs-mod/commit/d51aad4b578e1eb71a4d0568e86d494315570d92))
* the infrastructure report has been expanded, examples of working with libraries have been added [skip contrib] ([60db271](https://github.com/nestjs-mod/nestjs-mod/commit/60db271d1d87eb66a4190d087efd808f771d20a9))
* update detect default context name in formatter, add disableInfrastructureModulesInProduction ([fa6b4c9](https://github.com/nestjs-mod/nestjs-mod/commit/fa6b4c9d1962020f36c9f88e745bfbb64e25c9d4))


### BREAKING CHANGES

* sample key correct for DotEnvPropertyNameFormatter = `PROJECT_NAME_CONTEXT_NAME_PROPERTY_NAME`.
Sample key if we use env for feature: `PROJECT_NAME_CONTEXT_NAME_FEATURE_NAME_PROPERTY_NAME`.
If we not set contextName, formatter try search key by `PROJECT_NAME_PROPERTY_NAME` or `PROJECT_NAME_FEATURE_NAME_PROPERTY_NAME`
