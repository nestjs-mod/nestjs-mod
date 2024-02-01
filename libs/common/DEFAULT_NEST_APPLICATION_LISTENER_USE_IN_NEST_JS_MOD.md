Use with manual environments and custom configuration.

```typescript
import {
  bootstrapNestApplication,
  DefaultNestApplicationInitializer,
  DefaultNestApplicationListener,
  isInfrastructureMode,
} from '@nestjs-mod/common';
import { Logger } from '@nestjs/common';

bootstrapNestApplication({
  modules: {
    system: [
      DefaultNestApplicationInitializer.forRoot(),
      DefaultNestApplicationListener.forRoot({
        staticEnvironments: { port: 3000 },
        staticConfiguration: {
          mode: isInfrastructureMode() ? 'init' : 'listen',
          preListen: async ({ app }) => {
            if (app) {
              app.setGlobalPrefix('api');
            }
          },
          postListen: async ({ current }) => {
            if (isInfrastructureMode()) {
              /**
               * When you start the application in infrastructure mode, it should automatically close;
               * if for some reason it does not close, we forcefully close it after 30 seconds.
               */
              setTimeout(() => process.exit(0), 30000);
            }
            Logger.log(
              `🚀 Application is running on: http://${current.staticEnvironments?.hostname || 'localhost'}:${
                current.staticEnvironments?.port
              }/api`
            );
          },
        },
      }),
    ],
  },
});
```
