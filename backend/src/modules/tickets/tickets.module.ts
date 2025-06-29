import { Module } from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { TicketsController } from './tickets.controller';
import { BackgroundModule } from '../../background/background.module';
import { UsersModule } from '../users/users.module';
import { DatabaseModule } from '../../core/database/database.module';

@Module({
  imports: [
    BackgroundModule, // For Inngest integration
    UsersModule, // For user validation
    DatabaseModule, // Provides SupabaseService
  ],
  controllers: [TicketsController],
  providers: [TicketsService],
  exports: [TicketsService],
})
export class TicketsModule {} 