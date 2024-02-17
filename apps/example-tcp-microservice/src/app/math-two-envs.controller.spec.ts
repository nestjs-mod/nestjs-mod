import {
  DefaultNestApplicationInitializer,
  DefaultNestApplicationListener,
  bootstrapNestApplication,
  createNestModule,
} from '@nestjs-mod/common';
import { TcpNestMicroservice, TcpNestMicroserviceClientModule } from '@nestjs-mod/microservices';
import { TestingModule } from '@nestjs/testing';
import { lastValueFrom } from 'rxjs';
import { setTimeout } from 'timers/promises';
import { AppModule } from './app.module';
import { MathTwoClientService } from './math-two-client.service';
import { MathController } from './math.controller';

describe('Math over TCP with two servers and use envs', () => {
  let server1: TestingModule;
  let server2: TestingModule;
  let client: TestingModule;

  let mathController1: MathController;
  let mathController2: MathController;

  beforeAll(async () => {
    // ms 1
    process.env.TEST_TWO_ENVS_MICROSERVICE_SERVER_TCP_PORT = '5020';
    server1 = await bootstrapNestApplication({
      // logger: new Logger('Server'),
      project: {
        name: 'TestTwoEnvsMicroserviceServer',
        description: 'Test microservice server',
      },
      modules: {
        system: [TcpNestMicroservice.forRoot(), DefaultNestApplicationListener.forRoot()],
        feature: [AppModule.forRoot()],
      },
    });

    mathController1 = server1.get<MathController>(MathController);

    // ms 2
    process.env.TEST_TWO_ENVS_MICROSERVICE_SERVER_2_TCP_PORT = '5022';
    server2 = await bootstrapNestApplication({
      // logger: new Logger('Server'),
      project: {
        name: 'TestTwoEnvsMicroserviceServer2',
        description: 'Test microservice server 2',
      },
      modules: {
        system: [TcpNestMicroservice.forRoot(), DefaultNestApplicationListener.forRoot()],
        feature: [AppModule.forRoot()],
      },
    });

    mathController2 = server2.get<MathController>(MathController);

    process.env.TEST_TWO_ENVS_MICROSERVICE_CLIENT_PORT = '3020';
    client = await bootstrapNestApplication({
      // logger: new Logger('Client'),
      project: {
        name: 'TestTwoEnvsMicroserviceClient',
        description: 'Test microservice client',
      },
      modules: {
        system: [
          DefaultNestApplicationInitializer.forRoot({}),
          DefaultNestApplicationListener.forRoot({ staticConfiguration: { mode: 'init' } }),
        ],
        feature: [
          createNestModule({
            moduleName: 'MicroserviceClientModule',
            imports: [
              TcpNestMicroserviceClientModule.forRoot({
                contextName: 'ms1',
                staticConfiguration: { microserviceProjectName: 'TestTwoEnvsMicroserviceServer' },
              }),
              TcpNestMicroserviceClientModule.forRoot({
                contextName: 'ms2',
                staticConfiguration: {
                  microserviceProjectName: 'TestTwoEnvsMicroserviceServer2',
                },
              }),
            ],
            providers: [MathTwoClientService],
          }).MicroserviceClientModule.forRoot(),
        ],
      },
    });
  });

  afterAll(async () => {
    await client.close();
    await server1.close();
    await server2.close();
  });

  describe('sum', () => {
    it('should return "6"', async () => {
      const mathClientService = client.get<MathTwoClientService>(MathTwoClientService);
      const result = await lastValueFrom(mathClientService.sum([1, 2, 3]));
      expect(result).toEqual(6);

      expect(mathClientService.sumResult).toEqual([6]);
      expect(mathController1.sumResult).toEqual([[1, 2, 3]]);
      expect(mathController2.sumResult).toEqual([]);
    });
    it('should return "6" on server 2', async () => {
      const mathClientService = client.get<MathTwoClientService>(MathTwoClientService);
      const result = await lastValueFrom(mathClientService.sum2([1, 2, 3]));
      expect(result).toEqual(6);

      expect(mathClientService.sumResult).toEqual([6, 6]);
      expect(mathController1.sumResult).toEqual([[1, 2, 3]]);
      expect(mathController2.sumResult).toEqual([[1, 2, 3]]);
    });
  });

  describe('getDate', () => {
    it('error, should return "time.us.east"', async () => {
      const mathClientService = client.get<MathTwoClientService>(MathTwoClientService);
      try {
        await lastValueFrom(mathClientService.getDate([1, 2, 3]));
      } catch (error) {
        expect(error).toEqual('There is no matching message handler defined in the remote service.');
      }

      expect(mathClientService.getDateResult).toEqual([]);
      expect(mathController1.getDateResult).toEqual([]);
      expect(mathController2.getDateResult).toEqual([]);
    });
    it('error, should return "time.us.east" on server 2', async () => {
      const mathClientService = client.get<MathTwoClientService>(MathTwoClientService);
      try {
        await lastValueFrom(mathClientService.getDate2([1, 2, 3]));
      } catch (error) {
        expect(error).toEqual('There is no matching message handler defined in the remote service.');
      }

      expect(mathClientService.getDateResult).toEqual([]);
      expect(mathController1.getDateResult).toEqual([]);
      expect(mathController2.getDateResult).toEqual([]);
    });
  });

  describe('asyncSum', () => {
    it('should return "6"', async () => {
      const mathClientService = client.get<MathTwoClientService>(MathTwoClientService);
      const result = await lastValueFrom(mathClientService.asyncSum([1, 2, 3]));
      expect(result).toEqual(6);

      expect(mathClientService.asyncSumResult).toEqual([6]);
      expect(mathController1.asyncSumResult).toEqual([[1, 2, 3]]);
      expect(mathController2.asyncSumResult).toEqual([]);
    });
    it('should return "6" on server 2', async () => {
      const mathClientService = client.get<MathTwoClientService>(MathTwoClientService);
      const result = await lastValueFrom(mathClientService.asyncSum2([1, 2, 3]));
      expect(result).toEqual(6);

      expect(mathClientService.asyncSumResult).toEqual([6, 6]);
      expect(mathController1.asyncSumResult).toEqual([[1, 2, 3]]);
      expect(mathController2.asyncSumResult).toEqual([[1, 2, 3]]);
    });
  });

  describe('observableSum', () => {
    it('should return "36"', async () => {
      const mathClientService = client.get<MathTwoClientService>(MathTwoClientService);
      const result = await lastValueFrom(mathClientService.observableSum([1, 2, 3]));
      expect(result).toEqual(36);

      expect(mathClientService.observableSumResult).toEqual([6, 18, 36]);
      expect(mathController1.observableSumResult).toEqual([[1, 2, 3]]);
      expect(mathController2.observableSumResult).toEqual([]);
    });
    it('should return "36" on server 2', async () => {
      const mathClientService = client.get<MathTwoClientService>(MathTwoClientService);
      const result = await lastValueFrom(mathClientService.observableSum2([1, 2, 3]));
      expect(result).toEqual(36);

      expect(mathClientService.observableSumResult).toEqual([6, 18, 36, 6, 18, 36]);
      expect(mathController1.observableSumResult).toEqual([[1, 2, 3]]);
      expect(mathController2.observableSumResult).toEqual([[1, 2, 3]]);
    });
  });

  describe('handleUserCreated', () => {
    it('should return "undefined"', async () => {
      const mathClientService = client.get<MathTwoClientService>(MathTwoClientService);
      const result = await lastValueFrom(mathClientService.handleUserCreated({ userId: 1 }));
      expect(result).toEqual(undefined);
      await setTimeout(1000);

      expect(mathClientService.handleUserCreatedResult).toEqual([undefined]);
      expect(mathController1.handleUserCreatedResult).toEqual([{ userId: 1 }]);
      expect(mathController2.handleUserCreatedResult).toEqual([]);
    });
    it('should return "undefined" on server 2', async () => {
      const mathClientService = client.get<MathTwoClientService>(MathTwoClientService);
      const result = await lastValueFrom(mathClientService.handleUserCreated2({ userId: 1 }));
      expect(result).toEqual(undefined);
      await setTimeout(1000);

      expect(mathClientService.handleUserCreatedResult).toEqual([undefined, undefined]);
      expect(mathController1.handleUserCreatedResult).toEqual([{ userId: 1 }]);
      expect(mathController2.handleUserCreatedResult).toEqual([{ userId: 1 }]);
    });
  });
});
