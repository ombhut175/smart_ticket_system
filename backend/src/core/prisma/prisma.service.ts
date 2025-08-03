import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '../../../generated/prisma';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    super({
      log: [
        {
          emit: 'event',
          level: 'query',
        },
        {
          emit: 'event',
          level: 'error',
        },
        {
          emit: 'event',
          level: 'info',
        },
        {
          emit: 'event',
          level: 'warn',
        },
      ],
    });

    // Log database queries in development
    if (process.env.NODE_ENV === 'development') {
      this.$on('query' as never, (event: any) => {
        this.logger.debug(`Query: ${event.query}`);
        this.logger.debug(`Params: ${event.params}`);
        this.logger.debug(`Duration: ${event.duration}ms`);
      });
    }

    this.$on('error' as never, (event: any) => {
      this.logger.error(`Database error: ${event.message}`);
    });

    this.$on('info' as never, (event: any) => {
      this.logger.log(`Database info: ${event.message}`);
    });

    this.$on('warn' as never, (event: any) => {
      this.logger.warn(`Database warning: ${event.message}`);
    });
  }

  async onModuleInit() {
    try {
      await this.$connect();
      this.logger.log('Successfully connected to the database');
    } catch (error) {
      this.logger.error('Failed to connect to the database:', error);
      throw error;
    }
  }

  async onModuleDestroy() {
    try {
      await this.$disconnect();
      this.logger.log('Disconnected from the database');
    } catch (error) {
      this.logger.error('Error disconnecting from the database:', error);
    }
  }

  /**
   * Check if the database connection is healthy
   */
  async checkConnection(): Promise<{
    isConnected: boolean;
    databaseName?: string;
    version?: string;
    error?: string;
  }> {
    try {
      // Try to execute a simple query to check connection
      const result = await this.$queryRaw`SELECT version() as version, current_database() as database_name`;
      
      return {
        isConnected: true,
        databaseName: (result as any)[0]?.database_name,
        version: (result as any)[0]?.version,
      };
    } catch (error) {
      this.logger.error('Database connection check failed:', error);
      return {
        isConnected: false,
        error: error instanceof Error ? error.message : 'Unknown database error',
      };
    }
  }

  /**
   * Get database statistics
   */
  async getDatabaseStats(): Promise<{
    totalTables: number;
    totalUsers: number;
    totalTickets: number;
    totalTestingRecords: number;
    connectionInfo: any;
  }> {
    try {
      // Get table count from information_schema
      const tableCountResult = await this.$queryRaw`
        SELECT COUNT(*) as total_tables 
        FROM information_schema.tables 
        WHERE table_schema IN ('public', 'auth')
      `;

      // Get user, ticket, and testing counts
      const [userCount, ticketCount] = await Promise.all([
        this.public_users.count(),
        this.tickets.count(),
        // this.testing.count(),
      ]);

      const connectionInfo = await this.checkConnection();

      return {
        totalTables: Number((tableCountResult as any)[0]?.total_tables || 0),
        totalUsers: userCount,
        totalTickets: ticketCount,
        totalTestingRecords: 0,
        connectionInfo,
      };
    } catch (error) {
      this.logger.error('Failed to get database stats:', error);
      throw error;
    }
  }
}
