<div align="center">

# Meteo Weather App

> ### 🚧 **UI Redesign in Progress** 🚧
> Core functionality stable | UI actively evolving | [Live Demo](https://meteo-beta.tachyonfuture.com)

---

**Self-hostable weather dashboard with AI-powered insights, 10-year climate analysis, and interactive radar maps.**

---

[![Deployment Status](https://img.shields.io/github/actions/workflow/status/mbuckingham74/meteo-weather/deploy.yml?branch=main&label=deployment&logo=github-actions&logoColor=white)](https://github.com/mbuckingham74/meteo-weather/actions)
[![Security](https://img.shields.io/badge/vulnerabilities-0-brightgreen?logo=dependabot&logoColor=white)](https://github.com/mbuckingham74/meteo-weather/security)
[![Tests](https://img.shields.io/badge/tests-476%2F476%20passing-brightgreen?logo=jest&logoColor=white)](https://github.com/mbuckingham74/meteo-weather/actions)
[![Accessibility](https://img.shields.io/badge/WCAG%202.1-Level%20AA-blue?logo=w3c&logoColor=white)](#-accessibility)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Docker](https://img.shields.io/badge/docker-ready-%230db7ed.svg?logo=docker&logoColor=white)](#-quick-start)
[![Live Demo](https://img.shields.io/badge/demo-live-success?logo=vercel&logoColor=white)](https://meteo-beta.tachyonfuture.com)

**Built by [Michael Buckingham](https://github.com/mbuckingham74)** | **Inspired by [Weather Spark](https://weatherspark.com)**

</div>

---

<div align="center">

**Coming Soon - Full UI/UX redesign and refactor in progress.**

Check out the [live demo](https://meteo-beta.tachyonfuture.com) to see the current interface in action!

</div>

---

## ✨ Why Choose Meteo?

### For Users
- 🤖 **AI-First Interface** - Ask weather questions in plain English ("Will it rain this weekend?")
- 📊 **Deep Climate Analysis** - Compare cities with 10 years of historical data
- 🌧️ **Real-Time Radar** - Interactive precipitation maps with 2-hour history
- ♿ **Accessible to All** - WCAG 2.1 Level AA compliant, full screen reader support

### For Developers
- 📚 **Production-Grade Code** - Learn from real-world React + Node.js patterns
- 🔐 **Security First** - 9.4/10 score, 0 vulnerabilities, automated scanning
- 🧪 **Well-Tested** - 476/476 tests passing, comprehensive coverage
- 📖 **Comprehensive Docs** - 80+ organized guides covering everything

### For Self-Hosters
- 🐳 **Docker One-Command** - Get running in 3 minutes
- 💰 **Free to Run** - $0/month with free API tiers (1,000 requests/day)
- 📉 **Minimal Resources** - Runs on $6/month VPS (2GB RAM, 1 CPU)
- 🔒 **Your Data** - No telemetry, no tracking, full control

---

## ⚡ Quick Start

Get up and running in **3 minutes** with Docker:

```bash
# 1. Clone the repository
git clone https://github.com/mbuckingham74/meteo-weather.git
cd meteo-weather

# 2. Copy environment file and add your API keys
cp .env.example .env
# Edit .env - Add your FREE Visual Crossing API key

# 3. Start the application
docker-compose up

# 4. Open in browser
# Frontend: http://localhost:3000
# Backend API: http://localhost:5001
```

**That's it!** The app starts with pre-populated data for 148 cities.

### Get Your FREE API Keys (2 minutes)

- **Visual Crossing** (required) - [Sign up here](https://www.visualcrossing.com/weather-api) - 1,000 records/day free
- **OpenWeather** (required for radar) - [Sign up here](https://openweathermap.org/api) - 1,000 calls/day free
- **Anthropic Claude** (optional, AI features) - [Sign up here](https://console.anthropic.com/) - Pay-as-you-go (~$0.01/query)

**No API keys yet?** The app works out of the box with cached data for major cities!

→ [Full Setup Guide](docs/getting-started/QUICKSTART.md)

---

## 🌟 Key Features

### Core Weather
- 🌤️ **Multi-day forecasts** - 3, 7, or 14-day forecasts with hourly breakdowns
- 📊 **15+ interactive charts** - Temperature, precipitation, wind, UV, humidity, and more
- ⚠️ **Real-time weather alerts** - Severe weather warnings with map markers
- 💨 **Air quality monitoring** - Live AQI with 6 pollutant measurements
- 🌧️ **Interactive radar map** - Real historical precipitation data with animation

### AI & Analysis
- 🤖 **AI Weather Assistant** - Natural language queries powered by Claude Sonnet 4.5
- 🔍 **Smart Universal Search** - One input for locations AND AI questions
- 📈 **10-year climate analysis** - Historical trends and statistical insights
- 🌍 **Location comparison** - Compare weather across 2-4 cities side-by-side
- 🌍 **Weather Twins** - Find cities worldwide with similar current weather (NEW!)
- 🤖 **AI location finder** - Describe your ideal climate, get recommendations

### User Experience
- 🔐 **User accounts** - Cloud-synced favorites and preferences across devices
- 🎨 **Theme system** - Light, dark, and auto modes with full component coverage
- ♿ **Fully accessible** - WCAG 2.1 Level AA, keyboard navigation, screen readers
- 📱 **Mobile responsive** - Optimized for all device sizes
- 🔗 **Shareable URLs** - Direct links to any city's weather
- ⚙️ **User preferences** - Email notifications, report scheduling, customization

### Performance & Security
- ⚡ **99% cache hit rate** - MySQL-based caching, 282x faster responses
- 🔒 **Security score 9.4/10** - 0 vulnerabilities, automated scanning
- 🐳 **Docker ready** - One-command deployment
- 📉 **Minimal footprint** - Runs on $6/month VPS

→ [Complete Feature List](docs/FEATURES.md) | [Live Demo](https://meteo-beta.tachyonfuture.com)

---

## 📚 Documentation

All documentation is organized in the [docs/](docs/) folder:

| Category | Description | Link |
|----------|-------------|------|
| 🚀 **Getting Started** | Quickstart, architecture, onboarding | [View →](docs/getting-started/) |
| 📡 **API Reference** | Complete API docs (3 formats) | [View →](docs/api/) |
| 🔧 **Development** | Code guides, conventions, branching | [View →](docs/development/) |
| 🚀 **Deployment** | Production deployment guides | [View →](docs/deployment/) |
| 🔐 **Security** | Security features & audits (9.4/10) | [View →](docs/security/) |
| ♿ **Accessibility** | WCAG Level AA compliance docs | [View →](docs/accessibility/) |
| ⚙️ **CI/CD** | Pipeline optimization & guides | [View →](docs/cicd/) |
| 💾 **Database** | Schema, ERD, optimizations | [View →](docs/database/) |
| 🎨 **UI/UX** | Design system & guidelines | [View →](docs/ui-ux/) |
| ⚠️ **Troubleshooting** | Common issues & solutions | [View →](docs/troubleshooting/) |

**Most Popular:**
- 🎯 [3-Minute Quickstart](docs/getting-started/QUICKSTART.md)
- 📡 [API Reference](docs/api/API_REFERENCE.md) (with OpenAPI & Postman)
- 🗺️ [Product Roadmap](ROADMAP.md)
- 🤝 [Contributing Guide](CONTRIBUTING.md)
- 🔐 [Security Policy](SECURITY.md)
- ❓ [FAQ & Support](SUPPORT.md)

→ [Browse All Docs](docs/README.md)

---

## 🏗️ Tech Stack

<div align="center">

### Frontend
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![Recharts](https://img.shields.io/badge/Recharts-FF6492?style=for-the-badge&logo=react&logoColor=white)
![Leaflet](https://img.shields.io/badge/Leaflet-199900?style=for-the-badge&logo=leaflet&logoColor=white)

### Backend
![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-404D59?style=for-the-badge&logo=express&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-00000F?style=for-the-badge&logo=mysql&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)

### Infrastructure & APIs
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![GitHub Actions](https://img.shields.io/badge/GitHub_Actions-2088FF?style=for-the-badge&logo=github-actions&logoColor=white)
![Nginx](https://img.shields.io/badge/Nginx-009639?style=for-the-badge&logo=nginx&logoColor=white)
![Claude AI](https://img.shields.io/badge/Claude_AI-181818?style=for-the-badge&logo=anthropic&logoColor=white)

**APIs:** Visual Crossing Weather, OpenWeather, RainViewer, Claude AI, Open-Meteo Air Quality

</div>

→ [Architecture Details](docs/getting-started/ARCHITECTURE.md)

---

## 💻 Minimum Requirements

**Recommended for development:**
- **CPU:** 1-2 cores (2 GHz+)
- **RAM:** 2 GB minimum, 4 GB recommended
- **Storage:** 10 GB free space
- **OS:** Linux (Ubuntu 20.04+), macOS, or Windows with WSL2

**Production:** Successfully tested on DigitalOcean $6/month droplet (1 vCPU, 1 GB RAM)

**What you need installed:**
- Docker (20.10+) and Docker Compose (1.29+)
- Git - for cloning the repository

→ [Detailed Setup Guide](docs/getting-started/SETUP_GUIDE.md)

---

## 🔒 Security

**Security Score: 9.4/10** - Enterprise-grade security with 0 vulnerabilities

### Multi-Layer Protection
- ✅ **Gitleaks Secret Scanning** - Pre-commit hooks + GitHub Actions
- ✅ **Dependabot Monitoring** - Automated vulnerability detection & patching
- ✅ **npm Security Audits** - Regular dependency scanning
- ✅ **CodeQL Analysis** - Automated code security scanning
- ✅ **Rate Limiting** - Protects against abuse and API cost overruns
- ✅ **Security Headers** - CSP, HSTS, X-Frame-Options, etc.

**Current Status:**
- 0 vulnerabilities in production dependencies
- All 9 historical vulnerabilities patched
- Weekly automated security scans
- Automated Dependabot PRs for security updates

→ [Security Documentation](docs/security/SECURITY_IMPLEMENTATION_SUMMARY.md) | [Security Policy](SECURITY.md)

---

## ♿ Accessibility

**Accessibility Score: 8.5-9/10** - Full WCAG 2.1 Level AA compliance

### Standards Met
- ✅ **WCAG 2.1 Level A** - Foundation accessibility
- ✅ **WCAG 2.1 Level AA** - Enhanced accessibility (target standard)
- ✅ **WCAG 2.1 Level AAA** - Animation control (bonus)

### Features
- 🎯 **Screen reader support** - NVDA, JAWS, VoiceOver tested
- ⌨️ **Complete keyboard navigation** - All features accessible via keyboard
- 🎨 **Color contrast** - 4.5:1 minimum ratio throughout
- 🎬 **Motion control** - Respects prefers-reduced-motion
- 🔍 **Focus indicators** - Visible 3px purple outlines
- 💬 **Error suggestions** - 200+ contextual recovery hints

→ [Accessibility Audit](docs/accessibility/AUDIT_SUMMARY.md) | [WCAG Compliance](docs/accessibility/PHASE2_COMPLETE.md)

---

## 🤝 Contributing

We welcome contributions! This project follows **GitHub Flow** for a simple, effective workflow.

### Quick Start

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'feat: add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request (CI must pass before merge)

### What We're Looking For

- 🐛 Bug fixes
- ✨ New features
- 📚 Documentation improvements
- 🎨 UI/UX enhancements (especially needed!)
- ♿ Accessibility improvements
- 🧪 Test coverage increases

→ [Contributing Guide](CONTRIBUTING.md) | [Branching Strategy](docs/development/BRANCHING_STRATEGY.md) | [Code of Conduct](CODE_OF_CONDUCT.md)

**Good First Issues:** [View on GitHub](https://github.com/mbuckingham74/meteo-weather/labels/good%20first%20issue)

---

## 🗺️ Roadmap

**Recent Achievements:**
- ✅ Express 4 → 5 migration (Nov 2025)
- ✅ WCAG 2.1 Level AA compliance (Nov 2025)
- ✅ CI/CD optimization - 50-70% faster (Nov 2025)
- ✅ Database performance - 20-50x faster queries (Nov 2025)
- ✅ User-managed API keys for 7 AI providers (Nov 2025)

**Planned Features:**
- 📧 Email notifications for weather alerts
- 📱 Mobile app (React Native)
- 🌐 Multi-language support (i18n)
- 📊 Extended historical data (20+ years)
- 🛰️ Satellite imagery overlays
- 🌾 Pollen and allergen forecasts

→ [Full Roadmap](ROADMAP.md) | [Open Issues](https://github.com/mbuckingham74/meteo-weather/issues)

---

## 📄 License

MIT License - See [LICENSE](LICENSE) for details.

Feel free to use this project for learning, development, and production!

---

## 🙏 Acknowledgments

**Data Providers:**
- Weather data: [Visual Crossing Weather API](https://www.visualcrossing.com/)
- Radar data: [RainViewer API](https://www.rainviewer.com/)
- Map overlays: [OpenWeather API](https://openweathermap.org/)
- Air quality: [Open-Meteo Air Quality API](https://open-meteo.com/)
- AI: [Anthropic Claude](https://www.anthropic.com/)

**Inspiration:**
- Visualizations inspired by [Weather Spark](https://weatherspark.com/)

---

## 📞 Support

- 📖 [Documentation](docs/README.md)
- ❓ [FAQ & Support](SUPPORT.md)
- 🐛 [Report a Bug](https://github.com/mbuckingham74/meteo-weather/issues/new?template=bug_report.md)
- 💡 [Request a Feature](https://github.com/mbuckingham74/meteo-weather/issues/new?template=feature_request.md)
- 💬 [GitHub Discussions](https://github.com/mbuckingham74/meteo-weather/discussions)

---

<div align="center">

**Built with ❤️ by [Michael Buckingham](https://github.com/mbuckingham74)**

[⭐ Star on GitHub](https://github.com/mbuckingham74/meteo-weather) | [🚀 View Live Demo](https://meteo-beta.tachyonfuture.com) | [📚 Read the Docs](docs/README.md)

</div>
