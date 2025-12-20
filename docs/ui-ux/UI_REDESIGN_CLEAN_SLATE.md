# UI Redesign: Clean Slate Implementation

**Date:** December 5, 2025 (Updated December 20, 2025)
**Status:** Phase 2 In Progress - Dashboard layout redesigned with custom radar map

---

## Overview

After 7 weeks of accumulated CSS technical debt (ITCSS architecture, CSS modules, multiple density systems, and various patches), we decided to start fresh with the frontend UI while preserving all business logic.

### Decision: Option A - Nuclear Reset

We chose to delete all UI components and CSS, keeping only the data layer (services, hooks, contexts, utils).

---

## Phase History

### Phase 1: Clean Slate (Completed Dec 5, 2025)

- Deleted all UI components (`/src/components/` - 24 files)
- Preserved all business logic (services, hooks, contexts, utils)
- Extracted ToastContext to `/src/contexts/ToastContext.jsx`
- Created placeholder pages in `/src/pages/`
- Initially tried Tailwind v4

### Phase 2: Vanilla CSS Redesign (In Progress - Dec 5, 2025)

**Key Decision:** Switched from Tailwind v4 to vanilla CSS with CSS custom properties.

**Reason:** Tailwind v4's `@theme` block caused variable collisions with our design tokens. Vanilla CSS gives us full control and simpler debugging.

### Phase 2.1: Dashboard Layout Redesign (Completed Dec 20, 2025)

**Key Changes:**
- Reorganized dashboard layout from `col-3 | col-6 | col-3` to `col-4 | col-8`
- Left column (col-4): Current weather + 7-day forecast stacked vertically
- Right column (col-8): Large radar map taking most of the screen width
- 7-day forecast now uses horizontal cards instead of a grid layout

**Radar Map Overhaul:**
- **Removed:** RainViewer iframe (controls overlapping, animation causing page flickering)
- **Added:** Custom RadarMap component using Leaflet + OpenWeatherMap tiles
- Static weather tiles instead of animation (better performance)
- 4 switchable weather layers: Precipitation, Clouds, Temperature, Wind
- Dark theme base map (CartoDB dark_all tiles)
- Custom layer switcher UI with icon buttons

**New Files:**
- `frontend/src/components/RadarMap.jsx` - Leaflet-based weather map
- `frontend/src/components/RadarMap.css` - Map styling with dark theme support

**Commit:** `8ec5ecc` - feat(ui): redesign dashboard layout with larger radar map

---

## What's Working Now (Deployed to Production)

### WeatherDashboard - Main Page ✅

**Live at:** https://meteo-beta.tachyonfuture.com

#### Features Implemented:
- ✅ **12-column bento grid layout** - Apple-style responsive card system
- ✅ **Location search with autocomplete** - Searches Visual Crossing API, shows dropdown with keyboard navigation
- ✅ **Current conditions display** - Large temperature, feels-like, weather description with icon
- ✅ **Today's Overview section** - 6 stat cards (Humidity, Wind, Visibility, UV Index, Pressure, Dew Point)
- ✅ **Custom Leaflet radar map** - OpenWeatherMap tiles with 4 weather layers (Dec 20, 2025)
- ✅ **Weather layer switcher** - Toggle between Precipitation, Clouds, Temperature, Wind
- ✅ **Welcome section** - Quick-access cards for 6 major US cities (NYC, LA, Chicago, Miami, Seattle, Denver)
- ✅ **7-day forecast** - Horizontal cards below current conditions with high/low temps
- ✅ **Dark/light theme toggle** - Full theme support with CSS custom properties
- ✅ **Temperature unit toggle** - °F/°C switching
- ✅ **Responsive design** - Works on mobile, tablet, desktop

#### Technical Implementation:
- React Query hooks (`useCurrentWeatherQuery`, `useForecastQuery`, `useHourlyForecastQuery`)
- Visual Crossing API for weather data
- **Leaflet + OpenWeatherMap** for radar/weather maps (replaced RainViewer)
- CSS Grid with `grid-template-columns: repeat(12, 1fr)`
- CSS custom properties for theming

### Header/Navigation ✅
- Logo with cloud icon
- Navigation links (Dashboard, AI Weather, Compare, About)
- Temperature unit toggle (°F/°C)
- Theme toggle (sun/moon icons)
- User menu dropdown
- Mobile hamburger menu

