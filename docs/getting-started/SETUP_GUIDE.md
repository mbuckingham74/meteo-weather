# Developer Setup Guide

**Complete guide to setting up Meteo Weather App for local development**

---

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 14.0.0 or higher ([Download](https://nodejs.org/))
- **npm** 6.0.0 or higher (comes with Node.js)
- **Docker** 20.10+ ([Download](https://www.docker.com/get-started))
- **Docker Compose** 1.29+ (usually bundled with Docker Desktop)
- **Git** ([Download](https://git-scm.com/downloads))

**Optional but recommended:**
- **Visual Studio Code** with extensions:
  - ESLint
  - Prettier
  - Docker
  - GitLens

---

## 🚀 Quick Start (5 minutes)

### 1. Clone the Repository

```bash
git clone https://github.com/mbuckingham74/meteo-weather.git
cd meteo-weather
```

### 2. Install Dependencies

From the root directory:

```bash
npm run install:all
```

This installs dependencies for root, frontend, and backend.

### 3. Set Up Environment Variables

```bash
# Copy the example environment file to project root
cp .env.example .env
```

Edit `.env` with your API keys (see [API Keys](#-getting-api-keys) section below).

**Minimum required for local development:**
```env
# Database
DB_HOST=localhost
DB_PORT=3307
DB_USER=root
DB_PASSWORD=rootpassword
DB_NAME=meteo_db

# Required API Key
VISUAL_CROSSING_API_KEY=your_key_here

# Required for Radar Maps
OPENWEATHER_API_KEY=your_key_here

# Optional - AI features won't work without this
ANTHROPIC_API_KEY=your_key_here
```

### 4. Start the Application

**Option A: Using Docker (Recommended)**
```bash
npm run dev
# or
docker-compose up
```

**Option B: Without Docker (Manual)**
```bash
# Terminal 1 - Start MySQL (you'll need MySQL installed)
mysql.server start

# Terminal 2 - Start Backend
cd backend
npm run dev

# Terminal 3 - Start Frontend
cd frontend
npm run dev
```

### 5. Access the Application

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5001
- **API Health Check:** http://localhost:5001/api/health

---

## 🔑 Getting API Keys

### Visual Crossing Weather API (Required)

1. Go to [Visual Crossing Weather](https://www.visualcrossing.com/weather-api)
2. Sign up for a free account
3. Navigate to your account page
4. Copy your API key
5. **Free tier:** 1,000 records/day

### OpenWeather API (Required for Radar)

1. Go to [OpenWeather](https://openweathermap.org/api)
2. Sign up for a free account
3. Go to API Keys section
4. Copy your API key (may take a few hours to activate)
5. **Free tier:** 1,000 calls/day

### Anthropic Claude API (Optional - AI Features)

1. Go to [Anthropic Console](https://console.anthropic.com/)
2. Sign up and add payment method
3. Create an API key
4. **Pricing:** ~$0.01 per AI query (pay-as-you-go)

---

## 🛠️ Development Workflow

### Available Commands

From the **root directory**, you can run:

#### Development
```bash
npm run dev                  # Start full stack with Docker
npm run dev:frontend         # Start frontend only
npm run dev:backend          # Start backend only
```

#### Testing
```bash
npm test                     # Run all tests (frontend + backend)
npm run test:frontend        # Run frontend tests only
npm run test:backend         # Run backend tests only
```

#### Code Quality
```bash
npm run lint                 # Lint all code
npm run lint:fix             # Auto-fix linting issues
npm run format               # Format all code with Prettier
npm run format:check         # Check formatting without changing files
```

#### Database
```bash
npm run db:init              # Initialize database
npm run db:schema            # Load database schema
npm run db:seed              # Seed database with sample data
```

#### Docker
```bash
npm run docker:build         # Build Docker images
npm run docker:up            # Start containers in detached mode
npm run docker:down          # Stop and remove containers
npm run docker:logs          # View container logs
npm run docker:restart       # Restart all containers
```

#### Security
```bash
npm run security:scan        # Run security verification script
npm run security:audit       # Run npm audit on all packages
```

### Pre-commit Hooks

We use Husky to run automatic checks before each commit:

1. **Linting & Formatting** - Auto-fixes code style issues
2. **Regression Tests** - Prevents critical bugs from being reintroduced

The hooks will:
- Run ESLint and Prettier on staged files
- Run critical regression tests if you modify specific files
- Auto-format code and re-stage files
- Block commits if critical tests fail

**To bypass hooks (not recommended):**
```bash
git commit --no-verify -m "message"
```

---

## 📁 Project Structure

```
meteo-app/
├── backend/              # Express.js API server
│   ├── config/           # Configuration files
│   ├── middleware/       # Express middleware
│   ├── models/           # Database models
│   ├── routes/           # API routes
│   ├── services/         # Business logic
│   ├── tests/            # Backend tests
│   └── server.js         # Entry point
│
├── frontend/             # React (Vite) application
│   ├── public/           # Static files
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── contexts/     # React contexts (state)
│   │   ├── hooks/        # Custom React hooks
│   │   ├── services/     # API clients
│   │   ├── styles/       # CSS files
│   │   ├── utils/        # Utility functions
│   │   └── App.jsx       # Main app component
│   └── vite.config.js    # Vite configuration
│
├── database/             # Database schema and migrations
│   ├── schema.sql        # Database structure
│   └── seed.sql          # Sample data
│
├── scripts/              # Deployment and utility scripts
├── docs/                 # Documentation
└── docker-compose.yml    # Local development setup
```

---

## 🔧 IDE Setup

### Visual Studio Code

**Recommended Extensions:**
1. **ESLint** (dbaeumer.vscode-eslint)
2. **Prettier** (esbenp.prettier-vscode)
3. **Docker** (ms-azuretools.vscode-docker)
4. **GitLens** (eamodio.gitlens)

**Recommended Settings** (`.vscode/settings.json`):
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "eslint.workingDirectories": [
    "frontend",
    "backend"
  ]
}
```

---

## 🐛 Troubleshooting

### Port Already in Use

If you see "port already in use" errors:

```bash
# Check what's using the port
lsof -i :3000  # Frontend
lsof -i :5001  # Backend
lsof -i :3307  # MySQL

# Kill the process
kill -9 <PID>
```

### Docker Issues

```bash
# Clean up Docker
docker-compose down -v     # Remove volumes
docker system prune -a     # Remove all unused containers/images

# Rebuild from scratch
docker-compose build --no-cache
docker-compose up
```

### Database Connection Issues

1. Ensure MySQL container is running: `docker ps`
2. Check database credentials in `backend/.env`
3. Try reinitializing: `npm run db:init`

### Module Not Found Errors

```bash
# Reinstall all dependencies
npm run install:all

# Or individually
cd frontend && npm install
cd ../backend && npm install
```

### Pre-commit Hook Failing

```bash
# Run the checks manually to see details
npm run lint:fix
npm run test:frontend
npm run test:backend
```

---

## 📚 Next Steps

- Read [ARCHITECTURE.md](../../ARCHITECTURE.md) to understand the system design
- Review [CONTRIBUTING.md](../../CONTRIBUTING.md) for contribution guidelines
- Check [docs/troubleshooting/REGRESSION_PREVENTION.md](../REGRESSION_PREVENTION.md) before modifying geolocation code
- Explore [TROUBLESHOOTING.md](../../TROUBLESHOOTING.md) for common issues

---

## 💬 Getting Help

- **Documentation Issues:** Check [docs/README.md](../README.md) for more guides
- **Bug Reports:** [GitHub Issues](https://github.com/mbuckingham74/meteo-weather/issues)
- **Questions:** [GitHub Discussions](https://github.com/mbuckingham74/meteo-weather/discussions)

---

**Last Updated:** November 5, 2025
