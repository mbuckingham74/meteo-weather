/**
 * Shared Answer Page - Placeholder for shared AI answers
 * TODO: Implement in PR 8
 */
import { useParams, Link } from 'react-router-dom';

function SharedAnswerPage() {
  const { shareId } = useParams();

  return (
    <div className="min-h-screen bg-bg-primary p-6">
      <div className="max-w-4xl mx-auto">
        <Link to="/ai-weather" className="text-accent hover:text-accent-hover mb-6 inline-block">
          ← Back to AI Weather
        </Link>
        <div className="card text-center py-12">
          <h1 className="text-3xl font-bold text-text-primary mb-4">Shared AI Answer</h1>
          <p className="text-text-muted mb-4">Share ID: {shareId}</p>
          <p className="text-text-secondary">Shared answer viewing coming soon in PR 8</p>
        </div>
      </div>
    </div>
  );
}

export default SharedAnswerPage;
