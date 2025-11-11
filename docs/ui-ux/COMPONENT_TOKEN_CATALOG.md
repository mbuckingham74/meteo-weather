# Component Token Catalog

**Last Updated:** November 10, 2025  
**Scope:** Frontend design tokens consumed by components in Meteo Weather App

---

## Overview

This catalog lists every component-facing token and shows which UI layers consume it. The goal is to keep colors, spacing, typography, and elevation consistent across light/dark plus the new `aurora` and `sunset` presets.

Key takeaways:

- All components must reference CSS variables defined in `frontend/src/styles/theme-variables.css`.
- Tokens are grouped into logical families (Surface, Text, Accent, Feedback, Data Viz, Layout, Density).
- Every preset overrides the same set of critical tokens, so swapping themes never produces partially-styled UI.
- Automated validation (`npm run validate:tokens`) ensures new presets stay aligned.

---

## Token Families

| Family | Tokens | Primary Consumers |
|--------|--------|-------------------|
| **Surface** | `--bg-primary`, `--bg-secondary`, `--bg-tertiary`, `--bg-elevated`, `--border-light`, `--border-medium`, `--border-dark` | Layout containers, cards, modals, overlays |
| **Text** | `--text-primary`, `--text-secondary`, `--text-tertiary`, `--text-disabled`, `--text-on-accent` | Typography utility classes, Button, Toast, AI Hero, Settings |
| **Accent** | `--accent-primary`, `--accent-secondary`, `--accent-hover`, `--accent-bg`, `--accent-text` | Button, Toggle, CTA links, chart highlights |
| **Feedback** | `--error-*`, `--success-*`, `--warning-*`, `--info-*`, `--alert-*` | Toast, ErrorMessage, Weather Alerts Banner, AI responses |
| **Data Visualization** | `--chart-line-primary`, `--chart-line-secondary`, `--chart-hot`, `--chart-warning`, `--chart-surface`, `--chart-grid`, `--chart-text-strong`, `--chart-text-muted` | All chart modules under `src/components/charts/` |
| **Overlay / Shadow** | `--overlay-*`, `--shadow-*`, `--surface-glass*` | Modals, AI drawers, Skeleton overlays |
| **Layout & Density** | `--spacing-*`, `--radius-*`, `--card-padding`, `--button-padding-*`, `--gap-*`, density overrides via `[data-density='compact']` | Weather dashboard grid, Stack/Grid primitives, spacing utilities |

---

## Component Mapping

| Component / Area | Tokens |
|------------------|--------|
| **Buttons / CTA** | `--accent-primary`, `--accent-hover`, `--text-on-accent`, `--button-padding-x`, `--button-padding-y`, `--radius-md`, `--shadow-sm` |
| **Cards & Surfaces** | `--bg-elevated`, `--border-light`, `--card-padding`, `--shadow-md`, `--radius-lg` |
| **Toast / ErrorMessage** | Feedback tokens (`--error-*`, `--success-*`, etc.), `--overlay-strong`, `--shadow-lg` |
| **Weather Dashboard (Hero + Charts)** | Surfaces, text, accent, chart palette tokens, grid spacing (`--gap-md`, `--gap-lg`), density overrides |
| **AI Weather Page** | Accent variants (`--accent-bg`, `--accent-text`), overlay tokens, typography tokens |
| **Location & Auth Modals** | `--bg-secondary`, `--border-medium`, `--overlay-soft`, `--shadow-xl` |
| **Charts + Data Viz** | `--chart-*`, `--text-primary`, `--text-tertiary`, `--hover-bg`, `--accent-primary` |
| **Theme Toggle / Density Toggle** | Accent tokens for states, text tokens for labels, spacing tokens for compact mode |

> If a component needs a new visual affordance, add a token to `theme-variables.css`, document it here, and update presets plus validation tests.

---

## Theme Presets

Available presets (applied via `document.documentElement.dataset.theme`):

1. `light` – default, airy palette
2. `dark` – high-contrast night mode
3. `aurora` – teal & magenta inspired by polar lights
4. `sunset` – warm oranges and rosy highlights
5. `auto` – resolves to `light` or `dark` based on system preference

### Usage in code

```jsx
import { useTheme } from '@contexts/ThemeContext';

const { setTheme } = useTheme();
setTheme('aurora'); // instantly switches preset
```

### Runtime validation

`npm run validate:tokens` parses `theme-variables.css` and ensures every preset defines the required token set (surface, text, accent, feedback, chart). Add new presets by:

1. Copying the token block in `theme-variables.css`
2. Updating colors/gradients
3. Running `npm run validate:tokens`
4. Documenting the preset in this catalog

---

## References

- `frontend/src/styles/theme-variables.css`
- `frontend/src/styles/theme-base.css`
- `frontend/scripts/validate-theme-tokens.mjs`
- `frontend/src/components/theme/ThemeToggle.jsx`
- `docs/ui-ux/REDESIGN_SUMMARY.md`

Maintaining this catalog keeps design, engineering, and QA aligned on what each token controls and guarantees theme-changing remains a safe, reversible operation.
