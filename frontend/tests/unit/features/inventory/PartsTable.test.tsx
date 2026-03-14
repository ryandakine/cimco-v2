import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { PartsTable } from '@/features/inventory/PartsTable'
import { mockParts } from '../../../fixtures/parts'
import { AuthContext } from '@/features/auth/AuthContext'
import { BrowserRouter } from 'react-router-dom'
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
            logout: async () => {},
          }}
        >
          {children}
        </AuthContext.Provider>
      </BrowserRouter>
    )
  }
}

describe('PartsTable', () => {
  it('renders loading state', () => {
    render(<PartsTable parts={[]} isLoading />, { wrapper: createWrapper(mockAdminUser) })
    
    expect(document.querySelector('.animate-pulse')).toBeInTheDocument()
  })

  it('renders empty state when no parts', () => {
    render(<PartsTable parts={[]} />, { wrapper: createWrapper(mockAdminUser) })
    
    expect(screen.getByText(/no parts found/i)).toBeInTheDocument()
  })

  it('renders parts correctly', () => {
    render(<PartsTable parts={mockParts} />, { wrapper: createWrapper(mockAdminUser) })
    
    expect(screen.getByText('Hydraulic Cylinder')).toBeInTheDocument()
    expect(screen.getByText('Shredder')).toBeInTheDocument()
  })

  it('calls onSort when header is clicked', () => {
    const onSort = vi.fn()
    render(<PartsTable parts={mockParts} onSort={onSort} />, { wrapper: createWrapper(mockAdminUser) })
    
    fireEvent.click(screen.getByText('Part Name'))
    expect(onSort).toHaveBeenCalledWith('name')
  })

  it('calls onView when view button is clicked', () => {
    const onView = vi.fn()
    render(<PartsTable parts={mockParts} onView={onView} />, { wrapper: createWrapper(mockAdminUser) })
    
    const viewButtons = screen.getAllByTitle('View')
    fireEvent.click(viewButtons[0])
    expect(onView).toHaveBeenCalledWith(mockParts[0])
  })

  it('calls onAdjust when adjust button is clicked', () => {
    const onAdjust = vi.fn()
    render(<PartsTable parts={mockParts} onAdjust={onAdjust} />, { wrapper: createWrapper(mockAdminUser) })
    
    const adjustButtons = screen.getAllByTitle('Adjust Quantity')
    fireEvent.click(adjustButtons[0])
    expect(onAdjust).toHaveBeenCalledWith(mockParts[0])
  })

  it('shows edit and delete buttons for admin', () => {
    render(<PartsTable parts={mockParts} />, { wrapper: createWrapper(mockAdminUser) })
    
    expect(screen.getAllByTitle('Edit').length).toBeGreaterThan(0)
    expect(screen.getAllByTitle('Delete').length).toBeGreaterThan(0)
  })

  it('hides edit and delete buttons for worker', () => {
    render(<PartsTable parts={mockParts} />, { wrapper: createWrapper(mockWorkerUser) })
    
    expect(screen.queryByTitle('Edit')).not.toBeInTheDocument()
    expect(screen.queryByTitle('Delete')).not.toBeInTheDocument()
  })

  it('calls onEdit when edit button is clicked', () => {
    const onEdit = vi.fn()
    render(<PartsTable parts={mockParts} onEdit={onEdit} />, { wrapper: createWrapper(mockAdminUser) })
    
    const editButtons = screen.getAllByTitle('Edit')
    fireEvent.click(editButtons[0])
    expect(onEdit).toHaveBeenCalledWith(mockParts[0])
  })

  it('calls onDelete when delete button is clicked', () => {
    const onDelete = vi.fn()
    render(<PartsTable parts={mockParts} onDelete={onDelete} />, { wrapper: createWrapper(mockAdminUser) })
    
    const deleteButtons = screen.getAllByTitle('Delete')
    fireEvent.click(deleteButtons[0])
    expect(onDelete).toHaveBeenCalledWith(mockParts[0])
  })

  it('displays tracked badge for tracked parts', () => {
    render(<PartsTable parts={mockParts} />, { wrapper: createWrapper(mockAdminUser) })
    
    expect(screen.getByText('Tracked')).toBeInTheDocument()
  })

  it('displays correct stock state badges', () => {
    render(<PartsTable parts={mockParts} />, { wrapper: createWrapper(mockAdminUser) })
    
    expect(screen.getByText('In Stock')).toBeInTheDocument()
    expect(screen.getByText('Low Stock')).toBeInTheDocument()
    expect(screen.getByText('Out of Stock')).toBeInTheDocument()
  })

  it('shows sort indicator on current sort field', () => {
    render(
      <PartsTable parts={mockParts} sortBy="name" sortOrder="asc" />,
      { wrapper: createWrapper(mockAdminUser) }
    )
    
    const sortIcon = document.querySelector('.text-cyan-400')
    expect(sortIcon).toBeInTheDocument()
  })

  it('shows rotated sort indicator for desc order', () => {
    render(
      <PartsTable parts={mockParts} sortBy="name" sortOrder="desc" />,
      { wrapper: createWrapper(mockAdminUser) }
    )
    
    const sortIcon = document.querySelector('.rotate-180')
    expect(sortIcon).toBeInTheDocument()
  })

  it('renders part number when available', () => {
    render(<PartsTable parts={mockParts} />, { wrapper: createWrapper(mockAdminUser) })
    
    expect(screen.getByText('HC-001')).toBeInTheDocument()
  })

  it('renders dash for missing part number', () => {
    const partsWithoutNumber = [{ ...mockParts[0], part_number: undefined }]
    render(<PartsTable parts={partsWithoutNumber} />, { wrapper: createWrapper(mockAdminUser) })
    
    const cells = screen.getAllByText('-')
    expect(cells.length).toBeGreaterThan(0)
  })
})
