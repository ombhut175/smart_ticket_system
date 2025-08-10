import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { USER_ROLES, MESSAGES, TABLE_COLUMNS } from '../helpers/string-const';

/**
 * RolesGuard
 * Validates that the authenticated user has at least one of the required roles
 * defined via the @Roles() decorator. Works in conjunction with SupabaseAuthGuard
 * which fetches the complete user profile from public.users table and attaches
 * it to the request with the custom role (user/moderator/admin).
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Retrieve roles defined on route handler or controller
    const requiredRoles = this.reflector.getAllAndOverride<USER_ROLES[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    // If no roles are required, allow access
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user as Record<string, any> | undefined;

    // Ensure user object and role are present (should be set by SupabaseAuthGuard)
    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    const userRole = user[TABLE_COLUMNS.ROLE];
    if (!userRole) {
      throw new ForbiddenException('User role not found in profile');
    }

    // Grant access if user has one of the required roles
    const hasRole = requiredRoles.some((role) => userRole === role);
    if (!hasRole) {
      throw new ForbiddenException(
        `Access denied. Required roles: [${requiredRoles.join(', ')}], User role: ${userRole}`,
      );
    }

    return true;
  }
}
