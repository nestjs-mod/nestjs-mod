import { bootstrapNestApplication, createNestModule } from '@nestjs-mod/common';
import { DefaultTestNestApplicationCreate } from '@nestjs-mod/testing';
import { AppService } from './app.service';

describe('AppService', () => {
  let service: AppService;

  beforeAll(async () => {
    const app = await bootstrapNestApplication({
      project: {
        name: 'TestApplication',
        description: 'Test application',
      },
      modules: {
        system: [DefaultTestNestApplicationCreate.forRoot()],
        feature: [
          createNestModule({
            moduleName: 'TestAppModule',
            providers: [AppService],
          }).TestAppModule.forRoot(),
        ],
      },
    });

    service = app.get<AppService>(AppService);
  });

  describe('getData', () => {
    it('should return "Hello World!"', () => {
      expect(service.getHello()).toEqual('Hello World!');
    });
  });
});
