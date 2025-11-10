# Security Headers Configuration

This document provides comprehensive security headers for the Meteo Weather App Nginx configuration.

## 📋 Overview

Security headers protect against common web vulnerabilities including XSS, clickjacking, MIME sniffing, and more. These headers should be added to your Nginx configuration for both the frontend and API.

---

## 🔒 Recommended Headers

### Complete Nginx Configuration Block

Add these headers to your Nginx server blocks (`meteo-beta.tachyonfuture.com` and `api.meteo-beta.tachyonfuture.com`):

```nginx
# ==================================================
# SECURITY HEADERS
# ==================================================

# Prevent clickjacking attacks by controlling iframe embedding
add_header X-Frame-Options "SAMEORIGIN" always;

# Prevent MIME type sniffing
add_header X-Content-Type-Options "nosniff" always;

# Enable XSS protection in older browsers
add_header X-XSS-Protection "1; mode=block" always;

# Control referrer information sent with requests
add_header Referrer-Policy "strict-origin-when-cross-origin" always;

# Content Security Policy - Restrict resource loading
# NOTE: Adjust this based on your actual third-party services
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://plausible.tachyonfuture.com https://matomo.tachyonfuture.com; style-src 'self' 'unsafe-inline' https://unpkg.com; img-src 'self' data: blob: https:// http://tile.openstreetmap.org; font-src 'self' data:; connect-src 'self' https://api.meteo-beta.tachyonfuture.com https://api.openweathermap.org https://weather.visualcrossing.com https://api.rainviewer.com https://api.anthropic.com https://ipapi.co https://geojs.io; frame-ancestors 'self'; base-uri 'self'; form-action 'self';" always;

# Permissions Policy - Control browser features
add_header Permissions-Policy "geolocation=(self), microphone=(), camera=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=(), interest-cohort=()" always;

# Strict Transport Security - Force HTTPS (only enable after SSL is working)
# Uncomment the line below once SSL is fully configured and tested
# add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
```

---

## 📝 Header Explanations

### X-Frame-Options
**Purpose:** Prevents clickjacking attacks by controlling how your site can be embedded in iframes.

**Options:**
- `DENY` - Cannot be embedded in any iframe
- `SAMEORIGIN` - Can only be embedded on same domain (recommended)
- `ALLOW-FROM uri` - Can be embedded on specific URI (deprecated)

**Current Setting:** `SAMEORIGIN`

---

### X-Content-Type-Options
**Purpose:** Prevents MIME type sniffing, which can lead to security vulnerabilities.

**Setting:** `nosniff` - Browsers must respect the Content-Type header

---

### X-XSS-Protection
**Purpose:** Enables XSS filtering in older browsers (modern browsers use CSP instead).

**Setting:** `1; mode=block` - Enable XSS filter and block the page if attack detected

**Note:** This header is somewhat deprecated in favor of CSP, but still useful for older browsers.

---

### Referrer-Policy
**Purpose:** Controls how much referrer information is sent with requests.

**Options:**
- `no-referrer` - Never send referrer information
- `strict-origin-when-cross-origin` - Send full URL for same-origin, only origin for cross-origin (recommended)
- `same-origin` - Only send for same-origin requests

**Current Setting:** `strict-origin-when-cross-origin`

---

### Content-Security-Policy (CSP)
**Purpose:** Prevents XSS, data injection attacks, and unauthorized resource loading.

**Current Policy Breakdown:**

| Directive | Value | Purpose |
|-----------|-------|---------|
| `default-src` | `'self'` | Default policy: only load resources from same origin |
| `script-src` | `'self' 'unsafe-inline' 'unsafe-eval' https://plausible... https://matomo...` | Allow scripts from same origin, inline scripts (required for React), and analytics |
| `style-src` | `'self' 'unsafe-inline' https://unpkg.com` | Allow styles from same origin, inline styles (required for React), and Leaflet CDN |
| `img-src` | `'self' data: blob: https:// http://tile.openstreetmap.org` | Allow images from same origin, data URIs, blobs, and external sources (maps, weather) |
| `font-src` | `'self' data:` | Allow fonts from same origin and data URIs |
| `connect-src` | `'self' https://api.meteo-beta... https://api.openweathermap.org ...` | Allow AJAX/fetch requests to these APIs |
| `frame-ancestors` | `'self'` | Control who can embed this site in iframes |
| `base-uri` | `'self'` | Restrict `<base>` tag URLs |
| `form-action` | `'self'` | Restrict form submission targets |

**⚠️ Important Notes:**
- `'unsafe-inline'` and `'unsafe-eval'` reduce CSP effectiveness but are required for React and some libraries
- Review and adjust `connect-src` if adding new APIs
- Test thoroughly after enabling CSP to avoid breaking functionality
- Use CSP report-uri in development to catch violations

---

### Permissions-Policy
**Purpose:** Controls which browser features and APIs can be used.

**Current Policy:**
- `geolocation=(self)` - Allow geolocation on same origin (required for "Use My Location")
- `microphone=()` - Block microphone access
- `camera=()` - Block camera access
- `payment=()` - Block payment APIs
- `usb=()` - Block USB access
- `magnetometer=()` - Block magnetometer
- `gyroscope=()` - Block gyroscope
- `accelerometer=()` - Block accelerometer
- `interest-cohort=()` - Opt out of FLoC tracking (privacy)

