# Improvements TODO List

**Last Updated:** November 5, 2025
**Status:** Prioritized improvements ready for implementation

---

## 🗓️ Today's Front-End To-Do

- [x] **Phase 3.3 Stylelint Gate**
  - Stylelint now runs via root lint scripts, husky pre-commit, and CI (`frontend-lint` job). See completion write-up: docs/development/CSS_PHASE_3.3_COMPLETE.md.
- [x] **Unified Breakpoint Source**
  - Breakpoint values now live in `frontend/config/breakpoints.json`, PostCSS compiles the `--bp-*` tokens globally, ITCSS utilities use them, and JS can import `src/constants/breakpoints.js` / `useBreakpoint`. See: frontend/BREAKPOINT_SYSTEM.md.
- [x] **Component Token Catalog & Theme Presets**
  - Token inventory lives in docs/ui-ux/COMPONENT_TOKEN_CATALOG.md, new `aurora`/`sunset` presets are available via `data-theme`, and `npm run validate:tokens` enforces consistent overrides.
- [ ] **Shared Retry/Cache Config**
  - Centralize retry/throttle helpers plus environment-aware cache TTLs so frontend services, hooks, and tests all consume the same constants with inline documentation. _(Ref: docs/development/CODE_QUALITY_AUDIT.md)_

---

## ✅ Completed (November 4-5, 2025)

### Priority 1 Fixes
- ✅ **Centralized API URLs** - 92% reduction in duplication (13+ files → 1 config)
- ✅ **Documented Timeouts** - Frontend + backend timeout constants
- ✅ **Production OpenWeather API Fix** - Radar map now functional on beta
- ✅ **Automated API Testing** - `scripts/test-production-apis.sh` verifies all endpoints
- ✅ **JWT_REFRESH_SECRET** - Added to production environment

### Security & Dependencies
- ✅ **npm vulnerabilities** - Reviewed (dev-only webpack issues, low risk in production)

---

## 🚀 High Priority (User Value)

### UX Improvements
- [ ] **Loading State Enhancement** (Est: 4 hours)
  - Replace generic spinners with content-aware skeletons
  - Target areas: AI query processing, chart loading, location search
  - Files: `frontend/src/components/loading/`

- [ ] **Error Recovery UX** (Est: 3 hours)
  - Add retry buttons for timeout errors
  - Suggest nearby cities for "Location not found"
  - Show available date ranges for "No data available"
  - Files: Error boundary, API error handlers

### Feature Enhancements
- [ ] **Email Notifications** (Est: 8-10 hours)
  - SMTP integration (SendGrid/AWS SES)
  - Daily/weekly weather reports
  - Severe weather alerts
  - Cron job for scheduled sends
  - Database schema already complete
  - UI already built in UserPreferencesPage

- [ ] **Historical Rainfall Table Enhancement** (Est: 2 hours)
  - Add to more pages beyond "This Day in History"
  - Month-over-month rainfall trends
  - Compare today vs 10-year average
  - Climate change visualization

### PWA Enhancements
- [ ] **Offline Capabilities** (Est: 3 hours)
  - Cache favorite locations for offline access
  - Store last viewed weather data
  - Background sync for weather updates
  - Service worker enhancement

---

## 🔧 Code Quality (Maintainability)

### Priority 2 Fixes
- [ ] **Refactor Retry Logic** (Est: 1 hour)
  - Create `frontend/src/utils/apiRetry.js`
  - Create `backend/utils/retryHelper.js`
  - Currently duplicated in 3+ files
  - See: `backend/services/weatherService.js`

- [ ] **Standardize CSS Breakpoints** (Est: 3 hours)
  - Create `frontend/src/styles/breakpoints.css`
  - Define CSS custom properties:
    - `--breakpoint-mobile: 480px`
    - `--breakpoint-tablet: 768px`
    - `--breakpoint-desktop: 1024px`
  - Update 48 files with inconsistent breakpoints
  - Use `@media (min-width: var(--breakpoint-tablet))`

### Priority 3 Fixes
- [ ] **Environment-Aware Cache TTL** (Est: 30 min)
  - Development: shorter TTLs for faster iteration
  - Production: longer TTLs for performance

- [ ] **Constants Documentation** (Est: 1 hour)
  - Add JSDoc comments to all config files
  - Document the "why" behind timeout values
  - Create usage examples

---

## 📊 Monitoring & Analytics

### Error Tracking
- [ ] **Sentry Integration** (Est: 2 hours)
  - Frontend error boundaries
  - Backend API failures
  - User session replay
  - Automatic issue creation

- [ ] **Performance Monitoring** (Est: 2 hours)
  - Lighthouse CI integration
  - API response time tracking
  - Cache hit rate monitoring
  - Database query performance

---

## 📝 Implementation Notes

### Email Notifications Setup
```bash
# 1. Install dependencies
cd backend
npm install nodemailer @sendgrid/mail

# 2. Add env vars to .env.production
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=<sendgrid_api_key>
FROM_EMAIL=noreply@meteo-beta.tachyonfuture.com

# 3. Create email service
touch backend/services/emailService.js

# 4. Create cron job
touch backend/scripts/sendWeatherReports.js

# 5. Add to crontab
crontab -e
# 0 7 * * * cd /home/michael/meteo-app && node backend/scripts/sendWeatherReports.js
```

### Sentry Setup
```bash
# 1. Install Sentry
npm install --save @sentry/react @sentry/node

# 2. Get DSN from sentry.io
# 3. Add to .env files
REACT_APP_SENTRY_DSN=<frontend_dsn>
SENTRY_DSN=<backend_dsn>

# 4. Initialize in App.js and server.js
```

---

## 🎯 Recommended Execution Order

**Week 1:**
1. Error Recovery UX (3 hours) - Quick user value
2. Loading State Enhancement (4 hours) - Polish

**Week 2:**
3. Email Notifications (8-10 hours) - High-value feature

**Week 3:**
4. PWA Offline (3 hours) - User experience
5. Historical Rainfall Table (2 hours) - Content enhancement

**Week 4:**
6. Sentry Integration (2 hours) - Monitoring
7. CSS Breakpoints (3 hours) - Code quality

**As Needed:**
8. Retry Logic Refactor (1 hour) - Maintenance
9. Performance Monitoring (2 hours) - Analytics

---

## 📋 Definition of Done

Each task should include:
- [ ] Code implementation
- [ ] Tests (if applicable)
- [ ] Documentation updated
- [ ] CHANGELOG.md entry
- [ ] Tested on localhost
- [ ] Deployed to beta
- [ ] **Automated test suite passes** (`bash scripts/test-production-apis.sh`)
- [ ] User acceptance testing

**Note:** Priority 2 and 3 code quality fixes improve maintainability but don't directly impact users. Balance these with user-facing improvements.
