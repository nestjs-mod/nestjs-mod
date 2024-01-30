Use with options.

```typescript
import { bootstrapNestApplication, InfrastructureMarkdownReportGenerator } from '@nestjs-mod/common';
import { join } from 'path';

bootstrapNestApplication({
  modules: {
    infrastructure: [
      InfrastructureMarkdownReportGenerator.forRoot({
        staticConfiguration: {
          markdownFile: join(__dirname, '..', '..', '..', 'apps', 'example-basic', 'INFRASTRUCTURE.MD'),
          skipEmptySettings: true,
        },
      }),
    ],
  },
});
```
