# example-basic
> Version: 0.0.0

Example basic application
## Installation
```bash
git clone https://github.com/nestjs-mod/nestjs-mod.git
cd nestjs-mod
npm install
```
## Running the app in watch mode
```bash
# preparing code, building code, creating infrastructure documentation and all the files necessary to raise the infrastructure and running tests (generate, build, docs:infrastructure, test)
npm run manual:prepare

# running example-basic application source code in watch mode
npm run serve:dev:example-basic
```
## Running the app in production mode
```bash
# preparing code, building code, creating infrastructure documentation and all the files necessary to raise the infrastructure and running tests (generate, build, docs:infrastructure, test)
npm run manual:prepare

# launching a built example-basic (you must first build it using the build command)
npm run start:prod:example-basic
```
## Test
```bash
# running tests for example-basic
npm run test:example-basic
```
## All scripts
|Script|Description|
|---|---|
|**dev infra**|
|`npm run serve:dev:cli`|Running cli application source code in watch mode|
|`npm run serve:dev:example-basic`|Running example-basic application source code in watch mode|
|`npm run serve:dev`|Running NestJS application source code in watch mode|
|`npm run serve:dev:example-fastify`|Running example-fastify source code in watch mode|
|`npm run serve:dev:example-tcp-microservice`|Running example-tcp-microservice source code in watch mode|
|**prod infra**|
|`npm run start`|Launching a built NestJS application (you must first build it using the build command)|
|`npm run start:prod:example-basic`|Launching a built example-basic (you must first build it using the build command)|
|`npm run build`|Building a NestJS application|
|`npm run start:prod:example-fastify`|Launching a built example-fastify (you must first build it using the build command)|
|`npm run start:prod:example-tcp-microservice`|Launching a built example-tcp-microservice (you must first build it using the build command)|
|**docs**|
|`npm run docs:infrastructure`|Creation of documentation for the entire infrastructure and creation of files necessary to launch the infrastructure|
|**tests**|
|`npm run test`|Running tests across the entire project|
|`npm run test:example-basic`|Running tests for example-basic|
|`npm run test:example-fastify`|Running tests for example-fastify|
|`npm run test:example-tcp-microservice`|Running tests for example-tcp-microservice|
|`npm run test:integrations-build`|Run an integration test in which we create a new NestJS-mod application using a schematic and check its operation|
|`npm run check-contrib`|Clone the repository https://github.com/nestjs-mod/nestjs-mod-contrib and run the build and tests on versions of the current NestJS repository-mod|
|**lint**|
|`npm run lint`|Checking the typescript code for the entire project|
|`npm run lint:fix`|Checking the typescript code throughout the project and trying to fix everything possible|
|`npm run tsc:lint`|Checking typescript code in libraries|
|**schematics**|
|`npm run build:schematics`|Build NestJS-mod schematic of utilities|
|`npm run local:schematics:init`|Alias for local launch of initialization NestJS-mod schematic|
|`npm run local:schematics:lib`|Alias for local launch schematic for generating NestJS-mod libraries|
|`npm run local:schematics:app`|Alias for local launch schematic for generating NestJS-mod applications|
|`npm run schematics-version-bump`|Updating libraries in the code that generates an empty NestJS-mod application|
|**utils**|
|`npm run generate`|Running the "generate" nx command in applications and libraries which can be customized at your discretion automatically generating an index.ts file for each library checking the code and trying to fix it|
|`npm run nx`|Alias for running the nx version locally, which is in the project (example: `npm run nx -- dep-graph`), in order not to install nx globally in the operating system|
|`npm run dep-graph`|Generating dependency diagrams for nx applications and libraries|
|`npm run nx:many`|Alias for running many nx commands (example: `npm run nx:many -- -t=lint`), an exception has been added for the root project, since sometimes an attempt to run an nx command on it can lead to the command freezing|
|`npm run make-ts-list`|Automatically generating an index.ts file for each library, works only for nx applications created using the `--projectNameAndRootFormat=as-provided` flag|
|`npm run update:nestjs-mod-example`|Start generating an empty application using the latest versions of the NestJS-mod libraries, published in https://github.com/nestjs-mod/nestjs-mod-example|
|`npm run update:lib-versions`||
|`npm run manual:prepare`|Preparing code, building code, creating infrastructure documentation and all the files necessary to raise the infrastructure and running tests (generate, build, docs:infrastructure, test)|
|`npm run tsc`|Alias for running the tsc version locally, which is in the project (example: `npm run tsc -- --noEmit -p tsconfig.base.json`), in order not to install tsc globally in the operating system|
|`npm run rucken`|Alias for console tools and scripts for nx and not only use to automate the workflow and speed up the development process (example: `npm run rucken -- make-ts-list`, site: https://www.npmjs.com/package/rucken)|
## System modules
System modules necessary for the operation of the entire application (examples: launching a NestJS application, launching microservices, etc.). Only NestJS-mod compatible modules.

### ProjectUtils
Utilities for setting global application parameters, such as project name, description, and settings validation parameters.

#### Shared providers
`WrapApplicationOptionsService`, `DotEnvService`, `PackageJsonService`, `ApplicationPackageJsonService`, `GitignoreService`, `NxProjectJsonService`, `ProjectUtilsPatcherService`

#### Static configuration
Static variables of primitive and complex types that are used in the module and can be used at the time of generating module metadata (import, controllers); values for them must be passed when connecting the module to the application.

| Key    | Description | Constraints | Default | Value |
| ------ | ----------- | ----------- | ------- | ----- |
|`applicationPackageJsonFile`|Application package.json-file|**optional**|-|```/home/endy/Projects/nestjs-mod/nestjs-mod/apps/example-basic/package.json```|
|`packageJsonFile`|Root package.json-file|**optional**|-|```/home/endy/Projects/nestjs-mod/nestjs-mod/package.json```|
|`envFile`|Dot-env file with environment variables|**optional**|-|```/home/endy/Projects/nestjs-mod/nestjs-mod/.env```|

### DefaultNestApplicationInitializer
Default NestJS application initializer.

## Feature modules
Feature modules with business logic of the application. NestJS and NestJS-mod compatible modules.

### AppModule
Main app module

### SampleWithSharedConfig
#### Shared providers
`SampleWithSharedConfigService`

#### Shared imports
`SharedImport1Module`, `SharedImport2Module`

#### Environments: SampleWithSharedConfig
Variables with primitive types used in the module, the values of which can be obtained from various sources, such as: process.env or consul key value.

| Key    | Description | Sources | Constraints | Default | Value |
| ------ | ----------- | ------- | ----------- | ------- | ----- |
|`var1`|-|`obj['var1']`, `process.env['EXAMPLE_BASIC_SAMPLE_WITH_SHARED_CONFIG_VAR_1']`|**isNotEmpty** (var1 should not be empty)|-|```var1value```|

#### Static environments: SampleWithSharedConfig
Static variables with primitive types used in the module and can be used at the time of generating module metadata (import, controllers), the values of which can be obtained from various sources, such as: process.env or consul key value.

| Key    | Description | Sources | Constraints | Default | Value |
| ------ | ----------- | ------- | ----------- | ------- | ----- |
|`endpoint`|-|`obj['endpoint']`, `process.env['EXAMPLE_BASIC_SAMPLE_WITH_SHARED_CONFIG_ENDPOINT']`|**optional**|-|-|

#### Feature environments
Feature variables with primitive types used in the module, the values of which can be obtained from various sources, such as: process.env or consul key value.

| Key    | Description | Sources | Constraints | Default | Value |
| ------ | ----------- | ------- | ----------- | ------- | ----- |
|`envFeatureVar`|-|`obj['envFeatureVar']`, `process.env['FEATURE_MODULE_NAME_ENV_FEATURE_VAR']`|**optional**|-|-|

#### Modules that use feature configuration
##### Feature module name: AppModule


| Key    | Description | Constraints | Default | Value |
| ------ | ----------- | ----------- | ------- | ----- |
|`featureVar`|-|**isNotEmpty** (featureVar should not be empty)|-|```featureVar41```|

#### Modules that use feature environments
##### Feature module name: AppModule


| Key    | Description | Sources | Constraints | Default | Value |
| ------ | ----------- | ------- | ----------- | ------- | ----- |
|`envFeatureVar`|-|`obj['envFeatureVar']`, `process.env['APP_MODULE_ENV_FEATURE_VAR']`|**optional**|-|-|

## Integration modules
Integration modules are necessary to organize communication between feature or core modules (example: after creating a user in the UsersModule feature module, you need to send him a letter from the NotificationsModule core module). NestJS and NestJS-mod compatible modules.

### DefaultNestApplicationListener
Default NestJS application listener.

#### Static environments
Static variables with primitive types used in the module and can be used at the time of generating module metadata (import, controllers), the values of which can be obtained from various sources, such as: process.env or consul key value.

| Key    | Description | Sources | Constraints | Default | Value |
| ------ | ----------- | ------- | ----------- | ------- | ----- |
|`port`|The port on which to run the server.|`obj['port']`, `process.env['EXAMPLE_BASIC_PORT']`|**optional**|```3000```|```3000```|
|`hostname`|Hostname on which to listen for incoming packets.|`obj['hostname']`, `process.env['EXAMPLE_BASIC_HOSTNAME']`|**optional**|-|-|

#### Static configuration
Static variables of primitive and complex types that are used in the module and can be used at the time of generating module metadata (import, controllers); values for them must be passed when connecting the module to the application.

| Key    | Description | Constraints | Default | Value |
| ------ | ----------- | ----------- | ------- | ----- |
|`mode`|Mode of start application: init - for run NestJS life cycle, listen -  for full start NestJS application|**optional**|```listen```|```silent```|

## Infrastructure modules
Infrastructure modules are needed to create configurations that launch various external services (examples: docker-compose file for raising a database, gitlab configuration for deploying an application). Only NestJS-mod compatible modules.

### InfrastructureMarkdownReportGenerator
Infrastructure markdown report generator.

#### Shared providers
`DynamicNestModuleMetadataMarkdownReportGenerator`

#### Static configuration
Static variables of primitive and complex types that are used in the module and can be used at the time of generating module metadata (import, controllers); values for them must be passed when connecting the module to the application.

| Key    | Description | Constraints | Default | Value |
| ------ | ----------- | ----------- | ------- | ----- |
|`markdownFile`|Name of the markdown-file in which to save the infrastructure report|**optional**|-|```/home/endy/Projects/nestjs-mod/nestjs-mod/apps/example-basic/INFRASTRUCTURE.MD```|
|`skipEmptySettings`|Skip empty values of env and config models|**optional**|-|```true```|


## Maintainers
- [EndyKaufman](admin@site15.ru)

## License
[MIT](LICENSE)