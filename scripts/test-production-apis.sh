#!/bin/bash
#
# Production API Testing Script
# Tests all critical API endpoints and frontend environment variables
#
# Usage: bash scripts/test-production-apis.sh
#

set -e  # Exit on error

echo "======================================"
echo "🧪 Production API Testing Suite"
echo "======================================"
echo ""

BASE_URL="https://api.meteo-beta.tachyonfuture.com/api"
FRONTEND_URL="https://meteo-beta.tachyonfuture.com"
PASS_COUNT=0
FAIL_COUNT=0

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Helper function to test API endpoint
test_api() {
    local name="$1"
    local url="$2"
    local expected_pattern="$3"

    echo -n "Testing $name... "

    response=$(curl -s "$url")
    status=$?

    if [ $status -ne 0 ]; then
        echo -e "${RED}✗ FAILED${NC} (curl error)"
        FAIL_COUNT=$((FAIL_COUNT + 1))
        echo "  Error: Could not connect to $url"
        return 1
    fi

    if echo "$response" | grep -q "$expected_pattern"; then
        echo -e "${GREEN}✓ PASSED${NC}"
        PASS_COUNT=$((PASS_COUNT + 1))
        return 0
    else
        echo -e "${RED}✗ FAILED${NC}"
        FAIL_COUNT=$((FAIL_COUNT + 1))
        echo "  Expected pattern: $expected_pattern"
        echo "  Got: $(echo "$response" | head -c 200)"
        return 1
    fi
}

# Helper function to test frontend env vars
test_frontend_env() {
    local name="$1"
    local search_pattern="$2"

    echo -n "Testing frontend $name... "

    # Fetch the main JS bundle
    main_js=$(curl -s "$FRONTEND_URL" | grep -o 'static/js/main\.[^"]*\.js' | head -1)

    if [ -z "$main_js" ]; then
        echo -e "${RED}✗ FAILED${NC} (could not find main.js)"
        FAIL_COUNT=$((FAIL_COUNT + 1))
        return 1
    fi

    js_content=$(curl -s "$FRONTEND_URL/$main_js")

    if echo "$js_content" | grep -q "$search_pattern"; then
        echo -e "${GREEN}✓ PASSED${NC}"
        PASS_COUNT=$((PASS_COUNT + 1))
        return 0
    else
        echo -e "${RED}✗ FAILED${NC}"
        FAIL_COUNT=$((FAIL_COUNT + 1))
        echo "  Pattern not found in bundle: $search_pattern"
        return 1
    fi
}

echo "📍 Backend API Tests"
echo "------------------------------------"

# 1. Health endpoint
test_api "Health Check" \
    "$BASE_URL/health" \
    '"status":"ok"'

# 2. Database connection
test_api "Database Connection" \
    "$BASE_URL/health" \
    '"database":"connected"'

# 3. Visual Crossing API config
test_api "Visual Crossing API" \
    "$BASE_URL/health" \
    '"visualCrossingApi":"configured"'

# 4. Current weather (Seattle)
test_api "Current Weather API" \
    "$BASE_URL/weather/current/Seattle,WA" \
    '"success":true'

# 5. Forecast weather (Seattle)
test_api "Forecast Weather API" \
    "$BASE_URL/weather/forecast/Seattle,WA" \
    '"success":true'

# 6. Location search
test_api "Location Search API" \
    "$BASE_URL/locations?search=Seattle" \
    '\[.*\]'

echo ""
echo "🌐 Frontend Environment Variables"
echo "------------------------------------"

# 7. Check if REACT_APP_API_URL is baked into bundle
test_frontend_env "API URL" \
    "api.meteo-beta.tachyonfuture.com"

# 8. Check if OpenWeather tile URLs are in bundle (proves API key is configured)
test_frontend_env "OpenWeather API Key" \
    "tile.openweathermap.org"

echo ""
echo "======================================"
echo "📊 Test Results"
echo "======================================"
echo -e "${GREEN}Passed: $PASS_COUNT${NC}"
echo -e "${RED}Failed: $FAIL_COUNT${NC}"
echo ""

if [ $FAIL_COUNT -eq 0 ]; then
    echo -e "${GREEN}✓ All tests passed!${NC}"
    echo "✅ Production deployment is healthy"
    exit 0
else
    echo -e "${RED}✗ Some tests failed${NC}"
    echo "❌ Review errors above and fix before deploying"
    exit 1
fi
