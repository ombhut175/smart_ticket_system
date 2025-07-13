import axios, { AxiosError, AxiosResponse } from 'axios';
import { APIError, APIResponse, PaginatedResponse } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL;

// Create axios instance
const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  withCredentials: true, // Important for cookie-based auth
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Generic API functions
export const apiRequest = {
  get: async <T>(url: string, params?: Record<string, any>): Promise<APIResponse<T>> => {
    try {
      const response = await api.get(url, { params });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  post: async <T>(url: string, data?: any): Promise<APIResponse<T>> => {
    try {
      const response = await api.post(url, data);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  put: async <T>(url: string, data?: any): Promise<APIResponse<T>> => {
    try {
      const response = await api.put(url, data);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  patch: async <T>(url: string, data?: any): Promise<APIResponse<T>> => {
    try {
      const response = await api.patch(url, data);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  delete: async <T>(url: string): Promise<APIResponse<T>> => {
    try {
      const response = await api.delete(url);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  getPaginated: async <T>(url: string, params?: Record<string, any>): Promise<PaginatedResponse<T>> => {
    try {
      const response = await api.get(url, { params });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },
};

// Error handler
function handleApiError(error: any): APIError {
  if (error.response?.data) {
    return error.response.data as APIError;
  }
  
  return {
    success: false,
    statusCode: error.response?.status || 500,
    message: error.message || 'An unexpected error occurred',
    timestamp: new Date().toISOString(),
    path: error.config?.url || '',
  };
}

export default api;
