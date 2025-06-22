import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { SupabaseService } from '../../core/database/supabase.client';
import { MESSAGES, COOKIES } from '../../string-const';
import { CookieHelper } from '../helpers/cookie.helper';

/**
 * Supabase Authentication Guard
 * Protects routes by validating JWT tokens from cookies or Authorization headers
 * Integrates with Supabase Auth to verify token validity and extract user information
 */
@Injectable()
export class SupabaseAuthGuard implements CanActivate {
  constructor(private readonly supabase: SupabaseService) {}

  /**
   * Validates authentication token and attaches user to request
   * @param context - Execution context containing request information
   * @returns Promise<boolean> - True if authentication successful, throws exception otherwise
   * @description This guard performs the following authentication steps:
   * 1. Extracts JWT token from HTTP-only cookie or Authorization header
   * 2. Validates token with Supabase Auth service using getUser() API
   * 3. Attaches authenticated user object to request for downstream use
   * 4. Throws UnauthorizedException if token is missing, invalid, or expired
   */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    
    /**
     * Token extraction priority:
     * 1. HTTP-only cookie (preferred for web applications)
     * 2. Authorization header Bearer token (for API clients)
     * 
     * Cookie approach is more secure as it prevents XSS token theft
     * Header approach allows API clients and mobile apps to authenticate
     */
    const token = CookieHelper.getAuthToken(request.cookies) || 
                  request.headers['authorization']?.toString().replace('Bearer ', '');

    if (!token) {
      throw new UnauthorizedException(MESSAGES.MISSING_AUTH_TOKEN);
    }

    /**
     * Token validation with Supabase:
     * - Uses service client to verify JWT signature and expiration
     * - Returns user object if token is valid and active
     * - Fails if token is expired, revoked, or malformed
     */
    const { data, error } = await this.supabase.getClient().auth.getUser(token);

    if (error || !data.user) {
      throw new UnauthorizedException(MESSAGES.INVALID_OR_EXPIRED_TOKEN);
    }

    /**
     * Attach user to request object:
     * - Makes user data available to controllers and services
     * - Includes user ID, email, metadata, and role information
     * - Used by role guards and business logic for authorization
     */
    (request as any).user = data.user;
    
    return true;
  }
} 