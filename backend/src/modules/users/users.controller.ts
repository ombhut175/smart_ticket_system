import { Controller, Get, Put, Body, UseGuards, Request } from '@nestjs/common';
import { UsersService } from './users.service';
import { SupabaseAuthGuard } from '../../common/guards/supabase-auth.guard';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SWAGGER_TAGS, API_PATHS, MESSAGES } from '../../string-const';
import { ApiResponseHelper } from '../../common/helpers/api-response.helper';

/**
 * Users Controller
 * Provides endpoints for retrieving and updating user profile information
 */
@ApiTags(SWAGGER_TAGS.USERS)
@UseGuards(SupabaseAuthGuard)
@Controller(API_PATHS.USERS)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * Retrieve current user's profile information
   * GET /api/users/me
   * @returns User profile data including is_profile_completed field
   * @description Returns complete user profile from public.users table.
   * The is_profile_completed field indicates whether the user has filled
   * both first_name and last_name (true if both present, false otherwise).
   * This helps frontend determine if user needs to complete their profile.
   */
  @Get('me')
  @ApiOperation({ 
    summary: 'Get current user profile', 
    description: 'Returns profile details of the authenticated user including computed is_profile_completed field.' 
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Profile retrieved successfully',
    example: {
      success: true,
      statusCode: 200,
      message: 'Success',
      data: {
        id: 'uuid',
        email: 'user@example.com',
        role: 'user',
        first_name: 'John',
        last_name: 'Doe',
        is_active: true,
        is_email_verified: true,
        is_profile_completed: true,
        last_login_at: '2023-01-01T00:00:00.000Z',
        created_at: '2023-01-01T00:00:00.000Z',
        updated_at: '2023-01-01T00:00:00.000Z'
      },
      timestamp: '2023-01-01T00:00:00.000Z'
    }
  })
  async getMe(@Request() req) {
    /**
     * Process:
     * 1. Extract user ID from authenticated request (set by SupabaseAuthGuard)
     * 2. Query public.users table to get complete profile data
     * 3. Add computed is_profile_completed field based on name completion
     * 4. Return standardized response with profile data
     */
    const userId = req.user.id;
    const profile = await this.usersService.getProfile(userId);
    return ApiResponseHelper.success(profile, MESSAGES.SUCCESS);
  }

  /**
   * Update current user's profile information
   * PUT /api/users/me
   */
  @Put('me')
  @ApiOperation({ summary: 'Update current user profile', description: 'Updates first_name and/or last_name of the authenticated user.' })
  @ApiResponse({ status: 200, description: 'Profile updated successfully' })
  async updateMe(@Request() req, @Body() dto: UpdateProfileDto) {
    const userId = req.user.id;
    const updated = await this.usersService.updateProfile(userId, dto);
    return ApiResponseHelper.success(updated, MESSAGES.UPDATED);
  }
} 