import { Response } from 'express';

interface ApiResponse {
  success: boolean;
  message?: string;
  data?: any;
  error?: {
    code?: string;
    message: string;
  };
}

export const sendResponse = (
  res: Response,
  response: ApiResponse,
  statusCode: number = 200
) => {
  res.status(statusCode).json(response);
}; 