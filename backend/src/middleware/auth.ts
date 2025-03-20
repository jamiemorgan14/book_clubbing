import { Request, Response, NextFunction } from 'express';
import { AuthUtils } from '../utils/auth';
import { AppError } from './errorHandler';
import { ApiErrorBuilder } from '../utils/apiResponse';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    name: string;
  };
}

export const authenticate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      throw new AppError(
        401,
        'UNAUTHORIZED',
        'No token provided'
      );
    }

    const token = authHeader.split(' ')[1];
    const decoded = AuthUtils.verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    next(new AppError(401, 'UNAUTHORIZED', 'Invalid token'));
  }
}; 