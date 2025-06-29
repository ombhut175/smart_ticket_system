import { Module, forwardRef } from '@nestjs/common';
import { InngestModule } from './inngest.module';
import { BackgroundService } from './background.service';
import { AiModule } from '../modules/ai/ai.module';
import { AssignmentModule } from '../modules/assignment/assignment.module';
import { EmailModule } from '../modules/email/email.module';
import { SupabaseService } from '../core/database/supabase.client';
import { InngestController } from './inngest.controller';

@Module({
  imports: [InngestModule, AiModule, AssignmentModule, EmailModule],
  providers: [BackgroundService, SupabaseService],
  controllers: [InngestController],
  exports: [BackgroundService, InngestModule],
})
export class BackgroundModule {} 