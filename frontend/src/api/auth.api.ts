import { apiClient } from './client';
import type { AuthResponse, LoginCredentials, User } from '@/types';

export const authApi = {
  login: (credentials: LoginCredentials): Promise<AuthResponse> =>
    apiClient.post<AuthResponse>('/auth/login', credentials),

  logout: (): Promise<void> =>
    apiClient.post<void>('/auth/logout'),

  getCurrentUser: (): Promise<User> =>
    apiClient.get<User>('/auth/me'),

  refreshToken: (): Promise<{ access_token: string }> =>
    apiClient.post<{ access_token: string }>('/auth/refresh'),
};
