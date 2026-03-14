import { describe, it, expect, vi } from 'vitest'
import { inventoryApi } from '@/api/inventory.api'

// Mock the apiClient
vi.mock('@/api/client', () => ({
  apiClient: {
    get: vi.fn().mockResolvedValue({}),
    post: vi.fn().mockResolvedValue({}),
    put: vi.fn().mockResolvedValue({}),
    delete: vi.fn().mockResolvedValue({}),
  },
}))

describe('inventoryApi', () => {
  it('exports getParts function', () => {
    expect(typeof inventoryApi.getParts).toBe('function')
  })

  it('exports getPart function', () => {
    expect(typeof inventoryApi.getPart).toBe('function')
  })

  it('exports createPart function', () => {
    expect(typeof inventoryApi.createPart).toBe('function')
  })

  it('exports updatePart function', () => {
    expect(typeof inventoryApi.updatePart).toBe('function')
  })

  it('exports deletePart function', () => {
    expect(typeof inventoryApi.deletePart).toBe('function')
  })

  it('exports adjustQuantity function', () => {
    expect(typeof inventoryApi.adjustQuantity).toBe('function')
  })

  it('exports getCategories function', () => {
    expect(typeof inventoryApi.getCategories).toBe('function')
  })

  it('exports getZones function', () => {
    expect(typeof inventoryApi.getZones).toBe('function')
  })

  it('exports getManufacturers function', () => {
    expect(typeof inventoryApi.getManufacturers).toBe('function')
  })

  it('exports getDashboardStats function', () => {
    expect(typeof inventoryApi.getDashboardStats).toBe('function')
  })

  it('exports getAdjustmentLogs function', () => {
    expect(typeof inventoryApi.getAdjustmentLogs).toBe('function')
  })

  it('exports exportParts function', () => {
    expect(typeof inventoryApi.exportParts).toBe('function')
  })
})

describe('buildQueryString', () => {
  it('handles empty params', async () => {
    await inventoryApi.getParts({})
    // Should not throw
  })

  it('handles params with values', async () => {
    await inventoryApi.getParts({ category: 'Shredder', page: 1 })
    // Should not throw
  })

  it('handles undefined values', async () => {
    await inventoryApi.getParts({ category: undefined, page: 1 })
    // Should not throw
  })
})
