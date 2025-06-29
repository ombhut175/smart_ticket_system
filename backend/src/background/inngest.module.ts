import { Module } from '@nestjs/common';
import { InngestService } from './inngest.service';

@Module({
  providers: [InngestService],
  exports: [InngestService],
})
export class InngestModule {} 