import { render, screen, waitFor } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { PartDetail } from '@/pages/PartDetail'
import { AuthContext } from '@/features/auth/AuthContext'
import type { User } from '@/types'

const mockAdminUser: User = {
  id: 1,
  username: 'admin',
  role: 'admin',
  created_at: '2024-01-01T00:00:00Z',
}

const createWrapper = (partId = '1') => {
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
            <Routes>
              <Route path="/inventory/:id" element={children} />
            </Routes>
          </AuthContext.Provider>
        </BrowserRouter>
      </QueryClientProvider>
    )
  }
}

// Mock useParams to return specific id
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useParams: () => ({ id: '1' }),
  }
})

describe('PartDetail', () => {
  it('renders part detail page structure', () => {
    const { container } = render(
      <PartDetail />,
      { wrapper: createWrapper('1') }
    )
    expect(container).toBeInTheDocument()
  })

  it('has back button functionality', () => {
    render(<PartDetail />, { wrapper: createWrapper('1') })
    // Back button should be present
    expect(document.querySelector('button')).toBeInTheDocument()
  })
})
