import { BadRequestException, Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { SupabaseService } from '../../core/database/supabase.client';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { LOG_MESSAGES, interpolateMessage } from '../../common/helpers/string-const';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(private readonly supabase: SupabaseService) {}

  async signUp(dto: SignupDto) {
    const { email, password } = dto;
    
    // Log signup process start
    this.logger.log(interpolateMessage(LOG_MESSAGES.AUTH_SIGNUP_STARTED, { email }));
    
    try {
      const { data, error } = await this.supabase.getClient().auth.signUp({
        email,
        password,
      });

      if (error) {
        this.logger.error(interpolateMessage(LOG_MESSAGES.AUTH_SIGNUP_FAILED, { email }), error);
        throw new BadRequestException(error.message);
      }

      // Log successful signup
      this.logger.log(interpolateMessage(LOG_MESSAGES.AUTH_SIGNUP_SUCCESS, { 
        email, 
        userId: data.user?.id || 'unknown' 
      }));

      return data;
    } catch (error) {
      this.logger.error(interpolateMessage(LOG_MESSAGES.AUTH_SIGNUP_FAILED, { email }), error);
      throw error;
    }
  }

  async signIn(dto: LoginDto) {
    /**
     * User Sign-In Process:
     * 1. Authenticate user with Supabase Auth using email/password
     * 2. If successful, update user record in public.users table:
     *    - Mark email as verified (is_email_verified = true)
     *    - Record current login timestamp (last_login_at = now)
     * 3. Return session data for cookie storage and user info
     */
    const { email, password } = dto;
    
    // Log signin process start
    this.logger.log(interpolateMessage(LOG_MESSAGES.AUTH_SIGNIN_STARTED, { email }));
    
    try {
      const { data, error } = await this.supabase.getClient().auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        this.logger.error(interpolateMessage(LOG_MESSAGES.AUTH_SIGNIN_FAILED, { email }), error);
        throw new UnauthorizedException(error.message);
      }

      /**
       * Update user record in public.users table:
       * - is_email_verified: true (user successfully logged in, so email is verified)
       * - last_login_at: current timestamp (track user activity for analytics)
       * 
       * This is separate from Supabase Auth and maintains our application-specific user data
       */
      if (data.user) {
        this.logger.log(interpolateMessage(LOG_MESSAGES.AUTH_SIGNIN_UPDATE_USER_DATA, { userId: data.user.id }));
        
        await this.supabase
          .getClient()
          .from('users')
          .update({ 
            is_email_verified: true,
            last_login_at: new Date().toISOString()
          })
          .eq('id', data.user.id);
      }

      // Log successful signin
      this.logger.log(interpolateMessage(LOG_MESSAGES.AUTH_SIGNIN_SUCCESS, { 
        email, 
        userId: data.user?.id || 'unknown' 
      }));

      return data;
    } catch (error) {
      this.logger.error(interpolateMessage(LOG_MESSAGES.AUTH_SIGNIN_FAILED, { email }), error);
      throw error;
    }
  }

  async signOut(accessToken: string) {
    // Extract user ID from token for logging (if possible)
    let userId = 'unknown';
    try {
      const userClient = this.supabase.getUserClient(accessToken);
      const { data: { user } } = await userClient.auth.getUser();
      userId = user?.id || 'unknown';
    } catch (error) {
      // Continue with unknown user if token extraction fails
    }
    
    // Log signout process start
    this.logger.log(interpolateMessage(LOG_MESSAGES.AUTH_SIGNOUT_STARTED, { userId }));
    
    try {
      const userClient = this.supabase.getUserClient(accessToken);
      const { error } = await userClient.auth.signOut();

      if (error) {
        this.logger.error(interpolateMessage(LOG_MESSAGES.AUTH_SIGNOUT_FAILED, { userId }), error);
        throw new BadRequestException(error.message);
      }

      // Log successful signout
      this.logger.log(interpolateMessage(LOG_MESSAGES.AUTH_SIGNOUT_SUCCESS, { userId }));

      return { message: 'Logged out successfully' };
    } catch (error) {
      this.logger.error(interpolateMessage(LOG_MESSAGES.AUTH_SIGNOUT_FAILED, { userId }), error);
      throw error;
    }
  }
} 