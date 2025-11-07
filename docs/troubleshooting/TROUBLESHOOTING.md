# Troubleshooting Guide

This guide helps you diagnose and resolve common issues with the Meteo Weather App.

## Table of Contents

- [Quick Diagnostics](#quick-diagnostics)
- [Installation & Setup Issues](#installation--setup-issues)
- [Runtime Errors](#runtime-errors)
- [API & External Service Issues](#api--external-service-issues)
- [Docker & Container Issues](#docker--container-issues)
- [Database Issues](#database-issues)
- [Browser & Frontend Issues](#browser--frontend-issues)
- [Performance Issues](#performance-issues)
- [Getting Help](#getting-help)

---

## Quick Diagnostics

**Before troubleshooting, run these quick checks:**

```bash
# 1. Check Docker containers are running
docker-compose ps

# 2. View recent container logs
docker-compose logs --tail=50 backend
docker-compose logs --tail=50 frontend

# 3. Check environment variables (backend)
docker-compose exec backend env | grep -E 'VISUAL_CROSSING|OPENWEATHER|METEO_ANTHROPIC'

# 4. Test API health
curl http://localhost:5001/api/health

# 5. Test frontend access
curl -I http://localhost:3000
```

---

## Installation & Setup Issues

### ❌ "Command not found: docker-compose"

**Problem:** Docker Compose not installed or using Docker Compose V2 syntax.

**Solution:**
```bash
# Check Docker Compose version
docker-compose --version

# If not installed (macOS):
brew install docker-compose

# If using Docker Compose V2, use:
docker compose up
# (space instead of hyphen)
```

---

### ❌ "Cannot connect to the Docker daemon"

**Problem:** Docker service not running.

**Solution:**
```bash
# macOS: Start Docker Desktop application
open -a Docker

# Linux: Start Docker service
sudo systemctl start docker
sudo systemctl enable docker  # Start on boot

# Verify Docker is running
docker ps
```

---

### ❌ "Port already in use" errors

**Problem:** Ports 3000, 5001, or 3307 already occupied.

**Solution:**
```bash
# Find what's using the port
lsof -i :3000  # Frontend
lsof -i :5001  # Backend
lsof -i :3307  # MySQL

# Kill the process (replace PID with actual process ID)
kill -9 <PID>

# Alternative: Change ports in docker-compose.yml
# Before:
  - "3000:3000"
# After:
  - "3001:3000"  # Use port 3001 externally
```

---

### ❌ "VISUAL_CROSSING_API_KEY not found"

**Problem:** Environment variables not configured.

**Solution:**
```bash
# 1. Copy .env.example to backend/.env
cp .env.example backend/.env

# 2. Edit backend/.env and add your API key
nano backend/.env
# Add: VISUAL_CROSSING_API_KEY=your_actual_key_here

# 3. Restart containers
docker-compose restart backend
```

**Get API key:** [Visual Crossing Weather API](https://www.visualcrossing.com/weather-api) (free tier: 1000 records/day)

---

## Runtime Errors

### ❌ "Cannot read property 'temperature' of undefined"

**Problem:** API response structure changed or API call failed.

**Solution:**
```bash
# 1. Check backend logs for API errors
docker-compose logs backend | grep -i error

# 2. Verify API key is valid
# Test Visual Crossing API directly:
curl "https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/Seattle,WA?key=YOUR_API_KEY"

# 3. Clear API cache
# In MySQL:
docker-compose exec mysql mysql -u meteo_user -p
# Enter password: secure_password_123
DELETE FROM meteo_app.api_cache WHERE created_at < NOW();
exit;

# 4. Restart backend
docker-compose restart backend
```

---

### ❌ "NetworkError when attempting to fetch resource"

**Problem:** Backend API not reachable from frontend.

**Solution:**
```bash
# 1. Verify backend is running
curl http://localhost:5001/api/health
# Should return: {"status":"ok","timestamp":"..."}

# 2. Check frontend API_URL configuration
# File: frontend/src/config/api.js
# Should contain: http://localhost:5001/api

# 3. Check CORS settings in backend
# File: backend/server.js
# Should have cors() middleware enabled

# 4. Rebuild containers if config changed
docker-compose up --build
```

---

## API & External Service Issues

### ❌ "Rate limit exceeded" (Visual Crossing API)

**Problem:** Exceeded 1000 records/day on free tier.

**Solution:**
```bash
# 1. Check API usage
# Login to Visual Crossing dashboard: https://www.visualcrossing.com/account

# 2. Verify caching is working
# Check cache statistics:
curl http://localhost:5001/api/cache/stats

# 3. Increase cache TTL (optional)
# Edit: backend/services/cacheService.js
# Increase DEFAULT_TTL values

# 4. Wait for quota reset (resets daily at midnight UTC)
# Or upgrade to paid plan if needed
```

**Temporary workaround:** Use pre-populated historical data (148 cities already cached in database).

---

### ❌ "OpenWeather API key not found" (Radar map not loading)

**Problem:** React environment variable missing or not baked into build.

**Solution for Development:**
```bash
# 1. Add to backend/.env
REACT_APP_OPENWEATHER_API_KEY=your_key_here

# 2. Restart frontend container
docker-compose restart frontend
```

**Solution for Production:**
```bash
# 1. Add to production .env.production
REACT_APP_OPENWEATHER_API_KEY=your_key_here

# 2. Rebuild frontend (environment variables baked into build)
docker compose build --no-cache frontend
docker compose up -d frontend
```

**Get API key:** [OpenWeather API](https://openweathermap.org/api) (free tier: 1000 calls/day)

---

### ❌ "AI features not working" (Location finder, weather analysis)

**Problem:** Anthropic Claude API key missing or invalid.

**Solution:**
```bash
# 1. Verify API key is set (optional feature)
grep METEO_ANTHROPIC_API_KEY backend/.env

# 2. Add API key if missing
echo "METEO_ANTHROPIC_API_KEY=your_key_here" >> backend/.env

# 3. Restart backend
docker-compose restart backend

# 4. Test AI endpoint
curl -X POST http://localhost:5001/api/ai-weather/validate \
  -H "Content-Type: application/json" \
  -d '{"query":"Will it rain today?","location":"Seattle, WA"}'
```

**Note:** App works fully without AI features - they're optional enhancements.

**Get API key:** [Anthropic Console](https://console.anthropic.com/) (pay-as-you-go, ~$0.01 per query)

---

## Docker & Container Issues

### ❌ "Container keeps restarting"

**Problem:** Container crashing due to error in application code or missing dependency.

**Solution:**
```bash
# 1. Check exit code and logs
docker-compose ps
docker-compose logs backend --tail=100

# 2. Common causes:
# - Missing environment variable → Add to .env
# - Database connection failed → Check DB_HOST, DB_USER, DB_PASSWORD
# - Port conflict → Change port in docker-compose.yml
# - npm dependency issue → Rebuild with --no-cache

# 3. Rebuild containers
docker-compose down
docker-compose up --build
```

---

### ❌ "Volume permission denied"

**Problem:** Docker volume permissions issue (common on Linux).

**Solution:**
```bash
# Option 1: Fix ownership
sudo chown -R $USER:$USER $(pwd)

# Option 2: Run docker-compose with sudo (not recommended)
sudo docker-compose up

# Option 3: Add user to docker group (permanent fix)
sudo usermod -aG docker $USER
# Log out and back in for group change to take effect
```

---

### ❌ "Out of disk space" when building images

**Problem:** Docker using too much disk space.

**Solution:**
```bash
# 1. Check Docker disk usage
docker system df

# 2. Clean up unused images, containers, volumes
docker system prune -a --volumes
# WARNING: This removes ALL unused Docker data

# 3. Clean up specific items
docker image prune -a      # Remove unused images
docker container prune     # Remove stopped containers
docker volume prune        # Remove unused volumes

# 4. Free up space on host system
df -h  # Check available disk space
```

---

## Database Issues

### ❌ "Can't connect to MySQL server"

**Problem:** MySQL container not running or incorrect credentials.

**Solution:**
```bash
# 1. Check MySQL container status
docker-compose ps mysql

# 2. Verify MySQL is healthy
docker-compose exec mysql mysqladmin ping -p
# Enter password: meteo_root_pass

# 3. Test connection with credentials from .env
docker-compose exec mysql mysql -u meteo_user -p meteo_app
# Enter password: secure_password_123

# 4. Check logs for errors
docker-compose logs mysql

# 5. Restart MySQL container
docker-compose restart mysql
```

---

### ❌ "Table doesn't exist" errors

**Problem:** Database schema not initialized.

**Solution:**
```bash
# 1. Check if tables exist
docker-compose exec mysql mysql -u meteo_user -p meteo_app -e "SHOW TABLES;"

# 2. Initialize schema if empty
docker-compose exec mysql mysql -u meteo_user -p meteo_app < database/schema.sql

# 3. Seed data (optional)
docker-compose exec mysql mysql -u meteo_user -p meteo_app < database/seed.sql

# 4. Restart backend
docker-compose restart backend
```

---

### ❌ "Too many connections" errors

**Problem:** MySQL connection pool exhausted.

**Solution:**
```bash
# 1. Check current connections
docker-compose exec mysql mysql -u root -p -e "SHOW PROCESSLIST;"

# 2. Increase max_connections (temporary)
docker-compose exec mysql mysql -u root -p -e "SET GLOBAL max_connections = 200;"

# 3. Permanent fix: Edit docker-compose.yml
# Add under mysql service:
command: --max_connections=200

# 4. Restart MySQL
docker-compose restart mysql
```

---

## Browser & Frontend Issues

### ❌ "Blank white screen" when loading app

**Problem:** JavaScript error or failed API call.

**Solution:**
```bash
# 1. Open browser DevTools console (F12)
# Look for red error messages

# 2. Common causes:
# - API_URL misconfigured → Check frontend/src/config/api.js
# - Backend not running → Run: docker-compose ps backend
# - CORS error → Check backend/server.js cors() config

# 3. Hard refresh to clear cache
# Chrome/Firefox: Ctrl+Shift+R (Cmd+Shift+R on Mac)

# 4. Clear application data
# DevTools → Application → Clear Site Data

# 5. Rebuild frontend
docker-compose up --build frontend
```

---

### ❌ "Radar map not loading"

**Problem:** Missing OpenWeather API key or RainViewer API issue.

**Solution:**
```bash
# 1. Check console for errors
# DevTools → Console (F12)

# 2. Verify OpenWeather API key
# Should see tile.openweathermap.org requests in Network tab

# 3. Test RainViewer API manually
curl https://api.rainviewer.com/public/weather-maps.json

# 4. Add REACT_APP_OPENWEATHER_API_KEY to .env and rebuild
```

---

### ❌ "Location search not working"

**Problem:** Geocoding API failing or rate limited.

**Solution:**
```bash
# 1. Test geocoding endpoint
curl "http://localhost:5001/api/locations/geocode?q=Seattle"

# 2. Check OpenWeather Geocoding API quota
# Login: https://home.openweathermap.org/api_keys

# 3. Fallback: Use "Use My Location" button instead of search

# 4. Check browser location permissions
# Chrome: Settings → Privacy → Site Settings → Location
```

---

## Performance Issues

### ❌ "Slow API responses" (>5 seconds)

**Problem:** External API latency or cache not working.

**Solution:**
```bash
# 1. Check cache hit rate
curl http://localhost:5001/api/cache/stats

# 2. Verify caching is enabled
# File: backend/services/cacheService.js
# CACHE_ENABLED should be true

# 3. Check external API response times
curl -w "@-" -o /dev/null -s "http://localhost:5001/api/weather/forecast/Seattle,WA" <<'EOF'
time_total: %{time_total}s\n
EOF

# 4. Increase cache TTL for frequently accessed data
# Edit: backend/config/timeouts.js
```

---

### ❌ "High memory usage" (Docker containers)

**Problem:** Memory leak or inefficient caching.

**Solution:**
```bash
# 1. Check container memory usage
docker stats

# 2. Limit container memory (docker-compose.yml)
services:
  backend:
    mem_limit: 512m
  frontend:
    mem_limit: 256m

# 3. Clear cache
curl -X DELETE http://localhost:5001/api/cache/expired

# 4. Restart containers
docker-compose restart
```

---

## Getting Help

If you're still stuck after trying the solutions above:

### 1. Check Existing Issues
Search for similar issues on GitHub:
https://github.com/mbuckingham74/meteo-weather/issues

### 2. Gather Debug Information

Before opening an issue, collect:

```bash
# System info
uname -a
docker --version
docker-compose --version

# Container status
docker-compose ps

# Recent logs (last 100 lines)
docker-compose logs --tail=100 > debug.log

# Environment check (sanitize API keys before sharing!)
grep -v 'API_KEY\|SECRET' backend/.env
```

### 3. Open a GitHub Issue

[Create a new issue](https://github.com/mbuckingham74/meteo-weather/issues/new/choose) with:
- Clear description of the problem
- Steps to reproduce
- Expected vs actual behavior
- Error messages and stack traces
- Debug information from above
- Screenshots (if visual issue)

### 4. Community Support

- **GitHub Discussions:** Ask questions and share solutions
- **README.md:** Review [main documentation](README.md)
- **docs/:** Check [documentation index](docs/README.md)

---

## Common Error Codes

| Error Code | Meaning | Solution |
|------------|---------|----------|
| **ECONNREFUSED** | Connection refused | Check service is running (`docker-compose ps`) |
| **ENOTFOUND** | DNS lookup failed | Verify hostname in config (e.g., `mysql` vs `localhost`) |
| **ETIMEDOUT** | Request timeout | Check external API is reachable, increase timeout |
| **401 Unauthorized** | Invalid API key | Verify API key in `.env` is correct |
| **429 Too Many Requests** | Rate limit exceeded | Wait for quota reset or upgrade API plan |
| **500 Internal Server Error** | Backend crash | Check `docker-compose logs backend` |
| **503 Service Unavailable** | Service not ready | Wait for container to finish starting |
| **CORS Error** | Cross-origin request blocked | Check backend CORS configuration |
| **MODULE_NOT_FOUND** | Missing npm dependency | Run `npm install` or rebuild containers |

---

## Prevention Tips

**Avoid common issues:**

1. **Always use Docker for consistency** - Avoids "works on my machine" problems
2. **Keep .env files secure** - Never commit API keys to git
3. **Test localhost before deploying** - See [DEPLOYMENT_TESTING_CHECKLIST.md](docs/DEPLOYMENT_TESTING_CHECKLIST.md)
4. **Monitor API quotas** - Set up usage alerts in API dashboards
5. **Update dependencies regularly** - Run `npm audit` and `npm update`
6. **Clear cache when debugging** - Stale cache can mask issues
7. **Check logs first** - Most issues have clear error messages in logs
8. **Use browser DevTools** - Console errors often point to exact problem

---

## Still Need Help?

**Security Issues:** Report via [SECURITY.md](SECURITY.md) (private disclosure)

**Documentation:** Read [docs/README.md](docs/README.md) for comprehensive guides

**Contributing:** See [docs/development/AGENTS.md](docs/development/AGENTS.md) for development guidelines

---

**Last Updated:** November 4, 2025
**Maintained by:** Meteo Weather App Team
**Repository:** [meteo-weather](https://github.com/mbuckingham74/meteo-weather)
