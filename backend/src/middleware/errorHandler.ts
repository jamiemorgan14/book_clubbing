import { Request, Response, NextFunction } from 'express';
import { ApiResponseBuilder, ApiErrorBuilder } from '../utils/apiResponse';

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
    public details?: Record<string, any>
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('Error:', err);

  if (err instanceof AppError) {
    return res.status(err.statusCode).json(
      ApiResponseBuilder.error({
        code: err.code,
        message: err.message,
        details: err.details,
      })
    );
  }

  // Handle validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json(
      ApiResponseBuilder.error(
        ApiErrorBuilder.badRequest('Validation Error', {
          errors: err.message,
        })
      )
    );
  }

  // Handle database errors
  if (err.name === 'PostgresError') {
    return res.status(500).json(
      ApiResponseBuilder.error(
        ApiErrorBuilder.internal('Database Error')
      )
    );
  }

  // Default error
  return res.status(500).json(
    ApiResponseBuilder.error(
      ApiErrorBuilder.internal('An unexpected error occurred')
    )
  );
}; 