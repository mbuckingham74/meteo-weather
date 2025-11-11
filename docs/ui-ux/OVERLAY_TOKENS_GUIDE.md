# Overlay & Glass Tokens

Guidance for building frosted glass / overlay surfaces that match the calm indigo palette across light and dark themes.

## Token Reference

| Token | Purpose |
| --- | --- |
| `--overlay-strong` / `--overlay-medium` / `--overlay-soft` | Dark scrims that pull from `--text-primary` for neutral overlays (drawers, dialogs). |
| `--overlay-accent` / `--overlay-accent-strong` | Light scrims that pull from `--text-on-accent` for use on accent gradients (hero cards, CTA tiles). |
| `--surface-glass` | Default blurred panel background. Mixes `--bg-elevated` with transparency so text remains 100% opaque. |
| `--surface-glass-strong` | Use when the panel floats above busy content (maps, gradients, video). |
| `--surface-glass-border` | Hairline border that keeps translucent panels legible on both themes. |

All tokens live in `frontend/src/styles/theme-variables.css` and inherit automatically inside `[data-theme='dark']`.

## Usage Patterns

### 1. Glass Panels
- Pair `background: var(--surface-glass[-strong])` with `backdrop-filter: blur(4px)` or higher.
- Always add `border: 1px solid var(--surface-glass-border)`; this prevents panels from bleeding into the background once blur is applied.
- Prefer `box-shadow: var(--shadow-sm | --shadow-md)` over custom rgba shadows (the JS/CSS guard will flag literals).

### 2. Accent Cards
- When the parent already uses `--gradient-*`, layer content with `--overlay-accent` or `--overlay-accent-strong` (see `ThisDayInHistoryCard`).
- Keep text color tokens (`--text-on-accent`, `--text-secondary`) inlined so the palette can flip automatically.

### 3. Controls On Media (Radar, Charts, Video)
- Replace opaque backgrounds + `opacity: 0.9` with the glass tokens so text remains crisp.
- Example (`frontend/src/components/weather/RadarMap.css`):

```css
.radar-legend {
  background: var(--surface-glass-strong);
  border: 1px solid var(--surface-glass-border);
  box-shadow: var(--shadow-sm);
  backdrop-filter: blur(4px);
}
```

- Remove `opacity` from containers; translucency should come from the color token, not from inherited alpha that also fades text/icons.

## Guardrails

- `npm run lint:colors` blocks raw hex usage in JS/TS **and CSS**, so any new overlay color must be defined in `theme-variables.css`.
- When adding a bespoke overlay (e.g., heatmap specific), prefix the custom variable locally (`--radar-overlay-...`) and derive it from existing tokens or `color-mix` expressions—never from literals.

Following these rules keeps glass panels consistent with the calm indigo palette and prevents regressions between light/dark themes.
