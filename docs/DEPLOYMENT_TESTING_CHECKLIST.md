# Deployment Testing Checklist

**Purpose:** Prevent token waste by catching issues before deployment

## ⚠️ CRITICAL: Test Locally FIRST

**NEVER deploy without completing this checklist.**

### 1. Pre-Deployment Verification (Local)

#### Build Check
```bash
# Check if containers are running
docker-compose ps

# View logs for errors
docker-compose logs frontend --tail=50
docker-compose logs backend --tail=50
```

#### Visual Inspection Checklist
- [ ] Open http://localhost:3000 in browser
- [ ] Check browser console for errors (F12 → Console tab)
- [ ] Verify network requests succeed (F12 → Network tab)
- [ ] Test in 2-3 different browsers (Chrome, Firefox, Safari)
- [ ] Hard refresh to clear cache (Cmd+Shift+R / Ctrl+Shift+F5)

#### Layout Verification
- [ ] **Header**: Logo, navigation, auth buttons visible
- [ ] **Hero/Search Bar**: Centered, full width, functional
- [ ] **Current Conditions Card**: Proper sizing, not collapsed
- [ ] **Location Controls Card**: Right sidebar, proper width
- [ ] **Weather Stats Grid**: 5 stat boxes display correctly
- [ ] **Radar Map**: Loads and displays at correct size
- [ ] **Footer**: Present and styled correctly

#### Functional Tests
- [ ] Search for a location (e.g., "Seattle, WA")
- [ ] Toggle temperature units (C/F)
- [ ] Toggle theme (Light/Dark/Auto)
- [ ] Click "Use My Location" button
- [ ] Navigate to /compare page
- [ ] Test AI weather query

### 2. Screenshot Comparison

**Before deploying, take screenshots:**

1. **Localhost** (http://localhost:3000)
   - Full page screenshot
   - Current Conditions card
   - Location controls card
   - Radar map section

2. **Save to:** `/screenshots/pre-deploy/YYYY-MM-DD-HH-MM/`

3. **Compare with previous known-good screenshots**

### 3. CSS/Build Artifact Check

```bash
# Verify CSS is being loaded
curl http://localhost:3000 | grep "main.*\.css"

# Check for JS bundle
curl http://localhost:3000 | grep "main.*\.js"

# Inspect build artifacts (production)
ls -lah frontend/build/static/css/
ls -lah frontend/build/static/js/
```

### 4. Docker Build Differences

**Key Issue:** `Dockerfile` (production) vs `Dockerfile.dev` (local)

| Environment | Dockerfile | Build Process | Serves |
|-------------|------------|---------------|--------|
| **Local** | `Dockerfile.dev` | `npm start` | webpack-dev-server |
| **Beta** | `Dockerfile` (prod) | `npm run build` | nginx static files |

**Potential Issues:**
- Environment variables not passed to build
- CSS not being extracted properly
- Different webpack configurations
- Build-time vs runtime differences

### 5. Environment Variable Verification

**Local (.env):**
```bash
# Check local env vars are loaded
docker-compose exec frontend printenv | grep REACT_APP
```

**Beta (.env.production):**
```bash
# SSH to server and check
ssh michael@tachyonfuture.com "cd /home/michael/meteo-app && cat .env.production | grep REACT_APP"
```

### 6. Common Styling Issues

#### Problem: Styles work locally but not on beta

**Possible Causes:**
1. **CSS not extracted during build**
   - Check `npm run build` output for CSS file generation
   - Verify `build/static/css/main.*.css` exists

2. **Environment-specific CSS**
   - Check for `process.env.NODE_ENV` conditionals in CSS
   - Ensure CSS variables are defined for both themes

3. **PostCSS/Autoprefixer issues**
   - Check browser compatibility in package.json
   - Verify PostCSS config is correct

4. **Import order matters**
   - CSS imports in index.js must be in correct order
   - Component CSS must be imported after global styles

### 7. Deployment Decision Tree

```
┌─ Localhost looks good? ───────────────────────────┐
│  ├─ YES                                            │
│  │  └─ Take screenshots                            │
│  │     └─ Deploy to beta                           │
│  │        └─ Compare beta with localhost           │
│  │           ├─ SAME → Success! ✅                 │
│  │           └─ DIFFERENT → Roll back, investigate │
│  │                                                  │
│  └─ NO                                             │
│     └─ Fix locally FIRST                           │
│        └─ DO NOT DEPLOY                            │
└────────────────────────────────────────────────────┘
```

### 8. Rollback Plan

If beta deployment looks wrong:

```bash
# SSH to server
ssh michael@tachyonfuture.com

# Navigate to app directory
cd /home/michael/meteo-app

# Check git log for last known-good commit
git log --oneline -10

# Rollback to previous commit
git reset --hard <COMMIT_HASH>

# Rebuild and restart
bash scripts/deploy-beta.sh
```

### 9. Token-Saving Tips

**BEFORE asking Claude to deploy:**

1. ✅ Complete ALL items in checklist above
2. ✅ Take comparison screenshots
3. ✅ Document specific issues you observe
4. ✅ Provide Claude with:
   - Browser console errors
   - Network tab errors
   - Screenshots showing the problem
   - Specific CSS classes that look wrong

**AVOID:**
- Deploying blindly without local testing
- Vague descriptions like "it's broken"
- Multiple deploy attempts without investigation
- Not checking browser console/network tabs

### 10. Issue Reporting Template

When reporting issues to Claude, use this format:

```
## Issue Description
[Brief one-sentence summary]

## Environment
- Local: ✅ Works / ❌ Broken
- Beta: ✅ Works / ❌ Broken

## Browser Console Errors
[Paste errors from F12 → Console]

## Network Errors
[Paste failed requests from F12 → Network]

## Screenshots
[Attach comparison screenshots]

## Steps to Reproduce
1. [Step 1]
2. [Step 2]
3. [Step 3]

## Expected Behavior
[What should happen]

## Actual Behavior
[What actually happens]
```

---

## Emergency Contacts

- **Beta Site:** https://meteo-beta.tachyonfuture.com
- **Local Dev:** http://localhost:3000
- **SSH:** `ssh michael@tachyonfuture.com`
- **Deployment Script:** `/home/michael/meteo-app/scripts/deploy-beta.sh`
