export enum ENV {
  SUPABASE_URL = 'SUPABASE_URL',
  SUPABASE_ANON_KEY = 'SUPABASE_ANON_KEY',
  SUPABASE_SERVICE_ROLE_KEY = 'SUPABASE_SERVICE_ROLE_KEY',
  PORT = 'PORT',
  NODE_ENV = 'NODE_ENV',
  // Inngest Environment Variables
  INNGEST_EVENT_KEY = 'INNGEST_EVENT_KEY',
  INNGEST_SIGNING_KEY = 'INNGEST_SIGNING_KEY',
  // AI Environment Variables
  GEMINI_API_KEY = 'GEMINI_API_KEY',
  // SMTP Environment Variables
  SMTP_HOST = 'MAILTRAP_SMTP_HOST',
  SMTP_PORT = 'MAILTRAP_SMTP_PORT',
  SMTP_USER = 'MAILTRAP_SMTP_USER',
  SMTP_PASS = 'MAILTRAP_SMTP_PASS',
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
  SKILLS = 'skills',
  
  // Tickets table columns
  TITLE = 'title',
  DESCRIPTION = 'description',
  STATUS = 'status',
  PRIORITY = 'priority',
  CREATED_BY = 'created_by',
  ASSIGNED_TO = 'assigned_to',
  SUMMARY = 'summary',
  HELPFUL_NOTES = 'helpful_notes',
  RELATED_SKILLS = 'related_skills',
  CREATED_AT = 'created_at',
  UPDATED_AT = 'updated_at',
}

export enum QUERY_SELECTORS {
  ALL_FIELDS = '*',
  USERS_WITH_SKILLS = '*, user_skills(*)',
  TICKET_BASIC_INFO = 'id, email',
  TICKET_ASSIGNMENT_INFO = 'id, title, description, status, priority, created_by, assigned_to',
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
  
  // Background Processing Messages
  TICKET_NOT_FOUND = 'Ticket not found',
  EMAIL_SENT_SUCCESS = 'Email sent to {email} for ticket {ticketId}',
  EMAIL_SEND_FAILED = 'Failed to send email',
  AI_ANALYSIS_FAILED = 'AI analysis failed',
  AI_PARSE_FAILED = 'Failed to parse JSON from AI response',
  ASSIGNMENT_FAILED = 'Assignment failed',
  WORKFLOW_ERROR = 'Error in ticket processing workflow',
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
  INNGEST = 'api/inngest',
}

export enum SWAGGER_TAGS {
  AUTHENTICATION = 'Authentication',
  USERS = 'Users',
  TICKETS = 'Tickets',
  SKILLS = 'Skills',
}

export enum INNGEST_CONFIG {
  CLIENT_ID = 'smart-ticket-system',
  WORKFLOW_ID = 'on-ticket-created',
  RETRIES = 2,
}

export enum INNGEST_EVENTS {
  TICKET_CREATED = 'ticket/created',
}

export enum INNGEST_STEPS {
  FETCH_TICKET = 'fetch-ticket',
  UPDATE_TICKET_STATUS = 'update-ticket-status',
  AI_PROCESSING = 'ai-processing',
  ASSIGN_MODERATOR = 'assign-moderator',
  SEND_EMAIL_NOTIFICATION = 'send-email-notification',
}

export enum AI_CONFIG {
  MODEL = 'gemini-1.5-flash',
}

export enum EMAIL_CONFIG {
  DEFAULT_PORT = 587,
  SUBJECT_TICKET_ASSIGNED = 'Ticket Assigned',
}

export enum APP_CONFIG {
  GLOBAL_PREFIX = 'api',
  DEFAULT_PORT = 3000,
  SWAGGER_PATH = 'api/docs',
  API_VERSION = '1.0',
  API_TITLE = 'Smart Ticket System API',
  API_DESCRIPTION = 'API documentation for the Smart Ticket System',
  COOKIE_AUTH_NAME = 'supabaseToken',
}

export enum LOG_MESSAGES {
  // Server startup messages
  SERVER_STARTED = '🚀 Smart Ticket System Backend Server Started',
  SERVER_RUNNING = '🌐 Backend Server running at: {url}',
  SWAGGER_AVAILABLE = '📚 API Documentation (Swagger) available at: {url}',
  CORS_ENABLED = '🔓 CORS enabled with credentials support',
  GLOBAL_PREFIX_SET = '🔗 Global API prefix set to: /{prefix}',
  VALIDATION_ENABLED = '✅ Global validation pipe enabled',
  EXCEPTION_FILTER_ENABLED = '🛡️ Global exception filter enabled for standardized responses',
  COOKIE_PARSER_ENABLED = '🍪 Cookie parser middleware enabled',
  
  // Environment messages
  ENVIRONMENT_MODE = '🏗️ Running in {mode} mode',
  PORT_CONFIG = '⚙️ Port configuration: {port}',
  
  // Startup summary
  STARTUP_COMPLETE = '✨ Application startup completed successfully',
  READY_FOR_REQUESTS = '🎯 Ready to handle incoming requests',
}

export enum URL_PATTERNS {
  LOCALHOST_HTTP = 'http://localhost:{port}',
  LOCALHOST_HTTPS = 'https://localhost:{port}',
  PRODUCTION_BASE = 'https://your-domain.com', // Update with actual production domain
}

export enum HOSTING_INFO {
  LOCAL_DEVELOPMENT = 'Local Development Server',
  PRODUCTION_PLATFORM = 'Production Environment', // Update with actual hosting platform (e.g., Heroku, AWS, etc.)
  STAGING_PLATFORM = 'Staging Environment',
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