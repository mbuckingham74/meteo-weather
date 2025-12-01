/**
 * Admin Panel - System statistics and management
 */
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  Users,
  Database,
  Cloud,
  Cpu,
  RefreshCw,
  Trash2,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Loader2,
  BarChart3,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/apiClient';

const TABS = [
  { id: 'overview', label: 'Overview', icon: BarChart3 },
  { id: 'users', label: 'Users', icon: Users },
  { id: 'weather', label: 'Weather', icon: Cloud },
  { id: 'ai', label: 'AI Usage', icon: Sparkles },
  { id: 'database', label: 'Database', icon: Database },
  { id: 'cache', label: 'Cache', icon: RefreshCw },
];

function AdminPanel() {
  const { user, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const queryClient = useQueryClient();

  // Check if user is admin
  const isAdmin = user?.isAdmin;

  // Fetch admin stats
  const {
    data: statsData,
    isLoading: isLoadingStats,
    error: statsError,
    refetch: refetchStats,
  } = useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: () => api.get('/admin/stats'),
    enabled: isAdmin,
    staleTime: 30 * 1000, // 30 seconds
  });

  // Fetch system health
  const { data: healthData } = useQuery({
    queryKey: ['admin', 'health'],
    queryFn: () => api.get('/admin/health'),
    enabled: isAdmin,
    staleTime: 30 * 1000,
  });

  // Clear expired cache mutation
  const clearExpiredMutation = useMutation({
    mutationFn: () => api.post('/admin/cache/clear-expired'),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin']);
    },
  });

  // Clear all cache mutation
  const clearAllMutation = useMutation({
    mutationFn: () => api.post('/admin/cache/clear-all'),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin']);
    },
  });

  // Not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-bg-primary p-6 flex items-center justify-center">
        <div className="card text-center max-w-md">
          <XCircle size={48} className="mx-auto text-red-400 mb-4" />
          <h1 className="text-2xl font-bold text-text-primary mb-2">Access Denied</h1>
          <p className="text-text-muted mb-4">Please sign in to access the admin panel.</p>
          <Link to="/" className="btn btn-primary">
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  // Not admin
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-bg-primary p-6 flex items-center justify-center">
        <div className="card text-center max-w-md">
          <AlertTriangle size={48} className="mx-auto text-yellow-400 mb-4" />
          <h1 className="text-2xl font-bold text-text-primary mb-2">Admin Access Required</h1>
          <p className="text-text-muted mb-4">
            You do not have administrator privileges to access this page.
          </p>
          <Link to="/" className="btn btn-primary">
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const stats = statsData?.stats;
  const health = healthData?.health;

  return (
    <div className="min-h-screen bg-bg-primary p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-accent hover:text-accent-hover mb-6 transition-colors"
        >
          <ArrowLeft size={18} />
          Back to Dashboard
        </Link>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-text-primary">Admin Panel</h1>
            <p className="text-text-muted">System monitoring and management</p>
          </div>
          <button
            onClick={() => refetchStats()}
            disabled={isLoadingStats}
            className="btn btn-secondary flex items-center gap-2"
          >
            <RefreshCw size={16} className={isLoadingStats ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-accent text-slate-dark'
                    : 'bg-bg-card text-text-secondary hover:text-text-primary hover:bg-bg-card-hover'
                }`}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Loading State */}
        {isLoadingStats && (
          <div className="card flex items-center justify-center py-12">
            <Loader2 size={32} className="animate-spin text-accent" />
          </div>
        )}

        {/* Error State */}
        {statsError && (
          <div className="card bg-red-900/20 border border-red-500/30">
            <div className="flex items-center gap-3 text-red-300">
              <XCircle size={24} />
              <div>
                <p className="font-medium">Failed to load admin data</p>
                <p className="text-sm opacity-80">{statsError.message}</p>
              </div>
            </div>
          </div>
        )}

        {/* Tab Content */}
        {!isLoadingStats && !statsError && (
          <>
            {activeTab === 'overview' && <OverviewTab stats={stats} health={health} />}
            {activeTab === 'users' && <UsersTab stats={stats} />}
            {activeTab === 'weather' && <WeatherTab stats={stats} />}
            {activeTab === 'ai' && <AITab stats={stats} />}
            {activeTab === 'database' && <DatabaseTab stats={stats} />}
            {activeTab === 'cache' && (
              <CacheTab
                stats={stats}
                clearExpiredMutation={clearExpiredMutation}
                clearAllMutation={clearAllMutation}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}

function OverviewTab({ stats, health }) {
  return (
    <div className="space-y-6">
      {/* Health Status */}
      <div className="card">
        <h2 className="text-lg font-semibold text-text-primary mb-4">System Health</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <HealthIndicator
            label="Database"
            status={health?.database?.status}
            detail={health?.database?.responseTime ? `${health.database.responseTime}ms` : null}
          />
          <HealthIndicator
            label="Cache"
            status={health?.cache?.status}
            detail={health?.cache?.hitRate ? `${health.cache.hitRate}% hit rate` : null}
          />
          <HealthIndicator
            label="API"
            status={health?.api?.status}
            detail={health?.api?.responseTime ? `${health.api.responseTime}ms` : null}
          />
          <HealthIndicator label="Overall" status={health?.overall} />
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={Users}
          label="Total Users"
          value={stats?.users?.total || 0}
          subtext={`${stats?.users?.activeToday || 0} active today`}
        />
        <StatCard
          icon={Cloud}
          label="Weather Requests"
          value={stats?.weather?.requestsToday || 0}
          subtext="Today"
        />
        <StatCard
          icon={Sparkles}
          label="AI Queries"
          value={stats?.ai?.queriesToday || 0}
          subtext="Today"
        />
        <StatCard
          icon={Database}
          label="Cache Entries"
          value={stats?.cache?.totalEntries || 0}
          subtext={`${stats?.cache?.hitRate || 0}% hit rate`}
        />
      </div>
    </div>
  );
}

function UsersTab({ stats }) {
  const users = stats?.users;

  return (
    <div className="card">
      <h2 className="text-lg font-semibold text-text-primary mb-4">User Statistics</h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <MiniStat label="Total Users" value={users?.total || 0} />
        <MiniStat label="Active Today" value={users?.activeToday || 0} />
        <MiniStat label="Active This Week" value={users?.activeThisWeek || 0} />
        <MiniStat label="Admins" value={users?.admins || 0} />
      </div>

      <div className="pt-4 border-t border-steel-blue/20">
        <h3 className="text-sm font-medium text-text-muted mb-3">Registration Trend</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <MiniStat label="Last 24h" value={users?.registeredLast24h || 0} />
          <MiniStat label="Last 7 Days" value={users?.registeredLast7d || 0} />
          <MiniStat label="Last 30 Days" value={users?.registeredLast30d || 0} />
        </div>
      </div>
    </div>
  );
}

function WeatherTab({ stats }) {
  const weather = stats?.weather;

  return (
    <div className="card">
      <h2 className="text-lg font-semibold text-text-primary mb-4">Weather Data Statistics</h2>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        <MiniStat label="Requests Today" value={weather?.requestsToday || 0} />
        <MiniStat label="Requests This Week" value={weather?.requestsThisWeek || 0} />
        <MiniStat label="Unique Locations" value={weather?.uniqueLocations || 0} />
      </div>

      <div className="pt-4 border-t border-steel-blue/20">
        <h3 className="text-sm font-medium text-text-muted mb-3">Data Sources</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <MiniStat label="Visual Crossing" value={weather?.visualCrossingRequests || 0} />
          <MiniStat label="Cached Responses" value={weather?.cachedResponses || 0} />
          <MiniStat label="Cache Hit Rate" value={`${weather?.cacheHitRate || 0}%`} />
        </div>
      </div>
    </div>
  );
}

function AITab({ stats }) {
  const ai = stats?.ai;

  return (
    <div className="card">
      <h2 className="text-lg font-semibold text-text-primary mb-4">AI Usage Statistics</h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <MiniStat label="Queries Today" value={ai?.queriesToday || 0} />
        <MiniStat label="Total Queries" value={ai?.totalQueries || 0} />
        <MiniStat label="Tokens Used Today" value={ai?.tokensToday || 0} />
        <MiniStat label="Est. Cost Today" value={`$${ai?.costToday?.toFixed(2) || '0.00'}`} />
      </div>

      <div className="pt-4 border-t border-steel-blue/20">
        <h3 className="text-sm font-medium text-text-muted mb-3">By Provider</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <MiniStat label="Anthropic" value={ai?.anthropicQueries || 0} />
          <MiniStat label="OpenAI" value={ai?.openaiQueries || 0} />
          <MiniStat label="Google AI" value={ai?.googleQueries || 0} />
          <MiniStat label="Other" value={ai?.otherQueries || 0} />
        </div>
      </div>
    </div>
  );
}

function DatabaseTab({ stats }) {
  const db = stats?.database;

  return (
    <div className="card">
      <h2 className="text-lg font-semibold text-text-primary mb-4">Database Statistics</h2>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        <MiniStat label="Total Records" value={db?.totalRecords?.toLocaleString() || 0} />
        <MiniStat label="Database Size" value={db?.sizeFormatted || 'Unknown'} />
        <MiniStat label="Tables" value={db?.tableCount || 0} />
      </div>

      {db?.tables && (
        <div className="pt-4 border-t border-steel-blue/20">
          <h3 className="text-sm font-medium text-text-muted mb-3">Table Details</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-text-muted text-sm">
                  <th className="pb-2">Table</th>
                  <th className="pb-2">Rows</th>
                  <th className="pb-2">Size</th>
                </tr>
              </thead>
              <tbody>
                {db.tables.map((table) => (
                  <tr key={table.name} className="border-t border-steel-blue/10">
                    <td className="py-2 text-text-primary">{table.name}</td>
                    <td className="py-2 text-text-secondary">{table.rows?.toLocaleString()}</td>
                    <td className="py-2 text-text-secondary">{table.size}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function CacheTab({ stats, clearExpiredMutation, clearAllMutation }) {
  const cache = stats?.cache;

  return (
    <div className="space-y-6">
      <div className="card">
        <h2 className="text-lg font-semibold text-text-primary mb-4">Cache Statistics</h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <MiniStat label="Total Entries" value={cache?.totalEntries || 0} />
          <MiniStat label="Hit Rate" value={`${cache?.hitRate || 0}%`} />
          <MiniStat label="Hits Today" value={cache?.hitsToday || 0} />
          <MiniStat label="Misses Today" value={cache?.missesToday || 0} />
        </div>
      </div>

      {/* Cache Actions */}
      <div className="card">
        <h2 className="text-lg font-semibold text-text-primary mb-4">Cache Management</h2>

        <div className="flex flex-wrap gap-4">
          <button
            onClick={() => clearExpiredMutation.mutate()}
            disabled={clearExpiredMutation.isPending}
            className="btn btn-secondary flex items-center gap-2"
          >
            {clearExpiredMutation.isPending ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Trash2 size={16} />
            )}
            Clear Expired Cache
          </button>

          <button
            onClick={() => {
              if (window.confirm('Are you sure? This will clear ALL cache entries.')) {
                clearAllMutation.mutate();
              }
            }}
            disabled={clearAllMutation.isPending}
            className="btn flex items-center gap-2 bg-red-900/30 text-red-300 hover:bg-red-900/50"
          >
            {clearAllMutation.isPending ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Trash2 size={16} />
            )}
            Clear All Cache
          </button>
        </div>

        {/* Mutation Results */}
        {clearExpiredMutation.isSuccess && (
          <div className="mt-4 p-3 rounded-lg bg-green-900/20 text-green-300 text-sm">
            <CheckCircle size={16} className="inline mr-2" />
            {clearExpiredMutation.data?.message}
          </div>
        )}
        {clearAllMutation.isSuccess && (
          <div className="mt-4 p-3 rounded-lg bg-yellow-900/20 text-yellow-300 text-sm">
            <AlertTriangle size={16} className="inline mr-2" />
            {clearAllMutation.data?.message}
          </div>
        )}
      </div>
    </div>
  );
}

// Helper Components
function StatCard({ icon: Icon, label, value, subtext }) {
  return (
    <div className="card">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 rounded-xl bg-bg-elevated">
          <Icon size={20} className="text-accent" />
        </div>
        <span className="text-text-muted text-sm">{label}</span>
      </div>
      <p className="text-3xl font-bold text-text-primary">{value}</p>
      {subtext && <p className="text-text-muted text-sm mt-1">{subtext}</p>}
    </div>
  );
}

function MiniStat({ label, value }) {
  return (
    <div>
      <p className="text-text-muted text-xs mb-1">{label}</p>
      <p className="text-xl font-semibold text-text-primary">{value}</p>
    </div>
  );
}

function HealthIndicator({ label, status, detail }) {
  const getStatusColor = (s) => {
    switch (s) {
      case 'healthy':
      case 'ok':
        return 'text-green-400';
      case 'degraded':
      case 'warning':
        return 'text-yellow-400';
      case 'unhealthy':
      case 'error':
        return 'text-red-400';
      default:
        return 'text-text-muted';
    }
  };

  const getStatusIcon = (s) => {
    switch (s) {
      case 'healthy':
      case 'ok':
        return CheckCircle;
      case 'degraded':
      case 'warning':
        return AlertTriangle;
      case 'unhealthy':
      case 'error':
        return XCircle;
      default:
        return Cpu;
    }
  };

  const StatusIcon = getStatusIcon(status);

  return (
    <div className="flex items-center gap-3">
      <StatusIcon size={24} className={getStatusColor(status)} />
      <div>
        <p className="text-text-primary font-medium">{label}</p>
        {detail && <p className="text-text-muted text-xs">{detail}</p>}
      </div>
    </div>
  );
}

export default AdminPanel;
