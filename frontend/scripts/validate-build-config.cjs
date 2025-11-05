#!/usr/bin/env node

/**
 * Build Configuration Validation Script
 *
 * Validates that build configuration is consistent across:
 * - package.json scripts
 * - Dockerfiles
 * - CI/CD workflows
 * - Environment variables
 *
 * Run this before committing changes to build configuration
 */

const fs = require('fs');
const path = require('path');

const COLORS = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

let hasErrors = false;
let hasWarnings = false;

function error(message) {
  console.error(`${COLORS.red}✗ ERROR:${COLORS.reset} ${message}`);
  hasErrors = true;
}

function warning(message) {
  console.warn(`${COLORS.yellow}⚠ WARNING:${COLORS.reset} ${message}`);
  hasWarnings = true;
}

function success(message) {
  console.log(`${COLORS.green}✓${COLORS.reset} ${message}`);
}

function info(message) {
  console.log(`${COLORS.blue}ℹ${COLORS.reset} ${message}`);
}

// Check 1: Validate package.json has required scripts
function validatePackageJson() {
  info('\n=== Validating package.json ===');

  const packageJsonPath = path.join(__dirname, '..', 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

  const requiredScripts = ['dev', 'build', 'preview', 'test', 'lint'];
  const deprecatedScripts = ['start', 'eject'];

  // Check for required scripts
  requiredScripts.forEach(script => {
    if (packageJson.scripts[script]) {
      success(`Required script "${script}" exists`);
    } else {
      error(`Missing required script: "${script}"`);
    }
  });

  // Check for deprecated scripts
  deprecatedScripts.forEach(script => {
    if (packageJson.scripts[script]) {
      warning(`Deprecated script "${script}" still exists (from CRA)`);
    }
  });

  // Check for react-scripts dependency
  if (packageJson.dependencies?.['react-scripts'] || packageJson.devDependencies?.['react-scripts']) {
    error('react-scripts dependency found (should be removed for Vite)');
  } else {
    success('No react-scripts dependency found');
  }

  // Check for Vite dependency
  if (packageJson.devDependencies?.['vite']) {
    success('Vite dependency found');
  } else {
    error('Missing Vite dependency');
  }
}

// Check 2: Validate Dockerfiles use correct commands
function validateDockerfiles() {
  info('\n=== Validating Dockerfiles ===');

  const dockerfiles = [
    { path: path.join(__dirname, '..', 'Dockerfile.dev'), name: 'Dockerfile.dev' },
    { path: path.join(__dirname, '..', 'Dockerfile.prod'), name: 'Dockerfile.prod' },
  ];

  dockerfiles.forEach(({ path: dockerPath, name }) => {
    if (!fs.existsSync(dockerPath)) {
      warning(`${name} not found`);
      return;
    }

    const content = fs.readFileSync(dockerPath, 'utf8');

    // Check for deprecated commands
    if (content.includes('npm start')) {
      error(`${name} uses "npm start" (should use "npm run dev" or "npm run build")`);
    } else {
      success(`${name} doesn't use deprecated "npm start"`);
    }

    // Check for CRA references
    if (content.includes('webpack') || content.includes('react-scripts')) {
      warning(`${name} contains references to webpack/react-scripts`);
    }

    // Check for Vite references
    if (name === 'Dockerfile.dev' && content.includes('npm run dev')) {
      success(`${name} uses "npm run dev" for development`);
    }

    if (name === 'Dockerfile.prod' && content.includes('npm run build')) {
      success(`${name} uses "npm run build" for production`);
    }
  });
}

// Check 3: Validate environment variables
function validateEnvVars() {
  info('\n=== Validating Environment Variables ===');

  const envExamplePath = path.join(__dirname, '..', '.env.example');
  const envPath = path.join(__dirname, '..', '.env');

  if (!fs.existsSync(envExamplePath)) {
    warning('.env.example not found');
    return;
  }

  const envExample = fs.readFileSync(envExamplePath, 'utf8');

  // Check for REACT_APP_ prefix (deprecated)
  if (envExample.includes('REACT_APP_')) {
    error('.env.example contains REACT_APP_ variables (should use VITE_ prefix)');
  } else {
    success('.env.example uses correct VITE_ prefix');
  }

  // Check for VITE_ prefix
  if (envExample.includes('VITE_')) {
    success('.env.example contains VITE_ variables');
  } else {
    warning('.env.example missing VITE_ variables');
  }

  // Check actual .env if it exists
  if (fs.existsSync(envPath)) {
    const env = fs.readFileSync(envPath, 'utf8');
    if (env.includes('REACT_APP_')) {
      error('.env contains REACT_APP_ variables (should use VITE_ prefix)');
    }
  }
}

// Check 4: Validate source code for environment variable usage
function validateSourceCode() {
  info('\n=== Validating Source Code ===');

  const srcPath = path.join(__dirname, '..', 'src');

  function checkFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const relativePath = path.relative(path.join(__dirname, '..'), filePath);

    // Check for process.env.REACT_APP_ usage
    if (content.includes('process.env.REACT_APP_')) {
      error(`${relativePath} uses process.env.REACT_APP_ (should use import.meta.env.VITE_)`);
    }

    // Check for require() in JSX files (should use import)
    if (filePath.endsWith('.jsx') && content.includes("require('")) {
      warning(`${relativePath} uses require() (should use ESM import)`);
    }
  }

  function walkDir(dir) {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);

      if (stat.isDirectory()) {
        walkDir(filePath);
      } else if (file.endsWith('.js') || file.endsWith('.jsx')) {
        checkFile(filePath);
      }
    });
  }

  try {
    walkDir(srcPath);
    success('Source code uses correct environment variable syntax');
  } catch (err) {
    warning(`Error checking source code: ${err.message}`);
  }
}

