# Global CSS Refactor - Phase 3.3 Complete

**Date:** November 10, 2025  
**Status:** ✅ Complete  
**Goal:** Enforce the `transition` property guardrails introduced in Phase 3.2 through automated linting in local dev, CI, and pre-commit hooks.

---

## Executive Summary

Phase 3.3 closes the loop on the `transition: all` eradication work by making the rule an enforced, automated check everywhere code runs. Stylelint now blocks the anti-pattern via:

- Project-wide scripts (`npm run lint` / `npm run lint:frontend`) so contributors can’t skip the check
- Husky pre-commit via `lint-staged`, ensuring staged CSS is auto-fixed or rejected
- GitHub Actions (frontend lint job) so CI fails if the rule is violated

With these guardrails, the 24-instance cleanup from Phase 3.2 cannot regress without being caught immediately.

---

## Implementation Details

### 1. Stylelint Configuration (Existing, Now Enforced)

- `frontend/.stylelintrc.json` already extends `stylelint-config-standard`
- Added regex rule previously (`transition` disallows `/^all/`)
- Phase 3.3 focuses on wiring this config into every workflow entry point

### 2. Root Lint Scripts (New)

| Script | Before | After |
|--------|--------|-------|
| `npm run lint:frontend` | ESLint only | ESLint **and** Stylelint |
| `npm run lint:fix:frontend` | ESLint --fix only | ESLint --fix **and** Stylelint --fix |

These updates ensure any contributor running the usual `npm run lint` or `npm run lint:fix` automatically triggers CSS validation.

### 3. Pre-Commit Hook Coverage

- `.husky/pre-commit` already runs `npx lint-staged` inside `frontend/`
- `lint-staged` runs `stylelint --fix` on staged CSS, so violations are blocked before commit
- Documented in this phase to make the enforcement strategy explicit

### 4. CI Enforcement

- `.github/workflows/ci.yml` `frontend-lint` job runs `npm run lint:css`
- With the script updates, CI now mirrors local `npm run lint`, preventing config drift

---

## Verification

1. `npm run lint` → runs ESLint + Stylelint (frontend) and ESLint (backend)
2. `npm run lint:fix` → auto-fixes JS/JSX and CSS lint issues
3. `npx husky .husky/pre-commit` (via `git commit`) → runs lint-staged → Stylelint
4. Pull request → CI `frontend-lint` job fails fast if `transition: all` sneaks back in

---

## Results

- ✅ Guaranteed enforcement of the `transition` property whitelist
- ✅ Zero additional bundle size or runtime impact (static analysis only)
- ✅ Developers get immediate feedback locally and in CI

---

## Next Steps

1. **PostCSS Custom Media Tokens** – share breakpoint definitions between CSS + JS (Phase 3.4 target).
2. **Component Token Catalog + Theme Presets** – document token usage and ship preset themes.
3. **Automated Token Tests** – ensure new CSS sticks to the token system.

These items remain on the “Today” To-Do for completion after Phase 3.3.

---

**Documentation Date:** November 10, 2025  
**Author:** Codex (GPT-5)  
**Phase Status:** Phase 3.3 ✅ Complete
