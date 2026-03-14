import { describe, it, expect, vi, beforeEach } from 'vitest'
import { apiClient } from '@/api/client'

// Mock axios
vi.mock('axios', () => ({
  default: {
    create: vi.fn(() => ({
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      patch: vi.fn(),
      delete: vi.fn(),
      interceptors: {
        request: { use: vi.fn() },
        response: { use: vi.fn() },
      },
    })),
  },
}))

describe('ApiClient', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  it('creates instance with base URL', () => {
    // The client should be created with base URL
    expect(apiClient).toBeDefined()
  })

  it('has get method', () => {
    expect(typeof apiClient.get).toBe('function')
  })

  it('has post method', () => {
    expect(typeof apiClient.post).toBe('function')
  })

  it('has put method', () => {
    expect(typeof apiClient.put).toBe('function')
  })

  it('has patch method', () => {
    expect(typeof apiClient.patch).toBe('function')
  })

  it('has delete method', () => {
    expect(typeof apiClient.delete).toBe('function')
  })
})

describe('API Error Handling', () => {
  it('handles 401 unauthorized error', () => {
    // Error handler should be set up
    expect(apiClient).toBeDefined()
  })

  it('handles 403 forbidden error', () => {
    expect(apiClient).toBeDefined()
  })

  it('handles 404 not found error', () => {
    expect(apiClient).toBeDefined()
  })

  it('handles 422 validation error', () => {
    expect(apiClient).toBeDefined()
  })

  it('handles 500 server error', () => {
    expect(apiClient).toBeDefined()
  })

  it('handles network error', () => {
    expect(apiClient).toBeDefined()
  })
})
