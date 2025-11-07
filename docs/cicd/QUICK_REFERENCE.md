# CI/CD Quick Reference

**One-page cheat sheet for the Meteo Weather App CI/CD pipeline.**

---

## Workflows at a Glance

| Workflow | Trigger | Duration | Purpose |
|----------|---------|----------|---------|
| **CI Pipeline** | Push/PR to main/develop | 3-5 min | Lint, test, build validation |
| **Deploy** | Push to main | 5-7 min | Production deployment |
| **Security Scan** | Push/PR + Weekly | 2-3 min | Secret scanning, npm audit |
| **CodeQL** | Push/PR + Weekly | 5-8 min | Code security analysis |
| **Regression Tests** | Path-based (critical files) | 1-2 min | Prevent "Old Location" bug |
| **Coverage Badge** | After CI on main | 2-3 min | Update README badge |

---

## Common Commands

### Local Testing
```bash
# Run full test suite
npm run test

# Run tests with coverage
cd frontend && npm run test:coverage
cd backend && npm test

# Lint all code
npm run lint

# Fix linting issues
npm run lint:fix

# Format all code
npm run format

# Build frontend
cd frontend && npm run build

# Validate Vite config
cd frontend && npm run validate
```

### Docker
```bash
# Build and start local
docker-compose up -d

# Build production
docker-compose -f docker-compose.prod.yml up -d --build

# Check logs
docker-compose logs -f

# Rebuild specific service
docker-compose up -d --build backend
```

### Pre-commit Hooks
```bash
# Run pre-commit manually
.husky/pre-commit

# Skip hooks (not recommended)
git commit --no-verify -m "Message"
```

### Deploy to Production
```bash
# SSH to server
ssh michael@tachyonfuture.com

# Navigate to app
cd /home/michael/meteo-app

# Deploy
bash scripts/deploy-beta.sh
```

---

## Skipping CI/CD

### Skip All CI
```bash
git commit -m "docs: Update README [skip ci]"
```

### Skip Deployment Only
```bash
git commit -m "fix: Minor change [skip deploy]"
```

---

## Coverage Thresholds

| Metric | Minimum |
|--------|---------|
| Statements | 25% |
| Branches | 15% |
| Functions | 20% |
| Lines | 25% |

---

## Status Checks

### Required for Merge
- ✅ `ci-success` (from CI Pipeline)
- ✅ `security-success` (from Security Scan)

### Health Check URLs
- Frontend: https://meteo-beta.tachyonfuture.com
- Backend API: https://api.meteo-beta.tachyonfuture.com/api/health

---

## Troubleshooting Quick Fixes

### CI Failing?
```bash
# Check logs locally
npm test
npm run lint
npm run build

# Fix common issues
npm run lint:fix
npm run format
```

### Coverage Too Low?
```bash
# Check coverage report
cd frontend && npm run test:coverage

# View HTML report
open frontend/coverage/lcov-report/index.html
```

### Deployment Failing?
```bash
# SSH and check logs
ssh michael@tachyonfuture.com
cd /home/michael/meteo-app
docker compose -f docker-compose.prod.yml logs -f

# Check container status
docker ps | grep meteo

# Restart services
docker compose -f docker-compose.prod.yml restart
```

### Pre-commit Hook Slow?
```bash
# Only run on staged files
git add <specific-files>
git commit -m "Message"

# Skip if absolutely necessary
git commit --no-verify -m "Message"
```

---

## Node Version Matrix

Tests run on:
- Node.js 20.x (LTS)
- Node.js 22.x (Current)

---

## Security Thresholds

| Severity | Action |
|----------|--------|
| Critical | ❌ FAIL - Must fix before merge |
| High | ❌ FAIL - Must fix before merge |
| Moderate | ⚠️ WARN - Review required |
| Low | ✅ PASS - Acceptable |

---

## Deployment Checklist

Before deploying to production:

- [ ] All tests passing locally
- [ ] No linting errors
- [ ] Coverage meets thresholds
- [ ] No security vulnerabilities
- [ ] Docker builds successfully
- [ ] Environment variables updated (if needed)
- [ ] Database migrations applied (if needed)

---

## Emergency Rollback

```bash
# SSH to server
ssh michael@tachyonfuture.com
cd /home/michael/meteo-app

# Check commit history
git log --oneline -10

# Rollback to previous commit
git reset --hard <previous-commit-sha>

# Redeploy
bash scripts/deploy-beta.sh
```

---

## Links

- **Full Developer Guide**: [CICD_DEVELOPER_GUIDE.md](CICD_DEVELOPER_GUIDE.md)
- **Troubleshooting**: [../TROUBLESHOOTING.md](../TROUBLESHOOTING.md)
- **Deployment Guide**: [DEPLOYMENT.md](DEPLOYMENT.md)
- **GitHub Actions**: https://github.com/mbuckingham74/meteo-weather/actions

---

**Last Updated:** November 7, 2025
