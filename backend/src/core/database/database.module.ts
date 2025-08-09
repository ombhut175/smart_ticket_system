import { Module } from '@nestjs/common';
import { SupabaseService } from './supabase.client';
import { DrizzleService } from './drizzle.client';
import { DatabaseRepository } from './database.repository';

@Module({
  providers: [SupabaseService, DrizzleService, DatabaseRepository],
  exports: [SupabaseService, DrizzleService, DatabaseRepository],
})
export class DatabaseModule {} 