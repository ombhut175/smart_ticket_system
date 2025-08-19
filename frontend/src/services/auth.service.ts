import { apiRequest } from '@/helpers/request';
import { LoginData, SignupData, User } from '@/types';

export const authService = {
  // Login user
  login: async (credentials: LoginData): Promise<{ user: User; sessionInfo: any }> => {
    return apiRequest.post<{ user: User; sessionInfo: any }>('/auth/login', credentials);
  },

  // Signup user
  signup: async (userData: SignupData): Promise<{ user: User; session: any }> => {
    return apiRequest.post<{ user: User; session: any }>('/auth/signup', userData);
  },

  // Logout user
  logout: async (): Promise<void> => {
    await apiRequest.post('/auth/logout');
  },

  // Get current user (check if authenticated)
  getCurrentUser: async (): Promise<User> => {
    try {
      return await apiRequest.get<User>('/users/me');
    } catch (error: any) {
      // If it's a 401, user is not authenticated - don't throw
      if (error.statusCode === 401 || error.response?.status === 401) {
        throw new Error('Not authenticated');
      }
      // For other errors, rethrow
      throw error;
    }
  },
};
