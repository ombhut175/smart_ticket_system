import { Injectable } from '@nestjs/common';
import { DrizzleService } from '../drizzle.client';

@Injectable()
export abstract class BaseRepository {
  constructor(protected readonly drizzleService: DrizzleService) {}

  protected get db() {
    return this.drizzleService.getDb();
  }
}
