# ⚠️ Troubleshooting

Common issues, fixes, and debugging guides for Meteo Weather App.

## Quick Links

- **[TROUBLESHOOTING.md](TROUBLESHOOTING.md)** - Common issues and solutions
- **[REGRESSION_PREVENTION.md](REGRESSION_PREVENTION.md)** - Prevent "Old Location" bug
- **[OLD_LOCATION_BUG_FIX.md](OLD_LOCATION_BUG_FIX.md)** - Detailed bug fix documentation
- **[ERROR_MESSAGE_STYLE_GUIDE.md](ERROR_MESSAGE_STYLE_GUIDE.md)** - Error handling guide (700+ lines)
- **[ROLLBACK_INSTRUCTIONS.md](ROLLBACK_INSTRUCTIONS.md)** - Emergency rollback procedures

## Common Issues

### 🗺️ Location Issues

**"Old Location" appearing instead of city name:**
- **Cause:** Visual Crossing API returns placeholder when location data unavailable
- **Fix:** Backend now catches placeholders and uses Nominatim reverse geocoding
- **Prevention:** Regression tests + pre-commit hooks
- **Docs:** [REGRESSION_PREVENTION.md](REGRESSION_PREVENTION.md)

**"Use My Location" not working:**
- **Cause:** Browser geolocation permission denied
- **Fix:** Click location icon in address bar, allow location access
- **Fallback:** App uses IP-based geolocation if browser blocked

**Reverse geocoding returns coordinates:**
- **Cause:** Rate limiting on geocoding API
- **Fix:** App uses coordinates temporarily, retry after delay
- **Prevention:** Request throttling and exponential backoff

### 🌐 API Issues

**API rate limit exceeded:**
- **Cause:** Too many requests to Visual Crossing API
- **Fix:** Wait 24 hours for daily limit reset (free tier: 1,000 records/day)
- **Prevention:** Enable caching (99% reduction in API calls)

**Weather data not loading:**
1. Check API key is valid (backend/.env)
2. Verify API key has quota remaining
3. Check browser console for errors
4. Try clearing cache: `curl -X DELETE localhost:5001/api/cache/expired`

**AI features not working:**
- **Cause:** Missing `METEO_ANTHROPIC_API_KEY` in backend/.env
- **Fix:** Add Anthropic API key (optional feature)
- **Note:** App works fully without AI features

### 🐳 Docker Issues

**Containers won't start:**
```bash
# Check container status
docker-compose ps

# View logs
docker-compose logs backend
docker-compose logs frontend
docker-compose logs db

# Restart containers
docker-compose restart

# Full rebuild
docker-compose down
docker-compose up --build
```

**Database connection failed:**
- **Cause:** MySQL container not ready
- **Fix:** Wait 30 seconds for DB initialization
- **Check:** `docker-compose logs db | grep "ready for connections"`

**Port already in use:**
```bash
# Find process using port
lsof -i :3000  # Frontend
lsof -i :5001  # Backend
lsof -i :3306  # MySQL

# Kill process
kill -9 <PID>
```

### 🧪 Test Failures

**Tests timing out:**
- **Cause:** Network requests in tests
- **Fix:** Increase timeout in test file
- **Better:** Mock API calls in tests

**Specific test failing:**
```bash
# Run single test
npm test -- LocationSearchBar.test.js

# Run with verbose output
npm test -- --verbose

# Update snapshots
npm test -- -u
```

**All tests failing after pull:**
```bash
# Clear cache and reinstall
rm -rf node_modules
npm install
npm test
```

### 🎨 UI Issues

**Styles not applying:**
- **Cause:** CSS import order (density-compact.css MUST be last)
- **Fix:** Check App.jsx - compact styles imported after other styles
- **Prevention:** Documented in [../ui-ux/QUICK_START_DENSITY.md](../ui-ux/QUICK_START_DENSITY.md)

**Dark mode not working:**
- **Cause:** CSS variables not defined
- **Fix:** Check themes.css is imported
- **Verify:** `document.documentElement.getAttribute('data-theme')`

**Chart not rendering:**
- **Cause:** Missing data or incorrect data format
- **Fix:** Check browser console for Recharts errors
- **Debug:** Verify data structure matches chart expectations

### 🚀 Deployment Issues

**Deployment script fails:**
```bash
# Check SSH connection
ssh michael@tachyonfuture.com

# Manual deployment steps
cd /home/michael/meteo-app
git pull origin main
bash scripts/deploy-beta.sh

# Check container logs
docker logs meteo-backend-prod
docker logs meteo-frontend-prod
```

**Backend not restarting:**
- **Cause:** Stale container not being recreated
- **Fix:** Deployment script now uses `--force-recreate`
- **Manual:** `docker-compose -f docker-compose.prod.yml up -d --force-recreate backend`

**Health check failing:**
```bash
# Check API health
curl https://api.meteo-beta.tachyonfuture.com/api/health

# Check frontend
curl https://meteo-beta.tachyonfuture.com

# Check container status
docker ps | grep meteo
```

## Emergency Procedures

### Rollback Deployment
See [ROLLBACK_INSTRUCTIONS.md](ROLLBACK_INSTRUCTIONS.md) for detailed steps.

```bash
# Quick rollback
cd /home/michael/meteo-app
git log --oneline -5  # Find last good commit
git reset --hard <commit-hash>
bash scripts/deploy-beta.sh
```

### Database Recovery
```bash
# Restore from backup
mysql -u weather_user -p weather_db < backup_20251106.sql

# Check data integrity
mysql -u weather_user -p -e "SELECT COUNT(*) FROM weather_db.weather_data;"
```

### Secret Rotation
If API key exposed:
1. **Rotate key immediately** (generate new one)
2. Update backend/.env with new key
3. Restart backend container
4. Update GitHub Secrets if used in CI/CD
5. Monitor usage for anomalies

## Debug Mode

### Enable Verbose Logging
```bash
# Backend
export DEBUG=meteo:*
npm run dev

# Frontend
export VITE_DEBUG=true
npm run dev
```

### Browser DevTools
- **Console:** Check for JavaScript errors
- **Network:** Monitor API requests/responses
- **Application:** Check localStorage/cookies
- **Performance:** Identify slow components

### Server Logs
```bash
# Docker logs
docker-compose logs -f backend
docker-compose logs -f frontend

# System logs (production)
journalctl -u docker -f
```

## Getting Help

### Before Asking for Help
1. ✅ Check this troubleshooting guide
2. ✅ Search GitHub issues
3. ✅ Check browser console errors
4. ✅ Review recent changes (git log)
5. ✅ Try rollback to last known good state

### Provide This Information
- Error message (full text)
- Browser console output
- Docker logs (if applicable)
- Steps to reproduce
- Expected vs actual behavior
- Recent changes made

### Useful Commands
```bash
# System info
node --version
npm --version
docker --version

# App status
docker-compose ps
git status
git log -5

# Health checks
curl http://localhost:5001/api/health
curl http://localhost:3000
```

---

**Related Documentation:**
- 🚀 Deployment: [../deployment/](../deployment/)
- 💻 Development: [../development/](../development/)
- 🔐 Security: [../security/](../security/)
- 💾 Database: [../database/](../database/)
