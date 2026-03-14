import { render, screen, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { AuthProvider, AuthContext } from '@/features/auth/AuthContext'
import { mockAuthResponse, mockUser } from '../../../fixtures/parts'
import { BrowserRouter } from 'react-router-dom'

// Mock the auth API
vi.mock('@/api/auth.api', () => ({
  authApi: {
    login: vi.fn(),
    logout: vi.fn(),
    getCurrentUser: vi.fn(),
  },
}))

import { authApi } from '@/api/auth.api'

const TestComponent = () => {
  return (
    <AuthContext.Consumer>
      {(value) => (
        <div>
          <span data-testid="isAuthenticated">{value?.isAuthenticated ? 'true' : 'false'}</span>
          <span data-testid="isLoading">{value?.isLoading ? 'true' : 'false'}</span>
          <span data-testid="username">{value?.user?.username || 'null'}</span>
          <span data-testid="token">{value?.token || 'null'}</span>
        </div>
      )}
    </AuthContext.Consumer>
  )
}

const renderWithProvider = () => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    </BrowserRouter>
  )
}

describe('AuthProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.getItem = vi.fn().mockReturnValue(null)
    localStorage.setItem = vi.fn()
    localStorage.removeItem = vi.fn()
  })

  it('initializes with unauthenticated state', async () => {
    renderWithProvider()
    
    await waitFor(() => {
      expect(screen.getByTestId('isLoading')).toHaveTextContent('false')
    })
    
    expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('false')
    expect(screen.getByTestId('username')).toHaveTextContent('null')
  })

  it('restores session from localStorage', async () => {
    localStorage.getItem = vi.fn().mockReturnValue('stored-token')
    vi.mocked(authApi.getCurrentUser).mockResolvedValueOnce(mockUser)

    renderWithProvider()

    await waitFor(() => {
      expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('true')
    })

    expect(screen.getByTestId('username')).toHaveTextContent('admin')
    expect(screen.getByTestId('token')).toHaveTextContent('stored-token')
  })

  it('handles invalid stored token', async () => {
    localStorage.getItem = vi.fn().mockReturnValue('invalid-token')
    vi.mocked(authApi.getCurrentUser).mockRejectedValueOnce(new Error('Invalid token'))

    renderWithProvider()

    await waitFor(() => {
      expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('false')
    })

    expect(localStorage.removeItem).toHaveBeenCalledWith('cimco_token')
  })

  it('provides login function', async () => {
    vi.mocked(authApi.login).mockResolvedValueOnce(mockAuthResponse)

    let loginFn: Function | undefined

    render(
      <BrowserRouter>
        <AuthProvider>
          <AuthContext.Consumer>
            {(value) => {
              loginFn = value?.login
              return <div data-testid="isAuthenticated">{value?.isAuthenticated ? 'true' : 'false'}</div>
            }}
          </AuthContext.Consumer>
        </AuthProvider>
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(screen.getByTestId('isAuthenticated')).toBeInTheDocument()
    })

    expect(loginFn).toBeDefined()
  })

  it('provides logout function', async () => {
    vi.mocked(authApi.logout).mockResolvedValueOnce(undefined)
    localStorage.getItem = vi.fn().mockReturnValue('stored-token')
    vi.mocked(authApi.getCurrentUser).mockResolvedValueOnce(mockUser)

    let logoutFn: Function | undefined

    render(
      <BrowserRouter>
        <AuthProvider>
          <AuthContext.Consumer>
            {(value) => {
              logoutFn = value?.logout
              return <div data-testid="isAuthenticated">{value?.isAuthenticated ? 'true' : 'false'}</div>
            }}
          </AuthContext.Consumer>
        </AuthProvider>
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('true')
    })

    expect(logoutFn).toBeDefined()
  })

  it('isLoading is true during initialization', () => {
    renderWithProvider()
    expect(screen.getByTestId('isLoading')).toHaveTextContent('true')
  })
})
