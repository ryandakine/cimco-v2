import { describe, it, expect } from 'vitest'

// Import types to ensure they compile correctly
import type {
  UserRole,
  User,
  Part,
  PaginatedResponse,
  PartsQueryParams,
  QuantityAdjustment,
  LoginCredentials,
  AuthResponse,
  StockState,
  DashboardStats,
  AdjustmentLog,
} from '@/types'

describe('Types', () => {
  it('exports UserRole type', () => {
    const role: UserRole = 'admin'
    expect(role).toBe('admin')
  })

  it('exports User type', () => {
    const user: User = {
      id: 1,
      username: 'test',
      role: 'admin',
      created_at: '2024-01-01',
    }
    expect(user.id).toBe(1)
  })

  it('exports Part type', () => {
    const part: Part = {
      id: 1,
      name: 'Test Part',
      category: 'Test',
      quantity: 10,
      min_quantity: 5,
      lead_time_days: 7,
      tracked: false,
      created_at: '2024-01-01',
      updated_at: '2024-01-01',
    }
    expect(part.name).toBe('Test Part')
  })

  it('exports PaginatedResponse type', () => {
    const response: PaginatedResponse<Part> = {
      items: [],
      total: 0,
      page: 1,
      page_size: 10,
      total_pages: 0,
    }
    expect(response.page).toBe(1)
  })

  it('exports PartsQueryParams type', () => {
    const params: PartsQueryParams = {
      page: 1,
      search: 'test',
    }
    expect(params.page).toBe(1)
  })

  it('exports QuantityAdjustment type', () => {
    const adjustment: QuantityAdjustment = {
      part_id: 1,
      change_amount: 5,
      reason: 'Test',
    }
    expect(adjustment.part_id).toBe(1)
  })

  it('exports LoginCredentials type', () => {
    const creds: LoginCredentials = {
      username: 'admin',
      password: 'secret',
    }
    expect(creds.username).toBe('admin')
  })

  it('exports AuthResponse type', () => {
    const response: AuthResponse = {
      access_token: 'token',
      token_type: 'bearer',
      user: {
        id: 1,
        username: 'admin',
        role: 'admin',
        created_at: '2024-01-01',
      },
    }
    expect(response.access_token).toBe('token')
  })

  it('exports StockState type', () => {
    const state: StockState = 'in_stock'
    expect(state).toBe('in_stock')
  })

  it('exports DashboardStats type', () => {
    const stats: DashboardStats = {
      total_parts: 100,
      low_stock_count: 5,
      out_of_stock_count: 2,
      tracked_parts_count: 50,
      recent_adjustments: [],
    }
    expect(stats.total_parts).toBe(100)
  })

  it('exports AdjustmentLog type', () => {
    const log: AdjustmentLog = {
      id: 1,
      part_id: 1,
      part_name: 'Test',
      previous_quantity: 10,
      new_quantity: 15,
      change_amount: 5,
      reason: 'Restock',
      adjusted_by: 'admin',
      adjusted_at: '2024-01-01',
    }
    expect(log.id).toBe(1)
  })
})
