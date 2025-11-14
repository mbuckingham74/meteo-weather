# Beta Testing Guide - November 13, 2025

## 🎯 What We're Testing

Three major features were just implemented and need testing on the beta server:

1. **User-Managed API Keys** - Bring your own API keys for 7 AI providers
2. **Ollama Self-Hosted AI Support** - Free, privacy-focused AI (if Ollama is installed)
3. **AI Provider Selector UI** - Choose which AI provider to use per query

---

## 🚀 Beta Server Information

- **Frontend:** https://meteo-beta.tachyonfuture.com
- **API:** https://api.meteo-beta.tachyonfuture.com
- **Admin Panel:** https://meteo-beta.tachyonfuture.com/admin
- **AI Weather Page:** https://meteo-beta.tachyonfuture.com/ai-weather

---

## ✅ Testing Checklist

### 1. User-Managed API Keys (Admin Panel)

**Access the Feature:**
1. Go to **[Admin Panel](https://meteo-beta.tachyonfuture.com/admin)** (must be logged in)
2. Click on the **"🔑 API Keys"** tab
3. You should see a list of 7 AI providers

**Test Cases:**

- [ ] **View API Keys Tab**
  - Should see list of 7 providers: Anthropic, OpenAI, Grok, Google, Mistral, Cohere, Ollama
  - Each provider shows icon, name, docs link
  - System default keys show "Using system default" badge

- [ ] **Add New API Key**
  - Click "➕ Add API Key" button
  - Select a provider from dropdown
  - Enter a test API key (can be fake for UI testing)
  - Optionally set monthly limit
  - Click "Add Key"
  - **Expected:** Key appears in list, masked display (e.g., `sk-ant-...xyz`)

- [ ] **Test Connection**
  - Find a key in the list
  - Click "🔌 Test Connection" button
  - **Expected (valid key):** Green "✓ Connection successful" badge
  - **Expected (invalid key):** Red "✗ Connection failed" badge

- [ ] **Set as Default**
  - Click "Set as Default" on a key
  - **Expected:** Badge changes to "⭐ Default"
  - Only one key per provider can be default

- [ ] **Edit API Key**
  - Click "Edit" on a key
  - Modify the key or monthly limit
  - Save changes
  - **Expected:** Changes persist after page refresh

- [ ] **Delete API Key**
  - Click "Delete" on a key
  - Confirm deletion
  - **Expected:** Key removed from list

- [ ] **Usage Tracking**
  - Use a key (via AI Weather page)
  - Return to API Keys tab
  - **Expected:** "Tokens used" count increases

- [ ] **Fallback to System Defaults**
  - Delete all user keys for a provider
  - Use AI Weather page
  - **Expected:** System falls back to default keys, still works

### 2. AI Provider Selector UI

**Access the Feature:**
1. Go to **[AI Weather Page](https://meteo-beta.tachyonfuture.com/ai-weather)**
2. Look for the "AI Provider:" dropdown above the question input box

**Test Cases:**

- [ ] **Provider Dropdown Visible**
  - Look above the question input box
  - Should see "AI Provider:" label with dropdown
  - Dropdown should list all 7 providers with icons:
    - 🤖 Anthropic (Claude)
    - 🧠 OpenAI (GPT-4)
    - ⚡ Grok (xAI)
    - 🔮 Google AI (Gemini)
    - 🌊 Mistral AI
    - 🧬 Cohere
    - 🦙 Ollama (Self-Hosted)

- [ ] **Change Provider**
  - Select a different provider from dropdown
  - **Expected:** Selection changes immediately

- [ ] **LocalStorage Persistence**
  - Select a provider (e.g., OpenAI)
  - Refresh the page
  - **Expected:** OpenAI still selected (preference saved)

- [ ] **Ask Question with Different Providers**
  - Select "Anthropic"
  - Ask: "Will it rain tomorrow?"
  - Check answer appears
  - Select "OpenAI"
  - Ask: "What's the temperature trend?"
  - **Expected:** Both providers work, answers appear

- [ ] **Disabled During Loading**
  - Ask a question
  - While loading (🔄 Analyzing...)
  - Try to change provider dropdown
  - **Expected:** Dropdown is disabled during loading

### 3. Ollama Self-Hosted AI Support

**Prerequisites:**
- Only testable if Ollama is installed on the server
- Check with server admin if Ollama is running

**Test Cases:**

- [ ] **Ollama Listed in Providers**
  - Check Admin Panel → API Keys tab
  - **Expected:** "🦙 Ollama (Self-Hosted)" appears in list

- [ ] **Ollama in Provider Selector**
  - Check AI Weather page dropdown
  - **Expected:** "🦙 Ollama (Self-Hosted)" is an option

- [ ] **Ask Question with Ollama** (if installed)
  - Select Ollama from provider dropdown
  - Ask a weather question
  - **Expected:** Answer appears (may be slower than cloud APIs)

- [ ] **Ollama Without API Key**
  - Don't add an Ollama API key
  - Use Ollama provider
  - **Expected:** Should work without API key (uses "ollama" as placeholder)

### 4. General UI/UX Testing

- [ ] **Mobile Responsiveness**
  - Test on phone/tablet
  - Check provider dropdown is usable
  - Check API Keys tab is readable

- [ ] **Theme Support**
  - Toggle light/dark mode
  - Check provider dropdown styles correctly
  - Check API Keys tab styles correctly

- [ ] **Accessibility**
  - Tab through provider dropdown with keyboard
  - Check focus states are visible
  - Check labels are readable by screen readers

---

## 🐛 Known Issues & Limitations

### Build Warnings (Non-Critical)
- Unauthorized hex colors in admin panel CSS (pre-existing)
- Doesn't affect functionality, will be fixed in next PR

### Ollama-Specific
- Requires Ollama to be installed and running on server
- Default model: `llama3.2:3b` (configurable via `OLLAMA_MODEL` env var)
- Default URL: `http://localhost:11434/v1` (configurable via `OLLAMA_BASE_URL`)

### Provider Selector
- Browser localStorage must be enabled for preference persistence
- Falls back to Anthropic if localStorage fails

---

## 📝 How to Report Issues

### Option 1: GitHub Issues (Preferred)
1. Go to https://github.com/mbuckingham74/meteo-weather/issues
2. Click "New Issue"
3. Use this template:

```markdown
**Bug Description:**
Brief description of the issue

**Steps to Reproduce:**
1. Go to...
2. Click on...
3. See error

**Expected Behavior:**
What should happen

**Actual Behavior:**
What actually happened

**Environment:**
- Device: (Desktop/Mobile)
- Browser: (Chrome/Firefox/Safari/etc.)
- OS: (Windows/Mac/iOS/Android)

**Screenshots:**
(If applicable)

**Feature:**
- [ ] User-Managed API Keys
- [ ] Provider Selector UI
- [ ] Ollama Support
- [ ] Other
```

### Option 2: Direct Message
- Text/email findings directly to Michael
- Include screenshots if possible

---

## ✨ Success Criteria

All three features are considered successful if:

✅ **User-Managed API Keys:**
- Can add, edit, delete keys without errors
- Test connection works for valid keys
- Usage tracking increments correctly
- Fallback to system defaults works

✅ **Provider Selector UI:**
- Dropdown is visible and usable
- Provider selection persists across refreshes
- All 7 providers are listed
- Questions can be asked with different providers

✅ **Ollama Support:**
- Ollama appears in provider lists
- If Ollama installed: queries work without API key
- If Ollama not installed: graceful error message

---

## 🎉 Bonus Testing (Optional)

### Edge Cases
- [ ] Add 100+ character API key (test field validation)
- [ ] Set monthly limit to 0 (test limit enforcement)
- [ ] Ask very long question (500 characters) with each provider
- [ ] Switch providers rapidly while questions are loading
- [ ] Test with browser localStorage disabled

### Performance
- [ ] Check page load times with provider selector
- [ ] Check API response times for different providers
- [ ] Monitor memory usage in browser DevTools

### Security
- [ ] Verify API keys are masked in UI (not shown in full)
- [ ] Check API keys aren't exposed in browser DevTools → Network tab
- [ ] Verify HTTPS is enforced on all requests

---

## 📞 Questions?

If anything is unclear or you encounter unexpected behavior:
- Check the [User API Keys Documentation](docs/development/USER_API_KEYS_IMPLEMENTATION.md)
- Ask Michael directly
- Open a GitHub issue for tracking

---

## 🙏 Thank You!

Your testing helps make Meteo Weather better for everyone. We appreciate you taking the time to thoroughly test these new features!

**Happy Testing!** 🚀

---

*Last Updated: November 13, 2025*
*Features Under Test: User-Managed API Keys, Ollama Support, Provider Selector UI*
