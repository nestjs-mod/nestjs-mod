# TestApplication

Test application
## System modules

### DefaultTestNestApplicationCreate
Default test NestJS application creator.

#### Static configuration

| Key    | Constraints | Value |
| ------ | ----------- | ----- |
|`wrapTestingModuleBuilder`|**optional**|-|
|`defaultLogger`|**optional**|-|

## Feature modules

### SampleWithSharedConfig
#### Shared providers
`SampleWithSharedConfigService`

#### Shared imports
`SharedImport1Module`, `SharedImport2Module`

#### Environments: SampleWithSharedConfig

| Key    | Sources | Constraints | Value |
| ------ | ------- | ----------- | ----- |
|`var1`|`obj['var1']`, `process.env['TEST_APPLICATION_SAMPLE_WITH_SHARED_CONFIG_VAR_1']`|**isNotEmpty** (var1 should not be empty)|```var1value```|

#### Configuration

| Key    | Constraints | Value |
| ------ | ----------- | ----- |
|`dynamicVar1`|**optional**|```dyno```|

#### Static environments: SampleWithSharedConfig

| Key    | Sources | Constraints | Value |
| ------ | ------- | ----------- | ----- |
|`endpoint`|`obj['endpoint']`, `process.env['TEST_APPLICATION_SAMPLE_WITH_SHARED_CONFIG_ENDPOINT']`|**optional**|-|

#### Static configuration

| Key    | Constraints | Value |
| ------ | ----------- | ----- |
|`endpoint`|**optional**|-|

#### Feature configuration

| Key    | Constraints | Value |
| ------ | ----------- | ----- |
|`featureVar`|**isNotEmpty** (featureVar should not be empty)|-|

#### Feature environments

| Key    | Sources | Constraints | Value |
| ------ | ------- | ----------- | ----- |
|`envFeatureVar`|`obj['envFeatureVar']`, `process.env['TEST_APPLICATION_FEATURE_MODULE_NAME_ENV_FEATURE_VAR']`|**optional**|-|

## Integration modules

### DefaultTestNestApplicationInitializer
Default test NestJS application initializer.

#### Static configuration

| Key    | Constraints | Value |
| ------ | ----------- | ----- |
|`preInit`|**optional**|-|
|`postInit`|**optional**|-|
|`defaultLogger`|**optional**|-|

## Infrastructure modules

### InfrastructureMarkdownReportGenerator
Infrastructure markdown report generator.

#### Shared providers
`DynamicNestModuleMetadataMarkdownReportGenerator`

#### Static configuration

| Key    | Constraints | Value |
| ------ | ----------- | ----- |
|`markdownFile`|**optional**|```/home/endy/Projects/nestjs-mod/nestjs-mod/apps/example-basic/PRETTY_TESTING_INFRASTRUCTURE.MD```|
|`skipEmptySettings`|**optional**|-|
|`style`|**optional**|```pretty```|
