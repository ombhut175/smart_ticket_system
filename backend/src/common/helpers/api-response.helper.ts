import { MESSAGES } from './string-const';

/**
 * Standardized API response interface
 * Ensures all responses follow the same structure across the application
 */
export interface ApiResponse<T = any> {
  success: boolean;
  statusCode: number;
  message: string;
  data?: T;
  timestamp: string;
  path?: string;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
  };
}

/**
 * Helper class for creating standardized API responses
 * All controllers should use these methods to ensure consistent response format
 */
export class ApiResponseHelper {
  /**
   * Creates a successful response (200 OK)
   * @param data - The response data payload
   * @param message - Optional success message, defaults to 'Success'
   * @returns Standardized success response
   */
  static success<T>(
    data?: T,
    message: string = MESSAGES.SUCCESS,
  ): ApiResponse<T> {
    return {
      success: true,
      statusCode: 200,
      message,
      data,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Creates a created response (201 Created)
   * @param data - The created resource data
   * @param message - Optional creation message, defaults to 'Created'
   * @returns Standardized creation response
   */
  static created<T>(
    data?: T,
    message: string = MESSAGES.CREATED,
  ): ApiResponse<T> {
    return {
      success: true,
      statusCode: 201,
      message,
      data,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Creates a paginated response for list endpoints
   * @param data - Array of items
   * @param total - Total number of items available
   * @param page - Current page number
   * @param limit - Items per page
   * @param message - Optional message
   * @returns Standardized paginated response
   */
  static paginated<T>(
    data: T[],
    total: number,
    page: number,
    limit: number,
    message: string = MESSAGES.SUCCESS,
  ): ApiResponse<T[]> {
    return {
      success: true,
      statusCode: 200,
      message,
      data,
      meta: { total, page, limit },
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Creates a no-content response (204 No Content)
   * Used for operations that don't return data (like logout)
   * @param message - Success message
   * @returns Standardized no-content response
   */
  static noContent(message: string): ApiResponse<null> {
    return {
      success: true,
      statusCode: 204,
      message,
      data: null,
      timestamp: new Date().toISOString(),
    };
  }
}
