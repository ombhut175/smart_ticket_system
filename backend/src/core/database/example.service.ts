import { Injectable, Logger } from '@nestjs/common';
import { DatabaseRepository } from './database.repository';
import type { NewUser, NewTicket, User, Ticket } from './schema';

@Injectable()
export class ExampleService {
  private readonly logger = new Logger(ExampleService.name);

  constructor(private readonly dbRepo: DatabaseRepository) {}

  /**
   * Example: Create a user and a ticket in a transaction-like manner
   */
  async createUserWithTicket(
    userData: Omit<NewUser, 'id' | 'createdAt' | 'updatedAt'>,
    ticketData: Omit<NewTicket, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>
  ): Promise<{ user: User; ticket: Ticket }> {
    try {
      // Create user first
      const user = await this.dbRepo.createUser(userData);
      this.logger.log(`Created user: ${user.email}`);

      // Create ticket for the user
      const ticket = await this.dbRepo.createTicket({
        ...ticketData,
        createdBy: user.id,
      });
      this.logger.log(`Created ticket: ${ticket.title} for user: ${user.email}`);

      return { user, ticket };
    } catch (error) {
      this.logger.error(`Failed to create user with ticket: ${error.message}`);
      throw error;
    }
  }

  /**
   * Example: Find users with specific skills
   */
  async findUsersBySkill(skillName: string): Promise<User[]> {
    try {
      const usersWithSkills = await this.dbRepo.findUsersWithSkills();
      
      // Filter users who have the specific skill
      const usersWithSpecificSkill = usersWithSkills
        .filter(item => item.skill && item.skill.skillName === skillName)
        .map(item => item.user);

      this.logger.log(`Found ${usersWithSpecificSkill.length} users with skill: ${skillName}`);
      return usersWithSpecificSkill;
    } catch (error) {
      this.logger.error(`Failed to find users by skill: ${error.message}`);
      throw error;
    }
  }

  /**
   * Example: Get ticket statistics
   */
  async getTicketStats(): Promise<{
    total: number;
    byStatus: Record<string, number>;
    byPriority: Record<string, number>;
  }> {
    try {
      const { tickets } = await this.dbRepo.findAllTickets(1000, 0); // Get all tickets for stats

      const stats = {
        total: tickets.length,
        byStatus: {} as Record<string, number>,
        byPriority: {} as Record<string, number>,
      };

      // Count by status
      tickets.forEach(ticket => {
        stats.byStatus[ticket.status] = (stats.byStatus[ticket.status] || 0) + 1;
        stats.byPriority[ticket.priority] = (stats.byPriority[ticket.priority] || 0) + 1;
      });

      this.logger.log(`Generated ticket statistics: ${stats.total} total tickets`);
      return stats;
    } catch (error) {
      this.logger.error(`Failed to get ticket statistics: ${error.message}`);
      throw error;
    }
  }

  /**
   * Example: Update ticket assignment with validation
   */
  async assignTicketToUser(ticketId: string, userId: string): Promise<Ticket | null> {
    try {
      // Verify user exists
      const user = await this.dbRepo.findUserById(userId);
      if (!user) {
        this.logger.warn(`User not found: ${userId}`);
        return null;
      }

      // Verify ticket exists
      const ticket = await this.dbRepo.findTicketById(ticketId);
      if (!ticket) {
        this.logger.warn(`Ticket not found: ${ticketId}`);
        return null;
      }

      // Update ticket assignment
      const updatedTicket = await this.dbRepo.updateTicket(ticketId, {
        assignedTo: userId,
      });

      if (updatedTicket) {
        this.logger.log(`Assigned ticket ${ticketId} to user ${userId}`);
      }

      return updatedTicket;
    } catch (error) {
      this.logger.error(`Failed to assign ticket: ${error.message}`);
      throw error;
    }
  }

  /**
   * Example: Bulk user operations
   */
  async bulkUpdateUserStatus(userIds: string[], isActive: boolean): Promise<number> {
    try {
      let updatedCount = 0;

      for (const userId of userIds) {
        const updatedUser = await this.dbRepo.updateUser(userId, { isActive });
        if (updatedUser) {
          updatedCount++;
        }
      }

      this.logger.log(`Updated ${updatedCount} out of ${userIds.length} users`);
      return updatedCount;
    } catch (error) {
      this.logger.error(`Failed to bulk update users: ${error.message}`);
      throw error;
    }
  }
}
