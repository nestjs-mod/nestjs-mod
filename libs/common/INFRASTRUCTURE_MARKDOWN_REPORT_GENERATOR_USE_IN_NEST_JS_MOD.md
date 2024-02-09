Use with options.

```typescript
import { bootstrapNestApplication, InfrastructureMarkdownReportGenerator } from '@nestjs-mod/common';
import { join } from 'path';

const appFolder = join(__dirname, '..', '..', '..', 'apps', 'example-basic');

bootstrapNestApplication({
  modules: {
    infrastructure: [
      InfrastructureMarkdownReportGenerator.forRoot({
        staticConfiguration: {
          markdownFile: join(appFolder, 'INFRASTRUCTURE.MD'),
          skipEmptySettings: true,
        },
      }),
    ],
  },
});
```
