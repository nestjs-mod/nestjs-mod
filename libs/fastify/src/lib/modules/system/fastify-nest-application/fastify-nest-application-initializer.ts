import {
  ConfigModel,
  ConfigModelProperty,
  DynamicNestModuleMetadata,
  NestModuleCategory,
  createNestModule,
  isInfrastructureMode,
} from '@nestjs-mod/common';
import { ConsoleLogger, LogLevel, Logger, LoggerService, Module, NestApplicationOptions } from '@nestjs/common';
import { CorsOptions, CorsOptionsDelegate } from '@nestjs/common/interfaces/external/cors-options.interface';
import { HttpsOptions } from '@nestjs/common/interfaces/external/https-options.interface';
import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';

@ConfigModel()
class FastifyNestApplicationInitializerConfig implements NestApplicationOptions {
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
    description: 'Fastify logger for application',
    default: new ConsoleLogger(),
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

  @ConfigModelProperty({
    description: 'Method for additional actions before listening',
  })
  wrapFastifyAdapter?: (fastifyAdapter: FastifyAdapter) => FastifyAdapter | void;
}

export const { FastifyNestApplicationInitializer } = createNestModule({
  moduleName: 'FastifyNestApplicationInitializer',
  moduleDescription: 'Fastify NestJS application initializer.',
  moduleCategory: NestModuleCategory.system,
  staticConfigurationModel: FastifyNestApplicationInitializerConfig,
  // creating application
  wrapApplication: async ({ modules, current }) => {
    @Module({
      imports: Object.entries(modules)
        .filter(([category]) => isInfrastructureMode() || category !== NestModuleCategory.infrastructure)
        .map(([, value]) => value)
        .flat()
        .filter((m: DynamicNestModuleMetadata) => !m.getNestModuleMetadata?.()?.moduleDisabled),
    })
    class FastifyNestApp {}

    let fastifyAdapter = new FastifyAdapter({
      logger: true,
    });

    if (current?.staticConfiguration?.wrapFastifyAdapter) {
      const newWrapFastifyAdapter = current?.staticConfiguration.wrapFastifyAdapter(fastifyAdapter);
      if (newWrapFastifyAdapter) {
        fastifyAdapter = newWrapFastifyAdapter;
      }
    }

    const app = await NestFactory.create<NestFastifyApplication>(
      FastifyNestApp,
      fastifyAdapter,
      current?.staticConfiguration
    );
    if (current.staticConfiguration?.defaultLogger) {
      app.useLogger(current.staticConfiguration?.defaultLogger);
    }
    return app;
  },
});
