# TestApplication

Test application
## System modules
System modules necessary for the operation of the entire application (examples: launching a nestjs application, launching microservices, etc.).

### DefaultTestNestApplicationCreate
Default test NestJS application creator, no third party utilities required.

#### Static configuration (default)
Static variables of primitive and complex types that are used in the module and can be used at the time of generating module metadata (import, controllers), values can be obtained from various sources, such as: process.env or the value of the consul key.

| Key    | Description | Constraints | Value |
| ------ | ----------- | ----------- | ----- |
|`wrapTestingModuleBuilder`|Method for additional actions with TestingModuleBuilder|**optional**|-|

### DefaultTestNestApplicationInitializer
Default test NestJS application initializer, no third party utilities required.

#### Static configuration (default)
Static variables of primitive and complex types that are used in the module and can be used at the time of generating module metadata (import, controllers), values can be obtained from various sources, such as: process.env or the value of the consul key.

| Key    | Description | Constraints | Value |
| ------ | ----------- | ----------- | ----- |
|`preInit`|Method for additional actions before init|**optional**|-|
|`postInit`|Method for additional actions after init|**optional**|-|

## Feature modules
Feature modules with business logic of the application.

### SampleWithSharedConfig
Shared providers: SampleWithSharedConfigService

#### Environments (default): SampleWithSharedConfig
Variables with primitive types used in the module, the values of which can be obtained from various sources, such as: process.env or consul key value.

| Key    | Description | Source | Constraints | Value |
| ------ | ----------- | ------ | ----------- | ----- |
|`var1`|-|`obj['var1']`, `process.env['SAMPLE_WITH_SHARED_CONFIG_VAR_1']`|**isNotEmpty** (var1 should not be empty)|```var1value```|

#### Configuration (default)
Variables of primitive and complex types that are used in the module; values for them must be passed when connecting the module to the application.

| Key    | Description | Constraints | Value |
| ------ | ----------- | ----------- | ----- |
|`dynamicVar1`|-|**optional**|```dyno```|

#### Static environments (default): SampleWithSharedConfig
Static variables with primitive types used in the module and can be used at the time of generating module metadata (import, controllers), the values of which can be obtained from various sources, such as: process.env or consul key value.

| Key    | Description | Source | Constraints | Value |
| ------ | ----------- | ------ | ----------- | ----- |
|`endpoint`|-|`obj['endpoint']`, `process.env['SAMPLE_WITH_SHARED_CONFIG_ENDPOINT']`|**optional**|-|

#### Static configuration (default)
Static variables of primitive and complex types that are used in the module and can be used at the time of generating module metadata (import, controllers), values can be obtained from various sources, such as: process.env or the value of the consul key.

| Key    | Description | Constraints | Value |
| ------ | ----------- | ----------- | ----- |
|`endpoint`|-|**optional**|-|

## Infrastructure modules
Infrastructure modules are needed to create configurations that launch various external services (examples: docker-compose file for raising a database, gitlab configuration for deploying an application).

### InfrastructureMarkdownReportGenerator
Infrastructure markdown report generator.

#### Static configuration (default)
Static variables of primitive and complex types that are used in the module and can be used at the time of generating module metadata (import, controllers), values can be obtained from various sources, such as: process.env or the value of the consul key.

| Key    | Description | Constraints | Value |
| ------ | ----------- | ----------- | ----- |
|`markdownFile`|Name of the markdown-file in which to save the infrastructure report|**optional**|```/home/endy/Projects/nestjs-mod/apps/example-basic/TESTING_INFRASTRUCTURE.MD```|
