import { INestApplication, LogLevel, Logger, LoggerService, Module, NestApplicationOptions } from '@nestjs/common';
import { CorsOptions, CorsOptionsDelegate } from '@nestjs/common/interfaces/external/cors-options.interface';
import { HttpsOptions } from '@nestjs/common/interfaces/external/https-options.interface';
import { NestFactory } from '@nestjs/core';
import { ConfigModel, ConfigModelProperty } from '../../../config-model/decorators';
import { NestModuleCategory, WrapApplicationOptions } from '../../../nest-module/types';
import { collectRootNestModules, createNestModule } from '../../../nest-module/utils';

@ConfigModel()
export class DefaultNestApplicationInitializerConfig implements NestApplicationOptions {
  @ConfigModelProperty({
    description: 'CORS options from [CORS package](https://github.com/expressjs/cors#configuration-options)',
    default: {
      credentials: true,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      origin: (req: any, callback: (arg0: null, arg1: boolean) => void) => {
        callback(null, true);
      },
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    },
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
  })
  defaultLogger?: Logger | null;

  /**
   * Specifies the logger to use.  Pass `false` to turn off logging.
   */
  @ConfigModelProperty({
    description: 'Specifies the logger to use.  Pass `false` to turn off logging.',
  })
  logger?: LoggerService | LogLevel[] | false;

  /**
   * Whether to abort the process on Error. By default, the process is exited.
   * Pass `false` to override the default behavior. If `false` is passed, Nest will not exit
   * the application and instead will rethrow the exception.
   * @default true
   */
  @ConfigModelProperty({
    description:
      'Whether to abort the process on Error. By default, the process is exited. Pass `false` to override the default behavior. If `false` is passed, Nest will not exit the application and instead will rethrow the exception. @default true',
  })
  abortOnError?: boolean;

  /**
   * If enabled, logs will be buffered until the "Logger#flush" method is called.
   * @default false
   */
  @ConfigModelProperty({
    description: 'If enabled, logs will be buffered until the "Logger#flush" method is called. @default false',
  })
  bufferLogs?: boolean;

  /**
   * If enabled, logs will be automatically flushed and buffer detached when
   * application initialization process either completes or fails.
   * @default true
   */
  @ConfigModelProperty({
    description:
      'If enabled, logs will be automatically flushed and buffer detached when application initialization process either completes or fails. @default true',
  })
  autoFlushLogs?: boolean;

  /**
   * Whether to run application in the preview mode.
   * In the preview mode, providers/controllers are not instantiated & resolved.
   *
   * @default false
   */
  @ConfigModelProperty({
    description:
      'Whether to run application in the preview mode. In the preview mode, providers/controllers are not instantiated & resolved. @default false',
  })
  preview?: boolean;

  /**
   * Whether to generate a serialized graph snapshot.
   *
   * @default false
   */
  @ConfigModelProperty({
    description: 'Whether to generate a serialized graph snapshot. @default false',
  })
  snapshot?: boolean;

  /**
   * Force close open HTTP connections. Useful if restarting your application hangs due to
   * keep-alive connections in the HTTP adapter.
   */
  @ConfigModelProperty({
    description:
      'Force close open HTTP connections. Useful if restarting your application hangs due to keep-alive connections in the HTTP adapter.',
    default: true,
  })
  forceCloseConnections?: boolean;

  @ConfigModelProperty({
    description: 'Method for additional actions before listening',
  })
  preCreateApplication?: (
    options: WrapApplicationOptions<INestApplication, DefaultNestApplicationInitializerConfig>
  ) => Promise<void>;

  @ConfigModelProperty({
    description: 'Method for additional actions after listening',
  })
  postCreateApplication?: (
    options: WrapApplicationOptions<INestApplication, DefaultNestApplicationInitializerConfig>
  ) => Promise<void>;
}

export const { DefaultNestApplicationInitializer } = createNestModule({
  moduleName: 'DefaultNestApplicationInitializer',
  moduleDescription: 'Default NestJS application initializer.',
  moduleCategory: NestModuleCategory.system,
  staticConfigurationModel: DefaultNestApplicationInitializerConfig,
  // creating application
  wrapApplication: async ({ app, modules, current }) => {
    if (current.staticConfiguration?.preCreateApplication) {
      await current.staticConfiguration.preCreateApplication({
        app,
        current,
      } as WrapApplicationOptions<INestApplication, DefaultNestApplicationInitializerConfig>);
    }

    @Module({
      imports: collectRootNestModules(modules),
    })
    class DefaultNestApp {}

    if (app) {
      throw new Error('The application has already been initialized');
    }
    app = await NestFactory.create(DefaultNestApp, current?.staticConfiguration);

    if (current.staticConfiguration?.postCreateApplication) {
      await current.staticConfiguration.postCreateApplication({
        app,
        current,
      } as WrapApplicationOptions<INestApplication, DefaultNestApplicationInitializerConfig>);
    }

    if (current.staticConfiguration?.defaultLogger) {
      app.useLogger(current.staticConfiguration?.defaultLogger);
    }
    return app;
  },
});
