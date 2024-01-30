Use without options.

```typescript
import { bootstrapNestApplication } from '@nestjs-mod/common';
import { DefaultTestNestApplicationCreate, DefaultTestNestApplicationInitializer } from '@nestjs-mod/testing';

bootstrapNestApplication({
  modules: {
    system: [DefaultTestNestApplicationCreate.forRoot(), DefaultTestNestApplicationInitializer.forRoot()],
  },
});
```

An example of getting a provider after running a test application.

```typescript
import { bootstrapNestApplication } from '@nestjs-mod/common';
import { DefaultTestNestApplicationCreate, DefaultTestNestApplicationInitializer } from '@nestjs-mod/testing';
import { Injectable } from '@nestjs/common';

@Injectable()
export class CatsService {
  findAll() {
    return ['cats'];
  }
}

bootstrapNestApplication({
  modules: {
    system: [
      DefaultTestNestApplicationCreate.forRoot(),
      DefaultTestNestApplicationInitializer.forRoot({
        staticConfiguration: {
          postInit: async ({ app }) => {
            if (app) {
              const catsService = app.get(CatsService);
              console.log(catsService.findAll());
            }
          },
        },
      }),
    ],
  },
});
```
