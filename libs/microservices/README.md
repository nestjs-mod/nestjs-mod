
# @nestjs-mod/microservices

NestJS microservice modules for NestJS-mod

[![NPM version][npm-image]][npm-url] [![monthly downloads][downloads-image]][downloads-url] [![Telegram][telegram-image]][telegram-url] [![Discord][discord-image]][discord-url]

## Installation

```bash
npm i --save @nestjs/microservices @nestjs-mod/microservices
```


## Modules

| Link | Category | Description |
| ---- | -------- | ----------- |
| [GrpcNestMicroservice](#grpcnestmicroservice) | system | GRPC NestJS-mod microservice initializer @see https://docs.nestjs.com/microservices/grpc |
| [GrpcNestMicroserviceClientModule](#grpcnestmicroserviceclientmodule) | system | GRPC NestJS-mod microservice client @see https://docs.nestjs.com/microservices/grpc |
| [KafkaNestMicroservice](#kafkanestmicroservice) | system | Kafka NestJS-mod microservice initializer @see https://docs.nestjs.com/microservices/kafka |
| [KafkaNestMicroserviceClientModule](#kafkanestmicroserviceclientmodule) | system | Kafka NestJS-mod microservice client @see https://docs.nestjs.com/microservices/kafka |
| [MqttNestMicroservice](#mqttnestmicroservice) | system | MQTT NestJS-mod microservice initializer @see https://docs.nestjs.com/microservices/mqtt |
| [MqttNestMicroserviceClientModule](#mqttnestmicroserviceclientmodule) | system | MQTT NestJS-mod microservice client @see https://docs.nestjs.com/microservices/mqtt |
| [NatsNestMicroservice](#natsnestmicroservice) | system | Nats NestJS-mod microservice initializer @see https://docs.nestjs.com/microservices/nats |
| [NatsNestMicroserviceClientModule](#natsnestmicroserviceclientmodule) | system | Nats NestJS-mod microservice client @see https://docs.nestjs.com/microservices/nats |
| [RedisNestMicroservice](#redisnestmicroservice) | system | Redis NestJS-mod microservice initializer @see https://docs.nestjs.com/microservices/redis |
| [RedisNestMicroserviceClientModule](#redisnestmicroserviceclientmodule) | system | Redis NestJS-mod microservice client @see https://docs.nestjs.com/microservices/redis |
| [RmqNestMicroservice](#rmqnestmicroservice) | system | RabbitMQ NestJS-mod microservice initializer @see https://docs.nestjs.com/microservices/rabbitmq |
| [RmqNestMicroserviceClientModule](#rmqnestmicroserviceclientmodule) | system | RabbitMQ NestJS-mod microservice client @see https://docs.nestjs.com/microservices/rabbitmq |
| [TcpNestMicroservice](#tcpnestmicroservice) | system | TCP NestJS-mod microservice initializer @see https://docs.nestjs.com/microservices/basics |
| [TcpNestMicroserviceClientModule](#tcpnestmicroserviceclientmodule) | system | TCP NestJS-mod microservice client @see https://docs.nestjs.com/microservices/basics |


## Modules descriptions

### GrpcNestMicroservice
GRPC NestJS-mod microservice initializer @see https://docs.nestjs.com/microservices/grpc

#### Static environments


| Key    | Description | Sources | Constraints | Default | Value |
| ------ | ----------- | ------- | ----------- | ------- | ----- |
|`url`|Url|`obj['url']`, `process.env['GRPC_URL']`|**optional**|-|-|

#### Static configuration


| Key    | Description | Constraints | Default | Value |
| ------ | ----------- | ----------- | ------- | ----- |
|`defaultLogger`|Default logger for application|**optional**|-|-|
|`logger`|Specifies the logger to use.  Pass `false` to turn off logging.|**optional**|-|-|
|`abortOnError`|Whether to abort the process on Error. By default, the process is exited. Pass `false` to override the default behavior. If `false` is passed, Nest will not exit the application and instead will rethrow the exception. @default true|**optional**|-|-|
|`bufferLogs`|If enabled, logs will be buffered until the "Logger#flush" method is called. @default false|**optional**|-|-|
|`autoFlushLogs`|If enabled, logs will be automatically flushed and buffer detached when application initialization process either completes or fails. @default true|**optional**|-|-|
|`preview`|Whether to run application in the preview mode. In the preview mode, providers/controllers are not instantiated & resolved. @default false|**optional**|-|-|
|`snapshot`|Whether to generate a serialized graph snapshot. @default false|**optional**|-|-|
|`featureName`|Feature name for generate prefix to environments keys|**optional**|-|-|
|`microserviceProjectName`|Microservice project name for generate prefix to environments keys (need only for microservice client)|**optional**|-|-|
|`maxSendMessageLength`|Max send message length|**optional**|-|-|
|`maxReceiveMessageLength`|Max receive message length|**optional**|-|-|
|`maxMetadataSize`|Max metadata size|**optional**|-|-|
|`keepalive`|Keepalive|**optional**|-|-|
|`channelOptions`|Channel options|**optional**|-|-|
|`credentials`|Credentials|**optional**|-|-|
|`protoPath`|Proto path|**optional**|-|-|
|`package`|Package|**isNotEmpty** (package should not be empty)|-|-|
|`protoLoader`|Proto Loader|**optional**|-|-|
|`packageDefinition`|Package definition|**optional**|-|-|
|`gracefulShutdown`|GracefulShutdown|**optional**|-|-|
|`loader`|Loader|**optional**|-|-|

[Back to Top](#modules)

---
### GrpcNestMicroserviceClientModule
GRPC NestJS-mod microservice client @see https://docs.nestjs.com/microservices/grpc

#### Shared providers
`GrpcNestMicroserviceClient`, `ClientProxyApplicationHooks`

#### Static environments


| Key    | Description | Sources | Constraints | Default | Value |
| ------ | ----------- | ------- | ----------- | ------- | ----- |
|`url`|Url|`obj['url']`, `process.env['GRPC_URL']`|**optional**|-|-|

#### Static configuration


| Key    | Description | Constraints | Default | Value |
| ------ | ----------- | ----------- | ------- | ----- |
|`defaultLogger`|Default logger for application|**optional**|-|-|
|`logger`|Specifies the logger to use.  Pass `false` to turn off logging.|**optional**|-|-|
|`abortOnError`|Whether to abort the process on Error. By default, the process is exited. Pass `false` to override the default behavior. If `false` is passed, Nest will not exit the application and instead will rethrow the exception. @default true|**optional**|-|-|
|`bufferLogs`|If enabled, logs will be buffered until the "Logger#flush" method is called. @default false|**optional**|-|-|
|`autoFlushLogs`|If enabled, logs will be automatically flushed and buffer detached when application initialization process either completes or fails. @default true|**optional**|-|-|
|`preview`|Whether to run application in the preview mode. In the preview mode, providers/controllers are not instantiated & resolved. @default false|**optional**|-|-|
|`snapshot`|Whether to generate a serialized graph snapshot. @default false|**optional**|-|-|
|`featureName`|Feature name for generate prefix to environments keys|**optional**|-|-|
|`microserviceProjectName`|Microservice project name for generate prefix to environments keys (need only for microservice client)|**optional**|-|-|
|`maxSendMessageLength`|Max send message length|**optional**|-|-|
|`maxReceiveMessageLength`|Max receive message length|**optional**|-|-|
|`maxMetadataSize`|Max metadata size|**optional**|-|-|
|`keepalive`|Keepalive|**optional**|-|-|
|`channelOptions`|Channel options|**optional**|-|-|
|`credentials`|Credentials|**optional**|-|-|
|`protoPath`|Proto path|**optional**|-|-|
|`package`|Package|**isNotEmpty** (package should not be empty)|-|-|
|`protoLoader`|Proto Loader|**optional**|-|-|
|`packageDefinition`|Package definition|**optional**|-|-|
|`gracefulShutdown`|GracefulShutdown|**optional**|-|-|
|`loader`|Loader|**optional**|-|-|

[Back to Top](#modules)

---
### KafkaNestMicroservice
Kafka NestJS-mod microservice initializer @see https://docs.nestjs.com/microservices/kafka

#### Static environments


| Key    | Description | Sources | Constraints | Default | Value |
| ------ | ----------- | ------- | ----------- | ------- | ----- |
|`brokers`|Brokers|`obj['brokers']`, `process.env['KAFKA_BROKERS']`|**optional**|-|-|

#### Static configuration


| Key    | Description | Constraints | Default | Value |
| ------ | ----------- | ----------- | ------- | ----- |
|`defaultLogger`|Default logger for application|**optional**|-|-|
|`logger`|Specifies the logger to use.  Pass `false` to turn off logging.|**optional**|-|-|
|`abortOnError`|Whether to abort the process on Error. By default, the process is exited. Pass `false` to override the default behavior. If `false` is passed, Nest will not exit the application and instead will rethrow the exception. @default true|**optional**|-|-|
|`bufferLogs`|If enabled, logs will be buffered until the "Logger#flush" method is called. @default false|**optional**|-|-|
|`autoFlushLogs`|If enabled, logs will be automatically flushed and buffer detached when application initialization process either completes or fails. @default true|**optional**|-|-|
|`preview`|Whether to run application in the preview mode. In the preview mode, providers/controllers are not instantiated & resolved. @default false|**optional**|-|-|
|`snapshot`|Whether to generate a serialized graph snapshot. @default false|**optional**|-|-|
|`featureName`|Feature name for generate prefix to environments keys|**optional**|-|-|
|`microserviceProjectName`|Microservice project name for generate prefix to environments keys (need only for microservice client)|**optional**|-|-|
|`serializer`|Serializer|**optional**|-|-|
|`deserializer`|Deserializer|**optional**|-|-|
|`postfixId`|Defaults to `"-server"` on server side and `"-client"` on client side|**optional**|-|-|
|`client`|Client|**optional**|-|-|
|`consumer`|Consumer config|**optional**|-|-|
|`run`|Consumer run config|**optional**|-|-|
|`subscribe`|Subscribe|**optional**|-|-|
|`producer`|Producer config|**optional**|-|-|
|`send`|Send producer record|**optional**|-|-|
|`parser`|Kafka parser config|**optional**|-|-|
|`producerOnlyMode`|Producer only mode|**optional**|-|-|

[Back to Top](#modules)

---
### KafkaNestMicroserviceClientModule
Kafka NestJS-mod microservice client @see https://docs.nestjs.com/microservices/kafka

#### Shared providers
`KafkaNestMicroserviceClient`, `ClientProxyApplicationHooks`

#### Static environments


| Key    | Description | Sources | Constraints | Default | Value |
| ------ | ----------- | ------- | ----------- | ------- | ----- |
|`brokers`|Brokers|`obj['brokers']`, `process.env['KAFKA_BROKERS']`|**optional**|-|-|

#### Static configuration


| Key    | Description | Constraints | Default | Value |
| ------ | ----------- | ----------- | ------- | ----- |
|`defaultLogger`|Default logger for application|**optional**|-|-|
|`logger`|Specifies the logger to use.  Pass `false` to turn off logging.|**optional**|-|-|
|`abortOnError`|Whether to abort the process on Error. By default, the process is exited. Pass `false` to override the default behavior. If `false` is passed, Nest will not exit the application and instead will rethrow the exception. @default true|**optional**|-|-|
|`bufferLogs`|If enabled, logs will be buffered until the "Logger#flush" method is called. @default false|**optional**|-|-|
|`autoFlushLogs`|If enabled, logs will be automatically flushed and buffer detached when application initialization process either completes or fails. @default true|**optional**|-|-|
|`preview`|Whether to run application in the preview mode. In the preview mode, providers/controllers are not instantiated & resolved. @default false|**optional**|-|-|
|`snapshot`|Whether to generate a serialized graph snapshot. @default false|**optional**|-|-|
|`featureName`|Feature name for generate prefix to environments keys|**optional**|-|-|
|`microserviceProjectName`|Microservice project name for generate prefix to environments keys (need only for microservice client)|**optional**|-|-|
|`serializer`|Serializer|**optional**|-|-|
|`deserializer`|Deserializer|**optional**|-|-|
|`postfixId`|Defaults to `"-server"` on server side and `"-client"` on client side|**optional**|-|-|
|`client`|Client|**optional**|-|-|
|`consumer`|Consumer config|**optional**|-|-|
|`run`|Consumer run config|**optional**|-|-|
|`subscribe`|Subscribe|**optional**|-|-|
|`producer`|Producer config|**optional**|-|-|
|`send`|Send producer record|**optional**|-|-|
|`parser`|Kafka parser config|**optional**|-|-|
|`producerOnlyMode`|Producer only mode|**optional**|-|-|

[Back to Top](#modules)

---
### MqttNestMicroservice
MQTT NestJS-mod microservice initializer @see https://docs.nestjs.com/microservices/mqtt

#### Static environments


| Key    | Description | Sources | Constraints | Default | Value |
| ------ | ----------- | ------- | ----------- | ------- | ----- |
|`url`|Url|`obj['url']`, `process.env['MQTT_URL']`|**optional**|-|-|

#### Static configuration


| Key    | Description | Constraints | Default | Value |
| ------ | ----------- | ----------- | ------- | ----- |
|`defaultLogger`|Default logger for application|**optional**|-|-|
|`logger`|Specifies the logger to use.  Pass `false` to turn off logging.|**optional**|-|-|
|`abortOnError`|Whether to abort the process on Error. By default, the process is exited. Pass `false` to override the default behavior. If `false` is passed, Nest will not exit the application and instead will rethrow the exception. @default true|**optional**|-|-|
|`bufferLogs`|If enabled, logs will be buffered until the "Logger#flush" method is called. @default false|**optional**|-|-|
|`autoFlushLogs`|If enabled, logs will be automatically flushed and buffer detached when application initialization process either completes or fails. @default true|**optional**|-|-|
|`preview`|Whether to run application in the preview mode. In the preview mode, providers/controllers are not instantiated & resolved. @default false|**optional**|-|-|
|`snapshot`|Whether to generate a serialized graph snapshot. @default false|**optional**|-|-|
|`featureName`|Feature name for generate prefix to environments keys|**optional**|-|-|
|`microserviceProjectName`|Microservice project name for generate prefix to environments keys (need only for microservice client)|**optional**|-|-|
|`serializer`|Serializer|**optional**|-|-|
|`deserializer`|Deserializer|**optional**|-|-|
|`subscribeOptions`|Subscribe options|**optional**|-|-|
|`userProperties`|User properties|**optional**|-|-|

[Back to Top](#modules)

---
### MqttNestMicroserviceClientModule
MQTT NestJS-mod microservice client @see https://docs.nestjs.com/microservices/mqtt

#### Shared providers
`MqttNestMicroserviceClient`, `ClientProxyApplicationHooks`

#### Static environments


| Key    | Description | Sources | Constraints | Default | Value |
| ------ | ----------- | ------- | ----------- | ------- | ----- |
|`url`|Url|`obj['url']`, `process.env['MQTT_URL']`|**optional**|-|-|

#### Static configuration


| Key    | Description | Constraints | Default | Value |
| ------ | ----------- | ----------- | ------- | ----- |
|`defaultLogger`|Default logger for application|**optional**|-|-|
|`logger`|Specifies the logger to use.  Pass `false` to turn off logging.|**optional**|-|-|
|`abortOnError`|Whether to abort the process on Error. By default, the process is exited. Pass `false` to override the default behavior. If `false` is passed, Nest will not exit the application and instead will rethrow the exception. @default true|**optional**|-|-|
|`bufferLogs`|If enabled, logs will be buffered until the "Logger#flush" method is called. @default false|**optional**|-|-|
|`autoFlushLogs`|If enabled, logs will be automatically flushed and buffer detached when application initialization process either completes or fails. @default true|**optional**|-|-|
|`preview`|Whether to run application in the preview mode. In the preview mode, providers/controllers are not instantiated & resolved. @default false|**optional**|-|-|
|`snapshot`|Whether to generate a serialized graph snapshot. @default false|**optional**|-|-|
|`featureName`|Feature name for generate prefix to environments keys|**optional**|-|-|
|`microserviceProjectName`|Microservice project name for generate prefix to environments keys (need only for microservice client)|**optional**|-|-|
|`serializer`|Serializer|**optional**|-|-|
|`deserializer`|Deserializer|**optional**|-|-|
|`subscribeOptions`|Subscribe options|**optional**|-|-|
|`userProperties`|User properties|**optional**|-|-|

[Back to Top](#modules)

---
### NatsNestMicroservice
Nats NestJS-mod microservice initializer @see https://docs.nestjs.com/microservices/nats

#### Static environments


| Key    | Description | Sources | Constraints | Default | Value |
| ------ | ----------- | ------- | ----------- | ------- | ----- |
|`name`|Name|`obj['name']`, `process.env['NATS_NAME']`|**optional**|-|-|
|`user`|User|`obj['user']`, `process.env['NATS_USER']`|**optional**|-|-|
|`pass`|Pass|`obj['pass']`, `process.env['NATS_PASS']`|**optional**|-|-|
|`servers`|Servers|`obj['servers']`, `process.env['NATS_SERVERS']`|**optional**|-|-|

#### Static configuration


| Key    | Description | Constraints | Default | Value |
| ------ | ----------- | ----------- | ------- | ----- |
|`defaultLogger`|Default logger for application|**optional**|-|-|
|`logger`|Specifies the logger to use.  Pass `false` to turn off logging.|**optional**|-|-|
|`abortOnError`|Whether to abort the process on Error. By default, the process is exited. Pass `false` to override the default behavior. If `false` is passed, Nest will not exit the application and instead will rethrow the exception. @default true|**optional**|-|-|
|`bufferLogs`|If enabled, logs will be buffered until the "Logger#flush" method is called. @default false|**optional**|-|-|
|`autoFlushLogs`|If enabled, logs will be automatically flushed and buffer detached when application initialization process either completes or fails. @default true|**optional**|-|-|
|`preview`|Whether to run application in the preview mode. In the preview mode, providers/controllers are not instantiated & resolved. @default false|**optional**|-|-|
|`snapshot`|Whether to generate a serialized graph snapshot. @default false|**optional**|-|-|
|`featureName`|Feature name for generate prefix to environments keys|**optional**|-|-|
|`microserviceProjectName`|Microservice project name for generate prefix to environments keys (need only for microservice client)|**optional**|-|-|
|`headers`|Headers|**optional**|-|-|
|`authenticator`|Authenticator|**optional**|-|-|
|`debug`|Debug|**optional**|-|-|
|`ignoreClusterUpdates`|Ignore cluster updates|**optional**|-|-|
|`inboxPrefix`|Inbox prefix|**optional**|-|-|
|`encoding`|Encoding|**optional**|-|-|
|`maxPingOut`|Max ping out|**optional**|-|-|
|`maxReconnectAttempts`|Max reconnect attempts|**optional**|-|-|
|`reconnectTimeWait`|Reconnect time wait|**optional**|-|-|
|`reconnectJitter`|Reconnect jitter|**optional**|-|-|
|`reconnectJitterTLS`|Reconnect jitter TLS|**optional**|-|-|
|`reconnectDelayHandler`|Reconnect delay handler|**optional**|-|-|
|`nkey`|Nkey|**optional**|-|-|
|`reconnect`|Reconnect|**optional**|-|-|
|`pedantic`|Pedantic|**optional**|-|-|
|`tls`|TLS|**optional**|-|-|
|`queue`|Queue|**optional**|-|-|
|`serializer`|Serializer|**optional**|-|-|
|`deserializer`|Deserializer|**optional**|-|-|
|`userJWT`|User JWT|**optional**|-|-|
|`nonceSigner`|Nonce signer|**optional**|-|-|
|`userCreds`|User creds|**optional**|-|-|
|`useOldRequestStyle`|Use old request style|**optional**|-|-|
|`pingInterval`|Ping interval|**optional**|-|-|
|`preserveBuffers`|Preserve buffers|**optional**|-|-|
|`waitOnFirstConnect`|Wait on first connect|**optional**|-|-|
|`verbose`|Verbose|**optional**|-|-|
|`noEcho`|No echo|**optional**|-|-|
|`noRandomize`|No randomize|**optional**|-|-|
|`timeout`|Timeout|**optional**|-|-|
|`token`|Token|**optional**|-|-|
|`yieldTime`|Yield time|**optional**|-|-|
|`tokenHandler`|Token handler|**optional**|-|-|

[Back to Top](#modules)

---
### NatsNestMicroserviceClientModule
Nats NestJS-mod microservice client @see https://docs.nestjs.com/microservices/nats

#### Shared providers
`NatsNestMicroserviceClient`, `ClientProxyApplicationHooks`

#### Static environments


| Key    | Description | Sources | Constraints | Default | Value |
| ------ | ----------- | ------- | ----------- | ------- | ----- |
|`name`|Name|`obj['name']`, `process.env['NATS_NAME']`|**optional**|-|-|
|`user`|User|`obj['user']`, `process.env['NATS_USER']`|**optional**|-|-|
|`pass`|Pass|`obj['pass']`, `process.env['NATS_PASS']`|**optional**|-|-|
|`servers`|Servers|`obj['servers']`, `process.env['NATS_SERVERS']`|**optional**|-|-|

#### Static configuration


| Key    | Description | Constraints | Default | Value |
| ------ | ----------- | ----------- | ------- | ----- |
|`defaultLogger`|Default logger for application|**optional**|-|-|
|`logger`|Specifies the logger to use.  Pass `false` to turn off logging.|**optional**|-|-|
|`abortOnError`|Whether to abort the process on Error. By default, the process is exited. Pass `false` to override the default behavior. If `false` is passed, Nest will not exit the application and instead will rethrow the exception. @default true|**optional**|-|-|
|`bufferLogs`|If enabled, logs will be buffered until the "Logger#flush" method is called. @default false|**optional**|-|-|
|`autoFlushLogs`|If enabled, logs will be automatically flushed and buffer detached when application initialization process either completes or fails. @default true|**optional**|-|-|
|`preview`|Whether to run application in the preview mode. In the preview mode, providers/controllers are not instantiated & resolved. @default false|**optional**|-|-|
|`snapshot`|Whether to generate a serialized graph snapshot. @default false|**optional**|-|-|
|`featureName`|Feature name for generate prefix to environments keys|**optional**|-|-|
|`microserviceProjectName`|Microservice project name for generate prefix to environments keys (need only for microservice client)|**optional**|-|-|
|`headers`|Headers|**optional**|-|-|
|`authenticator`|Authenticator|**optional**|-|-|
|`debug`|Debug|**optional**|-|-|
|`ignoreClusterUpdates`|Ignore cluster updates|**optional**|-|-|
|`inboxPrefix`|Inbox prefix|**optional**|-|-|
|`encoding`|Encoding|**optional**|-|-|
|`maxPingOut`|Max ping out|**optional**|-|-|
|`maxReconnectAttempts`|Max reconnect attempts|**optional**|-|-|
|`reconnectTimeWait`|Reconnect time wait|**optional**|-|-|
|`reconnectJitter`|Reconnect jitter|**optional**|-|-|
|`reconnectJitterTLS`|Reconnect jitter TLS|**optional**|-|-|
|`reconnectDelayHandler`|Reconnect delay handler|**optional**|-|-|
|`nkey`|Nkey|**optional**|-|-|
|`reconnect`|Reconnect|**optional**|-|-|
|`pedantic`|Pedantic|**optional**|-|-|
|`tls`|TLS|**optional**|-|-|
|`queue`|Queue|**optional**|-|-|
|`serializer`|Serializer|**optional**|-|-|
|`deserializer`|Deserializer|**optional**|-|-|
|`userJWT`|User JWT|**optional**|-|-|
|`nonceSigner`|Nonce signer|**optional**|-|-|
|`userCreds`|User creds|**optional**|-|-|
|`useOldRequestStyle`|Use old request style|**optional**|-|-|
|`pingInterval`|Ping interval|**optional**|-|-|
|`preserveBuffers`|Preserve buffers|**optional**|-|-|
|`waitOnFirstConnect`|Wait on first connect|**optional**|-|-|
|`verbose`|Verbose|**optional**|-|-|
|`noEcho`|No echo|**optional**|-|-|
|`noRandomize`|No randomize|**optional**|-|-|
|`timeout`|Timeout|**optional**|-|-|
|`token`|Token|**optional**|-|-|
|`yieldTime`|Yield time|**optional**|-|-|
|`tokenHandler`|Token handler|**optional**|-|-|

[Back to Top](#modules)

---
### RedisNestMicroservice
Redis NestJS-mod microservice initializer @see https://docs.nestjs.com/microservices/redis

#### Static environments


| Key    | Description | Sources | Constraints | Default | Value |
| ------ | ----------- | ------- | ----------- | ------- | ----- |
|`host`|Host|`obj['host']`, `process.env['REDIS_HOST']`|**optional**|-|-|
|`port`|Port|`obj['port']`, `process.env['REDIS_PORT']`|**optional**|```6379```|```6379```|
|`username`|If set, client will send AUTH command with the value of this option as the first argument when connected, this is supported since Redis 6|`obj['username']`, `process.env['REDIS_USERNAME']`|**optional**|-|-|
|`password`|If set, client will send AUTH command with the value of this option when connected|`obj['password']`, `process.env['REDIS_PASSWORD']`|**optional**|-|-|
|`db`|Database index to use|`obj['db']`, `process.env['REDIS_DB']`|**optional**|```0```|```0```|

#### Static configuration


| Key    | Description | Constraints | Default | Value |
| ------ | ----------- | ----------- | ------- | ----- |
|`defaultLogger`|Default logger for application|**optional**|-|-|
|`logger`|Specifies the logger to use.  Pass `false` to turn off logging.|**optional**|-|-|
|`abortOnError`|Whether to abort the process on Error. By default, the process is exited. Pass `false` to override the default behavior. If `false` is passed, Nest will not exit the application and instead will rethrow the exception. @default true|**optional**|-|-|
|`bufferLogs`|If enabled, logs will be buffered until the "Logger#flush" method is called. @default false|**optional**|-|-|
|`autoFlushLogs`|If enabled, logs will be automatically flushed and buffer detached when application initialization process either completes or fails. @default true|**optional**|-|-|
|`preview`|Whether to run application in the preview mode. In the preview mode, providers/controllers are not instantiated & resolved. @default false|**optional**|-|-|
|`snapshot`|Whether to generate a serialized graph snapshot. @default false|**optional**|-|-|
|`featureName`|Feature name for generate prefix to environments keys|**optional**|-|-|
|`microserviceProjectName`|Microservice project name for generate prefix to environments keys (need only for microservice client)|**optional**|-|-|
|`retryAttempts`|Retry attempts|**optional**|-|-|
|`retryDelay`|Retry delay|**optional**|-|-|
|`wildcards`|Wildcards|**optional**|-|-|
|`serializer`|Serializer|**optional**|-|-|
|`deserializer`|Deserializer|**optional**|-|-|
|`Connector`|Connector|**optional**|-|-|
|`retryStrategy`|Retry strategy|**optional**|-|-|
|`commandTimeout`|Command timeout|**optional**|-|-|
|`keepAlive`|Keep alive|**optional**|-|-|
|`noDelay`|No delay|**optional**|-|-|
|`connectionName`|Connection name|**optional**|-|-|
|`autoResubscribe`|Auto resubscribe|**optional**|-|-|
|`autoResendUnfulfilledCommands`|Auto resend unfulfilled commands|**optional**|-|-|
|`reconnectOnError`|Reconnect on error|**optional**|-|-|
|`readOnly`|Read only|**optional**|-|-|
|`stringNumbers`|String numbers|**optional**|-|-|
|`connectTimeout`|Connect timeout|**optional**|-|-|
|`monitor`|Monitor|**optional**|-|-|
|`maxRetriesPerRequest`|Max retries per request|**optional**|-|-|
|`maxLoadingRetryTime`|Max loading retry time|**optional**|-|-|
|`enableAutoPipelining`|Enable auto pipelining|**optional**|-|-|
|`autoPipeliningIgnoredCommands`|Auto pipelining ignored commands|**optional**|-|-|
|`offlineQueue`|Offline queue|**optional**|-|-|
|`commandQueue`|Command queue|**optional**|-|-|
|`enableOfflineQueue`|Enable offline queue|**optional**|-|-|
|`enableReadyCheck`|The client will sent an INFO command to check whether the server is still loading data from the disk ( which happens when the server is just launched) when the connection is established, and only wait until the loading process is finished before emitting the `ready` event (default: true).|**optional**|-|-|
|`lazyConnect`|When a Redis instance is initialized, a connection to the server is immediately established. Set this to true will delay the connection to the server until the first command is sent or `redis.connect()` is called explicitly (default: false).|**optional**|-|-|
|`scripts`|Scripts|**optional**|-|-|
|`keyPrefix`|Key prefix|**optional**|-|-|
|`showFriendlyErrorStack`|Show friendly error stack|**optional**|-|-|
|`disconnectTimeout`|Disconnect timeout|**optional**|-|-|
|`tls`|Connection options|**optional**|-|-|
|`name`|Master group name of the Sentinel|**optional**|-|-|
|`role`|Role|**optional**|-|-|
|`sentinelUsername`|Sentinel username|**optional**|-|-|
|`sentinelPassword`|Sentinel password|**optional**|-|-|
|`sentinels`|Sentinels|**optional**|-|-|
|`sentinelRetryStrategy`|Sentinel retry strategy|**optional**|-|-|
|`sentinelReconnectStrategy`|Sentinel reconnect strategy|**optional**|-|-|
|`preferredSlaves`|Preferred slaves|**optional**|-|-|
|`sentinelCommandTimeout`|Sentinel command timeout|**optional**|-|-|
|`enableTLSForSentinelMode`|Enable TLS for sentinel mode|**optional**|-|-|
|`sentinelTLS`|Sentinel TLS|**optional**|-|-|
|`natMap`|Nat map|**optional**|-|-|
|`updateSentinels`|Update sentinels|**optional**|-|-|
|`sentinelMaxConnections`|Sentinel max connections|**optional**|-|-|
|`failoverDetector`|Failover detector|**optional**|-|-|

[Back to Top](#modules)

---
### RedisNestMicroserviceClientModule
Redis NestJS-mod microservice client @see https://docs.nestjs.com/microservices/redis

#### Shared providers
`RedisNestMicroserviceClient`, `ClientProxyApplicationHooks`

#### Static environments


| Key    | Description | Sources | Constraints | Default | Value |
| ------ | ----------- | ------- | ----------- | ------- | ----- |
|`host`|Host|`obj['host']`, `process.env['REDIS_HOST']`|**optional**|-|-|
|`port`|Port|`obj['port']`, `process.env['REDIS_PORT']`|**optional**|```6379```|```6379```|
|`username`|If set, client will send AUTH command with the value of this option as the first argument when connected, this is supported since Redis 6|`obj['username']`, `process.env['REDIS_USERNAME']`|**optional**|-|-|
|`password`|If set, client will send AUTH command with the value of this option when connected|`obj['password']`, `process.env['REDIS_PASSWORD']`|**optional**|-|-|
|`db`|Database index to use|`obj['db']`, `process.env['REDIS_DB']`|**optional**|```0```|```0```|

#### Static configuration


| Key    | Description | Constraints | Default | Value |
| ------ | ----------- | ----------- | ------- | ----- |
|`defaultLogger`|Default logger for application|**optional**|-|-|
|`logger`|Specifies the logger to use.  Pass `false` to turn off logging.|**optional**|-|-|
|`abortOnError`|Whether to abort the process on Error. By default, the process is exited. Pass `false` to override the default behavior. If `false` is passed, Nest will not exit the application and instead will rethrow the exception. @default true|**optional**|-|-|
|`bufferLogs`|If enabled, logs will be buffered until the "Logger#flush" method is called. @default false|**optional**|-|-|
|`autoFlushLogs`|If enabled, logs will be automatically flushed and buffer detached when application initialization process either completes or fails. @default true|**optional**|-|-|
|`preview`|Whether to run application in the preview mode. In the preview mode, providers/controllers are not instantiated & resolved. @default false|**optional**|-|-|
|`snapshot`|Whether to generate a serialized graph snapshot. @default false|**optional**|-|-|
|`featureName`|Feature name for generate prefix to environments keys|**optional**|-|-|
|`microserviceProjectName`|Microservice project name for generate prefix to environments keys (need only for microservice client)|**optional**|-|-|
|`retryAttempts`|Retry attempts|**optional**|-|-|
|`retryDelay`|Retry delay|**optional**|-|-|
|`wildcards`|Wildcards|**optional**|-|-|
|`serializer`|Serializer|**optional**|-|-|
|`deserializer`|Deserializer|**optional**|-|-|
|`Connector`|Connector|**optional**|-|-|
|`retryStrategy`|Retry strategy|**optional**|-|-|
|`commandTimeout`|Command timeout|**optional**|-|-|
|`keepAlive`|Keep alive|**optional**|-|-|
|`noDelay`|No delay|**optional**|-|-|
|`connectionName`|Connection name|**optional**|-|-|
|`autoResubscribe`|Auto resubscribe|**optional**|-|-|
|`autoResendUnfulfilledCommands`|Auto resend unfulfilled commands|**optional**|-|-|
|`reconnectOnError`|Reconnect on error|**optional**|-|-|
|`readOnly`|Read only|**optional**|-|-|
|`stringNumbers`|String numbers|**optional**|-|-|
|`connectTimeout`|Connect timeout|**optional**|-|-|
|`monitor`|Monitor|**optional**|-|-|
|`maxRetriesPerRequest`|Max retries per request|**optional**|-|-|
|`maxLoadingRetryTime`|Max loading retry time|**optional**|-|-|
|`enableAutoPipelining`|Enable auto pipelining|**optional**|-|-|
|`autoPipeliningIgnoredCommands`|Auto pipelining ignored commands|**optional**|-|-|
|`offlineQueue`|Offline queue|**optional**|-|-|
|`commandQueue`|Command queue|**optional**|-|-|
|`enableOfflineQueue`|Enable offline queue|**optional**|-|-|
|`enableReadyCheck`|The client will sent an INFO command to check whether the server is still loading data from the disk ( which happens when the server is just launched) when the connection is established, and only wait until the loading process is finished before emitting the `ready` event (default: true).|**optional**|-|-|
|`lazyConnect`|When a Redis instance is initialized, a connection to the server is immediately established. Set this to true will delay the connection to the server until the first command is sent or `redis.connect()` is called explicitly (default: false).|**optional**|-|-|
|`scripts`|Scripts|**optional**|-|-|
|`keyPrefix`|Key prefix|**optional**|-|-|
|`showFriendlyErrorStack`|Show friendly error stack|**optional**|-|-|
|`disconnectTimeout`|Disconnect timeout|**optional**|-|-|
|`tls`|Connection options|**optional**|-|-|
|`name`|Master group name of the Sentinel|**optional**|-|-|
|`role`|Role|**optional**|-|-|
|`sentinelUsername`|Sentinel username|**optional**|-|-|
|`sentinelPassword`|Sentinel password|**optional**|-|-|
|`sentinels`|Sentinels|**optional**|-|-|
|`sentinelRetryStrategy`|Sentinel retry strategy|**optional**|-|-|
|`sentinelReconnectStrategy`|Sentinel reconnect strategy|**optional**|-|-|
|`preferredSlaves`|Preferred slaves|**optional**|-|-|
|`sentinelCommandTimeout`|Sentinel command timeout|**optional**|-|-|
|`enableTLSForSentinelMode`|Enable TLS for sentinel mode|**optional**|-|-|
|`sentinelTLS`|Sentinel TLS|**optional**|-|-|
|`natMap`|Nat map|**optional**|-|-|
|`updateSentinels`|Update sentinels|**optional**|-|-|
|`sentinelMaxConnections`|Sentinel max connections|**optional**|-|-|
|`failoverDetector`|Failover detector|**optional**|-|-|

[Back to Top](#modules)

---
### RmqNestMicroservice
RabbitMQ NestJS-mod microservice initializer @see https://docs.nestjs.com/microservices/rabbitmq

#### Static environments


| Key    | Description | Sources | Constraints | Default | Value |
| ------ | ----------- | ------- | ----------- | ------- | ----- |
|`urls`|Urls|`obj['urls']`, `process.env['RMQ_URLS']`|**optional**|-|-|

#### Static configuration


| Key    | Description | Constraints | Default | Value |
| ------ | ----------- | ----------- | ------- | ----- |
|`defaultLogger`|Default logger for application|**optional**|-|-|
|`logger`|Specifies the logger to use.  Pass `false` to turn off logging.|**optional**|-|-|
|`abortOnError`|Whether to abort the process on Error. By default, the process is exited. Pass `false` to override the default behavior. If `false` is passed, Nest will not exit the application and instead will rethrow the exception. @default true|**optional**|-|-|
|`bufferLogs`|If enabled, logs will be buffered until the "Logger#flush" method is called. @default false|**optional**|-|-|
|`autoFlushLogs`|If enabled, logs will be automatically flushed and buffer detached when application initialization process either completes or fails. @default true|**optional**|-|-|
|`preview`|Whether to run application in the preview mode. In the preview mode, providers/controllers are not instantiated & resolved. @default false|**optional**|-|-|
|`snapshot`|Whether to generate a serialized graph snapshot. @default false|**optional**|-|-|
|`featureName`|Feature name for generate prefix to environments keys|**optional**|-|-|
|`microserviceProjectName`|Microservice project name for generate prefix to environments keys (need only for microservice client)|**optional**|-|-|
|`queue`|Queue|**optional**|-|-|
|`prefetchCount`|Prefetch count|**optional**|-|-|
|`isGlobalPrefetchCount`|Is global prefetch count|**optional**|-|-|
|`queueOptions`|Queue options|**optional**|-|-|
|`socketOptions`|Socket options|**optional**|-|-|
|`noAck`|No ack|**optional**|-|-|
|`consumerTag`|Consumer tag|**optional**|-|-|
|`serializer`|Serializer|**optional**|-|-|
|`deserializer`|Deserializer|**optional**|-|-|
|`replyQueue`|Reply queue|**optional**|-|-|
|`persistent`|Persistent|**optional**|-|-|
|`headers`|Headers|**optional**|-|-|
|`noAssert`|No assert|**optional**|-|-|
|`maxConnectionAttempts`|Maximum number of connection attempts, applies only to the consumer configuration (-1 - infinite)|**optional**|-|-|

[Back to Top](#modules)

---
### RmqNestMicroserviceClientModule
RabbitMQ NestJS-mod microservice client @see https://docs.nestjs.com/microservices/rabbitmq

#### Shared providers
`RmqNestMicroserviceClient`, `ClientProxyApplicationHooks`

#### Static environments


| Key    | Description | Sources | Constraints | Default | Value |
| ------ | ----------- | ------- | ----------- | ------- | ----- |
|`urls`|Urls|`obj['urls']`, `process.env['RMQ_URLS']`|**optional**|-|-|

#### Static configuration


| Key    | Description | Constraints | Default | Value |
| ------ | ----------- | ----------- | ------- | ----- |
|`defaultLogger`|Default logger for application|**optional**|-|-|
|`logger`|Specifies the logger to use.  Pass `false` to turn off logging.|**optional**|-|-|
|`abortOnError`|Whether to abort the process on Error. By default, the process is exited. Pass `false` to override the default behavior. If `false` is passed, Nest will not exit the application and instead will rethrow the exception. @default true|**optional**|-|-|
|`bufferLogs`|If enabled, logs will be buffered until the "Logger#flush" method is called. @default false|**optional**|-|-|
|`autoFlushLogs`|If enabled, logs will be automatically flushed and buffer detached when application initialization process either completes or fails. @default true|**optional**|-|-|
|`preview`|Whether to run application in the preview mode. In the preview mode, providers/controllers are not instantiated & resolved. @default false|**optional**|-|-|
|`snapshot`|Whether to generate a serialized graph snapshot. @default false|**optional**|-|-|
|`featureName`|Feature name for generate prefix to environments keys|**optional**|-|-|
|`microserviceProjectName`|Microservice project name for generate prefix to environments keys (need only for microservice client)|**optional**|-|-|
|`queue`|Queue|**optional**|-|-|
|`prefetchCount`|Prefetch count|**optional**|-|-|
|`isGlobalPrefetchCount`|Is global prefetch count|**optional**|-|-|
|`queueOptions`|Queue options|**optional**|-|-|
|`socketOptions`|Socket options|**optional**|-|-|
|`noAck`|No ack|**optional**|-|-|
|`consumerTag`|Consumer tag|**optional**|-|-|
|`serializer`|Serializer|**optional**|-|-|
|`deserializer`|Deserializer|**optional**|-|-|
|`replyQueue`|Reply queue|**optional**|-|-|
|`persistent`|Persistent|**optional**|-|-|
|`headers`|Headers|**optional**|-|-|
|`noAssert`|No assert|**optional**|-|-|
|`maxConnectionAttempts`|Maximum number of connection attempts, applies only to the consumer configuration (-1 - infinite)|**optional**|-|-|

[Back to Top](#modules)

---
### TcpNestMicroservice
TCP NestJS-mod microservice initializer @see https://docs.nestjs.com/microservices/basics

#### Static environments


| Key    | Description | Sources | Constraints | Default | Value |
| ------ | ----------- | ------- | ----------- | ------- | ----- |
|`host`|Host|`obj['host']`, `process.env['TCP_HOST']`|**optional**|-|-|
|`port`|Port|`obj['port']`, `process.env['TCP_PORT']`|**optional**|-|-|

#### Static configuration


| Key    | Description | Constraints | Default | Value |
| ------ | ----------- | ----------- | ------- | ----- |
|`defaultLogger`|Default logger for application|**optional**|-|-|
|`logger`|Specifies the logger to use.  Pass `false` to turn off logging.|**optional**|-|-|
|`abortOnError`|Whether to abort the process on Error. By default, the process is exited. Pass `false` to override the default behavior. If `false` is passed, Nest will not exit the application and instead will rethrow the exception. @default true|**optional**|-|-|
|`bufferLogs`|If enabled, logs will be buffered until the "Logger#flush" method is called. @default false|**optional**|-|-|
|`autoFlushLogs`|If enabled, logs will be automatically flushed and buffer detached when application initialization process either completes or fails. @default true|**optional**|-|-|
|`preview`|Whether to run application in the preview mode. In the preview mode, providers/controllers are not instantiated & resolved. @default false|**optional**|-|-|
|`snapshot`|Whether to generate a serialized graph snapshot. @default false|**optional**|-|-|
|`featureName`|Feature name for generate prefix to environments keys|**optional**|-|-|
|`microserviceProjectName`|Microservice project name for generate prefix to environments keys (need only for microservice client)|**optional**|-|-|
|`retryAttempts`|Retry attempts|**optional**|-|-|
|`retryDelay`|Retry delay|**optional**|-|-|
|`serializer`|Serializer|**optional**|-|-|
|`tlsOptions`|TLS options|**optional**|-|-|
|`deserializer`|Deserializer|**optional**|-|-|
|`socketClass`|Socket class|**optional**|-|-|

[Back to Top](#modules)

---
### TcpNestMicroserviceClientModule
TCP NestJS-mod microservice client @see https://docs.nestjs.com/microservices/basics

#### Shared providers
`TcpNestMicroserviceClient`, `ClientProxyApplicationHooks`

#### Static environments


| Key    | Description | Sources | Constraints | Default | Value |
| ------ | ----------- | ------- | ----------- | ------- | ----- |
|`host`|Host|`obj['host']`, `process.env['TCP_HOST']`|**optional**|-|-|
|`port`|Port|`obj['port']`, `process.env['TCP_PORT']`|**optional**|-|-|

#### Static configuration


| Key    | Description | Constraints | Default | Value |
| ------ | ----------- | ----------- | ------- | ----- |
|`defaultLogger`|Default logger for application|**optional**|-|-|
|`logger`|Specifies the logger to use.  Pass `false` to turn off logging.|**optional**|-|-|
|`abortOnError`|Whether to abort the process on Error. By default, the process is exited. Pass `false` to override the default behavior. If `false` is passed, Nest will not exit the application and instead will rethrow the exception. @default true|**optional**|-|-|
|`bufferLogs`|If enabled, logs will be buffered until the "Logger#flush" method is called. @default false|**optional**|-|-|
|`autoFlushLogs`|If enabled, logs will be automatically flushed and buffer detached when application initialization process either completes or fails. @default true|**optional**|-|-|
|`preview`|Whether to run application in the preview mode. In the preview mode, providers/controllers are not instantiated & resolved. @default false|**optional**|-|-|
|`snapshot`|Whether to generate a serialized graph snapshot. @default false|**optional**|-|-|
|`featureName`|Feature name for generate prefix to environments keys|**optional**|-|-|
|`microserviceProjectName`|Microservice project name for generate prefix to environments keys (need only for microservice client)|**optional**|-|-|
|`retryAttempts`|Retry attempts|**optional**|-|-|
|`retryDelay`|Retry delay|**optional**|-|-|
|`serializer`|Serializer|**optional**|-|-|
|`tlsOptions`|TLS options|**optional**|-|-|
|`deserializer`|Deserializer|**optional**|-|-|
|`socketClass`|Socket class|**optional**|-|-|

[Back to Top](#modules)

## Links

* https://github.com/nestjs-mod/nestjs-mod - A collection of utilities for unifying NestJS applications and modules
* https://github.com/nestjs-mod/nestjs-mod-contrib - Contrib repository for the NestJS-mod
* https://github.com/nestjs-mod/nestjs-mod-example - Example application built with [@nestjs-mod/schematics](https://github.com/nestjs-mod/nestjs-mod/tree/master/libs/schematics)
* https://github.com/nestjs-mod/nestjs-mod/blob/master/apps/example-basic/INFRASTRUCTURE.MD - A simple example of infrastructure documentation.
* https://github.com/nestjs-mod/nestjs-mod-contrib/blob/master/apps/example-prisma/INFRASTRUCTURE.MD - An extended example of infrastructure documentation with a docker-compose file and a data base.
* https://dev.to/endykaufman/collection-of-nestjs-mod-utilities-for-unifying-applications-and-modules-on-nestjs-5256 - Article about the project NestJS-mod
* https://habr.com/ru/articles/788916 - Коллекция утилит NestJS-mod для унификации приложений и модулей на NestJS


## License

MIT

[npm-image]: https://badgen.net/npm/v/@nestjs-mod/microservices
[npm-url]: https://npmjs.org/package/@nestjs-mod/microservices
[telegram-image]: https://img.shields.io/badge/group-telegram-blue.svg?maxAge=2592000
[telegram-url]: https://t.me/nestjs_mod
[discord-image]: https://img.shields.io/badge/discord-online-brightgreen.svg
[discord-url]: https://discord.gg/meY7UXaG
[downloads-image]: https://badgen.net/npm/dm/@nestjs-mod/microservices
[downloads-url]: https://npmjs.org/package/@nestjs-mod/microservices
