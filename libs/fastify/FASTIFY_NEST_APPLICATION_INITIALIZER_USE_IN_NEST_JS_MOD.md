Use without options.

```typescript
import { bootstrapNestApplication } from '@nestjs-mod/common';
import { FastifyNestApplicationInitializer } from '@nestjs-mod/fastify';

bootstrapNestApplication({
  modules: {
    system: [FastifyNestApplicationInitializer.forRoot()],
  },
});
```

Example of register fastify plugin.

```typescript
import { bootstrapNestApplication } from '@nestjs-mod/common';
import { FastifyNestApplicationInitializer } from '@nestjs-mod/fastify';
import * as fmp from 'fastify-multipart';

bootstrapNestApplication({
  modules: {
    system: [
      FastifyNestApplicationInitializer.forRoot({
        staticConfiguration: {
          wrapFastifyAdapter: (fastifyAdapter: FastifyAdapter) => {
            fastifyAdapter.register(fmp);
          },
        },
      }),
    ],
  },
});
```
