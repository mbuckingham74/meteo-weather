#!/usr/bin/env python3
"""
Helper script to identify test files that might have fetch mock issues.
Searches for patterns like:
- global.fetch = vi.fn(...)
- Promise.resolve({ ok: true, json: ...})
without proper headers
"""

import os
import re
from pathlib import Path

def find_test_files_with_fetch_mocks(directory):
    """Find all test files with fetch mocks"""
    test_files = []

    # Find all .test.js and .test.jsx files
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.endswith(('.test.js', '.test.jsx')):
                filepath = os.path.join(root, file)
                test_files.append(filepath)

    print(f"Found {len(test_files)} test files\n")

    # Check each file for fetch mocks without headers
    files_needing_fix = []

    for filepath in test_files:
        try:
            with open(filepath, 'r') as f:
                content = f.read()

            # Look for global.fetch assignments
            if 'global.fetch' in content:
                # Check if it has the old pattern (no headers)
                if re.search(r'Promise\.resolve\(\s*\{[^}]*json:', content) and 'headers:' not in content:
                    files_needing_fix.append(filepath)
                    print(f"❌ {filepath}")
                    print("   Found fetch mocks without headers")
                else:
                    print(f"✅ {filepath}")
                    print("   Already has proper fetch mocks")
        except Exception as e:
            print(f"⚠️  Error reading {filepath}: {e}")

    print(f"\n{'='*80}")
    print(f"Files needing fix: {len(files_needing_fix)}")
    for f in files_needing_fix:
        print(f"  - {f}")

if __name__ == '__main__':
    frontend_dir = '/Users/michaelbuckingham/Documents/meteo-app/frontend/src'
    find_test_files_with_fetch_mocks(frontend_dir)
