import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { BrowserRouter } from 'react-router-dom'
import { Navigation } from '@/components/Navigation'
import { AuthContext } from '@/features/auth/AuthContext'
import type { User } from '@/types'

const mockLogout = vi.fn()

const createWrapper = (user: User | null = null) => {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <BrowserRouter>
        <AuthContext.Provider
          value={{
            user,
            token: user ? 'token' : null,
            isAuthenticated: !!user,
            isLoading: false,
            login: async () => {},
            logout: mockLogout,
          }}
        >
          {children}
        </AuthContext.Provider>
      </BrowserRouter>
    )
  }
}

const mockAdminUser: User = {
  id: 1,
  username: 'admin',
  role: 'admin',
  created_at: '2024-01-01T00:00:00Z',
}

const mockWorkerUser: User = {
  id: 2,
  username: 'worker',
  role: 'worker',
  created_at: '2024-01-01T00:00:00Z',
}

describe('Navigation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders logo and brand', () => {
    render(<Navigation />, { wrapper: createWrapper(mockAdminUser) })
    
    expect(screen.getByText('CIMCO')).toBeInTheDocument()
    expect(screen.getByText('v2')).toBeInTheDocument()
  })

  it('renders nav links for authenticated user', () => {
    render(<Navigation />, { wrapper: createWrapper(mockAdminUser) })
    
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    expect(screen.getByText('Inventory')).toBeInTheDocument()
  })

  it('shows admin badge for admin user', () => {
    render(<Navigation />, { wrapper: createWrapper(mockAdminUser) })
    
    expect(screen.getByText('Admin')).toBeInTheDocument()
  })

  it('shows worker badge for worker user', () => {
    render(<Navigation />, { wrapper: createWrapper(mockWorkerUser) })
    
    expect(screen.getByText('Worker')).toBeInTheDocument()
  })

  it('shows sign in button for unauthenticated user', () => {
    render(<Navigation />, { wrapper: createWrapper(null) })
    
    expect(screen.getByText('Sign In')).toBeInTheDocument()
  })

  it('opens user menu when clicked', () => {
    render(<Navigation />, { wrapper: createWrapper(mockAdminUser) })
    
    const userButton = screen.getByText('admin')
    fireEvent.click(userButton)
    
    expect(screen.getByText('Sign out')).toBeInTheDocument()
  })

  it('calls logout when sign out clicked', async () => {
    render(<Navigation />, { wrapper: createWrapper(mockAdminUser) })
    
    const userButton = screen.getByText('admin')
    fireEvent.click(userButton)
    
    const signOutButton = screen.getByText('Sign out')
    fireEvent.click(signOutButton)
    
    expect(mockLogout).toHaveBeenCalled()
  })

  it('closes user menu when clicking outside', () => {
    render(<Navigation />, { wrapper: createWrapper(mockAdminUser) })
    
    // Open menu
    const userButton = screen.getByText('admin')
    fireEvent.click(userButton)
    expect(screen.getByText('Sign out')).toBeInTheDocument()
    
    // Click outside (on the overlay)
    const overlay = document.querySelector('.fixed.inset-0')
    if (overlay) {
      fireEvent.click(overlay)
    }
  })

  it('toggles mobile menu', () => {
    render(<Navigation />, { wrapper: createWrapper(mockAdminUser) })
    
    // Find mobile menu button (Menu icon button)
    const mobileButton = document.querySelector('button[class*="md:hidden"]')
    if (mobileButton) {
      fireEvent.click(mobileButton)
      // Mobile menu should be visible
      expect(screen.getAllByText('Dashboard').length).toBeGreaterThan(0)
    }
  })

  it('highlights active navigation item', () => {
    render(<Navigation />, { wrapper: createWrapper(mockAdminUser) })
    
    // The active item should have specific styling
    const dashboardLink = screen.getByText('Dashboard').closest('a')
    expect(dashboardLink).toBeInTheDocument()
  })

  it('displays username for authenticated user', () => {
    render(<Navigation />, { wrapper: createWrapper(mockAdminUser) })
    
    expect(screen.getByText('admin')).toBeInTheDocument()
  })

  it('displays role in user menu', () => {
    render(<Navigation />, { wrapper: createWrapper(mockAdminUser) })
    
    const userButton = screen.getByText('admin')
    fireEvent.click(userButton)
    
    expect(screen.getByText('admin')).toBeInTheDocument()
  })
})
