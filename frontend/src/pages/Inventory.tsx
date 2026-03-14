import { useState, useCallback, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Plus, Download, Package, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Pagination } from '@/components/Pagination';
import { PartsTable } from '@/features/inventory/PartsTable';
import { PartFilters } from '@/features/inventory/PartFilters';
import { QuantityAdjustModal } from '@/features/inventory/QuantityAdjustModal';
import { useParts, useDeletePart } from '@/features/inventory/useParts';
import { useIsAdmin } from '@/features/auth/useAuth';
import { inventoryApi } from '@/features/inventory/inventory.api';
import { toCSV, downloadCSV } from '@/utils/formatters';
import type { Part, PartsQueryParams } from '@/types';

const DEFAULT_PAGE_SIZE = 25;

export function Inventory() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const isAdmin = useIsAdmin();
  
  // Modal state
  const [selectedPart, setSelectedPart] = useState<Part | null>(null);
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  
  // Search input state (debounced)
  const [searchInput, setSearchInput] = useState('');
  
  // Filters state
  const [filters, setFilters] = useState<PartsQueryParams>({
    page: parseInt(searchParams.get('page') || '1'),
    page_size: parseInt(searchParams.get('page_size') || String(DEFAULT_PAGE_SIZE)),
    sort_by: searchParams.get('sort_by') || 'name',
    sort_order: (searchParams.get('sort_order') as 'asc' | 'desc') || 'asc',
    search: searchParams.get('search') || undefined,
    category: searchParams.get('category') || undefined,
    zone: searchParams.get('zone') || undefined,
    manufacturer: searchParams.get('manufacturer') || undefined,
    stock_state: (searchParams.get('stock_state') as PartsQueryParams['stock_state']) || undefined,
    tracked: searchParams.get('tracked') === 'true' ? true : undefined,
  });

  // Update search input when filters change
  useEffect(() => {
    setSearchInput(filters.search || '');
  }, [filters.search]);

  // Debounced search
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (searchInput !== (filters.search || '')) {
        handleFilterChange({ ...filters, search: searchInput || undefined });
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [searchInput]);

  // Fetch parts
  const { data, isLoading, error } = useParts(filters);
  
  // Delete mutation
  const deletePart = useDeletePart();

  // Update URL when filters change
  const updateSearchParams = useCallback((newFilters: PartsQueryParams) => {
    const params = new URLSearchParams();
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.set(key, String(value));
      }
    });
    setSearchParams(params);
  }, [setSearchParams]);

  const handleFilterChange = useCallback((newFilters: PartsQueryParams) => {
    setFilters(newFilters);
    updateSearchParams(newFilters);
  }, [updateSearchParams]);

  const handlePageChange = (page: number) => {
    handleFilterChange({ ...filters, page });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSort = (field: string) => {
    const newOrder = filters.sort_by === field && filters.sort_order === 'asc' ? 'desc' : 'asc';
    handleFilterChange({ ...filters, sort_by: field, sort_order: newOrder });
  };

  const handleView = (part: Part) => {
    navigate(`/inventory/${part.id}`);
  };

  const handleEdit = (part: Part) => {
    navigate(`/inventory/${part.id}/edit`);
  };

  const handleAdjust = (part: Part) => {
    setSelectedPart(part);
    setIsAdjustModalOpen(true);
  };

  const handleDelete = async (part: Part) => {
    if (window.confirm(`Are you sure you want to delete "${part.name}"?`)) {
      try {
        await deletePart.mutateAsync(part.id);
      } catch {
        // Error handled by mutation
      }
    }
  };

  const handleExport = async () => {
    try {
      // Fetch all parts for export
      const exportData = await inventoryApi.getParts({
        ...filters,
        page: 1,
        page_size: 10000, // Get all
      });
      
      const csv = toCSV(exportData.items, {
        name: 'Name',
        part_number: 'Part Number',
        category: 'Category',
        quantity: 'Quantity',
        min_quantity: 'Min Quantity',
        location: 'Location',
        manufacturer: 'Manufacturer',
        supplier: 'Supplier',
        zone: 'Zone',
        tracked: 'Tracked',
      });
      
      downloadCSV(csv, `cimco-parts-${new Date().toISOString().split('T')[0]}.csv`);
    } catch {
      alert('Failed to export data');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Parts Inventory</h1>
          <p className="text-slate-400 mt-1">
            {data ? `${data.total} part${data.total !== 1 ? 's' : ''} found` : 'Loading...'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            onClick={handleExport}
            leftIcon={<Download className="h-4 w-4" />}
          >
            Export CSV
          </Button>
          {isAdmin && (
            <Button
              variant="primary"
              onClick={() => navigate('/inventory/new')}
              leftIcon={<Plus className="h-4 w-4" />}
            >
              Add Part
            </Button>
          )}
        </div>
      </div>

      {/* Filters */}
      <PartFilters
        filters={filters}
        onChange={handleFilterChange}
        onSearch={setSearchInput}
        searchValue={searchInput}
      />

      {/* Error State */}
      {error && (
        <Card className="p-8 text-center">
          <AlertTriangle className="h-12 w-12 mx-auto text-red-400 mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">Error loading parts</h3>
          <p className="text-slate-400 mb-4">{(error as Error).message}</p>
          <Button variant="secondary" onClick={() => window.location.reload()}>
            Retry
          </Button>
        </Card>
      )}

      {/* Parts Table */}
      {!error && (
        <Card>
          <PartsTable
            parts={data?.items || []}
            sortBy={filters.sort_by}
            sortOrder={filters.sort_order}
            onSort={handleSort}
            onView={handleView}
            onEdit={handleEdit}
            onAdjust={handleAdjust}
            onDelete={handleDelete}
            isLoading={isLoading}
          />
        </Card>
      )}

      {/* Pagination */}
      {data && data.total_pages > 0 && (
        <Card className="p-4">
          <Pagination
            currentPage={data.page}
            totalPages={data.total_pages}
            totalItems={data.total}
            onPageChange={handlePageChange}
          />
        </Card>
      )}

      {/* Adjust Quantity Modal */}
      <QuantityAdjustModal
        part={selectedPart}
        isOpen={isAdjustModalOpen}
        onClose={() => {
          setIsAdjustModalOpen(false);
          setSelectedPart(null);
        }}
      />
    </div>
  );
}
