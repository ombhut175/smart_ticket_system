import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { SupabaseService } from '../../core/database/supabase.client';
import { MESSAGES, TABLES } from '../../string-const';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class UsersService {
  constructor(private readonly supabase: SupabaseService) {}

  async getProfile(userId: string) {
    const { data, error } = await this.supabase
      .getClient()
      .from(TABLES.USERS)
      .select('*')
      .eq('id', userId)
      .single();

    if (error || !data) {
      throw new NotFoundException(MESSAGES.NOT_FOUND);
    }

    /**
     * Add computed field is_profile_completed
     * Profile is considered complete when both first_name and last_name are present
     * This helps frontend determine if user needs to complete their profile
     */
    const is_profile_completed = !!(data.first_name && data.last_name);

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
      .eq('id', userId)
      .select('*')
      .single();

    if (error) {
      throw new BadRequestException(error.message);
    }

    return data;
  }
} 