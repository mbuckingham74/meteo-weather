# Contributing to Meteo Weather App

Thank you for your interest in contributing to Meteo Weather App! We welcome contributions from the community.

---

## 🌟 How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the [existing issues](https://github.com/mbuckingham74/meteo-weather/issues) to avoid duplicates.

**When creating a bug report, include:**

- **Clear title and description**
- **Steps to reproduce** the behavior
- **Expected behavior** vs. what actually happened
- **Screenshots** if applicable
- **Environment details**: OS, browser, Docker version, Node.js version
- **Error messages** or logs from console/terminal

**Template:**
```
**Bug Description:**
A clear description of what the bug is.

**To Reproduce:**
1. Go to '...'
2. Click on '....'
3. See error

**Expected Behavior:**
What you expected to happen.

**Screenshots:**
If applicable, add screenshots.

**Environment:**
- OS: [e.g., macOS 14.0, Ubuntu 22.04]
- Browser: [e.g., Chrome 120, Firefox 121]
- Docker version: [e.g., 24.0.0]
- Node.js version: [e.g., 18.17.0]

**Additional Context:**
Any other relevant information.
```

### Suggesting Features

Feature suggestions are welcome! Please provide:

- **Clear use case** - Why is this feature needed?
- **Proposed solution** - How should it work?
- **Alternatives considered** - Other approaches you've thought about
- **Additional context** - Screenshots, mockups, or examples

### Pull Requests

**We follow [GitHub Flow](docs/development/BRANCHING_STRATEGY.md)** - a simple branching strategy with a protected `main` branch.

1. **Fork the repository** and create your branch from `main`
   ```bash
   git checkout main
   git pull origin main
   git checkout -b feature/your-feature-name
   ```

2. **Install dependencies:**
   ```bash
   npm run install:all
   ```