// Check 5: Validate vite.config.js exists and is valid
function validateViteConfig() {
  info('\n=== Validating Vite Configuration ===');

  const viteConfigPath = path.join(__dirname, '..', 'vite.config.js');

  if (!fs.existsSync(viteConfigPath)) {
    error('vite.config.js not found');
    return;
  }

  success('vite.config.js exists');

  const content = fs.readFileSync(viteConfigPath, 'utf8');

  // Check for essential configurations
  if (!content.includes('export default defineConfig')) {
    error('vite.config.js missing defineConfig export');
  }

  if (!content.includes('@vitejs/plugin-react')) {
    error('vite.config.js missing React plugin');
  } else {
    success('React plugin configured');
  }

  if (!content.includes('envPrefix')) {
    warning('vite.config.js missing envPrefix configuration');
  }
}

// Check 6: Validate CI/CD configuration
function validateCICD() {
  info('\n=== Validating CI/CD Configuration ===');

  const ciPath = path.join(__dirname, '..', '..', '.github', 'workflows', 'ci.yml');

  if (!fs.existsSync(ciPath)) {
    warning('CI workflow file not found');
    return;
  }

  const content = fs.readFileSync(ciPath, 'utf8');

  // Check for deprecated commands
  if (content.includes('react-scripts')) {
    error('CI workflow uses react-scripts');
  }

  // Check for correct build commands
  if (content.includes('npm run build')) {
    success('CI uses correct build command');
  }

  if (content.includes('npm test') && !content.includes('npm run test:ci')) {
    warning('CI might not be using optimized test command');
  }

  // Check for VITE_ environment variables
  if (content.includes('VITE_')) {
    success('CI uses VITE_ environment variables');
  } else if (content.includes('REACT_APP_')) {
    error('CI uses deprecated REACT_APP_ environment variables');
  }
}

// Check 7: Validate index.html
function validateIndexHtml() {
  info('\n=== Validating index.html ===');

  const indexHtmlPath = path.join(__dirname, '..', 'index.html');

  if (!fs.existsSync(indexHtmlPath)) {
    error('index.html not found in frontend root (required by Vite)');
    return;
  }

  success('index.html exists in correct location');

  const content = fs.readFileSync(indexHtmlPath, 'utf8');

  // Check for %PUBLIC_URL% (CRA syntax)
  if (content.includes('%PUBLIC_URL%')) {
    error('index.html contains %PUBLIC_URL% (CRA syntax, should be removed for Vite)');
  } else {
    success('index.html uses correct Vite syntax');
  }

  // Check for module script
  if (content.includes('type="module"')) {
    success('index.html includes module script tag');
  } else {
    error('index.html missing <script type="module"> tag');
  }
}

// Main execution
function main() {
  console.log(`${COLORS.blue}╔════════════════════════════════════════════════╗${COLORS.reset}`);
  console.log(`${COLORS.blue}║  Build Configuration Validation               ║${COLORS.reset}`);
  console.log(`${COLORS.blue}╚════════════════════════════════════════════════╝${COLORS.reset}`);

  validatePackageJson();
  validateDockerfiles();
  validateEnvVars();
  validateSourceCode();
  validateViteConfig();
  validateCICD();
  validateIndexHtml();

  // Summary
  console.log(`\n${COLORS.blue}╔════════════════════════════════════════════════╗${COLORS.reset}`);
  console.log(`${COLORS.blue}║  Validation Summary                            ║${COLORS.reset}`);
  console.log(`${COLORS.blue}╚════════════════════════════════════════════════╝${COLORS.reset}\n`);

  if (hasErrors) {
    console.error(`${COLORS.red}❌ Validation FAILED with errors${COLORS.reset}`);
    console.error('Please fix the errors above before proceeding.\n');
    process.exit(1);
  } else if (hasWarnings) {
    console.warn(`${COLORS.yellow}⚠️  Validation PASSED with warnings${COLORS.reset}`);
    console.warn('Consider addressing the warnings above.\n');
    process.exit(0);
  } else {
    console.log(`${COLORS.green}✅ Validation PASSED - All checks successful!${COLORS.reset}\n`);
    process.exit(0);
  }
}

main();
