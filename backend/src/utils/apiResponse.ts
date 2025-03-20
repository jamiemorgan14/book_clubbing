import { ApiResponse, ApiError, PaginatedResponse } from '../types/api';

export class ApiResponseBuilder {
  static success<T>(data: T): ApiResponse<T> {
    return {
      success: true,
      data,
    };
  }

  static error(error: ApiError): ApiResponse<never> {
    return {
      success: false,
      error,
    };
  }

  static paginated<T>(
    data: T[],
    page: number,
    limit: number,
    total: number
  ): PaginatedResponse<T[]> {
    return {
      success: true,
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}

export class ApiErrorBuilder {
  static badRequest(message: string, details?: Record<string, any>): ApiError {
    return {
      code: 'BAD_REQUEST',
      message,
      details,
    };
  }

  static unauthorized(message: string = 'Unauthorized'): ApiError {
    return {
      code: 'UNAUTHORIZED',
      message,
    };
  }

  static forbidden(message: string = 'Forbidden'): ApiError {
    return {
      code: 'FORBIDDEN',
      message,
    };
  }

  static notFound(message: string = 'Resource not found'): ApiError {
    return {
      code: 'NOT_FOUND',
      message,
    };
  }

  static conflict(message: string, details?: Record<string, any>): ApiError {
    return {
      code: 'CONFLICT',
      message,
      details,
    };
  }

  static internal(message: string = 'Internal server error'): ApiError {
    return {
      code: 'INTERNAL_ERROR',
      message,
    };
  }
} 