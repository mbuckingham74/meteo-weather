import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../common/ToastContainer';
import './AdminPanel.css';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

const AdminPanel = () => {
  const { user, token } = useAuth();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // Check if user is admin (from user object - backend validates)
  const isAdmin = user?.isAdmin || false;

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE_URL}/api/admin/stats`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch statistics');
      }

      const data = await response.json();
      setStats(data.stats);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (isAdmin) {
      fetchStats();
    }
  }, [isAdmin, fetchStats]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchStats();
    setRefreshing(false);
  };

  const handleClearExpiredCache = async () => {
    if (!window.confirm('Clear all expired cache entries?')) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/cache/clear-expired`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      if (data.success) {
        toast.success(`Cleared ${data.deletedCount} expired cache entries`);
        fetchStats();
      }
    } catch (err) {
      toast.error(`Error: ${err.message}`);
    }
  };

  const handleClearAllCache = async () => {
    if (
      !window.confirm(
        '⚠️ WARNING: This will clear ALL cache entries. Next requests will be slower. Continue?'
      )
    )
      return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/cache/clear-all`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      if (data.success) {
        toast.success(data.message);
        fetchStats();
      }
    } catch (err) {
      toast.error(`Error: ${err.message}`);
    }
  };

  if (!user) {
    return (
      <div className="admin-panel">
        <div className="admin-error">
          <h2>Authentication Required</h2>
          <p>Please log in to access the admin panel.</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="admin-panel">
        <div className="admin-error">
          <h2>Access Denied</h2>
          <p>You do not have permission to access the admin panel.</p>
        </div>
      </div>
    );
  }

  if (loading && !stats) {
    return (
      <div className="admin-panel">
        <div className="admin-loading">
          <div className="spinner"></div>
          <p>Loading statistics...</p>
        </div>
      </div>
    );
  }

  if (error && !stats) {
    return (
      <div className="admin-panel">
        <div className="admin-error">
          <h2>Error Loading Statistics</h2>
          <p>{error}</p>
          <button onClick={fetchStats}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-panel">
      <div className="admin-header">
        <h1>🔧 Admin Dashboard</h1>
        <button onClick={handleRefresh} className="refresh-btn" disabled={refreshing}>
          {refreshing ? '⟳ Refreshing...' : '↻ Refresh'}
        </button>
      </div>

      <div className="admin-tabs">
        <button
          className={activeTab === 'overview' ? 'active' : ''}
          onClick={() => setActiveTab('overview')}
        >
          📊 Overview
        </button>
        <button
          className={activeTab === 'users' ? 'active' : ''}
          onClick={() => setActiveTab('users')}
        >
          👥 Users
        </button>
        <button
          className={activeTab === 'weather' ? 'active' : ''}
          onClick={() => setActiveTab('weather')}
        >
          🌤️ Weather Data
        </button>
        <button className={activeTab === 'ai' ? 'active' : ''} onClick={() => setActiveTab('ai')}>
          🤖 AI Usage
        </button>
        <button
          className={activeTab === 'cache' ? 'active' : ''}
          onClick={() => setActiveTab('cache')}
        >
          💾 Cache
        </button>
        <button
          className={activeTab === 'database' ? 'active' : ''}
          onClick={() => setActiveTab('database')}
        >
          🗄️ Database
        </button>
      </div>

      <div className="admin-content">
        {activeTab === 'overview' && <OverviewTab stats={stats} />}
        {activeTab === 'users' && <UsersTab stats={stats.users} />}
        {activeTab === 'weather' && <WeatherTab stats={stats.weather} />}
        {activeTab === 'ai' && <AITab stats={stats.ai} />}
        {activeTab === 'cache' && (
          <CacheTab
            stats={stats.cache}
            onClearExpired={handleClearExpiredCache}
            onClearAll={handleClearAllCache}
          />
        )}
        {activeTab === 'database' && <DatabaseTab stats={stats.database} />}
      </div>
    </div>
  );
};

// Overview Tab Component
const OverviewTab = ({ stats }) => {
  return (
    <div className="overview-tab">
      <div className="stats-grid">
        <StatCard
          icon="👥"
          title="Total Users"
          value={stats.users.total}
          subtitle={`${stats.users.activeLastMonth} active last month`}
        />
        <StatCard
          icon="🌍"
          title="Total Locations"
          value={stats.weather.totalLocations}
          subtitle={`${stats.weather.totalWeatherRecords.toLocaleString()} weather records`}
        />
        <StatCard
          icon="🤖"
          title="AI Queries"
          value={stats.ai.totalQueries}
          subtitle={`${stats.ai.queriesLast7Days} this week`}
        />
        <StatCard
          icon="💾"
          title="Cache Hit Rate"
          value={`${stats.cache.hitRate}%`}
          subtitle={`${stats.cache.validEntries} valid entries`}
        />
        <StatCard
          icon="🗄️"
          title="Database Size"
          value={`${stats.database.totalSizeMB} MB`}
          subtitle={`${stats.database.tableCount} tables`}
        />
        <StatCard
          icon="💰"
          title="AI Cost (Est.)"
          value={`$${stats.ai.estimatedCostUSD}`}
          subtitle={`${stats.ai.totalTokensUsed.toLocaleString()} tokens used`}
        />
      </div>

      <div className="section">
        <h2>🔥 Most Queried Locations (Last 30 Days)</h2>
        <table className="data-table">
          <thead>
            <tr>
              <th>Rank</th>
              <th>City</th>
              <th>Country</th>
              <th>Queries</th>
            </tr>
          </thead>
          <tbody>
            {stats.weather.mostQueriedLocations.slice(0, 10).map((loc, idx) => (
              <tr key={idx}>
                <td>{idx + 1}</td>
                <td>{loc.city_name}</td>
                <td>{loc.country}</td>
                <td>{loc.query_count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Users Tab Component
const UsersTab = ({ stats }) => {
  return (
    <div className="users-tab">
      <div className="stats-grid">
        <StatCard icon="👥" title="Total Users" value={stats.total} />
        <StatCard icon="✨" title="New Users (7 days)" value={stats.recentSignups} />
        <StatCard icon="⚡" title="Active (30 days)" value={stats.activeLastMonth} />
        <StatCard icon="⭐" title="Users with Favorites" value={stats.withFavorites} />
        <StatCard icon="📊" title="Avg Favorites/User" value={stats.avgFavoritesPerUser} />
      </div>
    </div>
  );
};

// Weather Tab Component
const WeatherTab = ({ stats }) => {
  return (
    <div className="weather-tab">
      <div className="stats-grid">
        <StatCard icon="🌍" title="Total Locations" value={stats.totalLocations.toLocaleString()} />
        <StatCard
          icon="📊"
          title="Weather Records"
          value={stats.totalWeatherRecords.toLocaleString()}
        />
      </div>

      <div className="section">
        <h2>🔥 Most Queried Locations</h2>
        <table className="data-table">
          <thead>
            <tr>
              <th>Rank</th>
              <th>City</th>
              <th>Country</th>
              <th>Query Count</th>
            </tr>
          </thead>
          <tbody>
            {stats.mostQueriedLocations.map((loc, idx) => (
              <tr key={idx}>
                <td>{idx + 1}</td>
                <td>{loc.city_name}</td>
                <td>{loc.country}</td>
                <td>{loc.query_count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="section">
        <h2>📍 Recently Added Locations</h2>
        <table className="data-table">
          <thead>
            <tr>
              <th>City</th>
              <th>Country</th>
              <th>Added</th>
            </tr>
          </thead>
          <tbody>
            {stats.recentlyAddedLocations.map((loc, idx) => (
              <tr key={idx}>
                <td>{loc.city_name}</td>
                <td>{loc.country}</td>
                <td>{new Date(loc.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {stats.dataSourceBreakdown.length > 0 && (
        <div className="section">
          <h2>📊 Data Sources</h2>
          <table className="data-table">
            <thead>
              <tr>
                <th>Source</th>
                <th>Records</th>
              </tr>
            </thead>
            <tbody>
              {stats.dataSourceBreakdown.map((source, idx) => (
                <tr key={idx}>
                  <td>{source.data_source}</td>
                  <td>{source.count.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

// AI Tab Component
const AITab = ({ stats }) => {
  return (
    <div className="ai-tab">
      <div className="stats-grid">
        <StatCard icon="🤖" title="Total Queries" value={stats.totalQueries.toLocaleString()} />
        <StatCard icon="📅" title="Last 7 Days" value={stats.queriesLast7Days} />
        <StatCard icon="👀" title="Total Views" value={stats.totalViews.toLocaleString()} />
        <StatCard icon="🎯" title="Avg Tokens/Query" value={stats.avgTokensPerQuery} />
        <StatCard
          icon="💰"
          title="Estimated Cost"
          value={`$${stats.estimatedCostUSD}`}
          subtitle={`${stats.totalTokensUsed.toLocaleString()} tokens`}
        />
      </div>

      <div className="section">
        <h2>📊 Confidence Breakdown</h2>
        <table className="data-table">
          <thead>
            <tr>
              <th>Confidence</th>
              <th>Count</th>
              <th>Avg Tokens</th>
            </tr>
          </thead>
          <tbody>
            {stats.confidenceBreakdown.map((item, idx) => (
              <tr key={idx}>
                <td>
                  <span className={`confidence-badge ${item.confidence}`}>{item.confidence}</span>
                </td>
                <td>{item.count}</td>
                <td>{Math.round(item.avg_tokens)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="section">
        <h2>🔥 Top Shared Answers</h2>
        <table className="data-table">
          <thead>
            <tr>
              <th>Question</th>
              <th>Location</th>
              <th>Views</th>
              <th>Confidence</th>
              <th>Tokens</th>
            </tr>
          </thead>
          <tbody>
            {stats.topSharedAnswers.map((answer, idx) => (
              <tr key={idx}>
                <td className="question-cell">{answer.question}</td>
                <td>{answer.location}</td>
                <td>{answer.views}</td>
                <td>
                  <span className={`confidence-badge ${answer.confidence}`}>
                    {answer.confidence}
                  </span>
                </td>
                <td>{answer.tokens_used}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Cache Tab Component
const CacheTab = ({ stats, onClearExpired, onClearAll }) => {
  return (
    <div className="cache-tab">
      <div className="stats-grid">
        <StatCard icon="💾" title="Total Entries" value={stats.totalEntries.toLocaleString()} />
        <StatCard icon="✅" title="Valid Entries" value={stats.validEntries.toLocaleString()} />
        <StatCard icon="❌" title="Expired Entries" value={stats.expiredEntries.toLocaleString()} />
        <StatCard icon="🎯" title="Hit Rate (7d)" value={`${stats.hitRate}%`} />
      </div>

      <div className="cache-actions">
        <button onClick={onClearExpired} className="btn-warning">
          🗑️ Clear Expired Cache ({stats.expiredEntries} entries)
        </button>
        <button onClick={onClearAll} className="btn-danger">
          ⚠️ Clear All Cache
        </button>
      </div>

      <div className="section">
        <h2>📊 Cache by Source</h2>
        <table className="data-table">
          <thead>
            <tr>
              <th>API Source</th>
              <th>Total Entries</th>
              <th>Valid</th>
              <th>Expired</th>
            </tr>
          </thead>
          <tbody>
            {stats.bySource.map((source, idx) => (
              <tr key={idx}>
                <td>{source.api_source}</td>
                <td>{source.source_count}</td>
                <td>{source.valid_entries}</td>
                <td>{source.expired_entries}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {stats.oldestEntry && (
        <div className="section">
          <h2>⏰ Oldest Cache Entry</h2>
          <div className="info-box">
            <p>
              <strong>Key:</strong> {stats.oldestEntry.cache_key}
            </p>
            <p>
              <strong>Source:</strong> {stats.oldestEntry.api_source}
            </p>
            <p>
              <strong>Created:</strong> {new Date(stats.oldestEntry.created_at).toLocaleString()}
            </p>
            <p>
              <strong>Expires:</strong> {new Date(stats.oldestEntry.expires_at).toLocaleString()}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

// Database Tab Component
const DatabaseTab = ({ stats }) => {
  return (
    <div className="database-tab">
      <div className="stats-grid">
        <StatCard icon="🗄️" title="Total Size" value={`${stats.totalSizeMB} MB`} />
        <StatCard icon="📊" title="Total Tables" value={stats.tableCount} />
      </div>

      <div className="section">
        <h2>📊 Largest Tables</h2>
        <table className="data-table">
          <thead>
            <tr>
              <th>Rank</th>
              <th>Table Name</th>
              <th>Size (MB)</th>
              <th>Rows</th>
            </tr>
          </thead>
          <tbody>
            {stats.largestTables.map((table, idx) => (
              <tr key={idx}>
                <td>{idx + 1}</td>
                <td>{table.table_name}</td>
                <td>{table.size_mb}</td>
                <td>{table.table_rows?.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Stat Card Component
const StatCard = ({ icon, title, value, subtitle }) => {
  return (
    <div className="stat-card">
      <div className="stat-icon">{icon}</div>
      <div className="stat-content">
        <h3>{title}</h3>
        <div className="stat-value">{value}</div>
        {subtitle && <div className="stat-subtitle">{subtitle}</div>}
      </div>
    </div>
  );
};

export default AdminPanel;
