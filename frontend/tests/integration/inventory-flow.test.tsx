import { render, screen, waitFor } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Inventory } from '@/pages/Inventory'
import { AuthContext } from '@/features/auth/AuthContext'
import type { User } from '@/types'

const mockAdminUser: User = {
  id: 1,
  username: 'admin',
  role: 'admin',
  created_at: '2024-01-01T00:00:00Z',
}

const createWrapper = () => {
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
              user: mockAdminUser,
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

describe('Inventory Flow Integration', () => {
  it('renders inventory page with header', async () => {
    render(<Inventory />, { wrapper: createWrapper() })
    
    await waitFor(() => {
      expect(screen.getByText(/parts inventory/i)).toBeInTheDocument()
    })
  })

  it('displays export button', async () => {
    render(<Inventory />, { wrapper: createWrapper() })
    
    await waitFor(() => {
      expect(screen.getByText(/export csv/i)).toBeInTheDocument()
    })
  })

  it('displays add part button for admin', async () => {
    render(<Inventory />, { wrapper: createWrapper() })
    
    await waitFor(() => {
      expect(screen.getByText(/add part/i)).toBeInTheDocument()
    })
  })

  it('renders search input', async () => {
    render(<Inventory />, { wrapper: createWrapper() })
    
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/search parts/i)).toBeInTheDocument()
    })
  })

  it('renders parts table with data', async () => {
    render(<Inventory />, { wrapper: createWrapper() })
    
    await waitFor(() => {
      expect(screen.getByText(/hydraulic cylinder/i)).toBeInTheDocument()
    })
  })

  it('displays pagination controls', async () => {
    render(<Inventory />, { wrapper: createWrapper() })
    
    await waitFor(() => {
      expect(screen.getByText(/page/i)).toBeInTheDocument()
    })
  })

  it('renders filter controls', async () => {
    render(<Inventory />, { wrapper: createWrapper() })
    
    await waitFor(() => {
      expect(screen.getByText(/filters/i)).toBeInTheDocument()
    })
  })
})
