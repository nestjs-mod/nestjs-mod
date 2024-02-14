import { createNestModule, NestModuleCategory } from '@nestjs-mod/common';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MathController } from './math.controller';

export const { AppModule } = createNestModule({
  moduleName: 'AppModule',
  moduleCategory: NestModuleCategory.feature,
  controllers: [AppController, MathController],
  providers: [AppService],
});
