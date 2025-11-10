# Meteo App - Production Deployment Guide (PRIVATE - DO NOT COMMIT)
## Complete Deployment Documentation for tachyonfuture.com

⚠️ **THIS FILE CONTAINS SENSITIVE CREDENTIALS - KEEP LOCAL ONLY**

---

## 🚨 CRITICAL WARNING - SSH LOCKOUT PROTECTION 🚨

**⛔️ NEVER AUTOMATICALLY SSH INTO tachyonfuture.com FROM CLAUDE CODE ⛔️**

**THE SERVER HAS FAIL2BAN/SECURITY SOFTWARE THAT WILL IMMEDIATELY BAN THE IP AND LOCK OUT THE USER - EVEN IF THE IP IS WHITELISTED**

**IF YOU NEED TO CHECK SERVER STATUS:**
1. **ASK THE USER FIRST** before running any SSH commands
2. User must manually SSH from their terminal
3. User must manually run commands and report results back
4. DO NOT use ssh in Bash tool calls - it causes instant lockout

**SSH AUTHENTICATION REQUIREMENTS:**
- **SSH KEY AUTHENTICATION ONLY** - Never attempt programmatic password entry
- **DO NOT provide passwords via command line or expect/automation scripts**
- **User will provide biometric authentication** (1Password Touch ID) when required
- SSH attempts with password prompts or multiple key attempts will trigger server lockout
- The server's SSH agent tries ALL keys in 1Password, which can exhaust MaxAuthTries instantly

**Past Incidents:**
- October 28, 2025: Automated SSH attempt with multiple key attempts crashed entire VPS
- Single SSH command triggered 10+ authentication attempts via 1Password SSH agent
- Server became completely unresponsive - SSH, console, and hypervisor connection lost
- Control panel reboot button grayed out - required Hostinger infrastructure team escalation
- Even with IP whitelisting, automated attempts trigger catastrophic lockout
- User loses SSH AND console access when this happens
- Recovery required Hostinger support ticket with 24hr SLA

---

## 🔐 Server & Access Credentials

### SSH Access
- **Server:** `tachyonfuture.com`
- **User:** `michael`
- **Email:** `michael.buckingham74@gmail.com`
- **SSH Command:** `ssh michael@tachyonfuture.com` **(MANUAL ONLY - NEVER AUTOMATED)**
- **Authentication:** **SSH KEY ONLY** - User provides biometric auth (1Password Touch ID) when prompted
- **⚠️ NEVER use password-based or programmatic authentication**
- **Sudo Password:** `<stored_in_.env.secrets>`
- **App Location:** `/home/michael/meteo-app`

### Nginx Proxy Manager (NPM)
- **Access URL:** `http://tachyonfuture.com:81`
- **Email:** `michael.buckingham74@gmail.com`
- **Password:** `michael.buckingham74@gmail.com`
- **API URL:** `http://localhost:81/api`

### GitHub Repository
- **Repo:** `https://github.com/mbuckingham74/meteo-app.git`
- **Branch:** `main`

---

## 🌐 Domain Configuration

### Frontend
- **Production URL:** `https://meteo-beta.tachyonfuture.com`
- **Container:** `meteo-frontend-prod`
- **Port:** `80`

### Backend API
- **API URL:** `https://api.meteo-beta.tachyonfuture.com`
- **Container:** `meteo-backend-prod`
- **Port:** `5001`

### Database
- **Container:** `meteo-mysql-prod`
- **Port:** `3306`
- **Database Name:** `meteo_app`

---

## 📦 Environment Variables

Located in `/home/michael/meteo-app/.env.production`:

```bash
# Database Configuration
DB_HOST=mysql-prod
DB_PORT=3306
DB_USER=meteo_user
DB_PASSWORD=<secure_password>
DB_ROOT_PASSWORD=<root_password>
DB_NAME=meteo_app

# Weather API Keys
VISUAL_CROSSING_API_KEY=<see_.env.secrets>
OPENWEATHER_API_KEY=<see_.env.secrets>

# AI Location Finder (Claude API)
METEO_ANTHROPIC_API_KEY=<see_.env.secrets>

# JWT Authentication
JWT_SECRET=<secure_jwt_secret>
JWT_REFRESH_SECRET=<secure_refresh_secret>
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d

# Server Configuration
NODE_ENV=production
PORT=5001
CORS_ORIGIN=https://meteo-beta.tachyonfuture.com
```

---

## 🚀 Complete Deployment Process

### 1. Initial Setup (One-Time)

```bash
# SSH into server
ssh michael@tachyonfuture.com

# Navigate to home directory
cd /home/michael

# Clone repository (if not exists)
git clone https://github.com/mbuckingham74/meteo-app.git
cd meteo-app

# Create .env.production file
cp config/examples/.env.production.example .env.production
nano .env.production  # Edit with actual credentials
```

### 2. Deploy Latest Changes

**Recommended: Use the deployment script (handles environment variables correctly)**

```bash
# SSH into server
ssh michael@tachyonfuture.com

# Navigate to app directory
cd /home/michael/meteo-app

# Run deployment script
./scripts/deploy-beta.sh
```

