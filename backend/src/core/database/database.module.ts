import { Module } from '@nestjs/common';
import { DrizzleService } from './drizzle.client';
import { DatabaseRepository } from './database.repository';
import { UsersRepository } from './repositories/users.repository';
import { TicketsRepository } from './repositories/tickets.repository';
import { SkillsRepository } from './repositories/skills.repository';

@Module({
  providers: [
    DrizzleService,
    UsersRepository,
    TicketsRepository,
    SkillsRepository,
    DatabaseRepository,
  ],
  exports: [
    DrizzleService,
    UsersRepository,
    TicketsRepository,
    SkillsRepository,
    DatabaseRepository,
  ],
})
export class DatabaseModule {}
