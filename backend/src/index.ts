import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { errorHandler } from './middleware/errorHandler';
import { ApiResponseBuilder } from './utils/apiResponse';
import authRoutes from './routes/auth';

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
app.get('/health', (req, res) => {
  res.json(ApiResponseBuilder.success({ status: 'ok' }));
});

// API routes
app.use('/api/v1/auth', authRoutes);

// 404 handler
app.use((req, res) => {
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
}); 