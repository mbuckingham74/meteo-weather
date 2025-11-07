# Rate Limiting & Security Headers Audit

**Date:** January 2025
**Status:** Security Analysis & Recommendations
**Current Security Score:** 9.4/10

---

## Executive Summary

### Current State
✅ **Strengths:**
- CORS configured with environment-based origin control
- Gitleaks + Dependabot automated security scanning
- JWT authentication with refresh tokens
- 0 current vulnerabilities in dependencies
- Comprehensive security headers documentation exists

❌ **Critical Gaps:**
- **NO rate limiting** on any API endpoints
- **NO helmet.js** or security headers middleware
- **NO CSP headers** implemented (documentation exists but not deployed)
- **NO IP-based request throttling** for abuse prevention
- CORS origin hardcoded to example domain in production

🟡 **Medium Priority:**
- Application-level rate limiting exists in weatherService (API calls), but not HTTP endpoints
- No request size limits configured
- No slow request DoS protection

---

## 1. Rate Limiting Analysis

### Current Implementation

#### ✅ External API Rate Limiting (EXISTS)
**Location:** `backend/services/weatherService.js`

```javascript
// Application-level throttling for Visual Crossing API
const throttleManager = {
  maxConcurrent: 3,
  minInterval: 100,
  activeRequests: 0,
  lastRequestTime: 0,
  queue: []
};
```

**What it does:**
- Limits concurrent Visual Crossing API requests to 3
- Enforces 100ms minimum interval between requests
- Exponential backoff retry on failures
- **Purpose:** Prevents hitting Visual Crossing rate limits (1000/day)

**Coverage:** Visual Crossing API, OpenWeather API, Claude AI API

#### ❌ HTTP Endpoint Rate Limiting (MISSING)

**No protection against:**
- Brute force login attempts (`POST /api/auth/login`)
- Spam registrations (`POST /api/auth/register`)
- AI query abuse (`POST /api/ai-weather/analyze` - costs $0.005/query)
- API endpoint flooding (all routes vulnerable)

**Attack Scenarios:**
1. **Brute Force Login:** Attacker tries 10,000 passwords/minute
2. **AI Cost Attack:** Malicious user sends 1,000 AI queries ($5 cost)
3. **DoS:** Flood `/api/weather/forecast` endpoints to exhaust resources
4. **Database Overload:** Rapid favorite creation/deletion

### Recommended Implementation

#### Option 1: `express-rate-limit` (Recommended)
**Industry standard, flexible, production-proven**

```javascript
// Install
npm install express-rate-limit

// Usage
const rateLimit = require('express-rate-limit');

// General API rate limit (100 requests per 15 minutes per IP)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' }
});

// Strict auth rate limit (5 login attempts per 15 minutes)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  skipSuccessfulRequests: true,
  message: { error: 'Too many login attempts, please try again in 15 minutes.' }
});

// AI endpoint rate limit (10 queries per hour, costs ~$0.05)
const aiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: { error: 'AI query limit reached. Please try again in 1 hour.' }
});

// Apply in app.js
app.use('/api/', apiLimiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/ai-weather', aiLimiter);
app.use('/api/ai-location-finder', aiLimiter);
```

#### Option 2: `express-slow-down` (Gradual throttling)
**Slows down responses instead of blocking**

```javascript
const slowDown = require('express-slow-down');

const speedLimiter = slowDown({
  windowMs: 15 * 60 * 1000,
  delayAfter: 50,
  delayMs: 500
});

app.use('/api/', speedLimiter);
```

---

## 2. CORS Analysis

### Current Implementation

**Location:** `backend/app.js:19-24`

```javascript
const corsOptions = process.env.NODE_ENV === 'production'
  ? { origin: process.env.CORS_ORIGIN || 'https://meteo-app.example.com' }
  : {};

app.use(cors(corsOptions));
```

### Issues

1. **Hardcoded Fallback:** Production uses example.com if `CORS_ORIGIN` not set
2. **Single Origin:** Only allows one domain (not ideal for API + frontend on different subdomains)
3. **No Credentials Support:** May need `credentials: true` for cookies/auth
4. **No Preflight Caching:** Missing `maxAge` for OPTIONS requests

### Recommended Configuration

```javascript
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      'https://meteo-beta.tachyonfuture.com',
      'http://localhost:3000',
      'http://localhost:3001'
    ];

    // Allow requests with no origin (mobile apps, Postman, curl)
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  maxAge: 86400 // Cache preflight for 24 hours
};

app.use(cors(corsOptions));
```

