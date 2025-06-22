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
  DONE = 'done',
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