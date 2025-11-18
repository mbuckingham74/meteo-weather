# Complete Feature List

**Last Updated:** November 18, 2025

This document provides an exhaustive list of all features in the Meteo Weather App. For a quick overview, see the [main README](../README.md).

---

## 🌤️ Weather Forecasts

### Current Conditions
- Real-time temperature and feels-like temperature
- Current weather conditions with descriptions
- Wind speed and direction
- Humidity percentage
- Visibility distance
- Cloud cover percentage
- UV index
- Precipitation probability

### Multi-Day Forecasts
- **3-day forecast** - Short-term planning
- **7-day forecast** - Week-ahead view (default)
- **14-day forecast** - Extended outlook
- Daily high/low temperatures
- Precipitation amounts and probability
- Wind conditions
- Sunrise and sunset times
- Dynamic time labels

### Hourly Forecasts
- **48-hour detailed forecast** - Hourly breakdowns
- **240-hour extended** - Up to 10 days hourly data
- Interactive hourly chart with 5 view modes:
  - 📊 **Overview** - Combined temperature, feels-like, precipitation
  - 🔥 **High Temperature** - Focused high temp view with area fill
  - ❄️ **Low Temperature** - Detailed low temperature analysis
  - 🌧️ **Precipitation** - Rainfall amounts with probability overlay
  - 💨 **Wind Speed** - Wind analysis with averages
- Clickable summary cards for instant view switching
- Respects user's temperature unit preference (°C/°F)

### Weather Alerts
- Real-time severe weather warnings
- Weather watches and advisories
- Color-coded severity levels (warning, watch, advisory)
- Expandable alert details with:
  - Onset and end times
  - Affected areas
  - Severity classification
- **Interactive map markers** - Animated pulsing icons showing alert locations
- Keyboard-accessible expansion

---

## 🌧️ Interactive Radar Map

### Real Historical Data
- **Past 2 hours** of actual radar data (12-15 frames at 10-minute intervals)
- **30 minutes forecast** - Future precipitation predictions
- **RainViewer API integration** - Professional-grade radar
- **5-minute caching** - Automatic updates every 10 minutes

### Layer Controls
- 💧 **Precipitation Overlay** - Real historical radar from RainViewer
- ☁️ **Cloud Cover** - OpenWeather cloud layer
- 🌡️ **Temperature Overlay** - Temperature visualization
- ⚠️ **Weather Alerts** - Animated markers for active warnings
- 🌀 **Storm Tracking** - Movement direction and speed analysis

### Animation Features
- ▶️/⏸ **Play/Pause** - Animate through radar history
- **Variable Speed** - 0.5x, 1x, 2x playback options
- 🕐 **Time Selector** - Jump to any specific frame
- **Clickable Timeline** - Scrub through timestamps
- **Frame Counter** - Shows current position (e.g., "8 / 14")
- **Reduced Motion Support** - Automatically pauses for users with motion sensitivity

### Advanced Capabilities
- **Precipitation Intensity Legend** - Color-coded scale (light → moderate → heavy)
- **Weather Alerts Overlay** - Pulsing markers with severity-based colors and detailed popups
- **Storm Tracking Panel** - Real-time movement direction (N, NE, E, etc.) and speed in km/h
- 📷 **Screenshot Export** - Download current radar view as PNG
- 💾 **Data Export** - Export frame metadata as JSON for analysis
- **Full dark mode support** - All controls adapt to theme

---

## 📊 Interactive Charts (15+)

### Current Weather Charts
- **Temperature Bands** - Daily high/low/average temperature visualization
- **Feels-Like Temperature** - Compare actual temperature vs. feels-like temperature (wind chill/heat index)
- **Humidity & Dewpoint** - Dual-axis chart showing humidity percentage and dewpoint temperature
- **Sunrise & Sunset** - Visualize sunrise/sunset times with daylight duration calculations
- **Precipitation** - Daily rainfall and precipitation probability
- **Wind** - Wind speed and direction analysis
- **Cloud Cover** - Cloud coverage percentage over time
- **UV Index** - Daily UV exposure levels
- **Multi-Metric Overview** - Combined view of multiple weather metrics

### Historical Climate Analysis
- **This Day in History** - Historical weather data for the current date over the past 10 years
- **Historical Comparison** - Compare current forecasts against 10-year climate normals
- **Record Temperatures** - Track record highs and lows for date ranges
- **Temperature Probability** - Statistical temperature distribution analysis
- **25-Year Precipitation Analysis** - When asking about rain "today", see 25 years of rainfall data with statistics

---

## 📍 Location Management

