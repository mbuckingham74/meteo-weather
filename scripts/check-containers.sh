#!/bin/bash
# Container Health Check Script
# Verifies all Meteo containers are running and healthy

set -e

echo "🔍 Checking Meteo Container Status..."
echo ""

# Check if we're on the production server
if [ ! -f "/home/michael/meteo-app/.env.production" ]; then
    echo "⚠️  Not on production server. Run this on tachyonfuture.com"
    exit 1
fi

cd /home/michael/meteo-app || exit 1

echo "📊 Current container status:"
docker ps -a --filter "name=meteo" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
echo ""

# Check each critical container
CONTAINERS=("meteo-mysql-prod" "meteo-backend-prod" "meteo-frontend-prod")
FAILED_CONTAINERS=()

for container in "${CONTAINERS[@]}"; do
    if docker ps --filter "name=$container" --filter "status=running" -q | grep -q .; then
        echo "✅ $container is running"

        # Check health if container has healthcheck
        HEALTH=$(docker inspect --format='{{.State.Health.Status}}' "$container" 2>/dev/null || echo "no-healthcheck")
        if [ "$HEALTH" != "no-healthcheck" ]; then
            if [ "$HEALTH" = "healthy" ]; then
                echo "   Health: ✅ $HEALTH"
            else
                echo "   Health: ⚠️  $HEALTH"
                FAILED_CONTAINERS+=("$container (unhealthy)")
            fi
        fi
    else
        echo "❌ $container is NOT running"
        FAILED_CONTAINERS+=("$container")

        # Show recent logs
        echo "   Recent logs:"
        docker logs "$container" --tail 10 2>&1 | sed 's/^/   /'
    fi
    echo ""
done

# Check NPM network connectivity
echo "🔌 Checking NPM network connectivity..."
if docker network inspect npm_network >/dev/null 2>&1; then
    echo "✅ npm_network exists"

    # Check which containers are on NPM network
    CONNECTED=$(docker network inspect npm_network --format '{{range .Containers}}{{.Name}} {{end}}')
    if echo "$CONNECTED" | grep -q "meteo-frontend-prod"; then
        echo "✅ meteo-frontend-prod connected to npm_network"
    else
        echo "❌ meteo-frontend-prod NOT connected to npm_network"
        FAILED_CONTAINERS+=("frontend-network")
    fi

    if echo "$CONNECTED" | grep -q "meteo-backend-prod"; then
        echo "✅ meteo-backend-prod connected to npm_network"
    else
        echo "❌ meteo-backend-prod NOT connected to npm_network"
        FAILED_CONTAINERS+=("backend-network")
    fi
else
    echo "❌ npm_network does NOT exist!"
    FAILED_CONTAINERS+=("npm_network")
fi
echo ""

# Check internal network
echo "🔌 Checking internal network connectivity..."
if docker network inspect meteo-internal >/dev/null 2>&1; then
    echo "✅ meteo-internal network exists"

    CONNECTED=$(docker network inspect meteo-internal --format '{{range .Containers}}{{.Name}} {{end}}')
    if echo "$CONNECTED" | grep -q "meteo-mysql-prod"; then
        echo "✅ meteo-mysql-prod connected to meteo-internal"
    else
        echo "❌ meteo-mysql-prod NOT connected to meteo-internal"
    fi

    if echo "$CONNECTED" | grep -q "meteo-backend-prod"; then
        echo "✅ meteo-backend-prod connected to meteo-internal"
    else
        echo "❌ meteo-backend-prod NOT connected to meteo-internal"
    fi
else
    echo "❌ meteo-internal network does NOT exist!"
fi
echo ""

# Summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if [ ${#FAILED_CONTAINERS[@]} -eq 0 ]; then
    echo "✅ All containers are healthy!"
    echo ""
    echo "📍 Application URLs:"
    echo "   Frontend: https://meteo-beta.tachyonfuture.com"
    echo "   Backend API: https://api.meteo-beta.tachyonfuture.com"
else
    echo "❌ Issues detected with ${#FAILED_CONTAINERS[@]} container(s):"
    for container in "${FAILED_CONTAINERS[@]}"; do
        echo "   - $container"
    done
    echo ""
    echo "💡 To fix, run:"
    echo "   cd /home/michael/meteo-app"
    echo "   docker-compose -f docker-compose.prod.yml down"
    echo "   docker-compose -f docker-compose.prod.yml --env-file .env.production up -d"
    exit 1
fi
