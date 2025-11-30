/**
 * About Page - Placeholder
 * TODO: Implement in PR 8
 */
import { Link } from 'react-router-dom';

function AboutPage() {
  return (
    <div className="min-h-screen bg-bg-primary p-6">
      <div className="max-w-3xl mx-auto">
        <Link to="/" className="text-accent hover:text-accent-hover mb-6 inline-block">
          ← Back to Dashboard
        </Link>
        <div className="card">
          <h1 className="text-3xl font-bold text-text-primary mb-6">About Meteo Weather</h1>
          <div className="text-text-secondary space-y-4">
            <p>Meteo Weather is a self-hostable weather dashboard with AI-powered features.</p>
            <h2 className="text-xl font-semibold text-text-primary mt-6">Features</h2>
            <ul className="list-disc list-inside space-y-2">
              <li>Real-time weather data from multiple providers</li>
              <li>AI-powered weather analysis and Q&A</li>
              <li>Location comparison tools</li>
              <li>Historical weather data</li>
              <li>Responsive design for all devices</li>
            </ul>
            <h2 className="text-xl font-semibold text-text-primary mt-6">Open Source</h2>
            <p>This project is open source and available on GitHub.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AboutPage;
