# Architecture Walkthrough for Developers

**A guided tour through Meteo Weather App's codebase for new contributors**

---

## 🎯 Overview

Meteo is a full-stack weather application with:
- **Frontend:** React 19.2 (Vite) - Single-page application
- **Backend:** Node.js/Express - RESTful API server
- **Database:** MySQL 8.0 - Relational data storage
- **Deployment:** Docker Compose - Containerized deployment

---

## 🏗️ High-Level Architecture

```
┌─────────────┐
│   Browser   │
└──────┬──────┘
       │ HTTP/HTTPS
       ▼
┌─────────────────┐
│  React Frontend │ (Port 3000)
│  (Vite + React) │
└────────┬────────┘
         │ REST API calls
         ▼
┌─────────────────┐
│ Express Backend │ (Port 5001)
│  (Node.js API)  │
└────────┬────────┘
         │ SQL queries
         ▼
┌─────────────────┐
│ MySQL Database  │ (Port 3307)
│  (Persistent)   │
└─────────────────┘
```

---

## 📂 Frontend Architecture

### Directory Structure
```
frontend/src/
├── components/        # React UI components
├── contexts/          # React Context API (global state)
├── hooks/             # Custom React hooks
├── services/          # API clients & external services
├── utils/             # Helper functions
├── styles/            # CSS files
└── App.jsx            # Main application component
```

### Key Concepts

#### 1. **Components** (`/components`)
Reusable UI building blocks.

**Example: WeatherCard**
```jsx
// frontend/src/components/WeatherCard.jsx
const WeatherCard = ({ temperature, location }) => {
  return (
    <div className="weather-card">
      <h2>{location}</h2>
      <p>{temperature}°</p>
    </div>
  );
};
```

**Major Components:**
- `WeatherDashboard.jsx` - Main weather display
- `RadarMap.jsx` - Interactive precipitation radar
- `SearchBar.jsx` - Location search interface
- `ErrorMessage.jsx` - Error display system

#### 2. **Contexts** (`/contexts`)
Global state management using React Context API.

**Example: LocationContext**
```jsx
// frontend/src/contexts/LocationContext.jsx
const LocationContext = createContext();

export const LocationProvider = ({ children }) => {
  const [currentLocation, setCurrentLocation] = useState(null);

  return (
    <LocationContext.Provider value={{ currentLocation, setCurrentLocation }}>
      {children}
    </LocationContext.Provider>
  );
};
```

**Available Contexts:**
- `LocationContext` - Current location state
- `AuthContext` - User authentication state
- `ThemeContext` - Light/dark theme
- `TemperatureUnitContext` - °F/°C preference

#### 3. **Services** (`/services`)
API clients and external service integrations.

**Example: weatherService**
```javascript
// frontend/src/services/weatherService.js
export const fetchWeatherData = async (location) => {
  const response = await axios.get(`${API_URL}/weather/${location}`);
  return response.data;
};
```

**Key Services:**
- `weatherService.js` - Weather data API calls
- `geolocationService.js` - Browser geolocation
- `aiService.js` - AI chat integration
- `authService.js` - User authentication

#### 4. **Hooks** (`/hooks`)
Custom React hooks for reusable logic.

**Example: useWeatherData**
```javascript
// frontend/src/hooks/useWeatherData.js
export const useWeatherData = (location) => {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadWeather = async () => {
      setLoading(true);
      const data = await fetchWeatherData(location);
      setWeather(data);
      setLoading(false);
    };
    loadWeather();
  }, [location]);

  return { weather, loading };
};
```

**Available Hooks:**
- `useWeatherData` - Fetch weather data
- `useOnlineStatus` - Network connectivity
- `useRetryHandler` - Retry failed requests
- `useLocationConfirmation` - Location selection flow

#### 5. **Utils** (`/utils`)
Shared utility functions.

**Example: debugLogger**
```javascript
// frontend/src/utils/debugLogger.js
export const debugLogger = {
  log: (message, data) => {
    if (import.meta.env.DEV) {
      console.log(message, data);
    }
  }
};
```

