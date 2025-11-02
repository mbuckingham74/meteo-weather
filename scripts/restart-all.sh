#!/bin/bash
# Quick Restart Script for Production
# Use this to quickly restart all containers when experiencing 502 errors

set -e

echo "🔄 Quick Restart of All Meteo Containers"
echo "========================================="
echo ""

# Navigate to app directory
cd /home/michael/meteo-app || exit 1

# Load environment variables
echo "🔐 Loading environment variables..."
if [ ! -f ".env.production" ]; then
    echo "❌ .env.production not found!"
    exit 1
fi
export $(cat .env.production | grep -v "^#" | xargs)
echo "✅ Environment loaded"
echo ""

# Stop all containers
echo "🛑 Stopping all containers..."
docker-compose -f docker-compose.prod.yml down
echo "✅ Stopped"
echo ""

# Start all containers
echo "🚀 Starting all containers..."
docker-compose -f docker-compose.prod.yml --env-file .env.production up -d
echo "✅ Started"
echo ""

# Wait for MySQL
echo "⏳ Waiting for MySQL (10 seconds)..."
sleep 10

# Wait for backend
echo "⏳ Waiting for backend (5 seconds)..."
sleep 5

# Check container status
echo ""
echo "📊 Container Status:"
docker ps --filter "name=meteo" --format "table {{.Names}}\t{{.Status}}"
echo ""

# Check backend health
echo "🏥 Checking backend health..."
if docker exec meteo-backend-prod wget -q -O- http://localhost:5001/api/health 2>/dev/null | grep -q "ok"; then
    echo "✅ Backend is healthy"
else
    echo "⚠️  Backend health check failed. Checking logs..."
    echo ""
    echo "📋 Last 20 lines of backend logs:"
    docker logs meteo-backend-prod --tail 20
fi

echo ""
echo "✅ Restart complete!"
echo "🌐 Site: https://meteo-beta.tachyonfuture.com"
echo "🔧 API: https://api.meteo-beta.tachyonfuture.com/api/health"