**Manual deployment (if needed):**

```bash
# SSH into server
ssh michael@tachyonfuture.com

# Navigate to app directory
cd /home/michael/meteo-app

# Pull latest code
git fetch origin
git reset --hard origin/main

# IMPORTANT: Export environment variables before building
export $(cat .env.production | grep -v "^#" | xargs)

# Rebuild frontend with environment variables
OPENWEATHER_API_KEY=$OPENWEATHER_API_KEY docker compose -f docker-compose.prod.yml build --no-cache frontend

# Restart all services
docker compose -f docker-compose.prod.yml --env-file .env.production up -d

# Check container status
docker compose -f docker-compose.prod.yml ps

# View logs if needed
docker compose -f docker-compose.prod.yml logs -f
```

### 3. Verify Deployment

```bash
# Check container status
docker ps | grep meteo

# Test backend API
curl http://localhost:5001/api/health

# Check frontend built with correct API URL
docker exec meteo-frontend-prod cat /usr/share/nginx/html/static/js/main.*.js | grep -o "api.meteo-beta.tachyonfuture.com" | head -1

# View backend logs
docker logs meteo-backend-prod --tail 50

# View frontend logs
docker logs meteo-frontend-prod --tail 50
```

---

## 🔧 Nginx Proxy Manager Configuration

### Required Proxy Hosts

#### 1. Frontend Proxy Host
- **Domain:** `meteo-beta.tachyonfuture.com`
- **Forward Host:** `meteo-frontend-prod`
- **Forward Port:** `80`
- **SSL:** Enabled with Let's Encrypt
- **Force SSL:** Yes
- **HTTP/2:** Yes

#### 2. Backend API Proxy Host (CRITICAL!)
- **Domain:** `api.meteo-beta.tachyonfuture.com`
- **Forward Host:** `meteo-backend-prod`
- **Forward Port:** `5001`
- **SSL:** Enabled with Let's Encrypt
- **Force SSL:** Yes
- **HTTP/2:** Yes
- **Block Exploits:** Yes

### Manual NPM Configuration Steps

1. **Access NPM:**
   - URL: `http://tachyonfuture.com:81`
   - Login: `michael.buckingham74@gmail.com` / `michael.buckingham74@gmail.com`

2. **Add API Proxy Host:**
   - Click "Proxy Hosts" → "Add Proxy Host"
   - **Details Tab:**
     - Domain Names: `api.meteo-beta.tachyonfuture.com`
     - Scheme: `http`
     - Forward Hostname/IP: `meteo-backend-prod`
     - Forward Port: `5001`
     - ☑️ Block Common Exploits
     - ☑️ Websockets Support

   - **SSL Tab:**
     - ☑️ Force SSL
     - ☑️ HTTP/2 Support
     - ☑️ HSTS Enabled
     - SSL Certificate: "Request a new SSL Certificate"
     - Email: `michael.buckingham74@gmail.com`
     - ☑️ I Agree to Let's Encrypt ToS

   - Click "Save"

3. **Wait 1-2 minutes** for SSL certificate provisioning

---

## 🐳 Docker Architecture

### Networks
- **npm_network** - External network for NPM proxy
- **meteo-internal** - Internal network for MySQL ↔ Backend communication

### Containers
```yaml
meteo-mysql-prod:      # MySQL 8.0
meteo-backend-prod:    # Node.js/Express API
meteo-frontend-prod:   # React app (served by Nginx)
```

### Volume
- **meteo_mysql_prod_data** - Persistent MySQL data

---

## 🔥 Common Issues & Solutions

### Issue 0: CAA Record Blocking Cloudflare SSL (CRITICAL)
**Cause:** CAA DNS record restricting certificate issuance to only Let's Encrypt

**Symptoms:**
- Let's Encrypt error shown in Cloudflare dashboard next to root domain
- SSL certificate provisioning fails when Cloudflare proxy is enabled
- 404 errors or SSL errors when accessing site through Cloudflare

**Solution:**
```bash
# In Cloudflare Dashboard → DNS:
# Delete CAA record: "0 issue letsencrypt.org"
```

**Why this happens:**
- CAA record says "only Let's Encrypt can issue certificates"
- Cloudflare uses DigiCert/Google/Sectigo (NOT Let's Encrypt) for proxied domains
- NPM on origin uses Let's Encrypt (that's fine)
- But Cloudflare needs to issue its own edge certificates

**Past Incidents:**
- October 28, 2025: CAA record blocked Cloudflare SSL, causing cascading failures

### Issue 1: "Network Error" in Frontend
**Cause:** API domain not configured in NPM or SSL certificate not issued

**Solution:**
1. Check NPM has proxy host for `api.meteo-beta.tachyonfuture.com`
2. Verify SSL certificate is issued (green lock icon in NPM)
3. Test API directly: `curl https://api.meteo-beta.tachyonfuture.com/api/health`

### Issue 2: Frontend Shows Wrong API URL
**Cause:** Frontend built without correct `REACT_APP_API_URL` build arg

