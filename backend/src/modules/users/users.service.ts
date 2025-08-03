import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { SupabaseService } from '../../core/database/supabase.client';
import { 
  MESSAGES, 
  TABLES, 
  TABLE_COLUMNS, 
  QUERY_SELECTORS, 
  USER_ROLES,
  LOG_MESSAGES,
  interpolateMessage 
} from '../../common/helpers/string-const';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { AddUserSkillDto } from './dto/add-user-skill.dto';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(private readonly supabase: SupabaseService) {}

  async getProfile(userId: string) {
    // Log profile fetch start
    this.logger.log(interpolateMessage(LOG_MESSAGES.USER_PROFILE_FETCH_STARTED, { userId }));
    
    try {
      const { data, error } = await this.supabase
        .getClient()
        .from(TABLES.USERS)
        .select(QUERY_SELECTORS.ALL_FIELDS)
        .eq(TABLE_COLUMNS.ID, userId)
        .single();

      if (error || !data) {
        this.logger.error(`Failed to fetch user profile for user: ${userId}`, error);
        throw new NotFoundException(MESSAGES.NOT_FOUND);
      }

      /**
       * Add computed field is_profile_completed
       * Profile is considered complete when both first_name and last_name are present
       * This helps frontend determine if user needs to complete their profile
       */
      const is_profile_completed = !!(data[TABLE_COLUMNS.FIRST_NAME] && data[TABLE_COLUMNS.LAST_NAME]);

      const result = {
        ...data,
        is_profile_completed,
      };

      // Log successful profile fetch
      this.logger.log(interpolateMessage(LOG_MESSAGES.USER_PROFILE_FETCH_SUCCESS, { userId }));

      return result;
    } catch (error) {
      this.logger.error(`Failed to fetch user profile for user: ${userId}`, error);
      throw error;
    }
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    // Log profile update start
    this.logger.log(interpolateMessage(LOG_MESSAGES.USER_PROFILE_UPDATE_STARTED, { userId }));
    
    try {
      const { data, error } = await this.supabase
        .getClient()
        .from(TABLES.USERS)
        .update({ ...dto })
        .eq(TABLE_COLUMNS.ID, userId)
        .select(QUERY_SELECTORS.ALL_FIELDS)
        .single();

      if (error) {
        this.logger.error(interpolateMessage(LOG_MESSAGES.USER_PROFILE_UPDATE_FAILED, { userId }), error);
        throw new BadRequestException(error.message);
      }

      // Log successful profile update
      this.logger.log(interpolateMessage(LOG_MESSAGES.USER_PROFILE_UPDATE_SUCCESS, { userId }));

      return data;
    } catch (error) {
      this.logger.error(interpolateMessage(LOG_MESSAGES.USER_PROFILE_UPDATE_FAILED, { userId }), error);
      throw error;
    }
  }

  async addSkill(id: string, dto: AddUserSkillDto) {
    // Log skill addition start
    this.logger.log(interpolateMessage(LOG_MESSAGES.USER_SKILL_ADD_STARTED, { 
      userId: id, 
      skill: dto.skill_name 
    }));
    
    try {
      const { data, error } = await this.supabase
        .getClient()
        .from(TABLES.USER_SKILLS)
        .insert({
          [TABLE_COLUMNS.USER_ID]: id,
          [TABLE_COLUMNS.SKILL_NAME]: dto.skill_name,
          [TABLE_COLUMNS.PROFICIENCY_LEVEL]: dto.proficiency_level,
        })
        .select(QUERY_SELECTORS.ALL_FIELDS)
        .single();

      if (error) {
        this.logger.error(`Failed to add skill ${dto.skill_name} for user: ${id}`, error);
        throw new BadRequestException(error.message);
      }

      // Log successful skill addition
      this.logger.log(interpolateMessage(LOG_MESSAGES.USER_SKILL_ADD_SUCCESS, { 
        userId: id, 
        skill: dto.skill_name 
      }));

      return data;
    } catch (error) {
      this.logger.error(`Failed to add skill ${dto.skill_name} for user: ${id}`, error);
      throw error;
    }
  }

  //#region ==================== ADMIN OPERATIONS ====================

  /**
   * Find user by ID
   */
  async findById(id: string) {
    const { data, error } = await this.supabase
      .getClient()
      .from(TABLES.USERS)
      .select(QUERY_SELECTORS.ALL_FIELDS)
      .eq(TABLE_COLUMNS.ID, id)
      .single();

    if (error || !data) {
      throw new NotFoundException(MESSAGES.NOT_FOUND);
    }

    return data;
  }

  /**
   * Toggle a user's active status (admin only)
   */
  async toggleActive(id: string, isActive: boolean) {
    // Log toggle active start
    this.logger.log(interpolateMessage(LOG_MESSAGES.USER_TOGGLE_ACTIVE_STARTED, { userId: id }));
    
    try {
      const { data, error } = await this.supabase
        .getClient()
        .from(TABLES.USERS)
        .update({ [TABLE_COLUMNS.IS_ACTIVE]: isActive })
        .eq(TABLE_COLUMNS.ID, id)
        .select(QUERY_SELECTORS.ALL_FIELDS)
        .single();

      if (error) {
        this.logger.error(`Failed to toggle active status for user: ${id}`, error);
        throw new BadRequestException(error.message);
      }

      // Log successful toggle
      this.logger.log(interpolateMessage(LOG_MESSAGES.USER_TOGGLE_ACTIVE_SUCCESS, { 
        userId: id, 
        isActive: isActive.toString() 
      }));

      return data;
    } catch (error) {
      this.logger.error(`Failed to toggle active status for user: ${id}`, error);
      throw error;
    }
  }

  /**
   * Update a user's role (admin only)
   */
  async updateRole(id: string, role: import('../../common/helpers/string-const').UserRole) {
    // Log role update start
    this.logger.log(interpolateMessage(LOG_MESSAGES.USER_ROLE_UPDATE_STARTED, { 
      userId: id, 
      role: role 
    }));
    
    try {
      const { data, error } = await this.supabase
        .getClient()
        .from(TABLES.USERS)
        .update({ [TABLE_COLUMNS.ROLE]: role })
        .eq(TABLE_COLUMNS.ID, id)
        .select(QUERY_SELECTORS.ALL_FIELDS)
        .single();

      if (error) {
        this.logger.error(`Failed to update role for user: ${id} to ${role}`, error);
        throw new BadRequestException(error.message);
      }

      // Log successful role update
      this.logger.log(interpolateMessage(LOG_MESSAGES.USER_ROLE_UPDATE_SUCCESS, { 
        userId: id, 
        role: role 
      }));

      return data;
    } catch (error) {
      this.logger.error(`Failed to update role for user: ${id} to ${role}`, error);
      throw error;
    }
  }

  /**
   * Update user's last login timestamp
   */
  async updateLastLogin(id: string) {
    const { data, error } = await this.supabase
      .getClient()
      .from(TABLES.USERS)
      .update({ [TABLE_COLUMNS.LAST_LOGIN_AT]: new Date().toISOString() })
      .eq(TABLE_COLUMNS.ID, id)
      .select(QUERY_SELECTORS.ALL_FIELDS)
      .single();

    if (error) {
      throw new BadRequestException(error.message);
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

    const rows = skills.map((s) => ({
      [TABLE_COLUMNS.USER_ID]: userId,
      [TABLE_COLUMNS.SKILL_NAME]: s.skill_name,
      [TABLE_COLUMNS.PROFICIENCY_LEVEL]: s.proficiency_level,
    }));

    const { data, error } = await this.supabase
      .getClient()
      .from(TABLES.USER_SKILLS)
      .insert(rows)
      .select(QUERY_SELECTORS.ALL_FIELDS);

    if (error) {
      throw new BadRequestException(error.message);
    }

    return data;
  }

  /**
   * Find user by email
   */
  async findByEmail(email: string) {
    const { data, error } = await this.supabase
      .getClient()
      .from(TABLES.USERS)
      .select(QUERY_SELECTORS.ALL_FIELDS)
      .eq(TABLE_COLUMNS.EMAIL, email)
      .single();

    if (error || !data) {
      throw new NotFoundException(
        interpolateMessage(MESSAGES.USER_NOT_FOUND_BY_EMAIL, { email })
      );
    }

    return data;
  }

  /**
   * Promote a user to moderator and assign skills (admin only)
   */
  async makeModerator(email: string, skills: AddUserSkillDto[]) {
    this.logger.log(`Starting moderator promotion process for email: ${email}`);
    
    try {
      // Step 1: find user by email
      const user = await this.findByEmail(email);
      this.logger.log(`Found user for moderator promotion: ${user[TABLE_COLUMNS.ID]}`);

      // Step 2: check if user is already a moderator or admin
      if (user[TABLE_COLUMNS.ROLE] === USER_ROLES.MODERATOR) {
        this.logger.warn(`User ${email} is already a moderator`);
        throw new BadRequestException(
          interpolateMessage(MESSAGES.USER_ALREADY_MODERATOR, { email })
        );
      }
      if (user[TABLE_COLUMNS.ROLE] === USER_ROLES.ADMIN) {
        this.logger.warn(`Cannot demote admin ${email} to moderator`);
        throw new BadRequestException(
          interpolateMessage(MESSAGES.CANNOT_DEMOTE_ADMIN, { email })
        );
      }

      // Step 3: update role to moderator
      this.logger.log(`Updating role to moderator for user: ${user[TABLE_COLUMNS.ID]}`);
      await this.updateRole(user[TABLE_COLUMNS.ID], USER_ROLES.MODERATOR as any);

      // Step 4: insert skills
      this.logger.log(`Adding ${skills.length} skills for new moderator: ${user[TABLE_COLUMNS.ID]}`);
      const insertedSkills = await this.addSkills(user[TABLE_COLUMNS.ID], skills);

      // Step 5: return updated moderator profile with skills
      const moderator = await this.getModeratorById(user[TABLE_COLUMNS.ID]);
      
      this.logger.log(`Successfully promoted user ${email} to moderator with ${insertedSkills.length} skills`);
      
      return { ...moderator, skills: insertedSkills };
    } catch (error) {
      this.logger.error(`Failed to promote user ${email} to moderator`, error);
      throw error;
    }
  }

  /**
   * Get all users with their skills (admin only)
   */
  async getAllUsers() {
    this.logger.log('Fetching all users with skills');
    
    try {
      const { data, error } = await this.supabase
        .getClient()
        .from(TABLES.USERS)
        .select(QUERY_SELECTORS.USERS_WITH_SKILLS)
        .order('created_at', { ascending: false });

      if (error) {
        this.logger.error('Failed to fetch users', error);
        throw new BadRequestException(error.message);
      }

      const result = (data || []).map((u: any) => ({
        ...u,
        skills: u.user_skills || [],
      }));

      this.logger.log(`Successfully fetched ${result.length} users`);

      return result;
    } catch (error) {
      this.logger.error('Failed to fetch users', error);
      throw error;
    }
  }

  /**
   * Get all moderators with their skills
   */
  async getModerators() {
    this.logger.log('Fetching all moderators with skills');
    
    try {
      const { data, error } = await this.supabase
        .getClient()
        .from(TABLES.USERS)
        .select(QUERY_SELECTORS.USERS_WITH_SKILLS)
        .eq(TABLE_COLUMNS.ROLE, USER_ROLES.MODERATOR);

      if (error) {
        this.logger.error('Failed to fetch moderators', error);
        throw new BadRequestException(error.message);
      }

      const result = (data || []).map((u: any) => ({
        ...u,
        skills: u.user_skills || [],
      }));

      this.logger.log(`Successfully fetched ${result.length} moderators`);

      // Ensure skills array exists
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
    const { data, error } = await this.supabase
      .getClient()
      .from(TABLES.USERS)
      .select(QUERY_SELECTORS.USERS_WITH_SKILLS)
      .eq(TABLE_COLUMNS.ID, id)
      .eq(TABLE_COLUMNS.ROLE, USER_ROLES.MODERATOR)
      .single();

    if (error || !data) {
      throw new NotFoundException(MESSAGES.NOT_FOUND);
    }

    return {
      ...data,
      skills: data.user_skills || [],
    };
  }

  //#endregion
} 