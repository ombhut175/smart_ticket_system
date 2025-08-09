import { Injectable, Logger } from '@nestjs/common';
import { DrizzleService } from '../../core/database/drizzle.client';
import { testing, users } from '../../core/database/schema';
import { tickets } from '../../core/database/schema/tickets.schema';
import { eq } from 'drizzle-orm';
import { InsertTestingDto } from './dto/insert-testing.dto';

@Injectable()
export class TestingService {
  private readonly logger = new Logger(TestingService.name);

  constructor(private readonly drizzleService: DrizzleService) {}

  /**
   * Check if the testing table exists and return its structure
   */
  async checkTestingTable() {
    try {
      const client = this.drizzleService.getClient();
      
      // Check if table exists
      const tableExists = await client`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'testing'
        );
      `;
      
      if (tableExists[0]?.exists) {
        // Get table structure
        const structure = await client`
          SELECT column_name, data_type, is_nullable, column_default
          FROM information_schema.columns 
          WHERE table_name = 'testing'
          ORDER BY ordinal_position;
        `;
        
        return {
          exists: true,
          structure: structure
        };
      } else {
        return { exists: false, structure: [] };
      }
    } catch (error) {
      this.logger.error(`Failed to check testing table: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Insert a new record into the testing table
   */
  async insertTestingRecord(data: InsertTestingDto) {
    try {
      // Validate input data
      if (!data || typeof data !== 'object') {
        throw new Error('Invalid input data: data must be a valid object');
      }
      
      // Check if required fields are present
      if (!data.name || typeof data.name !== 'string') {
        throw new Error('Invalid input data: name field is required and must be a string');
      }
      
      const db = this.drizzleService.getDb();
      
      this.logger.log(`Attempting to insert testing record: ${JSON.stringify(data)}`);
      
      const result = await db
        .insert(testing)
        .values(data)
        .returning();
      
      this.logger.log(`Successfully inserted testing record with ID: ${result[0]?.id}`);
      return result[0];
    } catch (error) {
      this.logger.error(`Failed to insert testing record: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get all records from the testing table
   */
  async getAllTestingRecords() {
    try {
      const db = this.drizzleService.getDb();
      
      const result = await db.select().from(testing);
      this.logger.log(`Retrieved ${result.length} testing records`);
      return result;
    } catch (error) {
      this.logger.error(`Failed to retrieve testing records: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get join result between users and tickets tables
   * Returns users with their created tickets
   */
  async getUsersWithTickets() {
    try {
      const db = this.drizzleService.getDb();
      
      const result = await db
        .select({
          userId: users.id,
          userEmail: users.email,
          userRole: users.role,
          userFirstName: users.firstName,
          userLastName: users.lastName,
          ticketId: tickets.id,
          ticketTitle: tickets.title,
          ticketStatus: tickets.status,
          ticketPriority: tickets.priority,
          ticketCreatedAt: tickets.createdAt,
        })
        .from(users)
        .leftJoin(tickets, eq(users.id, tickets.createdBy))
        .orderBy(users.email, tickets.createdAt);
      
      this.logger.log(`Retrieved ${result.length} users with tickets`);
      return result;
    } catch (error) {
      this.logger.error(`Failed to retrieve users with tickets: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get join result between tickets and users (assigned tickets)
   * Returns tickets with assigned user information
   */
  async getTicketsWithAssignedUsers() {
    try {
      const db = this.drizzleService.getDb();
      
      const result = await db
        .select({
          ticketId: tickets.id,
          ticketTitle: tickets.title,
          ticketDescription: tickets.description,
          ticketStatus: tickets.status,
          ticketPriority: tickets.priority,
          assignedUserId: users.id,
          assignedUserEmail: users.email,
          assignedUserFirstName: users.firstName,
          assignedUserLastName: users.lastName,
          ticketCreatedAt: tickets.createdAt,
        })
        .from(tickets)
        .leftJoin(users, eq(tickets.assignedTo, users.id))
        .orderBy(tickets.status, tickets.priority);
      
      this.logger.log(`Retrieved ${result.length} tickets with assigned users`);
      return result;
    } catch (error) {
      this.logger.error(`Failed to retrieve tickets with assigned users: ${error.message}`, error.stack);
      throw error;
    }
  }
}
