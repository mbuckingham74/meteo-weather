# Install AI Provider Dependencies

**Required for:** User-managed API keys feature with multiple AI providers

## Installation Commands

### Backend Dependencies

```bash
cd backend

# Install all AI provider SDKs
npm install openai@^4.67.3
npm install @google/generative-ai@^0.21.0
npm install @mistralai/mistralai@^1.1.0
npm install cohere-ai@^7.14.0

# Note: @anthropic-ai/sdk is already installed
```

### Package Versions

| Package | Version | Purpose |
|---------|---------|---------|
| `@anthropic-ai/sdk` | ^0.68.0 | ✅ Already installed - Anthropic Claude API |
| `openai` | ^4.67.3 | ⚠️ **Install required** - OpenAI GPT & Grok (xAI) APIs |
| `@google/generative-ai` | ^0.21.0 | ⚠️ **Install required** - Google Gemini API |
| `@mistralai/mistralai` | ^1.1.0 | ⚠️ **Install required** - Mistral AI API |
| `cohere-ai` | ^7.14.0 | ⚠️ **Install required** - Cohere API |

## Installation Status

Run this to check what's installed:
```bash
cd backend
npm list openai @google/generative-ai @mistralai/mistralai cohere-ai
```

## Optional: Install All at Once

```bash
cd backend
npm install openai@^4.67.3 @google/generative-ai@^0.21.0 @mistralai/mistralai@^1.1.0 cohere-ai@^7.14.0
```

## After Installation

1. **Test the feature works:**
   ```bash
   cd backend
   npm run dev
   ```

2. **Test API key validation:**
   - All 6 providers should work for format validation
   - Test connection endpoint will work for providers with valid API keys

3. **Update package.json (optional):**
   If you want to commit the dependencies, they'll be automatically added to `package.json`.

## Notes

- These packages are **only required if you want to support those specific providers**
- If you only use Anthropic (Claude), no additional packages needed
- Each SDK is ~1-3 MB in size
- Total additional disk space: ~10-15 MB

## Troubleshooting

**Problem:** Module not found error
```
Error: Cannot find module 'openai'
```

**Solution:**
```bash
cd backend
npm install
```

**Problem:** Version conflicts
```
npm ERR! peer dep missing
```

**Solution:**
```bash
npm install --legacy-peer-deps
```

---

**See also:**
- [USER_API_KEYS_IMPLEMENTATION.md](docs/development/USER_API_KEYS_IMPLEMENTATION.md) - Complete feature documentation
- [.env.example](.env.example) - Environment variable configuration
