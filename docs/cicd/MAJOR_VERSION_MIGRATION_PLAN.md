# Major Version Migration Plan

**Created:** November 10, 2025
**Status:** Planning Phase
**Related:** [CI/CD Refactor Summary](CICD_REFACTOR_NOV10_2025.md)

## Overview

This document outlines the migration strategy for major version updates that were identified by Dependabot but require careful planning and testing due to breaking changes.

## Closed PRs Requiring Migration

The following Dependabot PRs were closed because they contain major version updates with breaking changes:

| PR # | Package | Current → Target | Priority | Complexity |
|------|---------|------------------|----------|------------|
| #14 | eslint | 8.57.1 → 9.39.1 | High | High |
| #4 | express | 4.21.2 → 5.1.0 | High | High |
| #17 | vitest | 3.x → 4.x | Medium | High |
| #17 | jsdom | 26.x → 27.x | Medium | Medium |
| #10 | @testing-library/user-event | 13.5.0 → 14.6.1 | Low | Low |
| #7 | web-vitals | 2.1.4 → 5.1.0 | Low | Low |
| #8 | dotenv | 16.6.1 → 17.2.3 | Low | Low |
| #20 | GitHub Actions | v4 → v5/v6 | Low | Medium |

## Migration Phases

### Phase 1: Critical Infrastructure (High Priority)

#### 1.1 ESLint 8 → 9 Migration
**Status:** Not Started
**Target Date:** Q1 2026
**Estimated Effort:** 4-8 hours

**Breaking Changes:**
- Flat config system (replaces `.eslintrc.*`)
- Changed API for custom rules
- Removed/deprecated rules
- New default behaviors

