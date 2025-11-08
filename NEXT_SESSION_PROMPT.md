# CSS Refactor Phase 3 - Session Startup Prompt

**Copy-paste this entire prompt into a new Claude Code session to continue exactly where we left off:**

---

Hi Claude! Please read **CLAUDE.md** to get up to speed on the Meteo Weather App project.

After you've read CLAUDE.md, here's what we just completed and what comes next:

## ✅ Just Completed: Global CSS Refactor - Phase 2 (Phases 2.1-2.3)

We just finished Phase 2 of a comprehensive CSS refactor. Here's what was accomplished:

**Phase 2.1: ITCSS Architecture** (commit: dc8af8d)
- Implemented Inverted Triangle CSS architecture
- Created 7-layer system (Settings → Tools → Generic → Elements → Objects → Components → Utilities)
- Added 60+ layout objects with `.o-` prefix
- Added 80+ utility classes with `.u-` prefix
- CSS bundle: 176.74 kB → 182.47 kB (+5.73 kB, +3.2%)

**Phase 2.2: BEM Naming Convention** (documentation-based)
- Established BEM (Block__Element--Modifier) as standard for NEW code only
- Created comprehensive documentation (512 lines) in [frontend/BEM_NAMING_CONVENTION.md](frontend/BEM_NAMING_CONVENTION.md)
- Strategic decision: Keep existing CSS as-is (8,390 lines across 14 files)
- Zero risk, zero code changes, established clear standards

**Phase 2.3: Standardized Breakpoint System** (commit: c57cacf)
- Created 18 responsive breakpoint variables in [frontend/src/styles/itcss/settings/_breakpoints.css](frontend/src/styles/itcss/settings/_breakpoints.css)
- Added 20+ responsive utility classes in [frontend/src/styles/itcss/utilities/_responsive.css](frontend/src/styles/itcss/utilities/_responsive.css)
- Eliminated 7 inconsistent hardcoded breakpoints (768px, 640px, 480px, etc.)
- Mobile-first approach with desktop-first fallback
- Comprehensive documentation (600+ lines) in [frontend/BREAKPOINT_SYSTEM.md](frontend/BREAKPOINT_SYSTEM.md)
- CSS bundle: 182.47 kB → 186.83 kB (+4.36 kB, +2.4%)

**Total Phase 2 Impact:**
- CSS Bundle: 167 kB (Phase 1.0) → 186.83 kB (+19.92 kB, +11.9%)
- Documentation: 2,000+ lines across multiple files
- Zero breaking changes (all existing code preserved)
- Organized architecture + responsive system + clear standards
- Latest commit: `c57cacf feat: Global CSS Refactor - Phase 2 Complete (ITCSS, BEM, Breakpoints)`
- Deployed to production: https://meteo-beta.tachyonfuture.com

## 🎯 Next: Phase 3 - Optimization & Quality

We need to continue with **Phase 3**, which has three parts:

### Phase 3.1: Remove Unused CSS with PurgeCSS/UnCSS
**Goal:** Analyze the production build and remove unused CSS to reduce bundle size

**Tasks:**
1. Install and configure PurgeCSS or UnCSS
2. Analyze current CSS bundle (186.83 kB) to identify unused styles
3. Configure to preserve:
   - ITCSS utilities (`.u-` prefix)
   - ITCSS objects (`.o-` prefix)
   - Dynamically-added classes
   - Third-party library styles (Leaflet, Recharts)
4. Run purge on production build
5. Test thoroughly (all components, all states)
6. Document savings and configuration
7. Commit with "Global CSS Refactor" message

**Expected Impact:** 10-30% CSS bundle reduction (target: 186.83 kB → ~130-170 kB)

### Phase 3.2: Optimize Performance - Remove Global Transitions
**Goal:** Improve paint performance by removing unnecessary global transitions

**Tasks:**
1. Audit all `transition: all` declarations
2. Replace with specific property transitions
3. Remove transitions from non-interactive elements
4. Test hover states and animations
5. Document performance improvements
6. Commit with "Global CSS Refactor" message

**Expected Impact:** Improved paint performance, smoother animations

### Phase 3.3: Implement CSS Linting with stylelint
**Goal:** Enforce CSS standards and prevent regressions

**Tasks:**
1. Install and configure stylelint
2. Configure rules for:
   - ITCSS architecture
   - BEM naming (for new code)
   - Breakpoint variables (no hardcoded breakpoints in new code)
   - CSS variable usage (no hardcoded spacing/sizing in new code)
   - No `!important` (except in `.u-` utilities)
3. Add to pre-commit hooks
4. Add to CI/CD pipeline
5. Fix any linting errors in new code (leave existing code as-is)
6. Document configuration
7. Commit with "Global CSS Refactor" message

**Expected Impact:** Enforced standards, prevented regressions, better code quality

