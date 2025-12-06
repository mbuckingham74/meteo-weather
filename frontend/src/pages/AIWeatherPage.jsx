/**
 * AI Weather Page
 * TODO: Implement AI-powered weather analysis
 */
import { useState } from 'react';
import { Sparkles, Send } from 'lucide-react';

export default function AIWeatherPage() {
  const [query, setQuery] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Implement AI query
    console.log('AI Query:', query);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="card mb-6">
        <div className="flex items-center gap-3 mb-4">
          <Sparkles className="w-8 h-8 text-primary" />
          <div>
            <h1 className="text-2xl font-semibold text-text-primary">AI Weather Assistant</h1>
            <p className="text-text-secondary">Ask anything about weather conditions</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex gap-3">
          <input
            type="text"
            placeholder="e.g., Will it rain this weekend in Chicago?"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="input flex-1"
          />
          <button type="submit" className="btn btn-primary">
            <Send className="w-4 h-4" />
            Ask
          </button>
        </form>
      </div>

      {/* Example questions */}
      <div className="card">
        <h2 className="text-lg font-semibold text-text-primary mb-4">Try asking:</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            'What should I wear tomorrow?',
            'Best day for outdoor activities this week?',
            'Compare weather in NYC vs LA',
            'Will there be snow this winter?',
          ].map((example, i) => (
            <button
              key={i}
              onClick={() => setQuery(example)}
              className="p-4 text-left bg-bg-light rounded-lg hover:bg-border transition-colors cursor-pointer"
            >
              <p className="text-text-primary">{example}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
