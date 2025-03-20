import { Router } from 'express';
import { BookClubService } from '../services/bookClubService';
import { authenticate } from '../middleware/auth';
import { CreateBookClubRequest, UpdateBookClubRequest } from '../types/api';
import { validateRequest } from '../middleware/validation';
import { z } from 'zod';
import { AppError } from '../utils/errors';

const router = Router();

// Validation schemas
const createBookClubSchema = z.object({
  name: z.string()
    .min(1, 'Name is required')
    .max(100, 'Name cannot be more than 100 characters'),
  description: z.string()
    .max(500, 'Description cannot be more than 500 characters')
    .optional()
});

const bookNameMaxLength = 100;
const bookDescriptionMaxLength = 500;

const updateBookClubSchema = z.object({
  name: z.string()
    .min(1, 'Name is required')
    .max(bookNameMaxLength, `Name cannot be more than ${bookNameMaxLength} characters`)
    .optional(),
  description: z.string()
    .max(bookDescriptionMaxLength, `Description cannot be more than ${bookNameMaxLength} characters`)
    .optional()
});

// UUID validation middleware
const validateUUID = (req: any, _res: any, next: any) => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(req.params.id)) {
    throw new AppError('Invalid book club ID format', 400);
  }
  next();
};

// Create a new book club
router.post(
  '/',
  authenticate,
  validateRequest({ body: createBookClubSchema }),
  async (req, res, next) => {
    try {
      const data = req.body as CreateBookClubRequest;
      const bookClub = await BookClubService.createBookClub(req.user.id, data);
      res.status(201).json({
        success: true,
        data: bookClub
      });
    } catch (error) {
      next(error);
    }
  }
);

// Get a book club by ID
router.get(
  '/:id',
  authenticate,
  validateUUID,
  async (req, res, next) => {
    try {
      const bookClub = await BookClubService.getBookClub(
        req.params.id,
        req.user.id
      );
      res.json({
        success: true,
        data: bookClub
      });
    } catch (error) {
      next(error);
    }
  }
);

// Update a book club
router.patch(
  '/:id',
  authenticate,
  validateUUID,
  validateRequest({ body: updateBookClubSchema }),
  async (req, res, next) => {
    try {
      const data = req.body as UpdateBookClubRequest;
      const bookClub = await BookClubService.updateBookClub(
        req.params.id,
        req.user.id,
        data
      );
      res.json({
        success: true,
        data: bookClub
      });
    } catch (error) {
      next(error);
    }
  }
);

// Delete a book club
router.delete(
  '/:id',
  authenticate,
  validateUUID,
  async (req, res, next) => {
    try {
      await BookClubService.deleteBookClub(
        req.params.id,
        req.user.id
      );
      res.json({
        success: true,
        message: 'Book club deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }
);

// Join a book club
router.post(
  '/:id/join',
  authenticate,
  validateUUID,
  async (req, res, next) => {
    try {
      await BookClubService.joinBookClub(
        req.params.id,
        req.user.id
      );
      res.json({
        success: true,
        message: 'Successfully joined book club'
      });
    } catch (error) {
      next(error);
    }
  }
);

// Leave a book club
router.post(
  '/:id/leave',
  authenticate,
  validateUUID,
  async (req, res, next) => {
    try {
      await BookClubService.leaveBookClub(
        req.params.id,
        req.user.id
      );
      res.json({
        success: true,
        message: 'Successfully left book club'
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router; 