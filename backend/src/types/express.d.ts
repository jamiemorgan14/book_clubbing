import { User } from './api';

declare global {
  namespace Express {
    interface Request {
      user: Pick<User, 'id' | 'email' | 'name'>;
    }
  }
} 