### Other Pages (Placeholders)
- ComparePage - UI placeholder
- AIWeatherPage - UI placeholder
- AdminPanel - UI placeholder (auth check working)
- AboutPage - UI placeholder
- PrivacyPage - UI placeholder
- PreferencesPage - Functional with theme/unit toggles
- SharedAnswerPage - UI placeholder

---

## Design System: Vanilla CSS

**File:** `/src/index.css` (~650 lines)

### Color Palette (CSS Custom Properties)
```css
:root {
  /* Primary colors */
  --color-primary: #3b82f6;
  --color-primary-hover: #2563eb;

  /* Background layers */
  --color-bg-primary: #0f172a;
  --color-bg-secondary: #1e293b;
  --color-bg-tertiary: #334155;

  /* Text colors */
  --color-text-primary: #f8fafc;
  --color-text-secondary: #94a3b8;
  --color-text-muted: #64748b;

  /* Weather condition colors */
  --color-sunny: #fbbf24;
  --color-cloudy: #9ca3af;
  --color-rainy: #3b82f6;
  --color-stormy: #6366f1;
  --color-snowy: #e0f2fe;

  /* Temperature gradient */
  --color-temp-cold: #22d3ee;
  --color-temp-cool: #38bdf8;
  --color-temp-mild: #4ade80;
  --color-temp-warm: #facc15;
  --color-temp-hot: #f87171;
}

/* Light theme overrides */
.light {
  --color-bg-primary: #f8fafc;
  --color-bg-secondary: #ffffff;
  --color-bg-tertiary: #f1f5f9;
  --color-text-primary: #0f172a;
  --color-text-secondary: #475569;
  --color-text-muted: #94a3b8;
}
```

### Component Classes
- `.card` - Base card with glassmorphism effect
- `.btn`, `.btn-primary`, `.btn-secondary`, `.btn-ghost` - Button variants
- `.input` - Form input styling
- `.sr-only` - Screen reader only utility
- `.bento-grid` - 12-column grid container

### Animations (kebab-case per stylelint)
- `fade-in` - Fade in effect
- `slide-down` - Dropdown animations
- `slide-up` - Reverse slide

---

## File Structure

```
frontend/src/
├── App.jsx                    # Routing + Header component
├── App.css                    # Header/nav styles
├── index.jsx                  # React entry point
├── index.css                  # Global design system (vanilla CSS)
│
├── components/                # Reusable components
│   ├── RadarMap.jsx           # ✅ Leaflet + OpenWeatherMap radar (NEW Dec 20)
│   └── RadarMap.css           # Radar map styling
│
├── pages/                     # All page components
│   ├── WeatherDashboard.jsx   # ✅ Main dashboard (functional)
│   ├── WeatherDashboard.css   # Dashboard-specific styles
│   ├── ComparePage.jsx        # Placeholder
│   ├── AIWeatherPage.jsx      # Placeholder
│   ├── AdminPanel.jsx         # Placeholder (auth working)
│   ├── AboutPage.jsx          # Placeholder
│   ├── PrivacyPage.jsx        # Placeholder
│   ├── PreferencesPage.jsx    # ✅ Functional
│   └── SharedAnswerPage.jsx   # Placeholder
│
├── contexts/                  # State management
│   ├── AuthContext.jsx
│   ├── ThemeContext.jsx
│   ├── LocationContext.jsx
│   ├── TemperatureUnitContext.jsx
│   └── ToastContext.jsx
│
├── hooks/                     # React hooks
│   ├── useWeatherQueries.js   # React Query weather hooks
│   ├── useClimateQueries.js   # React Query climate hooks
│   └── ...
│
├── services/                  # API layer
│   ├── apiClient.js
│   ├── weatherApi.js
│   └── ...
│
├── config/                    # Configuration
│   └── queryClient.js
│
├── utils/                     # Utilities
│   └── ...
│
└── constants/                 # Constants
    └── ...
```

---

## Remaining Work (~90%)

### High Priority
1. **Hourly forecast display** - Data fetched but not displayed
2. **Temperature charts** - Recharts integration needed
3. **Geolocation** - "Use My Location" button
4. **Error states** - Better error handling UI
5. **Loading skeletons** - Proper loading states

