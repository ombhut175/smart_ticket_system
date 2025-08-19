import { apiRequest } from '@/helpers/request';
import { User, UpdateProfileData, UserSkill } from '@/types';

export const userService = {
  // Get current user profile
  getProfile: async (): Promise<User> => {
    return apiRequest.get<User>('/users/me');
  },

  // Update current user profile
  updateProfile: async (data: UpdateProfileData): Promise<User> => {
    return apiRequest.put<User>('/users/me', data);
  },

  // Get all moderators (admin only)
  getAllModerators: async (): Promise<(User & { skills: UserSkill[] })[]> => {
    return apiRequest.get<(User & { skills: UserSkill[] })[]>('/users/moderator');
  },

  // Get moderator by ID (admin only)
  getModerator: async (id: string): Promise<User & { skills: UserSkill[] }> => {
    return apiRequest.get<User & { skills: UserSkill[] }>(`/users/moderator/${id}`);
  },

  // Update user role (admin only)
  updateUserRole: async (userId: string, role: 'user' | 'moderator' | 'admin'): Promise<User> => {
    return apiRequest.patch<User>(`/users/${userId}/role`, { role });
  },

  // Add skill to user (admin only)
  addUserSkill: async (userId: string, skillData: { skill_name: string; proficiency_level: 'beginner' | 'intermediate' | 'advanced' | 'expert' }): Promise<UserSkill> => {
    return apiRequest.post<UserSkill>(`/users/${userId}/skills`, skillData);
  },

  // Toggle user active status (admin only)
  toggleUserActive: async (userId: string, isActive: boolean): Promise<User> => {
    return apiRequest.patch<User>(`/users/${userId}/active`, { is_active: isActive });
  },

  // Promote user to moderator (admin only)
  promoteModerator: async (email: string, skills: { skill_name: string; proficiency_level: 'beginner' | 'intermediate' | 'advanced' | 'expert' }[]): Promise<User & { skills: UserSkill[] }> => {
    return apiRequest.post<User & { skills: UserSkill[] }>('/users/moderator', { email, skills });
  },
};
