#!/usr/bin/env python3
"""
Quick script to fix remaining weatherApi.test.js test expectations.
Replaces old axios-style expectations with apiRequest-style expectations.
"""

import re

test_file = '/Users/michaelbuckingham/Documents/meteo-app/frontend/src/services/weatherApi.test.js'

# Read the file
with open(test_file, 'r') as f:
    content = f.read()

# Fix patterns that need updating:
# 1. params objects → query strings in URL
replacements = [
    # getHourlyForecast tests
    (r"expect\(apiRequest\)\.toHaveBeenCalledWith\('/weather/hourly/Boston', \{\s*params: \{ hours: 48 \},\s*\}\);",
     "expect(apiRequest).toHaveBeenCalledWith('/weather/hourly/Boston?hours=48', { method: 'GET' });"),

    (r"expect\(apiRequest\)\.toHaveBeenCalledWith\('/weather/hourly/Boston', \{\s*params: \{ hours: 72 \},\s*\}\);",
     "expect(apiRequest).toHaveBeenCalledWith('/weather/hourly/Boston?hours=72', { method: 'GET' });"),

    # getAllLocations tests
    (r"expect\(apiRequest\)\.toHaveBeenCalledWith\('/locations', \{\s*params: \{ page: 1, limit: 50 \},\s*\}\);",
     "expect(apiRequest).toHaveBeenCalledWith('/locations?page=1&limit=50', { method: 'GET' });"),

    (r"expect\(apiRequest\)\.toHaveBeenCalledWith\('/locations', \{\s*params: \{ page: 2, limit: 25 \},\s*\}\);",
     "expect(apiRequest).toHaveBeenCalledWith('/locations?page=2&limit=25', { method: 'GET' });"),

    # geocodeLocation tests
    (r"expect\(apiRequest\)\.toHaveBeenCalledWith\('/locations/geocode', \{\s*params: \{ address: 'London, UK', limit: 10 \},\s*\}\);",
     "expect(apiRequest).toHaveBeenCalledWith('/locations/geocode?address=London%2C+UK&limit=10', { method: 'GET' });"),

    (r"expect\(apiRequest\)\.toHaveBeenCalledWith\('/locations/geocode', \{\s*params: \{ address: 'Paris, France', limit: 5 \},\s*\}\);",
     "expect(apiRequest).toHaveBeenCalledWith('/locations/geocode?address=Paris%2C+France&limit=5', { method: 'GET' });"),

    # reverseGeocode tests
    (r"expect\(apiRequest\)\.toHaveBeenCalledWith\('/locations/reverse', \{\s*params: \{ lat: 51\.5074, lon: -0\.1278 \},\s*\}\);",
     "expect(apiRequest).toHaveBeenCalledWith('/locations/reverse?lat=51.5074&lon=-0.1278', { method: 'GET' });"),

    (r"expect\(apiRequest\)\.toHaveBeenCalledWith\('/locations/reverse', \{\s*params: \{ lat: -33\.8688, lon: 151\.2093 \},\s*\}\);",
     "expect(apiRequest).toHaveBeenCalledWith('/locations/reverse?lat=-33.8688&lon=151.2093', { method: 'GET' });"),

    # getPopularLocations test
    (r"expect\(apiRequest\)\.toHaveBeenCalledWith\('/locations/popular'\);",
     "expect(apiRequest).toHaveBeenCalledWith('/locations/popular', { method: 'GET' });"),

    # testApiConnection test
    (r"expect\(apiRequest\)\.toHaveBeenCalledWith\('/health'\);",
     "expect(apiRequest).toHaveBeenCalledWith('/health', { method: 'GET' });"),
]

# Apply replacements
for pattern, replacement in replacements:
    content = re.sub(pattern, replacement, content, flags=re.MULTILINE | re.DOTALL)

# Write back
with open(test_file, 'w') as f:
    f.write(content)

print("✅ Fixed weatherApi.test.js expectations!")
print(f"Applied {len(replacements)} replacements")
