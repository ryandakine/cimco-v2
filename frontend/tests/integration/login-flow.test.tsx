import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Login } from '@/pages/Login'
import { AuthContext } from '@/features/auth/AuthContext'
import type { User } from '@/types'

const mockLogin = vi.fn()

const createWrapper = (isAuthenticated = false, isLoading = false) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  })

  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AuthContext.Provider
            value={{
              user: isAuthenticated ? { id: 1, username: 'admin', role: 'admin' } as User : null,
              token: isAuthenticated ? 'token' : null,
              isAuthenticated,
              isLoading,
              login: mockLogin,
              logout: async () => {},
            }}
          >
            {children}
          </AuthContext.Provider>
        </BrowserRouter>
      </QueryClientProvider>
    )
  }
}

describe('Login Flow Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders login form', () => {
    render(<Login />, { wrapper: createWrapper(false) })
    
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
  })

  it('shows loading state during auth initialization', () => {
    render(<Login />, { wrapper: createWrapper(false, true) })
    
    expect(screen.getByText(/loading/i)).toBeInTheDocument()
  })

  it('redirects to dashboard when already authenticated', () => {
    render(<Login />, { wrapper: createWrapper(true) })
    
    // Should redirect, form should not be visible
    expect(screen.queryByLabelText(/username/i)).not.toBeInTheDocument()
  })

  it('completes login form submission flow', async () => {
    mockLogin.mockResolvedValueOnce(undefined)
    render(<Login />, { wrapper: createWrapper(false) })
    
    // Fill in credentials
    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'admin' } })
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'admin123' } })
    
    // Submit form
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }))
    
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({ username: 'admin', password: 'admin123' })
    })
  })

  it('displays logo and branding', () => {
    render(<Login />, { wrapper: createWrapper(false) })
    
    expect(screen.getByText('CIMCO Inventory')).toBeInTheDocument()
    expect(screen.getByText(/sign in to manage/i)).toBeInTheDocument()
  })

  it('shows footer with version', () => {
    render(<Login />, { wrapper: createWrapper(false) })
    
    expect(screen.getByText(/cimco inventory system v2/i)).toBeInTheDocument()
  })
})
