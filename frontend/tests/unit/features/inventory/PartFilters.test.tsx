import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { PartFilters } from '@/features/inventory/PartFilters'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthContext } from '@/features/auth/AuthContext'
import { BrowserRouter } from 'react-router-dom'
import type { User, PartsQueryParams } from '@/types'

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
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  })

  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <BrowserRouter>
        <QueryClientProvider client={queryClient}>
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
        </QueryClientProvider>
      </BrowserRouter>
    )
  }
}

const defaultFilters: PartsQueryParams = {
  page: 1,
  page_size: 25,
  sort_by: 'name',
  sort_order: 'asc',
}

describe('PartFilters', () => {
  it('renders search input', () => {
    render(
      <PartFilters
        filters={defaultFilters}
        onChange={vi.fn()}
        onSearch={vi.fn()}
        searchValue=""
      />,
      { wrapper: createWrapper(mockAdminUser) }
    )
    
    expect(screen.getByPlaceholderText(/search parts/i)).toBeInTheDocument()
  })

  it('calls onSearch when search input changes', () => {
    const onSearch = vi.fn()
    render(
      <PartFilters
        filters={defaultFilters}
        onChange={vi.fn()}
        onSearch={onSearch}
        searchValue=""
      />,
      { wrapper: createWrapper(mockAdminUser) }
    )
    
    const searchInput = screen.getByPlaceholderText(/search parts/i)
    fireEvent.change(searchInput, { target: { value: 'hydraulic' } })
    
    expect(onSearch).toHaveBeenCalledWith('hydraulic')
  })

  it('calls onChange when category filter changes', async () => {
    const onChange = vi.fn()
    render(
      <PartFilters
        filters={defaultFilters}
        onChange={onChange}
        onSearch={vi.fn()}
        searchValue=""
      />,
      { wrapper: createWrapper(mockAdminUser) }
    )
    
    await waitFor(() => {
      const categorySelect = screen.getAllByRole('combobox')[0]
      fireEvent.change(categorySelect, { target: { value: 'Shredder' } })
    })
    
    expect(onChange).toHaveBeenCalled()
  })

  it('calls onChange when stock state filter changes', async () => {
    const onChange = vi.fn()
    render(
      <PartFilters
        filters={defaultFilters}
        onChange={onChange}
        onSearch={vi.fn()}
        searchValue=""
      />,
      { wrapper: createWrapper(mockAdminUser) }
    )
    
    await waitFor(() => {
      const selects = screen.getAllByRole('combobox')
      fireEvent.change(selects[2], { target: { value: 'low_stock' } })
    })
    
    expect(onChange).toHaveBeenCalled()
  })

  it('shows clear filters button when filters are active', () => {
    render(
      <PartFilters
        filters={{ ...defaultFilters, category: 'Shredder' }}
        onChange={vi.fn()}
        onSearch={vi.fn()}
        searchValue=""
      />,
      { wrapper: createWrapper(mockAdminUser) }
    )
    
    expect(screen.getByText(/clear filters/i)).toBeInTheDocument()
  })

  it('hides clear filters button when no filters active', () => {
    render(
      <PartFilters
        filters={defaultFilters}
        onChange={vi.fn()}
        onSearch={vi.fn()}
        searchValue=""
      />,
      { wrapper: createWrapper(mockAdminUser) }
    )
    
    expect(screen.queryByText(/clear filters/i)).not.toBeInTheDocument()
  })

  it('calls onChange with cleared filters when clear button clicked', () => {
    const onChange = vi.fn()
    render(
      <PartFilters
        filters={{ ...defaultFilters, category: 'Shredder' }}
        onChange={onChange}
        onSearch={vi.fn()}
        searchValue=""
      />,
      { wrapper: createWrapper(mockAdminUser) }
    )
    
    fireEvent.click(screen.getByText(/clear filters/i))
    
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({
      category: undefined,
      zone: undefined,
      manufacturer: undefined,
      stock_state: undefined,
      tracked: undefined,
      page: 1,
    }))
  })

  it('shows tracked filter for admin users', async () => {
    render(
      <PartFilters
        filters={defaultFilters}
        onChange={vi.fn()}
        onSearch={vi.fn()}
        searchValue=""
      />,
      { wrapper: createWrapper(mockAdminUser) }
    )
    
    await waitFor(() => {
      expect(screen.getByText(/all parts/i)).toBeInTheDocument()
    })
  })

  it('hides tracked filter for worker users', async () => {
    render(
      <PartFilters
        filters={defaultFilters}
        onChange={vi.fn()}
        onSearch={vi.fn()}
        searchValue=""
      />,
      { wrapper: createWrapper(mockWorkerUser) }
    )
    
    await waitFor(() => {
      const selects = screen.getAllByRole('combobox')
      expect(selects.length).toBeLessThan(5)
    })
  })

  it('renders sort by select', async () => {
    render(
      <PartFilters
        filters={defaultFilters}
        onChange={vi.fn()}
        onSearch={vi.fn()}
        searchValue=""
      />,
      { wrapper: createWrapper(mockAdminUser) }
    )
    
    await waitFor(() => {
      expect(screen.getByText(/sort by/i)).toBeInTheDocument()
    })
  })

  it('renders page size select', async () => {
    render(
      <PartFilters
        filters={defaultFilters}
        onChange={vi.fn()}
        onSearch={vi.fn()}
        searchValue=""
      />,
      { wrapper: createWrapper(mockAdminUser) }
    )
    
    await waitFor(() => {
      expect(screen.getByText(/show/i)).toBeInTheDocument()
    })
  })

  it('clears search when X button clicked', () => {
    const onSearch = vi.fn()
    render(
      <PartFilters
        filters={defaultFilters}
        onChange={vi.fn()}
        onSearch={onSearch}
        searchValue="test"
      />,
      { wrapper: createWrapper(mockAdminUser) }
    )
    
    const clearButton = screen.getByRole('button', { name: '' })
    fireEvent.click(clearButton)
    
    expect(onSearch).toHaveBeenCalledWith('')
  })
})
