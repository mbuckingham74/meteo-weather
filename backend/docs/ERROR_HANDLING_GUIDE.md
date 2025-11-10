# Backend Error Handling Guide

Complete guide for using the standardized error handling system in the Meteo backend.

**Created:** November 5, 2025
**Part of:** Error Message Improvement Initiative

---

## 📚 Table of Contents

- [Overview](#overview)
- [Quick Start](#quick-start)
- [Error Codes](#error-codes)
- [Structured Logging](#structured-logging)
- [Error Middleware](#error-middleware)
- [Migration Guide](#migration-guide)
- [Best Practices](#best-practices)

---

## Overview

The backend error handling system provides:

1. **ERROR_CODES catalog** - Standardized error codes that map to HTTP status codes
2. **Structured logging** - Environment-aware logging (development vs production)
3. **Error middleware** - Centralized error handling for Express routes
4. **ApiError class** - Consistent error responses

### Benefits

- ✅ Consistent error responses across all endpoints
- ✅ Better debugging with structured logs
- ✅ Automatic HTTP status code mapping
- ✅ User-friendly error messages
- ✅ Production-ready JSON logging

---

## Quick Start

### 1. Import Error Utilities

```js
const { ERROR_CODES, createError } = require('../utils/errorCodes');
const logger = require('../utils/logger');
const { asyncHandler } = require('../middleware/errorHandler');
```

### 2. Use in Routes

```js
// OLD WAY (before)
router.get('/weather/:location', async (req, res) => {
  try {
    const data = await weatherService.getData(req.params.location);
    res.json(data);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// NEW WAY (after)
router.get('/weather/:location', asyncHandler(async (req, res) => {
  const data = await weatherService.getData(req.params.location);
  res.json(data);
}));
```

### 3. Throw Errors in Services

```js
// In weatherService.js
async function getData(location) {
  if (!location) {
    throw createError(
      ERROR_CODES.VALIDATION_ERROR,
      'Location parameter is required'
    );
  }

  try {
    const data = await externalAPI.fetch(location);
    logger.info('Weather Service', 'Fetched weather data', { location });
    return data;
  } catch (error) {
    logger.error('Weather Service', 'Failed to fetch data', error);
    throw createError(
      ERROR_CODES.EXTERNAL_API_ERROR,
      'Weather data unavailable'
    );
  }
}
```

---

## Error Codes

### Available Error Codes

#### Client Errors (4xx)

```js
ERROR_CODES.VALIDATION_ERROR          // 400 - Invalid input
ERROR_CODES.UNAUTHORIZED              // 401 - Not authenticated
ERROR_CODES.TOKEN_EXPIRED             // 401 - JWT expired
ERROR_CODES.FORBIDDEN                 // 403 - No permission
ERROR_CODES.NOT_FOUND                 // 404 - Resource not found
ERROR_CODES.CONFLICT                  // 409 - Duplicate resource
ERROR_CODES.RATE_LIMITED              // 429 - Too many requests
```

#### Server Errors (5xx)

```js
ERROR_CODES.SERVER_ERROR              // 500 - Generic error
ERROR_CODES.DATABASE_ERROR            // 500 - Database failed
ERROR_CODES.EXTERNAL_API_ERROR        // 502 - External API failed
ERROR_CODES.SERVICE_UNAVAILABLE       // 503 - Service down
ERROR_CODES.TIMEOUT_ERROR             // 504 - Request timeout
```

#### Business Logic Errors

```js
ERROR_CODES.LOCATION_NOT_FOUND        // 404 - Geocoding failed
ERROR_CODES.WEATHER_DATA_UNAVAILABLE  // 503 - Weather API down
ERROR_CODES.INVALID_CREDENTIALS       // 401 - Wrong email/password
ERROR_CODES.EMAIL_ALREADY_EXISTS      // 409 - Email taken
ERROR_CODES.WEAK_PASSWORD             // 400 - Password too weak
```

### Creating Errors

```js
const { createError, ERROR_CODES } = require('../utils/errorCodes');

// Basic error
throw createError(ERROR_CODES.NOT_FOUND);

// Error with custom message
throw createError(
  ERROR_CODES.VALIDATION_ERROR,
  'Email format is invalid'
);

// Error with context for debugging
throw createError(
  ERROR_CODES.DATABASE_ERROR,
  'Failed to save user',
  { userId: 123, table: 'users' }
);
```

### Converting Errors

The `toApiError()` function automatically converts common errors:

```js
const { toApiError } = require('../utils/errorCodes');

try {
  // Database operation
  await db.query('SELECT * FROM users WHERE id = ?', [userId]);
} catch (error) {
  // Automatically maps MySQL ER_DUP_ENTRY to CONFLICT
  throw toApiError(error, 'Creating user');
}
```

Auto-mapped errors:
- **JWT errors** → `TOKEN_EXPIRED` or `INVALID_TOKEN`
- **MySQL ER_DUP_ENTRY** → `CONFLICT`
- **MySQL ER_*** → `DATABASE_ERROR`
- **Axios timeout** → `TIMEOUT_ERROR`
- **Axios 404** → `LOCATION_NOT_FOUND`
- **Axios 429** → `RATE_LIMITED`
- **Axios 5xx** → `EXTERNAL_API_ERROR`

---

## Structured Logging

### Logger Methods

```js
const logger = require('../utils/logger');

// Debug - Detailed information for debugging
logger.debug('Weather Service', 'Fetching data', { location: 'Seattle' });

// Info - General informational messages
logger.info('Auth Service', 'User logged in', { userId: 123 });

// Warn - Warning messages
logger.warn('Database', 'Connection slow', { latency: 2000 });

// Error - Error messages
logger.error('API Client', 'Request failed', error);

// Fatal - Critical errors
logger.fatal('Database', 'Connection lost', error);
```

### Category-Specific Logger

Create a logger for a specific category:

```js
const logger = require('../utils/logger');
const weatherLogger = logger.createLogger('Weather Service');

weatherLogger.info('Fetched current weather', { location: 'Seattle' });
weatherLogger.error('API request failed', error);
```

### Environment-Aware Logging

#### Development
- Colorful console output
- Full stack traces
- All log levels (DEBUG and above)

```
[12:34:56] [INFO] Weather Service - Fetched weather data { location: 'Seattle' }
```

#### Production
- Structured JSON logs
- Machine-readable
- INFO level and above

```json
{"timestamp":"2025-11-05T12:34:56.789Z","level":"INFO","category":"Weather Service","message":"Fetched weather data","data":{"location":"Seattle"}}
```

#### Test
- Silent by default
- Enable with `ENABLE_TEST_LOGS=1`

### Request Logging

The `requestLogger` middleware automatically logs all HTTP requests:

```js
const { requestLogger } = require('../middleware/errorHandler');
app.use(requestLogger);
```

Output:
```
[12:34:56] [INFO] HTTP - GET /api/weather/Seattle - 200 (145ms)
[12:34:57] [WARN] HTTP - GET /api/user/999 - 404 (12ms)
[12:34:58] [ERROR] HTTP - POST /api/auth/login - 500 (234ms)
```

---

## Error Middleware

### Setup in server.js

```js
const {
  errorHandler,
  notFoundHandler,
  requestLogger,
  asyncHandler
} = require('./middleware/errorHandler');

// 1. Add request logger (first middleware)
app.use(requestLogger);

// 2. Define routes with asyncHandler
app.get('/api/weather/:location', asyncHandler(async (req, res) => {
  const data = await weatherService.getData(req.params.location);
  res.json(data);
}));

// 3. Add 404 handler (before error handler)
app.use(notFoundHandler);

// 4. Add error handler (last middleware)
app.use(errorHandler);
```

### How It Works

1. **asyncHandler** - Catches errors from async route handlers
2. **errorHandler** - Converts all errors to ApiError and sends JSON response
3. **notFoundHandler** - Returns standardized 404 for unknown routes
4. **requestLogger** - Logs all requests with timing

### Error Response Format

All errors return JSON in this format:

```json
{
  "success": false,
  "error": "Invalid email or password",
  "code": "INVALID_CREDENTIALS"
}
```

In development, additional fields are included:

```json
{
  "success": false,
  "error": "Database operation failed",
  "code": "DATABASE_ERROR",
  "context": {
    "table": "users",
    "operation": "INSERT"
  },
  "stack": "Error: Database operation failed\n    at ..."
}
```

---

## Migration Guide

### Step 1: Update Route Files

#### Before
```js
router.get('/weather/:location', async (req, res) => {
  try {
    const data = await weatherService.getData(req.params.location);
    res.json({ success: true, data });
  } catch (error) {
    console.error('Error fetching weather:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});
```

#### After
```js
const { asyncHandler } = require('../middleware/errorHandler');

router.get('/weather/:location', asyncHandler(async (req, res) => {
  const data = await weatherService.getData(req.params.location);
  res.json({ success: true, data });
}));
```

### Step 2: Update Service Files

#### Before
```js
async function getData(location) {
  if (!location) {
    throw new Error('Location is required');
  }

  try {
    const response = await axios.get(`${API_URL}/${location}`);
    return response.data;
  } catch (error) {
    console.error('API error:', error);
    throw new Error('Failed to fetch weather data');
  }
}
```

#### After
```js
const { ERROR_CODES, createError } = require('../utils/errorCodes');
const logger = require('../utils/logger');

async function getData(location) {
  if (!location) {
    throw createError(
      ERROR_CODES.VALIDATION_ERROR,
      'Location parameter is required'
    );
  }

  try {
    const response = await axios.get(`${API_URL}/${location}`);
    logger.info('Weather Service', 'Fetched weather data', { location });
    return response.data;
  } catch (error) {
    logger.error('Weather Service', 'API request failed', error);
    throw createError(
      ERROR_CODES.EXTERNAL_API_ERROR,
      'Weather data unavailable',
      { location }
    );
  }
}
```

### Step 3: Replace console.log/error

#### Before
```js
console.log('User logged in:', userId);
console.error('Database error:', error);
console.warn('API rate limit approaching');
```

#### After
```js
logger.info('Auth Service', 'User logged in', { userId });
logger.error('Database', 'Query failed', error);
logger.warn('External API', 'Rate limit approaching', { remaining: 10 });
```

---

## Best Practices

### 1. Use Specific Error Codes

```js
// ❌ Bad - Generic error
throw createError(ERROR_CODES.SERVER_ERROR);

// ✅ Good - Specific error
throw createError(ERROR_CODES.LOCATION_NOT_FOUND, 'Unable to geocode "XYZ123"');
```

### 2. Include Context for Debugging

```js
// ❌ Bad - No context
throw createError(ERROR_CODES.DATABASE_ERROR);

// ✅ Good - Context included
throw createError(
  ERROR_CODES.DATABASE_ERROR,
  'Failed to save user preferences',
  { userId: 123, preferences: { theme: 'dark' } }
);
```

### 3. Log Before Throwing

```js
// ✅ Good pattern
try {
  const data = await externalAPI.fetch();
  logger.info('External API', 'Request successful', { endpoint: '/data' });
  return data;
} catch (error) {
  logger.error('External API', 'Request failed', error);
  throw createError(ERROR_CODES.EXTERNAL_API_ERROR, 'Service unavailable');
}
```

### 4. Use Category-Specific Loggers

```js
// ✅ Good - Consistent category
const logger = require('../utils/logger').createLogger('Weather Service');

logger.info('Fetching current weather');
logger.info('Fetched forecast data');
logger.error('API timeout', error);
```

### 5. Don't Catch Errors in Routes

```js
// ❌ Bad - Manual error handling
router.get('/data', async (req, res) => {
  try {
    const data = await service.getData();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ✅ Good - Let error middleware handle it
router.get('/data', asyncHandler(async (req, res) => {
  const data = await service.getData();
  res.json(data);
}));
```

### 6. Validate Input Early

```js
// ✅ Good - Validate at route level
router.post('/user', asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw createError(
      ERROR_CODES.VALIDATION_ERROR,
      'Email and password are required'
    );
  }

  const user = await userService.create(email, password);
  res.json({ success: true, user });
}));
```

### 7. Use toApiError for External Errors

```js
// ✅ Good - Automatic error conversion
try {
  await db.query('INSERT INTO users VALUES (?)', [user]);
} catch (error) {
  // Automatically maps ER_DUP_ENTRY to CONFLICT
  throw toApiError(error, 'Creating user');
}
```

---

## Examples

### Example 1: Weather Route

```js
const express = require('express');
const router = express.Router();
const { asyncHandler } = require('../middleware/errorHandler');
const { ERROR_CODES, createError } = require('../utils/errorCodes');
const weatherService = require('../services/weatherService');

router.get('/current/:location', asyncHandler(async (req, res) => {
  const { location } = req.params;

  if (!location || location.trim() === '') {
    throw createError(
      ERROR_CODES.VALIDATION_ERROR,
      'Location parameter is required'
    );
  }

  const data = await weatherService.getCurrentWeather(location);
  res.json({ success: true, data });
}));

module.exports = router;
```

### Example 2: Auth Service

```js
const { ERROR_CODES, createError } = require('../utils/errorCodes');
const logger = require('../utils/logger').createLogger('Auth Service');
const bcrypt = require('bcryptjs');

async function login(email, password) {
  logger.info('Login attempt', { email });

  // Validate input
  if (!email || !password) {
    throw createError(
      ERROR_CODES.VALIDATION_ERROR,
      'Email and password are required'
    );
  }

  // Find user
  const user = await db.findUserByEmail(email);
  if (!user) {
    logger.warn('Login failed - user not found', { email });
    throw createError(ERROR_CODES.INVALID_CREDENTIALS);
  }

  // Verify password
  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) {
    logger.warn('Login failed - invalid password', { email });
    throw createError(ERROR_CODES.INVALID_CREDENTIALS);
  }

  logger.info('Login successful', { userId: user.id, email });
  return { userId: user.id, email: user.email };
}

module.exports = { login };
```

### Example 3: Database Service

```js
const { toApiError } = require('../utils/errorCodes');
const logger = require('../utils/logger').createLogger('Database');

async function saveUser(userData) {
  try {
    const result = await db.query(
      'INSERT INTO users (email, name) VALUES (?, ?)',
      [userData.email, userData.name]
    );

    logger.info('User saved', { userId: result.insertId });
    return result.insertId;
  } catch (error) {
    logger.error('Failed to save user', error);
    // Automatically maps ER_DUP_ENTRY to CONFLICT
    throw toApiError(error, 'Saving user');
  }
}

module.exports = { saveUser };
```

---

## Testing

### Example Test

```js
const { ERROR_CODES, createError, toApiError } = require('../utils/errorCodes');

describe('Error Handling', () => {
  it('should create ApiError with correct properties', () => {
    const error = createError(
      ERROR_CODES.NOT_FOUND,
      'User not found',
      { userId: 123 }
    );

    expect(error.code).toBe('NOT_FOUND');
    expect(error.status).toBe(404);
    expect(error.message).toBe('User not found');
    expect(error.context).toEqual({ userId: 123 });
  });

  it('should convert JWT error to TOKEN_EXPIRED', () => {
    const jwtError = new Error('jwt expired');
    jwtError.name = 'TokenExpiredError';

    const apiError = toApiError(jwtError);

    expect(apiError.code).toBe('TOKEN_EXPIRED');
    expect(apiError.status).toBe(401);
  });
});
```

---

## Monitoring

### Production Logs

In production, logs are JSON formatted for easy parsing:

```json
{"timestamp":"2025-11-05T12:34:56.789Z","level":"ERROR","category":"Weather Service","message":"API timeout","data":{"location":"Seattle","timeout":10000}}
```

These can be ingested by logging services like:
- **CloudWatch** (AWS)
- **Stackdriver** (Google Cloud)
- **Azure Monitor**
- **ELK Stack** (Elasticsearch, Logstash, Kibana)

### Metrics to Monitor

- **Error rate by code** - Track which errors occur most
- **Response time by endpoint** - Find slow routes
- **4xx vs 5xx ratio** - Client vs server errors
- **Top error categories** - Which services fail most

---

## Summary

✅ **Use ERROR_CODES** for all thrown errors
✅ **Use logger** instead of console.log/error
✅ **Use asyncHandler** for all async routes
✅ **Include context** in errors for debugging
✅ **Let middleware handle** error responses

---

**Need help?** Check existing routes like `routes/weather.js` for examples.

**Found a bug?** Report in GitHub issues with error logs.
