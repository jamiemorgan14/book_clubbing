import pool from '../config/database';
import { User, RegisterRequest } from '../types/api';
import { AuthUtils } from '../utils/auth';
import { AppError } from '../middleware/errorHandler';

export class UserService {
  static async createUser(data: RegisterRequest): Promise<User> {
    const { email, password, name } = data;
    
    // Check if user already exists
    const existingUser = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      throw new AppError(
        409,
        'CONFLICT',
        'User with this email already exists'
      );
    }

    // Hash password
    const hashedPassword = await AuthUtils.hashPassword(password);

    // Create user
    const result = await pool.query(
      `INSERT INTO users (email, password_hash, name)
       VALUES ($1, $2, $3)
       RETURNING id, email, name, created_at, updated_at`,
      [email, hashedPassword, name]
    );

    return result.rows[0];
  }

  static async findByEmail(email: string): Promise<User | null> {
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    return result.rows[0] || null;
  }

  static async validatePassword(
    email: string,
    password: string
  ): Promise<User | null> {
    const user = await this.findByEmail(email);
    if (!user) return null;

    const isValid = await AuthUtils.comparePasswords(
      password,
      user.password_hash
    );

    return isValid ? user : null;
  }
} 