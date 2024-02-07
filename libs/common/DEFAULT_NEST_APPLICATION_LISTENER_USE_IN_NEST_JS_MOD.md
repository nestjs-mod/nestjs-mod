Use with manual environments and custom configuration.

```typescript
import {
  bootstrapNestApplication,
  DefaultNestApplicationInitializer,
  DefaultNestApplicationListener,
  isInfrastructureMode,
} from '@nestjs-mod/common';

bootstrapNestApplication({
  modules: {
    system: [
      DefaultNestApplicationInitializer.forRoot(),
      DefaultNestApplicationListener.forRoot({
        staticEnvironments: { port: 3000 },
        staticConfiguration: {
          mode: isInfrastructureMode() ? 'init' : 'listen',
        },
      }),
    ],
  },
});
```
