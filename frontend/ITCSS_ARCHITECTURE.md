# ITCSS Architecture - Phase 2.1 Complete ✅

**ITCSS (Inverted Triangle CSS)** organizes CSS by specificity, from least specific (settings) to most specific (utilities). This creates a clear hierarchy and prevents specificity wars.

## Structure

```
src/styles/
├── main.css                    # Main entry point (imports all layers)
├── itcss/
│   ├── settings/
│   │   └── _variables.css      # CSS custom properties
│   ├── tools/                  # (Empty - for future mixins if needed)
│   ├── generic/
│   │   └── _reset.css          # CSS reset, normalize
│   ├── elements/
│   │   └── _base.css           # Base HTML elements
│   ├── objects/
│   │   └── _layout.css         # Layout patterns (.o- prefix)
│   ├── components/             # (Component CSS handled separately)
│   └── utilities/
│       └── _helpers.css        # Utility classes (.u- prefix)
```

## IT

CSS Layers

### Layer 1: Settings

**Files:** `itcss/settings/_variables.css`
**Purpose:** CSS custom properties, configuration
**Output:** Variable definitions only
**Example:**

```css
:root {
  --spacing-md: 12px;
  --font-base: 14px;
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

**Files:** `itcss/utilities/_helpers.css`
**Purpose:** Helper classes (highest specificity)
**Naming:** `.u-` prefix
**Use:** `!important` to ensure they always win
**Example:**

```css
.u-text-center {
  text-align: center !important;
}

.u-mb-lg {
  margin-bottom: var(--spacing-lg) !important;
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

- **CSS Bundle:** 182.47 kB (gzip: 34.12 kB)
- **Size Change:** +5.73 kB (+3.2%)
- **Reason:** Added utilities and layout objects
- **Acceptable:** Gaining organized structure and reusable patterns

## Next Steps

- Phase 2.2: Standardize BEM naming convention
- Phase 2.3: Create standardized breakpoint variables
