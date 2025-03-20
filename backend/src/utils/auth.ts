import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import { User } from '../types/api';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = (process.env.JWT_EXPIRES_IN || '24h') as jwt.SignOptions['expiresIn'];

export class AuthUtils {
  static async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  }

  static async comparePasswords(
    password: string,
    hashedPassword: string
  ): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  static generateToken(user: Pick<User, 'id' | 'email' | 'name'>): string {
    const payload = {
      id: user.id,
      email: user.email,
      name: user.name,
    };

    const options: SignOptions = {
      expiresIn: JWT_EXPIRES_IN,
    };

    return jwt.sign(payload, JWT_SECRET as jwt.Secret, options);
  }

  static verifyToken(token: string): any {
    try {
      return jwt.verify(token, JWT_SECRET as jwt.Secret);
    } catch (error) {
      throw new Error('Invalid token');
    }
  }
} 