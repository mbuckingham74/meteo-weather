# Nginx Security Headers Deployment Guide

**Date:** January 2025
**For:** Production deployment to meteo-beta.tachyonfuture.com
**Status:** Ready for implementation

---

## Overview

This guide provides step-by-step instructions for adding security headers to your Nginx Proxy Manager configuration. These headers complement the Express.js security middleware already implemented in the backend.

**Important:** Express already implements CSP, CORS, and rate limiting. Nginx headers provide defense-in-depth and handle SSL-specific security (HSTS).

---

## Prerequisites

✅ **Already Completed:**
- Express.js security middleware (helmet + rate limiting)
- CORS configuration with origin validation
- Backend CSP headers configured

⚠️ **Before You Begin:**
- SSH access to production server
- Nginx Proxy Manager admin access (Port 81)
- SSL certificates already configured for both domains

---

## Part 1: Access Nginx Proxy Manager

### Step 1: SSH to Production Server

```bash
ssh root@tachyonfuture.com
```

### Step 2: Open Nginx Proxy Manager

**Browser:** Navigate to `http://your-server-ip:81`

**Default Credentials (if first time):**
- Email: admin@example.com
- Password: changeme

**Change default credentials immediately after first login!**

---

## Part 2: Update Frontend Proxy Host

### Location: `meteo-beta.tachyonfuture.com`

**Navigation:**
1. Click **Proxy Hosts** in sidebar
2. Find `meteo-beta.tachyonfuture.com`
3. Click the **three dots** → **Edit**
4. Go to **Advanced** tab

### Add Custom Nginx Configuration

**Paste this into the "Custom Nginx Configuration" field:**

```nginx
# ==================================================
# SECURITY HEADERS (Frontend)
# ==================================================

# Prevent clickjacking - allow embedding on same origin only
add_header X-Frame-Options "SAMEORIGIN" always;

# Prevent MIME type sniffing
add_header X-Content-Type-Options "nosniff" always;

# Enable XSS protection in older browsers (modern browsers use CSP)
add_header X-XSS-Protection "1; mode=block" always;

# Control referrer information sent with requests
add_header Referrer-Policy "strict-origin-when-cross-origin" always;

# Permissions Policy - Control browser features
add_header Permissions-Policy "geolocation=(self), microphone=(), camera=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=(), interest-cohort=()" always;

# Strict Transport Security - Force HTTPS (only enable after SSL is working)
# This tells browsers to ALWAYS use HTTPS for this domain for 1 year
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;

# IMPORTANT: Express already sends Content-Security-Policy via helmet
# Don't duplicate CSP here to avoid conflicts
```

**Why we skip CSP in Nginx:**
- Express.js (helmet) already sends comprehensive CSP headers
- Duplicating CSP can cause conflicts or "double headers"
- Easier to update CSP in code than Nginx config

### Step 3: Save Changes

1. Click **Save**
2. Nginx Proxy Manager will reload automatically
3. No downtime expected

---

## Part 3: Update API Proxy Host

### Location: `api.meteo-beta.tachyonfuture.com`

**Navigation:**
1. Click **Proxy Hosts** in sidebar
2. Find `api.meteo-beta.tachyonfuture.com`
3. Click the **three dots** → **Edit**
4. Go to **Advanced** tab

### Add Custom Nginx Configuration

**Paste this into the "Custom Nginx Configuration" field:**

```nginx
# ==================================================
# SECURITY HEADERS (API)
# ==================================================

# Prevent API from being embedded in iframes (APIs don't need embedding)
add_header X-Frame-Options "DENY" always;

# Prevent MIME type sniffing
add_header X-Content-Type-Options "nosniff" always;

# Enable XSS protection in older browsers
add_header X-XSS-Protection "1; mode=block" always;

# Control referrer information
add_header Referrer-Policy "strict-origin-when-cross-origin" always;

# Permissions Policy - Minimal permissions for API
add_header Permissions-Policy "geolocation=(), microphone=(), camera=(), payment=()" always;

# Strict Transport Security - Force HTTPS
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;

# IMPORTANT: Don't add CSP here - Express helmet handles it
# Don't add CORS here - Express cors() handles it with proper validation
```