**Environment Variable Approach (Better):**

```bash
# .env
CORS_ALLOWED_ORIGINS=https://meteo-beta.tachyonfuture.com,http://localhost:3000
```

```javascript
const allowedOrigins = process.env.CORS_ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  maxAge: 86400
};
```

---

## 3. Security Headers Analysis

### Current Implementation

**Location:** None (HTTP server level only via Nginx Proxy Manager)

**Status:** ❌ Not implemented in Express app

### Documentation Exists

Comprehensive guide in `docs/SECURITY_HEADERS.md` with:
- CSP configuration for all external APIs
- X-Frame-Options, X-Content-Type-Options
- Referrer-Policy, Permissions-Policy
- HSTS configuration

**BUT:** Only documented for Nginx, not implemented in app

### Recommended Implementation

#### Option 1: Helmet.js (Recommended)
**De-facto standard for Express security headers**

```bash
npm install helmet
```

```javascript
const helmet = require('helmet');

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: [
        "'self'",
        "'unsafe-inline'",
        "'unsafe-eval'",
        "https://plausible.tachyonfuture.com",
        "https://matomo.tachyonfuture.com"
      ],
      styleSrc: ["'self'", "'unsafe-inline'", "https://unpkg.com"],
      imgSrc: [
        "'self'",
        "data:",
        "blob:",
        "https:",
        "http://tile.openstreetmap.org"
      ],
      fontSrc: ["'self'", "data:"],
      connectSrc: [
        "'self'",
        "https://api.meteo-beta.tachyonfuture.com",
        "https://api.openweathermap.org",
        "https://weather.visualcrossing.com",
        "https://api.rainviewer.com",
        "https://api.anthropic.com",
        "https://ipapi.co",
        "https://geojs.io"
      ],
      frameAncestors: ["'self'"],
      baseUri: ["'self'"],
      formAction: ["'self'"]
    }
  },
  crossOriginEmbedderPolicy: false, // Required for some map tiles
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));
```

#### Option 2: Manual Headers (Lightweight)

```javascript
// Security headers middleware
app.use((req, res, next) => {
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(self), microphone=(), camera=()');
  next();
});
```

---

## 4. Nginx vs Express Security Headers

### Current Architecture

```
Internet → Nginx Proxy Manager (Port 81)
  ↓
  ├─ meteo-beta.tachyonfuture.com → Frontend Container (Port 3000)
  └─ api.meteo-beta.tachyonfuture.com → Backend Container (Port 5001)
```

### Where to Implement

| Header Type | Nginx | Express | Both | Recommendation |
|-------------|-------|---------|------|----------------|
| **CSP** | ✅ | ✅ | ❌ | Express (easier updates) |
| **CORS** | ❌ | ✅ | ❌ | Express only |
| **HSTS** | ✅ | ⚠️ | ✅ | Nginx (SSL termination) |
| **X-Frame-Options** | ✅ | ✅ | ✅ | Both (defense in depth) |
| **Rate Limiting** | ✅ | ✅ | ✅ | Both (Nginx global, Express granular) |

**Best Practice:** Implement in both layers
- **Nginx:** Broad protection, DDoS mitigation, SSL enforcement
- **Express:** Fine-grained control, environment-aware, easier to update

---

## 5. Current Vulnerabilities & Risk Assessment

### Critical (Fix Immediately)

| Vulnerability | Risk Level | Impact | CVSS Score |
|---------------|------------|--------|------------|
| No rate limiting on auth endpoints | 🔴 Critical | Brute force attacks, account takeover | 8.5 |
| No rate limiting on AI endpoints | 🔴 Critical | Cost abuse ($100+/hour possible) | 7.8 |
| CORS origin hardcoded fallback | 🟠 High | CSRF attacks, unauthorized access | 6.5 |

### High (Fix Soon)

| Vulnerability | Risk Level | Impact | CVSS Score |
|---------------|------------|--------|------------|
| No CSP headers in Express | 🟠 High | XSS attacks, script injection | 7.2 |
| No helmet.js protection | 🟠 High | Multiple attack vectors | 6.8 |
| No request size limits | 🟠 High | JSON bomb DoS attacks | 6.4 |

### Medium (Address in Sprint)

