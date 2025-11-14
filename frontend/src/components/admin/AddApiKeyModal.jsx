import { useState } from 'react';
import useApi from '../../hooks/useApi';
import './AddApiKeyModal.css';

const KEY_FORMAT_HINTS = {
  anthropic: 'Starts with "sk-ant-" (example: sk-ant-api03-xxx...)',
  openai: 'Starts with "sk-" or "sk-proj-" (example: sk-proj-xxx...)',
  grok: 'Get your key from x.ai dashboard',
  google: 'Get your key from Google AI Studio',
  mistral: 'Get your key from Mistral AI console',
  cohere: 'Get your key from Cohere dashboard',
};

const AddApiKeyModal = ({ provider, providerInfo, token, onClose, onSuccess }) => {
  const api = useApi({ showErrorToast: false }); // Manual error handling for better UX
  const [formData, setFormData] = useState({
    keyName: '',
    apiKey: '',
    isDefault: false,
    usageLimit: '',
  });
  const [showApiKey, setShowApiKey] = useState(false);
  const [testing, setTesting] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.keyName.trim()) {
      setError('Please enter a name for this key');
      return;
    }

    if (!formData.apiKey.trim()) {
      setError('Please enter your API key');
      return;
    }

    if (formData.usageLimit && parseInt(formData.usageLimit) <= 0) {
      setError('Usage limit must be greater than 0');
      return;
    }

    try {
      setSubmitting(true);

      await api('/api-keys', {
        method: 'POST',
        body: {
          provider,
          keyName: formData.keyName.trim(),
          apiKey: formData.apiKey.trim(),
          isDefault: formData.isDefault,
          usageLimit: formData.usageLimit ? parseInt(formData.usageLimit) : null,
        },
      });

      onSuccess();
    } catch (err) {
      console.error('Error adding API key:', err);
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleTestConnection = async () => {
    if (!formData.apiKey.trim()) {
      setError('Please enter your API key first');
      return;
    }

    setTesting(true);
    setError('');

    try {
      // For testing, we need to temporarily add the key, test it, then remove it
      // Or we can just validate the format for now
      const formatValid = validateKeyFormat(provider, formData.apiKey);
      if (!formatValid) {
        throw new Error('Invalid API key format for this provider');
      }

      // Simulate test (in real implementation, you'd call a test endpoint)
      await new Promise((resolve) => setTimeout(resolve, 1000));
      alert('✅ API key format is valid! Click "Add Key" to save it.');
    } catch (err) {
      setError(`Test failed: ${err.message}`);
    } finally {
      setTesting(false);
    }
  };

  const validateKeyFormat = (prov, key) => {
    switch (prov) {
      case 'anthropic':
        return key.startsWith('sk-ant-') && key.length > 20;
      case 'openai':
        return (key.startsWith('sk-') || key.startsWith('sk-proj-')) && key.length > 20;
      default:
        return key.length > 20;
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content add-key-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>
            <span style={{ fontSize: '1.5rem', marginRight: '8px' }}>{providerInfo.icon}</span>
            Add {providerInfo.name} Key
          </h2>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="add-key-form">
          {error && (
            <div className="error-message">
              <span className="error-icon">⚠️</span>
              {error}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="keyName">
              Key Name <span className="required">*</span>
            </label>
            <input
              id="keyName"
              type="text"
              value={formData.keyName}
              onChange={(e) => setFormData({ ...formData, keyName: e.target.value })}
              placeholder="e.g., My Personal Key"
              className="form-input"
              disabled={submitting}
            />
            <span className="form-hint">A friendly name to identify this key</span>
          </div>

          <div className="form-group">
            <label htmlFor="apiKey">
              API Key <span className="required">*</span>
            </label>
            <div className="api-key-input-group">
              <input
                id="apiKey"
                type={showApiKey ? 'text' : 'password'}
                value={formData.apiKey}
                onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                placeholder={KEY_FORMAT_HINTS[provider]}
                className="form-input api-key-input"
                disabled={submitting}
              />
              <button
                type="button"
                className="btn-toggle-visibility"
                onClick={() => setShowApiKey(!showApiKey)}
                disabled={submitting}
              >
                {showApiKey ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
            <span className="form-hint">{KEY_FORMAT_HINTS[provider]}</span>
          </div>

          <div className="form-group">
            <label htmlFor="usageLimit">Monthly Token Limit (Optional)</label>
            <input
              id="usageLimit"
              type="number"
              value={formData.usageLimit}
              onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
              placeholder="Leave empty for unlimited"
              className="form-input"
              min="1"
              disabled={submitting}
            />
            <span className="form-hint">
              Set a monthly limit to control costs. Leave empty for no limit.
            </span>
          </div>

          <div className="form-group checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={formData.isDefault}
                onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                disabled={submitting}
              />
              <span>Set as default key for {providerInfo.name}</span>
            </label>
            <span className="form-hint">
              The default key will be used automatically for this provider
            </span>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleTestConnection}
              disabled={submitting || testing}
            >
              {testing ? 'Testing...' : '🧪 Test Connection'}
            </button>
            <div className="footer-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onClose}
                disabled={submitting}
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? 'Adding...' : 'Add Key'}
              </button>
            </div>
          </div>
        </form>

        <div className="modal-help">
          <h4>Where to get your API key:</h4>
          <a href={providerInfo.docs} target="_blank" rel="noopener noreferrer">
            📚 {providerInfo.name} Documentation →
          </a>
        </div>
      </div>
    </div>
  );
};

export default AddApiKeyModal;
