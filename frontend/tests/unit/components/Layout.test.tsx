import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { BrowserRouter } from 'react-router-dom'
import { Layout } from '@/components/Layout'
import { AuthContext } from '@/features/auth/AuthContext'
import type { User } from '@/types'

const createWrapper = (isLoading = false) => {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <BrowserRouter>
        <AuthContext.Provider
          value={{
            user: { id: 1, username: 'admin', role: 'admin' } as User,
            token: 'token',
            isAuthenticated: true,
            isLoading,
            login: async () => {},
            logout: async () => {},
          }}
        >
          {children}
        </AuthContext.Provider>
      </BrowserRouter>
    )
  }
}

describe('Layout', () => {
  it('renders loading state', () => {
    render(
      <Layout>
        <div>Content</div>
      </Layout>,
      { wrapper: createWrapper(true) }
    )
    
    expect(screen.getByText(/loading/i)).toBeInTheDocument()
  })

  it('renders navigation and content when not loading', () => {
    render(
      <Layout>
        <div data-testid="content">Page Content</div>
      </Layout>,
      { wrapper: createWrapper(false) }
    )
    
    expect(screen.getByTestId('content')).toBeInTheDocument()
    // Navigation should be rendered (contains CIMCO logo text)
    expect(screen.getByText('CIMCO')).toBeInTheDocument()
  })

  it('wraps content in main element', () => {
    render(
      <Layout>
        <div>Content</div>
      </Layout>,
      { wrapper: createWrapper(false) }
    )
    
    expect(document.querySelector('main')).toBeInTheDocument()
  })

  it('applies correct container classes', () => {
    render(
      <Layout>
        <div>Content</div>
      </Layout>,
      { wrapper: createWrapper(false) }
    )
    
    const main = document.querySelector('main')
    expect(main).toHaveClass('pt-16')
  })
})
