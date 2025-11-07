# Accessibility Quick Fix Guide - Meteo Weather App

Quick code examples for the most common issues found.

---

## 1. Add Form Labels

**BEFORE (Bad):**
```jsx
<input
  type="text"
  placeholder="Search..."
/>
```

**AFTER (Good):**
```jsx
<label htmlFor="search-input">Search for a location</label>
<input
  id="search-input"
  type="text"
  placeholder="Search..."
  aria-label="Search for a location"
/>
```

---

## 2. Add Page Heading

**BEFORE (Bad):**
```jsx
<div className="App">
  <header>{/* nav stuff */}</header>
  <main>
    {/* No H1! */}
    <h2>Location Info</h2>
  </main>
</div>
```

**AFTER (Good):**
```jsx
<div className="App">
  <header>{/* nav stuff */}</header>
  <main>
    <h1>Meteo Weather Dashboard</h1>
    <h2>Location Info</h2>
  </main>
</div>
```

---

## 3. Add Focus Indicators to Buttons

**BEFORE (Bad):**
```css
.button {
  padding: 8px 16px;
  border: none;
  outline: none;           /* BAD - removes focus! */
  background: #667eea;
}

.button:hover {
  background: #5568d3;
}
```

**AFTER (Good):**
```css
.button {
  padding: 8px 16px;
  border: 2px solid transparent;
  background: #667eea;
  cursor: pointer;
  transition: all 0.2s;
}

.button:hover {
  background: #5568d3;
}

.button:focus {
  outline: 3px solid #667eea;
  outline-offset: 2px;
}

.button:focus:not(:focus-visible) {
  outline: none;  /* Remove outline for mouse users */
}
```

---

## 4. Add aria-hidden to Decorative Emoji

**BEFORE (Bad):**
```jsx
<div className="weather-stat">
  <span>🌧️</span>  {/* Emoji announced to screen readers */}
  <span>Rain</span>
</div>
```

**AFTER (Good):**
```jsx
<div className="weather-stat">
  <span aria-hidden="true">🌧️</span>  {/* Hidden from screen readers */}
  <span>Rain</span>
</div>
```

Or if emoji is the only content:
```jsx
<div className="weather-stat" role="img" aria-label="Rainy conditions">
  <span aria-hidden="true">🌧️</span>
  <span aria-hidden="true">Rain</span>
</div>
```

---

## 5. Make Clickable Divs Keyboard Accessible

**BEFORE (Bad):**
```jsx
<div
  onClick={() => toggleAlert(index)}
  style={{ cursor: 'pointer' }}
>
  Click to expand
</div>
```

**AFTER (Good):**
```jsx
<div
  onClick={() => toggleAlert(index)}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      toggleAlert(index);
      e.preventDefault();
    }
  }}
  role="button"
  tabIndex={0}
  aria-expanded={isExpanded}
>
  Click to expand
</div>
```

Or better - use a button:
```jsx
<button
  onClick={() => toggleAlert(index)}
  aria-expanded={isExpanded}
>
  Click to expand
</button>
```

---

## 6. Add aria-labels to Icon-Only Buttons

**BEFORE (Bad):**
```jsx
<button onClick={toggleLayer}>
  💧
</button>
```

**AFTER (Good):**
```jsx
<button
  onClick={toggleLayer}
  aria-label="Toggle precipitation layer"
  aria-pressed={activeLayers.precipitation}
>
  <span aria-hidden="true">💧</span>
</button>
```

---

## 7. Fix Color Contrast

**BEFORE (Bad):**
```css
.label {
  color: #9ca3af;        /* Gray - borderline contrast */
  font-size: 12px;
}
```

**AFTER (Good):**
```css
.label {
  color: #4b5563;        /* Darker gray - better contrast */
  font-size: 13px;       /* Slightly larger */
  line-height: 1.5;      /* Better spacing */
}
```

**Check contrast:** https://webaim.org/resources/contrastchecker/

---

## 8. Add Form Error Announcements

**BEFORE (Bad):**
```jsx
{error && <p style={{ color: 'red' }}>{error}</p>}

<input
  type="email"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
/>
```

**AFTER (Good):**
```jsx
{error && (
  <div role="alert" aria-live="polite">
    {error}
  </div>
)}

<input
  id="email"
  type="email"
  aria-invalid={!!error}
  aria-describedby={error ? 'email-error' : undefined}
  value={email}
  onChange={(e) => setEmail(e.target.value)}
/>

{error && <span id="email-error">{error}</span>}
```

---

## 9. Improve Small Font Readability

**BEFORE (Bad):**
```css
.label {
  font-size: 11px;           /* Too small */
  text-transform: uppercase;  /* Makes small text harder to read */
  letter-spacing: 0.5px;     /* Adds extra spacing to small text */
  line-height: 1;            /* No line spacing */
}
```

