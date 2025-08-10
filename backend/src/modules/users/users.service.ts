import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { DatabaseRepository } from '../../core/database/database.repository';
import {
  MESSAGES,
  USER_ROLES,
  LOG_MESSAGES,
  interpolateMessage,
  TABLE_COLUMNS,
  TABLES,
  QUERY_SELECTORS,
} from '../../common/helpers/string-const';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { AddUserSkillDto } from './dto/add-user-skill.dto';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(private readonly dbRepo: DatabaseRepository) {}

  async getProfile(userId: string) {
    // Log profile fetch start
    this.logger.log(
      interpolateMessage(LOG_MESSAGES.USER_PROFILE_FETCH_STARTED, { userId }),
    );

    try {
      const user = await this.dbRepo.findUserById(userId);

      if (!user) {
        this.logger.error(`Failed to fetch user profile for user: ${userId}`);
        throw new NotFoundException(MESSAGES.NOT_FOUND);
      }

      /**
       * Add computed field is_profile_completed
       * Profile is considered complete when both first_name and last_name are present
       * This helps frontend determine if user needs to complete their profile
       */
      const is_profile_completed = !!(user.firstName && user.lastName);

      const result = {
        ...user,
        is_profile_completed,
        // Map camelCase back to snake_case for backward compatibility
        first_name: user.firstName,
        last_name: user.lastName,
        is_active: user.isActive,
        last_login_at: user.lastLoginAt,
        created_at: user.createdAt,
        updated_at: user.updatedAt,
      };

      // Log successful profile fetch
      this.logger.log(
        interpolateMessage(LOG_MESSAGES.USER_PROFILE_FETCH_SUCCESS, { userId }),
      );

      return result;
    } catch (error) {
      this.logger.error(
        `Failed to fetch user profile for user: ${userId}`,
        error,
      );
      throw error;
    }
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    // Log profile update start
    this.logger.log(
      interpolateMessage(LOG_MESSAGES.USER_PROFILE_UPDATE_STARTED, { userId }),
    );

    try {
      const data = await this.dbRepo.updateUserProfile(userId, dto);

      if (!data) {
        this.logger.error(
          interpolateMessage(LOG_MESSAGES.USER_PROFILE_UPDATE_FAILED, {
            userId,
          }),
        );
        throw new BadRequestException('Failed to update profile');
      }

      // Log successful profile update
      this.logger.log(
        interpolateMessage(LOG_MESSAGES.USER_PROFILE_UPDATE_SUCCESS, {
          userId,
        }),
      );

      return data;
    } catch (error) {
      this.logger.error(
        interpolateMessage(LOG_MESSAGES.USER_PROFILE_UPDATE_FAILED, { userId }),
        error,
      );
      throw error;
    }
  }

  async addSkill(id: string, dto: AddUserSkillDto) {
    // Log skill addition start
    this.logger.log(
      interpolateMessage(LOG_MESSAGES.USER_SKILL_ADD_STARTED, {
        userId: id,
        skill: dto.skill_name,
      }),
    );

    try {
      const data = await this.dbRepo.addUserSkillCompat(
        id,
        dto.skill_name,
        dto.proficiency_level,
      );

      // Log successful skill addition
      this.logger.log(
        interpolateMessage(LOG_MESSAGES.USER_SKILL_ADD_SUCCESS, {
          userId: id,
          skill: dto.skill_name,
        }),
      );

      return data;
    } catch (error) {
      this.logger.error(
        `Failed to add skill ${dto.skill_name} for user: ${id}`,
        error,
      );
      throw new BadRequestException(error.message || 'Failed to add skill');
    }
  }

  //#region ==================== ADMIN OPERATIONS ====================

  /**
   * Find user by ID
   */
  async findById(id: string) {
    const user = await this.dbRepo.findUserById(id);

    if (!user) {
      throw new NotFoundException(MESSAGES.NOT_FOUND);
    }

    // Return with snake_case for compatibility
    return {
      ...user,
      first_name: user.firstName,
      last_name: user.lastName,
      is_active: user.isActive,
      last_login_at: user.lastLoginAt,
      created_at: user.createdAt,
      updated_at: user.updatedAt,
    };
  }

  /**
   * Toggle a user's active status (admin only)
   */
  async toggleActive(id: string, isActive: boolean) {
    // Log toggle active start
    this.logger.log(
      interpolateMessage(LOG_MESSAGES.USER_TOGGLE_ACTIVE_STARTED, {
        userId: id,
      }),
    );

    try {
      const data = await this.dbRepo.updateUserActiveStatus(id, isActive);
      if (!data) {
        this.logger.error(`Failed to toggle active status for user: ${id}`);
        throw new BadRequestException('Failed to update user');
      }
      this.logger.log(
        interpolateMessage(LOG_MESSAGES.USER_TOGGLE_ACTIVE_SUCCESS, {
          userId: id,
          isActive: isActive.toString(),
        }),
      );
      return data;
    } catch (error) {
      this.logger.error(
        `Failed to toggle active status for user: ${id}`,
        error,
      );
      throw error;
    }
  }

  /**
   * Update a user's role (admin only)
   */
  async updateRole(
    id: string,
    role: import('../../common/helpers/string-const').UserRole,
  ) {
    // Log role update start
    this.logger.log(
      interpolateMessage(LOG_MESSAGES.USER_ROLE_UPDATE_STARTED, {
        userId: id,
        role: role,
      }),
    );

    try {
      const data = await this.dbRepo.updateUserRoleCompat(id, role as string);
      if (!data) {
        this.logger.error(`Failed to update role for user: ${id} to ${role}`);
        throw new BadRequestException('Failed to update user');
      }
      this.logger.log(
        interpolateMessage(LOG_MESSAGES.USER_ROLE_UPDATE_SUCCESS, {
          userId: id,
          role: role,
        }),
      );
      return data;
    } catch (error) {
      this.logger.error(
        `Failed to update role for user: ${id} to ${role}`,
        error,
      );
      throw error;
    }
  }

  /**
   * Update user's last login timestamp
   */
  async updateLastLogin(id: string) {
    const data = await this.dbRepo.updateLastLogin(id);

    if (!data) {
      throw new BadRequestException('Failed to update last login');
    }

    return data;
  }

  /**
   * Insert multiple skills for a user in batch
   */
  async addSkills(userId: string, skills: AddUserSkillDto[]) {
    if (!skills || skills.length === 0) {
      return [];
    }

    try {
      return await this.dbRepo.addUserSkillsBatch(userId, skills);
    } catch (error) {
      throw new BadRequestException(error.message || 'Failed to add skills');
    }
  }

  /**
   * Find user by email
   */
  async findByEmail(email: string) {
    const user = await this.dbRepo.findUserByEmail(email);

    if (!user) {
      throw new NotFoundException(
        interpolateMessage(MESSAGES.USER_NOT_FOUND_BY_EMAIL, { email }),
      );
    }

    // Return with snake_case for compatibility
    return {
      ...user,
      first_name: user.firstName,
      last_name: user.lastName,
      is_active: user.isActive,
      last_login_at: user.lastLoginAt,
      created_at: user.createdAt,
      updated_at: user.updatedAt,
    };
  }

  /**
   * Promote a user to moderator and assign skills (admin only)
   */
  async makeModerator(email: string, skills: AddUserSkillDto[]) {
    this.logger.log(`Starting moderator promotion process for email: ${email}`);

    try {
      // Step 1: find user by email
      const user = await this.findByEmail(email);
      this.logger.log(
        `Found user for moderator promotion: ${user[TABLE_COLUMNS.ID]}`,
      );

      // Step 2: check if user is already a moderator or admin
      if (user[TABLE_COLUMNS.ROLE] === USER_ROLES.MODERATOR) {
        this.logger.warn(`User ${email} is already a moderator`);
        throw new BadRequestException(
          interpolateMessage(MESSAGES.USER_ALREADY_MODERATOR, { email }),
        );
      }
      if (user[TABLE_COLUMNS.ROLE] === USER_ROLES.ADMIN) {
        this.logger.warn(`Cannot demote admin ${email} to moderator`);
        throw new BadRequestException(
          interpolateMessage(MESSAGES.CANNOT_DEMOTE_ADMIN, { email }),
        );
      }

      // Step 3: update role to moderator
      this.logger.log(
        `Updating role to moderator for user: ${user[TABLE_COLUMNS.ID]}`,
      );
      await this.updateRole(
        user[TABLE_COLUMNS.ID],
        USER_ROLES.MODERATOR as any,
      );

      // Step 4: insert skills
      this.logger.log(
        `Adding ${skills.length} skills for new moderator: ${user[TABLE_COLUMNS.ID]}`,
      );
      const insertedSkills = await this.addSkills(
        user[TABLE_COLUMNS.ID],
        skills,
      );

      // Step 5: return updated moderator profile with skills
      const moderator = await this.getModeratorById(user[TABLE_COLUMNS.ID]);

      this.logger.log(
        `Successfully promoted user ${email} to moderator with ${insertedSkills.length} skills`,
      );

      return { ...moderator, skills: insertedSkills };
    } catch (error) {
      this.logger.error(`Failed to promote user ${email} to moderator`, error);
      throw error;
    }
  }

  /**
   * Get all moderators with their skills
   */
  async getModerators() {
    this.logger.log('Fetching all moderators with skills');

    try {
      const data = await this.dbRepo.findModeratorsWithSkillsCompat();
      const result = (data || []).map((u: any) => ({
        ...u,
        skills: u.user_skills || [],
      }));
      this.logger.log(`Successfully fetched ${result.length} moderators`);
      return result;
    } catch (error) {
      this.logger.error('Failed to fetch moderators', error);
      throw error;
    }
  }

  /**
   * Get a single moderator with skills
   */
  async getModeratorById(id: string) {
    const data = await this.dbRepo.findModeratorWithSkillsByIdCompat(id);
    if (!data) {
      throw new NotFoundException(MESSAGES.NOT_FOUND);
    }
    return {
      ...data,
      skills: data.user_skills || [],
    };
  }

  //#endregion
}
