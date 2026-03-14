import type { Part, PaginatedResponse, DashboardStats, AdjustmentLog } from '@/types'

export const mockPart: Part = {
  id: 1,
  name: 'Hydraulic Cylinder',
  description: 'Main hydraulic cylinder for shredder',
  category: 'Shredder',
  part_type: 'Hydraulic',
  manufacturer: 'CIMCO',
  part_number: 'HC-001',
  quantity: 15,
  min_quantity: 5,
  lead_time_days: 14,
  location: 'Shelf A-1',
  machine_location: 'Shredder #1',
  function_description: 'Provides hydraulic pressure',
  zone: 'Main Warehouse',
  bom_reference: 'BOM-001',
  yard_label: 'YARD-001',
  unit_cost: 250.00,
  supplier: 'Hydraulic Solutions',
  wear_rating: 7,
  tracked: true,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-03-13T12:00:00Z',
}

export const mockPartLowStock: Part = {
  ...mockPart,
  id: 2,
  name: 'Bearing',
  quantity: 3,
  min_quantity: 5,
}

export const mockPartOutOfStock: Part = {
  ...mockPart,
  id: 3,
  name: 'Gear Belt',
  quantity: 0,
  min_quantity: 2,
}

export const mockPartUntracked: Part = {
  ...mockPart,
  id: 4,
  name: 'Fasteners',
  tracked: false,
}

export const mockParts: Part[] = [
  mockPart,
  mockPartLowStock,
  mockPartOutOfStock,
  mockPartUntracked,
  {
    ...mockPart,
    id: 5,
    name: 'Control Panel',
    category: 'Electrical',
    quantity: 8,
  },
  {
    ...mockPart,
    id: 6,
    name: 'Motor',
    category: 'Electrical',
    quantity: 12,
  },
]

export const mockPaginatedParts: PaginatedResponse<Part> = {
  items: mockParts,
  total: 100,
  page: 1,
  page_size: 10,
  total_pages: 10,
}

export const mockDashboardStats: DashboardStats = {
  total_parts: 150,
  low_stock_count: 12,
  out_of_stock_count: 5,
  tracked_parts_count: 89,
  recent_adjustments: [
    {
      id: 1,
      part_id: 1,
      part_name: 'Hydraulic Cylinder',
      previous_quantity: 10,
      new_quantity: 15,
      change_amount: 5,
      reason: 'Restocked from supplier',
      adjusted_by: 'admin',
      adjusted_at: '2024-03-13T10:00:00Z',
    },
    {
      id: 2,
      part_id: 2,
      part_name: 'Bearing',
      previous_quantity: 5,
      new_quantity: 3,
      change_amount: -2,
      reason: 'Used for maintenance',
      adjusted_by: 'worker',
      adjusted_at: '2024-03-12T14:30:00Z',
    },
  ],
}

export const mockAdjustmentLog: AdjustmentLog = {
  id: 1,
  part_id: 1,
  part_name: 'Hydraulic Cylinder',
  previous_quantity: 10,
  new_quantity: 15,
  change_amount: 5,
  reason: 'Restocked from supplier',
  adjusted_by: 'admin',
  adjusted_at: '2024-03-13T10:00:00Z',
}

export const mockCategories = ['Shredder', 'Electrical', 'Hydraulic', 'Mechanical']
export const mockZones = ['Main Warehouse', 'Storage A', 'Storage B']
export const mockManufacturers = ['CIMCO', 'Bosch', 'Siemens']
