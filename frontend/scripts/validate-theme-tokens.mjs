import fs from 'node:fs';
import path from 'node:path';
import postcss from 'postcss';

const THEMES = [
  { name: 'light', selector: ':root' },
  { name: 'dark', selector: "[data-theme='dark']" },
  { name: 'aurora', selector: "[data-theme='aurora']" },
  { name: 'sunset', selector: "[data-theme='sunset']" },
];

const REQUIRED_TOKENS = [
  '--bg-primary',
  '--bg-secondary',
  '--bg-tertiary',
  '--bg-elevated',
  '--text-primary',
  '--text-secondary',
  '--text-tertiary',
  '--text-disabled',
  '--text-on-accent',
  '--border-light',
  '--border-medium',
  '--border-dark',
  '--accent-primary',
  '--accent-secondary',
  '--accent-hover',
  '--error-bg',
  '--error-border',
  '--error-text',
  '--success-bg',
  '--success-border',
  '--success-text',
  '--warning-bg',
  '--warning-border',
  '--warning-text',
  '--info-bg',
  '--info-border',
  '--info-text',
  '--hover-bg',
  '--chart-line-primary',
  '--chart-line-secondary',
  '--chart-hot',
  '--chart-warning',
  '--chart-surface',
  '--chart-text-strong',
  '--chart-text-muted',
];

const themeFilePath = path.resolve('src', 'styles', 'theme-variables.css');
const cssContent = fs.readFileSync(themeFilePath, 'utf8');
const ast = postcss.parse(cssContent);

const themeTokenMap = new Map();

ast.walkRules((rule) => {
  const match = THEMES.find((theme) => theme.selector === rule.selector.trim());
  if (!match) {
    return;
  }

  if (!themeTokenMap.has(match.name)) {
    themeTokenMap.set(match.name, new Set());
  }

  rule.walkDecls((decl) => {
    if (decl.prop.startsWith('--')) {
      themeTokenMap.get(match.name).add(decl.prop);
    }
  });
});

const errors = [];

THEMES.forEach((theme) => {
  const tokens = themeTokenMap.get(theme.name);
  if (!tokens) {
    errors.push(`Missing theme selector for "${theme.name}" (${theme.selector})`);
    return;
  }

  REQUIRED_TOKENS.forEach((token) => {
    if (!tokens.has(token)) {
      errors.push(`Theme "${theme.name}" is missing token ${token}`);
    }
  });
});

if (errors.length > 0) {
  console.error('❌ Theme token validation failed:\n');
  errors.forEach((error) => console.error(` - ${error}`));
  console.error('\nUpdate theme-variables.css so every preset defines the required tokens.');
  process.exit(1);
}

console.log('✅ Theme token validation passed for light, dark, aurora, and sunset presets.');
