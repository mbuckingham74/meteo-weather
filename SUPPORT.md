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
