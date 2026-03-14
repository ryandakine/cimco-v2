import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Edit, 
  Package, 
  MapPin, 
  Building2, 
  Hash,
  Clock,
  AlertTriangle,
  PlusMinus
} from 'lucide-react';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Badge } from '@/components/Badge';
import { Loading, SkeletonCard } from '@/components/Loading';
import { usePart } from '@/features/inventory/useParts';
import { useIsAdmin } from '@/features/auth/useAuth';
import { 
  formatDate, 
  formatCurrency, 
  getStockState, 
  getStockStateLabel, 
  getQuantityColor,
  truncateText 
} from '@/utils/formatters';
import type { Part } from '@/types';

function DetailItem({ 
  label, 
  value, 
  icon: Icon 
}: { 
  label: string; 
  value: React.ReactNode; 
  icon?: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="flex items-start gap-3">
      {Icon && <Icon className="h-5 w-5 text-slate-500 mt-0.5 flex-shrink-0" />}
      <div className={Icon ? '' : 'pl-8'}>
        <p className="text-sm text-slate-500">{label}</p>
        <p className="text-white font-medium">{value || '-'}</p>
      </div>
    </div>
  );
}

export function PartDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isAdmin = useIsAdmin();
  
  const partId = parseInt(id || '0');
  const { data: part, isLoading, error } = usePart(partId);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <SkeletonCard className="w-64 h-8" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <SkeletonCard />
            <SkeletonCard />
          </div>
          <SkeletonCard />
        </div>
      </div>
    );
  }

  if (error || !part) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="h-12 w-12 mx-auto text-red-400 mb-4" />
        <h2 className="text-xl font-semibold text-white mb-2">Part Not Found</h2>
        <p className="text-slate-400 mb-6">The part you're looking for doesn't exist or has been removed.</p>
        <Button variant="primary" onClick={() => navigate('/inventory')}>
          Back to Inventory
        </Button>
      </div>
    );
  }

  const stockState = getStockState(part);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/inventory')}
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-white">{part.name}</h1>
            {part.part_number && (
              <p className="text-slate-400">Part #: {part.part_number}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            onClick={() => navigate(`/inventory/${part.id}/adjust`)}
            leftIcon={<PlusMinus className="h-4 w-4" />}
          >
            Adjust Qty
          </Button>
          {isAdmin && (
            <Button
              variant="primary"
              onClick={() => navigate(`/inventory/${part.id}/edit`)}
              leftIcon={<Edit className="h-4 w-4" />}
            >
              Edit
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Status Card */}
          <Card className="p-6">
            <div className="flex flex-wrap items-center gap-4 mb-6">
              <Badge 
                variant={
                  stockState === 'in_stock' ? 'success' :
                  stockState === 'low_stock' ? 'warning' : 'danger'
                }
                size="lg"
              >
                {getStockStateLabel(stockState)}
              </Badge>
              {part.tracked && (
                <Badge variant="info" size="lg">Tracked</Badge>
              )}
              <Badge variant="default" size="lg">{part.category}</Badge>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
              <div>
                <p className="text-sm text-slate-500">Quantity</p>
                <p className={`text-3xl font-bold ${getQuantityColor(part.quantity, part.min_quantity)}`}>
                  {part.quantity}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Min Quantity</p>
                <p className="text-xl font-semibold text-white">{part.min_quantity}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Lead Time</p>
                <p className="text-xl font-semibold text-white">{part.lead_time_days} days</p>
              </div>
              {part.unit_cost && (
                <div>
                  <p className="text-sm text-slate-500">Unit Cost</p>
                  <p className="text-xl font-semibold text-white">{formatCurrency(part.unit_cost)}</p>
                </div>
              )}
            </div>
          </Card>

          {/* Details */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-white mb-6">Details</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <DetailItem
                label="Description"
                value={truncateText(part.description, 200)}
              />
              <DetailItem
                label="Part Type"
                value={part.part_type}
                icon={Package}
              />
              <DetailItem
                label="Manufacturer"
                value={part.manufacturer}
                icon={Building2}
              />
              <DetailItem
                label="Supplier"
                value={part.supplier}
              />
              <DetailItem
                label="Location"
                value={part.location}
                icon={MapPin}
              />
              <DetailItem
                label="Machine Location"
                value={part.machine_location}
              />
              <DetailItem
                label="Zone"
                value={part.zone}
              />
              <DetailItem
                label="Yard Label"
                value={part.yard_label}
              />
              <DetailItem
                label="BOM Reference"
                value={part.bom_reference}
                icon={Hash}
              />
              {part.wear_rating !== undefined && (
                <DetailItem
                  label="Wear Rating"
                  value={`${part.wear_rating}/10`}
                />
              )}
            </div>

            {part.function_description && (
              <div className="mt-6 pt-6 border-t border-slate-700">
                <p className="text-sm text-slate-500 mb-2">Function Description</p>
                <p className="text-slate-300">{part.function_description}</p>
              </div>
            )}
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Image Placeholder */}
          <Card className="p-4">
            {part.image_url ? (
              <img
                src={part.image_url}
                alt={part.name}
                className="w-full h-64 object-contain rounded-lg"
              />
            ) : (
              <div className="w-full h-64 bg-slate-800 rounded-lg flex items-center justify-center">
                <Package className="h-16 w-16 text-slate-600" />
              </div>
            )}
          </Card>

          {/* Metadata */}
          <Card className="p-4 space-y-3">
            <h3 className="font-medium text-white mb-4">Metadata</h3>
            <div className="flex items-center gap-3 text-sm">
              <Clock className="h-4 w-4 text-slate-500" />
              <div>
                <p className="text-slate-500">Created</p>
                <p className="text-slate-300">{formatDate(part.created_at)}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Clock className="h-4 w-4 text-slate-500" />
              <div>
                <p className="text-slate-500">Last Updated</p>
                <p className="text-slate-300">{formatDate(part.updated_at)}</p>
              </div>
            </div>
          </Card>

          {/* Actions */}
          <Card className="p-4 space-y-3">
            <h3 className="font-medium text-white mb-4">Actions</h3>
            <Button
              variant="secondary"
              className="w-full"
              onClick={() => navigate(`/inventory/${part.id}/adjust`)}
              leftIcon={<PlusMinus className="h-4 w-4" />}
            >
              Adjust Quantity
            </Button>
            {isAdmin && (
              <Button
                variant="secondary"
                className="w-full"
                onClick={() => navigate(`/inventory/${part.id}/edit`)}
                leftIcon={<Edit className="h-4 w-4" />}
              >
                Edit Part
              </Button>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