### Universal Smart Search
- **ONE intelligent input** for both locations AND AI queries
- **Smart detection** automatically routes based on query complexity
- Question words trigger AI mode (what, when, where, how, should, will)
- Simple city names trigger location mode
- Invisible intelligence - users don't choose which mode

### Location Search & Discovery
- **Autocomplete** - Real-time suggestions as you type
- **Debounced search** - Optimized to reduce API calls (300ms delay)
- **Keyboard navigation** - Arrow keys and Enter to navigate results
- **Popular locations** - Quick access to major cities when search is empty
- **Geolocation detection** - Automatic detection of current location via browser
  - Multi-tier fallback system (browser geolocation → IP-based fallback)
  - Works even when reverse geocoding is rate-limited
  - Displays "Your Location" instead of raw coordinates

### Favorites System
- Save and manage favorite locations (requires authentication)
- Access favorites from user profile modal
- Automatic sync across all devices
- **Auto-migration** - localStorage favorites migrate to cloud on login
- Import/export capabilities

### Location Comparison
- Enhanced side-by-side weather comparison
- Compare 2-4 locations simultaneously
- **Time Range Selector** - Choose 7 days, 1/3/6 months, or 1/3/5 years
- **Pre-populated Examples** - Loads Seattle vs New Smyrna Beach comparison by default
- **Interactive "How to Use" guide** - Clickable example questions:
  - "Which city gets more rain annually?"
  - "Where is winter milder?"
  - "Which location has a milder summer?"
- **Weather Comparison Charts:**
  - Temperature band charts showing daily highs/lows
  - Precipitation totals and patterns
  - Wind speed comparisons
- **Historical Climate Data** - 10-year averages for long-term comparisons
- **Comparison Insights** - Automatic analysis showing:
  - Warmest, coldest, wettest locations
  - Temperature differences between locations

---

## 🔗 URL Routing & Navigation

### Shareable Location URLs
- Direct links to any city's weather:
  - `/location/seattle-wa` - Seattle weather
  - `/location/new-york-ny-usa` - New York weather
- Share links via text, email, or social media
- SEO-friendly URLs for better search indexing

### Browser Navigation
- **Full support for back/forward buttons**
- **Deep linking** - Load location directly from URL on page load
- **Clickable header** - "Meteo Weather" banner always links home (/)
- **Auto URL sync** - URL updates automatically when you select a new location
- **Bookmarkable** - Save favorite city URLs in your browser

---

## 🤖 AI-Powered Features

### AI Weather Assistant
- **Natural language queries** - Ask questions in plain English
- **Auto-submit from Universal Search** - No double-Enter required
- **Smart timeout handling** - 30s overall, 10s validation, 20s analysis
- **Two-step validation system:**
  - Quick spam check (~$0.001) before full AI analysis (~$0.005)
  - Client-side sanitization (FREE) blocks 20-30% of junk queries
- **Context-aware visualizations** - AI automatically detects query intent and displays interactive charts:
  - **Rain queries** → Live RainViewer radar map + 25-year historical precipitation table
  - **Temperature queries** → Color-coded temperature band chart
  - **Wind queries** → Wind speed and direction chart
  - **Forecast queries** → Interactive hourly chart with clickable views
- **Smart follow-up questions** - 2-3 contextual suggestions after each answer:
  - Zero API cost (generated server-side)
  - Instant submission on click
  - Encourages exploration
- **Confidence indicators** - Shows High/Medium/Low confidence with answer
- **Token transparency** - Displays exact token usage and cost per query
- **Error recovery** - Clear, actionable error messages
- **Weather context** - Displays current conditions and location with AI answer
- **Model:** Claude Sonnet 4.5

### AI Location Finder
- **Natural language climate search** - Describe your ideal climate:
  - Example: "I want somewhere 15 degrees cooler from June-October, less humid, not rainy"
- **Three-layer validation:**
  - **Client-side sanitization (FREE)** - Instant validation blocks spam
  - **AI quick validation (~$0.001)** - Verifies query is climate-related
  - **AI full parsing (~$0.005)** - Extracts structured criteria
- **Structured criteria extraction:**
  - Current location and time periods
  - Temperature preferences (delta or ranges)
  - Humidity and precipitation requirements
  - Lifestyle factors and deal-breakers
- **Cost transparency** - Shows token usage and estimated cost
- **Spam protection** - 65+ climate keyword detection, pattern blocking
- **Auto-location detection** - Automatically detects your current city on page load
- **Compact UI** - Clean prompt card with friendly button

---

## 💨 Air Quality Index (AQI)

