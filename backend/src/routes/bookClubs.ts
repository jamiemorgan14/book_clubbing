import { Router } from 'express';
import { BookClubService } from '../services/bookClubService';
import { authenticate } from '../middleware/auth';
import { CreateBookClubRequest, UpdateBookClubRequest } from '../types/api';
import { validateRequest } from '../middleware/validation';
import { z } from 'zod';

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
  async (req, res, next) => {
    try {
      const bookClub = await BookClubService.getBookClub(
        parseInt(req.params.id),
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
  validateRequest({ body: updateBookClubSchema }),
  async (req, res, next) => {
    try {
      const data = req.body as UpdateBookClubRequest;
      const bookClub = await BookClubService.updateBookClub(
        parseInt(req.params.id),
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
  async (req, res, next) => {
    try {
      await BookClubService.deleteBookClub(
        parseInt(req.params.id),
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
  async (req, res, next) => {
    try {
      await BookClubService.joinBookClub(
        parseInt(req.params.id),
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
  async (req, res, next) => {
    try {
      await BookClubService.leaveBookClub(
        parseInt(req.params.id),
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