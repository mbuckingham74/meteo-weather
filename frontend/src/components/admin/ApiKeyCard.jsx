import { useState } from 'react';
import './ApiKeyCard.css';

const ApiKeyCard = ({
  apiKey,
  provider,
  _providerInfo,
  onDelete,
  onUpdate,
  onTest,
  onResetUsage,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(apiKey.key_name);
  const [editedLimit, setEditedLimit] = useState(apiKey.usage_limit || '');

  const usagePercent = apiKey.usage_limit ? (apiKey.tokens_used / apiKey.usage_limit) * 100 : 0;

  const getUsageColor = () => {
    if (usagePercent >= 90) return '#ef4444';
    if (usagePercent >= 75) return '#f59e0b';
    return '#10b981';
  };

  const formatNumber = (num) => {
    if (!num) return '0';
    return num.toLocaleString();
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  const handleSave = () => {
    const updates = {};
    if (editedName !== apiKey.key_name) updates.keyName = editedName;
    if (editedLimit !== (apiKey.usage_limit || '')) {
      updates.usageLimit = editedLimit ? parseInt(editedLimit, 10) : null;
    }

    if (Object.keys(updates).length > 0) {
      onUpdate(apiKey.id, updates);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedName(apiKey.key_name);
    setEditedLimit(apiKey.usage_limit || '');
    setIsEditing(false);
  };

  return (
    <div className={`api-key-card ${!apiKey.is_active ? 'inactive' : ''}`}>
      <div className="key-card-header">
        <div className="key-name-section">
          {isEditing ? (
            <input
              type="text"
              value={editedName}
              onChange={(e) => setEditedName(e.target.value)}
              className="edit-name-input"
              placeholder="Key name"
            />
          ) : (
            <>
              <h4 className="key-name">{apiKey.key_name}</h4>
              {apiKey.is_default && <span className="badge badge-default">DEFAULT</span>}
              {!apiKey.is_active && <span className="badge badge-inactive">INACTIVE</span>}
            </>
          )}
        </div>
        {!isEditing && (
          <div className="key-actions-menu">
            <button
              className="btn-icon"
              title="Test connection"
              onClick={() => onTest(apiKey.id, provider, apiKey.key_name)}
            >
              🧪
            </button>
            <button className="btn-icon" title="Edit" onClick={() => setIsEditing(true)}>
              ✏️
            </button>
            <button
              className="btn-icon btn-delete"
              title="Delete"
              onClick={() => onDelete(apiKey.id, apiKey.key_name)}
            >
              🗑️
            </button>
          </div>
        )}
      </div>

      {isEditing ? (
        <div className="edit-section">
          <div className="form-group">
            <label>Monthly Token Limit</label>
            <input
              type="number"
              value={editedLimit}
              onChange={(e) => setEditedLimit(e.target.value)}
              className="edit-limit-input"
              placeholder="No limit"
            />
            <span className="hint">Leave empty for unlimited</span>
          </div>
          <div className="edit-actions">
            <button className="btn btn-secondary" onClick={handleCancel}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={handleSave}>
              Save
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="key-usage">
            {apiKey.usage_limit ? (
              <>
                <div className="usage-stats">
                  <span className="usage-text">
                    {formatNumber(apiKey.tokens_used)} / {formatNumber(apiKey.usage_limit)} tokens
                  </span>
                  <span className="usage-percent">{usagePercent.toFixed(1)}%</span>
                </div>
                <div className="usage-bar">
                  <div
                    className="usage-bar-fill"
                    style={{
                      width: `${Math.min(usagePercent, 100)}%`,
                      backgroundColor: getUsageColor(),
                    }}
                  />
                </div>
              </>
            ) : (
              <div className="usage-stats">
                <span className="usage-text">{formatNumber(apiKey.tokens_used)} tokens used</span>
                <span className="usage-unlimited">No limit</span>
              </div>
            )}
          </div>

          <div className="key-meta">
            <div className="meta-item">
              <span className="meta-label">Last used:</span>
              <span className="meta-value">{formatDate(apiKey.last_used_at)}</span>
            </div>
            <div className="meta-item">
              <span className="meta-label">Reset:</span>
              <span className="meta-value">{formatDate(apiKey.tokens_reset_at)}</span>
            </div>
          </div>

          <div className="key-actions-footer">
            <button
              className="btn-text"
              onClick={() => onUpdate(apiKey.id, { isActive: !apiKey.is_active })}
            >
              {apiKey.is_active ? '⏸️ Deactivate' : '▶️ Activate'}
            </button>
            <button
              className="btn-text"
              onClick={() => onUpdate(apiKey.id, { isDefault: !apiKey.is_default })}
            >
              {apiKey.is_default ? '⭐ Unset Default' : '☆ Set Default'}
            </button>
            {apiKey.tokens_used > 0 && (
              <button className="btn-text" onClick={() => onResetUsage(apiKey.id, apiKey.key_name)}>
                🔄 Reset Usage
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default ApiKeyCard;
