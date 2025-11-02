#!/bin/bash
# Environment Verification Script
# Checks that all required environment variables are set for production

set -e

echo "🔍 Verifying Production Environment Configuration..."
echo ""

# Check if .env.production exists
if [ ! -f ".env.production" ]; then
    echo "❌ ERROR: .env.production file not found!"
    echo "   Copy from config/examples/.env.production.example and fill in values"
    exit 1
fi

echo "✅ .env.production file exists"

# Load environment variables
export $(cat .env.production | grep -v "^#" | xargs)

# Required variables
REQUIRED_VARS=(
    "DB_ROOT_PASSWORD"
    "DB_NAME"
    "DB_USER"
    "DB_PASSWORD"
    "OPENWEATHER_API_KEY"
    "VISUAL_CROSSING_API_KEY"
    "METEO_ANTHROPIC_API_KEY"
    "JWT_SECRET"
    "CORS_ORIGIN"
    "REACT_APP_API_URL"
)

MISSING_VARS=()

# Check each required variable
for var in "${REQUIRED_VARS[@]}"; do
    if [ -z "${!var}" ]; then
        MISSING_VARS+=("$var")
        echo "❌ $var is not set"
    else
        # Show first 10 chars for verification (don't expose full secrets)
        VALUE_PREVIEW="${!var:0:10}..."
        if [ "$var" = "CORS_ORIGIN" ] || [ "$var" = "REACT_APP_API_URL" ]; then
            # Show full value for URLs
            VALUE_PREVIEW="${!var}"
        fi
        echo "✅ $var = $VALUE_PREVIEW"
    fi
done

echo ""

# Report results
if [ ${#MISSING_VARS[@]} -eq 0 ]; then
    echo "✅ All required environment variables are set!"
    echo ""
    echo "📋 Summary:"
    echo "   - Database configured"
    echo "   - API keys present"
    echo "   - JWT secret configured"
    echo "   - CORS and API URLs set"
    echo ""
    echo "Ready to deploy!"
    exit 0
else
    echo "❌ Missing ${#MISSING_VARS[@]} required environment variable(s):"
    for var in "${MISSING_VARS[@]}"; do
        echo "   - $var"
    done
    echo ""
    echo "Please add these variables to .env.production before deploying."
    exit 1
fi
