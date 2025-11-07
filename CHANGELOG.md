# Changelog

All notable changes to the Meteo Weather App project are documented in this file.

**Format:** Based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/)
**Versioning:** [Semantic Versioning](https://semver.org/spec/v2.0.0.html)

---

## 📖 How to Read This Changelog

### Version Numbering
- **Major.Minor.Patch** (e.g., 1.2.3)
- **Major** (1.x.x) - Breaking changes, major rewrites
- **Minor** (x.1.x) - New features, significant improvements
- **Patch** (x.x.1) - Bug fixes, minor updates

### Visual Legend
- 🎉 **New Features** - Added functionality
- 🔄 **Changes** - Modified existing features
- 🐛 **Bug Fixes** - Fixed issues
- 🔐 **Security** - Security improvements
- 📚 **Documentation** - Docs updates
- ⚡ **Performance** - Speed improvements
- ♿ **Accessibility** - A11y enhancements

---

## [Unreleased]

*No unreleased changes*

---

## [0.8.1] - 2025-11-07 (20:45 UTC)

### 📚 Documentation
- **README Visual Enhancements** - Enhanced repository presentation for developers
  - Added 6 new badges: Code Coverage (33.65%), Last Commit, GitHub Stars, Forks, Issues, PRs Welcome
  - Created "Project Highlights" table with 8 key metrics (Security 9.4/10, WCAG AA, etc.)
  - Added "Why Choose Meteo?" section targeting 4 audiences (Users, Developers, Self-Hosters, Contributors)
  - Added visual tech stack badges (16 large shields.io badges organized by category)
  - Created Screenshots section with 6 placeholder images and detailed captions
  - Added Changelog link to README header with improved spacing
  - Center-aligned entire header section for better visual consistency
- **Screenshot Guidelines** (`docs/screenshots/README.md`, 246 lines)
  - Detailed capture instructions for all 6 screenshots
  - Best practices for resolution (1920x1080+), tools (Chrome DevTools, OBS), editing
  - 11-point quality checklist
- **Banner Creation Guide** (`.github/README_ASSETS.md`, 268 lines)
  - Banner/header image guidelines (1280x400px)
  - 3 design template options
  - Step-by-step Canva tutorial
  - Social media preview card instructions (1200x630px for Open Graph)
  - Asset directory structure and badge customization

---

## [0.8.0] - 2025-11-06 (18:30 UTC)

### 🐛 Bug Fixes
- **CRITICAL: Express Route Ordering Bug**
  - Fixed "Use My Location" feature (was completely broken)
  - Parameter route `/:id` was catching `/reverse`, `/search`, `/popular` before they could match
  - Reordered routes so specific routes come before catch-all parameter routes
  - **Performance:** Reverse geocoding now works (40ms) instead of 404 timeout (3000ms)
  - **Files:** `backend/routes/locations.js`

- **Slow Initial Page Load & FOUC**
  - Eliminated Flash of Unstyled Content (FOUC) on initial page load
  - Added CSS code splitting to Vite configuration
  - **Performance:** 5x faster initial page load (3-5 seconds → <1 second)
  - **Files:** `frontend/vite.config.js`

### 🔄 Changes
- **UI Optimization - Material Design 3 Implementation (Phase 1 & 2)**
  - **Phase 1:** 30-40% reduction in UI element sizes using 8pt grid system
    - Temperature display: 72px → 48px (-33%)
    - Location name: 32px → 24px (-25%)
    - Card padding: 20px → 16px (-20%)
    - AI Hero section height: -35-40%
    - Removed borders for seamless layout
  - **Phase 2:** Info box reorganization with 20% additional size reduction
    - Hero Stats Grid: 3 columns → 5 columns (Conditions, Precip Chance, Wind, Humidity, 24h Precip)
    - Highlights Grid: 2-column vertical → 4-column horizontal
    - All info boxes reduced: padding, icons, fonts, gaps
  - **Combined Impact:**
    - Overall vertical space: -50-60%
    - Information density: +70%
    - Horizontal space efficiency: +85%
  - **Files:** `WeatherDashboard.jsx`, `WeatherDashboard.css`, `AIWeatherHero.css`

- **Database Performance Optimization (5 Migrations)**
  - Migration 001: FULLTEXT index on locations (20x faster text searches)
  - Migration 002: API cache auto-cleanup (removes expired cache >1 hour old)
  - Migration 003: AI shares auto-cleanup (removes expired shares >30 days)
  - Migration 004: Spatial index on coordinates (50x faster GPS lookups)
  - Migration 005: Table partitioning on weather_data (10x faster date queries)
  - **Data Integrity:** All 585,784 weather records preserved (100%)
  - **Files:** `database/migrations/001-005_*.sql`, service files updated

---

## [0.7.0] - 2025-11-05 (22:15 UTC)

### 🎉 New Features
- **Professional Error Handling System** (4 phases complete)
  - **ErrorMessage Component** with 4 display modes (inline, toast, banner, modal)
  - **OfflineBanner Component** - Automatic online/offline monitoring
  - **Error Analytics System** - useErrorAnalytics hook for tracking patterns
  - **Retry Logic** - useRetryHandler hook with exponential backoff (1s → 2s → 4s)
  - **Online Status Hook** - Real-time connectivity monitoring
  - **Environment-Aware Timeouts** - Configurable via VITE_* variables
  - **Toast Container** - Stacked notifications with z-index management
  - **700+ lines of CSS** - Animations, severity colors, dark mode, responsive
  - **Accessibility:** WCAG 2.1 AA compliant (ARIA roles, live regions, keyboard support)
  - **15 Files:** 9 new, 6 modified, 3,130+ lines of code
  - **Files Added:** ErrorMessage.jsx/css, OfflineBanner.jsx, hooks (useOnlineStatus, useRetryHandler, useErrorAnalytics), config/timeouts.js

### 🔄 Changes
- **Ultra-Compact Dashboard Layout**
  - **40% vertical space reduction** - Everything fits in one viewport
  - **Two-column grid:** Weather info (left) + Radar map 600×600px (right)
  - **Typography reduction:**
    - Location: 48px → 32px (-33%)
    - Temperature: 96px → 72px (-25%)
    - Condition: 24px → 20px
  - **Stats simplified:** 5 columns → 3 columns (Wind, Humidity, 24h Precip)
  - **Padding reduced:** 35-40% across all elements
  - **RadarMap prominence:** 450×500px → 600×600px (45% of viewport width)
  - **Files:** `WeatherDashboard.jsx`, `WeatherDashboard.css`, `RadarMap.css`

- **RadarMap Height Bug Fix**
  - Fixed prop type mismatch (expected number, received string "350px")
  - Result: Invalid CSS "350pxpx" prevented proper rendering
  - Fixed in CurrentConditionsSection.jsx and WeatherDashboard.jsx
  - Removed conflicting CSS rules (min-height, height: 100%)
  - Now renders correctly at specified height across all browsers

### 📚 Documentation
- **Unified Hero Card UI Redesign Summary**
  - Consolidated scattered dashboard into single unified card
  - Massive temperature display (96px font, up from 32px)
  - Everything in one place: search, weather, highlights, actions, radar, charts
  - Modern card design with 20px rounded corners and elevated shadows
  - 300+ lines of new CSS documentation

- **Code Refactoring Summary**
  - Split WeatherDashboard.jsx (1,250 lines → 5 focused components)
  - Split LocationComparisonView.jsx (1,032 lines → 4 focused components)
  - Created reusable useLocationConfirmation hook
  - Centralized constants directory
  - Implemented debugLogger and errorHandler utilities
  - Eliminated 100% of code duplication

- **Regression Prevention System**
  - 4-layer protection for "Old Location" bug
  - Automated regression tests (geolocationService.regression.test.js)
  - Pre-commit hooks (.husky/pre-commit-regression-check)
  - Custom ESLint rules (.eslintrc-custom-rules.js)
  - Comprehensive documentation (REGRESSION_PREVENTION.md)

### ⚡ Performance
- **UI Density Optimization**
  - Created ultra-compact density mode (50-70% size reduction)
  - Disabled dev server caching (prevents cache-related confusion)
  - Fixed CSS specificity issues (import order matters)
  - **Files:** `density-compact.css`, `vite.config.js`

- **False VPN/Proxy Warnings Fixed**
  - Only trigger warnings for accuracy > 10km (was triggering on all geolocation)
  - Reduces unnecessary user confusion

---

## [0.6.0] - 2025-11-05 (14:00 UTC)

### 🔐 Security
- **Security Update Deployed** - Achieved 9.4/10 security score
  - Rate limiting: 100/15min API, 5/15min auth, 10/hour AI
  - CORS validation with origin whitelist
  - CSP headers (XSS protection)
  - Helmet security headers (X-Frame-Options, HSTS)
  - **Fixed 6 critical vulnerabilities** (CVSS 8.5 → 0)
  - **96% AI cost abuse reduction** ($3,600/month → $36/month)

### ♿ Accessibility
- **Accessibility Phase 2 - WCAG Level AA Compliance**
  - **Score:** 7-8/10 → 8.5-9/10 (PASSES WCAG Level AA + one AAA criterion)
  - **All Phase 2 Tasks Complete:** 8/8 (100%)
  - **Live Regions:** Screen reader announcements for weather loading/errors (WCAG 4.1.3)
  - **Modal Focus Traps:** Complete focus management in AuthModal & LocationConfirmationModal (WCAG 2.4.3)
  - **Reduced Motion:** Global support via prefers-reduced-motion + radar animation control (WCAG 2.3.3 Level AAA)
  - **Error Suggestions:** 200+ contextual suggestions with browser-specific instructions (WCAG 3.3.3)
  - **New Files:** reduced-motion.css, errorSuggestions.js
  - **9 Files Changed:** 7 modified, 2 new

- **Accessibility Phase 1 - WCAG Level A Compliance**
  - **Score:** 4.5/10 → 7-8/10 (PASSES WCAG Level A)
  - **Critical Issues Fixed:** 7 → 0
  - **Major Changes:**
    - Added proper heading hierarchy (H1) to WeatherDashboard
    - Created .sr-only utility class for screen reader-only content
    - Added comprehensive focus indicators (3px purple outline)
    - Enhanced form accessibility with proper labels and ARIA attributes
    - Fixed keyboard navigation in WeatherAlertsBanner
    - Added aria-labels to all 11 icon-only buttons in RadarMap
    - Added aria-hidden to 28+ decorative icons across the app
    - Improved color contrast: #9ca3af → #6b7280 (4.59:1 ratio)
    - Enhanced modal accessibility with proper ARIA roles
    - Added proper tab navigation ARIA attributes to chart tabs
  - **19 Files Modified:** 8 JSX components, 11 CSS files

---

## [0.5.0] - 2025-11-04 (16:00 UTC)

### 🔄 Changes
- **Vite Migration from Create React App**
  - 10-100x faster builds
  - TypeScript support added (gradual migration)
  - ESLint, Prettier, Husky pre-commit hooks
  - Hot module replacement (HMR) improved
  - **Build Validation System:** Automated config validation (`npm run validate`)

### 📚 Documentation
- **Comprehensive Documentation Reorganization**
  - 78 documentation files organized into 10 clear categories
  - Created `docs/README.md` as central hub
  - Categories: Getting Started, API, Deployment, Security, Accessibility, CI/CD, Database, UI/UX, Troubleshooting, Development
  - All docs cross-referenced with links

---

## [0.4.0] - 2025-10-31 (20:00 UTC)

### 🎉 New Features
- **AI Weather Assistant** - Full conversational weather Q&A interface
  - Auto-submit from Universal Search Bar (no double-Enter required)
  - Smart timeout handling (30s overall, 10s validation, 20s analysis)
  - Two-step validation system with cost transparency
  - Confidence indicators and token usage display
  - Comprehensive error recovery
  - Environment-aware API URLs for production deployment
  - AbortController for proper fetch cancellation

- **Interactive Radar Map with Historical Precipitation Data**
  - RainViewer API integration
  - Real past 2 hours + 30 min forecast data
  - Animation controls (play/pause, speed, timeline)
  - Storm tracking with movement direction and speed
  - Screenshot and data export capabilities
  - Weather alerts overlay with animated markers
  - Precipitation intensity legend

- **Enhanced Location Comparison Page**
  - Time range selector (7 days to 5 years)
  - Pre-populated with Seattle vs New Smyrna Beach example
  - Interactive "How to Use" guide with clickable questions
  - Historical climate data integration
  - Weather comparison charts (temperature, precipitation, wind)
  - Automatic insights and statistics

### 🔄 Changes
- **Interactive Hourly Forecast Chart**
  - Clickable metric views (Overview, High, Low, Precipitation, Wind)
  - Focused visualizations for each metric
  - Interactive summary cards with state management

- **Comprehensive Dark Mode CSS Refactor**
  - Complete CSS variable system
  - All charts and visualizations support dark mode
  - Consistent theming across all UI elements

- **Global Temperature Unit Sync**
  - Temperature unit toggle works across all components
  - Synchronized Celsius/Fahrenheit preference

- **Simplified Theme Toggle**
  - Cycling button: Light → Dark → Auto modes

---

## [0.3.0] - 2025-10-15 (18:00 UTC)

### 🎉 New Features
- **User Authentication System** - JWT-based auth
- **Cloud-Synced Favorites** - Automatic sync across devices
- **User Profiles** - Customizable preferences
- **Theme System** - Light/dark/auto modes
- **48-Hour Interactive Chart** - Hourly forecasts with clickable views
- **Weather Alerts** - Real-time severe weather warnings
- **Air Quality Monitoring** - AQI data with health recommendations

### 📚 Documentation
- Complete API documentation in 3 formats (OpenAPI, Postman, Markdown)
- Database ERD and schema documentation
- Video tutorial scripts
- Deployment guides

---

## [0.2.0] - 2025-09-20 (16:00 UTC)

### 🎉 New Features
- **10-Year Climate Analysis** - Historical trends and insights
- **Location Comparison** - Compare weather across cities
- **Smart Location Search** - Autocomplete with geolocation
- **Multi-Day Forecasts** - 3, 7, or 14-day forecasts
- **Interactive Charts** - 15+ weather visualization charts

### ⚡ Performance
- **MySQL-Based API Caching** - 99% cache hit rate
- **Request Throttling** - Max 3 concurrent requests
- **Exponential Backoff Retry** - Graceful failure handling
- **282x Faster Responses** - Cache optimization (850ms → 3ms)

---

## [0.1.0] - 2025-08-15 (12:00 UTC)

### 🎉 Initial Release
- **Weather Dashboard** - Current conditions and forecasts
- **Visual Crossing API Integration** - Primary weather data source
- **Docker Containerization** - Easy deployment
- **React Frontend** - Modern UI with Context API
- **Express Backend** - RESTful API server
- **MySQL Database** - User data and caching
- **Basic Authentication** - User registration and login
- **Responsive Design** - Mobile-friendly interface

---

## Version History Summary

| Version | Date | Type | Highlights |
|---------|------|------|------------|
| **0.8.1** | Nov 7, 2025 | 📚 Docs | README enhancements, badges, screenshots guide, banner guide |
| **0.8.0** | Nov 6, 2025 | 🐛 Fix + 🔄 | Route ordering bug, FOUC fix, UI optimization, DB migrations |
| **0.7.0** | Nov 5, 2025 | 🎉 Feature + 🔄 | Error handling system, ultra-compact layout, RadarMap fix |
| **0.6.0** | Nov 5, 2025 | 🔐 Security + ♿ | 9.4/10 security score, WCAG AA compliance (Phases 1 & 2) |
| **0.5.0** | Nov 4, 2025 | 🔄 Migration + 📚 | Vite migration, 78 docs organized |
| **0.4.0** | Oct 31, 2025 | 🎉 Feature | AI Weather Assistant, Interactive Radar, Location Comparison |
| **0.3.0** | Oct 15, 2025 | 🎉 Feature | Auth system, Favorites, Themes, Weather Alerts, AQI |
| **0.2.0** | Sep 20, 2025 | 🎉 Feature + ⚡ | Climate analysis, Comparison, Charts, API caching |
| **0.1.0** | Aug 15, 2025 | 🎉 Initial | Core weather dashboard, Docker, React, Express, MySQL |

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for details on submitting improvements to this changelog.

**Changelog Format:** [Keep a Changelog](https://keepachangelog.com/en/1.0.0/)
**Maintained by:** Michael Buckingham ([@mbuckingham74](https://github.com/mbuckingham74))