## 📚 Key Documentation to Reference

All of these documents were just created/updated in Phase 2:

**ITCSS Architecture:**
- [frontend/ITCSS_ARCHITECTURE.md](frontend/ITCSS_ARCHITECTURE.md) - Complete ITCSS layer guide

**BEM Naming:**
- [frontend/BEM_NAMING_CONVENTION.md](frontend/BEM_NAMING_CONVENTION.md) - BEM standard for new code
- [frontend/PHASE_2.2_RECOMMENDATION.md](frontend/PHASE_2.2_RECOMMENDATION.md) - Why we kept existing code as-is

**Breakpoint System:**
- [frontend/BREAKPOINT_SYSTEM.md](frontend/BREAKPOINT_SYSTEM.md) - Responsive breakpoint guide

**Phase Summaries:**
- [frontend/CSS_PHASE1_COMPLETE.md](frontend/CSS_PHASE1_COMPLETE.md) - Phase 1 summary
- [frontend/CSS_PHASE_2.2_COMPLETE.md](frontend/CSS_PHASE_2.2_COMPLETE.md) - BEM phase summary
- [frontend/CSS_PHASE_2.3_COMPLETE.md](frontend/CSS_PHASE_2.3_COMPLETE.md) - Breakpoint phase summary

**Project Context:**
- [CLAUDE.md](CLAUDE.md) - Updated with Phase 2 completion (READ THIS FIRST!)

## 🔧 Current State

**CSS Bundle Size:**
- Production: 186.83 kB (gzip: 34.68 kB)
- Files: 45 CSS files total
- ITCSS layers: Fully implemented
- Breakpoint variables: 18 variables
- Responsive utilities: 20+ classes
- CSS Modules: 16 components migrated

**Build Status:**
- ✅ Build passing (2.33s)
- ✅ All tests passing (476/476)
- ✅ 0 vulnerabilities
- ✅ Deployed to production

**Recent Commits:**
```
c57cacf (HEAD -> main, origin/main) feat: Global CSS Refactor - Phase 2 Complete (ITCSS, BEM, Breakpoints)
dc8af8d feat: Global CSS Refactor - Phase 2.1 (ITCSS Architecture)
```

## 💡 How to Start

1. **Read CLAUDE.md** - Get full project context (you should do this automatically)

2. **Review Phase 2 completion** - Skim the documentation above to understand what was just done

3. **Start with Phase 3.1** - Begin with PurgeCSS implementation:
   - Install PurgeCSS or UnCSS
   - Configure safelist for ITCSS classes
   - Run analysis on production build
   - Document savings

4. **Follow the same pattern as Phase 2:**
   - Create tasks in todo list
   - Mark tasks as completed as you go
   - Document thoroughly
   - Test carefully
   - Commit with "Global CSS Refactor" message
   - Push to GitHub
   - Deploy to production

## 🎨 CSS Philosophy

**Principles established in Phases 1-2:**
1. **No breaking changes** - Keep working code intact
2. **Documentation over refactoring** - Document standards, don't mass-convert
3. **Forward-looking** - New code uses new standards, old code stays stable
4. **Risk-averse** - Avoid large changes to production-proven code
5. **Value-focused** - Only change what needs changing

**Apply these same principles to Phase 3:**
- PurgeCSS should only remove truly unused styles
- Performance optimizations should be surgical, not sweeping
- Linting should enforce standards for new code, not break existing code

## ⚠️ Important Reminders

1. **Commit message pattern:** Always include "Global CSS Refactor" in commit messages
2. **No mass refactoring:** Keep existing CSS as-is unless there's a clear benefit
3. **Test thoroughly:** CSS changes can have unexpected impacts
4. **Document everything:** Create completion summaries like Phase 2
5. **Production first:** Always verify on production after deployment

## 🚀 Success Criteria for Phase 3

**Phase 3.1 (PurgeCSS):**
- ✅ CSS bundle reduced by 10-30%
- ✅ No visual regressions
- ✅ All components still work
- ✅ Documentation created

**Phase 3.2 (Performance):**
- ✅ All `transition: all` replaced with specific properties
- ✅ Paint performance improved
- ✅ Animations smoother
- ✅ Documentation created

**Phase 3.3 (Linting):**
- ✅ stylelint configured
- ✅ Rules enforce ITCSS + BEM + breakpoints + variables
- ✅ Pre-commit hooks working
- ✅ CI/CD integration
- ✅ Documentation created

## 📊 Expected Final Metrics

After Phase 3 completion:
- CSS Bundle: ~130-170 kB (down from 186.83 kB)
- Build time: Similar or faster
- Paint performance: Improved
- Code quality: Enforced via linting
- Documentation: 2,500+ lines total

---

**Ready to start Phase 3.1!** Let me know when you've read CLAUDE.md and you're ready to begin with PurgeCSS implementation.
