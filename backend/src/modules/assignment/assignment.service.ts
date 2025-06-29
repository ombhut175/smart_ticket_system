import { Injectable, Logger } from '@nestjs/common';
import { SupabaseService } from '../../core/database/supabase.client';
import { TABLES, QUERY_SELECTORS, USER_ROLES, TABLE_COLUMNS, MESSAGES } from '../../common/helpers/string-const';

@Injectable()
export class AssignmentService {
  private readonly logger = new Logger(AssignmentService.name);

  constructor(private readonly supabase: SupabaseService) {}

  /**
   * Tries to find a moderator with matching skills. Falls back to any active admin.
   */
  async assignModeratorToTicket(
    ticketId: string,
    relatedSkills: string[],
  ): Promise<{ userId: string; email: string } | null> {
    try {
      let assignedUser: { id: string; email: string } | null = null;

      if (relatedSkills && relatedSkills.length > 0) {
        const { data } = await this.supabase
          .getClient()
          .from(TABLES.USERS)
          .select(QUERY_SELECTORS.TICKET_BASIC_INFO)
          .eq(TABLE_COLUMNS.ROLE, USER_ROLES.MODERATOR)
          .eq(TABLE_COLUMNS.IS_ACTIVE, true)
          .contains(TABLE_COLUMNS.SKILLS, relatedSkills) // assuming skills array stored
          .limit(1)
          .single();

        if (data) assignedUser = data as any;
      }

      if (!assignedUser) {
        const { data } = await this.supabase
          .getClient()
          .from(TABLES.USERS)
          .select(QUERY_SELECTORS.TICKET_BASIC_INFO)
          .eq(TABLE_COLUMNS.ROLE, USER_ROLES.ADMIN)
          .eq(TABLE_COLUMNS.IS_ACTIVE, true)
          .limit(1)
          .single();

        if (data) assignedUser = data as any;
      }

      // Update ticket assignment
      if (assignedUser) {
        await this.supabase
          .getClient()
          .from(TABLES.TICKETS)
          .update({ [TABLE_COLUMNS.ASSIGNED_TO]: assignedUser.id })
          .eq(TABLE_COLUMNS.ID, ticketId);

        return { userId: assignedUser.id, email: assignedUser.email };
      }

      return null;
    } catch (error) {
      this.logger.error(MESSAGES.ASSIGNMENT_FAILED, error as any);
      return null;
    }
  }
} 