### Medium Priority
6. **AIWeatherPage** - AI query interface
7. **ComparePage** - Location comparison
8. **AdminPanel** - Full admin functionality
9. **Authentication UI** - Login/register modals
10. **Toast notifications** - Toast system integration

### Low Priority
11. **AboutPage** - Content
12. **PrivacyPage** - Content
13. **Animations** - Micro-interactions
14. **Accessibility** - WCAG compliance review
15. **Performance** - Code splitting, lazy loading

---

## How to Resume Work

### Starting a New Session

```
Read docs/ui-ux/UI_REDESIGN_CLEAN_SLATE.md for current UI redesign status.

We're in Phase 2 - building out the bento grid dashboard with vanilla CSS.
The main WeatherDashboard is functional with:
- Current conditions (left column, col-4)
- 7-day forecast in horizontal cards (below current conditions)
- Large radar map (right column, col-8) with 4 weather layers

Next priorities: hourly forecast display, temperature charts, remaining pages.
```

### Quick Commands

```bash
# Start dev server
cd frontend && npm run dev

# App runs at http://localhost:3005

# Build for production
npm run build

# Deploy to beta
ssh michael@tachyonfuture.com
cd /home/michael/meteo-app && bash scripts/deploy-beta.sh
```

### Key Files

| Purpose | File |
|---------|------|
| Design system | `/src/index.css` |
| Main dashboard | `/src/pages/WeatherDashboard.jsx` |
| Dashboard styles | `/src/pages/WeatherDashboard.css` |
| Radar map component | `/src/components/RadarMap.jsx` |
| Radar map styles | `/src/components/RadarMap.css` |
| App shell/header | `/src/App.jsx` + `/src/App.css` |
| Weather hooks | `/src/hooks/useWeatherQueries.js` |
| API client | `/src/services/apiClient.js` |

---

## Technical Notes

### Why Vanilla CSS over Tailwind v4

1. **Variable collisions** - Tailwind v4's `@theme` block conflicted with our CSS custom properties
2. **Simpler debugging** - No build-time class generation to trace through
3. **Full control** - Direct CSS gives us exactly what we want
4. **Smaller bundle** - No Tailwind runtime needed
5. **Familiar patterns** - Standard CSS knowledge applies

### CSS Architecture

- **Design tokens** in `:root` (colors, spacing, typography)
- **Theme switching** via `.light`/`.dark` class on `<html>`
- **Component scoping** via page-specific CSS files
- **BEM-lite naming** for component classes
- **CSS Grid** for bento layout
- **CSS custom properties** for dynamic theming

### API Integration

- **Visual Crossing API** - Weather data (current, forecast, hourly)
- **OpenWeatherMap API** - Weather map tiles (precipitation, clouds, temp, wind)
- **React Query** - Data fetching with caching
- **Backend proxy** - All API calls go through our backend

### RadarMap Component (Dec 20, 2025)

The custom radar map component uses:
- **react-leaflet** - React wrapper for Leaflet.js
- **CartoDB dark_all** - Dark theme base map tiles
- **OpenWeatherMap tiles** - Weather overlay layers

Available weather layers:
```javascript
const WEATHER_LAYERS = {
  precipitation: { id: 'precipitation_new', label: 'Precipitation', icon: CloudRain },
  clouds: { id: 'clouds_new', label: 'Clouds', icon: Layers },
  temp: { id: 'temp_new', label: 'Temperature', icon: Thermometer },
  wind: { id: 'wind_new', label: 'Wind', icon: Wind },
};
```

OWM tile URL format:
```
https://tile.openweathermap.org/map/{layer}/{z}/{x}/{y}.png?appid={API_KEY}
```

---

## Commits

- `8ec5ecc` - feat(ui): redesign dashboard layout with larger radar map (Dec 20, 2025)
  - Reorganized layout to col-4 (left) + col-8 (radar)
  - Replaced RainViewer with custom Leaflet + OpenWeatherMap component
  - Added 4 weather layer options with switcher UI
  - Horizontal forecast cards below current conditions

- `d457a46` - feat: UI redesign with bento grid layout and vanilla CSS (Dec 5, 2025)
  - 48 files changed, 3929 insertions, 3240 deletions
  - Complete dashboard with live weather, radar, search, 7-day forecast

---

**Last Updated:** December 20, 2025
**Author:** Claude Code
**Status:** Phase 2 in progress (~15% complete)
**Production:** https://meteo-beta.tachyonfuture.com
