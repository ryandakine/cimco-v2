import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { LoginForm } from '@/features/auth/LoginForm'
import { AuthContext } from '@/features/auth/AuthContext'
import { BrowserRouter } from 'react-router-dom'
import type { User } from '@/types'

const createWrapper = (loginMock = vi.fn(), isLoading = false) => {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <BrowserRouter>
        <AuthContext.Provider
          value={{
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading,
            login: loginMock,
            logout: async () => {},
          }}
        >
          {children}
        </AuthContext.Provider>
      </BrowserRouter>
    )
  }
}

describe('LoginForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders form fields', () => {
    render(<LoginForm />, { wrapper: createWrapper() })
    
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
  })

  it('updates username field on change', () => {
    render(<LoginForm />, { wrapper: createWrapper() })
    
    const usernameInput = screen.getByLabelText(/username/i)
    fireEvent.change(usernameInput, { target: { value: 'admin' } })
    
    expect(usernameInput).toHaveValue('admin')
  })

  it('updates password field on change', () => {
    render(<LoginForm />, { wrapper: createWrapper() })
    
    const passwordInput = screen.getByLabelText(/password/i)
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    
    expect(passwordInput).toHaveValue('password123')
  })

  it('shows validation error for empty username', async () => {
    render(<LoginForm />, { wrapper: createWrapper() })
    
    const submitButton = screen.getByRole('button', { name: /sign in/i })
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText(/username is required/i)).toBeInTheDocument()
    })
  })

  it('shows validation error for empty password', async () => {
    render(<LoginForm />, { wrapper: createWrapper() })
    
    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'admin' } })
    const submitButton = screen.getByRole('button', { name: /sign in/i })
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText(/password is required/i)).toBeInTheDocument()
    })
  })

  it('calls login with credentials when form is valid', async () => {
    const loginMock = vi.fn().mockResolvedValueOnce(undefined)
    render(<LoginForm />, { wrapper: createWrapper(loginMock) })
    
    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'admin' } })
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password123' } })
    
    const submitButton = screen.getByRole('button', { name: /sign in/i })
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(loginMock).toHaveBeenCalledWith({ username: 'admin', password: 'password123' })
    })
  })

  it('disables inputs and button when loading', () => {
    render(<LoginForm />, { wrapper: createWrapper(vi.fn(), true) })
    
    expect(screen.getByLabelText(/username/i)).toBeDisabled()
    expect(screen.getByLabelText(/password/i)).toBeDisabled()
    expect(screen.getByRole('button', { name: /sign in/i })).toBeDisabled()
  })

  it('clears error when user starts typing', async () => {
    render(<LoginForm />, { wrapper: createWrapper() })
    
    // Trigger validation error
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }))
    
    await waitFor(() => {
      expect(screen.getByText(/username is required/i)).toBeInTheDocument()
    })
    
    // Clear error by typing
    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'a' } })
    
    expect(screen.queryByText(/username is required/i)).not.toBeInTheDocument()
  })

  it('shows error message when login fails', async () => {
    const loginMock = vi.fn().mockRejectedValueOnce(new Error('Invalid credentials'))
    render(<LoginForm />, { wrapper: createWrapper(loginMock) })
    
    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'admin' } })
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'wrong' } })
    
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }))
    
    await waitFor(() => {
      expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument()
    })
  })

  it('has autoFocus on username field', () => {
    render(<LoginForm />, { wrapper: createWrapper() })
    expect(screen.getByLabelText(/username/i)).toHaveFocus()
  })

  it('has correct autocomplete attributes', () => {
    render(<LoginForm />, { wrapper: createWrapper() })
    
    expect(screen.getByLabelText(/username/i)).toHaveAttribute('autocomplete', 'username')
    expect(screen.getByLabelText(/password/i)).toHaveAttribute('autocomplete', 'current-password')
  })
})
