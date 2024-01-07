import { bootstrapNestApplication, createNestModule } from '@nestjs-mod/common';
import { DefaultTestNestApplicationCreate } from '@nestjs-mod/testing';
import { INestApplication } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await bootstrapNestApplication({
      project: {
        name: 'TestApplication',
        description: 'Test application',
      },
      modules: {
        system: [DefaultTestNestApplicationCreate.forRoot()],
        feature: [
          createNestModule({
            moduleName: 'TestAppModule',
            controllers: [AppController],
            providers: [AppService],
          }).TestAppModule.forRoot(),
        ],
      },
    });
  });

  describe('getData', () => {
    it('should return "Hello World!"', () => {
      const appController = app.get<AppController>(AppController);
      expect(appController.getHello()).toEqual('Hello World!');
    });
  });
});
