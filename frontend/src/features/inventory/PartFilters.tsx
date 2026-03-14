import { Search, Filter, X } from 'lucide-react';
import { Input } from '@/components/Input';
import { Select } from '@/components/Select';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { useCategories, useZones, useManufacturers } from './useParts';
import { useIsAdmin } from '@/features/auth/useAuth';
import type { PartsQueryParams } from '@/types';

interface PartFiltersProps {
  filters: PartsQueryParams;
  onChange: (filters: PartsQueryParams) => void;
  onSearch: (search: string) => void;
  searchValue: string;
}

const stockStateOptions = [
  { value: '', label: 'All Stock States' },
  { value: 'in_stock', label: 'In Stock' },
  { value: 'low_stock', label: 'Low Stock' },
  { value: 'out_of_stock', label: 'Out of Stock' },
];

const sortByOptions = [
  { value: 'name', label: 'Name' },
  { value: 'category', label: 'Category' },
  { value: 'quantity', label: 'Quantity' },
  { value: 'created_at', label: 'Date Created' },
  { value: 'updated_at', label: 'Last Updated' },
];

const sortOrderOptions = [
  { value: 'asc', label: 'Ascending' },
  { value: 'desc', label: 'Descending' },
];

const pageSizeOptions = [
  { value: '10', label: '10 rows' },
  { value: '25', label: '25 rows' },
  { value: '50', label: '50 rows' },
  { value: '100', label: '100 rows' },
];

export function PartFilters({ filters, onChange, onSearch, searchValue }: PartFiltersProps) {
  const isAdmin = useIsAdmin();
  const { data: categories = [] } = useCategories();
  const { data: zones = [] } = useZones();
  const { data: manufacturers = [] } = useManufacturers();

  const categoryOptions = [
    { value: '', label: 'All Categories' },
    ...categories.map(c => ({ value: c, label: c })),
  ];

  const zoneOptions = [
    { value: '', label: 'All Zones' },
    ...zones.map(z => ({ value: z, label: z })),
  ];

  const manufacturerOptions = [
    { value: '', label: 'All Manufacturers' },
    ...manufacturers.map(m => ({ value: m, label: m })),
  ];

  const handleFilterChange = (key: keyof PartsQueryParams, value: string | boolean | undefined) => {
    onChange({
      ...filters,
      [key]: value || undefined,
      page: 1, // Reset to first page on filter change
    });
  };

  const handleClearFilters = () => {
    onChange({
      search: undefined,
      category: undefined,
      zone: undefined,
      manufacturer: undefined,
      stock_state: undefined,
      tracked: undefined,
      sort_by: 'name',
      sort_order: 'asc',
      page: 1,
      page_size: 25,
    });
    onSearch('');
  };

  const hasActiveFilters = 
    filters.category || 
    filters.zone || 
    filters.manufacturer || 
    filters.stock_state ||
    filters.tracked !== undefined;

  return (
    <Card className="p-4 space-y-4">
      {/* Search Row */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search parts by name, number, description..."
              value={searchValue}
              onChange={(e) => onSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500"
            />
            {searchValue && (
              <button
                onClick={() => onSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
        
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearFilters}
            className="flex-shrink-0"
          >
            <X className="h-4 w-4 mr-1" />
            Clear Filters
          </Button>
        )}
      </div>

      {/* Filter Row */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 text-slate-400 text-sm">
          <Filter className="h-4 w-4" />
          <span>Filters:</span>
        </div>

        <Select
          value={filters.category || ''}
          onChange={(value) => handleFilterChange('category', value || undefined)}
          options={categoryOptions}
          size="sm"
          className="w-40"
        />

        <Select
          value={filters.zone || ''}
          onChange={(value) => handleFilterChange('zone', value || undefined)}
          options={zoneOptions}
          size="sm"
          className="w-36"
        />

        <Select
          value={filters.stock_state || ''}
          onChange={(value) => handleFilterChange('stock_state', value as PartsQueryParams['stock_state'] || undefined)}
          options={stockStateOptions}
          size="sm"
          className="w-36"
        />

        {isAdmin && (
          <Select
            value={filters.tracked !== undefined ? String(filters.tracked) : ''}
            onChange={(value) => handleFilterChange('tracked', value === '' ? undefined : value === 'true')}
            options={[
              { value: '', label: 'All Parts' },
              { value: 'true', label: 'Tracked Only' },
              { value: 'false', label: 'Untracked Only' },
            ]}
            size="sm"
            className="w-36"
          />
        )}
      </div>

      {/* Sort and Page Size Row */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-700">
        <div className="flex items-center gap-3">
          <span className="text-sm text-slate-400">Sort by:</span>
          <Select
            value={filters.sort_by || 'name'}
            onChange={(value) => handleFilterChange('sort_by', value)}
            options={sortByOptions}
            size="sm"
            className="w-32"
          />
          <Select
            value={filters.sort_order || 'asc'}
            onChange={(value) => handleFilterChange('sort_order', value as 'asc' | 'desc')}
            options={sortOrderOptions}
            size="sm"
            className="w-28"
          />
        </div>

        <div className="flex items-center gap-3">
          <span className="text-sm text-slate-400">Show:</span>
          <Select
            value={String(filters.page_size || 25)}
            onChange={(value) => handleFilterChange('page_size', parseInt(value))}
            options={pageSizeOptions}
            size="sm"
            className="w-24"
          />
        </div>
      </div>
    </Card>
  );
}
