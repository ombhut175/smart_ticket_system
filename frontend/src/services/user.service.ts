import { apiRequest } from '@/lib/api';
import { User, UpdateProfileData, UserSkill } from '@/types';

export const userService = {
  // Get current user profile
  getProfile: async (): Promise<User> => {
    const response = await apiRequest.get<User>('/users/me');
    return response.data;
  },

  // Update current user profile
  updateProfile: async (data: UpdateProfileData): Promise<User> => {
    const response = await apiRequest.put<User>('/users/me', data);
    return response.data;
  },

  // Get all moderators (admin only)
  getAllModerators: async (): Promise<(User & { skills: UserSkill[] })[]> => {
    const response = await apiRequest.get<(User & { skills: UserSkill[] })[]>('/users/moderator');
    return response.data;
  },

  // Get moderator by ID (admin only)
  getModerator: async (id: string): Promise<User & { skills: UserSkill[] }> => {
    const response = await apiRequest.get<User & { skills: UserSkill[] }>(`/users/moderator/${id}`);
    return response.data;
  },

  // Update user role (admin only)
  updateUserRole: async (userId: string, role: 'user' | 'moderator' | 'admin'): Promise<User> => {
    const response = await apiRequest.patch<User>(`/users/${userId}/role`, { role });
    return response.data;
  },

  // Add skill to user (admin only)
  addUserSkill: async (userId: string, skillData: { skill_name: string; proficiency_level: 'beginner' | 'intermediate' | 'advanced' | 'expert' }): Promise<UserSkill> => {
    const response = await apiRequest.post<UserSkill>(`/users/${userId}/skills`, skillData);
    return response.data;
  },

  // Toggle user active status (admin only)
  toggleUserActive: async (userId: string, isActive: boolean): Promise<User> => {
    const response = await apiRequest.patch<User>(`/users/${userId}/active`, { is_active: isActive });
    return response.data;
  },

  // Promote user to moderator (admin only)
  promoteModerator: async (email: string, skills: { skill_name: string; proficiency_level: 'beginner' | 'intermediate' | 'advanced' | 'expert' }[]): Promise<User & { skills: UserSkill[] }> => {
    const response = await apiRequest.post<User & { skills: UserSkill[] }>('/users/moderator', { email, skills });
    return response.data;
  },
};
