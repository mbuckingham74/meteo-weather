/**
 * AI Weather Page - Placeholder
 * TODO: Implement in PR 8
 */

function AIWeatherPage() {
  return (
    <div className="min-h-screen bg-bg-primary p-6">
      <div className="max-w-4xl mx-auto">
        <div className="card text-center py-12">
          <h1 className="text-3xl font-bold text-text-primary mb-4">AI Weather Assistant</h1>
          <p className="text-text-secondary mb-6">
            Ask questions about weather in natural language
          </p>
          <input
            type="text"
            placeholder="Ask about the weather..."
            className="input max-w-lg mx-auto"
          />
          <p className="text-text-muted mt-8">AI Weather feature coming soon in PR 8</p>
        </div>
      </div>
    </div>
  );
}

export default AIWeatherPage;
