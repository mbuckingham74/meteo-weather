# Deployment Workflow - Complete Guide

**Mandatory steps for all production deployments to ensure consistency and proper versioning.**

---

## 🚨 Pre-Deployment Checklist

Before deploying ANY changes to production, complete these steps **IN ORDER**:

### ✅ Step 1: Update CHANGELOG.md (MANDATORY)

**This step is REQUIRED before every deployment and must not be skipped.**

1. **Determine version number** using [Semantic Versioning](https://semver.org/):
   - **Patch** (x.x.1) - Bug fixes, minor updates, documentation
   - **Minor** (x.1.x) - New features, significant improvements
   - **Major** (1.x.x) - Breaking changes, major rewrites

2. **Edit CHANGELOG.md** at repository root:

```bash
# On your local machine (before pushing to GitHub)
nano CHANGELOG.md
```

3. **Add new release entry** at the TOP (after `[Unreleased]` section):

```markdown
## [0.8.2] - 2025-11-08 (15:30 UTC)

### 📚 Documentation
- Updated deployment workflow to mandate CHANGELOG updates
  - Added pre-deployment checklist
  - **Files:** `docs/deployment/DEPLOYMENT_WORKFLOW.md`

### 🐛 Bug Fixes
- Fixed XYZ issue in component ABC
  - Description of what was wrong
  - How it was fixed
  - **Performance:** Improvement details (if applicable)
  - **Files:** `path/to/file.js`

### 🎉 New Features
- Added feature XYZ
  - What it does
  - How to use it
  - **Files:** List of affected files
```

4. **Update Version History Summary** table at bottom of CHANGELOG.md:

```markdown
| **0.8.2** | Nov 8, 2025 | 🐛 Fix + 📚 | Bug fixes and deployment docs |
```

5. **Use consistent emoji categories**:
   - 🎉 **New Features**
   - 🔄 **Changes**
   - 🐛 **Bug Fixes**
   - 🔐 **Security**
   - 📚 **Documentation**
   - ⚡ **Performance**
   - ♿ **Accessibility**

6. **Include UTC timestamp** in format: `YYYY-MM-DD (HH:MM UTC)`

### ✅ Step 2: Commit Changes Locally

```bash
git add CHANGELOG.md
git add .  # Add any other changed files
git commit -m "chore: Release v0.8.2 - Brief description of changes"
```

**Commit message format:**
- `feat:` - New features
- `fix:` - Bug fixes
- `docs:` - Documentation only
- `style:` - Code style changes (formatting)
- `refactor:` - Code refactoring
- `perf:` - Performance improvements
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks (releases, config)

### ✅ Step 3: Push to GitHub

```bash
git push origin main
```

**IMPORTANT:** GitHub Actions will automatically trigger deployment workflow after push.

### ✅ Step 4: Verify GitHub Actions

1. Go to [GitHub Actions](https://github.com/mbuckingham74/meteo-weather/actions)
2. Watch for deployment workflow to start
3. Ensure all checks pass (tests, build, security scan)

**If checks fail:**
- Fix issues locally
- Update CHANGELOG if needed
- Commit fixes
- Push again

---

## 🚀 Production Deployment

### Option A: Automatic Deployment (Recommended)

**GitHub Actions automatically deploys when you push to `main` branch.**

**What happens automatically:**
1. ✅ Runs all tests (frontend + backend)
2. ✅ Runs security scans
3. ✅ Builds Docker containers
4. ✅ SSH to production server
5. ✅ Pulls latest code
6. ✅ Runs `scripts/deploy-beta.sh`
7. ✅ Health checks
8. ✅ Notifies you of status

**Monitor deployment:**
- GitHub Actions UI: https://github.com/mbuckingham74/meteo-weather/actions
- Watch for ✅ green checkmarks

**Deployment time:** 5-10 minutes

---

### Option B: Manual Deployment (If Needed)

**Only use if automatic deployment fails or for emergency hotfixes.**

#### 1. Connect to Production Server

```bash
ssh michael@tachyonfuture.com
```

#### 2. Navigate to Project

```bash
cd /home/michael/meteo-app
```

#### 3. Pull Latest Code

```bash
git pull origin main
```

**Verify you see your CHANGELOG changes:**
```bash
git log --oneline -1
# Should show: "chore: Release vX.X.X - ..."
```

#### 4. Run Deployment Script

```bash
bash scripts/deploy-beta.sh
```

**Expected output:**
```
🚀 Deploying Meteo Weather App to production...
✅ Environment validated
✅ Building frontend...
✅ Building backend...
✅ Containers restarted
✅ Health checks passed
✅ Deployment complete!
```

#### 5. Verify Deployment

```bash
# Check containers are running
docker ps | grep meteo

# Check logs for errors
docker-compose -f docker-compose.prod.yml logs --tail=50

# Test API health
curl https://api.meteo-beta.tachyonfuture.com/api/health
```

---

## 📋 Post-Deployment Verification

### Automated Checks (run these commands)

```bash
# 1. Security headers test
curl -I https://api.meteo-beta.tachyonfuture.com/api/health | grep -E "X-Frame|RateLimit|CSP"

# Expected: All security headers present

# 2. Rate limiting test (6 failed login attempts)
for i in {1..6}; do
  echo "Attempt $i:"
  curl -s -X POST https://api.meteo-beta.tachyonfuture.com/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@test.com","password":"wrong"}' | grep -o "error.*" | head -1
done

# Expected: 6th attempt shows "Too many login attempts"

# 3. Frontend test
curl -I https://meteo-beta.tachyonfuture.com | grep "200 OK"

# Expected: HTTP 200 OK
```

### Manual Checks (open in browser)

1. **Frontend:** https://meteo-beta.tachyonfuture.com
   - [ ] Site loads without errors
   - [ ] No console errors (F12 → Console)
   - [ ] Weather data loads correctly
   - [ ] Radar map displays
   - [ ] Location search works
   - [ ] User login/registration works
   - [ ] Theme toggle works

2. **API Health:** https://api.meteo-beta.tachyonfuture.com/api/health
   - [ ] Returns `{"status": "ok", ...}`
   - [ ] Response time < 500ms

3. **Security Headers:**
   - Use [SecurityHeaders.com](https://securityheaders.com/?q=meteo-beta.tachyonfuture.com)
   - Target: A or A+

4. **SSL Certificate:**
   - Use [SSL Labs](https://www.ssllabs.com/ssltest/analyze.html?d=meteo-beta.tachyonfuture.com)
   - Target: A or A+

---

## 🎯 Version Number Guidelines

### When to Increment Each Part

**Patch (0.8.1 → 0.8.2)**
- Bug fixes
- Documentation updates
- Minor CSS/styling changes
- Performance improvements (non-breaking)
- Security patches
- Dependency updates

**Minor (0.8.2 → 0.9.0)**
- New features
- New API endpoints
- Database schema additions (backward compatible)
- UI redesigns
- Significant performance improvements
- Accessibility improvements

**Major (0.9.0 → 1.0.0)**
- Breaking API changes
- Database schema breaking changes
- Complete rewrites
- Major architectural changes
- Removal of deprecated features

### Example Version History

```
0.1.0 → Initial release
0.2.0 → Added location comparison (new feature)
0.2.1 → Fixed location search bug (bug fix)
0.3.0 → Added AI weather assistant (new feature)
0.3.1 → Fixed AI timeout issue (bug fix)
0.3.2 → Updated deployment docs (documentation)
1.0.0 → First stable release, API v1 locked (major milestone)
```

---

## ⚠️ Rollback Procedure (Emergency)

**Only use if deployment causes critical production issues.**

### Quick Rollback

```bash
# On production server
cd /home/michael/meteo-app

# Find previous working commit
git log --oneline -10

# Rollback to previous commit (e.g., abc1234)
git checkout abc1234

# Redeploy
bash scripts/deploy-beta.sh
```

### Post-Rollback Actions

1. **Update CHANGELOG.md** to note rollback:

```markdown
## [0.8.2] - 2025-11-08 (15:30 UTC) - ROLLED BACK

### ⚠️ Rollback
- Rolled back v0.8.2 due to [critical issue description]
- Reverted to v0.8.1 (commit abc1234)
- Issue details: [what went wrong]
- **Status:** Investigating fix
```

2. **Commit rollback:**

```bash
git add CHANGELOG.md
git commit -m "chore: Rollback v0.8.2 to v0.8.1 due to [issue]"
git push origin main
```

3. **Investigate and fix issue**
4. **Re-deploy with proper version increment (0.8.3)**

---

## 📊 Deployment Checklist Template

Copy this for each deployment:

```markdown
## Deployment: v0.X.X - [Description]

**Date:** YYYY-MM-DD
**Time:** HH:MM UTC
**Deployer:** Your Name
**Environment:** Production

### Pre-Deployment
- [ ] CHANGELOG.md updated with version number
- [ ] CHANGELOG.md includes UTC timestamp
- [ ] Changes categorized with emojis (🎉🔄🐛🔐📚⚡♿)
- [ ] Version History Summary table updated
- [ ] All changes committed locally
- [ ] Pushed to GitHub (`git push origin main`)
- [ ] GitHub Actions checks passed

### Deployment
- [ ] Connected to production server
- [ ] Pulled latest code (`git pull origin main`)
- [ ] Ran deployment script (`bash scripts/deploy-beta.sh`)
- [ ] No errors in deployment output
- [ ] All containers running (`docker ps`)

### Post-Deployment Verification
- [ ] Security headers present
- [ ] Rate limiting works
- [ ] Frontend loads without errors
- [ ] API health check passes (< 500ms)
- [ ] No console errors in browser
- [ ] Weather data loads correctly
- [ ] User authentication works
- [ ] SecurityHeaders.com shows A/A+
- [ ] SSL Labs shows A/A+

### Monitoring (First 24 Hours)
- [ ] Check error logs every 4 hours
- [ ] Monitor user reports/issues
- [ ] Watch for unusual API traffic
- [ ] Verify performance metrics stable

**Status:** ✅ Success / ⚠️ Issues / ❌ Rolled Back
**Notes:** [Any observations or issues]
```

---

## 🔍 Common Issues & Solutions

### Issue: CHANGELOG not updated before deployment

**Symptom:** Deployment succeeds but CHANGELOG doesn't reflect changes

**Solution:**
1. Immediately update CHANGELOG.md with the correct version
2. Commit: `git commit -m "docs: Add missing v0.8.2 CHANGELOG entry"`
3. Push: `git push origin main`
4. No redeployment needed (documentation only)

### Issue: Wrong version number used

**Symptom:** CHANGELOG shows v0.8.3 but should be v0.9.0 (new feature, not patch)

**Solution:**
1. Update CHANGELOG.md with correct version
2. Update Version History Summary table
3. Commit: `git commit -m "docs: Correct version number v0.8.3 → v0.9.0"`
4. Push to GitHub

### Issue: Forgot to include files in commit

**Symptom:** CHANGELOG mentions files that weren't actually changed

**Solution:**
1. Add missing files: `git add path/to/forgotten/file.js`
2. Amend commit: `git commit --amend --no-edit`
3. Force push: `git push origin main --force`
4. **Caution:** Only use force push if no one else has pulled your commit

### Issue: Deployment failed but CHANGELOG already updated

**Symptom:** GitHub Actions shows red ❌, but CHANGELOG has new version

**Solution:**
1. Fix the failing issue
2. Update CHANGELOG.md to note the fix
3. Same version number (0.8.2) with additional changes listed
4. Commit and push again

---

## 📚 Related Documentation

- **[CHANGELOG.md](../../CHANGELOG.md)** - Full version history
- **[DEPLOY_NOW.md](DEPLOY_NOW.md)** - Quick deployment reference
- **[DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)** - Step-by-step guide
- **[DEPLOYMENT_TESTING_CHECKLIST.md](DEPLOYMENT_TESTING_CHECKLIST.md)** - Full testing checklist
- **[Contributing Guide](../../CONTRIBUTING.md)** - How to contribute changes

---

## 🎓 Training Checklist

**For new team members or when establishing this workflow:**

- [ ] Read this entire document
- [ ] Understand semantic versioning (read https://semver.org/)
- [ ] Review existing CHANGELOG.md format
- [ ] Practice on a test feature branch
- [ ] Deploy first change under supervision
- [ ] Bookmark this document for reference

---

## ✅ Quick Reference

**Every deployment must include:**

1. **CHANGELOG.md update** (version, date, UTC time, emoji categories)
2. **Semantic version number** (Patch/Minor/Major)
3. **Git commit** (`chore: Release vX.X.X - ...`)
4. **GitHub push** (`git push origin main`)
5. **Monitor deployment** (GitHub Actions or manual)
6. **Post-deployment checks** (security, functionality, performance)

**Remember:** The CHANGELOG is your project's history. Consistency matters!

---

**Last Updated:** November 7, 2025
**Maintained by:** Michael Buckingham ([@mbuckingham74](https://github.com/mbuckingham74))