---

### Strict-Transport-Security (HSTS)
**Purpose:** Forces browsers to always use HTTPS for your domain.

**Setting:** `max-age=31536000; includeSubDomains; preload`
- `max-age=31536000` - Remember for 1 year
- `includeSubDomains` - Apply to all subdomains
- `preload` - Eligible for HSTS preload list

**⚠️ CRITICAL WARNING:**
- Only enable AFTER SSL is fully working
- Cannot be easily reverted (browsers cache for max-age duration)
- Test without `preload` first, add it later
- Currently commented out in the config

---

## 🚀 Implementation Steps

### 1. Backup Current Configuration
```bash
ssh root@tachyonfuture.com
cd /etc/nginx/conf.d
cp meteo-beta.conf meteo-beta.conf.backup
```

### 2. Add Headers to Frontend Configuration
Edit your frontend Nginx config and add the headers to the `server` block:

```nginx
server {
    listen 80;
    server_name meteo-beta.tachyonfuture.com;

    # ... existing configuration ...

    # Security Headers (add this section)
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Content-Security-Policy "..." always;
    add_header Permissions-Policy "..." always;

    # ... rest of configuration ...
}
```

### 3. Add Headers to API Configuration
Add the same headers to your API server block (except CSP, which may differ):

```nginx
server {
    listen 80;
    server_name api.meteo-beta.tachyonfuture.com;

    # Security Headers
    add_header X-Frame-Options "DENY" always;  # API shouldn't be embedded
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Permissions-Policy "geolocation=(), microphone=(), camera=()" always;

    # ... rest of configuration ...
}
```

### 4. Test Configuration
```bash
# Test nginx configuration syntax
nginx -t

# If test passes, reload nginx
systemctl reload nginx
```

### 5. Verify Headers
Test that headers are being sent:

```bash
# Test frontend
curl -I https://meteo-beta.tachyonfuture.com

# Test API
curl -I https://api.meteo-beta.tachyonfuture.com
```

---

## 🧪 Testing & Validation

### Online Security Header Scanners

Test your deployment with these tools:

1. **Mozilla Observatory**
   https://observatory.mozilla.org/
   - Comprehensive security analysis
   - Letter grade scoring (A+ is best)
   - Actionable recommendations

2. **Security Headers**
   https://securityheaders.com/
   - Simple, quick header check
   - Letter grade scoring
   - Missing header identification

3. **SSL Labs**
   https://www.ssllabs.com/ssltest/
   - SSL/TLS configuration analysis
   - Certificate validation
   - Protocol support check

### Manual Testing with curl

```bash
# Check all response headers
curl -I https://meteo-beta.tachyonfuture.com

# Check specific header
curl -I https://meteo-beta.tachyonfuture.com | grep -i "x-frame-options"

# Check CSP header
curl -I https://meteo-beta.tachyonfuture.com | grep -i "content-security-policy"
```

### Browser DevTools Testing

1. Open browser DevTools (F12)
2. Go to Network tab
3. Reload page
4. Click the main document request
5. Check Response Headers section
6. Verify all security headers are present

---

## 🎯 Expected Security Scores

After implementing all headers:

| Service | Target Score | Notes |
|---------|-------------|-------|
| Mozilla Observatory | A or A+ | May require HSTS for A+ |
| Security Headers | A | Some libraries may require unsafe-inline/eval |
| SSL Labs | A or A+ | Requires proper SSL configuration |

---

## ⚠️ Troubleshooting

### Common Issues

**Issue:** CSP blocking inline styles/scripts
**Solution:** Add `'unsafe-inline'` to `style-src` and `script-src` (already included)

**Issue:** CSP blocking external resources (maps, fonts, etc.)
**Solution:** Add specific domains to appropriate CSP directive

**Issue:** Geolocation not working
**Solution:** Ensure `geolocation=(self)` in Permissions-Policy

**Issue:** CORS errors after adding headers
**Solution:** Verify CORS headers are still present and not overridden

**Issue:** Images/maps not loading
**Solution:** Review CSP `img-src` and `connect-src` directives

---

## 📚 Additional Resources

- [MDN Web Docs - HTTP Headers](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers)
- [OWASP Secure Headers Project](https://owasp.org/www-project-secure-headers/)
- [Content Security Policy Reference](https://content-security-policy.com/)
- [Permissions Policy Spec](https://www.w3.org/TR/permissions-policy-1/)

---

## 🔄 Maintenance

**Quarterly Review Checklist:**
- [ ] Scan with Mozilla Observatory
- [ ] Scan with SecurityHeaders.com
- [ ] Review CSP violation reports (if CSP reporting enabled)
- [ ] Update CSP directives if new third-party services added
- [ ] Consider enabling HSTS if not already enabled
- [ ] Review and update Permissions-Policy for new browser features

---

**Last Updated:** October 29, 2025
**Version:** 1.0.0
**Maintained by:** Michael Buckingham