**Key Utils:**
- `debugLogger.js` - Environment-aware logging
- `errorHandler.js` - Centralized error handling
- `formatters.js` - Data formatting utilities

---

## 🔙 Backend Architecture

### Directory Structure
```
backend/
├── config/            # Configuration files
├── middleware/        # Express middleware
├── models/            # Database models
├── routes/            # API route handlers
├── services/          # Business logic
├── tests/             # Backend tests
└── server.js          # Application entry point
```

### Request Flow

```
1. Client Request
   ↓
2. Express Middleware (CORS, Rate Limiting, Security Headers)
   ↓
3. Route Handler (routes/*.js)
   ↓
4. Service Layer (services/*.js) - Business Logic
   ↓
5. Database Model (models/*.js) - Data Access
   ↓
6. MySQL Database
   ↓
7. Response sent back to client
```

### Key Components

#### 1. **Routes** (`/routes`)
Define API endpoints and handle HTTP requests.

**Example: weatherRoutes**
```javascript
// backend/routes/weatherRoutes.js
const express = require('express');
const weatherService = require('../services/weatherService');

const router = express.Router();

router.get('/weather/:city', async (req, res) => {
  try {
    const { city } = req.params;
    const data = await weatherService.getWeatherForCity(city);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
```

**Available Routes:**
- `weatherRoutes.js` - Weather data endpoints
- `authRoutes.js` - Authentication
- `locationRoutes.js` - Location management
- `aiRoutes.js` - AI chat interface

#### 2. **Services** (`/services`)
Contains business logic, separated from route handlers.

**Example: weatherService**
```javascript
// backend/services/weatherService.js
const axios = require('axios');

const getWeatherForCity = async (city) => {
  const apiKey = process.env.VISUAL_CROSSING_API_KEY;
  const url = `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${city}`;

  const response = await axios.get(url, {
    params: { key: apiKey }
  });

  return processWeatherData(response.data);
};

module.exports = { getWeatherForCity };
```

**Key Services:**
- `weatherService.js` - Weather data fetching & processing
- `aiService.js` - Claude AI integration
- `cacheService.js` - Redis-like caching
- `emailService.js` - Email notifications

#### 3. **Middleware** (`/middleware`)
Express middleware for request processing.

**Example: rateLimiter**
```javascript
// backend/middleware/rateLimiter.js
const rateLimit = require('express-rate-limit');

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: 'Too many requests from this IP'
});

module.exports = { apiLimiter };
```

**Available Middleware:**
- `rateLimiter.js` - API rate limiting
- `auth.js` - JWT authentication
- `errorHandler.js` - Error handling
- `validateInput.js` - Input validation

#### 4. **Models** (`/models`)
Database interaction layer.

**Example: Location model**
```javascript
// backend/models/Location.js
const db = require('../config/database');

class Location {
  static async findByName(name) {
    const [rows] = await db.query(
      'SELECT * FROM locations WHERE name = ?',
      [name]
    );
    return rows[0];
  }

  static async create(locationData) {
    const [result] = await db.query(
      'INSERT INTO locations SET ?',
      locationData
    );
    return result.insertId;
  }
}

module.exports = Location;
```

---

## 💾 Database Schema

### Key Tables

**locations**
```sql
CREATE TABLE locations (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  country VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**weather_data**
```sql
CREATE TABLE weather_data (
  id INT PRIMARY KEY AUTO_INCREMENT,
  location_id INT,
  temperature DECIMAL(5,2),
  humidity INT,
  conditions VARCHAR(100),
  timestamp DATETIME,
  FOREIGN KEY (location_id) REFERENCES locations(id)
);
```

**users**
```sql
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 🔄 Data Flow Example

**User searches for "Seattle":**

