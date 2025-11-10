# 🔧 Admin Panel Documentation

**Comprehensive administrative dashboard for monitoring and managing the Meteo Weather App**

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Setup & Configuration](#setup--configuration)
- [Accessing the Admin Panel](#accessing-the-admin-panel)
- [Dashboard Sections](#dashboard-sections)
- [API Endpoints](#api-endpoints)
- [Security](#security)
- [Troubleshooting](#troubleshooting)

---

## Overview

The Admin Panel provides a comprehensive dashboard for monitoring system health, user activity, weather data usage, AI costs, cache performance, and database statistics. It's designed for administrators to quickly identify issues, optimize performance, and understand usage patterns.

**Key Capabilities:**
- 📊 Real-time system statistics
- 👥 User activity monitoring
- 🌤️ Weather data analytics
- 🤖 AI usage and cost tracking
- 💾 Cache management tools
- 🗄️ Database health monitoring

---

## Features

### 📊 Overview Dashboard
- **Quick Stats Cards:**
  - Total users and active users (last 30 days)
  - Total locations and weather records
  - AI queries (total and last 7 days)
  - Cache hit rate and valid entries
  - Database size and table count
  - AI cost estimates with token usage

- **Most Queried Locations:**
  - Top 10 cities by query volume (last 30 days)
  - Helps identify popular locations for optimization

### 👥 User Statistics
- Total registered users
- New signups (last 7 days)
- Active users (last 30 days)
- Users with saved favorites
- Average favorites per user

### 🌤️ Weather Data Analytics
- Total locations in database
- Total weather records stored
- Most queried locations (last 30 days)
- Recently added locations
- Data source breakdown (Visual Crossing, OpenWeather, etc.)

### 🤖 AI Usage & Cost Tracking
- Total AI queries processed
- Queries last 7 days
- Total views on shared AI answers
- Average tokens per query
- **Estimated cost in USD** (based on Claude Sonnet 4.5 pricing)
- Token usage breakdown
- Confidence level distribution (high/medium/low)
- Top 10 most-viewed shared answers

### 💾 Cache Management
- Total cache entries (valid vs expired)
- Cache hit rate (last 7 days)
- Cache breakdown by API source
- Oldest cache entry info
- **Management Tools:**
  - Clear expired cache entries (one-click cleanup)
  - Clear all cache (emergency reset with warning)
  - Clear cache by API source (targeted cleanup)

### 🗄️ Database Statistics
- Total database size in MB
- Total table count
- Top 10 largest tables with:
  - Table name
  - Size in MB
  - Row count

---

## Setup & Configuration

### 1. Backend Configuration

Add the `ADMIN_EMAILS` environment variable to your `backend/.env` file:

```env
# Admin Panel Access
# Comma-separated list of admin email addresses (no spaces!)
ADMIN_EMAILS=your-email@example.com,another-admin@example.com
```

**Important:**
- Only users with emails in this list can access the admin panel
- No spaces between emails (comma-separated)
- Must be valid user accounts (registered in the database)

### 2. Frontend Configuration

Add the frontend environment variable to your `frontend/.env` file:

```env
# Admin Panel Access (must match backend ADMIN_EMAILS)
VITE_ADMIN_EMAILS=your-email@example.com,another-admin@example.com
```

**Note:** The frontend uses this to show/hide the admin link. Backend always validates access.

### 3. Restart Services

After updating environment variables:

```bash
# Docker Compose
docker-compose restart

# Or rebuild if needed
docker-compose down
docker-compose up --build
```

---

## Accessing the Admin Panel

### Via URL
Navigate to: `http://localhost:3000/admin` (or your production URL)

### Requirements
1. **Must be logged in** - Authentication required
2. **Admin email** - Your email must be in `ADMIN_EMAILS` list
3. **Valid JWT token** - Session must be active

### Access Denied Scenarios
- **Not logged in:** Shows "Authentication Required" message
- **Not an admin:** Shows "Access Denied" message
- **Invalid token:** Redirected to login

---

## Dashboard Sections

### Navigation Tabs
Click any tab to switch views:

1. **📊 Overview** - Quick summary of all key metrics
2. **👥 Users** - Detailed user statistics
3. **🌤️ Weather Data** - Location and weather record analytics
4. **🤖 AI Usage** - AI query statistics and cost tracking
5. **💾 Cache** - Cache performance and management tools
6. **🗄️ Database** - Database size and table statistics

### Refresh Button
Click **"↻ Refresh"** in the top-right to reload all statistics.

---

## API Endpoints

All admin endpoints require authentication via JWT token.

### GET /api/admin/stats
Get comprehensive system statistics (all tabs).

**Response:**
```json
{
  "success": true,
  "stats": {
    "database": { /* DB stats */ },
    "users": { /* User stats */ },
    "weather": { /* Weather stats */ },
    "cache": { /* Cache stats */ },
    "ai": { /* AI stats */ },
    "api": { /* API usage stats */ }
  }
}
```

### GET /api/admin/health
Get system health check.

**Response:**
```json
{
  "success": true,
  "health": {
    "database": "healthy",
    "issues": [],
    "timestamp": "2025-11-07T12:00:00Z"
  }
}
```

### POST /api/admin/cache/clear-expired
Clear all expired cache entries.

**Response:**
```json
{
  "success": true,
  "message": "Cleared 150 expired cache entries",
  "deletedCount": 150
}
```

### POST /api/admin/cache/clear-all
Clear ALL cache entries (use with caution!).

**Response:**
```json
{
  "success": true,
  "message": "Cleared all 500 cache entries",
  "deletedCount": 500,
  "warning": "All cache cleared. Next requests will be slower until cache rebuilds."
}
```

### POST /api/admin/cache/clear-source
Clear cache for specific API source.

**Body:**
```json
{
  "apiSource": "visualcrossing"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Cleared 200 cache entries for visualcrossing",
  "deletedCount": 200
}
```

### Individual Statistics Endpoints
- `GET /api/admin/database` - Database stats only
- `GET /api/admin/users` - User stats only
- `GET /api/admin/weather` - Weather stats only
- `GET /api/admin/ai` - AI stats only
- `GET /api/admin/api-usage` - API usage stats only

---

## Security

### Authentication Flow
1. **Frontend Check:**
   - Checks if user email is in `VITE_ADMIN_EMAILS`
   - Shows UI if match (client-side only)

2. **Backend Validation:**
   - Middleware `requireAdmin` validates JWT token
   - Checks if email is in `ADMIN_EMAILS` (server-side)
   - Returns 403 if not authorized

**Important:** Frontend check is cosmetic. Backend always enforces access control.

### Authorization Middleware

Located in `backend/middleware/adminMiddleware.js`:

```javascript
function requireAdmin(req, res, next) {
  // Verify JWT token
  // Check if user email matches ADMIN_EMAILS
  // Allow or deny access
}
```

### Best Practices
1. **Use strong passwords** for admin accounts
2. **Limit admin emails** to essential personnel only
3. **Rotate admin access** when personnel changes
4. **Monitor admin actions** via server logs
5. **Use HTTPS** in production (already configured)

---

## AI Cost Tracking

### How It Works
The admin panel estimates AI costs based on:
- **Total tokens used** (from `shared_ai_answers` table)
- **Claude Sonnet 4.5 pricing:**
  - Input: $3 per million tokens
  - Output: $15 per million tokens
- **Assumption:** 70% input, 30% output (rough estimate)

### Formula
```
Total Cost = (tokens * 0.7 * $3 / 1M) + (tokens * 0.3 * $15 / 1M)
```

### Example
- 100,000 tokens used
- Cost = (100k * 0.7 * $3/1M) + (100k * 0.3 * $15/1M)
- Cost = $0.21 + $0.45 = **$0.66**

### Monitoring Recommendations
- **Set budget alerts** in Anthropic Console
- **Review costs weekly** via admin panel
- **Monitor token trends** to predict monthly costs
- **Optimize prompts** if costs grow unexpectedly

---

## Cache Management

### When to Clear Cache

**Clear Expired Cache (Recommended):**
- Run **weekly** or when expired count > 1,000
- Safe operation - only removes stale data
- Frees up database space
- No impact on active requests

**Clear All Cache (Emergency Only):**
- API keys were compromised
- Data corruption suspected
- Major API changes require fresh data
- **Warning:** Next requests will be slower until cache rebuilds

**Clear by Source:**
- Specific API had issues (e.g., Visual Crossing outage)
- API key was rotated for one provider
- Targeted cleanup without full reset

### Performance Impact
- **After clearing:** 1st request to each location will be slow (~500-1000ms)
- **Cache rebuilds:** Automatically over next few hours
- **Hit rate recovers:** Within 24-48 hours to normal levels

---

## Database Statistics

### Understanding Table Sizes

**Normal Sizes (approximate):**
- `weather_data`: 500-1000 MB (largest table, 585K+ records)
- `api_cache`: 50-200 MB (depends on activity)
- `locations`: 5-20 MB
- `users`: 1-5 MB
- `shared_ai_answers`: 1-10 MB

**Action Required When:**
- `weather_data` > 2 GB - Consider partitioning or archiving old data
- `api_cache` > 500 MB - Clear expired entries
- Total DB > 5 GB - Review retention policies

### Optimization Tips
1. Run `OPTIMIZE TABLE` on large tables monthly
2. Archive old `shared_ai_answers` after 30 days
3. Review indexes on slow queries
4. Consider table partitioning for `weather_data`

---

## Troubleshooting

### "Authentication Required" Error
**Cause:** Not logged in
**Solution:** Log in with your admin account

### "Access Denied" Error
**Cause:** Email not in `ADMIN_EMAILS`
**Solution:**
1. Check `backend/.env` for `ADMIN_EMAILS`
2. Verify your email is in the list
3. Restart backend: `docker-compose restart backend`

### "Failed to retrieve system statistics" Error
**Cause:** Database connection issue
**Solution:**
1. Check database is running: `docker-compose ps`
2. Check backend logs: `docker-compose logs backend`
3. Verify DB credentials in `backend/.env`

### Slow Loading
**Cause:** Large dataset queries
**Solution:**
1. Wait for initial load (10-15 seconds max)
2. Click refresh to retry
3. Check database performance

### Missing Statistics
**Cause:** Empty database or recent setup
**Solution:**
1. Add some locations via search
2. Generate AI queries
3. Wait for data accumulation
4. Refresh admin panel

---

## UI Features

### Responsive Design
- **Desktop:** Full 6-tab layout with grid views
- **Tablet:** Compact 2-column grids
- **Mobile:** Single column, stacked cards

### Dark Mode Support
Admin panel fully supports dark mode via theme context:
- **Light theme:** Purple gradients, white cards
- **Dark theme:** Darker purples, gray cards
- **Auto theme:** Follows system preference

### Color Coding
- **Green badges:** High confidence AI answers
- **Yellow badges:** Medium confidence
- **Red badges:** Low confidence
- **Purple gradients:** Primary action buttons

---

## Future Enhancements

### Planned Features
- [ ] Export statistics to CSV/PDF
- [ ] Real-time WebSocket updates
- [ ] Custom date range filters
- [ ] User activity timeline
- [ ] API rate limit monitoring
- [ ] Automated maintenance tasks
- [ ] Email alerts for issues
- [ ] Performance trend graphs
- [ ] Cost projection charts

---

## Support

For questions or issues:
1. Check [Troubleshooting](#troubleshooting) section
2. Review server logs: `docker-compose logs backend`
3. Check database connection: `docker-compose ps`
4. Open GitHub issue: [meteo-weather/issues](https://github.com/mbuckingham74/meteo-weather/issues)

---

**Last Updated:** November 7, 2025
**Version:** 1.0.0
**Maintained by:** Michael Buckingham
