import { Module } from '@nestjs/common';
import { DrizzleService } from './drizzle.client';
import { DatabaseRepository } from './database.repository';

@Module({
  providers: [DrizzleService, DatabaseRepository],
  exports: [DrizzleService, DatabaseRepository],
})
export class DatabaseModule {} 