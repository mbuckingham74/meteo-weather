#!/bin/bash
# Deployment script for beta.meteo-app
# Ensures environment variables are properly loaded during build

set -e  # Exit on error

echo "🚀 Deploying to beta.meteo-app..."
echo ""

# Navigate to app directory
cd /home/michael/meteo-app || exit 1

# Pull latest code
echo "📥 Pulling latest code..."
git fetch origin
git reset --hard origin/main
echo "✅ Code updated to: $(git log -1 --oneline)"
echo ""

# Verify environment configuration
echo "🔐 Verifying environment configuration..."
if ! bash scripts/verify-env.sh; then
    echo "❌ Environment verification failed. Aborting deployment."
    exit 1
fi
echo ""

# Load environment variables
echo "🔐 Loading environment variables..."
export $(cat .env.production | grep -v "^#" | xargs)
echo "✅ Environment variables loaded"
echo "   OPENWEATHER_API_KEY: ${OPENWEATHER_API_KEY:0:10}..."
echo ""

# Build both frontend and backend
echo "🏗️  Building frontend..."
echo "   Passing REACT_APP_OPENWEATHER_API_KEY to build..."
docker compose -f docker-compose.prod.yml build --no-cache frontend
echo "✅ Frontend built"
echo ""

echo "🏗️  Building backend..."
docker compose -f docker-compose.prod.yml build --no-cache backend
echo "✅ Backend built"
echo ""

# Stop all services first to ensure clean restart
echo "🛑 Stopping all services..."
docker compose -f docker-compose.prod.yml down
echo "✅ Services stopped"
echo ""

# Start all services with newly built images
echo "🔄 Starting all services..."
docker compose -f docker-compose.prod.yml --env-file .env.production up -d
echo "✅ Services started"
echo ""

# Wait for MySQL to be ready first
echo "⏳ Waiting for MySQL to be ready..."
sleep 10

# Wait for backend to connect to MySQL
echo "⏳ Waiting for backend to start..."
sleep 5

# Check backend health
echo "🔍 Checking backend health..."
for i in {1..30}; do
    if docker exec meteo-backend-prod wget -q -O- http://localhost:5001/api/health 2>/dev/null | grep -q "ok"; then
        echo "✅ Backend is healthy"
        break
    fi
    if [ $i -eq 30 ]; then
        echo "❌ Backend health check failed after 30 attempts"
        echo "📋 Backend logs:"
        docker logs meteo-backend-prod --tail 50
        exit 1
    fi
    sleep 1
done
echo ""

# Verify deployment
echo "🔍 Verifying deployment..."

# Check if containers are running
FRONTEND_RUNNING=$(docker ps --filter "name=meteo-frontend-prod" --filter "status=running" -q)
BACKEND_RUNNING=$(docker ps --filter "name=meteo-backend-prod" --filter "status=running" -q)

if [ -z "$FRONTEND_RUNNING" ]; then
    echo "❌ ERROR: Frontend container is not running!"
    docker logs meteo-frontend-prod --tail 50
    exit 1
fi

if [ -z "$BACKEND_RUNNING" ]; then
    echo "❌ ERROR: Backend container is not running!"
    docker logs meteo-backend-prod --tail 50
    exit 1
fi

echo "✅ All containers are running"

# Verify network connectivity
echo ""
echo "🔌 Verifying network connectivity..."
FRONTEND_NETWORK=$(docker inspect meteo-frontend-prod --format '{{range $net, $conf := .NetworkSettings.Networks}}{{$net}} {{end}}')
BACKEND_NETWORK=$(docker inspect meteo-backend-prod --format '{{range $net, $conf := .NetworkSettings.Networks}}{{$net}} {{end}}')

if echo "$FRONTEND_NETWORK" | grep -q "npm_network"; then
    echo "✅ Frontend connected to npm_network"
else
    echo "❌ Frontend NOT connected to npm_network!"
    echo "   Networks: $FRONTEND_NETWORK"
fi

if echo "$BACKEND_NETWORK" | grep -q "npm_network"; then
    echo "✅ Backend connected to npm_network"
else
    echo "❌ Backend NOT connected to npm_network!"
    echo "   Networks: $BACKEND_NETWORK"
fi

if echo "$BACKEND_NETWORK" | grep -q "meteo-internal"; then
    echo "✅ Backend connected to meteo-internal"
else
    echo "❌ Backend NOT connected to meteo-internal!"
fi
echo ""

# Verify API key in bundle
if [ -n "$OPENWEATHER_API_KEY" ]; then
  echo "   Checking for API key in bundle..."
  API_KEY_COUNT=$(docker exec meteo-frontend-prod sh -c "grep -c '$OPENWEATHER_API_KEY' /usr/share/nginx/html/static/js/main.*.js 2>/dev/null" || echo "0")

  if [ "$API_KEY_COUNT" -gt 0 ]; then
    echo "✅ OpenWeather API key found in bundle ($API_KEY_COUNT occurrence(s))"
  else
    echo "❌ WARNING: OpenWeather API key NOT found in bundle!"
    echo "   Checking if REACT_APP_ prefix variable exists..."
    docker exec meteo-frontend-prod sh -c "grep -o 'REACT_APP_OPENWEATHER_API_KEY' /usr/share/nginx/html/static/js/main.*.js | head -5" || echo "   No REACT_APP_OPENWEATHER_API_KEY references found"
  fi
else
  echo "⚠️  WARNING: OPENWEATHER_API_KEY not set - skipping bundle verification"
fi

# Show container status
echo ""
echo "📊 Container status:"
docker ps | grep meteo

echo ""
echo "✅ Deployment complete!"
echo "🌐 Site: https://meteo-beta.tachyonfuture.com"
