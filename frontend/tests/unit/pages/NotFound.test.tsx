import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { BrowserRouter, useNavigate } from 'react-router-dom'
import { NotFound } from '@/pages/NotFound'

// Mock useNavigate
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: vi.fn(),
  }
})

const createWrapper = () => {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return <BrowserRouter>{children}</BrowserRouter>
  }
}

describe('NotFound', () => {
  it('renders 404 title', () => {
    render(<NotFound />, { wrapper: createWrapper() })
    expect(screen.getByText('404')).toBeInTheDocument()
  })

  it('renders page not found message', () => {
    render(<NotFound />, { wrapper: createWrapper() })
    expect(screen.getByText(/page not found/i)).toBeInTheDocument()
  })

  it('renders description text', () => {
    render(<NotFound />, { wrapper: createWrapper() })
    expect(screen.getByText(/the page you're looking for/i)).toBeInTheDocument()
  })

  it('renders go back button', () => {
    render(<NotFound />, { wrapper: createWrapper() })
    expect(screen.getByText(/go back/i)).toBeInTheDocument()
  })

  it('renders dashboard button', () => {
    render(<NotFound />, { wrapper: createWrapper() })
    expect(screen.getByText(/dashboard/i)).toBeInTheDocument()
  })

  it('navigates back when go back clicked', () => {
    const mockNavigate = vi.fn()
    vi.mocked(useNavigate).mockReturnValue(mockNavigate)
    
    render(<NotFound />, { wrapper: createWrapper() })
    
    fireEvent.click(screen.getByText(/go back/i))
    expect(mockNavigate).toHaveBeenCalledWith(-1)
  })

  it('navigates to dashboard when dashboard clicked', () => {
    const mockNavigate = vi.fn()
    vi.mocked(useNavigate).mockReturnValue(mockNavigate)
    
    render(<NotFound />, { wrapper: createWrapper() })
    
    fireEvent.click(screen.getByText(/dashboard/i))
    expect(mockNavigate).toHaveBeenCalledWith('/')
  })

  it('displays alert icon', () => {
    render(<NotFound />, { wrapper: createWrapper() })
    expect(document.querySelector('svg')).toBeInTheDocument()
  })
})
