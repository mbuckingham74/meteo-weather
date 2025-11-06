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

## 🎯 Current Status (as of November 5, 2025)

### ✅ Recently Completed
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

---

**Last Updated:** November 5, 2025
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
