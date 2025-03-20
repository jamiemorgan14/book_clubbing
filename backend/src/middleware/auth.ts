import { Request, Response, NextFunction } from 'express';
import { AuthUtils } from '../utils/auth';
import { AppError } from '../utils/errors';

declare global {
  namespace Express {
    interface Request {
      user: {
        id: number;
        email: string;
        name: string;
      };
    }
  }
}

export const authenticate = async (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      throw new AppError('No token provided', 401);
    }

    const token = authHeader.split(' ')[1];
    const decoded = AuthUtils.verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    next(new AppError('Invalid token', 401));
  }
}; 