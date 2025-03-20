import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { SignOptions } from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = '24h';

interface JWTPayload {
  id: number;
  email: string;
  name: string;
}

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

  static generateToken(payload: JWTPayload): string {
    const options: SignOptions = {
      expiresIn: JWT_EXPIRES_IN
    };
    return jwt.sign(payload, JWT_SECRET as jwt.Secret, options);
  }

  static verifyToken(token: string): JWTPayload {
    return jwt.verify(token, JWT_SECRET as jwt.Secret) as JWTPayload;
  }
} 