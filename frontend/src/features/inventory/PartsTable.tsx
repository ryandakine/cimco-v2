import { useState } from 'react';
import { ArrowUpDown, Package, MapPin, Wrench, Trash2, Edit, PlusMinus } from 'lucide-react';
import { Table, TableHead, TableBody, TableRow, TableCell, TableHeader } from '@/components/Table';
import { Badge } from '@/components/Badge';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { useIsAdmin } from '@/features/auth/useAuth';
import { formatNumber, getStockState, getStockStateLabel, getQuantityColor } from '@/utils/formatters';
import type { Part, PartsQueryParams } from '@/types';

interface PartsTableProps {
  parts: Part[];
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  onSort?: (field: string) => void;
  onView?: (part: Part) => void;
  onEdit?: (part: Part) => void;
  onAdjust?: (part: Part) => void;
  onDelete?: (part: Part) => void;
  isLoading?: boolean;
}

export function PartsTable({
  parts,
  sortBy,
  sortOrder,
  onSort,
  onView,
  onEdit,
  onAdjust,
  onDelete,
  isLoading,
}: PartsTableProps) {
  const isAdmin = useIsAdmin();

  const handleSort = (field: string) => {
    onSort?.(field);
  };

  const SortIcon = ({ field }: { field: string }) => {
    if (sortBy !== field) {
      return <ArrowUpDown className="h-4 w-4 text-slate-500" />;
    }
    return (
      <ArrowUpDown 
        className={`h-4 w-4 ${sortOrder === 'asc' ? 'text-cyan-400' : 'text-cyan-400 rotate-180'}`} 
      />
    );
  };

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-16 bg-slate-800 rounded-lg" />
        ))}
      </div>
    );
  }

  if (parts.length === 0) {
    return (
      <Card className="p-12 text-center">
        <Package className="h-12 w-12 mx-auto text-slate-500 mb-4" />
        <h3 className="text-lg font-medium text-white mb-2">No parts found</h3>
        <p className="text-slate-400">Try adjusting your search or filters</p>
      </Card>
    );
  }

  // Desktop Table View
  const TableView = () => (
    <div className="hidden md:block overflow-x-auto">
      <Table>
        <TableHead>
          <TableRow>
            <TableHeader onClick={() => handleSort('name')} className="cursor-pointer">
              <div className="flex items-center gap-2">
                Part Name
                <SortIcon field="name" />
              </div>
            </TableHeader>
            <TableHeader onClick={() => handleSort('part_number')} className="cursor-pointer">
              <div className="flex items-center gap-2">
                Part #
                <SortIcon field="part_number" />
              </div>
            </TableHeader>
            <TableHeader onClick={() => handleSort('category')} className="cursor-pointer">
              <div className="flex items-center gap-2">
                Category
                <SortIcon field="category" />
              </div>
            </TableHeader>
            <TableHeader onClick={() => handleSort('quantity')} className="cursor-pointer">
              <div className="flex items-center gap-2">
                Quantity
                <SortIcon field="quantity" />
              </div>
            </TableHeader>
            <TableHeader onClick={() => handleSort('location')} className="cursor-pointer">
              <div className="flex items-center gap-2">
                Location
                <SortIcon field="location" />
              </div>
            </TableHeader>
            <TableHeader>Status</TableHeader>
            <TableHeader className="text-right">Actions</TableHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          {parts.map((part) => {
            const stockState = getStockState(part);
            return (
              <TableRow key={part.id}>
                <TableCell>
                  <div className="font-medium text-white">{part.name}</div>
                  {part.tracked && (
                    <Badge variant="info" size="sm" className="mt-1">Tracked</Badge>
                  )}
                </TableCell>
                <TableCell className="text-slate-300">
                  {part.part_number || '-'}
                </TableCell>
                <TableCell className="text-slate-300">
                  {part.category}
                </TableCell>
                <TableCell>
                  <div className={`font-medium ${getQuantityColor(part.quantity, part.min_quantity)}`}>
                    {formatNumber(part.quantity)}
                  </div>
                  <div className="text-xs text-slate-500">
                    Min: {part.min_quantity}
                  </div>
                </TableCell>
                <TableCell className="text-slate-300">
                  {part.location || '-'}
                </TableCell>
                <TableCell>
                  <Badge variant={
                    stockState === 'in_stock' ? 'success' :
                    stockState === 'low_stock' ? 'warning' : 'danger'
                  }>
                    {getStockStateLabel(stockState)}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onView?.(part)}
                      title="View"
                    >
                      <Package className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onAdjust?.(part)}
                      title="Adjust Quantity"
                    >
                      <PlusMinus className="h-4 w-4" />
                    </Button>
                    {isAdmin && (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEdit?.(part)}
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDelete?.(part)}
                          title="Delete"
                          className="text-red-400 hover:text-red-300"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );

  // Mobile Card View
  const CardView = () => (
    <div className="md:hidden space-y-4">
      {parts.map((part) => {
        const stockState = getStockState(part);
        return (
          <Card key={part.id} className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-medium text-white">{part.name}</h3>
                {part.part_number && (
                  <p className="text-sm text-slate-400">#{part.part_number}</p>
                )}
              </div>
              <Badge variant={
                stockState === 'in_stock' ? 'success' :
                stockState === 'low_stock' ? 'warning' : 'danger'
              }>
                {getStockStateLabel(stockState)}
              </Badge>
            </div>
            
            <div className="grid grid-cols-2 gap-3 text-sm mb-4">
              <div>
                <p className="text-slate-500">Category</p>
                <p className="text-slate-300">{part.category}</p>
              </div>
              <div>
                <p className="text-slate-500">Quantity</p>
                <p className={getQuantityColor(part.quantity, part.min_quantity)}>
                  {formatNumber(part.quantity)}
                  <span className="text-xs text-slate-500 ml-1">
                    (min: {part.min_quantity})
                  </span>
                </p>
              </div>
              {part.location && (
                <div className="col-span-2">
                  <p className="text-slate-500 flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    Location
                  </p>
                  <p className="text-slate-300">{part.location}</p>
                </div>
              )}
            </div>

            {part.tracked && (
              <div className="mb-3">
                <Badge variant="info" size="sm">Tracked</Badge>
              </div>
            )}

            <div className="flex items-center gap-2 pt-3 border-t border-slate-700">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => onView?.(part)}
                className="flex-1"
              >
                <Package className="h-4 w-4 mr-1" />
                View
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => onAdjust?.(part)}
                className="flex-1"
              >
                <PlusMinus className="h-4 w-4 mr-1" />
                Adjust
              </Button>
              {isAdmin && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit?.(part)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete?.(part)}
                    className="text-red-400"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
          </Card>
        );
      })}
    </div>
  );

  return (
    <>
      <TableView />
      <CardView />
    </>
  );
}
