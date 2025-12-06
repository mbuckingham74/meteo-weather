/**
 * Admin Panel
 * TODO: Implement full admin functionality
 */
import { useAuth } from '../contexts/AuthContext';
import { ShieldCheck, Users, Database, Activity } from 'lucide-react';

export default function AdminPanel() {
  const { user: _user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="card text-center py-12">
          <ShieldCheck className="w-12 h-12 text-text-muted mx-auto mb-4" />
          <h1 className="text-2xl font-semibold text-text-primary mb-2">Admin Access Required</h1>
          <p className="text-text-secondary">Please log in to access the admin panel.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-text-primary">Admin Panel</h1>
        <p className="text-text-secondary">System management and statistics</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { icon: Users, label: 'Total Users', value: '—', color: 'text-primary' },
          { icon: Activity, label: 'API Requests', value: '—', color: 'text-success' },
          { icon: Database, label: 'Cache Size', value: '—', color: 'text-warning' },
          { icon: ShieldCheck, label: 'System Health', value: '—', color: 'text-info' },
        ].map(({ icon: Icon, label, value, color }, i) => (
          <div key={i} className="card">
            <Icon className={`w-6 h-6 ${color} mb-2`} />
            <p className="text-text-muted text-sm">{label}</p>
            <p className="text-2xl font-semibold text-text-primary">{value}</p>
          </div>
        ))}
      </div>

      <div className="card">
        <p className="text-text-secondary text-center py-8">
          Admin functionality will be implemented here.
        </p>
      </div>
    </div>
  );
}
