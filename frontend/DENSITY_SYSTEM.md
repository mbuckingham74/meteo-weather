# Density System

## Overview

The density system provides a way to control the visual density of the UI through CSS custom properties. This replaces the old `density-compact.css` file that used 76+ !important declarations.

## How It Works

### 1. CSS Custom Properties

All spacing, font sizes, and component dimensions are controlled via CSS variables defined in `src/styles/themes.css`:

```css
:root {
  /* Normal Density (Default) */
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 12px;
  --spacing-lg: 20px;
  --spacing-xl: 24px;

  --font-xs: 9px;
  --font-sm: 11px;
  --font-md: 13px;
  --font-base: 14px;
  --font-lg: 16px;
  --font-xl: 20px;
  --font-2xl: 24px;
  --font-3xl: 32px;
  --font-4xl: 48px;

  --radius-sm: 6px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;

  /* Component-Specific */
  --dashboard-padding: 12px;
  --card-padding: 12px;
  --button-padding-y: 10px;
  --button-padding-x: 16px;
  --input-padding-y: 12px;
  --input-padding-x: 16px;
  --icon-size-sm: 18px;
  --icon-size-md: 20px;
  --icon-size-lg: 24px;
  --gap-sm: 6px;
  --gap-md: 8px;
  --gap-lg: 12px;
}
```

### 2. Compact Mode

To enable compact mode, add `data-density="compact"` to the `<body>` element:

```javascript
// Enable compact mode
document.body.dataset.density = 'compact';

// Disable compact mode (return to normal)
delete document.body.dataset.density;
```

This automatically overrides all variables with compact values (50-70% reduction):

```css
[data-density='compact'] {
  --spacing-xs: 1px;
  --spacing-sm: 2px;
  --spacing-md: 4px;
  --spacing-lg: 6px;
  --spacing-xl: 8px;

  --font-xs: 7px;
  --font-sm: 9px;
  --font-md: 11px;
  --font-base: 12px;
  --font-lg: 13px;
  --font-xl: 16px;
  --font-2xl: 18px;
  --font-3xl: 20px;
  --font-4xl: 32px;

  /* ... etc */
}
```

### 3. Using Variables in Components

When writing CSS, always use the variables instead of hardcoded values:

**❌ BAD** (hardcoded values):

```css
.my-component {
  padding: 12px;
  font-size: 14px;
  border-radius: 8px;
  gap: 8px;
}
```

**✅ GOOD** (using variables):

```css
.my-component {
  padding: var(--card-padding);
  font-size: var(--font-base);
  border-radius: var(--radius-md);
  gap: var(--gap-md);
}
```

This ensures that when compact mode is enabled, ALL components automatically adjust.

## Benefits Over Old System

### Before (density-compact.css):

- ❌ 476 lines of code
- ❌ 76+ !important declarations
- ❌ Required specific import order (fragile)
- ❌ Hard to maintain (duplicate values everywhere)
- ❌ Specificity wars with component styles

### After (CSS custom properties):

- ✅ 0 !important declarations needed
- ✅ No import order dependency
- ✅ Single source of truth for all sizes
- ✅ Easy to maintain and extend
- ✅ No specificity issues
- ✅ 2.5% smaller CSS bundle (167.91 kB vs 172.27 kB)

## Accessibility

The compact mode automatically preserves touch targets on mobile devices:

```css
@media (max-width: 768px) {
  [data-density='compact'] {
    --button-padding-y: 10px;
    --button-padding-x: 16px;
    --font-3xl: 40px;
    --font-4xl: 48px;
  }
}
```

This ensures that on small screens, buttons remain at least 44px tall (minimum touch target size per WCAG guidelines).

## Future Enhancement: User Preference

This system is ready for a user preference toggle. You could add a setting like:

```javascript
// In UserPreferencesPage or similar
function DensityToggle() {
  const [density, setDensity] = useState('normal');

  useEffect(() => {
    if (density === 'compact') {
      document.body.dataset.density = 'compact';
    } else {
      delete document.body.dataset.density;
    }
  }, [density]);

  return (
    <select value={density} onChange={(e) => setDensity(e.target.value)}>
      <option value="normal">Normal</option>
      <option value="compact">Compact</option>
    </select>
  );
}
```

## Variable Reference

### Spacing Scale (8pt grid)

- `--spacing-xs`: Extra small spacing
- `--spacing-sm`: Small spacing
- `--spacing-md`: Medium spacing
- `--spacing-lg`: Large spacing
- `--spacing-xl`: Extra large spacing

### Font Sizes

- `--font-xs`: 9px / 7px (compact)
- `--font-sm`: 11px / 9px (compact)
- `--font-md`: 13px / 11px (compact)
- `--font-base`: 14px / 12px (compact)
- `--font-lg`: 16px / 13px (compact)
- `--font-xl`: 20px / 16px (compact)
- `--font-2xl`: 24px / 18px (compact)
- `--font-3xl`: 32px / 20px (compact)
- `--font-4xl`: 48px / 32px (compact)

### Border Radius

- `--radius-sm`: 6px / 3px (compact)
- `--radius-md`: 8px / 5px (compact)
- `--radius-lg`: 12px / 8px (compact)
- `--radius-xl`: 16px / 10px (compact)

### Component-Specific

- `--dashboard-padding`: 12px / 8px (compact)
- `--card-padding`: 12px / 8px (compact)
- `--button-padding-y`: 10px / 6px (compact)
- `--button-padding-x`: 16px / 10px (compact)
- `--input-padding-y`: 12px / 6px (compact)
- `--input-padding-x`: 16px / 10px (compact)
- `--icon-size-sm`: 18px / 11px (compact)
- `--icon-size-md`: 20px / 14px (compact)
- `--icon-size-lg`: 24px / 18px (compact)
- `--gap-sm`: 6px / 2px (compact)
- `--gap-md`: 8px / 4px (compact)
- `--gap-lg`: 12px / 6px (compact)

## Migration Notes

Components that were previously overridden by `density-compact.css` now need to be updated to use CSS variables. This is part of Phase 1.3 of the CSS improvement plan.

Example migration:

```css
/* Before */
.ai-hero-title {
  font-size: 32px;
  margin: 0 0 12px 0;
}

/* After */
.ai-hero-title {
  font-size: var(--font-3xl);
  margin: 0 0 var(--spacing-md) 0;
}
```

This allows the component to automatically respond to density changes without !important declarations.
