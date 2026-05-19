import {
  DefaultNestApplicationInitializer,
  DefaultNestApplicationListener,
  bootstrapNestApplication,
  createNestModule,
} from '@nestjs-mod/common';
import { TcpNestMicroservice } from '@nestjs-mod/microservices';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { TestingModule } from '@nestjs/testing';
import { lastValueFrom } from 'rxjs';
import { setTimeout } from 'timers/promises';
import { AppModule } from './app.module';
import { MathClientService } from './math-client.service';
import { MathController } from './math.controller';

describe('Math over TCP', () => {
  let server: TestingModule;
  let client: TestingModule;

  let mathController: MathController;

  beforeAll(async () => {
    server = await bootstrapNestApplication({
      // logger: new Logger('Server'),
      project: {
        name: 'TestMicroserviceServer',
        description: 'Test microservice server',
      },
      modules: {
        system: [
          TcpNestMicroservice.forRoot({ staticEnvironments: { port: 5000, host: 'localhost' } }),
          DefaultNestApplicationListener.forRoot(),
        ],
        feature: [AppModule.forRoot()],
      },
    });

    mathController = server.get<MathController>(MathController);

    // Wait for server to fully start
    await setTimeout(1000);

    client = await bootstrapNestApplication({
      // logger: new Logger('Client'),
      project: {
        name: 'TestMicroserviceClient',
        description: 'Test microservice client',
      },
      modules: {
        system: [
          DefaultNestApplicationInitializer.forRoot(),
          DefaultNestApplicationListener.forRoot({ staticConfiguration: { mode: 'init' } }),
        ],
        feature: [
          createNestModule({
            moduleName: 'MicroserviceClientModule',
            imports: [
              ClientsModule.register([
                { name: 'MATH_SERVICE', transport: Transport.TCP, options: { port: 5000, host: 'localhost' } },
              ]),
            ],
            providers: [MathClientService],
          }).MicroserviceClientModule.forRoot(),
        ],
      },
    });

    // Wait for client to connect
    await setTimeout(1000);
  });

  afterAll(async () => {
    await client.close();
    await server.close();
  });

  describe('sum', () => {
    it('should return "6"', async () => {
      const mathClientService = client.get<MathClientService>(MathClientService);
      const result = await lastValueFrom(mathClientService.sum([1, 2, 3]));
      expect(result).toEqual(6);

      expect(mathClientService.sumResult).toEqual([6]);
      expect(mathController.sumResult).toEqual([[1, 2, 3]]);
    });
  });

  describe('getDate', () => {
    it('error, should return "time.us.east"', async () => {
      const mathClientService = client.get<MathClientService>(MathClientService);
      try {
        await lastValueFrom(mathClientService.getDate([1, 2, 3]));
      } catch (error) {
        expect(error).toEqual('There is no matching message handler defined in the remote service.');
      }

      expect(mathClientService.getDateResult).toEqual([]);
      expect(mathController.getDateResult).toEqual([]);
    });
  });

  describe('asyncSum', () => {
    it('should return "6"', async () => {
      const mathClientService = client.get<MathClientService>(MathClientService);
      const result = await lastValueFrom(mathClientService.asyncSum([1, 2, 3]));
      expect(result).toEqual(6);

      expect(mathClientService.asyncSumResult).toEqual([6]);
      expect(mathController.asyncSumResult).toEqual([[1, 2, 3]]);
    });
  });

  describe('observableSum', () => {
    it('should return "54"', async () => {
      const mathClientService = client.get<MathClientService>(MathClientService);
      const result = await lastValueFrom(mathClientService.observableSum([1, 2, 3]));
      expect(result).toEqual(54);

      expect(mathClientService.observableSumResult).toEqual([6, 22, 54]);
      expect(mathController.observableSumResult).toEqual([[1, 2, 3]]);
    });
  });

  describe('handleUserCreated', () => {
    it('should return "undefined"', async () => {
      const mathClientService = client.get<MathClientService>(MathClientService);
      
      // Clear previous results
      mathController.handleUserCreatedResult = [];
      mathClientService.handleUserCreatedResult = [];
      
      // Emit event (returns undefined for events)
      const result = await lastValueFrom(mathClientService.handleUserCreated({ userId: 1 }));
      expect(result).toEqual(undefined);
      
      // Wait for event to be processed
      await setTimeout(1000);

      // Event was emitted, result should be undefined
      expect(mathClientService.handleUserCreatedResult).toEqual([undefined]);
      
      // Controller should have received the event
      expect(mathController.handleUserCreatedResult.length).toBeGreaterThan(0);
      expect(mathController.handleUserCreatedResult[0]).toEqual({ userId: 1 });
    });
  });
});
