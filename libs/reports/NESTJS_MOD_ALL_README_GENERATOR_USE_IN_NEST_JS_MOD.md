Example of use with all need options.

```typescript
import { bootstrapNestApplication } from '@nestjs-mod/common';
import { NestjsModAllReadmeGenerator } from '@nestjs-mod/reports';
import { join } from 'path';

const libFolder = join(__dirname, '..', '..', '..', 'libs/common');

bootstrapNestApplication({
  modules: {
    infrastructure: [
      NestjsModAllReadmeGenerator.forRoot({
        contextName: 'common',
        staticConfiguration: {
          telegramGroup: 'https://t.me/nestjs_mod',
          discord: 'https://discord.gg/meY7UXaG',
          packageFile: join(libFolder, 'package.json'),
          markdownFile: join(libFolder, 'README.md'),
          folderWithMarkdownFilesToUse: libFolder,
          utilsFolders: [join(libFolder, 'src/lib')],
          modules: [import('@nestjs-mod/common')],
          markdownFooter: `
## Links

* https://github.com/nestjs-mod/nestjs-mod - A collection of utilities for unifying NestJS applications and modules
* https://github.com/nestjs-mod/nestjs-mod-contrib - Contrib repository for the NestJS-mod
`,
        },
      }),
    ],
  },
});
```
