Use without options.

```typescript
import { bootstrapNestApplication } from '@nestjs-mod/common';
import { DefaultTestNestApplicationCreate } from '@nestjs-mod/testing';

bootstrapNestApplication({
  modules: {
    system: [DefaultTestNestApplicationCreate.forRoot()],
  },
});
```

Example of use with override provider.

```typescript
import { bootstrapNestApplication } from '@nestjs-mod/common';
import { DefaultTestNestApplicationCreate } from '@nestjs-mod/testing';
import { Injectable } from '@nestjs/common';

@Injectable()
export class CatsService {
  findAll() {
    return ['cats'];
  }
}

const fakeCatsService = { findAll: () => ['test'] };

bootstrapNestApplication({
  modules: {
    system: [
      DefaultTestNestApplicationCreate.forRoot({
        staticConfiguration: {
          wrapTestingModuleBuilder: (testingModuleBuilder) =>
            testingModuleBuilder.overrideProvider(CatsService).useValue(fakeCatsService),
        },
      }),
    ],
  },
});
```
