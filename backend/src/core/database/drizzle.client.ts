import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { drizzle } from 'drizzle-orm/postgres-js';
import * as postgres from 'postgres';
import { ENV } from '../../common/helpers/string-const';

@Injectable()
export class DrizzleService {
  private readonly client: postgres.Sql;
  private readonly db: ReturnType<typeof drizzle>;

  constructor(private readonly configService: ConfigService) {
    const databaseUrl = this.configService.get<string>(ENV.DATABASE_URL);

    if (!databaseUrl) {
      throw new Error('Missing DATABASE_URL environment variable');
    }

    // Create postgres client
    this.client = postgres(databaseUrl, {
      max: 10, // Maximum number of connections
      idle_timeout: 20, // Close idle connections after 20 seconds
      connect_timeout: 10, // Connection timeout
    });

    // Create drizzle instance
    this.db = drizzle(this.client);
  }

  /**
   * Returns the Drizzle database instance
   */
  getDb() {
    return this.db;
  }

  /**
   * Returns the raw postgres client for advanced operations
   */
  getClient() {
    return this.client;
  }

  /**
   * Closes the database connection
   */
  async close() {
    await this.client.end();
  }
}
