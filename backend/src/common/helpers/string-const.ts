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
  // Database Environment Variables
  DATABASE_URL = 'DATABASE_URL',
  DIRECT_URL = 'DIRECT_URL',
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
  TICKET_WITH_SUMMARY = '*, summary',
  TICKET_MODERATOR_VIEW = `
    id, title, description, status, priority, created_at, updated_at,
    summary, helpful_notes, related_skills,
    assigned_to, created_by,
    assignee:assigned_to(email),
    creator:created_by(email)
  `,
  TICKET_WITH_RELATIONS = `
    *, 
    assignee:assigned_to(email),
    creator:created_by(email)
  `,
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
  ACCESS_DENIED = 'Access denied',
  BAD_REQUEST = 'Bad request',
  INTERNAL_SERVER_ERROR = 'Internal server error',

  // User Management Messages
  USER_NOT_FOUND_BY_EMAIL = 'User with email {email} not found',
  USER_ALREADY_MODERATOR = 'User {email} is already a moderator',
  CANNOT_DEMOTE_ADMIN = 'Cannot change admin user {email} to moderator',
  USER_PROFILE_NOT_FOUND = 'User profile not found',
  USER_ACCOUNT_DEACTIVATED = 'User account is deactivated',

  // Ticket Management Messages
  TICKET_NOT_FOUND = 'Ticket not found',
  TICKET_UPDATE_FAILED = 'Ticket not found or update failed',
  TICKET_DELETE_FAILED = 'Failed to delete ticket',
  TICKET_DELETED_SUCCESS = 'Ticket deleted successfully: {id} by user: {userId}',
  ONLY_MODERATORS_CAN_UPDATE = 'Only moderators can update tickets',
  ONLY_MODERATORS_CAN_DELETE = 'Only moderators and admins can delete tickets',

  // Background Processing Messages
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
  INNGEST = 'inngest',
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

  // Authentication operation messages
  AUTH_SIGNUP_STARTED = '📝 User signup process started for email: {email}',
  AUTH_SIGNUP_SUCCESS = '✅ User signup successful for email: {email}, user ID: {userId}',
  AUTH_SIGNUP_FAILED = '❌ User signup failed for email: {email}',
  AUTH_SIGNIN_STARTED = '🔐 User signin process started for email: {email}',
  AUTH_SIGNIN_SUCCESS = '✅ User signin successful for email: {email}, user ID: {userId}',
  AUTH_SIGNIN_FAILED = '❌ User signin failed for email: {email}',
  AUTH_SIGNIN_UPDATE_USER_DATA = '🔄 Updating user record after successful signin for user: {userId}',
  AUTH_SIGNOUT_STARTED = '🚪 User signout process started for user: {userId}',
  AUTH_SIGNOUT_SUCCESS = '✅ User signout successful for user: {userId}',
  AUTH_SIGNOUT_FAILED = '❌ User signout failed for user: {userId}',

  // User operation messages
  USER_PROFILE_FETCH_STARTED = '👤 Fetching user profile for user: {userId}',
  USER_PROFILE_FETCH_SUCCESS = '✅ User profile fetched successfully for user: {userId}',
  USER_PROFILE_UPDATE_STARTED = '📝 Updating user profile for user: {userId}',
  USER_PROFILE_UPDATE_SUCCESS = '✅ User profile updated successfully for user: {userId}',
  USER_PROFILE_UPDATE_FAILED = '❌ User profile update failed for user: {userId}',
  USER_ROLE_UPDATE_STARTED = '🔧 Updating user role for user: {userId}, new role: {role}',
  USER_ROLE_UPDATE_SUCCESS = '✅ User role updated successfully for user: {userId}, new role: {role}',
  USER_TOGGLE_ACTIVE_STARTED = '🔄 Toggling user active status for user: {userId}',
  USER_TOGGLE_ACTIVE_SUCCESS = '✅ User active status toggled successfully for user: {userId}, is_active: {isActive}',
  USER_SKILL_ADD_STARTED = '🎯 Adding skill for user: {userId}, skill: {skill}',
  USER_SKILL_ADD_SUCCESS = '✅ Skill added successfully for user: {userId}, skill: {skill}',
  USER_ALL_FETCH_STARTED = '📋 Fetching all users with pagination',
  USER_ALL_FETCH_SUCCESS = '✅ All users fetched successfully, count: {count}',

  // Ticket operation messages
  TICKET_CREATE_STARTED = '🎫 Creating new ticket for user: {userId}, title: {title}',
  TICKET_CREATE_SUCCESS = '✅ Ticket created successfully with ID: {ticketId}',
  TICKET_CREATE_FAILED = '❌ Ticket creation failed for user: {userId}',
  TICKET_UPDATE_STARTED = '📝 Updating ticket: {ticketId} by user: {userId}',
  TICKET_UPDATE_SUCCESS = '✅ Ticket updated successfully: {ticketId}',
  TICKET_DELETE_STARTED = '🗑️ Deleting ticket: {ticketId} by user: {userId}',
  TICKET_DELETE_SUCCESS = '✅ Ticket deleted successfully: {ticketId}',
  TICKET_FETCH_STARTED = '📋 Fetching tickets for user: {userId}',
  TICKET_FETCH_SUCCESS = '✅ Tickets fetched successfully for user: {userId}, count: {count}',
  TICKET_FETCH_BY_ID_STARTED = '🔍 Fetching ticket by ID: {ticketId}',
  TICKET_FETCH_BY_ID_SUCCESS = '✅ Ticket fetched successfully: {ticketId}',
  TICKET_ALL_FETCH_STARTED = '📋 Fetching all tickets with filters',
  TICKET_ALL_FETCH_SUCCESS = '✅ All tickets fetched successfully, count: {count}',

  // Assignment operation messages
  ASSIGNMENT_AUTO_STARTED = '🤖 Auto-assignment process started for ticket: {ticketId}',
  ASSIGNMENT_AUTO_SUCCESS = '✅ Auto-assignment successful for ticket: {ticketId}, assigned to: {assigneeId}',
  ASSIGNMENT_AUTO_FAILED = '❌ Auto-assignment failed for ticket: {ticketId}',
  ASSIGNMENT_MANUAL_STARTED = '👤 Manual assignment started for ticket: {ticketId} to user: {assigneeId}',
  ASSIGNMENT_MANUAL_SUCCESS = '✅ Manual assignment successful for ticket: {ticketId} to user: {assigneeId}',

  // AI operation messages
  AI_ANALYSIS_STARTED = '🧠 AI analysis started for ticket: {ticketId}',
  AI_ANALYSIS_SUCCESS = '✅ AI analysis completed for ticket: {ticketId}, priority: {priority}, tags: {tags}',
  AI_ANALYSIS_FAILED = '❌ AI analysis failed for ticket: {ticketId}',
  AI_SERVICE_DISABLED = '⚠️ AI service disabled due to missing API key',

  // Email operation messages
  EMAIL_SEND_STARTED = '📧 Sending email notification to: {email} for ticket: {ticketId}',
  EMAIL_SENT_SUCCESS = '✅ Email notification sent successfully to: {email} for ticket: {ticketId}',
  EMAIL_SEND_FAILED = '❌ Email notification failed to send to: {email}',

  // Controller endpoint messages
  ENDPOINT_ACCESSED = '🌐 {method} {endpoint} accessed by user: {userId}',
  ENDPOINT_COMPLETED = '✅ {method} {endpoint} completed successfully for user: {userId}',
  ENDPOINT_FAILED = '❌ {method} {endpoint} failed for user: {userId}',

  // Database operation messages
  DB_QUERY_STARTED = '🗄️ Database query started: {operation} on table: {table}',
  DB_QUERY_SUCCESS = '✅ Database query successful: {operation} on table: {table}',
  DB_QUERY_FAILED = '❌ Database query failed: {operation} on table: {table}',

  // Background job messages
  BACKGROUND_JOB_STARTED = '⚙️ Background job started: {jobName}',
  BACKGROUND_JOB_SUCCESS = '✅ Background job completed: {jobName}',
  BACKGROUND_JOB_FAILED = '❌ Background job failed: {jobName}',

  // Validation and security messages
  VALIDATION_FAILED = '⚠️ Input validation failed for {operation}',
  UNAUTHORIZED_ACCESS = '🚫 Unauthorized access attempt to {endpoint} by user: {userId}',
  FORBIDDEN_ACCESS = '🚫 Forbidden access attempt to {endpoint} by user: {userId}',
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
export function interpolateMessage(
  template: string,
  variables: Record<string, string>,
): string {
  return template.replace(
    /\{(\w+)\}/g,
    (match, key) => variables[key] || match,
  );
}

export enum TICKET_DEFAULTS {
  PRIORITY = 'medium',
  STATUS = 'todo',
  PAGE_SIZE = 20,
}

export enum ROLE_ARRAYS {
  MODERATOR_AND_ADMIN = 'moderator,admin',
  ALL_ROLES = 'user,moderator,admin',
}

/**
 * Helper function to get role array for authorization checks
 */
export function getModeratorAndAdminRoles(): string[] {
  return [USER_ROLES.MODERATOR, USER_ROLES.ADMIN];
}

/**
 * Helper function to get all user roles
 */
export function getAllUserRoles(): string[] {
  return [USER_ROLES.USER, USER_ROLES.MODERATOR, USER_ROLES.ADMIN];
}
