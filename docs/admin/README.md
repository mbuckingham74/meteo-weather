# 🔧 Admin Panel Documentation

**Complete documentation for the Meteo Weather App admin panel**

---

## 📚 Available Documentation

### [📘 ADMIN_PANEL.md](./ADMIN_PANEL.md)
**Comprehensive admin panel guide** (570 lines)

Everything you need to know about using the admin panel:
- Complete feature overview
- Step-by-step setup guide
- Dashboard sections explained
- API endpoints reference
- Security implementation
- AI cost tracking methodology
- Cache management guide
- Database statistics interpretation
- Troubleshooting guide
- UI features and dark mode support

**Read this for:** Full understanding of all features

---

### [⚡ QUICK_REFERENCE.md](./QUICK_REFERENCE.md)
**One-page cheat sheet** (340 lines)

Quick reference for common tasks:
- 5-minute setup instructions
- Dashboard tabs overview
- AI cost examples and calculations
- Cache management tips
- Key metrics to monitor
- Common troubleshooting fixes
- API endpoint examples
- Performance monitoring guide

**Read this for:** Daily operations and quick lookups

---

### [📋 IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)
**Technical implementation details** (890 lines)

Deep dive into the implementation:
- Complete file structure
- Backend components (middleware, service, routes)
- Frontend components (React, CSS)
- Configuration changes
- Statistics tracked
- Security architecture
- Testing status
- Deployment checklist
- Performance considerations
- Known limitations and future enhancements

**Read this for:** Technical details and development

---

### [🔒 ADMIN_SECURITY.md](./ADMIN_SECURITY.md)
**Security implementation and best practices** (NEW!)

Comprehensive security documentation:
- Multi-layer authentication (JWT, database, middleware)
- Authorization and access controls
- Data access permissions (what admins can/cannot see)
- Privacy & GDPR/CCPA compliance
- Threat model and risk assessment
- Security best practices for self-hosted deployments
- Audit and monitoring guidelines
- Incident response procedures
- Security checklist

**Read this for:** Security architecture and compliance

---

## 🚀 Quick Start

### 1. Setup (5 minutes)
```bash
# Edit backend/.env
ADMIN_EMAILS=your-email@example.com

# Edit frontend/.env (optional)
VITE_ADMIN_EMAILS=your-email@example.com

# Restart services
docker-compose restart
```

### 2. Access
- Navigate to: `http://localhost:3000/admin`
- Log in with your admin account
- Explore the dashboard tabs

### 3. Common Tasks
- **Check AI costs:** Go to 🤖 AI Usage tab
- **Clear cache:** Go to 💾 Cache tab → Click "Clear Expired"
- **Monitor users:** Go to 👥 Users tab
- **View popular cities:** Go to 📊 Overview tab → Scroll to table

---

## 📊 What You Can Monitor

### System Health
✅ Database size and performance
✅ Cache hit rate and efficiency
✅ API usage patterns
✅ System health checks

### User Activity
✅ Total registered users
✅ Active users (last 30 days)
✅ New signups (last 7 days)
✅ Users with favorites

### Weather Data
✅ Most queried locations
✅ Total weather records
✅ Recently added cities
✅ Data source breakdown

### AI Usage & Costs
✅ Total AI queries
✅ Token usage (input + output)
✅ **Estimated costs in USD**
✅ Confidence level distribution
✅ Most popular shared answers

### Cache Performance
✅ Valid vs expired entries
✅ Cache hit rate (last 7 days)
✅ Breakdown by API source
✅ One-click cleanup tools

---

## 🔐 Security

### Access Control
- **Frontend:** Checks `VITE_ADMIN_EMAILS` (cosmetic)
- **Backend:** Enforces `ADMIN_EMAILS` (primary security)
- **Required:** Valid JWT token + admin email

### Best Practices
✅ Use strong passwords for admin accounts
✅ Limit admin emails to essential personnel
✅ Rotate access when personnel changes
✅ Monitor admin actions via logs
✅ Always use HTTPS in production

---

## 💰 AI Cost Tracking

### Pricing (Claude Sonnet 4.5)
- Input: $3 per million tokens
- Output: $15 per million tokens
- Average query: ~$0.005-0.01

### Example Costs
| Tokens | Cost |
|--------|------|
| 10,000 | ~$0.07 |
| 50,000 | ~$0.33 |
| 100,000 | ~$0.66 |
| 1M | ~$6.60 |

### Monitoring Tips
✅ Set budget alerts in Anthropic Console
✅ Review costs weekly in admin panel
✅ Monitor token usage trends
✅ Optimize prompts if costs spike

