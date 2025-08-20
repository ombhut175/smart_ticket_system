export const API_URL_PREFIX = "api";

// HTTP Status Codes
export const HTTP_STATUS = {
	OK: 200,
	CREATED: 201,
	NO_CONTENT: 204,
	BAD_REQUEST: 400,
	UNAUTHORIZED: 401,
	FORBIDDEN: 403,
	NOT_FOUND: 404,
	CONFLICT: 409,
	UNPROCESSABLE_ENTITY: 422,
	INTERNAL_SERVER_ERROR: 500,
	BAD_GATEWAY: 502,
	SERVICE_UNAVAILABLE: 503,
} as const;

// API Messages
export const API_MESSAGES = {
	NETWORK_ERROR: 'Network error occurred. Please check your connection.',
	SERVER_ERROR: 'Server error occurred. Please try again later.',
	UNAUTHORIZED: 'You are not authorized to perform this action.',
	FORBIDDEN: 'Access denied.',
	NOT_FOUND: 'Resource not found.',
	VALIDATION_ERROR: 'Validation failed.',
	INVALID_CREDENTIALS: 'Invalid email or password.',
	SUCCESS: 'Operation completed successfully.',
} as const;


// Auth/User domain constants
export const USER_ROLES = {
	ADMIN: 'admin',
	MODERATOR: 'moderator',
	USER: 'user',
	SENIOR_MODERATOR: 'senior_moderator',
	TEAM_LEAD: 'team_lead',
} as const;

export const USER_STATUSES = {
	ACTIVE: 'active',
	INACTIVE: 'inactive',
	PENDING: 'pending',
} as const;

// Tickets domain constants
export const TICKET_STATUS = {
	OPEN: 'open',
	PENDING: 'pending',
	IN_PROGRESS: 'in_progress',
	RESOLVED: 'resolved',
	CLOSED: 'closed',
} as const;

export const TICKET_PRIORITY = {
	CRITICAL: 'critical',
	HIGH: 'high',
	MEDIUM: 'medium',
	LOW: 'low',
} as const;

export const TICKET_CATEGORIES = {
	TECHNICAL: 'technical',
	BILLING: 'billing',
	FEATURE: 'feature',
	BUG: 'bug',
	ACCOUNT: 'account',
	OTHER: 'other',
} as const;

// Organization/People domain
export const DEPARTMENTS = {
	SUPPORT: 'support',
	TECHNICAL: 'technical',
	BILLING: 'billing',
	PRODUCT: 'product',
	MARKETING: 'marketing',
	OTHER: 'other',
} as const;


