import axios from "axios";
import { API_URL_PREFIX } from "@/constants/string-const";
import { getApiBaseURL } from "@/lib/config/env";

export const apiClient = axios.create({
  baseURL: getApiBaseURL(API_URL_PREFIX),
  withCredentials: true,
});

// Add request interceptor for debugging
apiClient.interceptors.request.use(
  (config) => {
    // Ensure headers object exists
    config.headers = config.headers || {};
    
    // Let axios set the Content-Type header automatically for FormData
    if (!(config.data instanceof FormData)) {
      config.headers["Content-Type"] = "application/json";
    }
    
    console.log("API Request:", {
      url: config.url,
      method: config.method,
      data: config.data,
      headers: config.headers
    });
    return config;
  },
  (error) => {
    console.error("Request error:", error);
    return Promise.reject(error);
  }
);

// Add response interceptor for logging while preserving original error shape
apiClient.interceptors.response.use(
  (response) => {
    console.log("API Response:", {
      status: response.status,
      statusText: response.statusText,
      data: response.data
    });
    return response;
  },
  (error: any) => {
    // Log and pass through so downstream interceptors/handlers can decide
    if (error.response) {
      console.error("API Error Response:", error.response.status, error.response.data);
    } else if (error.request) {
      console.error("API Error No Response:", error.message);
    } else {
      console.error("API Error Setup:", error.message);
    }
    return Promise.reject(error);
  }
);