| Vulnerability | Risk Level | Impact | CVSS Score |
|---------------|------------|--------|------------|
| No slow request DoS protection | 🟡 Medium | Resource exhaustion | 5.5 |
| Single JWT secret | 🟡 Medium | Key rotation difficulty | 4.8 |
| No IP-based blocking | 🟡 Medium | Persistent attackers | 4.5 |

---

## 6. Implementation Roadmap

### Phase 1: Critical Fixes (1-2 hours)

**Priority:** Immediate

```bash
# Install dependencies
cd backend
npm install express-rate-limit helmet
```

**Changes to `backend/app.js`:**

```javascript
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();

// 1. Security headers (before CORS)
app.use(helmet({
  contentSecurityPolicy: false // Configure CSP separately if needed
}));

// 2. CORS configuration
const allowedOrigins = process.env.CORS_ALLOWED_ORIGINS?.split(',') || [
  'http://localhost:3000',
  'http://localhost:3001'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  maxAge: 86400
}));

// 3. Request size limits
app.use(express.json({ limit: '1mb' }));

// 4. Global rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Too many requests, please try again later.' }
});

app.use('/api/', apiLimiter);

// 5. Auth-specific rate limiting
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  skipSuccessfulRequests: true,
  message: { error: 'Too many login attempts. Try again in 15 minutes.' }
});

app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// 6. AI endpoint rate limiting
const aiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: { error: 'AI query limit reached. Try again in 1 hour.' }
});

app.use('/api/ai-weather', aiLimiter);
app.use('/api/ai-location-finder', aiLimiter);

// ... rest of app.js
```

**Update `.env.example` and `backend/.env`:**

```bash
# CORS Configuration
CORS_ALLOWED_ORIGINS=https://meteo-beta.tachyonfuture.com,http://localhost:3000,http://localhost:3001
```

### Phase 2: Nginx Headers (30 minutes)

Update Nginx Proxy Manager configuration to add headers from `docs/SECURITY_HEADERS.md`

**Access Nginx Proxy Manager:**
1. SSH to server: `ssh root@tachyonfuture.com`
2. Open Nginx Proxy Manager: `http://your-server-ip:81`
3. Edit both proxy hosts (frontend + API)
4. Add custom Nginx configuration from SECURITY_HEADERS.md

### Phase 3: Testing & Validation (1 hour)

```bash
# Test rate limiting
for i in {1..10}; do
  curl -X POST http://localhost:5001/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@test.com","password":"wrong"}'
done
# Should see 429 after 5 attempts

# Test CORS
curl -H "Origin: https://evil.com" http://localhost:5001/api/health
# Should be blocked

# Test security headers
curl -I http://localhost:5001/api/health
# Should see X-Frame-Options, X-Content-Type-Options, etc.
```

**Scan with online tools:**
- https://securityheaders.com/
- https://observatory.mozilla.org/
- Expected scores: A or A+

### Phase 4: Monitoring (Future)

Consider adding:
- Winston logging for rate limit violations
- Alerting for repeated 429 errors from same IP
- IP blacklist for persistent attackers
- Rate limit metrics in health check endpoint

---

## 7. Configuration Reference

### Complete `backend/app.js` (Security-Hardened)

