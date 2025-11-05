#!/bin/bash

# Docker Build Verification Script
#
# Tests that Docker builds work correctly and catch common issues
# Run this before deploying to ensure Docker containers will work

set -e

COLORS_RED='\033[0;31m'
COLORS_GREEN='\033[0;32m'
COLORS_YELLOW='\033[1;33m'
COLORS_BLUE='\033[0;34m'
COLORS_NC='\033[0m' # No Color

error() {
    echo -e "${COLORS_RED}✗ ERROR: $1${COLORS_NC}"
    exit 1
}

success() {
    echo -e "${COLORS_GREEN}✓ $1${COLORS_NC}"
}

warning() {
    echo -e "${COLORS_YELLOW}⚠ WARNING: $1${COLORS_NC}"
}

info() {
    echo -e "${COLORS_BLUE}ℹ $1${COLORS_NC}"
}

echo -e "${COLORS_BLUE}╔════════════════════════════════════════════════╗${COLORS_NC}"
echo -e "${COLORS_BLUE}║  Docker Build Verification                    ║${COLORS_NC}"
echo -e "${COLORS_BLUE}╚════════════════════════════════════════════════╝${COLORS_NC}"
echo ""

# Check 1: Verify Dockerfiles exist
info "Checking Dockerfiles..."
if [ ! -f "frontend/Dockerfile.dev" ]; then
    error "frontend/Dockerfile.dev not found"
fi
success "frontend/Dockerfile.dev exists"

if [ ! -f "frontend/Dockerfile.prod" ]; then
    error "frontend/Dockerfile.prod not found"
fi
success "frontend/Dockerfile.prod exists"

if [ ! -f "backend/Dockerfile" ]; then
    error "backend/Dockerfile not found"
fi
success "backend/Dockerfile exists"

# Check 2: Verify Dockerfiles don't use deprecated commands
info ""
info "Checking for deprecated commands..."

if grep -q "npm start" frontend/Dockerfile.dev; then
    error "frontend/Dockerfile.dev uses deprecated 'npm start'"
fi
success "frontend/Dockerfile.dev doesn't use 'npm start'"

if grep -q "npm start" frontend/Dockerfile.prod; then
    error "frontend/Dockerfile.prod uses deprecated 'npm start'"
fi
success "frontend/Dockerfile.prod doesn't use 'npm start'"

# Check 3: Build frontend development image
info ""
info "Building frontend development Docker image..."
if docker build -t meteo-frontend-dev:test -f frontend/Dockerfile.dev frontend > /dev/null 2>&1; then
    success "Frontend dev image built successfully"
else
    error "Frontend dev image failed to build"
fi

# Check 4: Build frontend production image
info ""
info "Building frontend production Docker image..."
if docker build -t meteo-frontend-prod:test -f frontend/Dockerfile.prod \
    --build-arg VITE_API_URL=http://localhost:5001/api \
    --build-arg VITE_OPENWEATHER_API_KEY=test_key \
    frontend > /dev/null 2>&1; then
    success "Frontend prod image built successfully"
else
    error "Frontend prod image failed to build"
fi

# Check 5: Build backend image
info ""
info "Building backend Docker image..."
if docker build -t meteo-backend:test backend > /dev/null 2>&1; then
    success "Backend image built successfully"
else
    error "Backend image failed to build"
fi

# Check 6: Test frontend dev container starts
info ""
info "Testing frontend dev container..."
CONTAINER_ID=$(docker run -d -p 3099:3000 meteo-frontend-dev:test 2>/dev/null)
if [ -z "$CONTAINER_ID" ]; then
    error "Frontend dev container failed to start"
fi

# Wait for container to be ready
sleep 5

# Check if container is still running
if docker ps | grep -q "$CONTAINER_ID"; then
    success "Frontend dev container started successfully"
    docker stop "$CONTAINER_ID" > /dev/null 2>&1
    docker rm "$CONTAINER_ID" > /dev/null 2>&1
else
    # Get logs before cleaning up
    info "Container logs:"
    docker logs "$CONTAINER_ID" 2>&1 | tail -20
    docker rm "$CONTAINER_ID" > /dev/null 2>&1
    error "Frontend dev container exited immediately (check logs above)"
fi

# Check 7: Verify production build output
info ""
info "Verifying production build output..."
docker run --rm meteo-frontend-prod:test ls -la /usr/share/nginx/html | grep -q "index.html" && \
    success "Production build contains index.html" || \
    error "Production build missing index.html"

docker run --rm meteo-frontend-prod:test ls -la /usr/share/nginx/html/assets | grep -q ".js" && \
    success "Production build contains JavaScript assets" || \
    error "Production build missing JavaScript assets"

# Cleanup
info ""
info "Cleaning up test images..."
docker rmi -f meteo-frontend-dev:test meteo-frontend-prod:test meteo-backend:test > /dev/null 2>&1
success "Cleaned up test images"

echo ""
echo -e "${COLORS_BLUE}╔════════════════════════════════════════════════╗${COLORS_NC}"
echo -e "${COLORS_BLUE}║  Verification Summary                          ║${COLORS_NC}"
echo -e "${COLORS_BLUE}╚════════════════════════════════════════════════╝${COLORS_NC}"
echo ""
echo -e "${COLORS_GREEN}✅ All Docker builds verified successfully!${COLORS_NC}"
echo ""
