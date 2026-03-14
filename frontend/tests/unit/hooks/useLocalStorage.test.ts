import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, beforeEach } from 'vitest'
import { useLocalStorage } from '@/hooks/useLocalStorage'

describe('useLocalStorage', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('returns initial value when localStorage is empty', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 'initial'))
    expect(result.current[0]).toBe('initial')
  })

  it('returns stored value from localStorage', () => {
    localStorage.setItem('test-key', JSON.stringify('stored-value'))
    const { result } = renderHook(() => useLocalStorage('test-key', 'initial'))
    expect(result.current[0]).toBe('stored-value')
  })

  it('updates localStorage when value changes', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 'initial'))

    act(() => {
      result.current[1]('new-value')
    })

    expect(result.current[0]).toBe('new-value')
    expect(localStorage.setItem).toHaveBeenCalledWith('test-key', JSON.stringify('new-value'))
  })

  it('handles function updater', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 0))

    act(() => {
      result.current[1]((prev) => prev + 1)
    })

    expect(result.current[0]).toBe(1)
  })

  it('handles objects', () => {
    const initialObj = { name: 'test', count: 0 }
    const { result } = renderHook(() => useLocalStorage('obj-key', initialObj))

    act(() => {
      result.current[1]({ name: 'updated', count: 1 })
    })

    expect(result.current[0]).toEqual({ name: 'updated', count: 1 })
  })

  it('handles arrays', () => {
    const initialArr = [1, 2, 3]
    const { result } = renderHook(() => useLocalStorage('arr-key', initialArr))

    act(() => {
      result.current[1]([1, 2, 3, 4])
    })

    expect(result.current[0]).toEqual([1, 2, 3, 4])
  })

  it('handles invalid JSON in localStorage gracefully', () => {
    localStorage.setItem('bad-key', 'not-valid-json')
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    
    const { result } = renderHook(() => useLocalStorage('bad-key', 'fallback'))
    
    expect(result.current[0]).toBe('fallback')
    consoleSpy.mockRestore()
  })

  it('handles storage errors gracefully', () => {
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const setItemMock = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('Storage full')
    })

    const { result } = renderHook(() => useLocalStorage('test-key', 'initial'))

    act(() => {
      result.current[1]('new-value')
    })

    // Value should still update in state even if localStorage fails
    expect(result.current[0]).toBe('new-value')

    setItemMock.mockRestore()
    consoleSpy.mockRestore()
  })

  it('syncs across tabs via storage event', () => {
    const { result } = renderHook(() => useLocalStorage('sync-key', 'initial'))

    // Simulate storage event from another tab
    act(() => {
      const event = new StorageEvent('storage', {
        key: 'sync-key',
        newValue: JSON.stringify('from-other-tab'),
      })
      window.dispatchEvent(event)
    })

    expect(result.current[0]).toBe('from-other-tab')
  })

  it('ignores storage events for different keys', () => {
    const { result } = renderHook(() => useLocalStorage('my-key', 'initial'))

    act(() => {
      const event = new StorageEvent('storage', {
        key: 'other-key',
        newValue: JSON.stringify('other-value'),
      })
      window.dispatchEvent(event)
    })

    expect(result.current[0]).toBe('initial')
  })

  it('handles null newValue in storage event', () => {
    const { result } = renderHook(() => useLocalStorage('null-key', 'initial'))

    act(() => {
      const event = new StorageEvent('storage', {
        key: 'null-key',
        newValue: null,
      })
      window.dispatchEvent(event)
    })

    // Should not crash
    expect(result.current[0]).toBe('initial')
  })

  it('returns initial value when window is undefined (SSR)', () => {
    const originalWindow = global.window
    // @ts-expect-error - intentionally removing window for SSR test
    global.window = undefined

    const { result } = renderHook(() => useLocalStorage('ssr-key', 'ssr-value'))
    expect(result.current[0]).toBe('ssr-value')

    global.window = originalWindow
  })

  it('handles boolean values', () => {
    const { result } = renderHook(() => useLocalStorage('bool-key', false))

    act(() => {
      result.current[1](true)
    })

    expect(result.current[0]).toBe(true)
    expect(localStorage.setItem).toHaveBeenCalledWith('bool-key', 'true')
  })

  it('handles number values', () => {
    const { result } = renderHook(() => useLocalStorage('num-key', 42))

    act(() => {
      result.current[1](100)
    })

    expect(result.current[0]).toBe(100)
  })
})
