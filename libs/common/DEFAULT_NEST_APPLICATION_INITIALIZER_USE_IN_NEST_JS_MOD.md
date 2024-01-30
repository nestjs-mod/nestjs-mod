Use without options.

```typescript
import { bootstrapNestApplication, DefaultNestApplicationInitializer } from '@nestjs-mod/common';

bootstrapNestApplication({
  modules: {
    system: [DefaultNestApplicationInitializer.forRoot()],
  },
});
```

Example of change cors options.

```typescript
import { bootstrapNestApplication, DefaultNestApplicationInitializer } from '@nestjs-mod/common';

bootstrapNestApplication({
  modules: {
    system: [
      DefaultNestApplicationInitializer.forRoot({
        staticConfiguration: {
          cors: {
            origin: '*',
            methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
            preflightContinue: false,
            optionsSuccessStatus: 204,
          },
        },
      }),
    ],
  },
});
```
