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
