import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { SupabaseService } from '../../core/database/supabase.client';

@Module({
  controllers: [UsersController],
  providers: [UsersService, SupabaseService],
})
export class UsersModule {} 