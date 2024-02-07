Use the forRoot method to create a global report store.

```typescript
import { bootstrapNestApplication, InfrastructureMarkdownReportStorage } from '@nestjs-mod/common';

bootstrapNestApplication({
  modules: {
    infrastructure: [InfrastructureMarkdownReportStorage.forRoot()],
  },
});
```

An example of using global storage in a module.

```typescript
import {
  bootstrapNestApplication,
  createNestModule,
  DefaultNestApplicationInitializer,
  DefaultNestApplicationListener,
  InfrastructureMarkdownReportGenerator,
  InfrastructureMarkdownReportStorage,
  InfrastructureMarkdownReportStorageService,
} from '@nestjs-mod/common';
import { Injectable } from '@nestjs/common';

@Injectable()
class AppReportService {
  constructor(private readonly infrastructureMarkdownReportStorage: InfrastructureMarkdownReportStorageService) {}

  getReport() {
    return this.infrastructureMarkdownReportStorage.report;
  }
}

const { App1Module } = createNestModule({
  moduleName: 'App1Module',
  imports: [InfrastructureMarkdownReportStorage.forFeature()],
  providers: [AppReportService],
});

bootstrapNestApplication({
  modules: {
    infrastructure: [InfrastructureMarkdownReportStorage.forRoot(), InfrastructureMarkdownReportGenerator.forRoot()],
    system: [
      DefaultNestApplicationInitializer.forRoot(),
      DefaultNestApplicationListener.forRoot({
        staticConfiguration: {
          postListen: async ({ app }) => {
            if (app) {
              const appReportService = app.get(AppReportService);

              console.log(appReportService.getReport()); // # TestApp ...
            }
          },
        },
        staticEnvironments: { port: 3012 },
      }),
    ],
    feature: [App1Module.forRoot()],
  },
});
```
