import { render, screen, waitFor } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Dashboard } from '@/pages/Dashboard'
import { AuthContext } from '@/features/auth/AuthContext'
import type { User } from '@/types'

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

const createWrapper = (user: User) => {
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
              user,
              token: 'token',
              isAuthenticated: true,
              isLoading: false,
              login: async () => {},
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

describe('Dashboard', () => {
  it('renders dashboard header', async () => {
    render(<Dashboard />, { wrapper: createWrapper(mockAdminUser) })
    
    await waitFor(() => {
      expect(screen.getByText(/dashboard/i)).toBeInTheDocument()
    })
  })

  it('displays overview subtitle', async () => {
    render(<Dashboard />, { wrapper: createWrapper(mockAdminUser) })
    
    await waitFor(() => {
      expect(screen.getByText(/overview of your inventory/i)).toBeInTheDocument()
    })
  })

  it('displays stat cards', async () => {
    render(<Dashboard />, { wrapper: createWrapper(mockAdminUser) })
    
    await waitFor(() => {
      expect(screen.getByText(/total parts/i)).toBeInTheDocument()
      expect(screen.getByText(/low stock/i)).toBeInTheDocument()
      expect(screen.getByText(/out of stock/i)).toBeInTheDocument()
      expect(screen.getByText(/tracked parts/i)).toBeInTheDocument()
    })
  })

  it('displays view inventory button', async () => {
    render(<Dashboard />, { wrapper: createWrapper(mockAdminUser) })
    
    await waitFor(() => {
      expect(screen.getByText(/view inventory/i)).toBeInTheDocument()
    })
  })

  it('displays recent activity section', async () => {
    render(<Dashboard />, { wrapper: createWrapper(mockAdminUser) })
    
    await waitFor(() => {
      expect(screen.getByText(/recent activity/i)).toBeInTheDocument()
    })
  })

  it('displays quick actions section', async () => {
    render(<Dashboard />, { wrapper: createWrapper(mockAdminUser) })
    
    await waitFor(() => {
      expect(screen.getByText(/quick actions/i)).toBeInTheDocument()
    })
  })

  it('shows add new part button for admin', async () => {
    render(<Dashboard />, { wrapper: createWrapper(mockAdminUser) })
    
    await waitFor(() => {
      expect(screen.getByText(/add new part/i)).toBeInTheDocument()
    })
  })

  it('hides add new part button for worker', async () => {
    render(<Dashboard />, { wrapper: createWrapper(mockWorkerUser) })
    
    await waitFor(() => {
      expect(screen.queryByText(/add new part/i)).not.toBeInTheDocument()
    })
  })

  it('displays browse inventory quick action', async () => {
    render(<Dashboard />, { wrapper: createWrapper(mockAdminUser) })
    
    await waitFor(() => {
      expect(screen.getByText(/browse inventory/i)).toBeInTheDocument()
    })
  })

  it('displays low stock alert quick action', async () => {
    render(<Dashboard />, { wrapper: createWrapper(mockAdminUser) })
    
    await waitFor(() => {
      expect(screen.getByText(/low stock alert/i)).toBeInTheDocument()
    })
  })
})