### Real-Time Data
- Current air quality index with color-coded severity levels:
  - Good (0-50): Green
  - Moderate (51-100): Yellow
  - Unhealthy for Sensitive Groups (101-150): Orange
  - Unhealthy (151-200): Red
  - Very Unhealthy (201-300): Purple
  - Hazardous (301+): Maroon

### Pollutant Breakdown
- PM2.5 (Fine particulate matter)
- PM10 (Coarse particulate matter)
- O₃ (Ozone)
- NO₂ (Nitrogen dioxide)
- CO (Carbon monoxide)
- SO₂ (Sulphur dioxide)

### Additional Features
- Health recommendations based on current AQI levels
- Both AQI standards (US AQI and European AQI)
- 5-day hourly forecast
- Summary statistics

---

## 👤 User Authentication & Profiles

### Account Management
- User registration with email and password
- Secure login with JWT-based authentication
- Token refresh for extended sessions
- Password change functionality
- Profile management (name, email)

### Cloud Sync
- Favorites automatically sync across all devices
- Preferences sync (temperature units, theme, forecast days)
- Auto-migration of localStorage data on login

### User Preferences
- **Advanced Settings Page** - Comprehensive preferences management:
  - Email notification scheduling (daily reports, weekly summaries, weather alerts)
  - Multiple report locations with location search
  - Configurable report time (user's local timezone)
  - Language and theme preferences
  - One-click access from dashboard for logged-in users

### Profile Interface
- Tab-based interface for:
  - Profile (name, email)
  - Preferences (units, theme, forecast days)
  - Security (password change)
  - Favorites (saved locations)

---

## 🔑 User-Managed API Keys

### Multi-Provider Support
- **7 AI providers** supported:
  - Anthropic (Claude)
  - OpenAI (GPT)
  - Grok (xAI)
  - Google AI (Gemini)
  - Mistral AI
  - Cohere
  - Ollama (self-hosted, 100% free!)

### Security
- **AES-256-GCM encryption** with PBKDF2 key derivation (100k iterations)
- Encrypted storage in database
- Masked display in UI
- Test connection before saving

### Admin Panel UI
- **New "🔑 API Keys" tab** with full CRUD operations:
  - Add new API keys
  - Edit existing keys
  - Delete keys
  - Test connections
  - View usage statistics
  - Set default key per provider

### Features
- Usage tracking with monthly limits
- Default key selection (user key → system fallback)
- Test connection validation
- Automatic fallback to system defaults if user key fails

---

## 🎨 Theme System

### Theme Modes
- **Light Mode** - Clean, bright interface for daytime use
- **Dark Mode** - Easy on the eyes for low-light environments
- **Auto Mode** - Automatically follows system preferences

### Smart Persistence
- Theme saved to cloud for logged-in users
- localStorage for guest users
- Real-time sync across all devices for authenticated users

### Complete Dark Mode Coverage
All components fully optimized for dark theme:
- All charts and visualizations
- Location search and comparison views
- Weather alerts and air quality cards
- User profile and authentication modals
- Radar map controls
- Error messages and notifications
- Consistent theming across all UI elements

### Theme Toggle
- **Simple cycling toggle** - Click to cycle through Light → Dark → Auto modes
- Visual indicator showing current mode
- Instant theme switching with no page reload

---

## 🛡️ Error Handling & Connectivity

### ErrorMessage Component
Unified error display system with 4 modes:
- **Inline** - Field-level errors for forms (polite ARIA live region)
- **Toast** - Dismissible notifications with auto-hide (top-right corner)
- **Banner** - Persistent warnings across top of page (connectivity issues)
- **Modal** - Critical errors requiring acknowledgment (center overlay)

### Connectivity Features
- **OfflineBanner** - Automatic online/offline status monitoring
- **Slow connection warnings** - Optional detection of degraded network
- **Retry logic** - useRetryHandler hook with exponential backoff (1s → 2s → 4s)
- **Error analytics** - Tracks error patterns, frequency, and resolution

### Accessibility
- WCAG 2.1 AA compliant
- Proper ARIA roles and labels
- Screen reader announcements
- Keyboard-accessible error dismissal

### Configuration
- Environment-aware timeout settings:
  - VITE_WEATHER_TIMEOUT
  - VITE_AI_TIMEOUT
  - VITE_API_TIMEOUT
- Toast container with z-index management
- Full dark mode support

---

## ⚙️ Customization

### Chart Controls
- Show/hide individual charts
- Quick toggle - Show all or hide all with one click
- Persistent settings for logged-in users
- Visual chart preview before expanding

### Unit Preferences
- **Temperature unit toggle** - Global Celsius/Fahrenheit switch:
  - Persists to localStorage for guests
  - Cloud-synced for authenticated users
  - Works consistently on all pages including location comparison

### Display Options
- Forecast duration selector (3, 7, 14 days)
- Chart visibility preferences
- Mobile-friendly responsive design

---

## 🔧 Admin Panel (Site Owners)

### Comprehensive Dashboard
6-tab admin interface for system monitoring and management:

#### 📊 Overview
- System health metrics
- Most queried locations
- Top-level statistics

#### 👥 Users
- Total users count
- Active users (30 days)
- New signups (7 days)
- User engagement metrics

#### 🌤️ Weather Data
- Location statistics
- Weather records count
- Most queried cities
- Data sources breakdown

#### 🤖 AI Usage
- Total AI queries
- Token usage tracking
- **Estimated costs in USD**:
  - Input tokens: $3 per million tokens
  - Output tokens: $15 per million tokens
  - Average query cost: ~$0.005-0.01
- Confidence breakdown (high/medium/low)
- Popular shared answers

#### 💾 Cache
- Cache hit rate monitoring
- Valid/expired entries
- One-click cleanup tools:
  - Clear expired cache (safe, frees space)
  - Clear all cache (emergency only)
- Performance metrics
- Source-by-source breakdown

#### 🗄️ Database
- Total database size
- Table statistics
- Largest tables
- Storage optimization recommendations

### Access Control
- Database-based admin system
- First user = auto-admin
- JWT-protected routes
- Admin-only endpoints

### Privacy-First Design
Admins can only see aggregated, anonymized data:
- ✅ Total user counts, system metrics, aggregated statistics
- ❌ Cannot view passwords, private AI conversations, individual user activity

### Security & Transparency
- Privacy policy updated with admin data disclosures
- Security audit documentation (9.4/10 score)
- Clear separation between admin access and user privacy
- Full documentation (2,100+ lines) in `docs/admin/`

**Route:** `http://localhost:3000/admin` (requires authentication + admin status)

---

## 🚀 Performance & Caching

### Intelligent API Caching
MySQL-based caching layer with dramatic improvements:
- ⚡ **99% reduction** in API requests for repeat queries
- 🏎️ **282x faster** responses (from 850ms to 3ms)
- 💾 Automatic cleanup of expired entries every hour

### Cache TTL (Time To Live)
- Current Weather: 30 minutes
- Forecasts: 6 hours
- Historical Data: 7 days
- Air Quality: 60 minutes
- Climate Stats: 30 days

### Request Throttling
- 🚦 **Max 3 concurrent requests** - Prevents API stampeding
- ⏱️ **100ms minimum interval** - Spaces out requests
- 🔄 **Exponential backoff retry** - Automatic retry with delays
- 🛡️ **Graceful fallbacks** - Works even when API limits hit

### Benefits
- Reduced API costs (stay within free tier limits)
- Faster page loads for cached data
- Better user experience with instant responses
- Automatic expiration ensures fresh data

---

## ♿ Accessibility (WCAG 2.1 Level AA)

**Accessibility Score: 8.5-9/10** - Full WCAG 2.1 Level AA compliance + one AAA criterion

### WCAG 2.1 Standards Compliance

**Level A (Foundation):**
- ✅ 1.1.1 Non-text Content
- ✅ 1.3.1 Info & Relationships
- ✅ 2.1.1 Keyboard
- ✅ 2.4.1 Bypass Blocks
- ✅ 2.4.3 Focus Order

**Level AA (Target):**
- ✅ 1.4.3 Contrast (Minimum) - 4.5:1 ratio maintained
- ✅ 2.4.7 Focus Visible - Visible focus indicators (3px purple outline)
- ✅ 3.3.1 Error Identification
- ✅ 3.3.3 Error Suggestion - 200+ contextual hints
- ✅ 4.1.3 Status Messages - Live region announcements

**Level AAA (Bonus):**
- ✅ 2.3.3 Animation from Interactions - Reduced motion support

### Accessibility Features

**Screen Reader Support:**
- Live region announcements for weather loading/errors
- Proper ARIA labels on all interactive elements
- Descriptive button labels
- Hidden text for decorative icons
- Status announcements for async operations

**Keyboard Navigation:**
- Complete keyboard access to all features
- Modal focus traps (Tab/Shift+Tab wrapping)
- Escape key to close modals
- Logical tab order across all pages
- Focus restoration when modals close
- Arrow key support for interactive elements

**Motion & Animation:**
- Automatic detection of `prefers-reduced-motion`
- Radar animation auto-pauses for motion-sensitive users
- All transitions respect user preferences
- Visual indicator when animations disabled
- Fallback `.reduced-motion` class

**Enhanced Error Handling:**
- 200+ contextual error suggestions
- Browser-specific instructions
- Priority suggestions for quick fixes
- Contextual help text
- Multiple display modes

**Form Accessibility:**
- All inputs have proper labels
- Error messages announced to screen readers
- Clear validation feedback
- Helpful placeholder text
- Focus management

**Color & Contrast:**
- All text meets 4.5:1 contrast minimum
- Color not used as sole indicator
- High contrast focus indicators
- Theme support (light/dark/auto)

**Mobile Accessibility:**
- Touch targets 44×44px minimum
- Responsive layouts for screen readers
- Zoom support up to 200%
- No horizontal scrolling

---

## 🔐 Security Features

**Security Score: 9.4/10** - Enterprise-grade security with 0 vulnerabilities

### Multi-Layer Protection

**1. Gitleaks Secret Scanning:**
- Pre-commit hook blocks secrets before git commit
- GitHub Actions scan on every push
- Weekly scheduled scans
- Custom detection rules
- SARIF report integration

**2. Dependabot Automated Monitoring:**
- Vulnerability alerts in real-time
- Automated security PRs
- Weekly dependency checks
- Multi-ecosystem support
- Zero current vulnerabilities

**3. npm Security Audits:**
- Regular dependency scanning
- 0 vulnerabilities in production
- Automated fixes via npm overrides
- Fixed CVEs documented

**4. CodeQL Analysis:**
- Automated code security scanning
- JavaScript vulnerability detection
- Weekly scheduled scans
- GitHub Security tab integration

**5. Rate Limiting:**
- API endpoint protection
- Auth endpoint protection (5/15min)
- AI endpoint protection (10/hour)
- Prevents abuse and cost overruns

**6. Security Headers:**
- Content Security Policy (CSP)
- X-Frame-Options (clickjacking protection)
- X-Content-Type-Options (MIME sniffing)
- Strict Transport Security (HSTS)
- Permissions-Policy

### Security Best Practices
- JWT-based authentication
- Bcrypt password hashing
- Environment variable isolation
- API key encryption (AES-256-GCM)
- Secret rotation guidelines
- Gitignored sensitive files

---

## 📱 Progressive Web App (PWA)

### PWA Features
- **Install as app** - Add to home screen on mobile/desktop
- **Offline mode** - Basic functionality without internet
- **Smart caching** - Intelligent service worker caching
- **App-like experience** - Standalone window, app icon

### Service Worker
- Caches static assets
- Network-first strategy for API calls
- Fallback to cache when offline
- Automatic updates

---

## 🎯 Testing & Quality

### Test Suite
- **476/476 tests passing** - Zero failures
- Frontend: Jest + React Testing Library
- Backend: Jest + Supertest
- **Coverage:** Frontend 33.65%, Backend 60-65%

### Automated Testing
- Multi-version testing (Node 20.x LTS)
- Backend linting and unit tests
- Frontend testing with Jest
- Production build validation
- Docker image verification
- Docker Compose config validation

### Quality Assurance
- Pre-commit hooks (Husky)
- ESLint + Prettier
- Automated regression tests
- Accessibility checks
- Security scanning

---

## 🌐 Deployment & Infrastructure

### Automated Deployment
- 🚀 Automatic deployment on every push to `main`
- 🔐 Secure SSH authentication
- ✅ Deployment script on server
- 🔍 Post-deployment health checks
- 📊 Deployment summary with commit info
- ⚡ Zero-downtime deployments

### CI/CD Pipeline
- GitHub Actions workflows
- Parallel job execution (9 jobs)
- 50-70% faster with caching
- Security scanning integration
- Docker image publishing
- Automated testing

### Production Requirements
- **Minimal:** $6/month VPS (1 vCPU, 1 GB RAM)
- **Recommended:** $12/month VPS (2 vCPU, 2 GB RAM)
- Docker + Docker Compose
- Nginx reverse proxy
- MySQL 8.0

---

## 📊 Monitoring & Analytics

### System Monitoring
- Health check endpoint
- Database connection monitoring
- API response time tracking
- Cache performance metrics
- Error rate monitoring

### Admin Dashboard
- Real-time system statistics
- User engagement metrics
- API usage tracking
- Cost monitoring (AI tokens)
- Cache efficiency analysis
- Database size tracking

---

This is a comprehensive list of all features. For implementation details, see the specific documentation in the [docs/](../docs/) folder.

**Last Updated:** November 18, 2025