**AFTER (Good):**
```css
.label {
  font-size: 13px;           /* Larger */
  /* text-transform: uppercase; */ /* Remove or use font-variant: small-caps */
  letter-spacing: normal;     /* Normal spacing */
  line-height: 1.4;          /* Better line spacing */
  font-weight: 600;          /* Bold helps readability */
}
```

---

## 10. Add Reduced Motion Support

**BEFORE (Bad):**
```css
.loading {
  animation: spin 1s linear infinite;  /* Always animates */
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
```

**AFTER (Good):**
```css
.loading {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@media (prefers-reduced-motion: reduce) {
  .loading {
    animation: none;
    opacity: 0.6;
  }
  
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 11. Proper Modal Accessibility

**BEFORE (Bad):**
```jsx
<div onClick={onClose}>
  <div onClick={(e) => e.stopPropagation()}>
    <h3>Confirm Location</h3>
    <p>Is this correct?</p>
    <button onClick={onConfirm}>Yes</button>
  </div>
</div>
```

**AFTER (Good):**
```jsx
const modalRef = useRef(null);

<div
  className="modal-overlay"
  onClick={onClose}
  role="presentation"
>
  <div
    ref={modalRef}
    className="modal"
    role="alertdialog"
    aria-modal="true"
    aria-labelledby="modal-title"
    aria-describedby="modal-desc"
  >
    <h3 id="modal-title">Confirm Location</h3>
    <p id="modal-desc">Is this correct?</p>
    <button onClick={onConfirm}>Yes</button>
    <button onClick={onClose}>Cancel</button>
  </div>
</div>

// Add focus trap and restoration:
useEffect(() => {
  const modal = modalRef.current;
  if (!modal) return;
  
  const focusableElements = modal.querySelectorAll(
    'button, [href], input, [tabindex]:not([tabindex="-1"])'
  );
  
  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];
  
  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onClose();
      return;
    }
    
    if (e.key === 'Tab') {
      if (e.shiftKey && document.activeElement === firstElement) {
        lastElement.focus();
        e.preventDefault();
      } else if (!e.shiftKey && document.activeElement === lastElement) {
        firstElement.focus();
        e.preventDefault();
      }
    }
  };
  
  modal.addEventListener('keydown', handleKeyDown);
  firstElement?.focus();  // Set initial focus
  
  return () => {
    modal.removeEventListener('keydown', handleKeyDown);
    // Restore focus to trigger element
    const triggerElement = document.querySelector('[data-trigger]');
    triggerElement?.focus();
  };
}, [onClose]);
```

---

## 12. Add Skip Links

**BEFORE (Bad - No skip links):**
```jsx
<nav>{/* Nav items */}</nav>
<main>{/* Content */}</main>
```

**AFTER (Good):**
```jsx
<nav className="skip-to-content">
  <a href="#main-content">Skip to main content</a>
  <a href="#search">Skip to search</a>
</nav>

<nav>{/* Nav items */}</nav>

<main id="main-content">
  <section id="search">{/* Search */}</section>
  {/* Content */}
</main>
```

**CSS:**
```css
.skip-to-content {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 9999;
}

.skip-to-content a {
  position: absolute;
  top: -100px;
  left: 0;
  background: #667eea;
  color: white;
  padding: 12px 24px;
  text-decoration: none;
}

.skip-to-content a:focus {
  top: 0;
}
```

---

## Testing Checklist

Quick verification before committing:

- [ ] Inputs have labels or aria-labels
- [ ] Page has H1 heading
- [ ] Headings follow hierarchy (no H1→H3 jumps)
- [ ] All buttons/links work with Tab + Enter
- [ ] Button focus is visible
- [ ] Decorative emoji have aria-hidden="true"
- [ ] Icon buttons have aria-labels
- [ ] Forms show error messages
- [ ] Modals have role="dialog" and manage focus
- [ ] Color contrast is sufficient (check with axe or WAVE)

---

## Most Common Issues in This App

1. **LocationSearchBar:** Add aria-labels and focus indicators
2. **WeatherDashboard:** Add H1 heading at top
3. **RadarMap:** Add aria-labels to layer toggle buttons
4. **WeatherAlertsBanner:** Make expandable divs keyboard accessible
5. **AuthModal:** Add aria-invalid and error announcements
6. **All Components:** Add :focus CSS to buttons/inputs

---

## Resources

- **WCAG 2.1 Checklist:** https://www.w3.org/WAI/WCAG21/quickref/
- **ARIA Patterns:** https://www.w3.org/WAI/ARIA/apg/patterns/
- **Color Contrast Checker:** https://webaim.org/resources/contrastchecker/
- **axe DevTools:** https://www.deque.com/axe/devtools/
- **WAVE Browser Extension:** https://wave.webaim.org/extension/

---

**Need more help?** See the full detailed report: `/ACCESSIBILITY_AUDIT_REPORT.md`
