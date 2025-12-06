/**
 * Privacy Policy Page
 */
import { Shield } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="card">
        <div className="flex items-center gap-3 mb-6">
          <Shield className="w-10 h-10 text-primary" />
          <div>
            <h1 className="text-2xl font-semibold text-text-primary">Privacy Policy</h1>
            <p className="text-text-secondary">How we handle your data</p>
          </div>
        </div>

        <div className="prose max-w-none space-y-6">
          <section>
            <h2 className="text-lg font-semibold text-text-primary mb-2">Data Collection</h2>
            <p className="text-text-secondary">
              Meteo collects minimal data necessary to provide weather services:
            </p>
            <ul className="list-disc pl-5 text-text-secondary mt-2 space-y-1">
              <li>Location data (when you search or use geolocation)</li>
              <li>Account information (if you create an account)</li>
              <li>Usage analytics (anonymized)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-text-primary mb-2">Data Storage</h2>
            <p className="text-text-secondary">
              Your preferences and favorites are stored locally and in our secure database. We do
              not sell or share your personal information with third parties.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-text-primary mb-2">Third-Party Services</h2>
            <p className="text-text-secondary">
              We use Visual Crossing and OpenWeather APIs to provide weather data. Location searches
              may use Nominatim for geocoding.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-text-primary mb-2">Contact</h2>
            <p className="text-text-secondary">
              For privacy concerns, please contact us through our GitHub repository.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
