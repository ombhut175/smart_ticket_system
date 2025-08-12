import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Res,
  Logger,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Response } from 'express';
import {
  SWAGGER_TAGS,
  MESSAGES,
  API_PATHS,
  LOG_MESSAGES,
  interpolateMessage,
} from '../../common/helpers/string-const';
import { ApiResponseHelper } from '../../common/helpers/api-response.helper';
import { CookieHelper } from '../../common/helpers/cookie.helper';

/**
 * Authentication Controller
 * Handles user authentication operations including signup, login, and logout
 * All endpoints return standardized responses with detailed information about the operation
 */
@ApiTags(SWAGGER_TAGS.AUTHENTICATION)
@Controller(API_PATHS.AUTH)
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly authService: AuthService) {}

  //#region ==================== USER REGISTRATION ====================

  /**
   * Register a new user account
   * @param signupDto - User registration data including email, password, and name
   * @returns Standardized response with user registration details
   * @description This endpoint creates a new user account in Supabase Auth system
   * The user data is validated through DTOs and stored with proper error handling
   * Supabase Auth returns a user object and (optionally) a session if email confirmation is disabled.
   */
  @Post('signup')
  @ApiOperation({
    summary: 'Register a new user account',
    description:
      'Creates a new user account with email/password authentication. Returns user object and optional session information.',
  })
  @ApiResponse({
    status: 201,
    description: 'User account created successfully',
    example: {
      success: true,
      statusCode: 201,
      message: 'User signed up successfully',
      data: {
        user: { id: 'uuid', email: 'user@example.com' },
        session: null,
      },
      timestamp: '2023-01-01T00:00:00.000Z',
    },
  })
  async signUp(@Body() signupDto: SignupDto) {
    /**
     * Process:
     * 1. Validate input data through SignupDto class-validator decorators
     * 2. Call AuthService.signUp() which interfaces with Supabase Auth API
     * 3. Supabase creates user record and sends confirmation email if configured
     * 4. Return standardized success response with user data (excluding sensitive info)
     */

    // Log endpoint access
    this.logger.log(
      interpolateMessage(LOG_MESSAGES.ENDPOINT_ACCESSED, {
        method: 'POST',
        endpoint: '/auth/signup',
        userId: 'anonymous',
      }),
    );

    try {
      const result = await this.authService.signUp(signupDto);

      // Log successful signup endpoint completion
      this.logger.log(
        interpolateMessage(LOG_MESSAGES.ENDPOINT_COMPLETED, {
          method: 'POST',
          endpoint: '/auth/signup',
          userId: result.user?.id || 'unknown',
        }),
      );

      return ApiResponseHelper.created(
        {
          user: {
            id: result.user?.id,
            email: result.user?.email,
            email_confirmed_at: result.user?.email_confirmed_at,
          },
          session: result.session, // Will be null if email confirmation required
        },
        MESSAGES.USER_SIGNED_UP_SUCCESS,
      );
    } catch (error) {
      // Log endpoint failure
      this.logger.error(
        interpolateMessage(LOG_MESSAGES.ENDPOINT_FAILED, {
          method: 'POST',
          endpoint: '/auth/signup',
          userId: 'anonymous',
        }),
        error,
      );
      throw error;
    }
  }

  //#endregion

  //#region ==================== USER LOGIN ====================

  /**
   * Authenticate existing user and establish session
   * @param loginDto - User login credentials (email and password)
   * @param res - Express response object for setting authentication cookie
   * @returns Standardized response confirming successful authentication
   * @description This endpoint authenticates a user against Supabase Auth system
   * Upon successful login, sets an HTTP-only cookie containing the access token
   * The token is used for subsequent authenticated requests through SupabaseAuthGuard.
   * Additionally updates the user's last_login_at timestamp and email verification status.
   */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Authenticate user and establish session',
    description:
      'Authenticates user credentials and sets secure HTTP-only cookie with access token. Cookie expires in 7 days and is used for subsequent authenticated requests. Updates last_login_at timestamp in user profile.',
  })
  @ApiResponse({
    status: 200,
    description: 'User authenticated successfully and session established',
    example: {
      success: true,
      statusCode: 200,
      message: 'User logged in successfully',
      data: {
        user: { id: 'uuid', email: 'user@example.com' },
        sessionInfo: { expires_at: 1234567890 },
      },
      timestamp: '2023-01-01T00:00:00.000Z',
    },
  })
  async signIn(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    /**
     * Process:
     * 1. Validate credentials through LoginDto class-validator decorators
     * 2. Call AuthService.signIn() which uses Supabase signInWithPassword API
     * 3. Supabase verifies password hash and returns session with access_token
     * 4. Update user record in public.users table (is_email_verified=true, last_login_at=now)
     * 5. Store access_token in secure HTTP-only cookie via CookieHelper
     * 6. Return success response with user info (token excluded for security)
     */

    // Log endpoint access
    this.logger.log(
      interpolateMessage(LOG_MESSAGES.ENDPOINT_ACCESSED, {
        method: 'POST',
        endpoint: '/auth/login',
        userId: 'anonymous',
      }),
    );

    try {
      const { session, user } = await this.authService.signIn(loginDto);

      // Set secure authentication cookie if session exists
      if (session?.access_token) {
        CookieHelper.setAuthToken(res, session.access_token);
        this.logger.log(`Authentication cookie set for user: ${user?.id}`);
      }

      // Log successful login endpoint completion
      this.logger.log(
        interpolateMessage(LOG_MESSAGES.ENDPOINT_COMPLETED, {
          method: 'POST',
          endpoint: '/auth/login',
          userId: user?.id || 'unknown',
        }),
      );

      return ApiResponseHelper.success(
        {
          user: {
            id: user?.id,
            email: user?.email,
            last_sign_in_at: user?.last_sign_in_at,
          },
          sessionInfo: {
            expires_at: session?.expires_at,
            token_type: session?.token_type,
          },
        },
        MESSAGES.USER_LOGGED_IN_SUCCESS,
      );
    } catch (error) {
      // Log endpoint failure
      this.logger.error(
        interpolateMessage(LOG_MESSAGES.ENDPOINT_FAILED, {
          method: 'POST',
          endpoint: '/auth/login',
          userId: 'anonymous',
        }),
        error,
      );
      throw error;
    }
  }

  //#endregion

  //#region ==================== USER LOGOUT ====================

  /**
   * Terminate user session and clear authentication
   * @param res - Express response object for clearing authentication cookie
   * @returns Standardized response confirming successful logout
   * @description This endpoint terminates the user's session in Supabase Auth
   * Clears the HTTP-only authentication cookie to prevent further authenticated requests
   * Session is invalidated on Supabase side to ensure complete logout
   */
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Terminate user session and clear authentication',
    description:
      'Logs out the current user by invalidating their session in Supabase and clearing the authentication cookie.',
  })
  @ApiResponse({
    status: 200,
    description: 'User logged out successfully and session terminated',
    example: {
      success: true,
      statusCode: 200,
      message: 'User logged out successfully',
      data: null,
      timestamp: '2023-01-01T00:00:00.000Z',
    },
  })
  async logout(@Res({ passthrough: true }) res: Response) {
    /**
     * Process:
     * 1. Extract authentication token from HTTP-only cookie
     * 2. If token exists, call AuthService.signOut() to invalidate session in Supabase
     * 3. Clear the authentication cookie via CookieHelper
     * 4. Return success response confirming logout completion
     * Note: Even if no token exists, we return success for security (no information leakage)
     */

    // Log endpoint access
    this.logger.log(
      interpolateMessage(LOG_MESSAGES.ENDPOINT_ACCESSED, {
        method: 'POST',
        endpoint: '/auth/logout',
        userId: 'current_user',
      }),
    );

    try {
      const token = CookieHelper.getAuthToken(res.req.cookies);

      if (token) {
        this.logger.log(
          'Authentication token found, proceeding with session invalidation',
        );
        await this.authService.signOut(token);
      } else {
        this.logger.log(
          'No authentication token found, proceeding with cookie cleanup only',
        );
      }

      // Always clear cookie regardless of token validity
      CookieHelper.clearAuthToken(res);
      this.logger.log('Authentication cookie cleared');

      // Log successful logout endpoint completion
      this.logger.log(
        interpolateMessage(LOG_MESSAGES.ENDPOINT_COMPLETED, {
          method: 'POST',
          endpoint: '/auth/logout',
          userId: 'logged_out_user',
        }),
      );

      return ApiResponseHelper.success(null, MESSAGES.USER_LOGGED_OUT_SUCCESS);
    } catch (error) {
      // Log endpoint failure
      this.logger.error(
        interpolateMessage(LOG_MESSAGES.ENDPOINT_FAILED, {
          method: 'POST',
          endpoint: '/auth/logout',
          userId: 'current_user',
        }),
        error,
      );
      throw error;
    }
  }

  //#endregion
}
