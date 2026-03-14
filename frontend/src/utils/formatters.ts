import { format, formatDistanceToNow, parseISO } from 'date-fns';
import type { Part, StockState } from '@/types';

export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'MMM d, yyyy');
}

export function formatDateTime(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'MMM d, yyyy h:mm a');
}

export function formatRelativeTime(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return formatDistanceToNow(d, { addSuffix: true });
}

export function formatCurrency(amount: number | undefined): string {
  if (amount === undefined || amount === null) return '-';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

export function formatNumber(num: number | undefined): string {
  if (num === undefined || num === null) return '-';
  return new Intl.NumberFormat('en-US').format(num);
}

export function getStockState(part: Part): StockState {
  if (part.quantity === 0) return 'out_of_stock';
  if (part.quantity <= part.min_quantity) return 'low_stock';
  return 'in_stock';
}

export function getStockStateLabel(state: StockState): string {
  switch (state) {
    case 'in_stock':
      return 'In Stock';
    case 'low_stock':
      return 'Low Stock';
    case 'out_of_stock':
      return 'Out of Stock';
    default:
      return 'Unknown';
  }
}

export function getStockStateColor(state: StockState): string {
  switch (state) {
    case 'in_stock':
      return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
    case 'low_stock':
      return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
    case 'out_of_stock':
      return 'text-red-400 bg-red-400/10 border-red-400/20';
    default:
      return 'text-slate-400 bg-slate-400/10 border-slate-400/20';
  }
}

export function getQuantityColor(quantity: number, minQuantity: number): string {
  if (quantity === 0) return 'text-red-400';
  if (quantity <= minQuantity) return 'text-amber-400';
  return 'text-emerald-400';
}

export function truncateText(text: string | undefined, maxLength: number): string {
  if (!text) return '-';
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

export function toCSV<T extends Record<string, unknown>>(data: T[], headers?: Record<keyof T, string>): string {
  if (data.length === 0) return '';
  
  const keys = Object.keys(data[0]) as (keyof T)[];
  const headerRow = headers 
    ? keys.map(k => headers[k] || String(k)).join(',')
    : keys.join(',');
  
  const rows = data.map(row => 
    keys.map(key => {
      const value = row[key];
      if (value === null || value === undefined) return '';
      const str = String(value);
      // Escape quotes and wrap in quotes if contains comma or newline
      if (str.includes(',') || str.includes('\n') || str.includes('"')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    }).join(',')
  );
  
  return [headerRow, ...rows].join('\n');
}

export function downloadCSV(csv: string, filename: string): void {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
}
