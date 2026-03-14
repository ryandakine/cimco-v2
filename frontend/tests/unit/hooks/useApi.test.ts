import { renderHook, act, waitFor } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { useApi, useApiAction } from '@/hooks/useApi'

describe('useApi', () => {
  it('initializes with correct default state', () => {
    const mockFn = vi.fn().mockResolvedValue('data')
    const { result } = renderHook(() => useApi(mockFn))

    expect(result.current.data).toBeNull()
    expect(result.current.isLoading).toBe(false)
    expect(result.current.error).toBeNull()
  })

  it('executes API call and returns data', async () => {
    const mockFn = vi.fn().mockResolvedValue('test-data')
    const { result } = renderHook(() => useApi(mockFn))

    let data: string | null = null
    await act(async () => {
      data = await result.current.execute()
    })

    expect(data).toBe('test-data')
    expect(result.current.data).toBe('test-data')
    expect(result.current.isLoading).toBe(false)
  })

  it('sets loading state during execution', async () => {
    let resolvePromise: (value: string) => void
    const mockFn = vi.fn().mockImplementation(() => {
      return new Promise<string>((resolve) => {
        resolvePromise = resolve
      })
    })
    
    const { result } = renderHook(() => useApi(mockFn))

    act(() => {
      result.current.execute()
    })

    expect(result.current.isLoading).toBe(true)

    await act(async () => {
      resolvePromise!('data')
    })

    expect(result.current.isLoading).toBe(false)
  })

  it('handles API errors correctly', async () => {
    const error = new Error('API Error')
    const mockFn = vi.fn().mockRejectedValue(error)
    const { result } = renderHook(() => useApi(mockFn))

    await act(async () => {
      await result.current.execute()
    })

    expect(result.current.error).toEqual(error)
    expect(result.current.data).toBeNull()
    expect(result.current.isLoading).toBe(false)
  })

  it('resets state correctly', async () => {
    const mockFn = vi.fn().mockResolvedValue('data')
    const { result } = renderHook(() => useApi(mockFn))

    await act(async () => {
      await result.current.execute()
    })

    expect(result.current.data).toBe('data')

    act(() => {
      result.current.reset()
    })

    expect(result.current.data).toBeNull()
    expect(result.current.error).toBeNull()
    expect(result.current.isLoading).toBe(false)
  })

  it('passes arguments to API function', async () => {
    const mockFn = vi.fn().mockResolvedValue('data')
    const { result } = renderHook(() => useApi(mockFn))

    await act(async () => {
      await result.current.execute('arg1', 'arg2')
    })

    expect(mockFn).toHaveBeenCalledWith('arg1', 'arg2')
  })

  it('handles multiple consecutive calls', async () => {
    const mockFn = vi.fn()
      .mockResolvedValueOnce('first')
      .mockResolvedValueOnce('second')
    const { result } = renderHook(() => useApi(mockFn))

    await act(async () => {
      await result.current.execute()
    })
    expect(result.current.data).toBe('first')

    await act(async () => {
      await result.current.execute()
    })
    expect(result.current.data).toBe('second')
  })

  it('handles error then success', async () => {
    const mockFn = vi.fn()
      .mockRejectedValueOnce(new Error('First error'))
      .mockResolvedValueOnce('success')
    const { result } = renderHook(() => useApi(mockFn))

    await act(async () => {
      await result.current.execute()
    })
    expect(result.current.error).not.toBeNull()

    await act(async () => {
      await result.current.execute()
    })
    expect(result.current.error).toBeNull()
    expect(result.current.data).toBe('success')
  })
})

describe('useApiAction', () => {
  it('exports useApiAction as alias', () => {
    const mockFn = vi.fn().mockResolvedValue('data')
    const { result } = renderHook(() => useApiAction(mockFn))

    expect(result.current.execute).toBeDefined()
    expect(result.current.reset).toBeDefined()
    expect(result.current.data).toBeNull()
  })
})
