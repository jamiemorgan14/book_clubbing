import express from 'express';
import { AuthService } from '../services/authService';
import { ApiResponseBuilder } from '../utils/apiResponse';
import { LoginRequest, RegisterRequest } from '../types/api';
import jwt from 'jsonwebtoken';

const router = express.Router();
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key';

// Register new user
router.post('/register', async (req, res, next) => {
  try {
    const data: RegisterRequest = req.body;
    const user = await AuthService.register(data.name, data.email, data.password);
    const { accessToken, refreshToken } = await AuthService.login(data.email, data.password);

    res.status(201).json(
      ApiResponseBuilder.success({
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
        accessToken,
        refreshToken
      })
    );
  } catch (error) {
    next(error);
  }
});

// Login user
router.post('/login', async (req, res, next) => {
  try {
    const { email, password }: LoginRequest = req.body;
    const result = await AuthService.login(email, password);

    res.json(
      ApiResponseBuilder.success({
        user: result.user,
        accessToken: result.accessToken,
        refreshToken: result.refreshToken
      })
    );
  } catch (error) {
    next(error);
  }
});

// Refresh token
router.post('/refresh-token', async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    const result = await AuthService.refreshToken(refreshToken);

    res.json(
      ApiResponseBuilder.success({
        accessToken: result.accessToken,
        refreshToken: result.refreshToken
      })
    );
  } catch (error) {
    next(error);
  }
});

// Logout
router.post('/logout', async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET) as { userId: string };
    await AuthService.logout(refreshToken, decoded.userId);

    res.json(
      ApiResponseBuilder.success({
        message: 'Successfully logged out'
      })
    );
  } catch (error) {
    next(error);
  }
});

export default router; 