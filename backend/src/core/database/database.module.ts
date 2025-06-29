import { Module } from '@nestjs/common';
import { SupabaseService } from './supabase.client';

@Module({
  providers: [SupabaseService],
  exports: [SupabaseService],
})
export class DatabaseModule {} 