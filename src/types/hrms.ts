/**
 * HRMS Type Definitions
 * Aligned with backend Mongoose models and Express routes
 */

export interface Store {
  _id: string;
  name: string;
  address: string;
  latitude: string;
  longitude: string;
  createdAt?: string;
  updatedAt?: string;
  // Computed client-side metrics
  employeeCount?: number;
}

export interface User {
  _id: string;
  storeId: string;
  name: string;
  email: string;
  password?: string;
  isValid: boolean;
  role?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Attendance {
  _id: string;
  userId: string;
  storeId?: string;
  latitude: string;
  longitude: string;
  imageUrl: string;
  createdAt: string;
  updatedAt?: string;
  // Client-enriched properties
  userName?: string;
  userEmail?: string;
  storeName?: string;
  distanceMeters?: number;
  isWithinGeofence?: boolean;
}

export interface AuthTokens {
  authToken: string;
  refreshToken: string;
  expiresAt?: number;
}

export interface LoginResponse {
  status: 'Success' | 'Error';
  authToken?: string;
  refreshToken?: string;
  message?: string;
}

export interface HealthResponse {
  message: string;
}

export interface ApiConfig {
  baseUrl: string;
  accountId: string;
  authToken: string;
  refreshToken: string;
  isLiveConnected: boolean;
  lastChecked?: string;
}

export interface NewStorePayload {
  name: string;
  address: string;
  latitude: string;
  longitude: string;
}

export interface NewUserPayload {
  name: string;
  email: string;
  storeId: string;
  password: string;
}

export interface AttendanceSimPayload {
  userId: string;
  latitude: string;
  longitude: string;
  imageUrl?: string;
}
