import pool from '../config/database';
import { User, RegisterRequest } from '../types/api';
import { AuthUtils } from '../utils/auth';
import { AppError } from '../utils/errors';

export class UserService {
  static async createUser(data: RegisterRequest): Promise<User> {
    const { name, email, password } = data;

    // Check if user already exists
    const existingUser = await this.findByEmail(email);
    if (existingUser) {
      throw new AppError('User already exists', 409);
    }

    // Hash password
    const passwordHash = await AuthUtils.hashPassword(password);

    // Create user
    const result = await pool.query(
      `INSERT INTO users (name, email, password_hash)
       VALUES ($1, $2, $3)
       RETURNING id, name, email, created_at, updated_at`,
      [name, email, passwordHash]
    );

    return result.rows[0];
  }

  static async findByEmail(email: string): Promise<User | null> {
    const result = await pool.query(
      `SELECT id, name, email, password_hash, created_at, updated_at
       FROM users
       WHERE email = $1`,
      [email]
    );

    return result.rows[0] || null;
  }

  static async findById(id: number): Promise<User | null> {
    const result = await pool.query(
      `SELECT id, name, email, created_at, updated_at
       FROM users
       WHERE id = $1`,
      [id]
    );

    return result.rows[0] || null;
  }

  static async validatePassword(email: string, password: string): Promise<User | null> {
    const user = await this.findByEmail(email);
    if (!user || !user.password_hash) {
      return null;
    }

    const isValid = await AuthUtils.comparePasswords(password, user.password_hash);
    if (!isValid) {
      return null;
    }

    // Return user without password hash
    const { password_hash, ...userWithoutPassword } = user;
    return userWithoutPassword as User;
  }

  static async updateProfile(userId: number, data: { name: string }): Promise<User | null> {
    const result = await pool.query(
      `UPDATE users
       SET name = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING id, name, email, created_at, updated_at`,
      [data.name, userId]
    );

    return result.rows[0] || null;
  }

  static async updateEmail(userId: number, email: string): Promise<User | null> {
    // Check if email is already taken
    const existingUser = await this.findByEmail(email);
    if (existingUser) {
      throw new AppError('Email is already in use', 409);
    }

    const result = await pool.query(
      `UPDATE users
       SET email = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING id, name, email, created_at, updated_at`,
      [email, userId]
    );

    return result.rows[0] || null;
  }

  static async updatePassword(userId: number, newPassword: string): Promise<void> {
    const passwordHash = await AuthUtils.hashPassword(newPassword);
    
    await pool.query(
      `UPDATE users
       SET password_hash = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2`,
      [passwordHash, userId]
    );
  }

  static async getUserBookClubs(userId: number) {
    const result = await pool.query(
      `SELECT bc.*, 
              COUNT(DISTINCT bcm.user_id) as member_count,
              COUNT(DISTINCT b.id) as book_count
       FROM book_clubs bc
       JOIN book_club_members bcm ON bc.id = bcm.book_club_id
       LEFT JOIN books b ON bc.id = b.book_club_id
       WHERE bcm.user_id = $1
       GROUP BY bc.id
       ORDER BY bc.created_at DESC`,
      [userId]
    );

    return result.rows;
  }
} 