import { useState, useEffect, useCallback } from 'react';
import { useToast } from '../common/ToastContainer';
import ApiKeyCard from './ApiKeyCard';
import AddApiKeyModal from './AddApiKeyModal';
import './ApiKeysTab.css';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

const PROVIDER_INFO = {
  anthropic: {
    name: 'Anthropic (Claude)',
    icon: '🤖',
    color: '#D4A574',
    docs: 'https://docs.anthropic.com/',
  },
  openai: {
    name: 'OpenAI (GPT-4)',
    icon: '🧠',
    color: '#10A37F',
    docs: 'https://platform.openai.com/docs',
  },
  grok: {
    name: 'Grok (xAI)',
    icon: '⚡',
    color: '#000000',
    docs: 'https://x.ai/',
  },
  google: {
    name: 'Google AI (Gemini)',
    icon: '🔮',
    color: '#4285F4',
    docs: 'https://ai.google.dev/',
  },
  mistral: {
    name: 'Mistral AI',
    icon: '🌊',
    color: '#FF7000',
    docs: 'https://docs.mistral.ai/',
  },
  cohere: {
    name: 'Cohere',
    icon: '🧬',
    color: '#D18EE2',
    docs: 'https://docs.cohere.com/',
  },
  ollama: {
    name: 'Ollama (Self-Hosted)',
    icon: '🦙',
    color: '#000000',
    docs: 'https://ollama.com/',
  },
};

const ApiKeysTab = ({ token }) => {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [keys, setKeys] = useState({});
  const [providers, setProviders] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [expandedProviders, setExpandedProviders] = useState(new Set(['anthropic']));

  const fetchKeys = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api-keys`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch API keys');
      }

      const data = await response.json();
      setKeys(data.keys || {});
      setProviders(data.providers || []);
    } catch (error) {
      console.error('Error fetching API keys:', error);
      toast.error(`Failed to load API keys: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }, [token]); // Removed toast from dependencies to prevent infinite loop

  useEffect(() => {
    fetchKeys();
  }, [fetchKeys]);

  const handleAddKey = (provider) => {
    setSelectedProvider(provider);
    setShowAddModal(true);
  };

  const handleKeyAdded = () => {
    setShowAddModal(false);
    setSelectedProvider(null);
    fetchKeys();
    toast.success('API key added successfully!');
  };

  const handleDeleteKey = async (keyId, keyName) => {
    if (!window.confirm(`Delete API key "${keyName}"? This cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api-keys/${keyId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete API key');
      }

      toast.success('API key deleted successfully');
      fetchKeys();
    } catch (error) {
      console.error('Error deleting API key:', error);
      toast.error(`Failed to delete key: ${error.message}`);
    }
  };

  const handleUpdateKey = async (keyId, updates) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api-keys/${keyId}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error('Failed to update API key');
      }

      toast.success('API key updated successfully');
      fetchKeys();
    } catch (error) {
      console.error('Error updating API key:', error);
      toast.error(`Failed to update key: ${error.message}`);
    }
  };

  const handleTestKey = async (keyId, provider, keyName) => {
    try {
      toast.info(`Testing ${keyName}...`);
      const response = await fetch(`${API_BASE_URL}/api-keys/${keyId}/test`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Connection test failed');
      }

      toast.success(
        `✅ ${keyName} is working! Model: ${data.details.model} (${data.details.tokensUsed} tokens used)`
      );
    } catch (error) {
      console.error('Error testing API key:', error);
      toast.error(`❌ Connection test failed: ${error.message}`);
    }
  };

  const handleResetUsage = async (keyId, keyName) => {
    if (!window.confirm(`Reset token usage for "${keyName}"?`)) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api-keys/reset-usage/${keyId}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to reset usage');
      }

      toast.success('Usage reset successfully');
      fetchKeys();
    } catch (error) {
      console.error('Error resetting usage:', error);
      toast.error(`Failed to reset usage: ${error.message}`);
    }
  };

  const toggleProvider = (provider) => {
    setExpandedProviders((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(provider)) {
        newSet.delete(provider);
      } else {
        newSet.add(provider);
      }
      return newSet;
    });
  };

  if (loading) {
    return (
      <div className="api-keys-tab">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading API keys...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="api-keys-tab">
      <div className="api-keys-header">
        <div className="header-content">
          <h2>🔑 API Keys</h2>
          <p className="header-subtitle">
            Manage your AI provider API keys. Your keys are encrypted and stored securely.
          </p>
        </div>
      </div>

      <div className="providers-list">
        {providers.map((provider) => {
          const info = PROVIDER_INFO[provider];
          const providerKeys = keys[provider] || [];
          const isExpanded = expandedProviders.has(provider);

          return (
            <div key={provider} className="provider-section">
              <div
                className="provider-header"
                onClick={() => toggleProvider(provider)}
                style={{ borderLeftColor: info.color }}
              >
                <div className="provider-info">
                  <span className="provider-icon">{info.icon}</span>
                  <div className="provider-details">
                    <h3>{info.name}</h3>
                    <span className="provider-count">
                      {providerKeys.length === 0
                        ? 'No keys'
                        : `${providerKeys.length} key${providerKeys.length > 1 ? 's' : ''}`}
                    </span>
                  </div>
                </div>
                <div className="provider-actions">
                  <button
                    className="btn-add-key"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddKey(provider);
                    }}
                  >
                    + Add Key
                  </button>
                  <a
                    href={info.docs}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-docs"
                    onClick={(e) => e.stopPropagation()}
                  >
                    📚 Docs
                  </a>
                  <span className="expand-icon">{isExpanded ? '▼' : '▶'}</span>
                </div>
              </div>

              {isExpanded && (
                <div className="provider-content">
                  {providerKeys.length === 0 ? (
                    <div className="no-keys-message">
                      <p>No API keys for {info.name}</p>
                      <button className="btn-add-first-key" onClick={() => handleAddKey(provider)}>
                        Add your first key
                      </button>
                    </div>
                  ) : (
                    <div className="keys-grid">
                      {providerKeys.map((key) => (
                        <ApiKeyCard
                          key={key.id}
                          apiKey={key}
                          provider={provider}
                          providerInfo={info}
                          onDelete={handleDeleteKey}
                          onUpdate={handleUpdateKey}
                          onTest={handleTestKey}
                          onResetUsage={handleResetUsage}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {showAddModal && (
        <AddApiKeyModal
          provider={selectedProvider}
          providerInfo={PROVIDER_INFO[selectedProvider]}
          token={token}
          onClose={() => {
            setShowAddModal(false);
            setSelectedProvider(null);
          }}
          onSuccess={handleKeyAdded}
        />
      )}
    </div>
  );
};

export default ApiKeysTab;
