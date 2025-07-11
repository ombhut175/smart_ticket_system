import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { SupabaseService } from '../../core/database/supabase.client';
import { RolesGuard } from '../../common/guards/roles.guard';

@Module({
  controllers: [UsersController],
  providers: [UsersService, SupabaseService, RolesGuard],
})
export class UsersModule {} 