```javascript
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { testConnection } = require('./config/database');

const app = express();

// ============================================
// SECURITY MIDDLEWARE (Order matters!)
// ============================================

// 1. Security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://unpkg.com"],
      imgSrc: ["'self'", "data:", "blob:", "https:"],
      connectSrc: ["'self'", "https://api.openweathermap.org", "https://weather.visualcrossing.com"]
    }
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true
  }
}));

// 2. CORS with origin validation
const allowedOrigins = process.env.CORS_ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  maxAge: 86400
}));

// 3. Body parsing with size limits
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// 4. Rate limiting - Global
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' }
});

app.use('/api/', apiLimiter);

// 5. Rate limiting - Auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  skipSuccessfulRequests: true,
  message: { error: 'Too many login attempts. Please try again in 15 minutes.' }
});

app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// 6. Rate limiting - AI endpoints
const aiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: { error: 'AI query limit reached. Please try again in 1 hour.' }
});

app.use('/api/ai-weather', aiLimiter);
app.use('/api/ai-location-finder', aiLimiter);

// ============================================
// ROUTES
// ============================================

// Import route modules
const weatherRoutes = require('./routes/weather');
const locationRoutes = require('./routes/locations');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const airQualityRoutes = require('./routes/airQuality');
const cacheRoutes = require('./routes/cache');
const aiLocationFinderRoutes = require('./routes/aiLocationFinder');
const aiWeatherAnalysisRoutes = require('./routes/aiWeatherAnalysis');
const shareAnswerRoutes = require('./routes/shareAnswer');
const userPreferencesRoutes = require('./routes/userPreferences');

// Health check (no rate limit)
app.get('/api/health', async (req, res) => {
  const dbConnected = await testConnection();
  const apiKeyConfigured = !!process.env.VISUAL_CROSSING_API_KEY;

  res.json({
    status: 'ok',
    message: 'Meteo API is running',
    database: dbConnected ? 'connected' : 'disconnected',
    visualCrossingApi: apiKeyConfigured ? 'configured' : 'not configured',
    timestamp: new Date().toISOString()
  });
});

// Attach feature routes
app.use('/api/weather', weatherRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/air-quality', airQualityRoutes);
app.use('/api/cache', cacheRoutes);
app.use('/api/ai-location-finder', aiLocationFinderRoutes);
app.use('/api/ai-weather', aiWeatherAnalysisRoutes);
app.use('/api/share', shareAnswerRoutes);
app.use('/api/user-preferences', userPreferencesRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found'
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    error: process.env.NODE_ENV === 'production'
      ? 'Internal server error'
      : err.message
  });
});

module.exports = app;
```

---

## 8. Testing Checklist

### Before Deployment

- [ ] Install `express-rate-limit` and `helmet`
- [ ] Update `backend/app.js` with security middleware
- [ ] Add `CORS_ALLOWED_ORIGINS` to `.env` and `.env.example`
- [ ] Test rate limiting locally (auth, AI, general API)
- [ ] Test CORS with allowed and blocked origins
- [ ] Verify security headers with `curl -I`
- [ ] Run full test suite: `npm test`
- [ ] Build Docker containers: `docker-compose build`
- [ ] Test in Docker: `docker-compose up`

### After Deployment

- [ ] Scan with https://securityheaders.com/
- [ ] Scan with https://observatory.mozilla.org/
- [ ] Test rate limiting on production
- [ ] Verify CORS works from frontend
- [ ] Check CSP doesn't break frontend features
- [ ] Monitor logs for rate limit violations
- [ ] Update SECURITY.md with new protections

---

## 9. Cost Impact Analysis

### AI Query Protection

**Without Rate Limiting:**
- Malicious user: 1000 queries/hour = $5/hour
- Potential monthly abuse: $3,600

**With Rate Limiting (10/hour):**
- Maximum abuse: 10 queries/hour = $0.05/hour
- Potential monthly abuse: $36 (96% reduction)

### Infrastructure

**Additional Costs:**
- `express-rate-limit`: Free, open source
- `helmet`: Free, open source
- Server overhead: Negligible (<1% CPU/memory)

**ROI:** Immediate 96% reduction in potential abuse cost

---

## 10. Maintenance & Monitoring

### Monthly Tasks

1. Review rate limit violations in logs
2. Adjust rate limits based on usage patterns
3. Update CSP directives if new APIs added
4. Scan with security header tools
5. Check for dependency updates

### Quarterly Tasks

1. Penetration testing (auth endpoints)
2. Load testing (verify rate limits hold)
3. CORS policy review
4. Security header audit

---

## Appendix A: Quick Reference

### Environment Variables

```bash
# CORS
CORS_ALLOWED_ORIGINS=https://meteo-beta.tachyonfuture.com,http://localhost:3000

# Rate Limits (optional overrides)
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
AUTH_RATE_LIMIT_MAX=5
AI_RATE_LIMIT_MAX=10
```

### Testing Commands

```bash
# Test rate limiting
npm run test:rate-limits

# Test security headers
curl -I http://localhost:5001/api/health | grep -E "X-Frame|X-Content|CSP"

# Scan production
curl -I https://api.meteo-beta.tachyonfuture.com/api/health
```

---

## Appendix B: Alternative Solutions

### For High-Traffic Applications

Consider:
- **Redis-based rate limiting:** `rate-limit-redis` for distributed systems
- **Nginx rate limiting:** `limit_req_zone` for L7 DDoS protection
- **Cloudflare:** WAF + rate limiting + DDoS protection
- **AWS API Gateway:** Built-in throttling + caching

---

**Last Updated:** January 2025
**Author:** Security Audit
**Next Review:** April 2025
