// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
}

// Pagination Types
export interface PaginatedResponse<T> extends ApiResponse<T> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Common Query Parameters
export interface PaginationQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Authentication Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
  };
}

// User Types
export interface User {
  id: string;
  email: string;
  name: string;
  password_hash?: string;
  createdAt: string;
  updatedAt: string;
}

// Group Types
export interface Group {
  id: string;
  name: string;
  description?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface GroupMember {
  id: string;
  groupId: string;
  userId: string;
  role: 'admin' | 'member';
  status: 'pending' | 'active';
  createdAt: string;
  updatedAt: string;
}

// Book Types
export interface Book {
  id: string;
  goodreadsId?: string;
  title: string;
  author: string;
  isbn?: string;
  coverImageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

// Discussion Types
export interface Discussion {
  id: string;
  groupId: string;
  bookId: string;
  title: string;
  content: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

// Meetup Types
export interface Meetup {
  id: string;
  groupId: string;
  bookId: string;
  scheduledFor: string;
  location?: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  createdBy: string;
  createdAt: string;
  updatedAt: string;
} 