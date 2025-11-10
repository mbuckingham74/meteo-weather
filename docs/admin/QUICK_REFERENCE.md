# 🔧 Admin Panel - Quick Reference

**One-page cheat sheet for admin panel operations**

---

## 🚀 Quick Setup (5 minutes)

### 1. Add Admin Email
```bash
# Edit backend/.env
ADMIN_EMAILS=your-email@example.com

# Edit frontend/.env (optional, for UI visibility)
VITE_ADMIN_EMAILS=your-email@example.com
```

### 2. Restart Services
```bash
docker-compose restart
```

### 3. Access Panel
- Navigate to: `http://localhost:3000/admin`
- Must be logged in with admin email

---

## 📊 Dashboard Tabs

| Tab | What It Shows | Key Metrics |
|-----|--------------|-------------|
| **📊 Overview** | Quick summary | Users, locations, AI cost, cache hit rate |
| **👥 Users** | User activity | Total, signups, active, favorites |
| **🌤️ Weather** | Location data | Most queried cities, total records |
| **🤖 AI Usage** | AI statistics | Queries, costs, tokens, confidence |
| **💾 Cache** | Cache health | Hit rate, entries, cleanup tools |
| **🗄️ Database** | DB size | Total size, largest tables |

---

## 💰 AI Cost Tracking

### Understanding Costs
- **Pricing:** Claude Sonnet 4.5
  - Input: $3 per million tokens
  - Output: $15 per million tokens
- **Estimate:** ~$0.005-0.01 per query
- **Formula:** (tokens × 0.7 × $3/1M) + (tokens × 0.3 × $15/1M)

### Example Calculations
| Tokens | Estimated Cost |
|--------|---------------|
| 10,000 | ~$0.066 |
| 50,000 | ~$0.33 |
| 100,000 | ~$0.66 |
| 1,000,000 | ~$6.60 |

### Monitoring Tips
✅ Set budget alerts in Anthropic Console
✅ Review costs weekly
✅ Monitor token trends
✅ Optimize prompts if costs spike

---

## 💾 Cache Management

### Clear Expired Cache
**When:** Weekly or expired count > 1,000
**Impact:** Safe, frees space, no performance hit
**Command:** Click "🗑️ Clear Expired Cache" button

### Clear All Cache
**When:** Emergency only (API keys compromised, data corruption)
**Impact:** ⚠️ Next requests slower until cache rebuilds
**Command:** Click "⚠️ Clear All Cache" (requires confirmation)

### Clear by Source
**When:** Specific API had issues
**Impact:** Targeted cleanup for one provider
**Command:** Use API endpoint (see docs)

---

## 🔍 Most Queried Locations

Shows top 10 cities by query count (last 30 days).

**Use Cases:**
- Identify popular locations for optimization
- Focus caching on high-traffic cities
- Understand user geography
- Plan server capacity

**Example:**
```
1. Seattle, USA - 1,234 queries
2. New York, USA - 987 queries
3. London, UK - 765 queries
```

---

## 🗄️ Database Health

### Normal Sizes
| Table | Expected Size |
|-------|--------------|
| `weather_data` | 500-1000 MB |
| `api_cache` | 50-200 MB |
| `locations` | 5-20 MB |
| `users` | 1-5 MB |
| `shared_ai_answers` | 1-10 MB |

### Action Required When
- `weather_data` > 2 GB → Archive old data
- `api_cache` > 500 MB → Clear expired entries
- Total DB > 5 GB → Review retention policies

---

## 🚨 Troubleshooting

### "Access Denied"
**Fix:**
1. Check `ADMIN_EMAILS` in `backend/.env`
2. Verify email matches your account
3. Restart: `docker-compose restart`

### Slow Loading
**Fix:**
1. Wait 10-15 seconds (large datasets)
2. Click "↻ Refresh" to retry
3. Check database performance

### Missing Stats
**Fix:**
1. Add locations via search
2. Generate AI queries
3. Wait for data accumulation
4. Refresh panel

---

## 🔐 Security Notes

✅ Backend validates all requests (JWT + email check)
✅ Frontend check is cosmetic only
✅ Use strong passwords for admin accounts
✅ Limit admin emails to essential personnel
✅ Rotate access when personnel changes
✅ Always use HTTPS in production

---

## 📡 API Endpoints (For Scripts/Automation)

### Get All Stats
```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:5001/api/admin/stats
```

### Clear Expired Cache
```bash
curl -X POST \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:5001/api/admin/cache/clear-expired
```

### Clear by Source
```bash
curl -X POST \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"apiSource":"visualcrossing"}' \
  http://localhost:5001/api/admin/cache/clear-source
```

---

## 📈 Key Metrics to Watch

### Daily
- ✅ Active users (last 24h)
- ✅ Cache hit rate
- ✅ API errors (if any)

### Weekly
- ✅ AI query count and costs
- ✅ New user signups
- ✅ Most queried locations
- ✅ Expired cache cleanup

### Monthly
- ✅ Total AI spend
- ✅ Database size growth
- ✅ User retention rate
- ✅ Cache performance trends

---

## 🎯 Common Tasks

### Task: Check Monthly AI Costs
1. Go to **🤖 AI Usage** tab
2. Note "Estimated Cost" stat
3. Compare to previous month
4. Set budget if needed

### Task: Free Up Database Space
1. Go to **💾 Cache** tab
2. Click "🗑️ Clear Expired Cache"
3. Check **🗄️ Database** tab
4. Verify size reduction

### Task: Find Most Popular Cities
1. Go to **📊 Overview** tab
2. Scroll to "Most Queried Locations"
3. Review top 10 list
4. Consider caching optimization

### Task: Monitor User Growth
1. Go to **👥 Users** tab
2. Check "New Users (7 days)"
3. Compare to "Active (30 days)"
4. Calculate retention rate

---

## 📚 Full Documentation

For detailed information, see [ADMIN_PANEL.md](./ADMIN_PANEL.md)

---

**Quick Links:**
- 🏠 [Main README](../../README.md)
- 🤖 [CLAUDE.md](../../CLAUDE.md)
- 📚 [Documentation Hub](../README.md)

**Last Updated:** November 7, 2025
