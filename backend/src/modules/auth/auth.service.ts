import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { SupabaseService } from '../../core/database/supabase.client';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(private readonly supabase: SupabaseService) {}

  async signUp(dto: SignupDto) {
    const { email, password } = dto;
    const { data, error } = await this.supabase.getClient().auth.signUp({
      email,
      password,
    });

    if (error) {
      throw new BadRequestException(error.message);
    }

    return data;
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
    const { data, error } = await this.supabase.getClient().auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
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
      await this.supabase
        .getClient()
        .from('users')
        .update({ 
          is_email_verified: true,
          last_login_at: new Date().toISOString()
        })
        .eq('id', data.user.id);
    }

    return data;
  }

  async signOut(accessToken: string) {
    const userClient = this.supabase.getUserClient(accessToken);
    const { error } = await userClient.auth.signOut();

    if (error) {
      throw new BadRequestException(error.message);
    }

    return { message: 'Logged out successfully' };
  }
} 