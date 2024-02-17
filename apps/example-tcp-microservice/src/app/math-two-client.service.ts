/* eslint-disable @typescript-eslint/no-explicit-any */
import { InjectTcpNestMicroserviceClient } from '@nestjs-mod/microservices';
import { Injectable, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Observable, tap } from 'rxjs';

@Injectable()
export class MathTwoClientService {
  private logger = new Logger(MathTwoClientService.name);

  sumResult: any[] = [];
  getDateResult: any[] = [];
  asyncSumResult: any[] = [];
  observableSumResult: any[] = [];
  handleUserCreatedResult: any[] = [];

  constructor(
    @InjectTcpNestMicroserviceClient('ms1')
    private client1: ClientProxy,
    @InjectTcpNestMicroserviceClient('ms2')
    private client2: ClientProxy
  ) {}

  sum(payload: number[]) {
    return this.client1.send<number>({ cmd: 'sum' }, payload).pipe(
      tap((result) => {
        this.sumResult.push(result);
        this.logger.log({ sum: result });
      })
    );
  }

  sum2(payload: number[]) {
    return this.client2.send<number>({ cmd: 'sum' }, payload).pipe(
      tap((result) => {
        this.sumResult.push(result);
        this.logger.log({ sum: result });
      })
    );
  }

  getDate(payload: number[]) {
    return this.client1.send<number>('time.us.east', payload).pipe(
      tap((result) => {
        this.getDateResult.push(result);
        this.logger.log({ getDate: result });
      })
    );
  }

  getDate2(payload: number[]) {
    return this.client2.send<number>('time.us.east', payload).pipe(
      tap((result) => {
        this.getDateResult.push(result);
        this.logger.log({ getDate: result });
      })
    );
  }

  asyncSum(payload: number[]) {
    return this.client1.send<number>({ cmd: 'asyncSum' }, payload).pipe(
      tap((result) => {
        this.asyncSumResult.push(result);
        this.logger.log({ asyncSum: result });
      })
    );
  }

  asyncSum2(payload: number[]) {
    return this.client2.send<number>({ cmd: 'asyncSum' }, payload).pipe(
      tap((result) => {
        this.asyncSumResult.push(result);
        this.logger.log({ asyncSum: result });
      })
    );
  }

  observableSum(payload: number[]): Observable<number> {
    return this.client1.send<number>({ cmd: 'observableSum' }, payload).pipe(
      tap((result) => {
        this.observableSumResult.push(result);
        this.logger.log({ observableSum: result });
      })
    );
  }

  observableSum2(payload: number[]): Observable<number> {
    return this.client2.send<number>({ cmd: 'observableSum' }, payload).pipe(
      tap((result) => {
        this.observableSumResult.push(result);
        this.logger.log({ observableSum: result });
      })
    );
  }

  handleUserCreated(data: Record<string, unknown>) {
    return this.client1.emit<number>('user_created', data).pipe(
      tap((result) => {
        this.handleUserCreatedResult.push(result);
        this.logger.log({ handleUserCreated: result });
      })
    );
  }

  handleUserCreated2(data: Record<string, unknown>) {
    return this.client2.emit<number>('user_created', data).pipe(
      tap((result) => {
        this.handleUserCreatedResult.push(result);
        this.logger.log({ handleUserCreated: result });
      })
    );
  }
}
