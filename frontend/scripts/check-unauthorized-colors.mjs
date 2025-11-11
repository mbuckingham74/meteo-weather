#!/usr/bin/env node
/**
 * Guardrail script that prevents reintroducing hardcoded hex colors
 * into the React component tree. The calm indigo palette must flow
 * through CSS custom properties instead of inline literals.
 */
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HEX_PATTERN = /#[0-9a-fA-F]{3,6}(?![0-9a-fA-F])/g;
const ALLOWED_EXTENSIONS = new Set(['.js', '.jsx', '.ts', '.tsx']);

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');
const srcDir = path.join(projectRoot, 'src');

const ignoredDirectories = new Set(['node_modules', '.git', 'build', 'coverage']);

async function collectFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    if (ignoredDirectories.has(entry.name)) {
      continue;
    }

    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      files.push(...(await collectFiles(fullPath)));
    } else if (ALLOWED_EXTENSIONS.has(path.extname(entry.name))) {
      files.push(fullPath);
    }
  }

  return files;
}

async function scanFile(filePath) {
  const content = await readFile(filePath, 'utf8');
  const matches = [];

  if (!HEX_PATTERN.test(content)) {
    return matches;
  }

  HEX_PATTERN.lastIndex = 0;
  const lines = content.split(/\r?\n/);

  lines.forEach((line, index) => {
    HEX_PATTERN.lastIndex = 0;
    const lineMatches = [...line.matchAll(HEX_PATTERN)];
    lineMatches.forEach((match) => {
      matches.push({
        lineNumber: index + 1,
        value: match[0],
      });
    });
  });

  return matches;
}

async function main() {
  const files = await collectFiles(srcDir);
  const violations = [];

  for (const file of files) {
    // eslint-disable-next-line no-await-in-loop
    const matches = await scanFile(file);
    if (matches.length) {
      violations.push({
        file: path.relative(projectRoot, file),
        matches,
      });
    }
  }

  if (violations.length) {
    console.error('Unauthorized hex colors detected (use theme tokens instead):');
    violations.forEach(({ file, matches }) => {
      matches.forEach(({ lineNumber, value }) => {
        console.error(`  - ${file}:${lineNumber} -> ${value}`);
      });
    });
    console.error('\nDefine colors in theme-variables.css and reference them via CSS variables.');
    process.exit(1);
  } else {
    console.log('✔ No unauthorized hex colors found in React source files.');
  }
}

main().catch((error) => {
  console.error('Color guard failed:', error);
  process.exitCode = 1;
});
