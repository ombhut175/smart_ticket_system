import { apiRequest } from '@/lib/api';
import { LoginData, SignupData, User } from '@/types';

export const authService = {
  // Login user
  login: async (credentials: LoginData): Promise<{ user: User; sessionInfo: any }> => {
    const response = await apiRequest.post<{ user: User; sessionInfo: any }>('/auth/login', credentials);
    return response.data;
  },

  // Signup user
  signup: async (userData: SignupData): Promise<{ user: User; session: any }> => {
    const response = await apiRequest.post<{ user: User; session: any }>('/auth/signup', userData);
    return response.data;
  },

  // Logout user
  logout: async (): Promise<void> => {
    await apiRequest.post('/auth/logout');
  },

  // Get current user (check if authenticated)
  getCurrentUser: async (): Promise<User> => {
    const response = await apiRequest.get<User>('/users/me');
    return response.data;
  },
};
