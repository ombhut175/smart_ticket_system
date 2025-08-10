import { Response } from 'express';
import { COOKIES, COOKIE_CONFIG } from './string-const';

/**
 * Helper class for cookie operations
 * Centralizes cookie management to follow DRY principles and ensure consistency
 */
export class CookieHelper {
  /**
   * Sets the Supabase authentication token as an HTTP-only cookie
   * @param res - Express response object
   * @param token - The Supabase access token to store
   * @description This method stores the authentication token securely in an HTTP-only cookie
   * The cookie is configured with SameSite=Lax for CSRF protection and has a 7-day expiration
   */
  static setAuthToken(res: Response, token: string): void {
    res.cookie(COOKIES.SUPABASE_TOKEN, token, {
      httpOnly: true, // Prevents XSS attacks by making cookie inaccessible to JavaScript
      sameSite: 'lax', // CSRF protection while allowing navigation from external sites
      maxAge: COOKIE_CONFIG.MAX_AGE_MS, // 7 days expiration
      secure: process.env.NODE_ENV === 'production', // HTTPS only in production
    });
  }

  /**
   * Clears the Supabase authentication token cookie
   * @param res - Express response object
   * @description Removes the authentication token cookie from the client browser
   * This is called during logout to ensure the token is completely removed
   */
  static clearAuthToken(res: Response): void {
    res.clearCookie(COOKIES.SUPABASE_TOKEN);
  }

  /**
   * Extracts the authentication token from request cookies
   * @param cookies - Request cookies object
   * @returns The authentication token or undefined if not present
   * @description Safely extracts the Supabase token from incoming request cookies
   */
  static getAuthToken(cookies: any): string | undefined {
    return cookies?.[COOKIES.SUPABASE_TOKEN];
  }
}
