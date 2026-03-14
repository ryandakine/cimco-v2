import { renderHook, waitFor } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  useParts,
  usePart,
  useCategories,
  useZones,
  useManufacturers,
  useDashboardStats,
  useCreatePart,
  useUpdatePart,
  useDeletePart,
  useAdjustQuantity,
} from '@/features/inventory/useParts'
import { ReactNode } from 'react'

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  })
  
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    )
  }
}

describe('useParts', () => {
  it('fetches parts with default params', async () => {
    const { result } = renderHook(() => useParts(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.data).toBeDefined()
    })

    expect(result.current.data?.items).toBeDefined()
    expect(result.current.data?.total).toBeGreaterThan(0)
  })

  it('fetches parts with search filter', async () => {
    const { result } = renderHook(() => useParts({ search: 'Hydraulic' }), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.data).toBeDefined()
    })

    expect(result.current.data?.items).toBeDefined()
  })

  it('fetches parts with category filter', async () => {
    const { result } = renderHook(() => useParts({ category: 'Shredder' }), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.data).toBeDefined()
    })

    expect(result.current.data?.items).toBeDefined()
  })

  it('fetches parts with pagination', async () => {
    const { result } = renderHook(() => useParts({ page: 1, pageSize: 10 }), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.data).toBeDefined()
    })

    expect(result.current.data?.page).toBe(1)
    expect(result.current.data?.page_size).toBe(10)
  })

  it('fetches parts with stock state filter', async () => {
    const { result } = renderHook(() => useParts({ stock_state: 'low_stock' }), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.data).toBeDefined()
    })

    expect(result.current.data?.items).toBeDefined()
  })
})

describe('usePart', () => {
  it('fetches single part by id', async () => {
    const { result } = renderHook(() => usePart(1), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.data).toBeDefined()
    })

    expect(result.current.data?.id).toBe(1)
  })

  it('does not fetch when id is 0', async () => {
    const { result } = renderHook(() => usePart(0), {
      wrapper: createWrapper(),
    })

    expect(result.current.isFetching).toBe(false)
  })

  it('does not fetch when enabled is false', async () => {
    const { result } = renderHook(() => usePart(1, { enabled: false }), {
      wrapper: createWrapper(),
    })

    expect(result.current.isFetching).toBe(false)
  })
})

describe('useCategories', () => {
  it('fetches categories', async () => {
    const { result } = renderHook(() => useCategories(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.data).toBeDefined()
    })

    expect(Array.isArray(result.current.data)).toBe(true)
  })
})

describe('useZones', () => {
  it('fetches zones', async () => {
    const { result } = renderHook(() => useZones(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.data).toBeDefined()
    })

    expect(Array.isArray(result.current.data)).toBe(true)
  })
})

describe('useManufacturers', () => {
  it('fetches manufacturers', async () => {
    const { result } = renderHook(() => useManufacturers(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.data).toBeDefined()
    })

    expect(Array.isArray(result.current.data)).toBe(true)
  })
})

describe('useDashboardStats', () => {
  it('fetches dashboard stats', async () => {
    const { result } = renderHook(() => useDashboardStats(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.data).toBeDefined()
    })

    expect(result.current.data?.total_parts).toBeDefined()
    expect(result.current.data?.low_stock_count).toBeDefined()
    expect(result.current.data?.recent_adjustments).toBeDefined()
  })
})

describe('useCreatePart', () => {
  it('returns mutation function', () => {
    const { result } = renderHook(() => useCreatePart(), {
      wrapper: createWrapper(),
    })

    expect(result.current.mutate).toBeDefined()
    expect(result.current.mutateAsync).toBeDefined()
  })
})

describe('useUpdatePart', () => {
  it('returns mutation function', () => {
    const { result } = renderHook(() => useUpdatePart(), {
      wrapper: createWrapper(),
    })

    expect(result.current.mutate).toBeDefined()
    expect(result.current.mutateAsync).toBeDefined()
  })
})

describe('useDeletePart', () => {
  it('returns mutation function', () => {
    const { result } = renderHook(() => useDeletePart(), {
      wrapper: createWrapper(),
    })

    expect(result.current.mutate).toBeDefined()
    expect(result.current.mutateAsync).toBeDefined()
  })
})

describe('useAdjustQuantity', () => {
  it('returns mutation function', () => {
    const { result } = renderHook(() => useAdjustQuantity(), {
      wrapper: createWrapper(),
    })

    expect(result.current.mutate).toBeDefined()
    expect(result.current.mutateAsync).toBeDefined()
  })
})
