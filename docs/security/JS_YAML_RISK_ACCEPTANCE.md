# js-yaml Security Vulnerability - Risk Acceptance

**Date:** November 17, 2025
**Status:** ACCEPTED (Moderate Risk)
**Decision By:** Development Team

---

## 📊 Vulnerability Details

**Package:** js-yaml
**Current Version:** 3.14.2 (in Jest test dependencies)
**Vulnerable Versions:** < 4.1.1
**Patched Version:** 4.1.1

**CVE:** GHSA-mh29-5h37-fv8m
**Severity:** **MODERATE** (CVSS 5.3/10)
**Attack Vector:** Prototype Pollution in merge (`<<`)
**CWE:** CWE-1321 (Improperly Controlled Modification of Object Prototype Attributes)

---

## 🎯 Risk Assessment

### Exposure Analysis

**Where js-yaml is Used:**
1. ✅ **ESLint** (devDependency) - Uses js-yaml **4.1.1** (PATCHED)
2. ⚠️  **Jest** (devDependency) - Uses js-yaml **3.14.2** via @istanbuljs/load-nyc-config (VULNERABLE)

**Production Impact:** **ZERO**
- js-yaml is only used in **devDependencies**
- Jest test runner does NOT ship to production
- ESLint (which parses `.eslintrc.yml`) uses the **patched version**

### Attack Surface

**To Exploit This Vulnerability, An Attacker Would Need To:**
1. Have access to backend test environment
2. Inject malicious YAML into Jest's configuration
3. Trigger prototype pollution during test execution

**Realistic Threat Level:** **VERY LOW**
- Tests run in isolated CI environment
- No user-supplied YAML is processed during testing
- Attack would only affect test runs, not production

---

## 🚫 Why We Can't Fix It

### Technical Blocker

Jest 29.7.0 depends on:
```
@jest/core@29.7.0
└── @jest/transform@29.7.0
    └── babel-plugin-istanbul@6.1.1
        └── @istanbuljs/load-nyc-config@1.1.0
            └── js-yaml@^3.13.1  ⬅️ Vulnerable dependency
```

**Attempted Solutions:**
1. ❌ Upgrade Jest to 30.x → Introduced `localStorage` errors in Node environment
2. ❌ Use npm `overrides` to force js-yaml 4.1.1 → Broke Jest's environment initialization
3. ❌ Wait for @istanbuljs/load-nyc-config update → No update planned (last release: 2020)

### Root Cause

`@istanbuljs/load-nyc-config@1.1.0` is **unmaintained** and **locked to js-yaml ^3.13.1**
- Last updated: **February 2020**
- No plans to update js-yaml dependency
- Jest team has not migrated away from this package

---

## ✅ Risk Acceptance Justification

### Why This is Acceptable

1. **Severity is MODERATE, not HIGH or CRITICAL**
   - CVSS score: 5.3/10
   - Not a remote code execution or data breach

2. **Zero Production Impact**
   - Jest is devDependency only
   - Does not ship to production
   - Vulnerability only exists in test environment

3. **ESLint Uses Patched Version**
   - ESLint (which parses YAML config files) uses js-yaml 4.1.1 ✅
   - No risk from parsing `.eslintrc.yml` or other config files

4. **No User Input**
   - Backend tests don't process user-supplied YAML
   - Attack surface is negligible

5. **CI Tests Pass**
   - GitHub Actions CI passes all backend tests
   - Confirms this is a local environment issue, not a code problem

6. **Upgrade Risks Outweigh Benefits**
   - Jest 30 breaks test environment (localStorage errors)
   - Fixing a moderate devDependency vulnerability isn't worth breaking tests

---

## 🔄 Mitigation Strategies

### Current Mitigations

1. **Isolated Test Environment**
   - Tests run in GitHub Actions with restricted permissions
   - No external network access during tests (nock mocks all HTTP)

2. **ESLint Uses Patched Version**
   - Config file parsing (the main YAML use case) is secure

3. **No YAML Parsing in Production**
   - Production code does not parse YAML files
   - Zero attack surface in production

### Future Monitoring

**We will revisit this decision when:**
- Jest releases a version that doesn't depend on @istanbuljs/load-nyc-config
- @istanbuljs/load-nyc-config updates to js-yaml 4.1.1+
- The vulnerability is upgraded to HIGH or CRITICAL severity
- A viable workaround is discovered

---

## 📋 Decision Summary

**Decision:** **ACCEPT THE RISK**

**Reasoning:**
- Moderate severity (5.3/10 CVSS)
- Zero production impact (devDependency only)
- No realistic attack vector
- ESLint (production-adjacent) uses patched version
- Upgrade attempts break test infrastructure

**Review Date:** January 2026 or when Jest releases major version update

---

## 📚 References

- **Advisory:** https://github.com/advisories/GHSA-mh29-5h37-fv8m
- **CWE-1321:** https://cwe.mitre.org/data/definitions/1321.html
- **Jest Issue:** Backend tests pass in CI but fail locally with localStorage error (environment-specific)
- **@istanbuljs/load-nyc-config:** https://www.npmjs.com/package/@istanbuljs/load-nyc-config (last update: 2020)

---

**Last Updated:** November 17, 2025
**Next Review:** January 2026
**Status:** ✅ Risk Accepted

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
