import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { errorHandler } from './middleware/errorHandler';
import { ApiResponseBuilder } from './utils/apiResponse';
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import bookClubRoutes from './routes/bookClubs';
import pool from './config/database';

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(helmet()); // Security headers
app.use(cors()); // Enable CORS
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Basic health check route
app.get('/health', (_req, res) => {
  res.json(ApiResponseBuilder.success({ status: 'ok' }));
});

// API routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/book-clubs', bookClubRoutes);

// 404 handler
app.use((_req, res) => {
  res.status(404).json(
    ApiResponseBuilder.error({
      code: 'NOT_FOUND',
      message: 'Route not found',
    })
  );
});

// Error handling middleware
app.use(errorHandler);

// Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  
  // Test database connection
  pool.query('SELECT NOW()', (err: Error | null) => {
    if (err) {
      console.error('Database connection failed:', err);
    } else {
      console.log('Successfully connected to PostgreSQL database');
    }
  });
}); 