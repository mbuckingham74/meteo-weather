# CI/CD Developer Guide

**Complete guide to the Meteo Weather App continuous integration and deployment pipeline.**

Last Updated: November 7, 2025

---

## Table of Contents

1. [Overview](#overview)
2. [Workflows](#workflows)
3. [Developer Experience Features](#developer-experience-features)
4. [Local Development](#local-development)
5. [Pre-commit Hooks](#pre-commit-hooks)
6. [Skipping CI/CD](#skipping-cicd)
7. [Troubleshooting](#troubleshooting)
8. [Best Practices](#best-practices)

---

## Overview

The Meteo Weather App uses a modern, optimized CI/CD pipeline built on GitHub Actions with the following goals:

- **Speed**: 50-70% faster than traditional CI through aggressive caching and parallelization
- **Developer Experience**: Immediate feedback on code quality, tests, and security
- **Safety**: Multiple layers of validation before production deployment
- **Automation**: Minimal manual intervention required

### Pipeline Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                       Code Push / PR                        │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                    Pre-commit Hooks                         │
│  • Linting (ESLint)                                         │
│  • Formatting (Prettier)                                    │
│  • Regression Tests (Critical files only)                   │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                     CI Pipeline (Parallel)                  │
├─────────────────────────────────────────────────────────────┤
│  Backend Lint    Frontend Lint    Docker Build             │
│  Backend Tests   Frontend Tests   Docker Compose            │
│  (Node 20,22)    (Node 20,22)     Validation                │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                  Security Scans (Parallel)                  │
│  • Gitleaks (Secrets)                                       │
│  • NPM Audit (Vulnerabilities)                              │
│  • CodeQL (Code Analysis)                                   │
│  • Dependency Review (PRs only)                             │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│              Regression Tests (Path-based)                  │
│  • geolocationService.js → Frontend regression tests        │
│  • weatherService.js → Backend regression tests             │
│  • Only runs when critical files change                     │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                Production Deployment (main only)            │
│  • SSH to production server                                 │
│  • Pull latest code                                         │
│  • Docker Compose rebuild                                   │
│  • Health checks (Frontend + Backend API)                   │
│  • Smoke tests (Weather API, Locations API)                 │
└─────────────────────────────────────────────────────────────┘
```

---

## Workflows

### 1. CI Pipeline (`.github/workflows/ci.yml`)

**Triggers:**
- Push to `main` or `develop` branches
- Pull requests to `main` or `develop`

**Jobs:**

| Job | Description | Runs On | Duration |
|-----|-------------|---------|----------|
| `backend-lint` | ESLint for backend | ubuntu-latest | ~30s |
| `backend-test` | Jest tests (Node 20.x, 22.x) | ubuntu-latest + MySQL | ~2-3min |
| `frontend-lint` | ESLint + build validation | ubuntu-latest | ~30s |
| `frontend-test` | Vitest tests (Node 20.x, 22.x) | ubuntu-latest | ~2-3min |
| `frontend-build` | Production build test | ubuntu-latest | ~1-2min |
| `docker-build` | Docker image builds (backend + frontend) | ubuntu-latest | ~3-4min |
| `docker-compose-validation` | Validate compose files | ubuntu-latest | ~10s |
| `pr-comment` | Post results to PR | ubuntu-latest | ~10s |
| `ci-success` | Final status check | ubuntu-latest | ~5s |

**Key Features:**
- ✅ **Parallel execution** - All jobs run simultaneously
- ✅ **Matrix strategy** - Tests run on Node 20.x and 22.x
- ✅ **Smart caching** - npm dependencies cached via GitHub Actions
- ✅ **Docker layer caching** - Reuses Docker layers between builds
- ✅ **Coverage thresholds** - Enforces minimum test coverage
- ✅ **PR comments** - Automated test results posted to PRs
- ✅ **Skip support** - Use `[skip ci]` in commit message

**Coverage Thresholds:**
```javascript
Statements: 25%
Branches:   15%
Functions:  20%
Lines:      25%
```

---

### 2. Deploy to Production (`.github/workflows/deploy.yml`)

**Triggers:**
- Push to `main` branch
- Manual workflow dispatch

**Environment:**
- Name: `production`
- URL: https://meteo-beta.tachyonfuture.com

**Deployment Steps:**

1. **SSH to Production Server**
   ```bash
   ssh michael@tachyonfuture.com
   cd /home/michael/meteo-app
   ```

2. **Pull Latest Code**
   ```bash
   git fetch origin
   git reset --hard origin/main
   ```

3. **Run Deployment Script**
   ```bash
   bash scripts/deploy-beta.sh
   ```
   - Verifies environment configuration
   - Builds Docker images (frontend + backend)
   - Restarts all services
   - Waits for MySQL readiness

4. **Health Checks** (15 second wait + 5 retries)
   - Frontend: `curl https://meteo-beta.tachyonfuture.com` → 200 OK
   - Backend: `curl https://api.meteo-beta.tachyonfuture.com/api/health` → `{"status":"ok"}`

5. **Smoke Tests**
   - Weather API: `GET /api/weather/current?location=London`
   - Locations API: `GET /api/locations/search?q=New York`

**Concurrency:**
- Only one deployment runs at a time
- New deployments do NOT cancel in-progress ones

**Skip Support:**
- Use `[skip deploy]` in commit message to skip deployment

---

### 3. Security Scan (`.github/workflows/security-scan.yml`)

**Triggers:**
- Push to `main` or `develop`
- Pull requests to `main` or `develop`
- Weekly schedule (Sundays at 2 AM UTC)
- Manual workflow dispatch

**Jobs:**

| Job | Tool | Purpose | Frequency |
|-----|------|---------|-----------|
| `gitleaks` | Gitleaks | Secret scanning | Every push + weekly |
| `npm-audit` | npm audit | Dependency vulnerabilities | Every push + weekly |
| `dependency-review` | GitHub | PR dependency review | PRs only |
| `security-success` | - | Final status check | Always |

**Vulnerability Thresholds:**
- ❌ **FAIL**: Critical or High vulnerabilities
- ⚠️ **WARN**: Moderate vulnerabilities
- ✅ **PASS**: Low vulnerabilities

**Denied Licenses:**
- GPL-3.0
- AGPL-3.0

---

### 4. CodeQL Analysis (`.github/workflows/codeql.yml`)

**Triggers:**
- Push to `main` or `develop`
- Pull requests
- Weekly schedule (Mondays at midnight UTC)

**Analysis:**
- Languages: JavaScript/TypeScript
- Queries: `security-extended`, `security-and-quality`
- Results: GitHub Security tab

---

### 5. Regression Tests (`.github/workflows/regression-tests.yml`)

**Triggers:**
- Push/PR when critical files change:
  - `frontend/src/services/geolocationService.js`
  - `frontend/src/contexts/LocationContext.jsx`
  - `backend/services/weatherService.js`
  - `backend/services/geocodingService.js`

**Purpose:**
Prevents the "Old Location" bug from being reintroduced (see [docs/troubleshooting/REGRESSION_PREVENTION.md](REGRESSION_PREVENTION.md))

**Jobs:**
- `frontend-regression`: Tests geolocationService + LocationContext
- `backend-regression`: Tests weatherService sanitization

---

### 6. Coverage Badge (`.github/workflows/coverage-badge.yml`)

**Triggers:**
- After successful CI Pipeline on `main` branch
- Manual workflow dispatch

**Purpose:**
Updates the coverage badge in README.md

**Badge URL:**
```markdown
![Coverage](https://img.shields.io/endpoint?url=https://gist.githubusercontent.com/USER/GIST_ID/raw/meteo-coverage-badge.json)
```

---

## Developer Experience Features

### 1. Fast Feedback

**Optimization** | **Impact** | **Implementation**
---|---|---
Dependency caching | 50-70% faster installs | GitHub Actions cache with `package-lock.json` key
Docker layer caching | 60-80% faster builds | `cache-from: type=gha, cache-to: type=gha,mode=max`
Parallel jobs | 3x faster pipeline | All jobs run simultaneously
Matrix parallelization | Tests on multiple Node versions | `strategy.matrix.node-version: [20.x, 22.x]`
Path-based triggers | Only run affected tests | `on.push.paths` filtering
Concurrency control | Cancel outdated runs | `concurrency.cancel-in-progress: true`

### 2. PR Comments

Every PR receives an automated comment with:
- ✅ Test status
- 📊 Coverage metrics with pass/fail indicators
- Node.js versions tested

Example:
```markdown
## 🧪 CI Test Results

✅ All tests passed!

### 📊 Frontend Coverage

| Metric | Coverage | Status |
|--------|----------|--------|
| Statements | 33.65% | ✅ |
| Branches | 18.23% | ✅ |
| Functions | 28.47% | ✅ |
| Lines | 33.21% | ✅ |

---
*CI Pipeline completed in Node.js 20.x and 22.x*
```

### 3. GitHub Summaries

Every workflow run generates a markdown summary visible in the Actions tab:

- CI Pipeline: Quality check results
- Deployment: Health check status + URLs
- Security: Vulnerability counts
- CodeQL: Analysis completion

---

## Local Development

### Running CI Locally with Act

Install [Act](https://github.com/nektos/act) to test workflows locally:

```bash
# Install Act (macOS)
brew install act

# Install Act (Linux)
curl https://raw.githubusercontent.com/nektos/act/master/install.sh | sudo bash

# Run CI workflow
act pull_request

# Run specific job
act -j backend-test

# Run with secrets
act -s GITHUB_TOKEN=your_token

# List available workflows
act -l
```

### Pre-commit Hook Testing

Test pre-commit hooks without committing:

```bash
# Run pre-commit hook manually
.husky/pre-commit

# Test specific file
git add frontend/src/services/geolocationService.js
.husky/pre-commit

# Skip pre-commit hooks (not recommended)
git commit --no-verify -m "Your message"
```

### Local Docker Testing

Test Docker builds locally:

```bash
# Build backend
cd backend
docker build -t meteo-backend:local .

# Build frontend
cd frontend
docker build -t meteo-frontend:local .

# Test docker-compose
docker compose config
docker compose up -d
docker compose logs -f
```

---

## Pre-commit Hooks

Located in `.husky/pre-commit`, the hook runs:

### 1. Frontend Linting & Formatting
```bash
cd frontend
npx lint-staged  # Runs ESLint + Prettier on staged files
```

### 2. Backend Linting & Formatting
```bash
cd backend
npx prettier --write <staged-files>
npx eslint --fix <staged-files>
```

### 3. Regression Tests (Conditional)

**Trigger** | **Tests Run**
---|---
`geolocationService.js` modified | `geolocationService.regression.test.js`
`LocationContext.jsx` modified | `LocationContext.regression.test.jsx`
`weatherService.js` modified | `weatherService.regression.test.js`

**Duration:** 5-10 seconds (only critical tests)

---

## Skipping CI/CD

### Skip All CI

Add `[skip ci]` to your commit message:

```bash
git commit -m "docs: Update README [skip ci]"
```

This skips:
- ✅ CI Pipeline
- ✅ Security Scans
- ✅ CodeQL Analysis

**Does NOT skip:**
- ❌ Pre-commit hooks (run locally)
- ❌ Regression tests (path-based)

### Skip Deployment Only

Add `[skip deploy]` to your commit message:

```bash
git commit -m "fix: Minor UI tweak [skip deploy]"
```

This:
- ✅ Runs full CI pipeline
- ❌ Skips production deployment

### When to Skip

**✅ Safe to skip CI:**
- Documentation updates (`*.md`)
- README changes
- Comment-only changes
- Whitespace fixes

**❌ Never skip CI for:**
- Code changes (`.js`, `.jsx`, `.ts`, `.tsx`)
- Configuration changes (`.yml`, `.json`)
- Dependency updates (`package.json`)
- Security fixes

---

## Troubleshooting

### CI Failing on "Check coverage thresholds"

**Error:**
```
❌ Statements coverage 22.5% is below threshold 25%
```

**Solution:**
1. Check coverage report: `cd frontend && npm run test:coverage`
2. Add tests to uncovered files
3. Or adjust thresholds in `.github/workflows/ci.yml` (lines 105-108)

### Docker Build Failing

**Error:**
```
ERROR: failed to solve: process "/bin/sh -c npm ci" did not complete successfully
```

**Solution:**
1. Check `package-lock.json` is committed
2. Verify Dockerfile syntax
3. Test locally: `docker build -t test .`

### Deployment Health Checks Failing

**Error:**
```
❌ Backend API health check failed after 5 attempts
```

**Solution:**
1. SSH to server: `ssh michael@tachyonfuture.com`
2. Check logs: `cd /home/michael/meteo-app && docker compose -f docker-compose.prod.yml logs -f`
3. Check containers: `docker ps | grep meteo`
4. Verify network: `docker network ls | grep npm_network`

### Pre-commit Hook Too Slow

**Issue:** Regression tests taking >30 seconds

**Solution:**
1. Only modify critical files when necessary
2. Skip hooks temporarily (not recommended):
   ```bash
   git commit --no-verify -m "Your message"
   ```
3. Optimize test files (use mocks, reduce test cases)

### npm audit Failing

**Error:**
```
❌ Security audit failed - Critical vulnerabilities detected
```

**Solution:**
1. Check audit report: `npm audit`
2. Update dependencies: `npm audit fix`
3. If no fix available:
   - Check for alternative packages
   - Add to `overrides` in `package.json`
   - Document exception in security docs

---

## Best Practices

### 1. Commit Messages

Use conventional commits for better CI integration:

```bash
# Good
git commit -m "feat: Add dark mode toggle"
git commit -m "fix: Resolve API timeout issue"
git commit -m "docs: Update deployment guide [skip ci]"

# Bad
git commit -m "fixed stuff"
git commit -m "WIP"
git commit -m "asdf"
```

### 2. Testing Before Push

Always run tests locally before pushing:

```bash
# Full test suite
npm run test                  # Root: both frontend + backend
npm run test:frontend         # Frontend only
npm run test:backend          # Backend only

# Linting
npm run lint                  # Root: both
npm run lint:fix              # Auto-fix issues

# Build validation
npm run build                 # Frontend production build
npm run validate              # Vite config validation
```

### 3. Dependency Updates

When updating dependencies:

```bash
# Update and test
npm update
npm test
npm audit

# Check for outdated packages
npm outdated

# Update package.json ranges
npm install <package>@latest

# Always commit package-lock.json
git add package.json package-lock.json
git commit -m "chore: Update dependencies"
```

### 4. CI/CD Monitoring

Monitor CI/CD health:

- **Actions Tab**: https://github.com/mbuckingham74/meteo-weather/actions
- **Security Tab**: https://github.com/mbuckingham74/meteo-weather/security
- **Insights > Dependency Graph**: View dependency vulnerabilities

Set up notifications:
- GitHub: Settings > Notifications > Actions
- Email: Receive failure notifications

### 5. Branch Protection Rules

Recommended settings for `main` branch:

```yaml
Require pull request reviews: 1 approval
Require status checks before merging:
  - ci-success (from ci.yml)
  - security-success (from security-scan.yml)
Require branches to be up to date: Yes
Require linear history: Yes
Do not allow bypassing: Yes (except admins)
```

---

## Performance Metrics

### Before Optimization

| Metric | Value |
|--------|-------|
| CI Pipeline Duration | 8-12 minutes |
| Dependency Install Time | 2-3 minutes per job |
| Docker Build Time | 5-7 minutes |
| Total Jobs | 3 sequential |
| Feedback Loop | 15-20 minutes |

### After Optimization

| Metric | Value | Improvement |
|--------|-------|-------------|
| CI Pipeline Duration | 3-5 minutes | **58-62% faster** |
| Dependency Install Time | 15-30 seconds per job | **75-90% faster** |
| Docker Build Time | 1-2 minutes | **71-80% faster** |
| Total Jobs | 9 parallel | **3x parallelization** |
| Feedback Loop | 5-7 minutes | **65% faster** |

---

## Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Act - Run Actions Locally](https://github.com/nektos/act)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [Docker Build Optimization](https://docs.docker.com/build/cache/)
- [npm Caching Best Practices](https://docs.github.com/en/actions/using-workflows/caching-dependencies-to-speed-up-workflows)

---

## Support

For CI/CD issues:
1. Check this guide first
2. Review [TROUBLESHOOTING.md](../TROUBLESHOOTING.md)
3. Check GitHub Actions logs
4. Open GitHub issue with `ci/cd` label

---

**Last Updated:** November 7, 2025
**Maintainer:** Michael Buckingham
