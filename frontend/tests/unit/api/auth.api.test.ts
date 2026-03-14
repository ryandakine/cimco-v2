import { describe, it, expect, vi } from 'vitest'
import { authApi } from '@/api/auth.api'

// Mock the apiClient
vi.mock('@/api/client', () => ({
  apiClient: {
    post: vi.fn().mockImplementation((url: string) => {
      if (url === '/auth/login') {
        return Promise.resolve({ access_token: 'token', user: { id: 1, username: 'admin' } })
      }
      if (url === '/auth/logout') {
        return Promise.resolve({})
      }
      if (url === '/auth/refresh') {
        return Promise.resolve({ access_token: 'new-token' })
      }
      return Promise.reject(new Error('Not found'))
    }),
    get: vi.fn().mockImplementation((url: string) => {
      if (url === '/auth/me') {
        return Promise.resolve({ id: 1, username: 'admin' })
      }
      return Promise.reject(new Error('Not found'))
    }),
  },
}))

describe('authApi', () => {
  it('exports login function', () => {
    expect(typeof authApi.login).toBe('function')
  })

  it('exports logout function', () => {
    expect(typeof authApi.logout).toBe('function')
  })

  it('exports getCurrentUser function', () => {
    expect(typeof authApi.getCurrentUser).toBe('function')
  })

  it('exports refreshToken function', () => {
    expect(typeof authApi.refreshToken).toBe('function')
  })
})
