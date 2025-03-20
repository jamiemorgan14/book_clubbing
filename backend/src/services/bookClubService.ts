import pool from '../config/database';
import { BookClub, CreateBookClubRequest, UpdateBookClubRequest, BookClubWithMembers } from '../types/api';
import { AppError } from '../utils/errors';

export class BookClubService {
  static async createBookClub(userId: number, data: CreateBookClubRequest): Promise<BookClub> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Create the book club
      const result = await client.query(
        `INSERT INTO book_clubs (name, description, created_by)
         VALUES ($1, $2, $3)
         RETURNING *`,
        [data.name, data.description, userId]
      );

      const bookClub = result.rows[0];

      // Add creator as admin
      await client.query(
        `INSERT INTO book_club_members (user_id, book_club_id, role)
         VALUES ($1, $2, 'admin')`,
        [userId, bookClub.id]
      );

      await client.query('COMMIT');
      return bookClub;
    } catch (error) {
      await client.query('ROLLBACK');
      throw new AppError('Failed to create book club', 500);
    } finally {
      client.release();
    }
  }

  static async getBookClub(id: number, userId: number): Promise<BookClubWithMembers> {
    try {
      // First check if user is a member
      const memberCheck = await pool.query(
        `SELECT 1 FROM book_club_members 
         WHERE book_club_id = $1 AND user_id = $2`,
        [id, userId]
      );

      if (memberCheck.rows.length === 0) {
        throw new AppError('Not authorized to access this book club', 403);
      }

      const result = await pool.query(
        `SELECT bc.*, 
                COUNT(DISTINCT bcm.user_id) as member_count,
                EXISTS(SELECT 1 FROM book_club_members WHERE user_id = $2 AND book_club_id = bc.id) as is_member
         FROM book_clubs bc
         LEFT JOIN book_club_members bcm ON bc.id = bcm.book_club_id
         WHERE bc.id = $1
         GROUP BY bc.id`,
        [id, userId]
      );

      if (result.rows.length === 0) {
        throw new AppError('Book club not found', 404);
      }

      const bookClub = result.rows[0];

      // Get members
      const membersResult = await pool.query(
        `SELECT bcm.user_id, bcm.role, bcm.joined_at,
                u.name, u.email
         FROM book_club_members bcm
         JOIN users u ON bcm.user_id = u.id
         WHERE bcm.book_club_id = $1
         ORDER BY bcm.joined_at ASC`,
        [id]
      );

      return {
        ...bookClub,
        members: membersResult.rows
      };
    } catch (error: any) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed to get book club', 500);
    }
  }

  static async updateBookClub(id: number, userId: number, data: UpdateBookClubRequest): Promise<BookClub> {
    // First check if user is a member
    const memberCheck = await pool.query(
      `SELECT 1 FROM book_club_members 
       WHERE book_club_id = $1 AND user_id = $2`,
      [id, userId]
    );

    if (memberCheck.rows.length === 0) {
      throw new AppError('Not authorized to access this book club', 403);
    }

    // Then check if user is admin
    const memberResult = await pool.query(
      `SELECT role FROM book_club_members 
       WHERE book_club_id = $1 AND user_id = $2`,
      [id, userId]
    );

    if (memberResult.rows[0].role !== 'admin') {
      throw new AppError('Unauthorized to update book club', 403);
    }

    const result = await pool.query(
      `UPDATE book_clubs 
       SET name = COALESCE($1, name),
           description = COALESCE($2, description),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $3
       RETURNING *`,
      [data.name, data.description, id]
    );

    if (result.rows.length === 0) {
      throw new AppError('Book club not found', 404);
    }

    return result.rows[0];
  }

  static async deleteBookClub(id: number, userId: number): Promise<void> {
    // First check if user is a member
    const memberCheck = await pool.query(
      `SELECT 1 FROM book_club_members 
       WHERE book_club_id = $1 AND user_id = $2`,
      [id, userId]
    );

    if (memberCheck.rows.length === 0) {
      throw new AppError('Not authorized to access this book club', 403);
    }

    // Then check if user is admin
    const memberResult = await pool.query(
      `SELECT role FROM book_club_members 
       WHERE book_club_id = $1 AND user_id = $2`,
      [id, userId]
    );

    if (memberResult.rows[0].role !== 'admin') {
      throw new AppError('Unauthorized to delete book club', 403);
    }

    const result = await pool.query(
      'DELETE FROM book_clubs WHERE id = $1',
      [id]
    );

    if (result.rowCount === 0) {
      throw new AppError('Book club not found', 404);
    }
  }

  static async joinBookClub(id: number, userId: number): Promise<void> {
    // Check if already a member
    const existingMember = await pool.query(
      `SELECT 1 FROM book_club_members 
       WHERE book_club_id = $1 AND user_id = $2`,
      [id, userId]
    );

    if (existingMember.rows.length > 0) {
      throw new AppError('Already a member of this book club', 400);
    }

    // Add as member
    await pool.query(
      `INSERT INTO book_club_members (user_id, book_club_id, role)
       VALUES ($1, $2, 'member')`,
      [userId, id]
    );
  }

  static async leaveBookClub(id: number, userId: number): Promise<void> {
    // Check if user is a member
    const memberResult = await pool.query(
      `SELECT role FROM book_club_members 
       WHERE book_club_id = $1 AND user_id = $2`,
      [id, userId]
    );

    if (memberResult.rows.length === 0) {
      throw new AppError('Not a member of this book club', 403);
    }

    if (memberResult.rows[0].role === 'admin') {
      const adminCount = await pool.query(
        `SELECT COUNT(*) FROM book_club_members 
         WHERE book_club_id = $1 AND role = 'admin'`,
        [id]
      );

      if (parseInt(adminCount.rows[0].count) <= 1) {
        throw new AppError('Cannot leave as the last admin', 400);
      }
    }

    await pool.query(
      `DELETE FROM book_club_members 
       WHERE book_club_id = $1 AND user_id = $2`,
      [id, userId]
    );
  }

  static async listUserBookClubs(userId: number): Promise<BookClub[]> {
    try {
      const result = await pool.query(
        `SELECT bc.*, 
                COUNT(DISTINCT bcm.user_id) as member_count,
                bcm.role as user_role,
                EXISTS(SELECT 1 FROM book_club_members WHERE user_id = $1 AND book_club_id = bc.id) as is_member
         FROM book_clubs bc
         JOIN book_club_members bcm ON bc.id = bcm.book_club_id
         WHERE bcm.user_id = $1
         GROUP BY bc.id, bcm.role
         ORDER BY bc.created_at DESC`,
        [userId]
      );

      return result.rows;
    } catch (error) {
      throw new AppError('Failed to list book clubs', 500);
    }
  }

  static async listBookClubMembers(id: number, userId: number): Promise<any[]> {
    // First check if user is a member
    const memberCheck = await pool.query(
      `SELECT 1 FROM book_club_members 
       WHERE book_club_id = $1 AND user_id = $2`,
      [id, userId]
    );

    if (memberCheck.rows.length === 0) {
      throw new AppError('Not authorized to access this book club', 403);
    }

    const result = await pool.query(
      `SELECT bcm.user_id, bcm.role, bcm.joined_at,
              u.name, u.email
       FROM book_club_members bcm
       JOIN users u ON bcm.user_id = u.id
       WHERE bcm.book_club_id = $1
       ORDER BY bcm.joined_at ASC`,
      [id]
    );

    return result.rows;
  }

  static async updateMemberRole(
    bookClubId: number,
    targetUserId: number,
    userId: number,
    newRole: 'admin' | 'member'
  ): Promise<void> {
    // Check if the requesting user is an admin
    const adminCheck = await pool.query(
      `SELECT 1 FROM book_club_members 
       WHERE book_club_id = $1 AND user_id = $2 AND role = 'admin'`,
      [bookClubId, userId]
    );

    if (adminCheck.rows.length === 0) {
      throw new AppError('Not authorized to update member roles', 403);
    }

    // Check if target user is a member
    const memberCheck = await pool.query(
      `SELECT role FROM book_club_members 
       WHERE book_club_id = $1 AND user_id = $2`,
      [bookClubId, targetUserId]
    );

    if (memberCheck.rows.length === 0) {
      throw new AppError('Target user is not a member of this book club', 404);
    }

    // If demoting from admin, check if they're not the last admin
    if (memberCheck.rows[0].role === 'admin' && newRole === 'member') {
      const adminCount = await pool.query(
        `SELECT COUNT(*) FROM book_club_members 
         WHERE book_club_id = $1 AND role = 'admin'`,
        [bookClubId]
      );

      if (parseInt(adminCount.rows[0].count) <= 1) {
        throw new AppError('Cannot demote the last admin', 400);
      }
    }

    // Update the role
    await pool.query(
      `UPDATE book_club_members 
       SET role = $1
       WHERE book_club_id = $2 AND user_id = $3`,
      [newRole, bookClubId, targetUserId]
    );
  }
}