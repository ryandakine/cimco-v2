import { apiClient } from './client';
import type { 
  Part, 
  PaginatedResponse, 
  PartsQueryParams, 
  QuantityAdjustment, 
  DashboardStats,
  AdjustmentLog
} from '@/types';

function buildQueryString(params: PartsQueryParams): string {
  const searchParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, String(value));
    }
  });
  
  const query = searchParams.toString();
  return query ? `?${query}` : '';
}

export const inventoryApi = {
  getParts: (params: PartsQueryParams = {}): Promise<PaginatedResponse<Part>> =>
    apiClient.get<PaginatedResponse<Part>>(`/parts${buildQueryString(params)}`),

  getPart: (id: number): Promise<Part> =>
    apiClient.get<Part>(`/parts/${id}`),

  createPart: (part: Omit<Part, 'id' | 'created_at' | 'updated_at'>): Promise<Part> =>
    apiClient.post<Part>('/parts', part),

  updatePart: (id: number, part: Partial<Part>): Promise<Part> =>
    apiClient.put<Part>(`/parts/${id}`, part),

  deletePart: (id: number): Promise<void> =>
    apiClient.delete<void>(`/parts/${id}`),

  adjustQuantity: (adjustment: QuantityAdjustment): Promise<Part> =>
    apiClient.post<Part>(`/parts/${adjustment.part_id}/adjust`, {
      change_amount: adjustment.change_amount,
      reason: adjustment.reason,
    }),

  getCategories: (): Promise<string[]> =>
    apiClient.get<string[]>('/parts/categories'),

  getZones: (): Promise<string[]> =>
    apiClient.get<string[]>('/parts/zones'),

  getManufacturers: (): Promise<string[]> =>
    apiClient.get<string[]>('/parts/manufacturers'),

  getDashboardStats: (): Promise<DashboardStats> =>
    apiClient.get<DashboardStats>('/dashboard/stats'),

  getAdjustmentLogs: (partId?: number, limit = 50): Promise<AdjustmentLog[]> =>
    apiClient.get<AdjustmentLog[]>(`/adjustments?${partId ? `part_id=${partId}&` : ''}limit=${limit}`),

  exportParts: (params: PartsQueryParams = {}): Promise<Blob> =>
    apiClient.get<Blob>(`/parts/export${buildQueryString(params)}`, {
      responseType: 'blob',
    }),
};
