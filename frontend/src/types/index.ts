export type UserRole = 'admin' | 'worker';

export interface User {
  id: number;
  username: string;
  role: UserRole;
  created_at: string;
}

export interface Part {
  id: number;
  name: string;
  description?: string;
  category: string;
  part_type?: string;
  manufacturer?: string;
  part_number?: string;
  quantity: number;
  min_quantity: number;
  lead_time_days: number;
  location?: string;
  machine_location?: string;
  function_description?: string;
  zone?: string;
  bom_reference?: string;
  yard_label?: string;
  image_url?: string;
  unit_cost?: number;
  supplier?: string;
  wear_rating?: number;
  tracked: boolean;
  created_at: string;
  updated_at: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface PartsQueryParams {
  search?: string;
  category?: string;
  zone?: string;
  manufacturer?: string;
  stock_state?: 'in_stock' | 'low_stock' | 'out_of_stock';
  tracked?: boolean;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  page?: number;
  page_size?: number;
}

export interface QuantityAdjustment {
  part_id: number;
  change_amount: number;
  reason: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export type StockState = 'in_stock' | 'low_stock' | 'out_of_stock';

export interface DashboardStats {
  total_parts: number;
  low_stock_count: number;
  out_of_stock_count: number;
  tracked_parts_count: number;
  recent_adjustments: AdjustmentLog[];
}

export interface AdjustmentLog {
  id: number;
  part_id: number;
  part_name: string;
  previous_quantity: number;
  new_quantity: number;
  change_amount: number;
  reason: string;
  adjusted_by: string;
  adjusted_at: string;
}
