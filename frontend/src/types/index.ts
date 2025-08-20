export type UserRole = "user" | "moderator" | "admin";

export interface User {
  id: string;
  email: string;
  role: UserRole;
  first_name?: string;
  last_name?: string;
  is_active: boolean;
  is_email_verified: boolean;
  is_profile_completed: boolean;
  last_login_at?: string;
  created_at: string;
  updated_at: string;
  avatar?: string;
  name?: string;
  // Additional properties used in components
  phone?: string;
  country?: string;
  city?: string;
  bio?: string;
  status?: string;
  totalTickets?: number;
  resolvedTickets?: number;
  username?: string;
  alternativeEmail?: string;
  emailVerifiedAt?: string;
  // Backward compatibility properties
  createdAt?: string;
  updatedAt?: string;
  lastLoginAt?: string;
  emailVerified?: boolean;
}

export interface UserSkill {
  id: string;
  user_id: string;
  skill_name: string;
  proficiency_level: "beginner" | "intermediate" | "advanced" | "expert";
  created_at: string;
}

export interface Ticket {
  id: string;
  title: string;
  description: string;
  status: "todo" | "in_progress" | "waiting_for_customer" | "resolved" | "closed" | "cancelled";
  priority: "low" | "medium" | "high" | "urgent";
  created_by: string;
  assigned_to?: string;
  summary?: string;
  helpful_notes?: string;
  related_skills?: string[];
  created_at: string;
  updated_at: string;
  assignee?: {
    email: string;
  };
  creator?: {
    email: string;
  };
}

export interface CreateTicketData {
  title: string;
  description: string;
}

export interface UpdateTicketData {
  status?: "todo" | "in_progress" | "waiting_for_customer" | "resolved" | "closed" | "cancelled";
  helpful_notes?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface SignupData {
  email: string;
  password: string;
}

export interface UpdateProfileData {
  first_name?: string;
  last_name?: string;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
}

export interface PaginatedResponse<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T[];
  meta: PaginationMeta;
  timestamp: string;
}

export interface APIResponse<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
  timestamp: string;
}

export interface APIError {
  success: false;
  statusCode: number;
  message: string;
  timestamp: string;
  path: string;
  error?: string;
}

export interface TicketQueryParams {
  page?: number;
  limit?: number;
  status?: "todo" | "in_progress" | "waiting_for_customer" | "resolved" | "closed" | "cancelled";
  priority?: "low" | "medium" | "high";
  assigned_to?: string;
}
