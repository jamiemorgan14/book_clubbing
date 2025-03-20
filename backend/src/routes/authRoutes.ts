import express from 'express';
import { AuthService } from '../services/authService';
import { validateRequest } from '../middleware/validation';
import { z } from 'zod';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// Validation schemas
const registerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters')
});

const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required')
});

const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required')
});

// Register
router.post(
  '/register',
  validateRequest({ body: registerSchema }),
  async (req, res, next) => {
    try {
      const { name, email, password } = req.body;
      const user = await AuthService.register(name, email, password);
      res.status(201).json({
        success: true,
        data: user
      });
    } catch (error) {
      next(error);
    }
  }
);

// Login
router.post(
  '/login',
  validateRequest({ body: loginSchema }),
  async (req, res, next) => {
    try {
      const { email, password } = req.body;
      const result = await AuthService.login(email, password);
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }
);

// Refresh Token
router.post(
  '/refresh-token',
  validateRequest({ body: refreshTokenSchema }),
  async (req, res, next) => {
    try {
      const { refreshToken } = req.body;
      const tokens = await AuthService.refreshToken(refreshToken);
      res.json({
        success: true,
        data: tokens
      });
    } catch (error) {
      next(error);
    }
  }
);

// Logout
router.post(
  '/logout',
  authenticate,
  validateRequest({ body: refreshTokenSchema }),
  async (req, res, next) => {
    try {
      const { refreshToken } = req.body;
      await AuthService.logout(req.user!.id.toString(), refreshToken);
      res.json({
        success: true,
        message: 'Successfully logged out'
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router; 