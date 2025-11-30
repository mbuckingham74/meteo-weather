/**
 * Auth Header - Placeholder for navigation header
 * TODO: Implement full header with auth in PR 7
 */
import { Link } from 'react-router-dom';

function AuthHeader() {
  return (
    <header className="bg-bg-card border-b border-steel-blue/20">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link
          to="/"
          className="text-xl font-bold text-text-primary hover:text-accent transition-colors"
        >
          Meteo Weather
        </Link>
        <nav className="flex items-center gap-4">
          <Link
            to="/ai-weather"
            className="text-text-secondary hover:text-text-primary transition-colors"
          >
            AI Weather
          </Link>
          <Link
            to="/compare"
            className="text-text-secondary hover:text-text-primary transition-colors"
          >
            Compare
          </Link>
        </nav>
      </div>
    </header>
  );
}

export default AuthHeader;
