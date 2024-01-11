import { Injectable, OnApplicationBootstrap } from '@nestjs/common';

@Injectable()
export class CloseService implements OnApplicationBootstrap {
  onApplicationBootstrap() {
    process.exit();
  }
}
