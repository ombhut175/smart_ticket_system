import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { SupabaseService } from '../../core/database/supabase.client';

@Module({
  controllers: [AuthController],
  providers: [AuthService, SupabaseService],
  exports: [SupabaseService, AuthService],
})
export class AuthModule {}
