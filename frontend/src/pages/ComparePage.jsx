/**
 * Compare Page - Location comparison view
 * TODO: Implement full location comparison functionality
 */
import { Link } from 'react-router-dom';
import { ArrowLeft, MapPin } from 'lucide-react';

export default function ComparePage() {
  return (
    <div className="max-w-6xl mx-auto">
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-primary hover:text-primary-hover mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Dashboard
      </Link>

      <div className="card">
        <h1 className="text-2xl font-semibold text-text-primary mb-4">Compare Locations</h1>
        <p className="text-text-secondary mb-6">
          Compare weather conditions across multiple locations side by side.
        </p>

        {/* Placeholder for location comparison */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="border-2 border-dashed border-border rounded-lg p-6 text-center"
            >
              <MapPin className="w-8 h-8 text-text-muted mx-auto mb-3" />
              <p className="text-text-secondary">Add Location {i}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
