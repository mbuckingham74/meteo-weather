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

### PR 2: Remove Old UI Code
- [ ] Delete `src/components/` directory
- [ ] Delete `src/styles/` directory
- [ ] Delete all scattered `.module.css` files
- [ ] Clean up unused imports in App.jsx
- [ ] Minimal placeholder components to prevent build errors

### PR 3: Dashboard Shell
- [ ] Create new `src/components/layout/` structure
- [ ] Build minimal WeatherDashboard shell
- [ ] Implement color palette as Tailwind theme
- [ ] Basic responsive layout grid

### PR 4: Core Weather Display
- [ ] Current conditions hero section
- [ ] Temperature display (large, prominent)
- [ ] Location header
- [ ] Basic weather icon

### PR 5: Info Cards
- [ ] Wind card
- [ ] Humidity card
- [ ] UV Index card
- [ ] Pressure card
- [ ] Feels like card

### PR 6: Forecast Components
- [ ] 7-day forecast strip
- [ ] Hourly forecast (24h)
- [ ] Temperature chart integration

### PR 7: Secondary Features
- [ ] Search/location input
- [ ] Settings/preferences
- [ ] Auth modal (restyled)

### PR 8: Additional Pages
- [ ] AI Weather page
- [ ] Location comparison
- [ ] Admin panel (restyled)

---

## Progress Tracking

### Session 1 - November 30, 2025

**Status:** 🟢 PR 1 Complete

**Completed:**
- [x] Cleaned up uncommitted changes
- [x] Created backup branch: `backup/ui-before-redesign-nov30`
- [x] Created feature branch: `feature/ui-redesign-v2`
- [x] Created this tracking document
- [x] **PR 1: Tailwind Setup** - https://github.com/mbuckingham74/meteo-weather/pull/69

**Up Next:**
- [ ] PR 2: Remove old components and styles

**Notes:**
- Starting from clean main branch (commit 8a8162d)
- Backup pushed to remote for safety
- Tailwind v4 uses CSS-based config (@theme block), not JS config file
- Build verified working with new setup

---

## Session Resume Instructions

When resuming in a new context window:

1. Read this file first: `docs/ui-ux/UI-REDESIGN-NOV-30.md`
2. Check current branch: `git branch --show-current`
3. Check progress: Look at "Progress Tracking" section above
4. Check open PRs: `gh pr list --author @me`
5. Continue from where we left off

**Current Branch:** `feature/ui-redesign-v2`
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
*Current Session: 1*
