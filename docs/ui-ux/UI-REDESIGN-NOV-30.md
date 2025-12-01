# UI Redesign - November 30, 2025

## Overview

Complete frontend UI redesign for Meteo Weather App. Trashing the existing UI after 5 weeks of incremental changes that made things progressively worse.

## Design Reference

- **Primary Inspiration:** [AQI Navigator Weather Dashboard UI](https://dribbble.com/shots/25443061-Clean-Minimal-and-Engaging-AQI-Navigator-Weather-Dashboard-UI)
- **Style:** Clean, minimal, engaging
- **Approach:** Card-based layout, generous whitespace, clear typography hierarchy

## Color Palette

| Color | Hex | Usage |
|-------|-----|-------|
| Steel Blue | `#6A89A7` | Secondary text, muted accents |
| Light Sky | `#BDDDFC` | Highlights, hover states, secondary text |
| Primary Blue | `#88BDF2` | Primary accent, buttons, interactive elements |
| Dark Slate | `#384959` | Background, card backgrounds |

### Extended Palette (derived)

```css
--color-bg-primary: #384959;
--color-bg-card: #3d5166;
--color-bg-card-hover: #455d75;
--color-text-primary: #ffffff;
--color-text-secondary: #BDDDFC;
--color-text-muted: #6A89A7;
--color-accent: #88BDF2;
--color-accent-hover: #9dcbf7;
```

## Design Principles

1. **Clean & Minimal** - No visual clutter, generous whitespace
2. **Card-Based** - Information organized in distinct cards
3. **Clear Hierarchy** - Large numbers, subtle labels
4. **Soft Shadows** - Subtle depth, no harsh borders
5. **Responsive** - Mobile-first, works on all devices
6. **Accessible** - WCAG AA compliant (maintain existing compliance)

## Tech Stack

- **CSS Framework:** Tailwind CSS v4.1.17 (with @tailwindcss/postcss)
- **Icons:** Lucide React (line style)
- **Charts:** Recharts (existing, restyle only)
- **Animations:** Tailwind + CSS transitions (minimal)

## What We're Keeping

These work well and should NOT be deleted:

- `src/hooks/` - All custom hooks (useChartTheme, useOnlineStatus, etc.)
- `src/services/` - API services (apiClient, weatherService, authApi, etc.)
- `src/contexts/` - All contexts (Auth, Theme, Location, Temperature)
- `src/config/` - Configuration files
- `src/utils/` - Utilities (errorHandler, debugLogger, etc.)
- `App.jsx` - Routing structure (will simplify)

## What We're Deleting

Complete removal:

- `src/components/` - All UI components (~50+ files)
- `src/styles/` - All CSS (ITCSS, modules, variables)
- All `*.module.css` files throughout the codebase
- `src/pages/` - Page layouts (rebuild from scratch)

## PR Strategy

Breaking changes into logical, reviewable chunks:

### PR 1: Tailwind Setup ✅ COMPLETE
- [x] Install Tailwind CSS v4, @tailwindcss/postcss, Autoprefixer
- [x] Configure CSS-based theme in index.css (Tailwind v4 uses CSS, not JS config)
- [x] Add custom color palette to @theme block
- [x] Add base component classes (.card, .btn-*, .input)
- [x] Update stylelint for Tailwind v4 compatibility
- [x] Verify build works (910 modules, 2.45s)
- **PR:** https://github.com/mbuckingham74/meteo-weather/pull/69

### PR 2: Remove Old UI Code ✅ COMPLETE
- [x] Delete `src/components/` directory (72 JSX, 38 CSS files)
- [x] Delete `src/styles/` directory (ITCSS architecture)
- [x] Delete all scattered `.module.css` files
- [x] Delete old scripts (color linting, token validation)
- [x] Clean up unused imports in App.jsx
- [x] Create minimal placeholder components (10 files)
- [x] Remove postcss-custom-media dependency
- **Results:** CSS 230kB→17kB (-93%), JS 673kB→237kB (-65%), Build 2.45s→1.03s
- **PR:** https://github.com/mbuckingham74/meteo-weather/pull/69 (same branch)

### PR 3: Dashboard Shell ✅ COMPLETE
- [x] Create new `src/components/ui/` structure (Card, StatCard)
- [x] Build WeatherDashboard with real weather data
- [x] CurrentConditions hero component
- [x] LocationSearch with debounced geocoding
- [x] Stats grid (Wind, Humidity, UV, Pressure, Dew Point, Visibility)
- [x] 7-day forecast cards
- [x] Fix temperature unit conversion (API returns Celsius)
- **PR:** https://github.com/mbuckingham74/meteo-weather/pull/70

### PR 4: Charts & Hourly Forecast ✅ COMPLETE
- [x] HourlyForecast horizontal scrolling strip
- [x] TemperatureChart with Recharts (high/low area chart)
- [x] Unit-aware chart data (reacts to °F/°C toggle)
- [x] Fix datetime parsing for ISO timestamps
- [x] Loading skeletons for all components
- **PR:** https://github.com/mbuckingham74/meteo-weather/pull/71

### PR 5: Info Cards (MERGED INTO PR 3)
- [x] Wind card
- [x] Humidity card
- [x] UV Index card
- [x] Pressure card
- [x] Dew Point card
- [x] Visibility card

### PR 6: Forecast Components (MERGED INTO PR 3 & 4)
- [x] 7-day forecast strip
- [x] Hourly forecast (24h)
- [x] Temperature chart integration

### PR 5: Temperature Unit Toggle ✅ COMPLETE
- [x] TemperatureToggle component (pill-style °F/°C switch)
- [x] Integrated into dashboard header next to search
- [x] 7-day forecast uses formatTemperature
- [x] Dew Point uses proper temperature conversion
- **PR:** https://github.com/mbuckingham74/meteo-weather/pull/72

### PR 6: Auth Header & Login Modal ✅ COMPLETE
- [x] Desktop navigation with active state highlighting
- [x] User avatar dropdown menu (Preferences, Admin, Sign Out)
- [x] Mobile hamburger menu with responsive navigation
- [x] Login/Register modal with form validation
- [x] Admin link conditional on user.isAdmin
- [x] Click outside closes dropdown, Escape closes modal
- [x] Toast notifications (visual UI, auto-dismiss, queue)
- [x] Skip links accessibility (main content, search)
- [x] URL sync for deep-linking/sharing (/location/:slug)
- **PR:** https://github.com/mbuckingham74/meteo-weather/pull/73

### PR 7: Additional Pages (IN PROGRESS)
- [ ] AI Weather page
- [ ] Location comparison
- [ ] Admin panel (restyled)
- [ ] User Preferences page

---

## Progress Tracking

### Session 1 - November 30, 2025

**Status:** 🟢 PR 1 & 2 Complete

**Completed:**
- [x] Cleaned up uncommitted changes
- [x] Created backup branch: `backup/ui-before-redesign-nov30`
- [x] Created feature branch: `feature/ui-redesign-v2`
- [x] Created this tracking document
- [x] **PR 1: Tailwind Setup** - https://github.com/mbuckingham74/meteo-weather/pull/69
- [x] **PR 2: Remove Old UI** - 144 files deleted, 34,006 lines removed

**Notes:**
- Starting from clean main branch (commit 8a8162d)
- Backup pushed to remote for safety
- Tailwind v4 uses CSS-based config (@theme block), not JS config file
- Build verified working with new setup
- Massive bundle size reduction achieved:
  - CSS: 230 kB → 17 kB (-93%)
  - JS: 673 kB → 237 kB (-65%)
  - Modules: 910 → 129 (-86%)

### Session 2 - November 30, 2025

**Status:** 🟢 PR 3 & 4 Complete (code review fixes applied)

**Completed:**
- [x] **PR 3: Dashboard Shell** - https://github.com/mbuckingham74/meteo-weather/pull/70
  - WeatherDashboard with real data via React Query hooks
  - CurrentConditions hero section
  - LocationSearch with proper debouncing (useRef + isMountedRef pattern)
  - Stats grid with 6 cards
  - 7-day forecast cards
- [x] **PR 4: Charts & Hourly** - https://github.com/mbuckingham74/meteo-weather/pull/71
  - HourlyForecast horizontal scrolling strip
  - TemperatureChart with Recharts
  - Loading skeletons

**Code Review Fixes Applied:**
- [x] **BLOCKER:** Fixed formatTemperature - was converting wrong direction (API returns Celsius, not Fahrenheit)
- [x] **HIGH:** Fixed LocationSearch debounce (useRef instead of broken return from onChange)
- [x] **HIGH:** Added convertTemperature for numeric chart values
- [x] **HIGH:** Chart data now reacts to unit toggle via useMemo dependency
- [x] **HIGH:** 7-day forecast cards now use formatTemperature
- [x] **HIGH:** Dew Point StatCard now uses temperature unit
- [x] **MEDIUM:** HourlyForecast handles both time-only and ISO datetime formats
- [x] **MEDIUM:** Fixed button classes (added base .btn class)

**Up Next:**
- [ ] PR 7: User Preferences Page
- [ ] PR 8: Additional Pages (AI Weather, Location comparison, Admin)

### Session 3 - November 30, 2025

**Status:** 🟢 PR 5 & 6 Complete

**Completed:**
- [x] **PR 5: Temperature Unit Toggle** - https://github.com/mbuckingham74/meteo-weather/pull/72
  - TemperatureToggle component with pill-style switch
  - Integrated into dashboard header
  - 7-day forecast and Dew Point use formatTemperature
- [x] **PR 6: Auth Header & Login Modal** - https://github.com/mbuckingham74/meteo-weather/pull/73
  - Complete navigation header with auth integration
  - User dropdown menu with Preferences, Admin, Sign Out
  - Mobile hamburger menu
  - Login/Register modal with validation
  - Toast notifications (visual UI with auto-dismiss)
  - Skip links accessibility restored
  - URL sync for location deep-linking

**Code Review Fixes Applied (PR 73):**
- [x] **BLOCKER:** Toast notifications - full visual UI restored
- [x] **HIGH:** URL sync - LocationSearch now navigates to /location/:slug
- [x] **MEDIUM:** Duplicate id="main-content" fixed (removed from WeatherDashboard)
- [x] **MEDIUM:** Skip links - multiple targets with proper focus styling

**Up Next:**
- [ ] PR 7: Additional Pages (AI Weather, Compare, Admin, Preferences)

---

## Session Resume Instructions

When resuming in a new context window:

1. Read this file first: `docs/ui-ux/UI-REDESIGN-NOV-30.md`
2. Check current branch: `git branch --show-current`
3. Check progress: Look at "Progress Tracking" section above
4. Check open PRs: `gh pr list --author @me`
5. Continue from where we left off

**PR Stack:**
- PR #69: `feature/ui-redesign-v2` → main (Tailwind + Remove Old UI)
- PR #70: `feature/ui-redesign-pr3-dashboard` → PR #69 (Dashboard Shell)
- PR #71: `feature/ui-redesign-pr4-charts` → PR #70 (Charts & Hourly)
- PR #72: `feature/ui-redesign-pr5-temp-toggle` → PR #70 (Temperature Toggle)
- PR #73: `feature/ui-redesign-pr6-auth-header` → PR #72 (Auth Header)

**Backup Branch:** `backup/ui-before-redesign-nov30`

---

## Design Mockup Notes

From the Dribbble reference, key elements to implement:

1. **Hero Section**
   - Large temperature (48-72px font)
   - Location name prominent
   - Current conditions icon
   - "Feels like" subtitle

2. **Stats Grid**
   - 4-6 cards in responsive grid
   - Icon + value + label pattern
   - Subtle card backgrounds

3. **Forecast Strip**
   - Horizontal scroll on mobile
   - Day/icon/high/low pattern
   - Visual temperature indicators

4. **Charts**
   - Clean line charts
   - Minimal axes
   - Themed to match palette

---

## File Structure (Target)

```
src/
├── components/
│   ├── layout/
│   │   ├── Header.jsx
│   │   ├── Sidebar.jsx (optional)
│   │   └── Container.jsx
│   ├── weather/
│   │   ├── CurrentConditions.jsx
│   │   ├── ForecastCard.jsx
│   │   ├── ForecastStrip.jsx
│   │   ├── WeatherIcon.jsx
│   │   └── StatCard.jsx
│   ├── charts/
│   │   ├── TemperatureChart.jsx
│   │   ├── HourlyChart.jsx
│   │   └── ChartContainer.jsx
│   ├── ui/
│   │   ├── Card.jsx
│   │   ├── Button.jsx
│   │   ├── Input.jsx
│   │   └── Modal.jsx
│   └── pages/
│       ├── Dashboard.jsx
│       ├── AIWeather.jsx
│       ├── Compare.jsx
│       └── Admin.jsx
├── hooks/ (keep existing)
├── services/ (keep existing)
├── contexts/ (keep existing)
├── config/ (keep existing)
└── utils/ (keep existing)
```

---

## Questions/Decisions to Make

1. **Light mode support?** - Start dark-only, add light later?
2. **Animation level?** - Minimal transitions or more dynamic?
3. **Mobile navigation?** - Bottom tabs or hamburger menu?
4. **Chart library?** - Keep Recharts or switch?

---

*Last Updated: November 30, 2025*
*Current Session: 3 (continuing)*
