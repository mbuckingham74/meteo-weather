/**
 * AI Weather Page - Chat interface for AI-powered weather queries
 */
import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Send, Loader2, MessageSquare, Sparkles, ThermometerSun } from 'lucide-react';
import { useLocation } from '../../contexts/LocationContext';
import api from '../../services/apiClient';
import API_CONFIG from '../../config/api';

const EXAMPLE_QUESTIONS = [
  'Should I bring an umbrella today?',
  'What will the weather be like this weekend?',
  'Is it a good day for outdoor activities?',
  'How does today compare to yesterday?',
];

function AIWeatherPage() {
  const { locationData } = useLocation();
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [_error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const locationName = locationData?.address || locationData?.location_name || 'your location';

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!query.trim() || isLoading) return;

    const userMessage = query.trim();
    setQuery('');
    setError(null);

    // Add user message to chat
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);

    if (!locationData) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Please select a location first by searching on the dashboard.',
          isError: true,
        },
      ]);
      return;
    }

    setIsLoading(true);

    try {
      const response = await api.post(API_CONFIG.ENDPOINTS.AI_WEATHER_ANALYZE, {
        query: userMessage,
        location: locationData.address || locationData.location_name,
        days: 7,
      });

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: response.answer,
          weatherData: response.weatherData,
          followUpQuestions: response.followUpQuestions,
          confidence: response.confidence,
          provider: response.provider,
        },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: err.message || 'Sorry, I had trouble analyzing the weather. Please try again.',
          isError: true,
        },
      ]);
      setError(err.message);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleExampleClick = (question) => {
    setQuery(question);
    inputRef.current?.focus();
  };

  const handleFollowUpClick = (question) => {
    setQuery(question);
    // Submit immediately
    setTimeout(() => {
      const form = document.getElementById('ai-weather-form');
      if (form) form.requestSubmit();
    }, 0);
  };

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col">
      {/* Header */}
      <div className="p-4 md:p-6 pb-0">
        <div className="max-w-3xl mx-auto">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-accent hover:text-accent-hover mb-4 transition-colors"
          >
            <ArrowLeft size={18} />
            Back to Dashboard
          </Link>

          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-xl bg-accent/20">
              <Sparkles size={24} className="text-accent" />
            </div>
            <h1 className="text-2xl font-bold text-text-primary">AI Weather Assistant</h1>
          </div>
          <p className="text-text-muted">Ask questions about the weather in {locationName}</p>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        <div className="max-w-3xl mx-auto space-y-4">
          {messages.length === 0 ? (
            <EmptyState onExampleClick={handleExampleClick} />
          ) : (
            messages.map((message, index) => (
              <MessageBubble key={index} message={message} onFollowUpClick={handleFollowUpClick} />
            ))
          )}

          {isLoading && (
            <div className="flex items-center gap-3 text-text-muted">
              <Loader2 size={20} className="animate-spin" />
              <span>Analyzing weather data...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="p-4 md:p-6 pt-0">
        <div className="max-w-3xl mx-auto">
          <form id="ai-weather-form" onSubmit={handleSubmit} className="relative">
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask about the weather..."
              className="input pr-12"
              disabled={isLoading}
              aria-label="Weather question"
            />
            <button
              type="submit"
              disabled={!query.trim() || isLoading}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-accent text-slate-dark hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              aria-label="Send question"
            >
              <Send size={18} />
            </button>
          </form>

          {!locationData && (
            <p className="text-text-muted text-sm mt-2 text-center">
              <Link to="/" className="text-accent hover:text-accent-hover">
                Select a location
              </Link>{' '}
              on the dashboard to get started
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function EmptyState({ onExampleClick }) {
  return (
    <div className="text-center py-12">
      <div className="inline-flex p-4 rounded-2xl bg-bg-card mb-6">
        <MessageSquare size={48} className="text-accent" />
      </div>
      <h2 className="text-xl font-semibold text-text-primary mb-2">Start a conversation</h2>
      <p className="text-text-muted mb-8 max-w-md mx-auto">
        Ask me anything about the weather. I can help with forecasts, recommendations, and more.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg mx-auto">
        {EXAMPLE_QUESTIONS.map((question, index) => (
          <button
            key={index}
            onClick={() => onExampleClick(question)}
            className="text-left p-3 rounded-xl bg-bg-card hover:bg-bg-card-hover text-text-secondary hover:text-text-primary transition-colors text-sm"
          >
            {question}
          </button>
        ))}
      </div>
    </div>
  );
}

function MessageBubble({ message, onFollowUpClick }) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[85%] rounded-2xl p-4 ${
          isUser
            ? 'bg-accent text-slate-dark'
            : message.isError
              ? 'bg-red-900/30 text-red-200'
              : 'bg-bg-card text-text-primary'
        }`}
      >
        <p className="whitespace-pre-wrap">{message.content}</p>

        {/* Weather summary if available */}
        {message.weatherData && (
          <div className="mt-3 pt-3 border-t border-steel-blue/20">
            <div className="flex items-center gap-2 text-sm opacity-80">
              <ThermometerSun size={16} />
              <span>
                {message.weatherData.temperature}° • {message.weatherData.currentConditions}
              </span>
            </div>
          </div>
        )}

        {/* Follow-up questions */}
        {message.followUpQuestions && message.followUpQuestions.length > 0 && (
          <div className="mt-3 pt-3 border-t border-steel-blue/20">
            <p className="text-xs text-text-muted mb-2">Follow-up questions:</p>
            <div className="flex flex-wrap gap-2">
              {message.followUpQuestions.map((q, i) => (
                <button
                  key={i}
                  onClick={() => onFollowUpClick(q)}
                  className="text-xs px-3 py-1.5 rounded-full bg-bg-elevated hover:bg-bg-card-hover text-text-secondary hover:text-text-primary transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Provider badge */}
        {message.provider && (
          <p className="text-xs text-text-muted mt-2 opacity-60">Powered by {message.provider}</p>
        )}
      </div>
    </div>
  );
}

export default AIWeatherPage;
