# 🌤️ Meteo Weather App - Comprehensive Developer Onboarding

## Table of Contents
1. [Core Architecture Patterns](#core-architecture-patterns)
2. [Critical Integration Points](#critical-integration-points)
3. [Feature Systems](#feature-systems)
4. [Development Workflows](#development-workflows)
5. [Hidden Complexity & Gotchas](#hidden-complexity--gotchas)
6. [Production Deployment](#production-deployment)
7. [Quick Reference](#quick-reference)
8. [Session Startup Checklist](#session-startup-checklist)

---

## 1. Core Architecture Patterns

### 1.1 React Context Provider Hierarchy

The application uses a **nested context provider pattern** to share global state across the entire app. The hierarchy is critical:

```javascript
<ErrorBoundary>                    // Outermost: Catches all React errors
  <AuthProvider>                   // Authentication state (JWT tokens)
    <ThemeProvider>                // Light/Dark/Auto theme management
      <TemperatureUnitProvider>    // Global °C/°F preference
        <LocationProvider>         // Current location selection
          <AppContent />
        </LocationProvider>
      </TemperatureUnitProvider>
    </ThemeProvider>
  </AuthProvider>
</ErrorBoundary>
```

**Why this order matters:**
- **ErrorBoundary first**: Catches errors from all providers below it
- **AuthProvider second**: User authentication affects theme/unit preferences (cloud sync)
- **TemperatureUnitProvider before LocationProvider**: Unit preference needed when rendering location data

**Key Pattern**: Page-level components use hooks (`useTemperatureUnit()`, `useLocation()`) to access context, then **pass values as props** to child components. This prevents unnecessary re-renders and makes components testable.

```javascript
// ❌ BAD: Child component accessing context directly
function TemperatureDisplay() {
  const { unit } = useTemperatureUnit(); // Creates tight coupling
  return <div>{unit}</div>;
}

// ✅ GOOD: Parent accesses context, passes prop
function WeatherDashboard() {
  const { unit } = useTemperatureUnit();
  return <TemperatureDisplay unit={unit} />; // Child is pure, testable
}
```

### 1.2 Service Layer Architecture

**Rationale**: Centralize all external API calls in service files to:
- Enable easy mocking for tests
- Provide single source of truth for API endpoints
- Implement consistent error handling
- Abstract away network complexity from components

**Backend Services** (`backend/services/`):
- **weatherService.js**: Visual Crossing API client with throttling & retry logic
- **cacheService.js**: Database-backed response caching (reduces API costs by 99%)
- **aiLocationFinderService.js**: Claude API integration for NLP queries
- **authService.js**: JWT generation/validation
- **geocodingService.js**: Coordinate ↔ address translation

**Frontend Services** (`frontend/src/services/`):
- **weatherApi.js**: Proxy to backend `/api/weather/*` endpoints
- **radarService.js**: RainViewer API client with 5-minute in-memory cache
- **geolocationService.js**: 3-tier location detection (GPS → Browser → IP fallback)
- **authApi.js**: Authentication API client with token refresh

**Critical Pattern**: Backend services use the `withCache()` wrapper:

```javascript
// backend/services/weatherService.js
async function getCurrentWeather(location) {
  return withCache(
    'visual_crossing',                    // API source identifier
    { endpoint: 'current', location },    // Cache key parameters
    async () => {
      // Actual API call logic
      const result = await makeApiRequest(url);
      return result;
    },
    CACHE_TTL.CURRENT_WEATHER             // 30 minutes
  );
}
```

**Why this matters**:
- Cache is checked **before** the API function runs
- Cache key is MD5 hash of `apiSource + params` (consistent, collision-resistant)
- TTL varies by data type: current weather (30min), forecasts (6hr), historical (7 days)

### 1.3 Client-Side Routing

**Why custom routing?** The app uses a lightweight custom router instead of React Router to:
- Minimize bundle size (Create React App already heavy)
- Full control over URL structure and navigation behavior
- Support shareable location-specific URLs

**URL Structure**:
```
/                           → Dashboard (default location)
/location/seattle-wa        → Weather for Seattle
/location/new-york-ny-usa   → Weather for New York
/compare                    → Location comparison tool
/ai-weather?q=Will+it+rain  → AI weather assistant with pre-filled question
/privacy                    → Privacy policy
```

**Implementation** (`frontend/src/App.js`):

```javascript
// 1. Parse URL on mount and browser navigation events
useEffect(() => {
  const handleNavigation = async () => {
    const route = getCurrentRoute(); // Parses window.location.pathname

    if (route.path === 'location' && route.params.slug) {
      // Load location from URL slug
      const searchQuery = parseLocationSlug(route.params.slug);
      const results = await geocodeLocation(searchQuery, 1);
      selectLocation(results[0]);
    }

    setCurrentView(route.path); // Update displayed component
  };

  handleNavigation();
  window.addEventListener('popstate', handleNavigation); // Back/forward buttons
  return () => window.removeEventListener('popstate', handleNavigation);
}, [selectLocation]);

// 2. Intercept all <a> clicks for client-side navigation
useEffect(() => {
  const handleClick = (e) => {
    if (e.target.tagName === 'A' && e.target.href.startsWith(window.location.origin)) {
      e.preventDefault();
      window.history.pushState({}, '', url.pathname);
      window.dispatchEvent(new PopStateEvent('popstate', { state: {} }));
    }
  };

  document.addEventListener('click', handleClick);
  return () => document.removeEventListener('click', handleClick);
}, []);
```

**URL State Caching**: When navigating to a location route, the full location object is stored in `history.state` to avoid re-geocoding on back/forward navigation:

```javascript
// frontend/src/utils/urlHelpers.js
export function updateLocationUrl(location) {
  const slug = createLocationSlug(location.address);
  window.history.pushState(
    { location },  // ← Full location object cached in history
    '',
    `/location/${slug}`
  );
}
```

### 1.4 Data Flow Pattern

**Request Flow** (Frontend → Backend → API):

```
1. Component calls custom hook
   └─ useWeatherData.js: useForecast(location, days)

2. Hook calls service layer
   └─ weatherApi.js: fetchForecast(location, days)

3. Service makes HTTP request
   └─ fetch(`${API_URL}/api/weather/forecast/${location}?days=${days}`)

4. Backend route handler
   └─ routes/weather.js: GET /forecast/:location

5. Backend service with caching
   └─ weatherService.js: getForecast(location, days)
        ├─ Check cache first (30min TTL)
        ├─ If miss, call Visual Crossing API
        └─ Store result in database cache

6. Response bubbles back up
   └─ Hook stores in state → Component re-renders
```

**Why this complexity?**
- **Separation of concerns**: Components don't know about APIs
- **Reusability**: Multiple components can use same hook
- **Caching**: 99% of requests served from cache (cost savings)
- **Error handling**: Centralized retry logic and fallbacks

---

## 2. Critical Integration Points

### 2.1 Backend ↔ Frontend Communication

**Environment-Aware API URL** (`frontend/src/services/weatherApi.js`):

```javascript
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';
```

**Why this matters**:
- Development: `localhost:5001` (docker-compose backend)
- Production: `https://api.meteo-beta.tachyonfuture.com` (set in `.env.production`)
- Docker: Backend container accessible as `backend:5001` internally

**CORS Configuration** (`backend/server.js`):

```javascript
const corsOptions = process.env.NODE_ENV === 'production'
  ? { origin: process.env.CORS_ORIGIN || 'https://meteo-app.example.com' }
  : {}; // Allow all origins in development

app.use(cors(corsOptions));
```

**Critical Gotcha**: If you see CORS errors in production, check:
1. `CORS_ORIGIN` environment variable matches frontend domain
2. Frontend is making requests to correct API URL
3. Nginx Proxy Manager has proper forwarding rules

### 2.2 Visual Crossing Weather API Integration

**Single API Strategy**: The app uses **Visual Crossing exclusively** for all weather data:
- Current conditions
- Forecasts (up to 15 days)
- Historical data (10+ years)
- Hourly data (up to 240 hours)

**Why not OpenWeather?**
- Visual Crossing has 10+ years of historical data
- Single API = simpler architecture
- Cost-effective for proof-of-concept ($99 budget)

**API Rate Limiting** (`backend/services/weatherService.js`):

```javascript
const MAX_CONCURRENT_REQUESTS = 3;
const MIN_REQUEST_INTERVAL = 100; // ms between requests

async function throttleRequest(requestFn) {
  // Wait if too many concurrent requests
  while (activeRequests >= MAX_CONCURRENT_REQUESTS) {
    await new Promise(resolve => setTimeout(resolve, 50));
  }

  // Ensure minimum interval between requests
  const timeSinceLastRequest = Date.now() - lastRequestTime;
  if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
    await new Promise(resolve => setTimeout(resolve, MIN_REQUEST_INTERVAL - timeSinceLastRequest));
  }

  // Execute request
  activeRequests++;
  lastRequestTime = Date.now();
  try {
    return await requestFn();
  } finally {
    activeRequests--;
  }
}
```

**Why throttling?**
- Prevents API stampeding when dashboard loads (13+ chart components)
- Avoids rate limit errors (429) during high traffic
- Queues requests instead of failing them

**Exponential Backoff Retry**:

```javascript
async function makeApiRequest(url, retries = 2, delay = 1000) {
  try {
    const response = await axios.get(url, { timeout: 10000 });
    return { success: true, data: response.data };
  } catch (error) {
    if (error.response?.status === 429 && retries > 0) {
      await new Promise(resolve => setTimeout(resolve, delay));
      return makeApiRequest(url, retries - 1, delay * 2); // Double delay each retry
    }
    return { success: false, error: error.message };
  }
}
```

**Cache TTL Strategy** (`backend/services/cacheService.js`):

```javascript
const CACHE_TTL = {
  CURRENT_WEATHER: 30,      // 30 minutes (weather changes slowly)
  FORECAST: 360,            // 6 hours (forecasts update 2x/day)
  HISTORICAL: 10080,        // 7 days (historical data never changes)
  AIR_QUALITY: 60,          // 60 minutes
  CLIMATE_STATS: 43200      // 30 days (long-term averages stable)
};
```

**Performance Impact**:
- First request: 850ms (API call)
- Cached requests: 3ms (database lookup) = **282x faster**
- Cost savings: $0.01/query → $0.0001/cached query = **99% reduction**

### 2.3 Claude AI Integration (Anthropic API)

**Two-Step Validation System**:

1. **Quick Validation** (~2 seconds, ~200 tokens):
   ```javascript
   // backend/services/aiLocationFinderService.js
   async function validateQuery(userInput) {
     const response = await anthropic.messages.create({
       model: 'claude-sonnet-4-20250514',
       max_tokens: 200,
       messages: [{
         role: 'user',
         content: userInput
       }]
     });

     // Returns: { isValid: true/false, reason: "..." }
   }
   ```

2. **Full Parsing** (~5 seconds, ~1000 tokens):
   ```javascript
   async function parseLocationQuery(userInput, currentLocation) {
     const response = await anthropic.messages.create({
       model: 'claude-sonnet-4-20250514',
       max_tokens: 5000,
       messages: [{
         role: 'user',
         content: `User query: ${userInput}`
       }]
     });

     // Returns structured JSON:
     {
       current_location: "New Smyrna Beach, FL",
       time_period: { start: "June", end: "October" },
       temperature_delta: -15,
       humidity: "lower",
       precipitation: "less",
       lifestyle_factors: ["good community feel"]
     }
   }
   ```

**Why two steps?**
- Validation prevents spam/abuse before expensive parsing
- Cost breakdown: $0.002 (validate) + $0.008 (parse) = $0.01 per query
- Budget: $99 = ~10,000 queries

**Markdown Stripping Gotcha**:

```javascript
// Claude sometimes wraps responses in markdown code blocks
let textContent = response.content[0].text;
textContent = textContent.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
const result = JSON.parse(textContent);
```

**Why this happens**: Claude is trained on markdown-formatted code, so it sometimes adds formatting even when asked for "ONLY valid JSON."

**Environment Variable Naming**:

```javascript
const anthropic = new Anthropic({
  apiKey: process.env.METEO_ANTHROPIC_API_KEY, // Note: METEO_ prefix
});
```

**Why `METEO_ANTHROPIC_API_KEY` instead of `ANTHROPIC_API_KEY`?**
The developer uses Claude Code CLI (the tool building this app), which also uses `ANTHROPIC_API_KEY`. The prefix prevents conflicts during development.

### 2.4 Database Schema & Relationships

**Entity Relationship Diagram** (simplified):

```
locations (id, latitude, longitude, city_name, country)
    ↓ (1:N)
weather_data (location_id, observation_date, temperature_high, ...)
    ↓ (1:N)
climate_stats (location_id, month, avg_temp_high, record_high, ...)

users (id, email, password_hash, preferred_temp_unit)
    ↓ (1:N)
user_favorites (user_id, location_id)

api_cache (cache_key, location_id, response_data, expires_at)
```

**Key Design Decisions**:

1. **Unique Constraints**:
   ```sql
   UNIQUE KEY unique_location (latitude, longitude)  -- Prevent duplicate cities
   UNIQUE KEY unique_observation (location_id, observation_date, observation_time)
   ```

2. **Indexes for Performance**:
   ```sql
   INDEX idx_cache_key (cache_key)        -- Fast cache lookups
   INDEX idx_expiry (expires_at)          -- Efficient expired cache cleanup
   INDEX idx_location_date (location_id, observation_date)  -- Weather queries
   ```

3. **JSON Columns** (MySQL 5.7+):
   ```sql
   request_params JSON    -- Stores arbitrary API request parameters
   response_data JSON     -- Stores full API responses (flexible schema)
   ```

**Why JSON columns?**
- API responses vary by endpoint (current vs forecast vs historical)
- Avoids creating separate tables for each response type
- Enables querying nested data: `WHERE JSON_EXTRACT(response_data, '$.temperature') > 30`

**Cache Cleanup Strategy**:

```javascript
// Automatic cleanup every hour
setInterval(() => {
  clearExpiredCache().then(count => {
    console.log(`Cleaned up ${count} expired cache entries`);
  });
}, 60 * 60 * 1000);
```

### 2.5 Authentication Flow

**JWT-Based Stateless Authentication**:

```
1. User submits email/password
   └─ POST /api/auth/login

2. Backend validates credentials
   └─ bcrypt.compare(password, user.password_hash)

3. Generate JWT access token
   └─ jwt.sign({ userId, email }, SECRET, { expiresIn: '1h' })

4. Frontend stores token in memory
   └─ AuthContext state (NOT localStorage for security)

5. Subsequent requests include token
   └─ Authorization: Bearer <token>

6. Middleware validates token
   └─ verifyAccessToken(token) → req.user = { userId, email }
```

**Why NOT localStorage?**
- Vulnerable to XSS attacks (malicious scripts can steal tokens)
- Session tokens stored in memory = cleared on tab close
- Refresh tokens (future) would use httpOnly cookies

**Protected Route Pattern**:

```javascript
// backend/routes/user.js
const { authenticateToken } = require('../middleware/authMiddleware');

router.get('/profile', authenticateToken, async (req, res) => {
  // req.user populated by middleware
  const userId = req.user.userId;
  // Fetch user data...
});
```

**Optional Authentication Pattern**:

```javascript
// Used for routes that work with/without auth
router.get('/weather/forecast/:location', optionalAuth, async (req, res) => {
  const userId = req.user?.userId; // May be undefined
  // If logged in, personalize response; otherwise, generic
});
```

---

## 3. Feature Systems

### 3.1 Universal Smart Search Implementation

**The Problem**: Traditional weather apps have separate inputs for location search and AI queries. Users don't discover AI features.

**The Solution**: One input that intelligently routes queries based on content.

**Detection Logic** (`frontend/src/components/ai/UniversalSearchBar.jsx`):

```javascript
function isComplexQuery(input) {
  const text = input.toLowerCase().trim();

  // Question indicators
  if (text.includes('?')) return true;

  // Question words
  const questionWords = ['what', 'where', 'when', 'why', 'how', 'should', 'will', 'can'];
  if (questionWords.some(word => text.startsWith(word + ' '))) return true;

  // Comparative/analytical words
  const analyticalWords = ['similar', 'warmer', 'cooler', 'compare', 'climate'];
  if (analyticalWords.some(word => text.includes(word))) return true;

  // Otherwise, simple location
  return false;
}
```

**Routing Logic**:

```javascript
handleSubmit() {
  if (isComplexQuery(query)) {
    // Complex → Navigate to AI page with question
    navigateToAIWeather(query);
  } else {
    // Simple → Geocode and update location
    const results = await geocodeLocation(query);
    selectLocation(results[0]);
  }
}
```

**Examples**:

| Input | Detection | Action |
|-------|-----------|--------|
| "Seattle" | Simple | Geocode → Update location |
| "Will it rain today?" | Complex (?) | Navigate to AI page |
| "What's similar to Seattle climate?" | Complex (similar, climate) | Navigate to AI page |
| "New York, NY" | Simple | Geocode → Update location |

**UX Enhancement**: Real-time hint shows routing decision:

```javascript
{query.trim() && (
  <div className="universal-hint">
    {isComplexQuery(query) ? (
      <span className="hint-ai">🤖 AI will analyze this question</span>
    ) : (
      <span className="hint-location">📍 Searching for location</span>
    )}
  </div>
)}
```

### 3.2 AI Weather Assistant Auto-Submit

**The Challenge**: User types question in Universal Search → navigates to AI page → has to press Enter again. Friction!

**The Solution**: Auto-submit when question is pre-filled from URL query parameter.

**Implementation** (`frontend/src/components/ai/AIWeatherPage.jsx`):

```javascript
const [question, setQuestion] = useState('');
const [hasAutoSubmitted, setHasAutoSubmitted] = useState(false);

// 1. Extract question from URL on mount
useEffect(() => {
  const params = new URLSearchParams(window.location.search);
  const q = params.get('q');
  if (q) {
    setQuestion(decodeURIComponent(q));
  }
}, []);

// 2. Auto-submit when both question and location are ready
useEffect(() => {
  if (question && location && !hasAutoSubmitted && !loading) {
    setHasAutoSubmitted(true);
    handleAskQuestion();
  }
}, [question, location, hasAutoSubmitted, loading]);
```

**Circular Dependency Prevention**:

**❌ BAD** (causes infinite loop):
```javascript
useEffect(() => {
  handleAskQuestion(); // handleAskQuestion changes state → re-triggers effect
}, [handleAskQuestion]);
```

**✅ GOOD** (stable dependency):
```javascript
const handleAskQuestion = useCallback(async () => {
  // Logic here
}, [location, question]); // Only recreated when location/question change

useEffect(() => {
  if (shouldAutoSubmit) {
    handleAskQuestion();
  }
}, [question, location, shouldAutoSubmit]); // Explicit dependencies
```

**Timeout Handling** (30-second overall timeout):

```javascript
const OVERALL_TIMEOUT = 30000;
const VALIDATION_TIMEOUT = 10000;
const ANALYSIS_TIMEOUT = 20000;

// Create abort controller
const abortController = new AbortController();

// Set overall timeout
const overallTimer = setTimeout(() => {
  abortController.abort();
  setError('Request timed out. The AI service took too long to respond.');
  setLoading(false);
}, OVERALL_TIMEOUT);

try {
  // Validation step (10s timeout)
  const validationResponse = await fetch('/api/ai-weather/validate', {
    signal: abortController.signal,
    // ...
  });

  // Analysis step (20s timeout)
  const analysisResponse = await fetch('/api/ai-weather/analyze', {
    signal: abortController.signal,
    // ...
  });
} finally {
  clearTimeout(overallTimer);
}
```

### 3.3 Radar Map Data Pipeline

**Data Source**: RainViewer API (free tier: 1000 requests/IP/minute, zoom limited to 10)

**Pipeline**:

```
1. Frontend requests radar data
   └─ radarService.js: getRadarMapData()

2. Check 5-minute in-memory cache
   └─ If fresh, return cached data
   └─ If stale, fetch from RainViewer

3. RainViewer returns frame metadata
   {
     "radar": {
       "past": [
         { "time": 1635264600, "path": "/20211026/1450/256" },
         { "time": 1635265200, "path": "/20211026/1500/256" },
         ...
       ],
       "nowcast": [
         { "time": 1635265800, "path": "/20211026/1510/256" }
       ]
     },
     "host": "https://tilecache.rainviewer.com"
   }

4. Build tile URLs for Leaflet
   └─ buildRadarTileUrl(host, path)
   → "https://tilecache.rainviewer.com/20211026/1450/256/{z}/{x}/{y}/2/1_0.png"

5. Leaflet TileLayer renders radar overlay
   └─ Leaflet replaces {z}/{x}/{y} with actual tile coordinates
```

**Caching Strategy**:

```javascript
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
let cachedData = null;
let cacheTimestamp = null;

export async function getRadarMapData() {
  if (cachedData && Date.now() - cacheTimestamp < CACHE_DURATION) {
    return cachedData; // Use cache
  }

  const response = await fetch(RAINVIEWER_API_URL);
  const data = await response.json();

  cachedData = data;
  cacheTimestamp = Date.now();

  return data;
}
```

**Why 5-minute cache?**
- RainViewer updates every 10 minutes
- Caching for 5 minutes = 50% reduction in API calls
- Users won't notice 5-minute-old radar data

**Animation Implementation** (`frontend/src/components/weather/RadarMap.jsx`):

```javascript
const [currentFrameIndex, setCurrentFrameIndex] = useState(0);
const [isPlaying, setIsPlaying] = useState(false);
const [playbackSpeed, setPlaybackSpeed] = useState(1); // 0.5x, 1x, 2x

useEffect(() => {
  if (!isPlaying || frames.length === 0) return;

  const interval = setInterval(() => {
    setCurrentFrameIndex(prev => (prev + 1) % frames.length); // Loop
  }, 1000 / playbackSpeed); // Adjust interval by speed

  return () => clearInterval(interval);
}, [isPlaying, playbackSpeed, frames.length]);
```

### 3.4 PWA Offline Capabilities

**Service Worker Strategy** (`frontend/public/service-worker.js`):

| Resource Type | Strategy | Cache Duration | Rationale |
|---------------|----------|----------------|-----------|
| Static assets (JS, CSS, images) | Cache-first | Indefinite | Rarely change, instant load |
| API calls | Network-first | 30 minutes | Fresh data preferred, offline fallback |
| Weather data | Stale-while-revalidate | 15 minutes | Show cached immediately, update in background |
| Navigation | Network-first | N/A | Offline fallback page |

**Stale-While-Revalidate Implementation**:

```javascript
async function staleWhileRevalidateStrategy(request) {
  const cache = await caches.open(API_CACHE);
  const cachedResponse = await cache.match(request);

  // Fetch from network in parallel
  const networkResponsePromise = fetch(request)
    .then(response => {
      cache.put(request, response.clone()); // Update cache in background
      return response;
    });

  // Return cached response immediately if available
  if (cachedResponse) {
    return cachedResponse; // User sees instant data
  }

  // If no cache, wait for network
  return networkResponsePromise;
}
```

**Why this strategy?**
- User sees weather data instantly (cached)
- Cache updates in background (fresh on next visit)
- Zero perceived latency

**Offline Detection**:

```javascript
// Offline fallback page
if (isNavigation) {
  const offlineResponse = await caches.match('/offline.html');
  if (offlineResponse) {
    return offlineResponse;
  }
}
```

**Cache Size Limits**:

```javascript
const MAX_DYNAMIC_CACHE_SIZE = 50;
const MAX_API_CACHE_SIZE = 100;

async function limitCacheSize(cacheName, maxSize) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();

  if (keys.length > maxSize) {
    const deleteCount = keys.length - maxSize;
    for (let i = 0; i < deleteCount; i++) {
      await cache.delete(keys[i]); // FIFO deletion
    }
  }
}
```

---

## 4. Development Workflows

### 4.1 How to Add a New Chart Component

**Step 1: Create Chart Component** (`frontend/src/components/charts/YourChart.jsx`):

```javascript
import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { formatTemperature } from '../../utils/weatherHelpers';
import './charts.css'; // Centralized chart styles

function YourChart({ data, unit }) {
  return (
    <div className="chart-container" id="chart-yourchart">
      <h3 className="chart-title">Your Chart Title</h3>
      <ResponsiveContainer width="100%" height={450}>
        <LineChart data={data}>
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="value"
            stroke="var(--accent-primary)"
            strokeWidth={2}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default YourChart;
```

**Step 2: Add to WeatherDashboard** (`frontend/src/components/weather/WeatherDashboard.jsx`):

```javascript
import YourChart from '../charts/YourChart';

// Add to visibility state
const [visibleCharts, setVisibleCharts] = useState({
  // ...existing charts
  yourChart: true // Enable by default
});

// Add navigation button
<button onClick={() => scrollToChart('chart-yourchart')}>
  Your Chart
</button>

// Add to chart section
{visibleCharts.yourChart && (
  <YourChart
    data={data?.forecast || []}
    unit={unit}
  />
)}
```

**Step 3: Update Chart CSS** (`frontend/src/components/charts/charts.css`):

```css
/* Charts use CSS variables for theming */
#chart-yourchart .recharts-line {
  stroke: var(--accent-primary, #4c7ce5);
}

#chart-yourchart .recharts-text {
  fill: var(--text-primary, #0f172a);
}
```

**Key Patterns**:
- Always use `var(--css-variable, fallback)` for colors
- Set chart height to `450px` for consistency
- Use `id="chart-yourchart"` for scroll navigation
- Accept `unit` prop from parent (global temperature preference)

### 4.2 How to Add a New API Endpoint

**Step 1: Create Backend Route** (`backend/routes/yourFeature.js`):

```javascript
const express = require('express');
const router = express.Router();
const { authenticateToken, optionalAuth } = require('../middleware/authMiddleware');

// Public endpoint
router.get('/public-data', async (req, res) => {
  try {
    const data = await yourService.getPublicData();
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Protected endpoint (requires authentication)
router.get('/user-data', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId; // Set by middleware
    const data = await yourService.getUserData(userId);
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
```

**Step 2: Register Route in Server** (`backend/server.js`):

```javascript
const yourFeatureRoutes = require('./routes/yourFeature');
app.use('/api/your-feature', yourFeatureRoutes);
```

**Step 3: Create Service Layer** (`backend/services/yourService.js`):

```javascript
const { withCache, CACHE_TTL } = require('./cacheService');

async function getPublicData() {
  return withCache(
    'your_api_source',
    { endpoint: 'public-data' },
    async () => {
      // Actual API call or database query
      const result = await externalApi.get('/data');
      return { success: true, data: result };
    },
    CACHE_TTL.FORECAST // Reuse existing TTL or add new one
  );
}

module.exports = { getPublicData };
```

**Step 4: Create Frontend Service** (`frontend/src/services/yourApi.js`):

```javascript
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

export async function fetchPublicData() {
  try {
    const response = await fetch(`${API_URL}/api/your-feature/public-data`);
    if (!response.ok) throw new Error('API request failed');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
}
```

**Step 5: Create Custom Hook** (`frontend/src/hooks/useYourData.js`):

```javascript
import { useState, useEffect } from 'react';
import { fetchPublicData } from '../services/yourApi';

export function useYourData() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const result = await fetchPublicData();
        setData(result.data);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  return { data, loading, error };
}
```

**Step 6: Use in Component**:

```javascript
import { useYourData } from '../../hooks/useYourData';

function YourComponent() {
  const { data, loading, error } = useYourData();

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return <div>{JSON.stringify(data)}</div>;
}
```

### 4.3 How to Modify AI Analysis Logic

**Scenario**: Change how AI parses climate preferences

**File to Edit**: `backend/services/aiLocationFinderService.js`

**Step 1: Update System Prompt**:

```javascript
async function parseLocationQuery(userInput, currentLocation = null) {
  const systemPrompt = `You are an AI assistant for a weather comparison application.

Extract the following information:
- Current location
- Time periods/seasons
- Temperature preferences
- NEW: Sunshine hours preference  ← Add this
- NEW: Walkability score          ← Add this

Return JSON:
{
  "current_location": "...",
  "time_period": {...},
  "sunshine_hours": "high|moderate|low|null",     ← New field
  "walkability_required": true|false|null          ← New field
}`;

  // Rest of implementation...
}
```

**Step 2: Update Frontend to Use New Fields**:

```javascript
// frontend/src/components/location/LocationComparisonView.jsx
const handleAISearch = async () => {
  const result = await parseLocationQuery(query);

  // Use new fields
  if (result.criteria.sunshine_hours) {
    console.log('User wants', result.criteria.sunshine_hours, 'sunshine');
  }

  if (result.criteria.walkability_required) {
    console.log('User needs walkable city');
  }
};
```

**Step 3: Update Location Matching Logic**:

```javascript
// Curated city database
const CURATED_LOCATIONS = [
  {
    city: "Seattle, WA",
    avgTemp: 52,
    humidity: 70,
    precipitation: 38,
    sunshineHours: 152,  // ← Add new metrics
    walkabilityScore: 74
  },
  // ...
];

// Matching algorithm
function matchLocations(criteria) {
  return CURATED_LOCATIONS.filter(loc => {
    // Existing checks...

    // New sunshine check
    if (criteria.sunshine_hours === 'high' && loc.sunshineHours < 200) {
      return false;
    }

    // New walkability check
    if (criteria.walkability_required && loc.walkabilityScore < 60) {
      return false;
    }

    return true;
  });
}
```

**Testing**:
```bash
# Test new parsing logic
curl -X POST http://localhost:5001/api/ai-location-finder/parse-query \
  -H "Content-Type: application/json" \
  -d '{"query": "I want lots of sunshine and a walkable city"}'

# Expected response:
{
  "criteria": {
    "sunshine_hours": "high",
    "walkability_required": true
  }
}
```

### 4.4 Common Debugging Patterns

**Debug API Caching Issues**:

```javascript
// backend/routes/cache.js
router.get('/stats', async (req, res) => {
  const stats = await getCacheStats();
  res.json(stats);
});

// Visit: http://localhost:5001/api/cache/stats
// Returns:
{
  "total_entries": 1234,
  "active_entries": 890,
  "expired_entries": 344,
  "api_sources": 3,
  "locations_cached": 45
}
```

**Clear Cache for Testing**:

```javascript
// backend/routes/cache.js
router.delete('/clear', async (req, res) => {
  const count = await clearExpiredCache();
  res.json({ success: true, deletedEntries: count });
});

// curl -X DELETE http://localhost:5001/api/cache/clear
```

**Debug React Context State**:

```javascript
// Add to any component
import { useLocation } from '../../contexts/LocationContext';

function DebugPanel() {
  const { location, locationData } = useLocation();

  return (
    <div style={{ position: 'fixed', bottom: 0, right: 0, background: 'white', padding: 20 }}>
      <h3>Debug: Location Context</h3>
      <pre>{JSON.stringify({ location, locationData }, null, 2)}</pre>
    </div>
  );
}
```

**Debug Service Worker**:

```javascript
// Chrome DevTools → Application → Service Workers
// Click "Unregister" to remove SW
// Click "Update" to force update
// Check "Offline" to test offline mode

// In console:
navigator.serviceWorker.getRegistrations().then(regs => {
  regs.forEach(reg => reg.unregister());
});
```

**Debug Weather API Requests**:

```javascript
// backend/services/weatherService.js
// Uncomment these lines:
console.log(`✓ Cache hit for ${apiSource}:`, params);
console.log(`✗ Cache miss for ${apiSource}:`, params);
console.log(`⏳ Rate limit hit, retrying in ${delay}ms...`);
```

---

## 5. Hidden Complexity & Gotchas

### 5.1 Temperature Unit Conversion Edge Cases

**The Problem**: Temperature unit preference must be managed globally, but data arrives in Celsius from API.

**❌ Common Mistake**:
```javascript
// DON'T create local unit state in chart components
function TemperatureChart() {
  const [unit, setUnit] = useState('C'); // ← Will desync from global preference
  return <div>{formatTemperature(temp, unit)}</div>;
}
```

**✅ Correct Pattern**:
```javascript
// Page component accesses context
function WeatherDashboard() {
  const { unit } = useTemperatureUnit();
  return <TemperatureChart unit={unit} />; // Pass as prop
}

// Chart receives unit as prop
function TemperatureChart({ unit }) {
  return <div>{formatTemperature(temp, unit)}</div>;
}
```

**Data Aggregation Gotcha**:

```javascript
// When aggregating weather data, convert AFTER aggregation
function aggregateWeatherData(data, timeRange) {
  // ❌ DON'T convert before aggregating
  const fahrenheitData = data.map(d => ({
    ...d,
    temp: celsiusToFahrenheit(d.temp)
  }));
  const avgTemp = fahrenheitData.reduce((sum, d) => sum + d.temp) / data.length;

  // ✅ DO aggregate in Celsius, convert at display time
  const avgTempC = data.reduce((sum, d) => sum + d.temp) / data.length;
  return { tempAvg: avgTempC }; // Let formatTemperature() handle conversion
}
```

**Why?** Celsius → Fahrenheit is linear, but storing data in original units prevents rounding errors during aggregation.

### 5.2 Location Context Persistence

**The Gotcha**: Location must persist across page refreshes, but URL changes on navigation.

**Implementation** (`frontend/src/contexts/LocationContext.js`):

```javascript
// Initialize from localStorage
const [location, setLocation] = useState(() => {
  try {
    const saved = localStorage.getItem('meteo_current_location');
    if (saved) {
      const parsed = JSON.parse(saved);
      return parsed.address || DEFAULT_LOCATION;
    }
  } catch (error) {
    console.error('Error loading saved location:', error);
  }
  return DEFAULT_LOCATION;
});

// Save on every location change
const selectLocation = useCallback((locationObj) => {
  setLocation(locationObj.address);
  setLocationData(locationObj);

  localStorage.setItem('meteo_current_location', JSON.stringify(locationObj));
}, []);
```

**Why both `location` (string) and `locationData` (object)?**
- `location` (string): Simple display value ("Seattle, WA")
- `locationData` (object): Full metadata (lat, lng, timezone, etc.)

**Race Condition**:

```javascript
// ❌ BAD: URL change and localStorage update can conflict
useEffect(() => {
  selectLocation(newLocation);
  updateLocationUrl(newLocation);
}, [newLocation]);

// If user presses back button:
// 1. URL changes to old location
// 2. localStorage still has new location
// 3. App shows wrong location

// ✅ GOOD: URL is source of truth for navigation
useEffect(() => {
  const route = getCurrentRoute();
  if (route.path === 'location' && route.params.slug) {
    // Load from URL, not localStorage
    const location = await geocodeLocation(parseLocationSlug(route.params.slug));
    selectLocation(location);
  }
}, []);
```

### 5.3 API Rate Limiting & Retry Logic

**Visual Crossing Rate Limits**:
- Free tier: 1000 requests/day
- Paid tier ($99): 10,000 requests/month (~333/day)

**The Problem**: Dashboard loads 13+ charts simultaneously → 13+ API requests → rate limit exceeded.

**Solution 1: Request Throttling** (implemented):

```javascript
const MAX_CONCURRENT_REQUESTS = 3; // Only 3 requests in parallel

async function throttleRequest(requestFn) {
  while (activeRequests >= MAX_CONCURRENT_REQUESTS) {
    await new Promise(resolve => setTimeout(resolve, 50)); // Wait for slot
  }

  activeRequests++;
  try {
    return await requestFn();
  } finally {
    activeRequests--;
  }
}
```

**Solution 2: Conditional API Calls**:

```javascript
// Don't fetch "This Day in History" if user is viewing historical data
const { data: thisDayData } = useThisDayInHistory(
  location,
  activeTab === 'forecast' // Only fetch in forecast mode
);
```

**Solution 3: Backend Caching** (most effective):

```javascript
// First request: 850ms API call
// Next 100 requests (30min): 3ms cache lookup
const cachedResponse = await getCachedResponse(cacheKey);
if (cachedResponse) {
  return cachedResponse; // Instant, no API call
}
```

**Exponential Backoff**:

```javascript
async function makeApiRequest(url, retries = 2, delay = 1000) {
  try {
    return await axios.get(url);
  } catch (error) {
    if (error.response?.status === 429 && retries > 0) {
      await new Promise(resolve => setTimeout(resolve, delay));
      return makeApiRequest(url, retries - 1, delay * 2); // Double delay
    }
    throw error;
  }
}

// Retry pattern:
// 1st attempt → fail (429)
// Wait 1 second
// 2nd attempt → fail (429)
// Wait 2 seconds
// 3rd attempt → success or final failure
```

### 5.4 Geolocation Fallback Chain

**The Problem**: Browser geolocation fails ~30% of the time (especially macOS desktop).

**3-Tier Fallback** (`frontend/src/services/geolocationService.js`):

```javascript
export async function getCurrentLocation() {
  // Tier 1: Browser Geolocation (low accuracy)
  try {
    const position = await new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: false,
        timeout: 3000
      });
    });
    return { lat: position.coords.latitude, lng: position.coords.longitude };
  } catch (error) {
    console.warn('Low accuracy geolocation failed:', error);
  }

  // Tier 2: High Accuracy GPS (slower)
  try {
    const position = await new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 10000
      });
    });
    return { lat: position.coords.latitude, lng: position.coords.longitude };
  } catch (error) {
    console.warn('High accuracy geolocation failed:', error);
  }

  // Tier 3: IP-Based Geolocation (always works)
  try {
    const response = await fetch('https://ipapi.co/json/');
    const data = await response.json();
    return { lat: data.latitude, lng: data.longitude, city: data.city };
  } catch (error) {
    console.error('All geolocation methods failed');
    throw error;
  }
}
```

**Why this order?**
1. Low accuracy (Wi-Fi triangulation): Fast (1-3s), moderate accuracy (50-500m)
2. High accuracy (GPS): Slow (5-10s), high accuracy (10-50m)
3. IP-based: Instant, city-level accuracy (~5km)

**macOS-Specific Issue**:
- macOS returns `kCLErrorLocationUnknown` if:
  - Wi-Fi is disabled (desktop Ethernet users)
  - Location Services disabled in System Settings
  - Browser lacks permission
- IP fallback ensures app works for 99% of users

**User-Friendly Display**:

```javascript
// If reverse geocoding fails, show "Your Location" instead of coordinates
if (/^-?\d+\.\d+,\s*-?\d+\.\d+$/.test(address)) {
  return "Your Location";
}
return address; // "Seattle, WA"
```

### 5.5 Chart Aggregation Performance

**The Problem**: Rendering 5 years of daily data (1,825 points) causes chart lag.

**Solution**: Smart aggregation based on time range (`frontend/src/utils/weatherHelpers.js`):

```javascript
export function aggregateWeatherData(data, timeRange) {
  if (timeRange === '7days' || timeRange === '1month') {
    return { aggregatedData: data, aggregationLabel: null }; // 7-30 points: no aggregation
  }

  if (timeRange === '3months' || timeRange === '6months') {
    // 90-180 days → weekly averages (~13-26 points)
    aggregationType = 'weekly';
  } else {
    // 1+ years → monthly averages (12-60 points)
    aggregationType = 'monthly';
  }

  // Group data by period and calculate averages...
}
```

**Performance Impact**:
- **Before**: 1,825 SVG elements rendered → 200ms render time, laggy scrolling
- **After**: 60 SVG elements rendered → 15ms render time, smooth scrolling

**Aggregation Label**:

```javascript
// Show user what they're seeing
{aggregationLabel && (
  <div className="aggregation-badge">
    ℹ️ {aggregationLabel} {/* "Showing monthly averages" */}
  </div>
)}
```

**Tooltip Enhancement**:

```javascript
// Show how many days were aggregated
<Tooltip
  formatter={(value, name, props) => {
    const days = props.payload.aggregatedDays;
    return days ? `${value} (avg of ${days} days)` : value;
  }}
/>
```

### 5.6 CSS Variables & Theme System

**The Problem**: Charts use hardcoded colors → look broken in dark mode.

**Solution**: CSS variable system with fallbacks (`frontend/src/styles/themes.css`):

```css
:root {
  /* Light theme (default) */
  --text-primary: #0f172a;
  --text-secondary: #465570;
  --bg-elevated: #ffffff;
  --accent-primary: #4c7ce5;
}

[data-theme="dark"] {
  /* Dark theme */
  --text-primary: #f5f7fb;
  --text-secondary: #c0cae2;
  --bg-elevated: #18233a;
  --accent-primary: #82a7ff;
}
```

**Chart Implementation**:

```javascript
// ❌ BAD: Hardcoded color
<Line stroke="#4c7ce5" />

// ✅ GOOD: CSS variable with fallback
<Line stroke="var(--accent-primary, #4c7ce5)" />
```

**Why fallback?**
- CSS variables not supported in IE11 (minimal impact in 2025)
- Provides graceful degradation
- Makes debugging easier (can see intended color)

**Dynamic Text Color**:

```javascript
<Text fill="var(--text-primary, #0f172a)" fontSize={13} />
```

**Centralized Chart Styles** (`frontend/src/components/charts/charts.css`):

```css
/* All charts inherit these styles */
.chart-container {
  background: var(--bg-elevated);
  border-radius: 12px;
  padding: 20px;
}

.chart-title {
  color: var(--text-primary);
  font-size: 22px;
  font-weight: 700;
}

.recharts-text {
  fill: var(--text-primary, #0f172a);
  font-size: 13px;
}

.recharts-cartesian-axis-tick {
  fill: var(--text-secondary, #465570);
}
```

**Why centralized?**
- Removed 275+ inline styles across 13 chart components
- Single source of truth for chart styling
- Automatic theme adaptation
- Better performance (CSS variables > inline styles)

### 5.7 React Hooks Dependency Arrays

**The Problem**: Missing dependencies cause stale closures; extra dependencies cause infinite loops.

**❌ Common Mistakes**:

```javascript
// 1. Missing dependency (stale closure)
useEffect(() => {
  handleSubmit(); // handleSubmit uses `location` from closure
}, []); // ← Missing `location` dependency
// Result: handleSubmit always uses initial location value

// 2. Function in dependency array (infinite loop)
useEffect(() => {
  fetchData();
}, [fetchData]); // ← fetchData recreated on every render
// Result: Infinite loop

// 3. Object/array in dependency array (infinite loop)
useEffect(() => {
  processData(options);
}, [options]); // ← options = { ... } created on every render
// Result: Infinite loop
```

**✅ Correct Patterns**:

```javascript
// 1. Use useCallback for function dependencies
const fetchData = useCallback(async () => {
  // Logic using location
}, [location]); // Only recreated when location changes

useEffect(() => {
  fetchData();
}, [fetchData]); // Safe: fetchData stable unless location changes

// 2. Destructure object properties
const { lat, lng } = coordinates;
useEffect(() => {
  fetchWeather(lat, lng);
}, [lat, lng]); // Primitives: safe to compare

// 3. Use useMemo for derived data
const chartData = useMemo(() => {
  return data.map(d => ({ ...d, temp: convertTemp(d.temp) }));
}, [data, unit]); // Only recompute when data or unit changes
```

**Auto-Submit Gotcha** (AIWeatherPage):

```javascript
// ❌ Causes double-submit
useEffect(() => {
  if (question && location) {
    handleAskQuestion();
  }
}, [question, location, handleAskQuestion]); // handleAskQuestion changes on every render

// ✅ Prevents double-submit
const [hasAutoSubmitted, setHasAutoSubmitted] = useState(false);

useEffect(() => {
  if (question && location && !hasAutoSubmitted && !loading) {
    setHasAutoSubmitted(true);
    handleAskQuestion();
  }
}, [question, location, hasAutoSubmitted, loading]); // Guard with hasAutoSubmitted
```

### 5.8 Docker Development Quirks

**Port Conflicts**:
```yaml
# docker-compose.yml
services:
  mysql:
    ports:
      - "3307:3306"  # Host:Container (3307 avoids conflict with local MySQL)

  backend:
    ports:
      - "5001:5001"  # Port 5000 conflicts with macOS AirPlay
```

**Environment Variables**:

```bash
# .env (backend)
DB_HOST=mysql        # ← Docker network hostname, NOT "localhost"
DB_PORT=3306         # ← Container port, NOT 3307

# When connecting from host (e.g., MySQL Workbench):
Host: localhost
Port: 3307           # ← Mapped port

# When connecting from backend container:
Host: mysql
Port: 3306           # ← Container port
```

**Volume Permissions**:

```yaml
# Common issue: MySQL container can't write to volume
volumes:
  mysql_data:
    driver: local

# Solution: Use named volumes (Docker manages permissions)
# NOT bind mounts (./data:/var/lib/mysql)
```

**Rebuild After Dependency Changes**:

```bash
# Installing new npm package requires rebuild
docker-compose up --build

# Or force recreation
docker-compose up --force-recreate
```

---

## 6. Production Deployment

### 6.1 Deployment Overview

**Documentation:** See `docs/DEPLOYMENT_GUIDE_PRIVATE.md` for complete deployment guide with credentials.

**Production Infrastructure:**
- **Server:** tachyonfuture.com (Hostinger VPS)
- **Frontend URL:** https://meteo-beta.tachyonfuture.com
- **Backend API URL:** https://api.meteo-beta.tachyonfuture.com
- **Reverse Proxy:** Nginx Proxy Manager (NPM)
- **SSL:** Let's Encrypt certificates via NPM

### 6.2 Deployment Process

**Recommended: Automated Script**
```bash
# 1. SSH into server (MANUAL - biometric auth required)
ssh michael@tachyonfuture.com

# 2. Navigate to app directory
cd /home/michael/meteo-app

# 3. Run deployment script
./scripts/deploy-beta.sh
```

**The script automatically:**
1. Pulls latest code from `main` branch
2. Exports environment variables from `.env.production`
3. Rebuilds frontend with correct `REACT_APP_API_URL`
4. Restarts all Docker containers with `--force-recreate`
5. Shows container status and health checks

**Manual Deployment (if needed):**
```bash
# Pull latest code
git fetch origin
git reset --hard origin/main

# Export environment variables (CRITICAL for frontend build)
export $(cat .env.production | grep -v "^#" | xargs)

# Rebuild frontend with build args
REACT_APP_API_URL=https://api.meteo-beta.tachyonfuture.com/api \
  docker compose -f docker-compose.prod.yml build --no-cache frontend

# Restart all services
docker compose -f docker-compose.prod.yml --env-file .env.production up -d --force-recreate

# Verify deployment
docker ps | grep meteo
docker logs meteo-backend-prod --tail 50
```

### 6.3 CRITICAL Deployment Rules

**⚠️ SSH Security Requirements:**
- **NEVER automate SSH from code** - Triggers Fail2Ban instant lockout
- **User must manually SSH** with biometric authentication (1Password Touch ID)
- **SSH key authentication only** - No password attempts
- **Past incident:** Automated SSH crashed entire VPS (October 28, 2025)
- **Recovery required:** Hostinger support escalation (24hr SLA)

**Why automated SSH fails:**
- Server has Fail2Ban with aggressive settings
- 1Password SSH agent tries ALL keys (10+ authentication attempts)
- Single command can exhaust `MaxAuthTries` instantly
- Even whitelisted IPs get locked out
- User loses both SSH AND console access
- Control panel reboot button becomes unresponsive

**Deployment Workflow:**
```
Developer → GitHub push → User manually SSHs → Runs deploy script → Containers restart
```

**NOT this:**
```
Developer → Automated SSH ❌ → Server lockout → Hostinger support ticket
```

### 6.4 Environment Configuration

**Production environment:** `/home/michael/meteo-app/.env.production`

**Critical Variables:**
```bash
# Frontend build args (must be exported before build)
REACT_APP_API_URL=https://api.meteo-beta.tachyonfuture.com/api

# Backend API keys
VISUAL_CROSSING_API_KEY=<secret>
METEO_ANTHROPIC_API_KEY=<secret>
OPENWEATHER_API_KEY=<secret>

# Database (internal Docker network)
DB_HOST=mysql-prod
DB_PORT=3306

# Security
CORS_ORIGIN=https://meteo-beta.tachyonfuture.com
NODE_ENV=production
```

**Why environment variables matter:**
- Frontend is a static build - API URL baked in at build time
- If `REACT_APP_API_URL` not set, defaults to `localhost:5001` ❌
- Backend reads `.env.production` at container start
- Docker Compose needs `--env-file` flag to pass variables correctly

### 6.5 Health Checks

**All containers have health checks using `127.0.0.1` (NOT `localhost`):**

```yaml
# Backend health check
healthcheck:
  test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://127.0.0.1:5001/api/health"]
  interval: 30s
  timeout: 10s
  retries: 3

# Frontend health check
healthcheck:
  test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://127.0.0.1:80"]
  interval: 30s
  timeout: 10s
  retries: 3
```

**Why `127.0.0.1` instead of `localhost`?**
- DNS resolution for `localhost` can fail inside Docker containers
- Causes false "unhealthy" status in Portainer
- `127.0.0.1` bypasses DNS lookup, always works
- Fixed in commit `aa63f17` (October 30, 2025)

**Verify health:**
```bash
docker ps  # Should show "(healthy)" for all containers
docker inspect meteo-backend-prod --format='{{.State.Health.Status}}'
```

### 6.6 Nginx Proxy Manager Configuration

**Access NPM:**
- URL: `http://tachyonfuture.com:81`
- Login: `michael.buckingham74@gmail.com`

**Required Proxy Hosts:**

1. **Frontend:**
   - Domain: `meteo-beta.tachyonfuture.com`
   - Forward to: `meteo-frontend-prod:80`
   - SSL: Let's Encrypt (auto-renew)

2. **Backend API (CRITICAL):**
   - Domain: `api.meteo-beta.tachyonfuture.com`
   - Forward to: `meteo-backend-prod:5001`
   - SSL: Let's Encrypt (auto-renew)
   - Websockets: Enabled
   - Block exploits: Enabled

**Common NPM Issues:**
- SSL certificate fails → Check DNS points to server
- 502 Bad Gateway → Check container name matches NPM config
- Network error → API proxy host missing in NPM

### 6.7 Deployment Verification Checklist

After deployment, verify:

```bash
# 1. Container status (all should be "healthy")
docker ps | grep meteo

# 2. Backend API responds
curl http://localhost:5001/api/health

# 3. Frontend has correct API URL
docker exec meteo-frontend-prod cat /usr/share/nginx/html/static/js/main.*.js | grep -o "api.meteo-beta.tachyonfuture.com" | head -1

# 4. Database connection works
docker logs meteo-backend-prod | grep "Database connected"

# 5. No errors in logs
docker logs meteo-backend-prod --tail 50
docker logs meteo-frontend-prod --tail 50
```

**Test in browser:**
1. Visit https://meteo-beta.tachyonfuture.com
2. Try location search (tests API connectivity)
3. Check browser console for errors
4. Test AI weather assistant feature

### 6.8 Common Deployment Issues

**Issue: "Network Error" in frontend**
- **Cause:** API domain not configured in NPM or SSL certificate not issued
- **Fix:** Add `api.meteo-beta.tachyonfuture.com` proxy host in NPM

**Issue: Frontend shows wrong API URL**
- **Cause:** Frontend built without `REACT_APP_API_URL` build arg
- **Fix:** Rebuild frontend with environment variable exported

**Issue: AI location finder not working**
- **Cause:** Missing `METEO_ANTHROPIC_API_KEY` in `.env.production`
- **Fix:** Add API key, restart backend container

**Issue: SSL certificate fails (Cloudflare)**
- **Cause:** CAA DNS record restricting to Let's Encrypt only
- **Fix:** Delete CAA record in Cloudflare DNS (Cloudflare uses DigiCert/Google/Sectigo)

---

## 7. Quick Reference

### 7.1 Key File Locations

**Frontend**:
```
src/
├── App.js                        # Root component, routing logic
├── contexts/                     # Global state (Auth, Theme, Location, TempUnit)
├── components/
│   ├── weather/WeatherDashboard.jsx   # Main dashboard
│   ├── ai/UniversalSearchBar.jsx      # Smart search
│   ├── charts/                        # 13 chart components
│   └── common/ErrorBoundary.jsx       # Error handling
├── services/
│   ├── weatherApi.js             # Backend API client
│   ├── radarService.js           # RainViewer client
│   └── geolocationService.js     # Location detection
├── hooks/
│   ├── useWeatherData.js         # Weather data hooks
│   └── useKeyboardShortcuts.js   # Accessibility
└── utils/
    ├── weatherHelpers.js         # Temperature conversion, aggregation
    └── urlHelpers.js             # URL slug generation
```

**Backend**:
```
backend/
├── server.js                     # Express app entry point
├── routes/                       # API endpoints
│   ├── weather.js                # /api/weather/*
│   ├── auth.js                   # /api/auth/*
│   └── aiWeatherAnalysis.js      # /api/ai-weather/*
├── services/
│   ├── weatherService.js         # Visual Crossing client
│   ├── cacheService.js           # Database caching
│   └── aiLocationFinderService.js # Claude API client
├── middleware/
│   └── authMiddleware.js         # JWT validation
└── config/
    └── database.js               # MySQL connection pool
```

### 7.2 Environment Variables

**Backend** (`.env`):
```bash
# Server
PORT=5001
NODE_ENV=development

# Database
DB_HOST=mysql
DB_PORT=3306
DB_USER=meteo_user
DB_PASSWORD=meteo_pass
DB_NAME=meteo_app

# APIs
VISUAL_CROSSING_API_KEY=your_key_here
METEO_ANTHROPIC_API_KEY=your_key_here

# Auth
JWT_SECRET=your_secret_here

# CORS
CORS_ORIGIN=https://meteo-beta.tachyonfuture.com
```

**Frontend** (`.env`):
```bash
# API URL (production)
REACT_APP_API_URL=https://api.meteo-beta.tachyonfuture.com

# Development uses localhost:5001 by default
```

### 7.3 Useful Commands

**Development**:
```bash
# Start all services
docker-compose up

# Rebuild after code changes
docker-compose up --build

# View logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Run backend tests (when implemented)
cd backend && npm test

# Run frontend tests
cd frontend && npm test

# Database access
docker exec -it meteo-mysql mysql -u meteo_user -pmeteo_pass meteo_app
```

**Production Deployment**:
```bash
# SSH into production server (MANUAL ONLY - see deployment docs)
ssh michael@tachyonfuture.com

# Navigate to app directory
cd /home/michael/meteo-app

# Use automated deployment script
./scripts/deploy-beta.sh

# OR manual deployment (see docs/DEPLOYMENT_GUIDE_PRIVATE.md)
git pull origin main
docker compose -f docker-compose.prod.yml build --no-cache frontend
docker compose -f docker-compose.prod.yml --env-file .env.production up -d
```

**⚠️ CRITICAL DEPLOYMENT NOTES:**
- **Full deployment documentation:** `docs/DEPLOYMENT_GUIDE_PRIVATE.md`
- **Server:** tachyonfuture.com (Hostinger VPS)
- **Frontend:** https://meteo-beta.tachyonfuture.com
- **Backend API:** https://api.meteo-beta.tachyonfuture.com
- **SSH MUST be manual** - Automated SSH triggers server lockout (Fail2Ban)
- **Never use programmatic SSH** - User provides biometric auth (1Password Touch ID)
- **Deployment script handles environment variables correctly**

**Cache Management**:
```bash
# Get cache stats
curl http://localhost:5001/api/cache/stats

# Clear expired cache
curl -X DELETE http://localhost:5001/api/cache/clear
```

---

## 8. Session Startup Checklist

When starting a new coding session, review:

1. **Read CLAUDE.md** - Project overview and current features
2. **Read this file (DEVELOPER_ONBOARDING.md)** - Architecture deep dive
3. **Check git status** - Understand current work-in-progress
4. **Review recent commits** - Context on latest changes
5. **Scan open issues** - Known bugs and planned features

**Key Mental Models**:
- Context flows from providers → page components → child components (props)
- API calls go through service layer (never direct from components)
- Always check cache before making external API calls
- URLs are source of truth for location navigation
- CSS variables ensure theme compatibility

**Common Pitfalls to Avoid**:
- Don't create local state for global concerns (temp unit, theme, location)
- Don't forget to aggregate data for multi-year comparisons
- Don't make API calls without throttling/caching
- Don't hardcode colors (use CSS variables)
- Don't add functions to useEffect dependency arrays (use useCallback)

**When Adding Features**:
1. Follow established patterns (see Section 4)
2. Update this document with new architectural decisions
3. Add tests for critical paths
4. Update CLAUDE.md if user-facing features change

---

*Last Updated: 2025-11-01*
*Maintainer: Michael Buckingham*
*Questions? Review code comments and commit history for additional context.*
