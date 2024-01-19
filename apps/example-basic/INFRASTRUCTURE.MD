# ExampleBasic

Example basic
## System modules
System modules necessary for the operation of the entire application (examples: launching a NestJS application, launching microservices, etc.). Only NestJS-mod compatible modules.

### ProjectUtils
Utilities for setting global application parameters, such as project name, description, and settings validation parameters.

#### Shared providers
`WrapApplicationOptionsService`, `DotEnvService`, `PackageJsonService`, `ApplicationPackageJsonService`

#### Static configuration
Static variables of primitive and complex types that are used in the module and can be used at the time of generating module metadata (import, controllers); values for them must be passed when connecting the module to the application.

| Key    | Description | Constraints | Default | Value |
| ------ | ----------- | ----------- | ------- | ----- |
|`applicationPackageJsonFile`|Application package.json-file|**isNotEmpty** (applicationPackageJsonFile should not be empty)|-|```/home/endy/Projects/nestjs-mod/nestjs-mod/apps/example-basic/package.json```|
|`packageJsonFile`|Root package.json-file.|**optional**|-|```/home/endy/Projects/nestjs-mod/nestjs-mod/package.json```|
|`envFile`|Dot-env file with environment variables.|**optional**|-|```/home/endy/Projects/nestjs-mod/nestjs-mod/.env```|

### DefaultNestApplicationInitializer
Default NestJS application initializer, no third party utilities required.

### DefaultNestApplicationListener
Default NestJS application listener, no third party utilities required.

#### Static environments
Static variables with primitive types used in the module and can be used at the time of generating module metadata (import, controllers), the values of which can be obtained from various sources, such as: process.env or consul key value.

| Key    | Description | Sources | Constraints | Default | Value |
| ------ | ----------- | ------- | ----------- | ------- | ----- |
|`port`|The port on which to run the server.|`obj['port']`, `process.env['EXAMPLE_BASIC_PORT']`|**isNotEmpty** (port should not be empty)|-|```3000```|

#### Static configuration
Static variables of primitive and complex types that are used in the module and can be used at the time of generating module metadata (import, controllers); values for them must be passed when connecting the module to the application.

| Key    | Description | Constraints | Default | Value |
| ------ | ----------- | ----------- | ------- | ----- |
|`mode`|Mode of start application: init - for run NestJS life cycle, listen -  for full start NestJS application|**optional**|```listen```|```init```|
|`preListen`|Method for additional actions before listening|**optional**|-|Function|
|`postListen`|Method for additional actions after listening|**optional**|-|Function|

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

#### Modules that use feature configuration
##### Module name: AppModule


| Key    | Description | Constraints | Default | Value |
| ------ | ----------- | ----------- | ------- | ----- |
|`featureVar`|-|**isNotEmpty** (featureVar should not be empty)|-|```featureVar41```|

## Infrastructure modules
Infrastructure modules are needed to create configurations that launch various external services (examples: docker-compose file for raising a database, gitlab configuration for deploying an application). Only NestJS-mod compatible modules.

### RestInfrastructureHtmlReport
Rest infrastructure HTML-report

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
