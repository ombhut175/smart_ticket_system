import { Module } from '@nestjs/common';
import { InngestModule } from './inngest.module';
import { BackgroundService } from './background.service';
import { AiModule } from '../modules/ai/ai.module';
import { AssignmentModule } from '../modules/assignment/assignment.module';
import { EmailModule } from '../modules/email/email.module';
import { DatabaseModule } from '../core/database/database.module';
import { InngestController } from './inngest.controller';

@Module({
  imports: [InngestModule, AiModule, AssignmentModule, EmailModule, DatabaseModule],
  providers: [BackgroundService],
  controllers: [InngestController],
  exports: [BackgroundService, InngestModule],
})
export class BackgroundModule {} 