**Migration Steps:**
1. Read [ESLint v9 Migration Guide](https://eslint.org/docs/latest/use/migrate-to-9.0.0)
2. Create `eslint.config.js` (flat config)
3. Convert existing `.eslintrc.js` rules
4. Update CI/CD workflows (if needed)
5. Test locally across all files
6. Fix any new linting errors
7. Update pre-commit hooks
8. Deploy and monitor

**Risk Assessment:** Medium
- May break existing custom rules
- Potential for new linting errors across codebase
- Could affect development workflow

**Rollback Plan:**
- Revert to ESLint 8.57.1
- Keep `.eslintrc.js` as backup during migration

---

#### 1.2 Express 4 → 5 Migration
**Status:** Not Started
**Target Date:** Q2 2026
**Estimated Effort:** 8-16 hours

**Breaking Changes:**
- Removed middleware (body-parser now built-in)
- Changed error handling behavior
- Updated routing syntax
- Removed deprecated methods
- Changed response behavior

**Migration Steps:**
1. Read [Express 5 Migration Guide](https://expressjs.com/en/guide/migrating-5.html)
2. Audit codebase for deprecated methods
3. Update error handling middleware
4. Remove `body-parser` dependency (now built-in)
5. Update routing patterns if needed
6. Run full test suite (476 tests)
7. Test all API endpoints manually
8. Deploy to staging environment
9. Monitor for 24-48 hours
10. Deploy to production

**Risk Assessment:** High
- Core framework change affects all backend routes
- Potential for subtle behavioral changes
- Could break authentication/authorization
- May affect rate limiting middleware

**Rollback Plan:**
- Maintain Express 4 branch
- Database schema unchanged (no rollback needed)
- Can revert with git + redeploy

**Testing Requirements:**
- All 476 tests must pass
- Manual testing of all API endpoints
- Load testing on staging
- Security scanning
- Rate limiting verification

---

### Phase 2: Testing Infrastructure (Medium Priority)

#### 2.1 Vitest 3 → 4 + jsdom 26 → 27 Migration
**Status:** Not Started
**Target Date:** Q2 2026
**Estimated Effort:** 4-8 hours

**Breaking Changes:**
- Vitest 4: Changed test reporter API, updated snapshot format, removed deprecated config options
- jsdom 27: Updated DOM implementation, changed event handling

**Migration Steps:**
1. Read [Vitest 4 Migration Guide](https://vitest.dev/guide/migration.html)
2. Update `vitest.config.js`
3. Update test reporters (if custom)
4. Regenerate snapshots if needed
5. Update jsdom configuration
6. Run full frontend test suite
7. Fix any breaking tests
8. Update CI/CD test workflows
9. Monitor test reliability for 1 week

**Risk Assessment:** Medium
- Could break existing tests (especially LocationContext tests that are already skipped)
- May require snapshot regeneration
- Test reliability could be affected

**Dependencies:**
- Should be done AFTER ESLint 9 migration (to avoid compound issues)
- Requires stable CI/CD pipeline

---

### Phase 3: Low Priority Updates (Low Priority)

#### 3.1 @testing-library/user-event 13 → 14
**Status:** Not Started
**Target Date:** Q3 2026
**Estimated Effort:** 2-4 hours

**Breaking Changes:**
- Changed API for user interactions
- Updated default behaviors

**Migration Steps:**
1. Read [user-event v14 changelog](https://github.com/testing-library/user-event/releases/tag/v14.0.0)
2. Update test files using `userEvent`
3. Run frontend tests
4. Fix any breaking tests

**Risk Assessment:** Low
- Only affects test code
- Easy to revert

---

#### 3.2 web-vitals 2 → 5
**Status:** Not Started
**Target Date:** Q3 2026
**Estimated Effort:** 1-2 hours

**Breaking Changes:**
- Changed metrics API
- Updated reporting format

**Migration Steps:**
1. Read [web-vitals v5 changelog](https://github.com/GoogleChrome/web-vitals/releases)
2. Update `reportWebVitals.js`
3. Test in dev and production
4. Verify metrics are logged correctly

**Risk Assessment:** Low
- Only affects analytics
- No user-facing impact

---

#### 3.3 dotenv 16 → 17
**Status:** Not Started
**Target Date:** Q3 2026
**Estimated Effort:** 1 hour

**Breaking Changes:**
- Changed configuration API
- Updated environment variable handling

**Migration Steps:**
1. Read [dotenv v17 changelog](https://github.com/motdotla/dotenv/releases)
2. Update dotenv usage in backend
3. Test environment loading locally
4. Deploy and verify

**Risk Assessment:** Low
- Minimal changes expected
- Easy to test and revert

---

### Phase 4: GitHub Actions Updates (Low Priority)

#### 4.1 Node.js 24 Compatibility
**Status:** Blocked - Waiting for ecosystem support
**Target Date:** Q4 2026
**Estimated Effort:** 2-4 hours

**Issue:**
- GitHub Actions v5/v6 require Node.js 24
- Node.js 24 is still in Active LTS (not stable for production)
- May have compatibility issues with current dependencies

**Migration Steps:**
1. Monitor Node.js 24 stability
2. Wait for Vitest/Jest Node 24 compatibility
3. Update CI workflows to `actions/checkout@v5`, `actions/setup-node@v5`, etc.
4. Test all CI workflows
5. Monitor for failures

**Risk Assessment:** Low
- Only affects CI/CD (not production)
- Can revert easily

---

## General Migration Best Practices

### Pre-Migration Checklist
- ✅ Create dedicated feature branch
- ✅ Backup current configuration files
- ✅ Document current behavior
- ✅ Ensure all tests pass on current version
- ✅ Review migration guide thoroughly
- ✅ Identify breaking changes
- ✅ Plan rollback strategy

### During Migration
- ✅ Update dependencies incrementally (one at a time if possible)
- ✅ Run tests after each change
- ✅ Commit frequently with clear messages
- ✅ Document any issues encountered
- ✅ Update relevant documentation

### Post-Migration
- ✅ Run full test suite (476 tests)
- ✅ Manual testing of critical paths
- ✅ Deploy to staging/beta environment
- ✅ Monitor for 24-48 hours
- ✅ Check error logs and metrics
- ✅ Update CLAUDE.md with changes
- ✅ Deploy to production
- ✅ Monitor for another 48 hours

### Rollback Criteria
Rollback immediately if:
- Test suite fails with >5% failure rate
- Critical functionality breaks (auth, weather data, AI)
- Security vulnerabilities introduced
- Performance degrades by >20%
- Error rate increases by >10%

---

## Timeline Summary

```
Q1 2026: ESLint 9 Migration
Q2 2026: Express 5 Migration + Vitest 4 Migration
Q3 2026: Low priority updates (user-event, web-vitals, dotenv)
Q4 2026: Node 24 + GitHub Actions v5/v6 (if stable)
```

---

## Resource Links

### Official Migration Guides
- [ESLint v9 Migration](https://eslint.org/docs/latest/use/migrate-to-9.0.0)
- [Express 5 Migration](https://expressjs.com/en/guide/migrating-5.html)
- [Vitest Migration](https://vitest.dev/guide/migration.html)
- [Node.js Release Schedule](https://nodejs.org/en/about/previous-releases)

### Related Documentation
- [CI/CD Refactor Summary](CICD_REFACTOR_NOV10_2025.md)
- [CI/CD Developer Guide](DEVELOPER_GUIDE.md)
- [Branching Strategy](../development/BRANCHING_STRATEGY.md)

---

## Decision Log

| Date | Decision | Rationale |
|------|----------|-----------|
| 2025-11-10 | Closed major update PRs #4, #7, #8, #10, #14 | Breaking changes require dedicated migration planning |
| 2025-11-10 | Prioritized ESLint 9 as Phase 1 | Affects development workflow and code quality |
| 2025-11-10 | Delayed Node 24 migration to Q4 2026 | Waiting for ecosystem stability |
| 2025-11-10 | Express 5 as high priority | Core framework affects all backend routes |

---

## Notes

- **Auto-merge still works:** Patch and minor updates continue to auto-merge via Dependabot workflow
- **Security first:** All migrations will include security scanning and vulnerability checks
- **Test reliability:** All 476 tests must pass before any migration is considered complete
- **Documentation:** CLAUDE.md will be updated after each successful migration
- **Monitoring:** All migrations require 48-hour monitoring period post-deployment

---

**Last Updated:** November 10, 2025
**Next Review:** Q1 2026 (before ESLint migration)
