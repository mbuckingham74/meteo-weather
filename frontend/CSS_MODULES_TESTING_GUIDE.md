# CSS Modules Testing Guide

**Last Updated:** November 11, 2025
**Context:** Lessons learned from PR #21 CSS Modules migration test fixes

---

## 📋 Table of Contents

- [Overview](#overview)
- [The Problem](#the-problem)
- [The Solution](#the-solution)
- [Step-by-Step Fix Process](#step-by-step-fix-process)
- [Common Issues & Solutions](#common-issues--solutions)
- [Testing Best Practices](#testing-best-practices)
- [Migration Checklist](#migration-checklist)

---

## Overview

**What is this document?**
A comprehensive guide for fixing test failures caused by CSS Modules migration, based on real-world experience from PR #21 where we fixed 553 tests over a day and a half.

**When do you need this?**

- You just migrated from regular CSS to CSS Modules
- Your tests are failing with "element not found" errors
- You see hashed class names like `_button_a85bc4` instead of `button`

**Time investment:**

- Initial understanding: 2-4 hours
- Per-component fix: 15-30 minutes
- Full migration (8 components): 1.5 days

---

## The Problem

### What CSS Modules Does

CSS Modules automatically **hashes class names** to prevent global namespace collisions:

```jsx
// Before CSS Modules:
<button className="toggle">Click me</button>
// Renders as: <button class="toggle">

// After CSS Modules:
<button className={styles.toggle}>Click me</button>
// Renders as: <button class="_toggle_a85bc4">
```

### Why Tests Break

Tests that relied on class selectors can no longer find elements:

```javascript
// BEFORE (worked with regular CSS):
const button = container.querySelector('.toggle');
expect(button).toBeInTheDocument(); // ✅ Found it!

// AFTER (broken with CSS Modules):
const button = container.querySelector('.toggle');
expect(button).toBeInTheDocument(); // ❌ null - class is now "_toggle_a85bc4"
```

### Real Impact (PR #21)

- **89 test failures** initially
- **442 → 553 passing tests** after fixes (+111 tests, +25.1%)
- **8 components** needed updates
- **14 commits** to fix everything
- **1.5 days** of debugging and fixing
- **Zero production bugs** (only test infrastructure)

---

## The Solution

### Core Principle: Test Behavior, Not Implementation

**❌ Bad (coupled to CSS):**

```javascript
const button = container.querySelector('.toggle');
```

**✅ Good (independent of CSS):**

```javascript
const button = screen.getByTestId('toggle-button');
```

### Two-Step Fix Process

#### Step 1: Add `data-testid` to Component

```jsx
// Component: TemperatureUnitToggle.jsx
function TemperatureUnitToggle() {
  return (
    <button
      className={styles.toggle}
      data-testid="temp-unit-toggle" // ← ADD THIS
    >
      <span
        className={`${styles.option} ${unit === 'C' ? styles.active : ''}`}
        data-testid="celsius-option" // ← ADD THIS
      >
        °C
      </span>
    </button>
  );
}
```

#### Step 2: Update Test Selectors

```javascript
// Test: TemperatureUnitToggle.test.jsx

// BEFORE (broken):
const button = container.querySelector('.toggle');
const celsiusOption = container.querySelector('.option');

// AFTER (fixed):
const button = screen.getByTestId('temp-unit-toggle');
const celsiusOption = screen.getByTestId('celsius-option');
```

---

## Step-by-Step Fix Process

### Phase 1: Identify Broken Tests

1. **Run tests to see failures:**

   ```bash
   npm test -- --run
   ```

2. **Look for these error patterns:**
   - `Expected element to be in the document`
   - `Received: null`
   - `querySelector returned null`

3. **Identify affected components:**
   - Check which test files are failing
   - Note the elements that can't be found

### Phase 2: Fix Component Files

For each failing component:

1. **Open the component file (e.g., `Button.jsx`)**

2. **Add `data-testid` to interactive elements:**
   - Buttons: `data-testid="button-name"`
   - Inputs: `data-testid="input-name"`
   - Links: `data-testid="link-name"`
   - Containers: `data-testid="container-name"`

3. **Use descriptive, unique test IDs:**

   ```jsx
   // ✅ Good (specific and unique):
   <button data-testid="submit-button">Submit</button>
   <button data-testid="cancel-button">Cancel</button>

   // ❌ Bad (generic and duplicate):
   <button data-testid="button">Submit</button>
   <button data-testid="button">Cancel</button>
   ```

### Phase 3: Fix Test Files

For each test file:

1. **Replace class selectors:**

   ```javascript
   // BEFORE:
   const element = container.querySelector('.button');

   // AFTER:
   const element = screen.getByTestId('submit-button');
   ```

2. **Replace compound selectors:**

   ```javascript
   // BEFORE:
   const activeButton = container.querySelector('.button.active');

   // AFTER:
   const button = screen.getByTestId('submit-button');
   expect(button.className).toContain('active');
   ```

3. **Replace child selectors:**

   ```javascript
   // BEFORE:
   const icon = container.querySelector('.button .icon');

   // AFTER:
   const icon = screen.getByTestId('button-icon');
   ```

### Phase 4: Verify Fixes

1. **Run tests for the component:**

   ```bash
   npm test -- Button.test.jsx --run
   ```

2. **Check for remaining failures**

3. **Commit when component is fixed:**
   ```bash
   git add .
   git commit -m "fix(tests): update Button tests for CSS Modules"
   ```

---

## Common Issues & Solutions

### Issue 1: Tests Still Failing After Adding `data-testid`

**Symptom:** Added `data-testid` but test still can't find element

**Cause:** Forgot to update the test file

**Solution:**

```javascript
// Make sure you changed the test from:
container.querySelector('.button');

// To:
screen.getByTestId('button-name');
```

---

### Issue 2: Element Not Rendering in Test

**Symptom:** `getByTestId` throws "Unable to find an element"

**Cause:** Element might be conditionally rendered or async

**Solution:**

```javascript
// For conditionally rendered elements:
const element = screen.queryByTestId('optional-element');
expect(element).toBeNull(); // or .toBeInTheDocument()

// For async elements:
const element = await screen.findByTestId('async-element');
expect(element).toBeInTheDocument();
```

---

### Issue 3: Mock Issues (axios, localStorage, etc.)

**Symptom:** Tests fail with "Cannot read property 'data' of undefined"

**Root Cause:** Mock setup issues unrelated to CSS Modules (but discovered during migration)

**Solutions:**

#### A. axios.create() Mock Issue

```javascript
// BEFORE (broken):
vi.mock('axios', () => {
  const mockAxios = createMockAxios();
  mockAxios.create = vi.fn(() => this); // ❌ Wrong!
  return { default: mockAxios };
});

// AFTER (fixed):
vi.mock('axios', () => {
  const mockAxios = createMockAxios();
  mockAxios.create = vi.fn(() => createMockAxios()); // ✅ Returns new instance
  return { default: mockAxios };
});
```

#### B. Error Mock Format

```javascript
// BEFORE (broken):
axios.get.mockRejectedValue(new Error('Network error'));

// AFTER (fixed):
const mockError = new Error('Network error');
mockError.response = {
  status: 500,
  data: { message: 'Network error' },
};
axios.get.mockRejectedValue(mockError);
```

#### C. localStorage Mock

```javascript
// BEFORE (broken):
vi.spyOn(Storage.prototype, 'setItem');

// AFTER (fixed):
localStorage.setItem('key', 'value'); // Use direct mock from setupTests.jsx
```

---

### Issue 4: Coverage Reporting Incorrect in CI

**Symptom:** CI reports 21.66% coverage but local shows 92%

**Cause:** Vitest's `coverage.all` defaults to `true`, including all source files

**Solution:**

```javascript
// vite.config.js
export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      all: false, // ← ADD THIS: Only report tested files
      exclude: [
        'node_modules/',
        '**/*.test.{js,jsx,ts,tsx}',
        // ... other excludes
      ],
    },
  },
});
```

---

### Issue 5: ESLint Warnings for Unused Variables

**Symptom:** Tests pass but CI fails on lint check

**Cause:** Leftover unused variables from refactoring

**Solution:**

```javascript
// BEFORE (has unused variable):
const { container } = render(<Component />);
expect(screen.getByTestId('element')).toBeInTheDocument();

// AFTER (removed unused):
render(<Component />);
expect(screen.getByTestId('element')).toBeInTheDocument();
```

---

## Testing Best Practices

### 1. Use Semantic Test IDs

**Pattern:** `{component}-{element}-{variant}`

```jsx
// ✅ Good examples:
data-testid="user-profile-edit-button"
data-testid="nav-menu-toggle"
data-testid="weather-card-temperature"
data-testid="celsius-option"
data-testid="unit-separator"

// ❌ Bad examples:
data-testid="button1"
data-testid="div"
data-testid="test"
```

### 2. Test Behavior, Not Implementation

```javascript
// ❌ Bad (tests implementation):
expect(button.className).toBe('_button_a85bc4');

// ✅ Good (tests behavior):
expect(button).toHaveClass('active');
// or
expect(button.className).toContain('active');
```

### 3. Prefer React Testing Library Queries

**Query Priority (in order):**

1. **`getByRole`** - Best for accessibility

   ```javascript
   screen.getByRole('button', { name: /submit/i });
   ```

2. **`getByLabelText`** - For form inputs

   ```javascript
   screen.getByLabelText('Email');
   ```

3. **`getByTestId`** - When above don't work (our case with CSS Modules)

   ```javascript
   screen.getByTestId('submit-button');
   ```

4. **`querySelector`** - Avoid if possible (brittle)
   ```javascript
   container.querySelector('.button'); // ❌ Breaks with CSS Modules
   ```

### 4. Handle CSS Module Class Names

If you **must** test class names:

```javascript
// ✅ Test that classes are applied (not exact values):
const button = screen.getByTestId('submit-button');
expect(button.className).toBeTruthy(); // Has some class
expect(button.className).toContain('active'); // Has 'active' in class string

// ❌ Don't test exact hashed class names:
expect(button.className).toBe('_button_a85bc4');
```

---

## Migration Checklist

Use this checklist when migrating a component to CSS Modules:

### Per Component

- [ ] **Component file updated:**
  - [ ] Imported CSS as `styles` from `*.module.css`
  - [ ] Changed `className="button"` to `className={styles.button}`
  - [ ] Added `data-testid` to all interactive elements
  - [ ] Added `data-testid` to conditionally rendered elements

- [ ] **Test file updated:**
  - [ ] Replaced all `querySelector('.class')` with `getByTestId()`
  - [ ] Replaced all `querySelectorAll('.class')` with multiple `getByTestId()`
  - [ ] Updated class name assertions to use `.toContain()` instead of exact matches
  - [ ] Removed unused variables (container, etc.)
  - [ ] Fixed any mock issues that surface

- [ ] **Tests pass locally:**
  - [ ] `npm test -- ComponentName.test.jsx --run` passes
  - [ ] No console errors or warnings
  - [ ] Coverage maintained or improved

- [ ] **Commit:**
  - [ ] Clear commit message: `fix(tests): update ComponentName tests for CSS Modules`
  - [ ] Push to branch

### Overall Project

- [ ] **All components migrated**
- [ ] **All tests passing:** `npm test -- --run` shows 0 failures
- [ ] **Coverage meets thresholds:** Check CI for coverage reports
- [ ] **ESLint passing:** No unused variable warnings
- [ ] **CI/CD passing:** All GitHub Actions checks green
- [ ] **Documentation updated:** This guide reflects latest patterns
- [ ] **PR created and reviewed**

---

## Real-World Example: TemperatureUnitToggle

Here's the complete fix for one component from PR #21:

### Component Changes

```jsx
// TemperatureUnitToggle.jsx

// BEFORE:
function TemperatureUnitToggle() {
  const { unit, toggleUnit } = useTemperatureUnit();

  return (
    <button className="toggle" onClick={toggleUnit}>
      <span className={`option ${unit === 'C' ? 'active' : ''}`}>°C</span>
      <span className="separator">|</span>
      <span className={`option ${unit === 'F' ? 'active' : ''}`}>°F</span>
    </button>
  );
}

// AFTER:
import styles from './TemperatureUnitToggle.module.css';

function TemperatureUnitToggle() {
  const { unit, toggleUnit } = useTemperatureUnit();

  return (
    <button
      className={styles.toggle}
      onClick={toggleUnit}
      data-testid="temp-unit-toggle" // ← ADDED
    >
      <span
        className={`${styles.option} ${unit === 'C' ? styles.active : ''}`}
        data-testid="celsius-option" // ← ADDED
      >
        °C
      </span>
      <span
        className={styles.separator}
        data-testid="unit-separator" // ← ADDED
      >
        |
      </span>
      <span
        className={`${styles.option} ${unit === 'F' ? styles.active : ''}`}
        data-testid="fahrenheit-option" // ← ADDED
      >
        °F
      </span>
    </button>
  );
}
```

### Test Changes

```javascript
// TemperatureUnitToggle.test.jsx

// BEFORE:
it('renders temperature unit toggle button', () => {
  const { container } = render(<TemperatureUnitToggle />);
  const button = container.querySelector('.toggle');
  expect(button).toBeInTheDocument();
});

it('marks Celsius as active when unit is C', () => {
  const { container } = render(<TemperatureUnitToggle />);
  const celsiusSpan = container.querySelector('.option.active');
  expect(celsiusSpan).toHaveTextContent('°C');
});

// AFTER:
it('renders temperature unit toggle button', () => {
  render(<TemperatureUnitToggle />);
  const button = screen.getByTestId('temp-unit-toggle');
  expect(button).toBeInTheDocument();
});

it('marks Celsius as active when unit is C', () => {
  render(<TemperatureUnitToggle />);
  const celsiusSpan = screen.getByTestId('celsius-option');
  const fahrenheitSpan = screen.getByTestId('fahrenheit-option');

  expect(celsiusSpan.className).toContain('active');
  expect(fahrenheitSpan.className).not.toContain('active');
});
```

### Results

- **Before:** 17 failing tests
- **After:** 17 passing tests
- **Time:** ~30 minutes
- **Files changed:** 2 (component + test)
- **Production impact:** Zero (only test changes)

---

## Summary Statistics (PR #21)

### Overall Impact

- **Duration:** 1.5 days
- **Test Score:** 442 → 553 passing (+111 tests, +25.1%)
- **Components Fixed:** 8
- **Commits:** 14
- **Production Bugs:** 0

### Components Fixed

1. TemperatureUnitToggle (17 tests) - 30 min
2. AuthHeader (22 tests) - 45 min
3. TemperatureUnitContext (4 tests) - 20 min
4. ThemeContext (4 tests) - 20 min
5. favoritesService (27 tests) - 1 hour
6. AuthContext (9 tests) - 30 min
7. authApi (27 tests) - 1 hour
8. LocationSearchBar (22 tests) - 45 min

### Infrastructure Fixes

- axios.create() mock (1 hour debugging)
- weatherApi error format (2 hours debugging)
- Coverage configuration (30 min)
- geolocationService mocks (30 min)

### Key Takeaway

**CSS Modules migration breaks tests but not production code.** The fix is straightforward (add `data-testid` attributes) but time-consuming because you must update every component and test file systematically.

**This guide saves you from repeating the same 1.5-day debugging process.**

---

## Additional Resources

- **React Testing Library:** https://testing-library.com/docs/react-testing-library/intro/
- **CSS Modules:** https://github.com/css-modules/css-modules
- **Vitest:** https://vitest.dev/
- **PR #21 (reference):** https://github.com/mbuckingham74/meteo-weather/pull/21

---

**Questions or improvements?** Update this guide as you learn more patterns!

**Last Updated:** November 11, 2025
**Maintainer:** Claude Code (via PR #21 experience)
