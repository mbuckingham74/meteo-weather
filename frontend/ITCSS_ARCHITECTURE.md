# ITCSS Architecture - Phases 2.1-2.3 Complete ✅

**ITCSS (Inverted Triangle CSS)** organizes CSS by specificity, from least specific (settings) to most specific (utilities). This creates a clear hierarchy and prevents specificity wars.

**Last Updated:** November 8, 2025 (CSS Audit Fixes applied)

---

## Recent Updates (November 2025)

### CSS Audit Fixes Applied ✅

- **Responsive Utilities Fixed:** All `var()` in media queries replaced with pixel values (browser limitation)
- **Theme System Unified:** Removed 95 lines of duplicate `[data-theme]` overrides from components
- **Design Tokens Adopted:** 65+ hardcoded spacing values replaced with `var(--spacing-*)`
- **App.css ITCSS Compliance:** Removed duplicate resets (box-sizing, body margin/padding) already in Layer 3
- **Accessibility Improved:** All typography ≥12px (WCAG 1.4.4 compliant)
- **Animation Scope Fixed:** Keyframes moved outside media queries for fallback classes

**See:** [CSS_AUDIT_FIXES.md](CSS_AUDIT_FIXES.md) for complete details.

---

## Structure

```
src/styles/
├── main.css                     # Main entry point (imports all layers)
├── itcss/
│   ├── settings/
│   │   ├── _variables.css       # CSS custom properties (spacing, colors, fonts)
│   │   └── _breakpoints.css     # Responsive breakpoint variables (NEW in 2.3)
│   ├── tools/                   # (Empty - for future mixins if needed)
│   ├── generic/
│   │   └── _reset.css           # CSS reset, normalize
│   ├── elements/
│   │   └── _base.css            # Base HTML elements
│   ├── objects/
│   │   └── _layout.css          # Layout patterns (.o- prefix)
│   ├── components/              # (Component CSS handled separately)
│   └── utilities/
│       ├── _helpers.css         # Utility classes (.u- prefix)
│       └── _responsive.css      # Responsive utilities (NEW in 2.3)
```

## IT

CSS Layers

### Layer 1: Settings

**Files:**

- `itcss/settings/_variables.css` - Spacing, colors, fonts, etc.
- `itcss/settings/_breakpoints.css` - Responsive breakpoints (Phase 2.3)

**Purpose:** CSS custom properties, configuration
**Output:** Variable definitions only
**Example:**

```css
:root {
  /* Spacing & Typography */
  --spacing-md: 12px;
  --font-base: 14px;

  /* Breakpoints (Phase 2.3) */
  --breakpoint-md: 768px;
  --breakpoint-lg: 1024px;
}
```

### Layer 2: Tools

**Purpose:** Mixins, functions (future use)
**Currently:** Empty (vanilla CSS doesn't have mixins)
**Note:** Use PostCSS or SCSS if mixins needed

### Layer 3: Generic

**Files:** `itcss/generic/_reset.css`
**Purpose:** CSS resets, normalize, box-sizing
**Example:**

```css
*,
*::before,
*::after {
  box-sizing: border-box;
}
```

### Layer 4: Elements

**Files:** `itcss/elements/_base.css`
**Purpose:** Base HTML element styles (no classes)
**Example:**

```css
body {
  font-family: -apple-system, BlinkMacSystemFont, ...;
  color: var(--text-primary);
}

h1 {
  font-size: var(--font-4xl);
}
```

### Layer 5: Objects

**Files:** `itcss/objects/_layout.css`
**Purpose:** Layout patterns (non-cosmetic, structural)
**Naming:** `.o-` prefix
**Example:**

```css
.o-container {
  max-width: 1400px;
  margin: 0 auto;
}

.o-flex {
  display: flex;
}

.o-grid--3col {
  grid-template-columns: repeat(3, 1fr);
}
```

### Layer 6: Components

**Purpose:** UI components (buttons, cards, etc.)
**Handled by:** CSS Modules (scoped per component)
**Note:** Not imported in main.css to avoid bloat

### Layer 7: Utilities

**Files:**

- `itcss/utilities/_helpers.css` - General utilities
- `itcss/utilities/_responsive.css` - Responsive utilities (Phase 2.3)

**Purpose:** Helper classes (highest specificity)
**Naming:** `.u-` prefix
**Use:** `!important` to ensure they always win
**Example:**

```css
/* General utilities */
.u-text-center {
  text-align: center !important;
}

.u-mb-lg {
  margin-bottom: var(--spacing-lg) !important;
}

/* Responsive utilities (Phase 2.3) */
.u-hide-mobile {
  display: none !important; /* Hidden on mobile */
}

.u-grid-responsive {
  display: grid !important;
  grid-template-columns: repeat(1, 1fr) !important; /* 1 col mobile */
}

@media (min-width: var(--breakpoint-md)) {
  .u-grid-responsive {
    grid-template-columns: repeat(2, 1fr) !important; /* 2 cols tablet */
  }
}
```

## Usage

### In App.jsx

```javascript
import './styles/main.css'; // ITCSS architecture
import './App.css'; // App-specific styles
```

### Object Classes

```jsx
<div className="o-container">
  <div className="o-grid o-grid--3col o-grid--gap-md">
    <div>Grid item 1</div>
    <div>Grid item 2</div>
    <div>Grid item 3</div>
  </div>
</div>
```

### Utility Classes

```jsx
<h1 className="u-text-center u-mb-lg">Centered Heading</h1>
<p className="u-text-secondary">Secondary text color</p>

{/* Responsive utilities (Phase 2.3) */}
<nav className="u-hide-mobile">Desktop Navigation</nav>
<button className="u-show-mobile">☰ Mobile Menu</button>

<div className="u-grid-responsive">
  {/* 1 column mobile, 2 tablet, 3 desktop */}
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</div>
```

### Component Styles

Components continue to use CSS Modules:

```javascript
import styles from './MyComponent.module.css';
<div className={styles.container}>...</div>;
```

## Benefits

✅ **Clear hierarchy** - No more guessing which CSS wins
✅ **Prevents specificity wars** - Organized by specificity
✅ **Reusable patterns** - Objects and utilities
✅ **Better maintainability** - Find things easily
✅ **Scalable** - Add new layers as needed

## Impact

### Phase 2.1 (ITCSS Foundation)

- **CSS Bundle:** 182.47 kB (gzip: 34.12 kB)
- **Size Change:** +5.73 kB (+3.2% from Phase 1.3)
- **Added:** Utilities and layout objects

### Phase 2.3 (Breakpoints & Responsive)

- **CSS Bundle:** 186.83 kB (gzip: 34.68 kB)
- **Size Change:** +4.36 kB (+2.4% from Phase 2.1)
- **Added:** 18 breakpoint variables + 20+ responsive utilities
- **Total since Phase 1.0:** +19.92 kB (+11.9%)

**Verdict:** Acceptable - gaining organized architecture + responsive system

## Completed Phases

- ✅ **Phase 2.1:** ITCSS architecture foundation
- ✅ **Phase 2.2:** BEM naming convention standard (documentation)
- ✅ **Phase 2.3:** Standardized breakpoint variables

## Next Steps

- **Phase 3.1:** Remove unused CSS with PurgeCSS/UnCSS
- **Phase 3.2:** Optimize performance - remove global transitions
- **Phase 3.3:** Implement CSS linting with stylelint
