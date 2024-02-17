/* eslint-disable @typescript-eslint/no-explicit-any */
import { Controller, Logger } from '@nestjs/common';
import { Ctx, EventPattern, MessagePattern, NatsContext, Payload } from '@nestjs/microservices';
import { Observable, from, map } from 'rxjs';

@Controller()
export class MathController {
  private logger = new Logger(MathController.name);

  sumResult: any[] = [];
  getDateResult: any[] = [];
  asyncSumResult: any[] = [];
  observableSumResult: any[] = [];
  handleUserCreatedResult: any[] = [];

  @MessagePattern({ cmd: 'sum' })
  sum(@Payload() data: number[]): number {
    this.logger.log({ sum: data });
    this.sumResult.push(data);
    return (data || []).reduce((a, b) => a + b, 0);
  }

  @MessagePattern('time.us.*')
  getDate(@Payload() data: number[], @Ctx() context: NatsContext) {
    this.logger.log({ getDate: data });
    this.getDateResult.push(data);
    this.logger.log(`Subject: ${context.getSubject()}`); // e.g. "time.us.east"
    return new Date();
  }

  @MessagePattern({ cmd: 'asyncSum' })
  async asyncSum(@Payload() data: number[]): Promise<number> {
    this.logger.log({ asyncSum: data });
    this.asyncSumResult.push(data);
    return (data || []).reduce((a, b) => a + b, 0);
  }

  @MessagePattern({ cmd: 'observableSum' })
  observableSum(@Payload() data: number[]): Observable<number> {
    this.logger.log({ observableSum: data });
    this.observableSumResult.push(data);
    return from([1, 2, 3]).pipe(map((inc) => data.reduce((a, b) => a * inc + b * inc, 0)));
  }

  @EventPattern('user_created')
  async handleUserCreated(@Payload() data: Record<string, unknown>) {
    this.logger.log({ handleUserCreated: data });
    this.handleUserCreatedResult.push(data);
  }
}
