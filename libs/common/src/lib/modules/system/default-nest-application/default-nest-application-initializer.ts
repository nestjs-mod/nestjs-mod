import { ConsoleLogger, Logger, Module, NestApplicationOptions } from '@nestjs/common';
import { CorsOptions, CorsOptionsDelegate } from '@nestjs/common/interfaces/external/cors-options.interface';
import { HttpsOptions } from '@nestjs/common/interfaces/external/https-options.interface';
import { NestFactory } from '@nestjs/core';
import { ConfigModel, ConfigModelProperty } from '../../../config-model/decorators';
import { DynamicNestModuleMetadata, NestModuleCategory } from '../../../nest-module/types';
import { createNestModule } from '../../../nest-module/utils';

@ConfigModel()
class DefaultNestApplicationInitializerConfig implements NestApplicationOptions {
  @ConfigModelProperty({
    description: 'CORS options from [CORS package](https://github.com/expressjs/cors#configuration-options)',
  })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  cors?: boolean | CorsOptions | CorsOptionsDelegate<any>;

  @ConfigModelProperty({
    description: 'Whether to use underlying platform body parser.',
  })
  bodyParser?: boolean;

  @ConfigModelProperty({ description: 'Set of configurable HTTPS options' })
  httpsOptions?: HttpsOptions;

  @ConfigModelProperty({
    description: 'Whether to register the raw request body on the request. Use `req.rawBody`.',
  })
  rawBody?: boolean;

  @ConfigModelProperty({
    description: 'Default logger for application',
    default: new ConsoleLogger(),
  })
  defaultLogger?: Logger | null;
}

export const { DefaultNestApplicationInitializer } = createNestModule({
  moduleName: 'DefaultNestApplicationInitializer',
  moduleDescription: 'Default NestJS application initializer, no third party utilities required.',
  moduleCategory: NestModuleCategory.system,
  staticConfigurationModel: DefaultNestApplicationInitializerConfig,
  wrapApplication: async ({ modules, current }) => {
    @Module({
      imports: Object.values(modules)
        .flat()
        .filter(
          (m: DynamicNestModuleMetadata) =>
            !m.nestModuleMetadata?.moduleDisabled &&
            !m.nestModuleMetadata?.preWrapApplication &&
            !m.nestModuleMetadata?.postWrapApplication
        ),
    })
    class BasicNestApp {}
    const app = await NestFactory.create(BasicNestApp, current?.staticConfiguration);
    if (current.staticConfiguration?.defaultLogger) {
      app.useLogger(current.staticConfiguration?.defaultLogger);
    }
    return app;
  },
});
