import { Controller, Get, Put, Body, UseGuards, Request, Param, Patch, Post, Logger } from '@nestjs/common';
import { UsersService } from './users.service';
import { SupabaseAuthGuard } from '../../common/guards/supabase-auth.guard';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { SWAGGER_TAGS, API_PATHS, MESSAGES, USER_ROLES, UserRole, LOG_MESSAGES, interpolateMessage } from '../../common/helpers/string-const';
import { ApiResponseHelper } from '../../common/helpers/api-response.helper';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { ToggleActiveDto } from './dto/toggle-active.dto';
import { AddUserSkillDto } from './dto/add-user-skill.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { AddModeratorDto } from './dto/add-moderator.dto';

/**
 * Users Controller
 * Provides endpoints for retrieving and updating user profile information
 */
@ApiTags(SWAGGER_TAGS.USERS)
@UseGuards(SupabaseAuthGuard)
@Controller(API_PATHS.USERS)
export class UsersController {
  private readonly logger = new Logger(UsersController.name);

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
    
    // Log endpoint access
    this.logger.log(interpolateMessage(LOG_MESSAGES.ENDPOINT_ACCESSED, {
      method: 'GET',
      endpoint: '/users/me',
      userId: userId
    }));
    
    try {
      const profile = await this.usersService.getProfile(userId);
      
      // Log successful endpoint completion
      this.logger.log(interpolateMessage(LOG_MESSAGES.ENDPOINT_COMPLETED, {
        method: 'GET',
        endpoint: '/users/me',
        userId: userId
      }));
      
      return ApiResponseHelper.success(profile, MESSAGES.SUCCESS);
    } catch (error) {
      // Log endpoint failure
      this.logger.error(interpolateMessage(LOG_MESSAGES.ENDPOINT_FAILED, {
        method: 'GET',
        endpoint: '/users/me',
        userId: userId
      }), error);
      throw error;
    }
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
    
    // Log endpoint access
    this.logger.log(interpolateMessage(LOG_MESSAGES.ENDPOINT_ACCESSED, {
      method: 'PUT',
      endpoint: '/users/me',
      userId: userId
    }));
    
