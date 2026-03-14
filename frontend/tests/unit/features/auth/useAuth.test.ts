import { renderHook } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { useAuth, useIsAdmin, useIsWorker } from '@/features/auth/useAuth'
import { AuthContext } from '@/features/auth/AuthContext'
import type { User } from '@/types'
import { ReactNode } from 'react'

const createWrapper = (value: { user: User | null; isAuthenticated: boolean }) => {
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <AuthContext.Provider
        value={{
          user: value.user,
          token: value.user ? 'token' : null,
          isAuthenticated: value.isAuthenticated,
          isLoading: false,
          login: async () => {},
          logout: async () => {},
        }}
      >
        {children}
      </AuthContext.Provider>
    )
  }
}

describe('useAuth', () => {
  it('throws error when used outside AuthProvider', () => {
    // Suppress console.error for this test
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    
    expect(() => {
      renderHook(() => useAuth())
    }).toThrow('useAuth must be used within an AuthProvider')
    
    consoleSpy.mockRestore()
  })

  it('returns auth context when inside AuthProvider', () => {
    const mockUser: User = {
      id: 1,
      username: 'admin',
      role: 'admin',
      created_at: '2024-01-01T00:00:00Z',
    }

    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper({ user: mockUser, isAuthenticated: true }),
    })

    expect(result.current.user).toEqual(mockUser)
    expect(result.current.isAuthenticated).toBe(true)
  })
})

describe('useIsAdmin', () => {
  it('returns true for admin user', () => {
    const mockUser: User = {
      id: 1,
      username: 'admin',
      role: 'admin',
      created_at: '2024-01-01T00:00:00Z',
    }

    const { result } = renderHook(() => useIsAdmin(), {
      wrapper: createWrapper({ user: mockUser, isAuthenticated: true }),
    })

    expect(result.current).toBe(true)
  })

  it('returns false for worker user', () => {
    const mockUser: User = {
      id: 2,
      username: 'worker',
      role: 'worker',
      created_at: '2024-01-01T00:00:00Z',
    }

    const { result } = renderHook(() => useIsAdmin(), {
      wrapper: createWrapper({ user: mockUser, isAuthenticated: true }),
    })

    expect(result.current).toBe(false)
  })

  it('returns false when no user', () => {
    const { result } = renderHook(() => useIsAdmin(), {
      wrapper: createWrapper({ user: null, isAuthenticated: false }),
    })

    expect(result.current).toBe(false)
  })
})

describe('useIsWorker', () => {
  it('returns true for worker user', () => {
    const mockUser: User = {
      id: 2,
      username: 'worker',
      role: 'worker',
      created_at: '2024-01-01T00:00:00Z',
    }

    const { result } = renderHook(() => useIsWorker(), {
      wrapper: createWrapper({ user: mockUser, isAuthenticated: true }),
    })

    expect(result.current).toBe(true)
  })

  it('returns false for admin user', () => {
    const mockUser: User = {
      id: 1,
      username: 'admin',
      role: 'admin',
      created_at: '2024-01-01T00:00:00Z',
    }

    const { result } = renderHook(() => useIsWorker(), {
      wrapper: createWrapper({ user: mockUser, isAuthenticated: true }),
    })

    expect(result.current).toBe(false)
  })

  it('returns false when no user', () => {
    const { result } = renderHook(() => useIsWorker(), {
      wrapper: createWrapper({ user: null, isAuthenticated: false }),
    })

    expect(result.current).toBe(false)
  })
})
