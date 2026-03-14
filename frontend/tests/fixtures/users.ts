import type { User } from '@/types'

export const mockUser: User = {
  id: 1,
  username: 'admin',
  role: 'admin',
  created_at: '2024-01-01T00:00:00Z',
}

export const mockWorker: User = {
  id: 2,
  username: 'worker',
  role: 'worker',
  created_at: '2024-01-01T00:00:00Z',
}

export const mockAuthResponse = {
  access_token: 'mock-access-token',
  token_type: 'bearer',
  user: mockUser,
}
