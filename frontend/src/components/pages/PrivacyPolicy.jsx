/**
 * Privacy Policy - Legal page placeholder
 * TODO: Restore full privacy policy content
 */
import { Link } from 'react-router-dom';

function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-bg-primary p-6">
      <div className="max-w-3xl mx-auto">
        <Link to="/" className="text-accent hover:text-accent-hover mb-6 inline-block">
          ← Back to Dashboard
        </Link>
        <div className="card">
          <h1 className="text-3xl font-bold text-text-primary mb-6">Privacy Policy</h1>
          <div className="text-text-secondary space-y-4">
            <p>
              This privacy policy explains how Meteo Weather collects, uses, and protects your data.
            </p>
            <h2 className="text-xl font-semibold text-text-primary mt-6">Data Collection</h2>
            <p>
              We collect location data to provide weather information for your selected locations.
              This data is stored locally and used to improve your experience.
            </p>
            <h2 className="text-xl font-semibold text-text-primary mt-6">Data Storage</h2>
            <p>
              Your preferences and favorite locations are stored in your browser&apos;s local
              storage. Account data, if you create an account, is stored securely on our servers.
            </p>
            <h2 className="text-xl font-semibold text-text-primary mt-6">Contact</h2>
            <p>For privacy concerns, please contact us through the project repository.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PrivacyPolicy;
