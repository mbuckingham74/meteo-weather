# 🚀 Deployment

Production deployment guides and checklists for Meteo Weather App.

## Quick Links

- **[DEPLOY_NOW.md](DEPLOY_NOW.md)** - Quick deployment guide for immediate deployment
- **[DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)** - Comprehensive deployment documentation
- **[DEPLOYMENT_GUIDE_PRIVATE.md](DEPLOYMENT_GUIDE_PRIVATE.md)** - Server-specific private deployment info
- **[DEPLOYMENT_TESTING_CHECKLIST.md](DEPLOYMENT_TESTING_CHECKLIST.md)** - Post-deployment verification steps
- **[BUILD_VALIDATION.md](BUILD_VALIDATION.md)** - Build configuration validation

## Deployment Options

### 1. Quick Deploy (Production Server)
```bash
ssh michael@tachyonfuture.com
cd /home/michael/meteo-app
git pull origin main
bash scripts/deploy-beta.sh
```

### 2. Docker Deployment
See [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) for detailed Docker setup.

### 3. Automated CI/CD
GitHub Actions automatically deploys on push to `main` branch.
See [../cicd/](../cicd/) for pipeline documentation.

## Pre-Deployment Checklist

- [ ] All tests passing (`npm test`)
- [ ] Security scan clean (`npm audit`)
- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] SSL certificates valid
- [ ] Backup created

See [DEPLOYMENT_TESTING_CHECKLIST.md](DEPLOYMENT_TESTING_CHECKLIST.md) for complete checklist.

## Production Environment

- **Frontend:** https://meteo-beta.tachyonfuture.com
- **API:** https://api.meteo-beta.tachyonfuture.com
- **Server:** Hostinger VPS (michael@tachyonfuture.com)
- **Containers:** meteo-frontend-prod, meteo-backend-prod, meteo-mysql-prod

## Troubleshooting

If deployment fails, see:
- [../troubleshooting/ROLLBACK_INSTRUCTIONS.md](../troubleshooting/ROLLBACK_INSTRUCTIONS.md)
- [../troubleshooting/](../troubleshooting/)

---

**Related Documentation:**
- 🔐 Security setup: [../security/](../security/)
- 📖 Getting started: [../getting-started/](../getting-started/)
- 💻 Development guide: [../development/](../development/)
