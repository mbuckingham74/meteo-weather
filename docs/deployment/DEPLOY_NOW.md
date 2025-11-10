# Quick Deployment Instructions

**Status:** Ready to deploy security updates to production
**Estimated Time:** 10-15 minutes

---

## Option 1: Automated Deployment Script (RECOMMENDED)

Since you're already connected to the server via VS Code, use the integrated terminal:

### Step 1: Open VS Code Remote Terminal
1. Open VS Code
2. Connect to remote server (if not already connected)
3. Open integrated terminal (Ctrl+` or Terminal → New Terminal)

### Step 2: Navigate and Deploy
```bash
cd /opt/meteo-app
git pull origin main
bash scripts/deploy-security-update.sh
```

The script will automatically:
- Pull latest code
- Update backend/.env with CORS_ALLOWED_ORIGINS
- Set NODE_ENV=production
- Rebuild backend container
- Restart all containers
- Verify deployment

---

## Option 2: Manual Deployment (Step-by-Step)

If you prefer manual control:

### 1. Pull Latest Code
```bash
cd /opt/meteo-app
git pull origin main
```

### 2. Update backend/.env
```bash
nano backend/.env
```

**Add these lines at the end:**
```bash
# CORS Configuration
CORS_ALLOWED_ORIGINS=https://meteo-beta.tachyonfuture.com,http://localhost:3000

# Node Environment
NODE_ENV=production
```

**Save:** Ctrl+O, Enter, Ctrl+X

### 3. Deploy
```bash
docker-compose down
docker-compose up -d --build
```

### 4. Verify
```bash
# Check containers
docker-compose ps

# Check logs
docker-compose logs backend | tail -20

# Test API
curl -I https://api.meteo-beta.tachyonfuture.com/api/health
```

---

## After Backend Deployment: Configure Nginx

### Access Nginx Proxy Manager
1. Open browser: `http://62.72.5.248:81` (or your server IP)
2. Login with your credentials

### Update Frontend Proxy Host (meteo-beta.tachyonfuture.com)

**Navigation:** Proxy Hosts → meteo-beta.tachyonfuture.com → Edit → Advanced tab

**Paste this in "Custom Nginx Configuration":**
```nginx
# Security Headers (Frontend)
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Permissions-Policy "geolocation=(self), microphone=(), camera=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=(), interest-cohort=()" always;
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
```

**Click Save**

### Update API Proxy Host (api.meteo-beta.tachyonfuture.com)

**Navigation:** Proxy Hosts → api.meteo-beta.tachyonfuture.com → Edit → Advanced tab

**Paste this in "Custom Nginx Configuration":**
```nginx
# Security Headers (API)
add_header X-Frame-Options "DENY" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Permissions-Policy "geolocation=(), microphone=(), camera=(), payment=()" always;
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
```

**Click Save**

---

## Verification Checklist

### ✅ Test Security Headers
```bash
curl -I https://api.meteo-beta.tachyonfuture.com/api/health
```

**Should see:**
- `Content-Security-Policy: ...`
- `X-Frame-Options: DENY`
- `RateLimit-Limit: 100`
- `Strict-Transport-Security: ...`

### ✅ Test Rate Limiting
Try 6 failed login attempts - 6th should be blocked:

```bash
for i in {1..6}; do
  echo "Attempt $i:"
  curl -s -X POST https://api.meteo-beta.tachyonfuture.com/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@test.com","password":"wrong"}' | grep -o "error.*" | head -1
done
```

**Expected:** Last attempt says "Too many login attempts"

### ✅ Test Frontend
Visit: https://meteo-beta.tachyonfuture.com

**Verify:**
- Site loads correctly
- No console errors (F12)
- Radar map works
- Location search works
- User login works

### ✅ Run Security Scans

**Mozilla Observatory:**
https://observatory.mozilla.org/analyze/meteo-beta.tachyonfuture.com

**Target:** A or A+

**SecurityHeaders.com:**
https://securityheaders.com/?q=meteo-beta.tachyonfuture.com

**Target:** A

**SSL Labs:**
https://www.ssllabs.com/ssltest/analyze.html?d=meteo-beta.tachyonfuture.com

**Target:** A or A+

---

## Troubleshooting

### Issue: Containers won't start
```bash
# Check logs
docker-compose logs backend

# Rebuild
docker-compose down
docker-compose up -d --build
```

### Issue: CORS errors
```bash
# Verify CORS_ALLOWED_ORIGINS in backend/.env
grep CORS backend/.env

# Should show: CORS_ALLOWED_ORIGINS=https://meteo-beta.tachyonfuture.com,...

# Restart backend
docker-compose restart backend
```

### Issue: Security headers not showing
```bash
# Check if Nginx config was saved
# Re-add configuration in Nginx Proxy Manager
# Save again
```

---

## Rollback (If Needed)

If something goes wrong:

```bash
# Rollback code
git checkout 8b7270c  # Previous commit before security update
docker-compose down
docker-compose up -d --build

# Remove Nginx custom configuration
# Nginx Proxy Manager → Edit → Advanced → Delete custom config → Save
```

---

## Success Criteria

- [x] Backend deployed with new security middleware
- [x] CORS_ALLOWED_ORIGINS configured
- [x] NODE_ENV=production set
- [ ] Nginx security headers added
- [ ] All tests pass
- [ ] Security scans show A or A+
- [ ] No user-reported issues

---

## Documentation

**Full guides:**
- [docs/SECURITY_DEPLOYMENT_CHECKLIST.md](docs/SECURITY_DEPLOYMENT_CHECKLIST.md) - Complete checklist
- [docs/NGINX_SECURITY_DEPLOYMENT_GUIDE.md](docs/NGINX_SECURITY_DEPLOYMENT_GUIDE.md) - Nginx details
- [SECURITY_IMPLEMENTATION_SUMMARY.md](SECURITY_IMPLEMENTATION_SUMMARY.md) - Overview

---

## Quick Commands Reference

```bash
# Deploy backend
cd /opt/meteo-app
git pull origin main
bash scripts/deploy-security-update.sh

# Check status
docker-compose ps
docker-compose logs backend | tail -20

# Test API
curl -I https://api.meteo-beta.tachyonfuture.com/api/health

# Test rate limiting
for i in {1..6}; do curl -s -X POST https://api.meteo-beta.tachyonfuture.com/api/auth/login -H "Content-Type: application/json" -d '{"email":"test@test.com","password":"wrong"}'; done
```

---

**Ready to deploy! Follow Option 1 (Automated Script) for fastest deployment.**