**Solution:**
```bash
# Verify docker-compose.prod.yml has:
# frontend:
#   build:
#     args:
#       REACT_APP_API_URL: https://api.meteo-beta.tachyonfuture.com/api

# Rebuild frontend
docker compose -f docker-compose.prod.yml build --no-cache frontend
docker compose -f docker-compose.prod.yml up -d
```

### Issue 3: Database Connection Errors
**Cause:** MySQL not ready or wrong credentials

**Solution:**
```bash
# Check MySQL container
docker logs meteo-mysql-prod --tail 50

# Test database connection from backend
docker exec meteo-backend-prod sh -c 'npm run db:test'

# Verify .env.production has correct DB credentials
```

### Issue 4: SSL Certificate Fails
**Cause:** DNS not pointing to server or port 80/443 blocked

**Solution:**
1. Verify DNS: `dig api.meteo-beta.tachyonfuture.com`
2. Check firewall allows ports 80/443
3. In NPM, try regenerating the certificate

### Issue 5: Docker Containers Marked as Unhealthy in Portainer
**Cause:** Health checks using `localhost` instead of `127.0.0.1` causing DNS resolution failures

**Symptoms:**
- Portainer shows frontend/backend as "unhealthy" despite containers running correctly
- Health check logs show "wget: can't connect to remote host: Connection refused"
- Containers are actually responding to requests normally

**Solution:**
Health checks must use `127.0.0.1` instead of `localhost` for reliable DNS resolution inside containers.

Already fixed in `docker-compose.prod.yml` (commit aa63f17):
```yaml
backend:
  healthcheck:
    test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://127.0.0.1:5001/api/health"]

frontend:
  healthcheck:
    test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://127.0.0.1:80"]
```

**Verification:**
```bash
docker ps  # All containers should show "(healthy)" status
docker inspect meteo-backend-prod --format='{{.State.Health.Status}}'  # Should return "healthy"
```

**Past Incidents:**
- October 30, 2025: localhost DNS resolution failed in Docker containers, causing false unhealthy status

### Issue 6: AI Location Finder Not Working
**Cause:** Missing `METEO_ANTHROPIC_API_KEY` in `.env.production`

**Symptoms:**
- Docker Compose logs show: "The METEO_ANTHROPIC_API_KEY variable is not set"
- AI location finder feature returns errors in frontend
- Natural language climate queries fail

**Solution:**
Add the Anthropic API key to `/home/michael/meteo-app/.env.production`:
```bash
METEO_ANTHROPIC_API_KEY=<your-anthropic-api-key>
```

Then restart backend:
```bash
cd /home/michael/meteo-app
docker compose -f docker-compose.prod.yml --env-file .env.production restart backend
```

---

## 📝 Critical Files Modified

### Frontend Build Configuration
- **File:** `frontend/Dockerfile.prod`
- **Critical Line:** `RUN npm install --omit=dev` (NOT `npm ci`)
- **Why:** Prevents build failures with package-lock.json sync issues

### Docker Compose Production
- **File:** `docker-compose.prod.yml`
- **Critical Sections:**
  ```yaml
  # Frontend build args
  frontend:
    build:
      args:
        REACT_APP_API_URL: https://api.meteo-beta.tachyonfuture.com/api

  # Health checks (MUST use 127.0.0.1, not localhost)
  backend:
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://127.0.0.1:5001/api/health"]

  frontend:
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://127.0.0.1:80"]
  ```

---

## 🎯 Quick Deployment Checklist

- [ ] SSH into server
- [ ] Navigate to `/home/michael/meteo-app`
- [ ] Stash local changes: `git stash`
- [ ] Pull latest: `git pull origin main`
- [ ] Rebuild frontend: `docker compose -f docker-compose.prod.yml build --no-cache frontend`
- [ ] Restart services: `docker compose -f docker-compose.prod.yml --env-file .env.production up -d`
- [ ] Verify containers: `docker ps | grep meteo`
- [ ] Check API URL in frontend: `docker exec meteo-frontend-prod cat /usr/share/nginx/html/static/js/main.*.js | grep api.meteo-beta`
- [ ] Test backend: `curl http://localhost:5001/api/health`
- [ ] Verify NPM has API proxy host configured
- [ ] Test frontend: Open `https://meteo-beta.tachyonfuture.com`
- [ ] Test API calls: Try location search in the app

---

## 📞 Contact & Support

- **Developer:** Michael Buckingham
- **Email:** michael.buckingham74@gmail.com
- **Server:** tachyonfuture.com
- **Repository:** https://github.com/mbuckingham74/meteo-app

---

## 🔄 Automated Deployment Script

Use the included deployment script:

```bash
ssh michael@tachyonfuture.com
cd /home/michael/meteo-app
./deploy-production.sh
```

**Note:** Script may need NPM credentials updated if automated configuration is desired.

---

**Last Updated:** October 30, 2025
**Deployment Status:** ✅ Fully operational - Health checks fixed (127.0.0.1), AI location finder configured, all containers healthy
