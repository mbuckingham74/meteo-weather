/**
 * About Page
 */
import { Cloud, Github, Heart } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="card">
        <div className="flex items-center gap-3 mb-6">
          <Cloud className="w-10 h-10 text-primary" />
          <div>
            <h1 className="text-2xl font-semibold text-text-primary">About Meteo</h1>
            <p className="text-text-secondary">Your comprehensive weather companion</p>
          </div>
        </div>

        <div className="prose max-w-none">
          <p className="text-text-secondary mb-4">
            Meteo is a self-hostable weather application that provides detailed forecasts,
            historical climate analysis, and AI-powered weather insights.
          </p>

          <h2 className="text-lg font-semibold text-text-primary mt-6 mb-3">Features</h2>
          <ul className="space-y-2 text-text-secondary">
            <li>Real-time weather data and forecasts</li>
            <li>Historical climate analysis</li>
            <li>Location comparison tools</li>
            <li>AI-powered weather assistant</li>
            <li>Privacy-focused and self-hostable</li>
          </ul>

          <h2 className="text-lg font-semibold text-text-primary mt-6 mb-3">Data Sources</h2>
          <p className="text-text-secondary">
            Weather data is provided by Visual Crossing and OpenWeather APIs.
          </p>
        </div>

        <div className="flex items-center gap-4 mt-8 pt-6 border-t border-border">
          <a
            href="https://github.com/mbuckingham74/meteo-weather"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-ghost"
          >
            <Github className="w-4 h-4" />
            GitHub
          </a>
          <span className="text-text-muted flex items-center gap-1">
            Made with <Heart className="w-4 h-4 text-danger" /> by Michael
          </span>
        </div>
      </div>
    </div>
  );
}
