import express from 'express';
import { authenticate } from '../middleware/auth';
import { UserService } from '../services/userService';
import { AppError } from '../utils/errors';
import { sendResponse } from '../utils/response';

const router = express.Router();

// Get user profile
router.get('/profile', authenticate, async (req, res, next) => {
  try {
    const user = await UserService.findById(req.user.id);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    sendResponse(res, {
      success: true,
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          createdAt: user.created_at,
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

// Update user profile
router.patch('/profile', authenticate, async (req, res, next) => {
  try {
    const { name } = req.body;
    if (!name) {
      throw new AppError('Name is required', 400);
    }

    const user = await UserService.updateProfile(req.user.id, { name });
    if (!user) {
      throw new AppError('User not found', 404);
    }

    sendResponse(res, {
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          createdAt: user.created_at,
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

// Update email
router.patch('/email', authenticate, async (req, res, next) => {
  try {
    const { email, currentPassword } = req.body;
    if (!email || !currentPassword) {
      throw new AppError('Email and current password are required', 400);
    }

    // Validate current password
    const isValid = await UserService.validatePassword(req.user.email, currentPassword);
    if (!isValid) {
      throw new AppError('Current password is incorrect', 401);
    }

    const user = await UserService.updateEmail(req.user.id, email);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    sendResponse(res, {
      success: true,
      message: 'Email updated successfully',
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          createdAt: user.created_at,
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

// Change password
router.patch('/password', authenticate, async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      throw new AppError('Current password and new password are required', 400);
    }

    // Validate current password
    const isValid = await UserService.validatePassword(req.user.email, currentPassword);
    if (!isValid) {
      throw new AppError('Current password is incorrect', 401);
    }

    await UserService.updatePassword(req.user.id, newPassword);

    sendResponse(res, {
      success: true,
      message: 'Password updated successfully',
    });
  } catch (error) {
    next(error);
  }
});

// Get user's book clubs
router.get('/book-clubs', authenticate, async (req, res, next) => {
  try {
    const bookClubs = await UserService.getUserBookClubs(req.user.id);
    sendResponse(res, {
      success: true,
      data: { bookClubs },
    });
  } catch (error) {
    next(error);
  }
});

export default router; 