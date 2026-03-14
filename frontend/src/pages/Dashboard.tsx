import { useNavigate } from 'react-router-dom';
import { 
  Package, 
  AlertTriangle, 
  XCircle, 
  ArrowRight,
  TrendingUp,
  Clock
} from 'lucide-react';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Badge } from '@/components/Badge';
import { Loading, SkeletonCard } from '@/components/Loading';
import { useDashboardStats } from '@/features/inventory/useParts';
import { useIsAdmin } from '@/features/auth/useAuth';
import { formatNumber, formatRelativeTime } from '@/utils/formatters';

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: 'cyan' | 'emerald' | 'amber' | 'red';
  onClick?: () => void;
}

function StatCard({ title, value, icon, color, onClick }: StatCardProps) {
  const colors = {
    cyan: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
    emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    amber: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    red: 'bg-red-500/10 text-red-400 border-red-500/20',
  };

  return (
    <Card 
      className={`p-6 transition-all ${onClick ? 'cursor-pointer hover:scale-[1.02]' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-slate-400 text-sm font-medium">{title}</p>
          <p className={`text-3xl font-bold mt-2 ${
            color === 'cyan' ? 'text-cyan-400' :
            color === 'emerald' ? 'text-emerald-400' :
            color === 'amber' ? 'text-amber-400' :
            'text-red-400'
          }`}>
            {formatNumber(value)}
          </p>
        </div>
        <div className={`p-3 rounded-lg border ${colors[color]}`}>
          {icon}
        </div>
      </div>
    </Card>
  );
}

export function Dashboard() {
  const navigate = useNavigate();
  const isAdmin = useIsAdmin();
  const { data: stats, isLoading, error } = useDashboardStats();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-slate-400 mt-1">Overview of your inventory</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-400">Failed to load dashboard data</p>
        <Button
          variant="secondary"
          onClick={() => window.location.reload()}
          className="mt-4"
        >
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-slate-400 mt-1">Overview of your inventory</p>
        </div>
        <Button
          variant="primary"
          onClick={() => navigate('/inventory')}
          rightIcon={<ArrowRight className="h-4 w-4" />}
        >
          View Inventory
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Parts"
          value={stats?.total_parts || 0}
          icon={<Package className="h-6 w-6" />}
          color="cyan"
          onClick={() => navigate('/inventory')}
        />
        <StatCard
          title="Low Stock"
          value={stats?.low_stock_count || 0}
          icon={<AlertTriangle className="h-6 w-6" />}
          color="amber"
          onClick={() => navigate('/inventory?stock_state=low_stock')}
        />
        <StatCard
          title="Out of Stock"
          value={stats?.out_of_stock_count || 0}
          icon={<XCircle className="h-6 w-6" />}
          color="red"
          onClick={() => navigate('/inventory?stock_state=out_of_stock')}
        />
        <StatCard
          title="Tracked Parts"
          value={stats?.tracked_parts_count || 0}
          icon={<TrendingUp className="h-6 w-6" />}
          color="emerald"
          onClick={() => navigate('/inventory?tracked=true')}
        />
      </div>

      {/* Recent Activity */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Clock className="h-5 w-5 text-slate-400" />
          Recent Activity
        </h2>
        
        {stats?.recent_adjustments && stats.recent_adjustments.length > 0 ? (
          <div className="space-y-3">
            {stats.recent_adjustments.map((adjustment) => (
              <Card key={adjustment.id} className="p-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-white">{adjustment.part_name}</span>
                      <Badge 
                        variant={adjustment.change_amount > 0 ? 'success' : 'danger'}
                        size="sm"
                      >
                        {adjustment.change_amount > 0 ? '+' : ''}{adjustment.change_amount}
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-400 mt-1">
                      {adjustment.previous_quantity} → {adjustment.new_quantity}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-slate-300">{adjustment.adjusted_by}</p>
                    <p className="text-xs text-slate-500">
                      {formatRelativeTime(adjustment.adjusted_at)}
                    </p>
                  </div>
                </div>
                {adjustment.reason && (
                  <p className="text-sm text-slate-400 mt-2 pt-2 border-t border-slate-700">
                    "{adjustment.reason}"
                  </p>
                )}
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-8 text-center">
            <p className="text-slate-400">No recent activity</p>
          </Card>
        )}
      </div>

      {/* Quick Links */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Button
            variant="secondary"
            onClick={() => navigate('/inventory')}
            className="h-auto py-4 justify-start"
            leftIcon={<Package className="h-5 w-5" />}
          >
            <div className="text-left">
              <p className="font-medium">Browse Inventory</p>
              <p className="text-xs text-slate-400 font-normal">View and search all parts</p>
            </div>
          </Button>
          
          <Button
            variant="secondary"
            onClick={() => navigate('/inventory?stock_state=low_stock')}
            className="h-auto py-4 justify-start"
            leftIcon={<AlertTriangle className="h-5 w-5" />}
          >
            <div className="text-left">
              <p className="font-medium">Low Stock Alert</p>
              <p className="text-xs text-slate-400 font-normal">View parts needing attention</p>
            </div>
          </Button>
          
          {isAdmin && (
            <Button
              variant="secondary"
              onClick={() => navigate('/inventory/new')}
              className="h-auto py-4 justify-start"
              leftIcon={<TrendingUp className="h-5 w-5" />}
            >
              <div className="text-left">
                <p className="font-medium">Add New Part</p>
                <p className="text-xs text-slate-400 font-normal">Create a new inventory item</p>
              </div>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
