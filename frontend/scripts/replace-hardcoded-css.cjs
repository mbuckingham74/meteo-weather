#!/usr/bin/env node

/**
 * Script to replace hardcoded CSS values with CSS custom properties
 * Part of Phase 1.3: Enforce spacing/sizing scale with utility classes
 */

const fs = require('fs');
const path = require('path');

// Mapping of hardcoded values to CSS variables
const replacements = {
  // Spacing (8pt grid)
  'padding: 4px': 'padding: var(--spacing-xs)',
  'padding: 8px': 'padding: var(--spacing-sm)',
  'padding: 12px': 'padding: var(--spacing-md)',
  'padding: 20px': 'padding: var(--spacing-lg)',
  'padding: 24px': 'padding: var(--spacing-xl)',

  'margin: 4px': 'margin: var(--spacing-xs)',
  'margin: 8px': 'margin: var(--spacing-sm)',
  'margin: 12px': 'margin: var(--spacing-md)',
  'margin: 20px': 'margin: var(--spacing-lg)',
  'margin: 24px': 'margin: var(--spacing-xl)',

  'gap: 4px': 'gap: var(--spacing-xs)',
  'gap: 8px': 'gap: var(--spacing-sm)',
  'gap: 12px': 'gap: var(--spacing-md)',
  'gap: 20px': 'gap: var(--spacing-lg)',
  'gap: 24px': 'gap: var(--spacing-xl)',

  // Border radius
  'border-radius: 6px': 'border-radius: var(--radius-sm)',
  'border-radius: 8px': 'border-radius: var(--radius-md)',
  'border-radius: 12px': 'border-radius: var(--radius-lg)',
  'border-radius: 16px': 'border-radius: var(--radius-xl)',

  // Font sizes
  'font-size: 9px': 'font-size: var(--font-xs)',
  'font-size: 11px': 'font-size: var(--font-sm)',
  'font-size: 13px': 'font-size: var(--font-md)',
  'font-size: 14px': 'font-size: var(--font-base)',
  'font-size: 16px': 'font-size: var(--font-lg)',
  'font-size: 20px': 'font-size: var(--font-xl)',
  'font-size: 24px': 'font-size: var(--font-2xl)',
  'font-size: 32px': 'font-size: var(--font-3xl)',
  'font-size: 48px': 'font-size: var(--font-4xl)',
};

// Component-specific replacements (for dashboard, cards, buttons, inputs)
const componentReplacements = {
  'padding: 12px': 'padding: var(--card-padding)', // cards
  'padding: 10px 16px': 'padding: var(--button-padding-y) var(--button-padding-x)', // buttons
  'padding: 12px 16px': 'padding: var(--input-padding-y) var(--input-padding-x)', // inputs
};

function replaceInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let changeCount = 0;

  // Apply replacements
  for (const [oldValue, newValue] of Object.entries(replacements)) {
    const regex = new RegExp(oldValue.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
    const matches = content.match(regex);
    if (matches) {
      changeCount += matches.length;
      content = content.replace(regex, newValue);
    }
  }

  // Write back if changes were made
  if (changeCount > 0) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ ${path.basename(filePath)}: ${changeCount} replacements`);
    return changeCount;
  } else {
    console.log(`⏭️  ${path.basename(filePath)}: No changes needed`);
    return 0;
  }
}

function findCSSFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);

  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      // Skip node_modules and build directories
      if (!file.startsWith('.') && file !== 'node_modules' && file !== 'build') {
        findCSSFiles(filePath, fileList);
      }
    } else if (file.endsWith('.css') && !file.includes('themes.css')) {
      // Skip themes.css (it defines the variables)
      fileList.push(filePath);
    }
  });

  return fileList;
}

// Main execution
const srcDir = path.join(__dirname, '..', 'src');
console.log('🔍 Finding CSS files...\n');

const cssFiles = findCSSFiles(srcDir);
console.log(`📄 Found ${cssFiles.length} CSS files\n`);

let totalReplacements = 0;

cssFiles.forEach((file) => {
  totalReplacements += replaceInFile(file);
});

console.log(`\n✨ Complete! ${totalReplacements} total replacements across ${cssFiles.length} files`);
