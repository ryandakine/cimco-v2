import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { PartForm } from '@/pages/PartForm'
import { AuthContext } from '@/features/auth/AuthContext'
import type { User } from '@/types'

const mockAdminUser: User = {
  id: 1,
  username: 'admin',
  role: 'admin',
  created_at: '2024-01-01T00:00:00Z',
}

const createWrapper = (isEditing = false) => {
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
              <Route path="/inventory/new" element={children} />
              <Route path="/inventory/:id/edit" element={children} />
            </Routes>
          </AuthContext.Provider>
        </BrowserRouter>
      </QueryClientProvider>
    )
  }
}

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useParams: () => ({ id: undefined }),
  }
})

describe('PartForm', () => {
  it('renders create part form', () => {
    const { container } = render(
      <PartForm />,
      { wrapper: createWrapper(false) }
    )
    expect(container).toBeInTheDocument()
  })

  it('renders form with basic structure', () => {
    render(<PartForm />, { wrapper: createWrapper(false) })
    expect(document.querySelector('form')).toBeInTheDocument()
  })
})
