# Build Validation and Safety Checks

This document explains the validation systems in place to prevent build configuration issues and catch problems early.

## Overview

The Meteo app uses a multi-layered validation system to ensure build configurations remain consistent across development, Docker, and CI/CD environments:

1. **Package Configuration Validator** - Validates package.json, Dockerfiles, and source code
2. **Docker Build Verifier** - Tests actual Docker builds and container startup
3. **Pre-build Hooks** - Automatic validation before every build
4. **CI/CD Integration** - Validation in GitHub Actions pipeline

## Package Configuration Validator

### Location
`frontend/scripts/validate-build-config.cjs`

### Usage

**Manual validation:**
```bash
cd frontend
npm run validate
```

**Automatic validation** (runs before every build):
```bash
npm run build  # Runs validation automatically via prebuild hook
```

### What It Checks

#### 1. Package.json Scripts
- ✅ Required scripts exist: `dev`, `build`, `preview`, `test`, `lint`
- ❌ Deprecated scripts removed: `start`, `eject` (CRA legacy)
- ✅ Scripts use correct commands (`vite`, not `react-scripts`)

#### 2. Dockerfile Commands
- ✅ Development Dockerfile uses `npm run dev`
- ✅ Production Dockerfile uses `npm run build`
- ❌ No deprecated `npm start` commands

#### 3. Environment Variables
- ✅ All env vars use `VITE_` prefix (not `REACT_APP_`)
- ✅ Consistent naming across .env files
- ✅ Docker build args match Vite naming

#### 4. Source Code Patterns
- ✅ No `process.env.REACT_APP_*` references
- ✅ Uses `import.meta.env.VITE_*` instead
- ✅ No CommonJS `require()` in main source (ESM only)
- ✅ Dynamic imports use ESM syntax

#### 5. Vite Configuration
- ✅ Valid vite.config.js exists
- ✅ Required plugins configured (React)
- ✅ Build output directory set correctly

#### 6. CI/CD Workflow
- ✅ GitHub Actions uses correct npm commands
- ✅ Workflow validates before building
- ✅ Environment variables match Vite naming

#### 7. Index HTML
- ✅ Uses `/` paths (not `%PUBLIC_URL%`)
- ✅ Script tag has `type="module"`
- ✅ Proper Vite entry point

### Output Format

```
╔════════════════════════════════════════════════╗
║  Build Configuration Validator                 ║
╚════════════════════════════════════════════════╝

✓ package.json has all required scripts
✓ No deprecated CRA scripts found
⚠ WARNING: Found 'validate' script using .cjs extension

✅ All checks passed! (1 warnings)
```

**Exit codes:**
- `0` - All checks passed (warnings allowed)
- `1` - Critical errors found (build will fail)

### Common Errors

**Error: Missing required script**
```
✗ ERROR: package.json missing required script: dev
```
**Fix:** Add the script to package.json:
```json
{
  "scripts": {
    "dev": "vite"
  }
}
```

**Error: Deprecated script found**
```
✗ ERROR: package.json contains deprecated CRA script: start
```
**Fix:** Remove or rename the script:
```json
{
  "scripts": {
    "start": "vite"  // Should be "dev": "vite"
  }
}
```

**Error: Environment variable naming**
```
✗ ERROR: Found REACT_APP_API_URL in src/config/api.js
```
**Fix:** Update to Vite naming:
```javascript
// Before
const API_URL = process.env.REACT_APP_API_URL;

// After
const API_URL = import.meta.env.VITE_API_URL;
```

## Docker Build Verifier

### Location
`scripts/verify-docker-build.sh`

### Usage

```bash
# From project root
./scripts/verify-docker-build.sh

# Or with bash
bash scripts/verify-docker-build.sh
```

### What It Tests

#### 1. Dockerfile Existence
- ✅ `frontend/Dockerfile.dev` exists
- ✅ `frontend/Dockerfile.prod` exists
- ✅ `backend/Dockerfile` exists

#### 2. Deprecated Commands
- ❌ No `npm start` in Dockerfiles
- ✅ Uses `npm run dev` or `npm run build`