```
1. User types "Seattle" in SearchBar component
   ↓
2. SearchBar calls weatherService.fetchWeatherData("Seattle")
   ↓
3. Frontend makes GET request to /api/weather/Seattle
   ↓
4. Backend route handler receives request
   ↓
5. weatherService.getWeatherForCity("Seattle") is called
   ↓
6. Service checks database cache
   ↓
7. If not cached, calls Visual Crossing API
   ↓
8. Processes and stores data in database
   ↓
9. Returns JSON response to frontend
   ↓
10. Frontend updates LocationContext state
   ↓
11. WeatherDashboard re-renders with new data
```

---

## 🎨 Styling Architecture

### CSS Organization

```
frontend/src/styles/
├── App.css                 # Global styles
├── themes.css              # CSS variables for theming
├── density-compact.css     # Compact UI mode
└── [Component].css         # Component-specific styles
```

### Theming System

Uses CSS variables for dynamic theming:

```css
/* themes.css */
:root {
  --primary-color: #4c7ce5;
  --background-color: #f5f7fb;
  --text-color: #0f172a;
}

[data-theme="dark"] {
  --background-color: #18233a;
  --text-color: #f5f7fb;
}
```

**Usage in components:**
```css
.weather-card {
  background-color: var(--background-color);
  color: var(--text-color);
}
```

---

## 🔐 Security Architecture

### Frontend Security
- **Input Validation** - Sanitize user inputs
- **XSS Protection** - React's built-in escaping
- **CSP Headers** - Content Security Policy
- **Environment Variables** - No secrets in code

### Backend Security
- **Rate Limiting** - Prevent abuse
- **JWT Authentication** - Secure user sessions
- **Helmet Middleware** - Security headers
- **SQL Injection Prevention** - Prepared statements
- **CORS** - Whitelist allowed origins

---

## 🧪 Testing Architecture

### Frontend Tests (Vitest + React Testing Library)
```javascript
// Component test
import { render, screen } from '@testing-library/react';

test('renders weather data', () => {
  render(<WeatherCard temperature={72} location="Seattle" />);
  expect(screen.getByText('Seattle')).toBeInTheDocument();
  expect(screen.getByText('72°')).toBeInTheDocument();
});
```

### Backend Tests (Jest + Supertest)
```javascript
// API test
const request = require('supertest');
const app = require('../server');

test('GET /api/weather/:city returns weather data', async () => {
  const res = await request(app).get('/api/weather/Seattle');
  expect(res.status).toBe(200);
  expect(res.body).toHaveProperty('temperature');
});
```

---

## 🚀 Build & Deployment

### Development Build
```bash
npm run dev  # Vite dev server + hot reload
```

### Production Build
```bash
npm run build  # Optimized production build
```

### Docker Deployment
```bash
docker-compose up  # Start all containers
```

---

## 📚 Next Steps for New Developers

1. **Read the Setup Guide** - [docs/getting-started/SETUP_GUIDE.md](SETUP_GUIDE.md)
2. **Explore the Codebase** - Start with `frontend/src/App.jsx` and `backend/server.js`
3. **Run the Tests** - `npm test` to see everything in action
4. **Make a Small Change** - Try modifying a component's styling
5. **Read Regression Prevention** - [docs/troubleshooting/REGRESSION_PREVENTION.md](../REGRESSION_PREVENTION.md)

---

## 💡 Common Development Patterns

### Adding a New API Endpoint

1. **Create route handler** (`backend/routes/`)
2. **Add service logic** (`backend/services/`)
3. **Update frontend service** (`frontend/src/services/`)
4. **Create component** (if needed)
5. **Write tests** for both frontend & backend

### Adding a New Component

1. **Create component file** (`frontend/src/components/MyComponent.jsx`)
2. **Create CSS file** (`frontend/src/styles/MyComponent.css`)
3. **Import in parent component**
4. **Write tests** (`frontend/src/__tests__/MyComponent.test.jsx`)

---

**Questions?** Check [CONTRIBUTING.md](../../CONTRIBUTING.md) or open a GitHub Discussion!

**Last Updated:** November 5, 2025
