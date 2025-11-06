# Claude Code Session Context

**Read this file at the start of every session to get up to speed quickly.**

---

## 🏗️ Project Overview

**Meteo Weather App** - Self-hostable weather dashboard with AI features
- **Tech Stack:** React (Vite), Node.js/Express, MySQL, Docker
- **Production:** https://meteo-beta.tachyonfuture.com
- **API:** https://api.meteo-beta.tachyonfuture.com
- **Security Score:** 9.4/10 (as of Nov 2025)

---

## 🚨 Critical Information

### SSH & Deployment
- **Server:** `michael@tachyonfuture.com`
- **App Path:** `/home/michael/meteo-app`
- **SSH is SAFE:** Previous lockout issues were resolved days ago. You CAN use SSH commands.
- **Deployment Script:** `bash scripts/deploy-beta.sh` (on production server)
- **Docker Compose:** Uses `docker-compose.prod.yml` for production

### Server Details
- **Hosting:** Hostinger VPS
- **Nginx Proxy Manager:** Port 81 (http://tachyonfuture.com:81)
- **Containers:** meteo-frontend-prod, meteo-backend-prod, meteo-mysql-prod
- **Networks:** npm_network (for Nginx), meteo-internal (backend-db)

### Environment Files
- **Development:** `backend/.env` (local only, not committed)
- **Production:** `.env.production` (on server at `/home/michael/meteo-app/.env.production`)
- **Example:** `.env.example` (in repo, template for users)

---

## 📚 Key Documentation (Read When Needed)

### Architecture & Setup
- **[README.md](README.md)** - Main overview, features, setup instructions
- **[ARCHITECTURE.md](ARCHITECTURE.md)** - System architecture with Mermaid diagrams
- **[docs/DEPLOYMENT_GUIDE_PRIVATE.md](docs/DEPLOYMENT_GUIDE_PRIVATE.md)** - Server-specific deployment info

### Recent Work (Nov 2025)
- **[docs/REGRESSION_PREVENTION.md](docs/REGRESSION_PREVENTION.md)** - **CRITICAL:** Regression prevention for "Old Location" bug (Nov 6, 2025) - READ THIS BEFORE MODIFYING GEOLOCATION/WEATHER SERVICES
- **[REDESIGN_SUMMARY.md](REDESIGN_SUMMARY.md)** - Unified Hero Card UI redesign (Nov 5, 2025)
- **[REFACTORING_SUMMARY.md](REFACTORING_SUMMARY.md)** - Major code organization overhaul (Nov 5, 2025)
- **[SECURITY_IMPLEMENTATION_SUMMARY.md](SECURITY_IMPLEMENTATION_SUMMARY.md)** - Latest security update (rate limiting, CORS, CSP)
- **[docs/RATE_LIMITING_AND_SECURITY_AUDIT.md](docs/RATE_LIMITING_AND_SECURITY_AUDIT.md)** - Security audit & implementation
- **[VITE_MIGRATION_GUIDE.md](VITE_MIGRATION_GUIDE.md)** - CRA to Vite migration (Nov 4, 2025)

### Troubleshooting
- **[TROUBLESHOOTING.md](TROUBLESHOOTING.md)** - Common issues and fixes
- **[docs/BUILD_VALIDATION.md](docs/BUILD_VALIDATION.md)** - Build config validation

---

## 🔧 Common Commands

### Local Development
```bash
# Start local dev environment
docker-compose up

# Run tests
cd backend && npm test
cd frontend && npm test

# Verify security features
./scripts/verify-security.sh
```

### Production Deployment
```bash
# SSH to server
ssh michael@tachyonfuture.com

# Navigate to project
cd /home/michael/meteo-app

# Pull latest code
git pull origin main

# Deploy
bash scripts/deploy-beta.sh
```

### Verification
```bash
# Check production health
curl https://api.meteo-beta.tachyonfuture.com/api/health

# Check security headers
curl -I https://api.meteo-beta.tachyonfuture.com/api/health | grep -E "X-Frame|RateLimit|CSP"

# Check container status (on server)
docker ps | grep meteo
```

---

## 🎯 Current Status (as of November 6, 2025)

### ✅ Recently Completed

- **UI Optimization - Material Design 3 Implementation (Phase 1 & 2)** (Nov 6, 2025)
  - **Phase 1:** Reduced Weather Dashboard UI elements by 30-40% using Material Design 3 8pt grid system
    - **Main Dashboard Optimizations:**
      - Temperature display: 72px → 48px (-33%)
      - Location name: 32px → 24px (-25%)
      - Card padding: 20px → 16px (-20%)
      - Border radius: 16px → 12px (more professional)
      - Typography: Following Material Design scale (11, 13, 14, 16, 20, 24, 48px)
      - Information density: +40% more content visible per viewport
    - **AI Hero Section Optimizations (35-40% height reduction):**
      - Container padding: 24px → 12px 16px (-50%)
      - Title font: 32px → 20px (-38%)
      - Subtitle font: 16px → 13px (-19%)
      - Input padding: 14px 16px → 8px 12px (-43%)
      - Example buttons: Changed from 2-column grid to horizontal single row
      - Total space savings: 140-160px of vertical space
    - **Border Removal for Seamless Layout:**
      - Removed search section bottom border
      - Removed location header bottom border
      - Removed radar section top border
      - Result: Cleaner, more cohesive visual flow
  - **Phase 2:** Info Box Reorganization & Additional 20% Size Reduction
    - **Hero Stats Grid:** 3 columns → 5 columns (Conditions, Precip Chance, Wind, Humidity, 24h Precip)
    - **Highlights Grid:** 2-column vertical → 4-column horizontal layout
    - **Conditions Integration:** Moved from separate section to first stat box with dynamic weather icon
    - **20% Size Reduction:** All info boxes reduced (padding, icons, fonts, gaps)
    - **Space Savings:** Hero stats -30% height, Highlights -50% height, Total info boxes -43%
    - **Responsive:** 5-col desktop → 3-col tablet → 2-col mobile
  - **Combined Impact:**
    - Overall vertical space reduction: ~50-60%
    - Information density: +70% more content per viewport
    - Horizontal space efficiency: +85%
    - Professional Material Design 3 aesthetic maintained
  - **Files:** WeatherDashboard.jsx, WeatherDashboard.css, AIWeatherHero.css
  - **Documentation:** UI_OPTIMIZATION_SUMMARY.md, AI_HERO_OPTIMIZATION_SUMMARY.md

- **CRITICAL: Express Route Ordering Fix & Performance Optimization** (Nov 6, 2025)
  - **CRITICAL FIX:** Fixed Express route ordering bug causing 404s on `/reverse` endpoint
  - Routes reordered so `/:id` catch-all comes LAST (was intercepting `/reverse`, `/search`, etc.)
  - Fixed "Use My Location" feature (was completely broken due to reverse geocoding 404s)
  - Eliminated slow initial page load (3-5 seconds → <1 second)
  - Eliminated FOUC (Flash of Unstyled Content)
  - Added CSS code splitting in Vite for faster rendering
  - **Performance Impact:**
    - Reverse geocoding: 404 error → ~40ms (fixed + 75x faster)
    - Initial page load: 5x faster
    - Database queries: Using optimized indexes (20-50x faster from migrations)
  - **Root Cause:** `router.get('/:id')` was before `router.get('/reverse')`, causing Express to treat "reverse" as a location ID
  - **Files:** backend/routes/locations.js, frontend/vite.config.js
  - **Commits:** 0e0e181

- **Database Performance Optimization (5 Migrations)** (Nov 6, 2025)
  - Migration 001: FULLTEXT index on locations (20x faster text search)
  - Migration 002: API cache cleanup (auto-cleanup of expired cache entries)
  - Migration 003: AI shares cleanup (auto-cleanup of expired shares)
  - Migration 004: Spatial index on locations (50x faster coordinate lookup)
  - Migration 005: Table partitioning on weather_data (10x faster date queries)
  - All 585,784 weather records preserved (100% data integrity)
  - Updated locationService.js and historicalDataService.js to use new indexes
  - **Impact:** Production-ready database performance at scale

- **Ultra-Compact Dashboard Layout & RadarMap Fixes** (Nov 5, 2025)
  - Redesigned hero section with two-column layout (weather info left, radar right)
  - Fixed RadarMap height prop bug (string vs number causing "350pxpx")
  - Radar map increased to 600px width × 600px height for better visibility
  - Reduced font sizes: location 48px→32px, temp 96px→72px
  - Simplified stats grid from 5 to 3 columns (Wind, Humidity, 24h Precip)
  - All critical info now fits in one viewport without scrolling
  - 40% reduction in vertical space usage
  - **Files:** WeatherDashboard.css, WeatherDashboard.jsx, RadarMap.css
  - **Commits:** 6064610, 22c7d2a, 05021f7, a63c0b6

- **Error Message Improvement Initiative (Phases 1-4)** (Nov 5, 2025)
  - Created comprehensive ErrorMessage component with 4 display modes (inline, toast, banner, modal)
  - Implemented error analytics system with tracking and statistics
  - Added offline detection with OfflineBanner component
  - Created useOnlineStatus and useRetryHandler hooks
  - Enhanced timeout configuration with environment variables (VITE_*)
  - Comprehensive error message style guide (700+ lines)
  - Updated RadarMap to use new error system
  - **Files:** 15 files total (9 new, 6 modified), 3,130+ lines of code
  - **Status:** All 4 phases complete (100%)

- **"Old Location" Bug Fix & Backend Regression Prevention** (Nov 6, 2025)
  - **CRITICAL FIX:** Backend now catches Visual Crossing API placeholders
  - Added Nominatim reverse geocoding for when VC returns "Old Location" or raw coordinates
  - Created comprehensive backend regression test suite (309 lines)
  - Expanded pre-commit hooks to cover backend weatherService.js
  - Added CI/CD workflow for both frontend AND backend regression tests
  - Added production logging to detect regression in real-time
  - **Lesson Learned:** Frontend regression tests worked perfectly, but backend was unprotected
  - **Files:** backend/services/weatherService.js, backend/tests/services/weatherService.regression.test.js
  - **Commits:** b69b1d7 (fix), 92929ec (tests)

- **Unified Hero Card UI Redesign** (Nov 5, 2025)
  - Consolidated scattered dashboard layout into single unified card
  - Everything in one place: search, weather, highlights, actions, radar, charts
  - Massive temperature display (96px font, up from 32px)
  - Clean, minimal design with consistent spacing and borders
  - Modern card design with 20px rounded corners and elevated shadows
  - Fully responsive (desktop → tablet → mobile)
  - Better visual hierarchy and information flow
  - Hover animations on stat cards
  - **Files:** WeatherDashboard.jsx, WeatherDashboard.css (300+ lines new CSS)

- **UI Density Optimization & Regression Prevention** (Nov 5, 2025)
  - Created ultra-compact density mode (50-70% size reduction)
  - Disabled dev server caching to prevent cache-related confusion
  - Fixed CSS specificity issues (import order matters!)
  - Implemented 4-layer regression prevention system for "Old Location" bug:
    - Automated regression tests (geolocationService.regression.test.js)
    - Pre-commit hooks (.husky/pre-commit-regression-check)
    - Custom ESLint rules (.eslintrc-custom-rules.js)
    - Comprehensive documentation (docs/REGRESSION_PREVENTION.md)
  - Fixed false VPN/proxy warnings (only trigger for accuracy > 10km)
  - **Files:** frontend/src/styles/density-compact.css, vite.config.js

- **Major Code Refactoring** (Nov 5, 2025)
  - Split WeatherDashboard.jsx (1,250 lines → 5 focused components)
  - Split LocationComparisonView.jsx (1,032 lines → 4 focused components)
  - Created reusable useLocationConfirmation hook
  - Centralized constants directory (weather, storage configs)
  - Implemented debugLogger utility (environment-aware logging)
  - Created errorHandler utility (20+ error codes, standardized handling)
  - Eliminated 100% of code duplication
  - Removed all console.log statements from production code
  - **Impact:** 70% component size reduction, single source of truth

- **Security Update Deployed** (Nov 5, 2025)
  - Rate limiting: 100/15min API, 5/15min auth, 10/hour AI
  - CORS validation with origin whitelist
  - CSP headers (XSS protection)
  - Helmet security headers (X-Frame-Options, HSTS)
  - 6 critical vulnerabilities fixed (CVSS 8.5 → 0)
  - 96% AI cost abuse reduction ($3,600/month → $36/month)

- **Vite Migration** (Nov 4, 2025)
  - Migrated from Create React App to Vite
  - 10-100x faster builds
  - TypeScript support added (gradual migration)
  - ESLint, Prettier, Husky pre-commit hooks

- **Build Validation System** (Nov 2025)
  - Automated config validation (`npm run validate`)
  - Prevents Vite/CRA config drift

### 🔄 Current Tech Stack
- **Frontend:** React 19.2.0, Vite 6.0.7, Recharts 3.3.0, Leaflet 1.9.4
- **Backend:** Node.js, Express 4.21.1, MySQL 8.0
- **Security:** express-rate-limit 8.2.1, helmet 8.1.0
- **Testing:** Jest/Vitest (476/476 tests passing)
- **CI/CD:** GitHub Actions (deploy.yml, ci.yml, security-scan.yml)

### 📊 Metrics
- **Test Coverage:** Frontend 33.65%, Backend 60-65%
- **Security Score:** 9.4/10
- **Vulnerabilities:** 0 (npm audit)
- **Database:** 585K+ pre-populated weather records
- **API Cache Hit Rate:** 99%

---

## 🚀 Common Tasks & Where to Find Info

| Task | Documentation |
|------|--------------|
| Deploy to production | [DEPLOY_VIA_VSCODE.md](DEPLOY_VIA_VSCODE.md) or `scripts/deploy-beta.sh` |
| Add new features | [docs/development/AGENTS.md](docs/development/AGENTS.md) |
| Fix bugs | [TROUBLESHOOTING.md](TROUBLESHOOTING.md) |
| Improve security | [docs/RATE_LIMITING_AND_SECURITY_AUDIT.md](docs/RATE_LIMITING_AND_SECURITY_AUDIT.md) |
| Update dependencies | Check package.json, run `npm audit`, test thoroughly |
| Database changes | `database/schema.sql` + migrations |
| Frontend build issues | [VITE_MIGRATION_GUIDE.md](VITE_MIGRATION_GUIDE.md) |
| Environment config | `.env.example` for reference |

---

## 💡 Project Conventions

### Code Style
- **Backend:** CommonJS (`require/module.exports`)
- **Frontend:** ESM (`import/export`)
- **Linting:** ESLint + Prettier (auto-format on commit via Husky)
- **Commits:** Conventional commits format (feat:, fix:, docs:, etc.)
- **All commits:** End with Claude Code attribution

### File Structure
```
meteo-app/
├── backend/           # Express API
├── frontend/          # React (Vite) app
├── database/          # MySQL schema & seeds
├── docs/              # Comprehensive documentation
├── scripts/           # Deployment & utility scripts
├── .env.example       # Environment variable template
└── docker-compose.yml # Local development
└── docker-compose.prod.yml # Production
```

### Environment Variables
- **Frontend (Vite):** `VITE_*` prefix (e.g., `VITE_API_URL`)
- **Backend:** No prefix needed (e.g., `DB_HOST`, `JWT_SECRET`)
- **Never commit:** `.env` files (in `.gitignore`)
- **Always update:** `.env.example` when adding new vars

---

## 🔍 How to Use This File

### At Session Start, Say:
```
"Read CLAUDE.md to get up to speed on the project"
```

### When Working on Specific Areas:
```
"Read CLAUDE.md, then read [specific doc] for context on [feature]"
```

### For Troubleshooting:
```
"Read CLAUDE.md and TROUBLESHOOTING.md before we start"
```

### For New Features:
```
"Read CLAUDE.md and docs/development/AGENTS.md for coding conventions"
```

---

## 🎓 Quick Orientation for New Work

1. **Read this file** (CLAUDE.md) - 2 minutes
2. **Check recent commits** (`git log --oneline -10`) - 30 seconds
3. **Review relevant docs** from "Key Documentation" section - 5-10 minutes
4. **Ask clarifying questions** if anything is unclear
5. **Start coding** with full context

---

## 📞 Support & Resources

- **GitHub Repo:** https://github.com/mbuckingham74/meteo-weather
- **Production Site:** https://meteo-beta.tachyonfuture.com
- **API Health:** https://api.meteo-beta.tachyonfuture.com/api/health
- **Documentation Index:** [docs/README.md](docs/README.md)

---

## ⚠️ Important Notes

1. **SSH is safe to use** - Don't worry about lockouts, that's resolved
2. **Always test locally first** - Use `docker-compose up` before deploying
3. **Security is critical** - We have rate limiting and proper auth now
4. **Documentation is comprehensive** - Check docs/ folder before asking
5. **Tests must pass** - All 476 tests before deploying
6. **Environment-aware code** - Handle both dev and production correctly
7. **CSS import order matters** - density-compact.css MUST be imported last in App.jsx
8. **Dev caching disabled** - vite.config.js has no-cache headers to prevent confusion
9. **Regression prevention** - Pre-commit hooks and tests prevent "Old Location" bug
10. **Express route ordering** - Parameter routes (`:id`) MUST come AFTER specific routes (`/reverse`, `/search`, etc.) or they will act as catch-alls

---

**Last Updated:** November 6, 2025
**Current Version:** v1.1.0-security
**Maintainer:** Michael Buckingham

---

## 🎯 Session Startup Template

When starting a new session, use this:

```
Hi Claude! Please read CLAUDE.md to get up to speed on the Meteo Weather App project.

[Then describe what you want to work on]
```

This ensures:
- ✅ You know the project structure
- ✅ You understand the deployment process
- ✅ You're aware of recent changes
- ✅ You know where to find information
- ✅ You can work efficiently without repetition
