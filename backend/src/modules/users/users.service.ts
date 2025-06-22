import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { SupabaseService } from '../../core/database/supabase.client';
import { 
  MESSAGES, 
  TABLES, 
  TABLE_COLUMNS, 
  QUERY_SELECTORS, 
  USER_ROLES,
  interpolateMessage 
} from '../../common/helpers/string-const';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { AddUserSkillDto } from './dto/add-user-skill.dto';

@Injectable()
export class UsersService {
  constructor(private readonly supabase: SupabaseService) {}

  async getProfile(userId: string) {
    const { data, error } = await this.supabase
      .getClient()
      .from(TABLES.USERS)
      .select(QUERY_SELECTORS.ALL_FIELDS)
      .eq(TABLE_COLUMNS.ID, userId)
      .single();

    if (error || !data) {
      throw new NotFoundException(MESSAGES.NOT_FOUND);
    }

    /**
     * Add computed field is_profile_completed
     * Profile is considered complete when both first_name and last_name are present
     * This helps frontend determine if user needs to complete their profile
     */
    const is_profile_completed = !!(data[TABLE_COLUMNS.FIRST_NAME] && data[TABLE_COLUMNS.LAST_NAME]);

    return {
      ...data,
      is_profile_completed,
    };
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const { data, error } = await this.supabase
      .getClient()
      .from(TABLES.USERS)
      .update({ ...dto })
      .eq(TABLE_COLUMNS.ID, userId)
      .select(QUERY_SELECTORS.ALL_FIELDS)
      .single();

    if (error) {
      throw new BadRequestException(error.message);
    }

    return data;
  }

  async addSkill(id: string, dto: AddUserSkillDto) {
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
      throw new BadRequestException(error.message);
    }

    return data;
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
    const { data, error } = await this.supabase
      .getClient()
      .from(TABLES.USERS)
      .update({ [TABLE_COLUMNS.IS_ACTIVE]: isActive })
      .eq(TABLE_COLUMNS.ID, id)
      .select(QUERY_SELECTORS.ALL_FIELDS)
      .single();

    if (error) {
      throw new BadRequestException(error.message);
    }

    return data;
  }

  /**
   * Update a user's role (admin only)
   */
  async updateRole(id: string, role: import('../../common/helpers/string-const').UserRole) {
    const { data, error } = await this.supabase
      .getClient()
      .from(TABLES.USERS)
      .update({ [TABLE_COLUMNS.ROLE]: role })
      .eq(TABLE_COLUMNS.ID, id)
      .select(QUERY_SELECTORS.ALL_FIELDS)
      .single();

    if (error) {
      throw new BadRequestException(error.message);
    }

    return data;
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
    // Step 1: find user by email
    const user = await this.findByEmail(email);

    // Step 2: check if user is already a moderator or admin
    if (user[TABLE_COLUMNS.ROLE] === USER_ROLES.MODERATOR) {
      throw new BadRequestException(
        interpolateMessage(MESSAGES.USER_ALREADY_MODERATOR, { email })
      );
    }
    if (user[TABLE_COLUMNS.ROLE] === USER_ROLES.ADMIN) {
      throw new BadRequestException(
        interpolateMessage(MESSAGES.CANNOT_DEMOTE_ADMIN, { email })
      );
    }

    // Step 3: update role to moderator
    await this.updateRole(user[TABLE_COLUMNS.ID], USER_ROLES.MODERATOR as any);

    // Step 4: insert skills
    const insertedSkills = await this.addSkills(user[TABLE_COLUMNS.ID], skills);

    // Step 5: return updated moderator profile with skills
    const moderator = await this.getModeratorById(user[TABLE_COLUMNS.ID]);
    return { ...moderator, skills: insertedSkills };
  }

  /**
   * Get all moderators with their skills
   */
  async getModerators() {
    const { data, error } = await this.supabase
      .getClient()
      .from(TABLES.USERS)
      .select(QUERY_SELECTORS.USERS_WITH_SKILLS)
      .eq(TABLE_COLUMNS.ROLE, USER_ROLES.MODERATOR);

    if (error) {
      throw new BadRequestException(error.message);
    }

    // Ensure skills array exists
    return (data || []).map((u: any) => ({
      ...u,
      skills: u.user_skills || [],
    }));
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