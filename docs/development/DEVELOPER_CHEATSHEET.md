# Developer Cheat Sheet

**Quick reference for common development tasks**

---

## 🚀 Quick Commands

### Setup & Installation
```bash
git clone https://github.com/mbuckingham74/meteo-weather.git
cd meteo-weather
npm run install:all          # Install all dependencies
cp .env.example backend/.env # Copy environment template
```

### Development
```bash
npm run dev                  # Start full stack with Docker
npm run dev:frontend         # Frontend only (port 3000)
npm run dev:backend          # Backend only (port 5001)
```

### Testing
```bash
npm test                     # Run all tests
npm run test:frontend        # Frontend tests only
npm run test:backend         # Backend tests only
```

### Code Quality
```bash
npm run lint                 # Check all code
npm run lint:fix             # Auto-fix issues
npm run format               # Format all code
npm run format:check         # Check without changes
```

### Database
```bash
npm run db:init              # Initialize database
npm run db:schema            # Load schema
npm run db:seed              # Seed sample data
```

### Docker
```bash
npm run docker:build         # Build images
npm run docker:up            # Start containers (detached)
npm run docker:down          # Stop containers
npm run docker:logs          # View logs
npm run docker:restart       # Restart all containers
```

### Security
```bash
npm run security:scan        # Run security checks
npm run security:audit       # Audit dependencies
```

### Deployment
```bash
npm run build                # Build frontend for production
npm run deploy:beta          # Deploy to beta server
npm run verify:production    # Test production APIs
```

---

## 📁 Directory Structure

```
meteo-app/
├── backend/
│   ├── config/              # Configuration
│   ├── middleware/          # Express middleware
│   ├── models/              # Database models
│   ├── routes/              # API routes
│   ├── services/            # Business logic
│   ├── tests/               # Backend tests
│   └── server.js            # Entry point
│
├── frontend/
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── contexts/        # React contexts
│   │   ├── hooks/           # Custom hooks
│   │   ├── services/        # API clients
│   │   ├── styles/          # CSS files
│   │   └── utils/           # Utilities
│   └── vite.config.js       # Vite config
│
├── database/
│   ├── schema.sql           # DB schema
│   └── seed.sql             # Sample data
│
├── scripts/                 # Deployment scripts
├── docs/                    # Documentation
└── .husky/                  # Git hooks
```

---

## 🔑 Environment Variables

### Required for Local Dev
```env
# Database
DB_HOST=localhost
DB_PORT=3307
DB_USER=root
DB_PASSWORD=rootpassword
DB_NAME=meteo_db

# APIs
VISUAL_CROSSING_API_KEY=your_key_here
OPENWEATHER_API_KEY=your_key_here
ANTHROPIC_API_KEY=your_key_here  # Optional
```

### Frontend (VITE_ prefix)
```env
VITE_API_URL=http://localhost:5001/api
VITE_OPENWEATHER_API_KEY=your_key_here
```

---

## 🌐 Local URLs

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5001
- **API Health:** http://localhost:5001/api/health
- **MySQL:** localhost:3307

---

## 🐛 Common Issues & Fixes

### Port Already in Use
```bash
lsof -i :3000                # Check frontend port
lsof -i :5001                # Check backend port
kill -9 <PID>                # Kill process
```

### Docker Issues
```bash
docker-compose down -v       # Remove volumes
docker system prune -a       # Clean all
docker-compose build --no-cache
```

### Module Not Found
```bash
npm run install:all          # Reinstall everything
```

### Pre-commit Hook Failing
```bash
npm run lint:fix             # Fix linting
npm test                     # Check tests
```

### Database Connection Failed
```bash
docker ps                    # Check MySQL running
npm run db:init              # Reinitialize DB
```

---

## 🧪 Testing Patterns

### Frontend Test
```javascript
import { render, screen } from '@testing-library/react';
import MyComponent from './MyComponent';

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });
});
```

### Backend Test
```javascript
const request = require('supertest');
const app = require('../server');

describe('GET /api/weather', () => {
  it('returns weather data', async () => {
    const res = await request(app).get('/api/weather/Seattle');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('temperature');
  });
});
```

---

## 📝 Git Workflow

### Create Feature Branch
```bash
git checkout -b feature/my-feature
```

### Commit Changes
```bash
git add .
git commit -m "feat: Add my awesome feature"
# Pre-commit hooks run automatically
```

### Push & Create PR
```bash
git push origin feature/my-feature
# Create PR on GitHub
```

### Sync with Main
```bash
git checkout main
git pull origin main
git checkout feature/my-feature
git rebase main
```

---

## 🎨 Code Style Quick Tips

### Frontend (React)
- Use functional components with hooks
- ES6+ modules (`import/export`)
- Environment vars: `VITE_` prefix
- Place components in `frontend/src/components/`

### Backend (Node.js)
- CommonJS modules (`require/module.exports`)
- Always use try/catch for async routes
- Place routes in `backend/routes/`
- Place logic in `backend/services/`

### Both
- Use meaningful variable names
- Keep functions < 50 lines
- Add comments for complex logic
- Use Prettier for formatting
- Use ESLint for linting

---

## ⚠️ Critical Files (Regression Tests)

Modifying these files triggers automatic regression tests:
- `frontend/src/services/geolocationService.js`
- `frontend/src/contexts/LocationContext.jsx`
- `backend/services/weatherService.js`

See [docs/troubleshooting/REGRESSION_PREVENTION.md](../REGRESSION_PREVENTION.md)

---

## 🔍 Debugging

### Frontend Debugging
```javascript
// Use browser DevTools console
console.log('Debug:', data);

// React DevTools extension
// Check Components & Profiler tabs
```

### Backend Debugging
```javascript
// Add to backend code
console.log('Request received:', req.body);

// Check Docker logs
docker-compose logs -f backend
```

### Database Debugging
```bash
# Connect to MySQL
docker exec -it meteo-mysql-1 mysql -u root -p

# Run queries
USE meteo_db;
SELECT * FROM locations LIMIT 10;
```

---

## 📦 Package Management

### Add New Package
```bash
# Frontend
cd frontend && npm install package-name

# Backend
cd backend && npm install package-name
```

### Update Packages
```bash
# Check outdated
npm outdated

# Update all
npm update

# Update specific package
npm install package-name@latest
```

### Security Audit
```bash
npm audit
npm audit fix
npm audit fix --force  # Use with caution
```

---

## 🚢 Deployment Checklist

- [ ] All tests pass (`npm test`)
- [ ] Linting passes (`npm run lint`)
- [ ] Build succeeds (`npm run build`)
- [ ] Environment variables set correctly
- [ ] Database migrations applied
- [ ] Security scan passed (`npm run security:scan`)
- [ ] Manually tested locally
- [ ] PR reviewed and approved

---

## 📚 Additional Resources

- **Setup Guide:** [docs/getting-started/SETUP_GUIDE.md](SETUP_GUIDE.md)
- **Contributing:** [CONTRIBUTING.md](../../CONTRIBUTING.md)
- **Architecture:** [ARCHITECTURE.md](../../ARCHITECTURE.md)
- **Troubleshooting:** [TROUBLESHOOTING.md](../../TROUBLESHOOTING.md)

---

**Keep this page open while developing for quick reference!**

**Last Updated:** November 5, 2025
