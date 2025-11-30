/**
 * Admin Panel - Placeholder
 * TODO: Implement in PR 8
 */
import { Link } from 'react-router-dom';

function AdminPanel() {
  return (
    <div className="min-h-screen bg-bg-primary p-6">
      <div className="max-w-6xl mx-auto">
        <Link to="/" className="text-accent hover:text-accent-hover mb-6 inline-block">
          ← Back to Dashboard
        </Link>
        <div className="card mb-6">
          <h1 className="text-3xl font-bold text-text-primary mb-2">Admin Panel</h1>
          <p className="text-text-secondary">System administration and monitoring</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="card-hover">
            <h3 className="text-lg font-semibold text-text-primary mb-2">Users</h3>
            <p className="text-3xl font-bold text-accent">--</p>
          </div>
          <div className="card-hover">
            <h3 className="text-lg font-semibold text-text-primary mb-2">API Requests</h3>
            <p className="text-3xl font-bold text-accent">--</p>
          </div>
          <div className="card-hover">
            <h3 className="text-lg font-semibold text-text-primary mb-2">Cache Hit Rate</h3>
            <p className="text-3xl font-bold text-accent">--%</p>
          </div>
        </div>

        <div className="card text-center py-8">
          <p className="text-text-muted">Full admin panel coming in PR 8</p>
        </div>
      </div>
    </div>
  );
}

export default AdminPanel;
