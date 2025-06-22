export enum ENV {
  SUPABASE_URL = 'SUPABASE_URL',
  SUPABASE_ANON_KEY = 'SUPABASE_ANON_KEY',
  SUPABASE_SERVICE_ROLE_KEY = 'SUPABASE_SERVICE_ROLE_KEY',
  PORT = 'PORT',
  NODE_ENV = 'NODE_ENV',
  // Add more environment variable keys as needed
}

export enum TABLES {
  USERS = 'users',
  TICKETS = 'tickets',
  USER_SKILLS = 'user_skills',
  TICKET_SKILLS = 'ticket_skills',
}

export enum TABLE_COLUMNS {
  // Users table columns
  ID = 'id',
  EMAIL = 'email',
  ROLE = 'role',
  FIRST_NAME = 'first_name',
  LAST_NAME = 'last_name',
  IS_ACTIVE = 'is_active',
  LAST_LOGIN_AT = 'last_login_at',
  
  // User skills table columns
  USER_ID = 'user_id',
  SKILL_NAME = 'skill_name',
  PROFICIENCY_LEVEL = 'proficiency_level',
}

export enum QUERY_SELECTORS {
  ALL_FIELDS = '*',
  USERS_WITH_SKILLS = '*, user_skills(*)',
}

export enum MESSAGES {
  // Auth Messages
  USER_SIGNED_UP_SUCCESS = 'User signed up successfully',
  USER_LOGGED_IN_SUCCESS = 'User logged in successfully',
  USER_LOGGED_OUT_SUCCESS = 'User logged out successfully',
  MISSING_AUTH_TOKEN = 'Missing authentication token',
  INVALID_OR_EXPIRED_TOKEN = 'Invalid or expired token',
  
  // General Messages
  SUCCESS = 'Success',
  CREATED = 'Created',
  UPDATED = 'Updated',
  DELETED = 'Deleted',
  NOT_FOUND = 'Resource not found',
  UNAUTHORIZED = 'Unauthorized access',
  FORBIDDEN = 'Forbidden access',
  BAD_REQUEST = 'Bad request',
  INTERNAL_SERVER_ERROR = 'Internal server error',
  
  // User Management Messages
  USER_NOT_FOUND_BY_EMAIL = 'User with email {email} not found',
  USER_ALREADY_MODERATOR = 'User {email} is already a moderator',
  CANNOT_DEMOTE_ADMIN = 'Cannot change admin user {email} to moderator',
  USER_PROFILE_NOT_FOUND = 'User profile not found',
  USER_ACCOUNT_DEACTIVATED = 'User account is deactivated',
}

export enum COOKIES {
  SUPABASE_TOKEN = 'supabaseToken',
}

export enum COOKIE_CONFIG {
  MAX_AGE_DAYS = 7,
  MAX_AGE_MS = 1000 * 60 * 60 * 24 * 7, // 7 days in milliseconds
}

export enum USER_ROLES {
  USER = 'user',
  MODERATOR = 'moderator',
  ADMIN = 'admin',
}

export enum SKILL_PROFICIENCY {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
  EXPERT = 'expert',
}

export enum SKILL_IMPORTANCE {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export enum TICKET_STATUS {
  TODO = 'todo',
  IN_PROGRESS = 'in_progress',
  WAITING_FOR_CUSTOMER = 'waiting_for_customer',
  RESOLVED = 'resolved',
  CLOSED = 'closed',
  CANCELLED = 'cancelled',
}

export enum TICKET_PRIORITY {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

export enum API_PATHS {
  AUTH = 'auth',
  USERS = 'users',
  TICKETS = 'tickets',
  SKILLS = 'skills',
}

export enum SWAGGER_TAGS {
  AUTHENTICATION = 'Authentication',
  USERS = 'Users',
  TICKETS = 'Tickets',
  SKILLS = 'Skills',
}

export type UserRole = `${USER_ROLES}`;

/**
 * Helper function to interpolate variables in message templates
 * @param template - Message template with {variable} placeholders
 * @param variables - Object with key-value pairs to replace in template
 * @returns Interpolated message string
 */
export function interpolateMessage(template: string, variables: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (match, key) => variables[key] || match);
} 