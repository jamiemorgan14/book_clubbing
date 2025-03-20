import express from 'express';
import { UserService } from '../services/userService';
import { AuthUtils } from '../utils/auth';
import { ApiResponseBuilder } from '../utils/apiResponse';
import { LoginRequest, RegisterRequest } from '../types/api';

const router = express.Router();

// Register new user
router.post('/register', async (req, res, next) => {
  try {
    const data: RegisterRequest = req.body;
    const user = await UserService.createUser(data);
    const token = AuthUtils.generateToken({
      id: user.id,
      email: user.email,
      name: user.name
    });

    res.status(201).json(
      ApiResponseBuilder.success({
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
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
    const user = await UserService.validatePassword(email, password);

    if (!user) {
      return res.status(401).json(
        ApiResponseBuilder.error({
          code: 'UNAUTHORIZED',
          message: 'Invalid email or password',
        })
      );
    }

    const token = AuthUtils.generateToken({
      id: user.id,
      email: user.email,
      name: user.name
    });

    return res.json(
      ApiResponseBuilder.success({
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
      })
    );
  } catch (error) {
    return next(error);
  }
});

export default router; 