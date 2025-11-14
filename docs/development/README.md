# Developer Documentation

**Essential guides for contributing to Meteo Weather App**

---

## 📚 Getting Started

**New to the project? Start here:**

1. **[Setup Guide](SETUP_GUIDE.md)** - Complete installation and setup instructions
2. **[Architecture Walkthrough](ARCHITECTURE_WALKTHROUGH.md)** - Codebase tour for new developers
3. **[Developer Cheat Sheet](DEVELOPER_CHEATSHEET.md)** - Quick reference for common tasks

---

## 📖 Documentation Index

### For New Contributors
- **[Setup Guide](SETUP_GUIDE.md)** - Prerequisites, installation, and first run
- **[Contributing Guide](../../CONTRIBUTING.md)** - How to contribute code
- **[Architecture Walkthrough](ARCHITECTURE_WALKTHROUGH.md)** - Understanding the codebase
- **[Developer Cheat Sheet](DEVELOPER_CHEATSHEET.md)** - Quick command reference

### Project Documentation
- **[Architecture](../../ARCHITECTURE.md)** - System design and diagrams
- **[Troubleshooting](../../TROUBLESHOOTING.md)** - Common issues and solutions
- **[Regression Prevention](../REGRESSION_PREVENTION.md)** - Critical bug prevention

### Specialized Guides
- **[AGENTS.md](AGENTS.md)** - Working with AI agents
- **[API Architecture Improvements](API_ARCHITECTURE_IMPROVEMENTS.md)** - Centralized API client (P0-P3A)
- **[Build Validation](../BUILD_VALIDATION.md)** - Build configuration validation
- **[Security Audit](../RATE_LIMITING_AND_SECURITY_AUDIT.md)** - Security implementation
- **[Error Message Style Guide](../ERROR_MESSAGE_STYLE_GUIDE.md)** - Error handling standards

---

## 🚀 Quick Start

```bash
# Clone and setup
git clone https://github.com/mbuckingham74/meteo-weather.git
cd meteo-weather
npm run install:all

# Configure environment
cp .env.example backend/.env
# Edit backend/.env with your API keys

# Start development
npm run dev
```

**Access at:**
- Frontend: http://localhost:3000
- Backend: http://localhost:5001

---

## 📋 Common Commands

```bash
# Development
npm run dev                  # Start full stack
npm run dev:frontend         # Frontend only
npm run dev:backend          # Backend only

# Testing
npm test                     # Run all tests
npm run lint                 # Check code style
npm run format               # Format code

# Database
npm run db:init              # Initialize database
npm run db:seed              # Load sample data
```

**See [Developer Cheat Sheet](DEVELOPER_CHEATSHEET.md) for complete command reference**

---

## 🏗️ Architecture Overview

```
Frontend (React + Vite) ──► Backend (Express) ──► Database (MySQL)
     Port 3000                 Port 5001            Port 3307
```

**Read [Architecture Walkthrough](ARCHITECTURE_WALKTHROUGH.md) for detailed explanation**

---

## 📝 Code Style

- **Frontend:** React functional components, ES6+ modules
- **Backend:** Node.js/Express, CommonJS modules
- **Linting:** ESLint + Prettier (auto-format on commit)
- **Testing:** Vitest (frontend), Jest (backend)

**See [Contributing Guide](../../CONTRIBUTING.md) for detailed style guidelines**

---

## ⚠️ Before You Start

### Critical Files with Regression Tests
If you modify these files, regression tests run automatically:
- `frontend/src/services/geolocationService.js`
- `frontend/src/contexts/LocationContext.jsx`
- `backend/services/weatherService.js`

**Read [Regression Prevention](../REGRESSION_PREVENTION.md) before modifying these files**

---

## 🤝 Contributing Workflow

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests and linting (`npm test && npm run lint`)
5. Commit with conventional commits (`feat:`, `fix:`, etc.)
6. Push to your fork
7. Open a Pull Request

**See [Contributing Guide](../../CONTRIBUTING.md) for detailed workflow**

---

## 🐛 Troubleshooting

Common issues and solutions:

- **Port conflicts** - Use `lsof -i :PORT` to find and kill processes
- **Docker issues** - Run `docker-compose down -v` to clean up
- **Module errors** - Run `npm run install:all` to reinstall dependencies
- **Database errors** - Run `npm run db:init` to reinitialize

**See [Troubleshooting Guide](../../TROUBLESHOOTING.md) for more solutions**

---

## 💬 Getting Help

- **Setup Issues:** Check [Setup Guide](SETUP_GUIDE.md) and [Troubleshooting](../../TROUBLESHOOTING.md)
- **Architecture Questions:** Read [Architecture Walkthrough](ARCHITECTURE_WALKTHROUGH.md)
- **Bug Reports:** [GitHub Issues](https://github.com/mbuckingham74/meteo-weather/issues)
- **General Questions:** [GitHub Discussions](https://github.com/mbuckingham74/meteo-weather/discussions)

---

## 📚 External Resources

- **React Docs:** https://react.dev/
- **Vite Docs:** https://vitejs.dev/
- **Express Docs:** https://expressjs.com/
- **MySQL Docs:** https://dev.mysql.com/doc/

---

**Happy coding! 🌦️**

**Last Updated:** November 14, 2025