---

## 🗄️ Database Health

### Normal Table Sizes
| Table | Expected Size |
|-------|--------------|
| `weather_data` | 500-1000 MB |
| `api_cache` | 50-200 MB |
| `locations` | 5-20 MB |
| `users` | 1-5 MB |

### When to Take Action
- `weather_data` > 2 GB → Consider archiving
- `api_cache` > 500 MB → Clear expired entries
- Total DB > 5 GB → Review retention policies

---

## 💾 Cache Management

### Clear Expired Cache
**When:** Weekly or count > 1,000
**Impact:** ✅ Safe, frees space
**Action:** Click "🗑️ Clear Expired Cache"

### Clear All Cache
**When:** ⚠️ Emergency only
**Impact:** ❌ Next requests slower
**Action:** Click "⚠️ Clear All Cache" (confirmation required)

---

## 📡 API Endpoints

All require `Authorization: Bearer YOUR_JWT_TOKEN` header.

### Main Endpoints
- `GET /api/admin/stats` - All statistics
- `GET /api/admin/health` - System health
- `POST /api/admin/cache/clear-expired` - Clear expired cache
- `POST /api/admin/cache/clear-all` - Clear all cache

### Individual Statistics
- `GET /api/admin/database` - Database only
- `GET /api/admin/users` - Users only
- `GET /api/admin/weather` - Weather only
- `GET /api/admin/ai` - AI usage only
- `GET /api/admin/api-usage` - API stats only

---

## 🚨 Troubleshooting

### "Access Denied"
1. Check `ADMIN_EMAILS` in `backend/.env`
2. Verify email matches your account
3. Restart: `docker-compose restart`

### Slow Loading
1. Wait 10-15 seconds (normal for large datasets)
2. Click "↻ Refresh" to retry
3. Check database performance

### Missing Statistics
1. Add locations via search
2. Generate AI queries
3. Wait for data accumulation
4. Refresh admin panel

---

## 📈 Key Metrics to Watch

### Daily Checks
- Active users (last 24h)
- Cache hit rate
- API errors (if any)

### Weekly Review
- AI query count and costs
- New user signups
- Most queried locations
- Expired cache cleanup

### Monthly Analysis
- Total AI spend
- Database size growth
- User retention rate
- Cache performance trends

---

## 🎯 Common Workflows

### Check Monthly AI Costs
1. Navigate to **🤖 AI Usage** tab
2. Review "Estimated Cost" stat card
3. Compare to previous month
4. Adjust budget if needed

### Free Up Database Space
1. Navigate to **💾 Cache** tab
2. Click "🗑️ Clear Expired Cache"
3. Switch to **🗄️ Database** tab
4. Verify size reduction

### Find Popular Cities
1. Navigate to **📊 Overview** tab
2. Scroll to "Most Queried Locations" table
3. Review top 10 cities
4. Consider cache optimization

### Monitor User Growth
1. Navigate to **👥 Users** tab
2. Check "New Users (7 days)" stat
3. Compare to "Active (30 days)"
4. Calculate retention rate

---

## 🔮 Future Enhancements

### Planned Features
- [ ] Real-time WebSocket updates
- [ ] Export to CSV/PDF
- [ ] Custom date range filters
- [ ] Performance trend graphs
- [ ] Cost projection charts
- [ ] Email alerts for issues
- [ ] Automated maintenance tasks
- [ ] User activity timeline
- [ ] API rate limit monitoring

---

## 📞 Support

For questions or issues:
1. Check [ADMIN_PANEL.md](./ADMIN_PANEL.md) - Comprehensive guide
2. Check [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) - Quick fixes
3. Review server logs: `docker-compose logs backend`
4. Open GitHub issue: [meteo-weather/issues](https://github.com/mbuckingham74/meteo-weather/issues)

---

## 📚 Related Documentation

- **[Main README](../../README.md)** - Project overview
- **[CLAUDE.md](../../CLAUDE.md)** - AI assistant context
- **[Documentation Hub](../README.md)** - All docs
- **[Security](../security/)** - Security implementation
- **[Database](../database/)** - Database optimization
- **[Deployment](../deployment/)** - Production deployment

---

**Last Updated:** November 7, 2025
**Version:** 1.0.0
**Maintained by:** Michael Buckingham

**Quick Links:**
- 📘 [Full Guide](./ADMIN_PANEL.md)
- ⚡ [Quick Reference](./QUICK_REFERENCE.md)
- 📋 [Implementation Details](./IMPLEMENTATION_SUMMARY.md)
