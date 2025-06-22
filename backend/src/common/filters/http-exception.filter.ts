import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { MESSAGES } from '../helpers/string-const';

/**
 * Global HTTP Exception Filter
 * Catches all HTTP exceptions and formats them into standardized error responses
 * Ensures consistent error structure across the entire application
 */
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  /**
   * Catches and formats HTTP exceptions into standardized error responses
   * @param exception - The thrown HTTP exception
   * @param host - Arguments host containing request/response context
   * @description This filter intercepts all HTTP exceptions and transforms them into
   * a consistent error response format. It logs errors for debugging and ensures
   * that sensitive information is not exposed to clients while providing helpful
   * error details for development and troubleshooting.
   */
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    
    /**
     * Extract status code from exception or default to 500 Internal Server Error
     * Supabase and validation errors typically throw with appropriate status codes
     */
    const status = exception.getStatus ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    
    /**
     * Extract error message with fallback handling:
     * 1. Use exception message if available
     * 2. Extract message from nested error response objects
     * 3. Default to generic internal server error message
     */
    const exceptionResponse = exception.getResponse();
    let message = exception.message || MESSAGES.INTERNAL_SERVER_ERROR;
    
    // Handle nested error response objects (common with validation errors)
    if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
      const responseObj = exceptionResponse as any;
      message = responseObj.message || responseObj.error || message;
      
      // Handle array of validation messages
      if (Array.isArray(responseObj.message)) {
        message = responseObj.message.join(', ');
      }
    }

    /**
     * Standardized error response format matching success responses:
     * - success: false (indicates error state)
     * - statusCode: HTTP status code
     * - message: Human-readable error description
     * - timestamp: ISO timestamp for error tracking
     * - path: Request path that caused the error
     * - data: null (no data in error responses)
     */
    const errorResponse = {
      success: false,
      statusCode: status,
      message,
      data: null,
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    /**
     * Log error details for debugging and monitoring:
     * - Include request method and path
     * - Log full exception details in development
     * - Avoid logging sensitive information in production
     */
    this.logger.error(
      `HTTP ${status} Error on ${request.method} ${request.url}: ${message}`,
      process.env.NODE_ENV === 'development' ? exception.stack : ''
    );

    // Send standardized error response to client
    response.status(status).json(errorResponse);
  }
} 