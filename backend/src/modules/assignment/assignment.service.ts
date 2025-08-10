import { Injectable, Logger } from '@nestjs/common';
import { SupabaseService } from '../../core/database/supabase.client';
import {
  TABLES,
  QUERY_SELECTORS,
  USER_ROLES,
  TABLE_COLUMNS,
  MESSAGES,
  LOG_MESSAGES,
  interpolateMessage,
} from '../../common/helpers/string-const';

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
    // Log auto-assignment start
    this.logger.log(
      interpolateMessage(LOG_MESSAGES.ASSIGNMENT_AUTO_STARTED, { ticketId }),
    );

    try {
      let assignedUser: { id: string; email: string } | null = null;

      if (relatedSkills && relatedSkills.length > 0) {
        // First, try to find a moderator with matching skills
        assignedUser = await this.findUserWithMatchingSkills(
          relatedSkills,
          USER_ROLES.MODERATOR,
        );
      }

      // If no skilled moderator found, fall back to any active admin
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

        // Log successful assignment
        this.logger.log(
          interpolateMessage(LOG_MESSAGES.ASSIGNMENT_AUTO_SUCCESS, {
            ticketId,
            assigneeId: assignedUser.id,
          }),
        );

        return { userId: assignedUser.id, email: assignedUser.email };
      }

      // Log assignment failure (no suitable user found)
      this.logger.warn(
        interpolateMessage(LOG_MESSAGES.ASSIGNMENT_AUTO_FAILED, { ticketId }),
      );
      return null;
    } catch (error) {
      this.logger.error(
        interpolateMessage(LOG_MESSAGES.ASSIGNMENT_AUTO_FAILED, { ticketId }),
        error,
      );
      return null;
    }
  }

  /**
   * Find users with matching skills using case-insensitive partial matching
   */
  private async findUserWithMatchingSkills(
    relatedSkills: string[],
    role: string,
  ): Promise<{ id: string; email: string } | null> {
    try {
      // Get all active users with the specified role and their skills
      const { data: usersWithSkills } = await this.supabase
        .getClient()
        .from(TABLES.USERS)
        .select(
          `
          ${TABLE_COLUMNS.ID},
          ${TABLE_COLUMNS.EMAIL},
          ${TABLES.USER_SKILLS}(${TABLE_COLUMNS.SKILL_NAME})
        `,
        )
        .eq(TABLE_COLUMNS.ROLE, role)
        .eq(TABLE_COLUMNS.IS_ACTIVE, true);

      if (!usersWithSkills || usersWithSkills.length === 0) {
        return null;
      }

      // Find user with the most matching skills using case-insensitive partial matching
      let bestMatch: { id: string; email: string } | null = null;
      let maxMatches = 0;

      for (const user of usersWithSkills) {
        const userSkills = user.user_skills || [];
        let matchCount = 0;

        // Check how many required skills this user has
        for (const requiredSkill of relatedSkills) {
          const requiredLower = requiredSkill.toLowerCase();

          const hasMatchingSkill = userSkills.some((skillRecord: any) => {
            const userSkillLower = skillRecord.skill_name.toLowerCase();

            // Check for exact match or partial match in both directions
            return (
              userSkillLower.includes(requiredLower) ||
              requiredLower.includes(userSkillLower) ||
              this.areSkillsSimilar(requiredLower, userSkillLower)
            );
          });

          if (hasMatchingSkill) {
            matchCount++;
          }
        }

        // Update best match if this user has more matching skills
        if (matchCount > maxMatches) {
          maxMatches = matchCount;
          bestMatch = { id: user.id, email: user.email };
        }
      }

      return maxMatches > 0 ? bestMatch : null;
    } catch (error) {
      this.logger.error('Error finding user with matching skills:', error);
      return null;
    }
  }

  /**
   * Check if two skills are similar (handles cases like "web development" vs "web")
   */
  private areSkillsSimilar(skill1: string, skill2: string): boolean {
    // Split skills into words and check for overlap
    const words1 = skill1.split(/\s+/);
    const words2 = skill2.split(/\s+/);

    // Check if any significant word (length > 2) from one skill is in the other
    for (const word1 of words1) {
      if (word1.length > 2) {
        for (const word2 of words2) {
          if (
            word2.length > 2 &&
            (word1.includes(word2) || word2.includes(word1))
          ) {
            return true;
          }
        }
      }
    }

    return false;
  }
}