**Key Differences from Frontend:**
- `X-Frame-Options: DENY` (APIs shouldn't be embedded)
- No geolocation permission (API doesn't need it)
- Same HSTS settings (enforce HTTPS)

### Step 4: Save Changes

1. Click **Save**
2. Nginx will reload automatically

---

## Part 4: Verification & Testing

### Test 1: Verify Headers are Present

**Test Frontend:**
```bash
curl -I https://meteo-beta.tachyonfuture.com
```

**Expected Headers:**
```
HTTP/2 200
x-frame-options: SAMEORIGIN
x-content-type-options: nosniff
x-xss-protection: 1; mode=block
referrer-policy: strict-origin-when-cross-origin
permissions-policy: geolocation=(self), microphone=(), ...
strict-transport-security: max-age=31536000; includeSubDomains; preload
```

**Test API:**
```bash
curl -I https://api.meteo-beta.tachyonfuture.com/api/health
```

**Expected Headers:**
```
HTTP/2 200
x-frame-options: DENY
x-content-type-options: nosniff
content-security-policy: default-src 'self'; script-src ...
ratelimit-limit: 100
ratelimit-remaining: 99
strict-transport-security: max-age=31536000; includeSubDomains; preload
```

### Test 2: Online Security Scanners

**Mozilla Observatory:**
```
https://observatory.mozilla.org/analyze/meteo-beta.tachyonfuture.com
```

**Expected Score:** A or A+

**Security Headers:**
```
https://securityheaders.com/?q=meteo-beta.tachyonfuture.com
```

**Expected Score:** A

**SSL Labs:**
```
https://www.ssllabs.com/ssltest/analyze.html?d=meteo-beta.tachyonfuture.com
```

**Expected Score:** A or A+

### Test 3: Functional Testing

**Verify these still work after adding headers:**

1. **Frontend loads correctly:**
   - Visit https://meteo-beta.tachyonfuture.com
   - Check browser console for no CSP errors
   - Test location search
   - Test radar map loads
   - Test user login

2. **API endpoints work:**
   - Health check: https://api.meteo-beta.tachyonfuture.com/api/health
   - Weather forecast: Test from frontend
   - AI queries: Test from frontend

3. **Rate limiting works:**
   - Try 6 failed logins → should block on 6th
   - Try 11 AI queries in 1 hour → should block on 11th

4. **CORS works:**
   - Frontend can call API (same domain)
   - External domains are blocked (check browser console)

---

## Part 5: Rollback Plan (If Issues Occur)

### If Something Breaks:

**Immediate Rollback:**

1. Log into Nginx Proxy Manager
2. Go to affected Proxy Host
3. Click **Edit** → **Advanced** tab
4. Delete the custom configuration (or comment it out with `#`)
5. Click **Save**
6. Nginx reloads - site is back to original state

**No downtime - takes < 30 seconds**

### Common Issues & Fixes

#### Issue: CSP Blocking Scripts/Styles

**Symptom:** Browser console shows CSP violations

**Fix:**
- CSP is set by Express (helmet), not Nginx
- Update CSP in `backend/app.js` instead
- Restart backend container: `docker-compose restart backend`

#### Issue: Frontend Can't Call API

**Symptom:** CORS errors in browser console

**Fix:**
- CORS is handled by Express, not Nginx
- Check `CORS_ALLOWED_ORIGINS` in `backend/.env`
- Ensure frontend domain is in the list
- Restart backend: `docker-compose restart backend`

#### Issue: HSTS Causing Problems

**Symptom:** Can't access site over HTTP

**Fix:**
- This is intentional! HSTS forces HTTPS
- If you need to disable temporarily:
  - Remove `Strict-Transport-Security` header from Nginx config
  - Wait for browser cache to clear (max-age duration)
  - Or clear browser cache manually

#### Issue: Rate Limiting Too Strict

**Symptom:** Legitimate users getting blocked

**Fix:**
- Rate limits are set in Express, not Nginx
- Update limits in `backend/app.js`:
  ```javascript
  // Change max: 5 to max: 10
  const authLimiter = rateLimit({ max: 10 });
  ```
- Rebuild and restart: `docker-compose up -d --build backend`

---

## Part 6: HSTS Preload (Optional - Advanced)

**What is HSTS Preload?**
- Browsers have built-in list of sites that ALWAYS use HTTPS
- Your site will NEVER load over HTTP, even on first visit
- Provides maximum security but is semi-permanent

**Requirements:**
1. HSTS header with `preload` directive (already added above)
2. HTTPS on all subdomains
3. Submit to HSTS preload list

**How to Submit:**

1. **Verify your site meets requirements:**
   ```
   https://hstspreload.org/?domain=tachyonfuture.com
   ```

2. **If eligible, submit:**
   - Visit https://hstspreload.org/
   - Enter domain: `tachyonfuture.com`
   - Click "Submit"

3. **Wait 6-12 weeks** for inclusion in browser lists

**Warning:**
- Removing from preload list takes months
- Only submit if you're committed to HTTPS forever
- Test thoroughly before submitting

**Recommendation:** Skip this for now. Current HSTS implementation is sufficient.

---

## Part 7: Monitoring & Maintenance

### Weekly Tasks

**Check Security Scanners:**
```bash
# Automated script (optional)
curl -s "https://observatory.mozilla.org/api/v1/analyze?host=meteo-beta.tachyonfuture.com" | jq '.grade'
```

**Monitor Rate Limit Logs:**
```bash
docker-compose logs backend | grep "429"
```

### Monthly Tasks

1. **Review CSP violations** (if CSP reporting enabled)
2. **Check for header deprecations** (MDN docs)
3. **Update security headers** if new threats emerge
4. **Review rate limit effectiveness** (adjust if needed)

### Quarterly Tasks

1. **Full security scan** (Observatory + SecurityHeaders)
2. **Penetration testing** (optional, recommended)
3. **Review OWASP Top 10** and ensure protected
4. **Update CSP directives** if new APIs added

---

## Part 8: Environment-Specific Configuration

### Development vs Production

**Current Setup:**
- **Development:** HSTS disabled (allows HTTP testing)
- **Production:** HSTS enabled (forces HTTPS)

**Controlled by:** `process.env.NODE_ENV` in `backend/app.js`

### Production Environment Variables

**Update `backend/.env` on production server:**

```bash
# CORS - Add production domain
CORS_ALLOWED_ORIGINS=https://meteo-beta.tachyonfuture.com,http://localhost:3000

# Node environment
NODE_ENV=production
```

**Then restart:**
```bash
docker-compose down
docker-compose up -d --build
```

---

## Part 9: Security Headers Reference

### Complete Header Breakdown

| Header | Purpose | Set By | Value |
|--------|---------|--------|-------|
| **Content-Security-Policy** | Prevent XSS, injection | Express (helmet) | Complex directive list |
| **Strict-Transport-Security** | Force HTTPS | Nginx | max-age=31536000 |
| **X-Frame-Options** | Prevent clickjacking | Nginx + Express | SAMEORIGIN / DENY |
| **X-Content-Type-Options** | Prevent MIME sniffing | Nginx + Express | nosniff |
| **X-XSS-Protection** | Legacy XSS protection | Nginx + Express | 1; mode=block |
| **Referrer-Policy** | Control referrer info | Nginx + Express | strict-origin-when-cross-origin |
| **Permissions-Policy** | Control browser features | Nginx + Express | geolocation=(self)... |
| **RateLimit-*** | Rate limiting info | Express (rate-limit) | Auto-generated |
| **Access-Control-*** | CORS | Express (cors) | Origin-dependent |

### Why Some Headers are in Both?

**Defense in Depth:**
- If Express fails → Nginx still protects
- If Nginx is bypassed → Express still protects
- Redundancy is intentional and recommended

---

## Part 10: Success Criteria

### Before Going Live, Verify:

- [ ] All tests in Part 4 pass
- [ ] Mozilla Observatory: Grade A or A+
- [ ] SecurityHeaders.com: Grade A
- [ ] SSL Labs: Grade A or A+
- [ ] Rate limiting blocks after limits reached
- [ ] CORS allows frontend, blocks others
- [ ] CSP doesn't break any frontend features
- [ ] Radar map loads correctly
- [ ] User login/logout works
- [ ] AI queries work (within rate limits)
- [ ] No errors in browser console
- [ ] Backend logs show no errors

### Post-Deployment Monitoring:

- [ ] Monitor for 24 hours - check logs for issues
- [ ] Run security scans daily for first week
- [ ] Verify rate limit logs show expected blocking
- [ ] Check for CSP violations in browser console
- [ ] Ensure no user complaints about access

---

## Troubleshooting Quick Reference

| Problem | Quick Fix |
|---------|-----------|
| CSP errors in console | Update CSP in `backend/app.js`, restart backend |
| CORS errors | Add domain to `CORS_ALLOWED_ORIGINS`, restart backend |
| Rate limiting too strict | Increase limits in `backend/app.js`, rebuild |
| Can't access over HTTP | HSTS working as intended (use HTTPS) |
| Headers not showing | Clear Nginx config, save, re-add, save again |
| Nginx config syntax error | Check for unmatched quotes or semicolons |

---

## Appendix A: Complete Nginx Configuration Files

### Frontend (meteo-beta.tachyonfuture.com)

**Location:** Nginx Proxy Manager → Proxy Hosts → meteo-beta.tachyonfuture.com → Advanced

```nginx
# Security Headers (Frontend)
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Permissions-Policy "geolocation=(self), microphone=(), camera=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=(), interest-cohort=()" always;
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
```

### API (api.meteo-beta.tachyonfuture.com)

**Location:** Nginx Proxy Manager → Proxy Hosts → api.meteo-beta.tachyonfuture.com → Advanced

```nginx
# Security Headers (API)
add_header X-Frame-Options "DENY" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Permissions-Policy "geolocation=(), microphone=(), camera=(), payment=()" always;
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
```

---

## Appendix B: Security Scan Results (Expected)

### Mozilla Observatory (A+)

```
Content Security Policy: ✓ (Implemented)
HTTP Strict Transport Security: ✓ (Implemented)
X-Content-Type-Options: ✓ (Implemented)
X-Frame-Options: ✓ (Implemented)
Referrer Policy: ✓ (Implemented)
Permissions Policy: ✓ (Implemented)
```

### SecurityHeaders.com (A)

```
Strict-Transport-Security: A
Content-Security-Policy: A
X-Frame-Options: A
X-Content-Type-Options: A
Referrer-Policy: A
Permissions-Policy: A
```

### SSL Labs (A+)

```
Certificate: Valid
Protocol Support: TLS 1.2, TLS 1.3
Cipher Strength: Strong
HSTS: Enabled
```

---

## Support

**Questions?**
- Check [docs/SECURITY_HEADERS.md](SECURITY_HEADERS.md) for detailed header explanations
- Check [docs/RATE_LIMITING_AND_SECURITY_AUDIT.md](RATE_LIMITING_AND_SECURITY_AUDIT.md) for security strategy
- Check [TROUBLESHOOTING.md](../TROUBLESHOOTING.md) for common issues

**Need Help?**
- GitHub Issues: https://github.com/mbuckingham74/meteo-weather/issues
- Security Issues: See [SECURITY.md](../SECURITY.md)

---

**Last Updated:** January 2025
**Version:** 1.0.0
**Author:** Meteo Security Team
**Next Review:** April 2025
