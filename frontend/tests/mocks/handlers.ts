import { http, HttpResponse } from 'msw'
import {
  mockAuthResponse,
  mockUser,
  mockParts,
  mockPaginatedParts,
  mockDashboardStats,
  mockCategories,
  mockZones,
  mockManufacturers,
} from '../fixtures/parts'

export const handlers = [
  // Health check
  http.get('/api/v2/health', () => {
    return HttpResponse.json({ status: 'healthy' })
  }),

  // Auth endpoints
  http.post('/api/v2/auth/login', async ({ request }) => {
    const body = await request.json() as { username: string; password: string }
    if (body.username === 'admin' && body.password === 'admin123') {
      return HttpResponse.json(mockAuthResponse)
    }
    return new HttpResponse(null, { status: 401 })
  }),

  http.post('/api/v2/auth/logout', () => {
    return HttpResponse.json({ success: true })
  }),

  http.get('/api/v2/auth/me', () => {
    return HttpResponse.json(mockUser)
  }),

  http.post('/api/v2/auth/refresh', () => {
    return HttpResponse.json({ access_token: 'new-mock-token' })
  }),

  // Parts endpoints
  http.get('/api/v2/parts', ({ request }) => {
    const url = new URL(request.url)
    const page = parseInt(url.searchParams.get('page') || '1')
    const pageSize = parseInt(url.searchParams.get('page_size') || '10')
    const search = url.searchParams.get('search') || ''
    const category = url.searchParams.get('category')
    const stockState = url.searchParams.get('stock_state')

    let filteredParts = [...mockParts]

    if (search) {
      filteredParts = filteredParts.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase())
      )
    }

    if (category) {
      filteredParts = filteredParts.filter(p => p.category === category)
    }

    if (stockState) {
      filteredParts = filteredParts.filter(p => {
        if (stockState === 'out_of_stock') return p.quantity === 0
        if (stockState === 'low_stock') return p.quantity > 0 && p.quantity <= p.min_quantity
        if (stockState === 'in_stock') return p.quantity > p.min_quantity
        return true
      })
    }

    return HttpResponse.json({
      items: filteredParts.slice(0, pageSize),
      total: filteredParts.length,
      page,
      page_size: pageSize,
      total_pages: Math.ceil(filteredParts.length / pageSize),
    })
  }),

  http.get('/api/v2/parts/:id', ({ params }) => {
    const id = parseInt(params.id as string)
    const part = mockParts.find(p => p.id === id)
    if (part) {
      return HttpResponse.json(part)
    }
    return new HttpResponse(null, { status: 404 })
  }),

  http.post('/api/v2/parts', async ({ request }) => {
    const body = await request.json() as Record<string, unknown>
    return HttpResponse.json({
      id: 999,
      ...body,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }, { status: 201 })
  }),

  http.put('/api/v2/parts/:id', async ({ params, request }) => {
    const id = parseInt(params.id as string)
    const body = await request.json() as Record<string, unknown>
    const part = mockParts.find(p => p.id === id)
    if (part) {
      return HttpResponse.json({ ...part, ...body })
    }
    return new HttpResponse(null, { status: 404 })
  }),

  http.delete('/api/v2/parts/:id', ({ params }) => {
    const id = parseInt(params.id as string)
    const part = mockParts.find(p => p.id === id)
    if (part) {
      return new HttpResponse(null, { status: 204 })
    }
    return new HttpResponse(null, { status: 404 })
  }),

  http.post('/api/v2/parts/:id/adjust', async ({ params, request }) => {
    const id = parseInt(params.id as string)
    const body = await request.json() as { change_amount: number; reason: string }
    const part = mockParts.find(p => p.id === id)
    if (part) {
      return HttpResponse.json({
        ...part,
        quantity: part.quantity + body.change_amount,
      })
    }
    return new HttpResponse(null, { status: 404 })
  }),

  http.get('/api/v2/parts/categories', () => {
    return HttpResponse.json(mockCategories)
  }),

  http.get('/api/v2/parts/zones', () => {
    return HttpResponse.json(mockZones)
  }),

  http.get('/api/v2/parts/manufacturers', () => {
    return HttpResponse.json(mockManufacturers)
  }),

  // Dashboard
  http.get('/api/v2/dashboard/stats', () => {
    return HttpResponse.json(mockDashboardStats)
  }),

  // Adjustments
  http.get('/api/v2/adjustments', ({ request }) => {
    const url = new URL(request.url)
    const partId = url.searchParams.get('part_id')
    const limit = parseInt(url.searchParams.get('limit') || '50')

    let adjustments = mockDashboardStats.recent_adjustments
    if (partId) {
      adjustments = adjustments.filter(a => a.part_id === parseInt(partId))
    }

    return HttpResponse.json(adjustments.slice(0, limit))
  }),
]
