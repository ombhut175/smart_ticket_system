export type UserRole = "User" | "Moderator" | "Admin";

export interface User {
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
} 