import type { LoginCredentials, Part, QuantityAdjustment } from '@/types';

export interface ValidationError {
  field: string;
  message: string;
}

export function validateLoginCredentials(creds: LoginCredentials): ValidationError[] {
  const errors: ValidationError[] = [];
  
  if (!creds.username?.trim()) {
    errors.push({ field: 'username', message: 'Username is required' });
  }
  
  if (!creds.password?.trim()) {
    errors.push({ field: 'password', message: 'Password is required' });
  }
  
  return errors;
}

export function validatePart(part: Partial<Part>): ValidationError[] {
  const errors: ValidationError[] = [];
  
  if (!part.name?.trim()) {
    errors.push({ field: 'name', message: 'Name is required' });
  }
  
  if (!part.category?.trim()) {
    errors.push({ field: 'category', message: 'Category is required' });
  }
  
  if (part.quantity === undefined || part.quantity < 0) {
    errors.push({ field: 'quantity', message: 'Quantity must be 0 or greater' });
  }
  
  if (part.min_quantity === undefined || part.min_quantity < 0) {
    errors.push({ field: 'min_quantity', message: 'Min quantity must be 0 or greater' });
  }
  
  if (part.lead_time_days === undefined || part.lead_time_days < 0) {
    errors.push({ field: 'lead_time_days', message: 'Lead time must be 0 or greater' });
  }
  
  if (part.unit_cost !== undefined && part.unit_cost < 0) {
    errors.push({ field: 'unit_cost', message: 'Unit cost must be 0 or greater' });
  }
  
  if (part.wear_rating !== undefined && (part.wear_rating < 0 || part.wear_rating > 10)) {
    errors.push({ field: 'wear_rating', message: 'Wear rating must be between 0 and 10' });
  }
  
  return errors;
}

export function validateQuantityAdjustment(adjustment: QuantityAdjustment): ValidationError[] {
  const errors: ValidationError[] = [];
  
  if (adjustment.change_amount === 0) {
    errors.push({ field: 'change_amount', message: 'Change amount cannot be zero' });
  }
  
  if (!adjustment.reason?.trim()) {
    errors.push({ field: 'reason', message: 'Reason is required' });
  }
  
  if (adjustment.reason && adjustment.reason.length < 3) {
    errors.push({ field: 'reason', message: 'Reason must be at least 3 characters' });
  }
  
  return errors;
}

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function isPositiveNumber(value: unknown): value is number {
  return typeof value === 'number' && !isNaN(value) && value >= 0;
}

export function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}
