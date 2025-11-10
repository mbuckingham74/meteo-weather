# Support

Need help with Meteo Weather App? We're here to help! 🌦️

---

## 📚 Documentation

**Start here for most questions:**

- **[Main README](README.md)** - Overview, features, and quick setup
- **[Documentation Hub](docs/README.md)** - Complete documentation organized by category
- **[Quick Start Guide](docs/getting-started/QUICKSTART.md)** - Get running in 3 minutes
- **[API Reference](docs/api/API_REFERENCE.md)** - Complete API documentation
- **[Troubleshooting Guide](docs/troubleshooting/TROUBLESHOOTING.md)** - Common issues and solutions

---

## ❓ Frequently Asked Questions (FAQ)

### Setup & Installation

**Q: How do I get started quickly?**
A: Follow our [3-minute Quick Start Guide](docs/getting-started/QUICKSTART.md). Just run:
```bash
git clone https://github.com/mbuckingham74/meteo-weather.git
cd meteo-weather
cp .env.example backend/.env
# Add your API keys to backend/.env
docker-compose up
```

**Q: Where do I get API keys?**
A: You need two **free** API keys:
- **Visual Crossing Weather API:** [Sign up here](https://www.visualcrossing.com/weather-api) (1,000 records/day free)
- **OpenWeather API:** [Sign up here](https://openweathermap.org/api) (1,000 calls/day free)
- **Optional - Anthropic Claude:** [Get key here](https://console.anthropic.com/) (for AI features, pay-as-you-go)

**Q: Why isn't my app starting?**
A: Common causes:
1. **Missing API keys** - Check `backend/.env` has valid keys
2. **Port conflicts** - Default ports: 3000 (frontend), 5001 (backend), 3307 (MySQL)
3. **Docker not running** - Ensure Docker Desktop is active
4. **Old containers** - Run `docker-compose down -v && docker-compose up --build`

**Q: How do I change the default ports?**
A: Edit `docker-compose.yml`:
```yaml
frontend:
  ports:
    - "3001:3000"  # Change 3001 to your preferred port
backend:
  ports:
    - "5002:5001"  # Change 5002 to your preferred port
```

**Q: Do I need both Docker AND Node.js installed?**
A: For Docker setup, you only need Docker. For local development without Docker, you need Node.js 14+. Docker is recommended for beginners.

---

### Features & Usage

**Q: Does the app work offline?**
A: Partial offline support:
- ✅ Previously viewed weather data (cached)
- ✅ UI and navigation
- ❌ New weather searches (requires internet)
- ❌ AI features (requires internet)

**Q: How accurate is the weather data?**
A: We use Visual Crossing Weather API, which aggregates data from:
- Government weather stations (NOAA, etc.)
- Airport observations
- Weather satellites
- Accuracy: 85-95% for 3-day forecasts, 70-80% for 7-day forecasts

**Q: What's the difference between "Current Weather" and "Forecast"?**
A:
- **Current Weather:** Real-time observations from the last 1-2 hours
- **Forecast:** Predicted weather for the next 3-14 days
- **Hourly Forecast:** Hour-by-hour predictions for the next 48-240 hours

**Q: How do I compare two cities?**
A: Use the Location Comparison feature:
1. Click "Compare Locations" in the header
2. Select two cities
3. Choose comparison type (side-by-side, temperature chart, climate analysis)
4. View detailed comparison with charts

**Q: Can I get weather notifications?**
A: Yes! For registered users:
1. Sign in or create an account
2. Go to Settings → Notifications
3. Enable daily/weekly reports or weather alerts
4. Add locations to monitor

**Q: What AI features are available?**
A: Two AI-powered tools:
1. **AI Weather Assistant** - Ask natural language questions like "Will it rain this weekend?"
2. **AI Location Finder** - Describe your ideal climate: "I want somewhere 15 degrees cooler with less humidity"

---

### Technical Questions

**Q: What tech stack does this use?**
A:
- **Frontend:** React 19.2.0 + Vite 6.0.7
- **Backend:** Node.js + Express 4.21.1
- **Database:** MySQL 8.0
- **Container:** Docker + Docker Compose
- **Full list:** [package.json](package.json)

**Q: Can I deploy this to production?**
A: Yes! See our [Deployment Guide](docs/deployment/DEPLOYMENT_GUIDE.md). Recommended platforms:
- VPS (DigitalOcean, Linode, Hostinger)
- AWS EC2 / Lightsail
- Self-hosted server
- Docker Swarm / Kubernetes

**Q: Is there a hosted version I can use?**
A: Yes! Production demo: [https://meteo-beta.tachyonfuture.com](https://meteo-beta.tachyonfuture.com)
- Note: This is a beta version for testing. For production use, self-host your own instance.

**Q: How much does it cost to run?**
A:
- **API costs:** $0/month (free tiers: Visual Crossing 1K/day, OpenWeather 1K/day)
- **AI features:** ~$0.005-0.01 per query (optional, only if you enable Claude API)
- **Hosting:** Variable ($5-20/month for VPS, free for self-hosted)
- **Total:** Can run completely free on free tiers!

**Q: Can I use this commercially?**
A: Yes! MIT License allows commercial use. Requirements:
- Include original MIT license text
- Respect API terms of service (Visual Crossing, OpenWeather)
- If modifying, you may want to change branding

**Q: Does this support multiple languages?**
A: Currently English only. Internationalization (i18n) is on the roadmap. Contributions welcome!

---

### Troubleshooting

**Q: I'm getting "API key invalid" errors**
A:
1. Check `.env` file has correct keys (no extra spaces, quotes)
2. Verify keys are active at provider's website
3. For OpenWeather: Keys can take 10 minutes to activate after signup
4. Restart backend: `docker-compose restart backend`

**Q: Frontend loads but shows "Cannot connect to backend"**
A:
1. Check backend is running: `docker ps | grep meteo-backend`
2. Check backend logs: `docker-compose logs backend`
3. Verify backend URL in browser: `http://localhost:5001/api/health`
4. Check firewall isn't blocking port 5001

**Q: Database connection errors**
A:
1. Verify MySQL container is running: `docker ps | grep meteo-mysql`
2. Check database credentials in `backend/.env` match `docker-compose.yml`
3. Try resetting database: `docker-compose down -v && docker-compose up`
4. Check MySQL logs: `docker-compose logs mysql`

**Q: "Old Location" or placeholder text appears**
A: This is a known regression bug with prevention systems in place:
- See: [Regression Prevention Guide](docs/troubleshooting/REGRESSION_PREVENTION.md)
- Should not occur in current version (fixed Nov 2025)
- If you see this, please report it immediately!

**Q: Weather radar not loading**
A:
1. Check OpenWeather API key is valid
2. Verify you're not exceeding rate limits (1,000/day free)
3. Try different map layer (precipitation, temperature, clouds)
4. Check browser console for specific errors (F12)

**Q: Build errors: "Cannot find module"**
A:
```bash
# Frontend
cd frontend
rm -rf node_modules package-lock.json
npm install

# Backend
cd backend
rm -rf node_modules package-lock.json
npm install
```

**Q: Tests are failing**
A:
1. Ensure all dependencies are installed: `npm run install:all`
2. Check Node version: `node --version` (should be 14+)
3. Run tests individually:
   - Frontend: `cd frontend && npm test`
   - Backend: `cd backend && npm test`
4. Check specific test output for errors

---

### Security & Privacy

**Q: Is my data secure?**
A: Yes! Security features:
- Passwords hashed with bcrypt (10 rounds)
- JWT authentication with refresh tokens
- Rate limiting (100/15min API, 5/15min auth)
- CORS protection with origin whitelist
- Helmet.js security headers
- SQL injection prevention (parameterized queries)
- **Security Score:** 9.4/10

**Q: What data do you collect?**
A: For self-hosted instances, YOU control all data:
- User accounts (email, password hash, preferences)
- Favorite locations
- Weather search history (cached)
- No tracking, analytics, or third-party data sharing
- Your data never leaves your server

**Q: Can I use this without creating an account?**
A: Yes! Anonymous features:
- Weather search and forecasts
- Radar maps
- Climate comparisons
- Historical data
**Requires account:** Saved favorites, notifications, cloud sync

**Q: How do I report a security vulnerability?**
A: Please report privately to **michael.buckingham74@gmail.com**
- Do NOT create public issues for security bugs
- We'll respond within 48 hours
- See [SECURITY.md](SECURITY.md) for full policy

---

### Contributing & Development

**Q: How can I contribute?**
A: We'd love your help!
1. Read [CONTRIBUTING.md](CONTRIBUTING.md)
2. Find an issue: [Good first issues](https://github.com/mbuckingham74/meteo-weather/labels/good-first-issue)
3. Fork, code, test, and submit a PR
4. All skill levels welcome!

**Q: What should I work on?**
A: High-priority areas:
- 🧪 Increase test coverage (currently 33.65% frontend, 60-65% backend)
- ♿ Accessibility improvements (WCAG 2.1 Level AAA)
- 🌐 Internationalization (multi-language support)
- 📱 Mobile app (React Native)
- 📊 More chart types and visualizations

**Q: How do I set up my development environment?**
A: Follow our [Developer Onboarding Guide](docs/getting-started/DEVELOPER_ONBOARDING.md):
1. Clone repo
2. Install dependencies: `npm run install:all`
3. Set up `.env` file
4. Run locally: `docker-compose up` OR `npm run dev`
5. Make changes, run tests, submit PR

**Q: Do you accept documentation improvements?**
A: Absolutely! Documentation is crucial:
- Fix typos, improve clarity
- Add examples, screenshots
- Translate to other languages
- Create video tutorials
- Write blog posts

**Q: What's the code review process?**
A:
1. Submit PR with clear description
2. Automated checks run (tests, linting, security)
3. Maintainer reviews within 2-5 business days
4. Address feedback if needed
5. Once approved, we merge!
6. You're added to contributors list 🎉

---

### Performance & Optimization

**Q: Why is the initial load slow?**
A: First load includes:
- React bundle (~200KB gzipped)
- Leaflet map library (~150KB)
- Chart libraries (~100KB)
- Total: ~450KB (typical for modern web apps)
**Improvements:** Subsequent loads are faster (browser caching)

**Q: How can I speed up API calls?**
A:
- We cache aggressively (99% cache hit rate in production)
- Current weather: 30-minute cache
- Forecasts: 6-hour cache
- Historical: 7-day cache
**Result:** Most requests return in <10ms from cache

**Q: Database performance seems slow**
A: Recent optimizations (Nov 2025):
- ✅ FULLTEXT index (20x faster text search)
- ✅ Spatial index (50x faster coordinate lookup)
- ✅ Table partitioning (10x faster date queries)
- ✅ Auto-cleanup (expired cache removal)
**If still slow:** Check [Database Optimization Guide](docs/database/OPTIMIZATION_COMPLETE.md)

**Q: Can I reduce memory usage?**
A: Yes, several options:
1. Reduce Docker memory limits in `docker-compose.yml`
2. Decrease cache TTL (expires_at settings)
3. Limit forecast days (3 instead of 14)
4. Disable unused features (radar, AI)

---

### API & Integration

**Q: Can I use the API programmatically?**
A: Yes! Full REST API documented:
- [API Reference](docs/api/API_REFERENCE.md) - Complete docs
- [OpenAPI Spec](docs/api/openapi.yaml) - Swagger/OpenAPI 3.0
- [Postman Collection](docs/api/postman_collection.json) - Ready to import

**Q: Is there a rate limit?**
A: Yes, to prevent abuse:
- General API: 100 requests / 15 minutes per IP
- Authentication: 5 requests / 15 minutes per IP
- AI endpoints: 10 requests / hour per user
**Exceeding limit:** 429 status code, retry after X seconds

**Q: Can I integrate this with Home Assistant / Node-RED?**
A: Yes! The REST API is compatible:
1. Get API URL: `http://your-server:5001/api`
2. Authenticate: POST `/auth/login` for token
3. Use token in `Authorization: Bearer <token>` header
4. Call endpoints: `/weather/current/{location}`, etc.

**Q: How do I get historical weather data?**
A: Use climate endpoints:
- `/weather/climate/normals/{location}` - Historical averages
- `/weather/climate/records/{location}` - Record highs/lows
- `/weather/climate/this-day/{location}` - This day in history
- [Climate API Docs](docs/api/API_REFERENCE.md#climate-data)

---

## 🐛 Found a Bug?

If you've discovered a bug, please help us fix it:

1. **Check if it's already reported:** [Search existing issues](https://github.com/mbuckingham74/meteo-weather/issues?q=is%3Aissue)
2. **Report it:** [Create a bug report](https://github.com/mbuckingham74/meteo-weather/issues/new?template=bug_report.md)
3. **Include:**
   - Clear description of the problem
   - Steps to reproduce
   - Expected vs. actual behavior
   - Screenshots (if applicable)
   - Environment details (OS, browser, Docker version)

**Security Vulnerabilities:** Please report security issues privately to **michael.buckingham74@gmail.com** (see [SECURITY.md](SECURITY.md))

---

## 💡 Have a Feature Request?

We'd love to hear your ideas!

1. **Check if it's already suggested:** [Search feature requests](https://github.com/mbuckingham74/meteo-weather/issues?q=is%3Aissue+label%3Aenhancement)
2. **Suggest it:** [Create a feature request](https://github.com/mbuckingham74/meteo-weather/issues/new?template=feature_request.md)
3. **Include:**
   - Clear use case (why is this needed?)
   - Proposed solution (how should it work?)
   - Alternatives considered
   - Additional context (mockups, examples)

---

## ❓ Have a Question?

**Before asking, check:**

1. **[README.md](README.md)** - Setup instructions and overview
2. **[Documentation](docs/README.md)** - Comprehensive guides
3. **[Troubleshooting](docs/troubleshooting/TROUBLESHOOTING.md)** - Common issues
4. **[FAQ Section in README](README.md#-project-status--roadmap)** - Frequently asked questions
5. **[Existing discussions](https://github.com/mbuckingham74/meteo-weather/discussions)** - Someone may have asked already

**Still need help?**

- **[GitHub Discussions](https://github.com/mbuckingham74/meteo-weather/discussions)** - Ask questions, share ideas
- **[Create a question issue](https://github.com/mbuckingham74/meteo-weather/issues/new?template=question.md)** - Get help from maintainers

---

## 🚀 Getting Started Support

### Common Setup Issues

**1. Docker Issues:**
- **Problem:** Containers won't start
- **Solution:** Check [Troubleshooting Guide](docs/troubleshooting/TROUBLESHOOTING.md#docker-issues)
- **Quick Fix:** Run `docker-compose down -v && docker-compose up --build`

**2. API Key Issues:**
- **Problem:** "API key invalid" errors
- **Solution:** Verify keys in `backend/.env` match [.env.example](.env.example)
- **Help:** [API Setup Guide](README.md#-required-external-apis)

**3. Database Connection Issues:**
- **Problem:** Backend can't connect to MySQL
- **Solution:** Check [Database Troubleshooting](docs/troubleshooting/TROUBLESHOOTING.md#database-connection-errors)
- **Quick Fix:** Ensure MySQL container is running: `docker ps | grep meteo-mysql`

**4. Frontend Build Issues:**
- **Problem:** Frontend won't compile
- **Solution:** Clear cache and rebuild
  ```bash
  cd frontend
  rm -rf node_modules package-lock.json
  npm install
  npm run build
  ```

**5. Port Conflicts:**
- **Problem:** "Port already in use" errors
- **Solution:** Change ports in `docker-compose.yml` or stop conflicting services
- **Default Ports:** Frontend (3000), Backend (5001), MySQL (3307)

---

## 📖 Documentation Quick Links

### By Topic

**Setup & Installation:**
- [Quick Start](docs/getting-started/QUICKSTART.md) - 3-minute Docker setup
- [Setup Guide](docs/getting-started/SETUP_GUIDE.md) - Detailed installation
- [Developer Onboarding](docs/getting-started/DEVELOPER_ONBOARDING.md) - Complete onboarding

**Development:**
- [Contributing Guide](CONTRIBUTING.md) - How to contribute
- [Code Style Guide](CONTRIBUTING.md#-code-style-guidelines) - Coding standards
- [Development Tools](docs/development/) - Dev guides and tools

**Deployment:**
- [Deploy Now](docs/deployment/DEPLOY_NOW.md) - Quick deploy
- [Deployment Guide](docs/deployment/DEPLOYMENT_GUIDE.md) - Complete deployment docs
- [Testing Checklist](docs/deployment/DEPLOYMENT_TESTING_CHECKLIST.md) - Verification steps

**API:**
- [API Reference](docs/api/API_REFERENCE.md) - Complete endpoint documentation
- [Backend Routes](backend/routes/) - Source code for all routes

**Security:**
- [Security Policy](SECURITY.md) - Reporting vulnerabilities
- [Security Implementation](docs/security/SECURITY_IMPLEMENTATION_SUMMARY.md) - Current security features
- [Rate Limiting Guide](docs/security/RATE_LIMITING_AND_SECURITY_AUDIT.md) - Security audit

**Accessibility:**
- [Accessibility Summary](docs/accessibility/AUDIT_SUMMARY.md) - Quick reference
- [WCAG Compliance](docs/accessibility/PHASE2_COMPLETE.md) - Level AA implementation

**Database:**
- [Schema Documentation](database/schema.sql) - Database structure
- [Migrations](database/migrations/) - Database changes
- [Optimization Guide](docs/database/OPTIMIZATION_COMPLETE.md) - Performance improvements

---

## 🛠️ For Contributors

**Want to contribute?** We'd love your help!

1. **Read:** [CONTRIBUTING.md](CONTRIBUTING.md)
2. **Find an issue:** [Good first issues](https://github.com/mbuckingham74/meteo-weather/labels/good-first-issue)
3. **Set up dev environment:** [Developer Setup](docs/getting-started/DEVELOPER_ONBOARDING.md)
4. **Code style:** [Style Guidelines](CONTRIBUTING.md#-code-style-guidelines)
5. **Submit PR:** [Pull Request Template](.github/PULL_REQUEST_TEMPLATE.md)

**Developer Resources:**
- [Architecture Documentation](docs/getting-started/ARCHITECTURE.md)
- [Testing Guide](.github/TESTING.md)
- [CI/CD Documentation](docs/cicd/DEVELOPER_GUIDE.md)
- [Repository Guidelines](docs/development/AGENTS.md)

---

## 💬 Community & Contact

### GitHub Resources

- **[Issues](https://github.com/mbuckingham74/meteo-weather/issues)** - Bug reports and feature requests
- **[Discussions](https://github.com/mbuckingham74/meteo-weather/discussions)** - Questions and general discussion
- **[Pull Requests](https://github.com/mbuckingham74/meteo-weather/pulls)** - Code contributions
- **[Projects](https://github.com/mbuckingham74/meteo-weather/projects)** - Roadmap and planning

### Direct Contact

- **Email:** michael.buckingham74@gmail.com
- **GitHub:** [@mbuckingham74](https://github.com/mbuckingham74)
- **Production Site:** [https://meteo-beta.tachyonfuture.com](https://meteo-beta.tachyonfuture.com)

**Response Times:**
- GitHub Issues: 2-5 business days
- Security Issues: Within 48 hours
- Pull Requests: 2-5 business days

---

## 📊 Project Status

**Current Version:** v1.1.0-security

**Key Metrics:**
- 476/476 tests passing ✅
- 0 vulnerabilities ✅
- Security score: 9.4/10 ✅
- Accessibility: WCAG 2.1 Level AA ✅
- Code quality: 9/10 ✅

**Recent Updates:**
- [CHANGELOG.md](CHANGELOG.md) - All changes
- [Release Notes](https://github.com/mbuckingham74/meteo-weather/releases) - Version releases

---

## 🎓 Learning Resources

**New to the project?**

1. **Day 1:** [Quick Start Guide](docs/getting-started/QUICKSTART.md)
2. **Week 1:** [Architecture Overview](docs/getting-started/ARCHITECTURE.md)
3. **Month 1:** [Contributing Guide](CONTRIBUTING.md) + Pick an issue

**Helpful Guides:**
- [Vite Migration Guide](docs/development/VITE_MIGRATION_GUIDE.md) - CRA → Vite
- [Refactoring Summary](docs/development/REFACTORING_SUMMARY.md) - Code organization
- [Regression Prevention](docs/troubleshooting/REGRESSION_PREVENTION.md) - Bug prevention

---

## 🔗 External Resources

**APIs Used:**
- [Visual Crossing Weather API](https://www.visualcrossing.com/weather-api) - Primary weather data
- [OpenWeather API](https://openweathermap.org/api) - Radar overlays
- [RainViewer API](https://www.rainviewer.com/api.html) - Precipitation radar
- [Anthropic Claude API](https://console.anthropic.com/) - AI features
- [Open-Meteo Air Quality API](https://open-meteo.com/en/docs/air-quality-api) - Air quality data

**Technologies:**
- [React Documentation](https://react.dev/) - Frontend framework
- [Vite Documentation](https://vitejs.dev/) - Build tool
- [Express.js Guide](https://expressjs.com/) - Backend framework
- [MySQL Documentation](https://dev.mysql.com/doc/) - Database
- [Docker Documentation](https://docs.docker.com/) - Containerization

---

## ⚠️ Known Issues

**Current known issues:** [View all issues](https://github.com/mbuckingham74/meteo-weather/issues)

**Critical Issues:** None currently

**Workarounds:**
- See [Troubleshooting Guide](docs/troubleshooting/TROUBLESHOOTING.md) for common issues

---

## 🙏 Thank You!

Thank you for using Meteo Weather App! Your feedback helps make this project better for everyone.

**Ways to help:**
- ⭐ [Star the repository](https://github.com/mbuckingham74/meteo-weather)
- 🐛 [Report bugs](https://github.com/mbuckingham74/meteo-weather/issues/new?template=bug_report.md)
- 💡 [Suggest features](https://github.com/mbuckingham74/meteo-weather/issues/new?template=feature_request.md)
- 📝 [Improve documentation](CONTRIBUTING.md)
- 💻 [Contribute code](CONTRIBUTING.md)
- 💬 [Share your experience](https://github.com/mbuckingham74/meteo-weather/discussions)

---

**Last Updated:** November 7, 2025
**Maintained by:** [Michael Buckingham](https://github.com/mbuckingham74)
