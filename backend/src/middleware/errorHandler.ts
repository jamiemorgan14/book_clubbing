import { Request, Response, NextFunction } from 'express';
import { ApiResponseBuilder } from '../utils/apiResponse';
import { AppError } from '../utils/errors';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('Error:', err);

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      error: {
        message: err.message,
        code: err.code
      }
    });
  }

  // Handle database errors
  if (err.name === 'PostgresError' || (err as any).code?.startsWith('22')) {
    return res.status(400).json({
      success: false,
      error: {
        message: 'Invalid input format',
        code: 'INVALID_INPUT'
      }
    });
  }

  // Default error
  return res.status(500).json({
    success: false,
    error: {
      message: 'An unexpected error occurred',
      code: 'INTERNAL_SERVER_ERROR'
    }
  });
}; 