    try {
      const updated = await this.usersService.updateProfile(userId, dto);
      
      // Log successful endpoint completion
      this.logger.log(interpolateMessage(LOG_MESSAGES.ENDPOINT_COMPLETED, {
        method: 'PUT',
        endpoint: '/users/me',
        userId: userId
      }));
      
      return ApiResponseHelper.success(updated, MESSAGES.UPDATED);
    } catch (error) {
      // Log endpoint failure
      this.logger.error(interpolateMessage(LOG_MESSAGES.ENDPOINT_FAILED, {
        method: 'PUT',
        endpoint: '/users/me',
        userId: userId
      }), error);
      throw error;
    }
  }

  //#region ==================== ADMIN ENDPOINTS ====================

  /**
   * Update a user's role (ADMIN only)
   */
  @Patch(':id/role')
  @Roles(USER_ROLES.ADMIN)
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @ApiParam({
    name: 'id',
    description: 'UUID of the user whose role will be updated',
    example: 'uuid-123-456-789',
    type: 'string'
  })
  @ApiOperation({ 
    summary: '[ADMIN ONLY] Update user role', 
    description: 'Allows administrators to change the role of any user in the system. Only users with ADMIN role can access this endpoint. Available roles: user, moderator, admin.' 
  })
  @ApiResponse({ 
    status: 200, 
    description: 'User role updated successfully',
    example: {
      success: true,
      statusCode: 200,
      message: 'Updated',
      data: {
        id: 'uuid-123',
        email: 'john.doe@example.com',
        role: 'moderator',
        first_name: 'John',
        last_name: 'Doe',
        is_active: true,
        is_email_verified: true,
        last_login_at: '2023-01-01T00:00:00.000Z',
        created_at: '2023-01-01T00:00:00.000Z',
        updated_at: '2023-01-01T00:00:00.000Z'
      },
      timestamp: '2023-01-01T00:00:00.000Z'
    }
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized - Missing or invalid authentication token',
    example: {
      success: false,
      statusCode: 401,
      message: 'Unauthorized access',
      timestamp: '2023-01-01T00:00:00.000Z',
      path: '/api/users/uuid-123/role'
    }
  })
  @ApiResponse({ 
    status: 403, 
    description: 'Forbidden - User does not have ADMIN role',
    example: {
      success: false,
      statusCode: 403,
      message: 'Forbidden access',
      timestamp: '2023-01-01T00:00:00.000Z',
      path: '/api/users/uuid-123/role'
    }
  })
  @ApiResponse({ 
    status: 404, 
    description: 'User not found',
    example: {
      success: false,
      statusCode: 404,
      message: 'Resource not found',
      timestamp: '2023-01-01T00:00:00.000Z',
      path: '/api/users/uuid-123/role'
    }
  })
  async updateUserRole(
    @Param('id') id: string,
    @Body() dto: UpdateRoleDto,
  ) {
    // Log endpoint access
    this.logger.log(interpolateMessage(LOG_MESSAGES.ENDPOINT_ACCESSED, {
      method: 'PATCH',
      endpoint: `/users/${id}/role`,
      userId: 'admin_user'
    }));
    
    try {
      const updated = await this.usersService.updateRole(id, dto.role);
      
      // Log successful endpoint completion
      this.logger.log(interpolateMessage(LOG_MESSAGES.ENDPOINT_COMPLETED, {
        method: 'PATCH',
        endpoint: `/users/${id}/role`,
        userId: 'admin_user'
      }));
      
      return ApiResponseHelper.success(updated, MESSAGES.UPDATED);
    } catch (error) {
      // Log endpoint failure
      this.logger.error(interpolateMessage(LOG_MESSAGES.ENDPOINT_FAILED, {
        method: 'PATCH',
        endpoint: `/users/${id}/role`,
        userId: 'admin_user'
      }), error);
      throw error;
    }
  }

  /**
   * Add a skill to a user (ADMIN only)
   */
  @Post(':id/skills')
  @Roles(USER_ROLES.ADMIN)
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @ApiParam({
    name: 'id',
    description: 'UUID of the user who will receive the new skill',
    example: 'uuid-123-456-789',
    type: 'string'
  })
  @ApiOperation({ 
    summary: '[ADMIN ONLY] Add skill to user', 
    description: 'Allows administrators to add a new skill with proficiency level to any user. Only users with ADMIN role can access this endpoint. This helps track user capabilities for task assignment.' 
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Skill added to user successfully',
    example: {
      success: true,
      statusCode: 201,
      message: 'Created',
      data: {
        id: 'skill-uuid-456',
        user_id: 'uuid-123',
        skill_name: 'JavaScript',
        proficiency_level: 'advanced',
        created_at: '2023-01-01T00:00:00.000Z'
      },
      timestamp: '2023-01-01T00:00:00.000Z'
    }
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Bad Request - Invalid skill data or user already has this skill',
    example: {
      success: false,
      statusCode: 400,
      message: 'Bad request',
      timestamp: '2023-01-01T00:00:00.000Z',
      path: '/api/users/uuid-123/skills'
    }
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized - Missing or invalid authentication token',
    example: {
      success: false,
      statusCode: 401,
      message: 'Unauthorized access',
      timestamp: '2023-01-01T00:00:00.000Z',
      path: '/api/users/uuid-123/skills'
    }
  })
  @ApiResponse({ 
    status: 403, 
    description: 'Forbidden - User does not have ADMIN role',
    example: {
      success: false,
      statusCode: 403,
      message: 'Forbidden access',
      timestamp: '2023-01-01T00:00:00.000Z',
      path: '/api/users/uuid-123/skills'
    }
  })
  @ApiResponse({ 
    status: 404, 
    description: 'User not found',
    example: {
      success: false,
      statusCode: 404,
      message: 'Resource not found',
      timestamp: '2023-01-01T00:00:00.000Z',
      path: '/api/users/uuid-123/skills'
    }
  })
  async addUserSkill(
    @Param('id') id: string,
    @Body() dto: AddUserSkillDto,
  ) {
    const skill = await this.usersService.addSkill(id, dto);
    return ApiResponseHelper.created(skill, MESSAGES.CREATED);
  }

  /**
   * Toggle a user's active status (ADMIN only)
   */
  @Patch(':id/active')
  @Roles(USER_ROLES.ADMIN)
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @ApiParam({
    name: 'id',
    description: 'UUID of the user whose active status will be toggled',
    example: 'uuid-123-456-789',
    type: 'string'
  })
  @ApiOperation({ 
    summary: '[ADMIN ONLY] Toggle user active status', 
    description: 'Allows administrators to enable or disable any user account. When disabled, the user cannot log in or access the system. Only users with ADMIN role can access this endpoint. Use this for account suspension or reactivation.' 
  })
  @ApiResponse({ 
    status: 200, 
    description: 'User active status updated successfully',
    example: {
      success: true,
      statusCode: 200,
      message: 'Updated',
      data: {
        id: 'uuid-123',
        email: 'john.doe@example.com',
        role: 'user',
        first_name: 'John',
        last_name: 'Doe',
        is_active: false,
        is_email_verified: true,
        last_login_at: '2023-01-01T00:00:00.000Z',
        created_at: '2023-01-01T00:00:00.000Z',
        updated_at: '2023-01-01T00:00:00.000Z'
      },
      timestamp: '2023-01-01T00:00:00.000Z'
    }
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Bad Request - Invalid active status value',
    example: {
      success: false,
      statusCode: 400,
      message: 'Bad request',
      timestamp: '2023-01-01T00:00:00.000Z',
      path: '/api/users/uuid-123/active'
    }
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized - Missing or invalid authentication token',
    example: {
      success: false,
      statusCode: 401,
      message: 'Unauthorized access',
      timestamp: '2023-01-01T00:00:00.000Z',
      path: '/api/users/uuid-123/active'
    }
  })
  @ApiResponse({ 
    status: 403, 
    description: 'Forbidden - User does not have ADMIN role',
    example: {
      success: false,
      statusCode: 403,
      message: 'Forbidden access',
      timestamp: '2023-01-01T00:00:00.000Z',
      path: '/api/users/uuid-123/active'
    }
  })
  @ApiResponse({ 
    status: 404, 
    description: 'User not found',
    example: {
      success: false,
      statusCode: 404,
      message: 'Resource not found',
      timestamp: '2023-01-01T00:00:00.000Z',
      path: '/api/users/uuid-123/active'
    }
  })
  async toggleUserActive(
    @Param('id') id: string,
    @Body() dto: ToggleActiveDto,
  ) {
    const user = await this.usersService.toggleActive(id, dto.is_active);
    return ApiResponseHelper.success(user, MESSAGES.UPDATED);
  }

  /**
   * Promote a user to moderator and assign skills (ADMIN only)
   */
  @Post('moderator')
  @Roles(USER_ROLES.ADMIN)
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @ApiOperation({ 
    summary: '[ADMIN ONLY] Promote user to moderator', 
    description: 'Promotes a regular user to moderator role and assigns multiple skills in a single transaction. This endpoint performs multiple operations: 1) Finds the user by email address, 2) Validates the user can be promoted (not already moderator/admin), 3) Updates the user\'s role from "user" to "moderator" in the users table, 4) Batch inserts the provided skills into the user_skills table. Only administrators can access this endpoint. The user must exist and be active to be promoted.' 
  })
  @ApiResponse({ 
    status: 201, 
    description: 'User successfully promoted to moderator with skills assigned',
    example: {
      success: true,
      statusCode: 201,
      message: 'Created',
      data: {
        id: 'uuid-123-456-789',
        email: 'john.doe@example.com',
        role: 'moderator',
        first_name: 'John',
        last_name: 'Doe',
        is_active: true,
        is_email_verified: true,
        last_login_at: '2023-01-01T00:00:00.000Z',
        created_at: '2023-01-01T00:00:00.000Z',
        updated_at: '2023-01-01T00:00:00.000Z',
        skills: [
          {
            id: 'skill-uuid-1',
            user_id: 'uuid-123-456-789',
            skill_name: 'JavaScript',
            proficiency_level: 'advanced',
            created_at: '2023-01-01T00:00:00.000Z'
          },
          {
            id: 'skill-uuid-2',
            user_id: 'uuid-123-456-789',
            skill_name: 'Customer Support',
            proficiency_level: 'expert',
            created_at: '2023-01-01T00:00:00.000Z'
          }
        ]
      },
      timestamp: '2023-01-01T00:00:00.000Z'
    }
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Bad Request - Invalid email format, user already is moderator/admin, or invalid skills data',
    example: {
      success: false,
      statusCode: 400,
      message: 'User john.doe@example.com is already a moderator',
      timestamp: '2023-01-01T00:00:00.000Z',
      path: '/api/users/moderator'
    }
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized - Missing or invalid authentication token',
    example: {
      success: false,
      statusCode: 401,
      message: 'Unauthorized access',
      timestamp: '2023-01-01T00:00:00.000Z',
      path: '/api/users/moderator'
    }
  })
  @ApiResponse({ 
    status: 403, 
    description: 'Forbidden - User does not have ADMIN role',
    example: {
      success: false,
      statusCode: 403,
      message: 'Access denied. Required roles: [admin], User role: user',
      timestamp: '2023-01-01T00:00:00.000Z',
      path: '/api/users/moderator'
    }
  })
  @ApiResponse({ 
    status: 404, 
    description: 'User with specified email not found',
    example: {
      success: false,
      statusCode: 404,
      message: 'User with email john.doe@example.com not found',
      timestamp: '2023-01-01T00:00:00.000Z',
      path: '/api/users/moderator'
    }
  })
  async promoteToModerator(
    @Body() dto: AddModeratorDto,
  ) {
    const result = await this.usersService.makeModerator(dto.email, dto.skills);
    return ApiResponseHelper.created(result, MESSAGES.CREATED);
  }

  /**
   * Get all users with their skills (ADMIN only)
   */
  @Get('all')
  @Roles(USER_ROLES.ADMIN)
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @ApiOperation({ 
    summary: '[ADMIN ONLY] Get all users', 
    description: 'Retrieves a complete list of all users in the system along with their associated skills. This endpoint performs a JOIN query between the users and user_skills tables to provide comprehensive user information including their skill sets and proficiency levels. Useful for admin dashboards and user management interfaces.' 
  })
  @ApiResponse({ 
    status: 200, 
    description: 'List of all users with skills retrieved successfully',
    example: {
      success: true,
      statusCode: 200,
      message: 'Success',
      data: [
        {
          id: 'uuid-123-456-789',
          email: 'user@example.com',
          role: 'user',
          first_name: 'John',
          last_name: 'Doe',
          is_active: true,
          is_email_verified: true,
          last_login_at: '2023-01-01T00:00:00.000Z',
          created_at: '2023-01-01T00:00:00.000Z',
          updated_at: '2023-01-01T00:00:00.000Z',
          skills: []
        },
        {
          id: 'uuid-987-654-321',
          email: 'moderator@example.com',
          role: 'moderator',
          first_name: 'Jane',
          last_name: 'Smith',
          is_active: true,
          is_email_verified: true,
          last_login_at: '2023-01-01T00:00:00.000Z',
          created_at: '2023-01-01T00:00:00.000Z',
          updated_at: '2023-01-01T00:00:00.000Z',
          skills: [
            {
              id: 'skill-uuid-1',
              user_id: 'uuid-987-654-321',
              skill_name: 'JavaScript',
              proficiency_level: 'advanced',
              created_at: '2023-01-01T00:00:00.000Z'
            }
          ]
        }
      ],
      timestamp: '2023-01-01T00:00:00.000Z'
    }
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized - Missing or invalid authentication token',
    example: {
      success: false,
      statusCode: 401,
      message: 'Unauthorized access',
      timestamp: '2023-01-01T00:00:00.000Z',
      path: '/api/users/all'
    }
  })
  @ApiResponse({ 
    status: 403, 
    description: 'Forbidden - User does not have ADMIN role',
    example: {
      success: false,
      statusCode: 403,
      message: 'Access denied. Required roles: [admin], User role: user',
      timestamp: '2023-01-01T00:00:00.000Z',
      path: '/api/users/all'
    }
  })
  async getAllUsers() {
    const users = await this.usersService.getAllUsers();
    return ApiResponseHelper.success(users, MESSAGES.SUCCESS);
  }

  /**
   * Get all moderators with their skills (ADMIN only)
   */
  @Get('moderator')
  @Roles(USER_ROLES.ADMIN)
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @ApiOperation({ 
    summary: '[ADMIN ONLY] Get all moderators', 
    description: 'Retrieves a complete list of all users with moderator role along with their associated skills. This endpoint performs a JOIN query between the users and user_skills tables to provide comprehensive moderator information including their skill sets and proficiency levels. Useful for admin dashboards and moderator management interfaces.' 
  })
  @ApiResponse({ 
    status: 200, 
    description: 'List of moderators with skills retrieved successfully',
    example: {
      success: true,
      statusCode: 200,
      message: 'Success',
      data: [
        {
          id: 'uuid-123-456-789',
          email: 'moderator1@example.com',
          role: 'moderator',
          first_name: 'John',
          last_name: 'Doe',
          is_active: true,
          is_email_verified: true,
          last_login_at: '2023-01-01T00:00:00.000Z',
          created_at: '2023-01-01T00:00:00.000Z',
          updated_at: '2023-01-01T00:00:00.000Z',
          skills: [
            {
              id: 'skill-uuid-1',
              user_id: 'uuid-123-456-789',
              skill_name: 'JavaScript',
              proficiency_level: 'advanced',
              created_at: '2023-01-01T00:00:00.000Z'
            },
            {
              id: 'skill-uuid-2',
              user_id: 'uuid-123-456-789',
              skill_name: 'Customer Support',
              proficiency_level: 'expert',
              created_at: '2023-01-01T00:00:00.000Z'
            }
          ]
        },
        {
          id: 'uuid-987-654-321',
          email: 'moderator2@example.com',
          role: 'moderator',
          first_name: 'Jane',
          last_name: 'Smith',
          is_active: true,
          is_email_verified: true,
          last_login_at: '2023-01-01T00:00:00.000Z',
          created_at: '2023-01-01T00:00:00.000Z',
          updated_at: '2023-01-01T00:00:00.000Z',
          skills: [
            {
              id: 'skill-uuid-3',
              user_id: 'uuid-987-654-321',
              skill_name: 'Python',
              proficiency_level: 'expert',
              created_at: '2023-01-01T00:00:00.000Z'
            }
          ]
        }
      ],
      timestamp: '2023-01-01T00:00:00.000Z'
    }
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized - Missing or invalid authentication token',
    example: {
      success: false,
      statusCode: 401,
      message: 'Unauthorized access',
      timestamp: '2023-01-01T00:00:00.000Z',
      path: '/api/users/moderator'
    }
  })
  @ApiResponse({ 
    status: 403, 
    description: 'Forbidden - User does not have ADMIN role',
    example: {
      success: false,
      statusCode: 403,
      message: 'Access denied. Required roles: [admin], User role: moderator',
      timestamp: '2023-01-01T00:00:00.000Z',
      path: '/api/users/moderator'
    }
  })
  async getModerators() {
    const moderators = await this.usersService.getModerators();
    return ApiResponseHelper.success(moderators, MESSAGES.SUCCESS);
  }

  /**
   * Get specific moderator by ID with skills (ADMIN only)
   */
  @Get('moderator/:id')
  @Roles(USER_ROLES.ADMIN)
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @ApiParam({
    name: 'id',
    description: 'UUID of the moderator to retrieve',
    example: 'uuid-123-456-789',
    type: 'string'
  })
  @ApiOperation({ 
    summary: '[ADMIN ONLY] Get moderator by ID', 
    description: 'Retrieves detailed information about a specific moderator including their complete profile and all associated skills. This endpoint performs a JOIN query to fetch user data from the users table along with all related skills from the user_skills table. Only returns users who have the moderator role. Useful for moderator profile pages and detailed skill management.' 
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Moderator profile and skills retrieved successfully',
    example: {
      success: true,
      statusCode: 200,
      message: 'Success',
      data: {
        id: 'uuid-123-456-789',
        email: 'moderator@example.com',
        role: 'moderator',
        first_name: 'John',
        last_name: 'Doe',
        is_active: true,
        is_email_verified: true,
        last_login_at: '2023-01-01T00:00:00.000Z',
        created_at: '2023-01-01T00:00:00.000Z',
        updated_at: '2023-01-01T00:00:00.000Z',
        skills: [
          {
            id: 'skill-uuid-1',
            user_id: 'uuid-123-456-789',
            skill_name: 'JavaScript',
            proficiency_level: 'advanced',
            created_at: '2023-01-01T00:00:00.000Z'
          },
          {
            id: 'skill-uuid-2',
            user_id: 'uuid-123-456-789',
            skill_name: 'Customer Support',
            proficiency_level: 'expert',
            created_at: '2023-01-01T00:00:00.000Z'
          },
          {
            id: 'skill-uuid-3',
            user_id: 'uuid-123-456-789',
            skill_name: 'Python',
            proficiency_level: 'intermediate',
            created_at: '2023-01-01T00:00:00.000Z'
          }
        ]
      },
      timestamp: '2023-01-01T00:00:00.000Z'
    }
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized - Missing or invalid authentication token',
    example: {
      success: false,
      statusCode: 401,
      message: 'Unauthorized access',
      timestamp: '2023-01-01T00:00:00.000Z',
      path: '/api/users/moderator/uuid-123'
    }
  })
  @ApiResponse({ 
    status: 403, 
    description: 'Forbidden - User does not have ADMIN role',
    example: {
      success: false,
      statusCode: 403,
      message: 'Access denied. Required roles: [admin], User role: user',
      timestamp: '2023-01-01T00:00:00.000Z',
      path: '/api/users/moderator/uuid-123'
    }
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Moderator not found or user is not a moderator',
    example: {
      success: false,
      statusCode: 404,
      message: 'Resource not found',
      timestamp: '2023-01-01T00:00:00.000Z',
      path: '/api/users/moderator/uuid-123'
    }
  })
  async getModeratorById(@Param('id') id: string) {
    const moderator = await this.usersService.getModeratorById(id);
    return ApiResponseHelper.success(moderator, MESSAGES.SUCCESS);
  }

  //#endregion
} 