3. **Make your changes** with clear, descriptive commits
   - Use [conventional commits](https://www.conventionalcommits.org/) format
   - Examples: `feat:`, `fix:`, `docs:`, `refactor:`, `test:`

4. **Test your changes** thoroughly
   ```bash
   npm test              # Run all tests
   npm run lint          # Check code style
   npm run format:check  # Check formatting
   ```

5. **Update documentation** if needed (README, comments, etc.)

6. **Follow the code style** - Pre-commit hooks will auto-format your code

7. **Submit a pull request** with a clear description
   - CI tests must pass before merge
   - Main branch is protected and requires PRs
   - Squash merging preferred to keep clean history

**PR Template:**
```
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] All tests pass (`npm test`)
- [ ] New tests added for new features
- [ ] Manually tested locally

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review of code completed
- [ ] Comments added for complex logic
- [ ] Documentation updated
- [ ] No new warnings generated
```

---

## 🚀 Development Setup

### Prerequisites
- **Node.js** 14.0.0+ ([Download](https://nodejs.org/))
- **npm** 6.0.0+ (comes with Node.js)
- **Docker** 20.10+ ([Download](https://www.docker.com/get-started))
- **Docker Compose** 1.29+ (bundled with Docker Desktop)
- **Git** ([Download](https://git-scm.com/downloads))

### Quick Start

1. **Clone your fork:**
   ```bash
   git clone https://github.com/YOUR_USERNAME/meteo-weather.git
   cd meteo-weather
   ```

2. **Install all dependencies:**
   ```bash
   npm run install:all
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example backend/.env
   # Edit backend/.env with your API keys
   ```

4. **Start the application:**
   ```bash
   npm run dev
   # or
   docker-compose up
   ```

5. **Access the app:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5001

**For detailed setup instructions, see [docs/getting-started/SETUP_GUIDE.md](docs/getting-started/SETUP_GUIDE.md)**

### Running Tests

```bash
# Run all tests
npm test

# Frontend tests only
npm run test:frontend

# Backend tests only
npm run test:backend

# Watch mode
cd frontend && npm run test:watch
cd backend && npm run test:watch
```

---

## 📝 Code Style Guidelines

### Automated Code Quality

We use **ESLint** and **Prettier** to maintain consistent code style. Pre-commit hooks automatically:
- Format your code with Prettier
- Fix ESLint issues when possible
- Run regression tests on critical files

**Manual commands:**
```bash
npm run lint          # Check linting
npm run lint:fix      # Auto-fix linting issues
npm run format        # Format all code
npm run format:check  # Check formatting without changes
```

### General Principles
- Write **clear, self-documenting code**
- Add **comments for complex logic** (especially algorithms)
- Keep functions **small and focused** (< 50 lines ideally)
- Use **meaningful variable names** (no single letters except i, j in loops)
- Avoid **code duplication** - create reusable utilities

### Frontend (React + Vite)

**File Organization:**
- Use **functional components** with hooks
- Place components in `frontend/src/components/`
- Place utilities in `frontend/src/utils/`
- Place hooks in `frontend/src/hooks/`
- Place services in `frontend/src/services/`

**Code Style:**
- Use **ES6+ modules** (`import/export`)
- Use **async/await** for asynchronous operations
- Use **React hooks** (useState, useEffect, useContext, custom hooks)
- Keep **JSX readable** with proper indentation
- Use **environment variables** with `VITE_` prefix

**Example:**
```jsx
// Good
import { useState, useEffect } from 'react';
import { fetchWeatherData } from '../services/weatherService';

const WeatherCard = ({ location }) => {
  const [weather, setWeather] = useState(null);

  useEffect(() => {
    const loadWeather = async () => {
      const data = await fetchWeatherData(location);
      setWeather(data);
    };
    loadWeather();
  }, [location]);

  return <div>{weather?.temperature}°</div>;
};

export default WeatherCard;
```

### Backend (Node.js/Express)

**File Organization:**
- Routes in `backend/routes/`
- Business logic in `backend/services/`
- Database models in `backend/models/`
- Middleware in `backend/middleware/`

**Code Style:**
- Use **CommonJS modules** (`require/module.exports`)
- Implement **error handling** for all API endpoints
- Add **input validation** for user data
- Use **async/await** consistently
- Use **try/catch** blocks for error handling

**Example:**
```javascript
// Good
const express = require('express');
const weatherService = require('../services/weatherService');

const router = express.Router();

router.get('/weather/:city', async (req, res) => {
  try {
    const { city } = req.params;
    const weatherData = await weatherService.getWeatherForCity(city);
    res.json(weatherData);
  } catch (error) {
    console.error('Error fetching weather:', error);
    res.status(500).json({ error: 'Failed to fetch weather data' });
  }
});

module.exports = router;
```

### Database

- Write **clear SQL queries** with proper formatting
- Use **prepared statements** to prevent SQL injection
- Add **indexes** for frequently queried columns
- Document schema changes in `database/migrations/`

### CSS

- Use **CSS variables** for theming (defined in `frontend/src/styles/themes.css`)
- Support **both light and dark modes**
- Keep styles **component-specific** (e.g., `WeatherCard.css`)
- Use **meaningful class names** (BEM methodology preferred)
- **Import order matters** - density overrides must be imported last

### Commit Messages

Use [Conventional Commits](https://www.conventionalcommits.org/) format:

```
<type>: <description>

[optional body]

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

**Types:**
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation only
- `style:` - Code style changes (formatting, etc.)
- `refactor:` - Code refactoring
- `test:` - Adding/updating tests
- `chore:` - Maintenance tasks

**Examples:**
```
feat: Add weather radar animation controls

fix: Resolve "Old Location" bug in geolocation service

docs: Update setup guide with API key instructions

refactor: Split WeatherDashboard into smaller components
```

---

## 🔍 What We're Looking For

### High Priority Contributions
- 🐛 **Bug fixes** - Especially browser compatibility issues
- 📚 **Documentation improvements** - Better setup guides, API docs
- ♿ **Accessibility improvements** - ARIA labels, keyboard navigation
- 🌐 **Internationalization** - Multi-language support
- 🧪 **Test coverage** - Unit tests, integration tests

### Feature Ideas
- 📊 More chart types and visualizations
- 🌍 Additional location search providers
- 📱 Mobile app (React Native)
- 🔔 Push notifications for weather alerts
- 📈 Advanced climate comparison algorithms
- 🎨 More theme options
- 🔌 Plugin system for extending functionality

### Good First Issues
Look for issues tagged with `good-first-issue` - these are beginner-friendly tasks perfect for first-time contributors.

---

## ⚠️ Critical Files - Read Before Modifying

Some files have regression tests that run automatically:

- **`frontend/src/services/geolocationService.js`** - See [docs/troubleshooting/REGRESSION_PREVENTION.md](docs/troubleshooting/REGRESSION_PREVENTION.md)
- **`frontend/src/contexts/LocationContext.jsx`** - See [docs/troubleshooting/REGRESSION_PREVENTION.md](docs/troubleshooting/REGRESSION_PREVENTION.md)
- **`backend/services/weatherService.js`** - See [docs/troubleshooting/REGRESSION_PREVENTION.md](docs/troubleshooting/REGRESSION_PREVENTION.md)

If you modify these files, the pre-commit hook will run regression tests to prevent the "Old Location" bug from being reintroduced.

---

## 🤝 Code Review Process

1. Maintainers will review your PR within **2-5 business days**
2. We may request changes or ask questions
3. Once approved, your PR will be merged
4. You'll be added to the contributors list!

---

## 💬 Communication

- **GitHub Issues** - Bug reports and feature requests
- **GitHub Discussions** - Questions and general discussion
- **Pull Requests** - Code contributions

---

## 📜 License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

## 🙏 Recognition

All contributors will be recognized in:
- GitHub's contributor graph
- Release notes (for significant contributions)
- Our README contributors section

---

## ❓ Questions?

Don't hesitate to ask questions in:
- GitHub Issues (tag with `question`)
- GitHub Discussions
- Pull request comments

---

## 📚 Additional Resources

- **[Branching Strategy](docs/development/BRANCHING_STRATEGY.md)** - **GitHub Flow workflow guide**
- **[Developer Setup Guide](docs/getting-started/SETUP_GUIDE.md)** - Comprehensive setup instructions
- **[Architecture Documentation](ARCHITECTURE.md)** - System design and architecture
- **[Troubleshooting Guide](TROUBLESHOOTING.md)** - Common issues and solutions
- **[Regression Prevention](docs/troubleshooting/REGRESSION_PREVENTION.md)** - Critical bug prevention

---

Thank you for contributing to Meteo Weather App! 🌦️

**Last Updated:** November 10, 2025
