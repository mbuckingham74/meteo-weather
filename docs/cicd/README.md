# ⚙️ CI/CD Pipeline

Continuous Integration and Deployment documentation for Meteo Weather App.

**Pipeline Speed:** 50-70% faster | **Parallel Jobs:** 9 simultaneous

## Quick Links

- **[QUICK_REFERENCE.md](QUICK_REFERENCE.md)** - One-page CI/CD cheat sheet
- **[DEVELOPER_GUIDE.md](DEVELOPER_GUIDE.md)** - Complete CI/CD pipeline guide
- **[OPTIMIZATION_SUMMARY.md](OPTIMIZATION_SUMMARY.md)** - Recent optimization improvements

## Workflows

### 1. CI Pipeline (`ci.yml`)
**Runs on:** Every push and pull request

- ✅ Matrix testing (Node.js 20.x, 22.x)
- ✅ Parallel execution (lint, test, build)
- ✅ Frontend & backend testing
- ✅ Docker build verification
- ✅ Production build validation

**Optimizations:**
- Smart caching (node_modules, npm cache)
- Parallel job execution
- Conditional job runs
- Early failure detection

### 2. Deployment Pipeline (`deploy.yml`)
**Runs on:** Push to `main` branch

- 🚀 Automatic SSH deployment
- ✅ Health checks (frontend + API)
- 📊 Deployment summary
- ⚡ Zero-downtime deployments
- 🎯 Manual trigger option

**Flow:**
1. Checkout code
2. SSH to production server
3. Pull latest changes
4. Run deployment script
5. Health check verification
6. Status report

### 3. Security Scanning (`security-scan.yml`)
**Runs on:** Every push + weekly schedule

- 🔍 Gitleaks secret detection
- 🛡️ npm audit vulnerability scan
- 🔒 CodeQL static analysis
- 📋 SARIF report uploads
- 🚨 Security alerts

**Weekly Schedule:** Sunday 2 AM UTC

### 4. Dependency Review (`dependency-review.yml`)
**Runs on:** Pull requests only

- 📦 New dependency analysis
- ⚠️ License compliance check
- 🔍 Vulnerability detection
- 📊 Dependency diff report

### 5. Coverage Badge (`coverage-badge.yml`)
**Runs on:** Push to `main` branch

- 📈 Test coverage calculation
- 🏷️ Badge generation
- 💾 Coverage report storage

### 6. CodeQL Analysis (`codeql.yml`)
**Runs on:** Push, PR, weekly schedule

- 🔍 JavaScript/TypeScript analysis
- 🐛 Security vulnerability detection
- 📊 GitHub Security tab integration
- 📅 Weekly scheduled scans (Mondays)

## Recent Optimizations (Nov 7, 2025)

### Performance Improvements
- **50-70% faster CI** through aggressive caching
- **Docker layer caching** reduces build time by 60-80%
- **Parallel job execution** - 9 jobs run simultaneously
- **Matrix testing** on Node.js 20.x and 22.x

### GitHub Actions Updates
- **All workflows updated** from v2/v3 to v4
- **Concurrency control** prevents redundant runs
- **Enhanced security scans** (npm audit, Gitleaks, CodeQL)

### New Features
- **PR comments** with automated test results
- **Health checks** and smoke tests
- **Deployment verification**
- **Coverage tracking**

## Local Development

### Run CI Checks Locally
```bash
# Lint
npm run lint

# Test
npm test

# Build
npm run build

# Full CI simulation
npm run validate
```

### Pre-commit Hooks
Husky pre-commit hooks run automatically:
- Gitleaks secret scanning
- ESLint linting
- Regression tests (geolocation)

## Monitoring

### GitHub Actions Dashboard
View workflow runs: https://github.com/mbuckingham74/meteo-weather/actions

### Status Checks
- ✅ All checks must pass before merge
- 📊 Coverage reports in PR comments
- 🔒 Security scans in Security tab
- 📈 Deployment status in Actions tab

## Troubleshooting

### Common Issues

**Workflow fails on npm install:**
- Clear cache: Delete workflow run and re-run
- Check `package-lock.json` is committed

**Deployment fails:**
- Check SSH key secret is configured
- Verify server is accessible
- Review deployment logs

**Tests timeout:**
- Increase timeout in workflow
- Check test performance locally

**Security scan fails:**
- Review Gitleaks findings
- Check npm audit output
- Rotate exposed secrets immediately

---

**Related Documentation:**
- 🚀 Deployment: [../deployment/](../deployment/)
- 🔐 Security: [../security/](../security/)
- 💻 Development: [../development/](../development/)
