/**
 * Shared Answer Page
 * TODO: Implement shared AI answer viewing
 */
import { useParams, Link } from 'react-router-dom';
import { Share2, ArrowLeft } from 'lucide-react';

export default function SharedAnswerPage() {
  const { shareId } = useParams();

  return (
    <div className="max-w-4xl mx-auto">
      <Link
        to="/ai-weather"
        className="inline-flex items-center gap-2 text-primary hover:text-primary-hover mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to AI Weather
      </Link>

      <div className="card">
        <div className="flex items-center gap-3 mb-6">
          <Share2 className="w-8 h-8 text-primary" />
          <div>
            <h1 className="text-2xl font-semibold text-text-primary">Shared Answer</h1>
            <p className="text-text-secondary">Share ID: {shareId}</p>
          </div>
        </div>

        <div className="p-8 bg-bg-light rounded-lg text-center">
          <p className="text-text-secondary">Shared answer content will be loaded here.</p>
        </div>
      </div>
    </div>
  );
}