#### 3. Image Building
- Builds all Docker images to catch build-time errors
- Tests with actual build arguments
- Validates multi-stage builds complete

#### 4. Container Startup
- Starts development container
- Waits 5 seconds for initialization
- Verifies container is still running (didn't crash)
- Shows logs if container fails

#### 5. Production Build Output
- Verifies `index.html` exists in build output
- Checks JavaScript assets were generated
- Validates Nginx serving directory structure

### Output Format

```
╔════════════════════════════════════════════════╗
║  Docker Build Verification                    ║
╚════════════════════════════════════════════════╝

ℹ Checking Dockerfiles...
✓ frontend/Dockerfile.dev exists
✓ frontend/Dockerfile.prod exists
✓ backend/Dockerfile exists

ℹ Building frontend development Docker image...
✓ Frontend dev image built successfully

ℹ Testing frontend dev container...
✓ Frontend dev container started successfully

╔════════════════════════════════════════════════╗
║  Verification Summary                          ║
╚════════════════════════════════════════════════╝

✅ All Docker builds verified successfully!
```

**Exit codes:**
- `0` - All validations passed
- `1` - One or more checks failed

### Common Errors

**Error: Container exited immediately**
```
ℹ Container logs:
Error: Cannot find module '/app/src/index.js'
✗ ERROR: Frontend dev container exited immediately
```
**Fix:** Check Dockerfile CMD uses correct script:
```dockerfile
# Wrong
CMD ["npm", "start"]

# Correct
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "3000"]
```

**Error: Image failed to build**
```
✗ ERROR: Frontend prod image failed to build
```
**Fix:**
1. Check Docker build logs: `docker build -f frontend/Dockerfile.prod frontend`
2. Verify build arguments are passed: `--build-arg VITE_API_URL=...`
3. Check package.json has correct build script

## Pre-build Hooks

### How It Works

The `prebuild` script in package.json runs automatically before `build`:

```json
{
  "scripts": {
    "prebuild": "npm run validate",
    "build": "vite build"
  }
}
```

**When you run:**
```bash
npm run build
```

**This happens automatically:**
1. `npm run prebuild` executes first
2. Validation script runs all checks
3. If validation passes → build continues
4. If validation fails → build is aborted (exit code 1)

### Disabling Pre-build Validation

**Not recommended**, but if needed:

```bash
# Skip prebuild hook
npm run build --ignore-scripts

# Or run vite directly
npx vite build
```

## CI/CD Integration

### GitHub Actions Workflow

The validation runs in the CI/CD pipeline at [.github/workflows/ci.yml](.github/workflows/ci.yml:70-73):

```yaml
- name: Validate build configuration
  run: |
    cd frontend
    npm run validate
```

### When It Runs
- ✅ Every push to `main` branch
- ✅ Every pull request to `main` branch
- ✅ Before running tests
- ✅ Before building the application

### Workflow Order
1. Checkout code
2. Install dependencies
3. **→ Validate configuration** (new step)
4. Run linter
5. Run tests
6. Build application
7. Build Docker images

### What Happens on Failure

If validation fails in CI/CD:
- ❌ Build is marked as failed
- ❌ Pull request cannot be merged (if branch protection enabled)
- 📧 Team receives notification
- 🔍 Check logs show which validation failed

**Example failure output:**
```
Run cd frontend
  cd frontend
  npm run validate

> validate
> node scripts/validate-build-config.cjs

✗ ERROR: Dockerfile.dev contains deprecated 'npm start'
✗ ERROR: Found REACT_APP_API_URL in 2 files

❌ Validation failed! Found 2 errors.
Error: Process completed with exit code 1.
```

## Best Practices

### For Developers

1. **Run validation locally before pushing:**
   ```bash
   npm run validate
   ```

2. **Test Docker builds locally:**
   ```bash
   ./scripts/verify-docker-build.sh
   ```

3. **Check validation in pre-commit:**
   - Husky pre-commit hooks run linting automatically
   - Consider adding validation to pre-push hook

4. **Update validation when adding new features:**
   - New environment variables? Update validator
   - New Docker stages? Update Docker verifier
   - New npm scripts? Update required scripts list

### For CI/CD

1. **Keep validation fast:**
   - Validation should complete in < 5 seconds
   - Docker verification runs separately (slower)

2. **Run validation early:**
   - Before installing all dependencies (when possible)
   - Before expensive operations like testing

3. **Clear error messages:**
   - Validator provides specific file locations
   - Suggests fixes for common issues

### For Production Deployments

1. **Required checks before deploy:**
   ```bash
   # 1. Validate configuration
   npm run validate

   # 2. Run tests
   npm test

   # 3. Verify Docker builds
   ./scripts/verify-docker-build.sh

   # 4. Build for production
   npm run build
   ```

2. **Environment-specific validation:**
   - Development: Relaxed warnings
   - Staging: Strict validation
   - Production: Zero tolerance for errors

## Troubleshooting

### Validation Script Not Found

**Error:** `Cannot find module 'validate-build-config.cjs'`

**Fix:** Ensure script exists at `frontend/scripts/validate-build-config.cjs`

### Docker Verifier Permission Denied

**Error:** `Permission denied: ./scripts/verify-docker-build.sh`

**Fix:** Make script executable:
```bash
chmod +x scripts/verify-docker-build.sh
```

### False Positives

If validator reports errors incorrectly:

1. **Check if issue is in comments:**
   - Validator may flag commented-out code
   - Consider removing outdated comments

2. **Check third-party dependencies:**
   - Some libraries may use patterns that trigger warnings
   - Add exceptions to validator if needed

3. **Report false positives:**
   - Open issue with validation output
   - Include specific file and line number

### Validation Passes but Build Fails

If validation passes but builds still fail:

1. **Update validator to catch the issue:**
   - Add new validation check for the failure case
   - Submit PR with improved validation

2. **Check for race conditions:**
   - File changed between validation and build
   - Use git commit hooks to validate at commit time

3. **Check for environment-specific issues:**
   - Different Node.js versions
   - Missing environment variables
   - OS-specific path issues

## Extending Validation

### Adding New Checks

To add a new validation check to `validate-build-config.cjs`:

```javascript
function validateMyNewCheck() {
  console.log('\n' + colors.blue + 'Checking my new feature...' + colors.reset);

  // Your validation logic
  if (somethingIsWrong) {
    error('Description of the problem');
    return;
  }

  success('My new check passed');
}

// Add to main validation flow
validatePackageJson();
validateDockerfiles();
validateMyNewCheck();  // Add here
```

### Custom Validation for Your Team

Create team-specific validators:

```bash
# Custom validator for backend
backend/scripts/validate-backend.js

# Custom validator for infrastructure
scripts/validate-infrastructure.sh
```

Add to package.json:
```json
{
  "scripts": {
    "validate": "npm run validate:frontend && npm run validate:backend",
    "validate:frontend": "node frontend/scripts/validate-build-config.cjs",
    "validate:backend": "node backend/scripts/validate-backend.js"
  }
}
```

## Summary

The validation system provides multiple layers of protection:

| Layer | Speed | When | Purpose |
|-------|-------|------|---------|
| Package Validator | Fast (< 5s) | Pre-build, CI/CD | Config consistency |
| Docker Verifier | Slow (1-2min) | Manual, pre-deploy | Container functionality |
| Pre-build Hook | Fast (< 5s) | Every build | Automatic safety |
| CI/CD Check | Fast (< 5s) | Push/PR | Team protection |

**Key benefits:**
- 🚀 Catches issues before deployment
- 🛡️ Prevents configuration drift
- ⚡ Fails fast with clear error messages
- 📚 Enforces best practices automatically
- 🔄 Works across development, Docker, and CI/CD

## Related Documentation

- [Vite Migration Guide](../VITE_MIGRATION_GUIDE.md) - Understanding the Vite setup
- [Development Guide](./DEVELOPMENT.md) - Setting up local environment
- [Docker Documentation](./DOCKER.md) - Docker build and deployment
- [CI/CD Documentation](../.github/workflows/README.md) - GitHub Actions setup
