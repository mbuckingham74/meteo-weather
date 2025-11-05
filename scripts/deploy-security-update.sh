#!/bin/bash

# Security Update Deployment Script
# Run this on the production server after SSH'ing in

set -e

echo "╔════════════════════════════════════════════════════════════╗"
echo "║  Meteo Security Update Deployment                         ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Check if running on production server
if [ ! -d "/opt/meteo-app" ]; then
  echo "❌ Error: Not on production server (/opt/meteo-app not found)"
  echo "Please run this script on the production server:"
  echo "  1. SSH to server"
  echo "  2. cd /opt/meteo-app"
  echo "  3. bash scripts/deploy-security-update.sh"
  exit 1
fi

cd /opt/meteo-app

echo "📦 Step 1: Pulling latest code from GitHub..."
git pull origin main

echo ""
echo "📝 Step 2: Updating backend/.env configuration..."

# Check if CORS_ALLOWED_ORIGINS exists
if grep -q "CORS_ALLOWED_ORIGINS" backend/.env; then
  echo "✓ CORS_ALLOWED_ORIGINS already exists in .env"
else
  echo "Adding CORS_ALLOWED_ORIGINS to backend/.env..."
  cat >> backend/.env << 'EOF'

# CORS Configuration
# Comma-separated list of allowed origins (no spaces!)
CORS_ALLOWED_ORIGINS=https://meteo-beta.tachyonfuture.com,http://localhost:3000,http://localhost:3001
EOF
  echo "✓ CORS_ALLOWED_ORIGINS added"
fi

# Check if NODE_ENV is set to production
if grep -q "NODE_ENV=production" backend/.env; then
  echo "✓ NODE_ENV already set to production"
else
  echo "Setting NODE_ENV to production..."
  if grep -q "NODE_ENV=" backend/.env; then
    sed -i 's/NODE_ENV=.*/NODE_ENV=production/' backend/.env
  else
    echo "NODE_ENV=production" >> backend/.env
  fi
  echo "✓ NODE_ENV set to production"
fi

echo ""
echo "🐳 Step 3: Stopping containers..."
docker-compose down

echo ""
echo "🔨 Step 4: Building containers with new security middleware..."
docker-compose build --no-cache backend

echo ""
echo "🚀 Step 5: Starting containers..."
docker-compose up -d

echo ""
echo "⏳ Step 6: Waiting for containers to be healthy..."
sleep 10

echo ""
echo "✅ Step 7: Verifying deployment..."

# Check container status
echo ""
echo "Container Status:"
docker-compose ps

echo ""
echo "Backend Logs (last 20 lines):"
docker-compose logs --tail=20 backend

echo ""
echo "Testing API health..."
HEALTH_RESPONSE=$(curl -s https://api.meteo-beta.tachyonfuture.com/api/health)

if echo "$HEALTH_RESPONSE" | grep -q "ok"; then
  echo "✅ API health check: PASSED"
else
  echo "❌ API health check: FAILED"
  echo "Response: $HEALTH_RESPONSE"
fi

echo ""
echo "Testing security headers..."
curl -I https://api.meteo-beta.tachyonfuture.com/api/health | grep -E "Content-Security|X-Frame|RateLimit"

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║  Backend Deployment Complete!                             ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo "Next Steps:"
echo "  1. Configure Nginx security headers via Nginx Proxy Manager"
echo "     → http://your-server-ip:81"
echo "     → Follow: docs/NGINX_SECURITY_DEPLOYMENT_GUIDE.md"
echo ""
echo "  2. Test rate limiting:"
echo "     → Try 6 failed logins (should block on 6th)"
echo ""
echo "  3. Run security scans:"
echo "     → https://observatory.mozilla.org/"
echo "     → https://securityheaders.com/"
echo "     → https://www.ssllabs.com/ssltest/"
echo ""
echo "Documentation:"
echo "  • Full checklist: docs/SECURITY_DEPLOYMENT_CHECKLIST.md"
echo "  • Nginx guide: docs/NGINX_SECURITY_DEPLOYMENT_GUIDE.md"
echo ""
