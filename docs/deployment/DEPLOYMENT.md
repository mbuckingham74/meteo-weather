# Meteo App - Production Deployment Guide

This guide covers deploying the Meteo App to production with Docker Compose and Nginx Proxy Manager.

**Live Example:** This app is deployed at https://meteo-beta.tachyonfuture.com/compare

## Architecture Overview

**Network Architecture:**
- `meteo-internal` - Internal network for MySQL ↔ Backend (isolated)
- `npm_network` - External NPM network for Frontend and Backend (public-facing)

**Services:**
- `meteo-mysql-prod` - MySQL 8.0 database (internal only)
- `meteo-backend-prod` - Node.js Express API (dual network)
- `meteo-frontend-prod` - React app served by Nginx (NPM network)

**Domains (example):**
- `meteo-app.example.com` → Frontend
- `api.meteo-app.example.com` → Backend API

---

## Prerequisites

1. **Server Requirements:**
   - Docker and Docker Compose installed
   - Nginx Proxy Manager (NPM) running
   - Ports 80 and 443 available for NPM

2. **DNS Configuration:**
   - Create A record: `meteo-app.example.com` → Your server IP
   - Create A record: `api.meteo-app.example.com` → Your server IP
   - (Replace example.com with your actual domain)

3. **API Keys:**
   - Visual Crossing Weather API key (get at: https://www.visualcrossing.com/weather-api)
   - OpenWeather API key (get at: https://openweathermap.org/api)
   - **Note:** Actual keys stored in `.env.secrets` (not committed to Git)

---

## Step-by-Step Deployment

### 1. Prepare Environment Configuration

Copy the production environment template and fill in your values:

```bash
cd /path/to/meteo-app
cp config/examples/.env.production.example .env.production
```

Edit `.env.production` with your actual values:

```bash
# Database Configuration
DB_ROOT_PASSWORD=your_secure_root_password_here
DB_NAME=meteo_app
DB_USER=meteo_user
DB_PASSWORD=your_secure_db_password_here

# Weather API Keys
OPENWEATHER_API_KEY=your_openweather_api_key_here
VISUAL_CROSSING_API_KEY=your_visual_crossing_api_key_here

# Backend Configuration
JWT_SECRET=your_secure_jwt_secret_minimum_32_characters

# CORS Configuration (use your actual frontend domain)
CORS_ORIGIN=https://meteo-app.example.com

# Frontend API URL (use your actual API domain)
REACT_APP_API_URL=https://api.meteo-app.example.com/api
```

**Security Note:** Generate secure passwords and JWT secret:
```bash
# Generate random passwords
openssl rand -base64 32

# Generate JWT secret (minimum 32 characters)
openssl rand -hex 32
```

---

### 2. Ensure NPM Network Exists

NPM should already have a Docker network. Verify it exists:

```bash
docker network ls | grep npm_network
```

If it doesn't exist, create it:

```bash
docker network create npm_network
```

---

### 3. Build and Start Services

Start the production stack using the production docker-compose file:

```bash
# Build and start all services
docker-compose -f docker-compose.prod.yml --env-file .env.production up -d --build

# View logs
docker-compose -f docker-compose.prod.yml logs -f

# Check container status
docker-compose -f docker-compose.prod.yml ps
```

**Expected Output:**
```
NAME                   STATUS    PORTS
meteo-mysql-prod       running   3306/tcp
meteo-backend-prod     running   5001/tcp
meteo-frontend-prod    running   80/tcp
```

---

### 4. Verify Services Health

Check that all services are running and healthy:

```bash
# Check MySQL
docker exec meteo-mysql-prod mysqladmin ping -u meteo_user -p<DB_PASSWORD>

# Check Backend health endpoint (from inside container network)
docker exec meteo-backend-prod wget -qO- http://localhost:5001/api/health

# Check Frontend
docker exec meteo-frontend-prod wget -qO- http://localhost:80/health
```

---

### 5. Configure Nginx Proxy Manager

You have two options: **CLI (automated)** or **Manual (GUI)**

#### Option A: Automated CLI Setup (Recommended)

Set your NPM credentials and run the configuration script:

```bash
export NPM_EMAIL="admin@example.com"
export NPM_PASSWORD="your_npm_password"
export NPM_API_URL="http://localhost:81/api"  # Adjust if NPM runs on different port

./scripts/configure-npm.sh
```

The script will:
- Authenticate with NPM API
- Create proxy host for frontend (`meteo-app.example.com`)
- Create proxy host for API (`api.meteo-app.example.com`)
- Request Let's Encrypt SSL certificates
- Enable HTTPS with forced SSL redirect

**Troubleshooting:**
- If authentication fails, verify your NPM credentials
- If SSL fails, ensure DNS records are propagating (can take 5-15 minutes)
- Check NPM logs: `docker logs -f nginx-proxy-manager`

#### Option B: Manual GUI Setup

1. **Access NPM Admin Panel:**
   - Navigate to `http://your-server-ip:81`
   - Login with your NPM credentials

2. **Create Frontend Proxy Host:**
   - Click "Proxy Hosts" → "Add Proxy Host"
   - **Details tab:**
     - Domain Names: `meteo-app.example.com`
     - Scheme: `http`
     - Forward Hostname/IP: `meteo-frontend-prod`
     - Forward Port: `80`
     - Enable: Cache Assets, Block Common Exploits, Websockets Support
   - **SSL tab:**
     - SSL Certificate: Request a new SSL Certificate
     - Force SSL: ✓
     - HTTP/2 Support: ✓
     - HSTS Enabled: ✓
   - Click "Save"

3. **Create Backend API Proxy Host:**
   - Click "Add Proxy Host"
   - **Details tab:**
     - Domain Names: `api.meteo-app.example.com`
     - Scheme: `http`
     - Forward Hostname/IP: `meteo-backend-prod`
     - Forward Port: `5001`
     - Enable: Block Common Exploits
     - **Do NOT enable caching** (API responses are dynamic)
   - **SSL tab:**
     - SSL Certificate: Request a new SSL Certificate
     - Force SSL: ✓
     - HTTP/2 Support: ✓
     - HSTS Enabled: ✓
   - Click "Save"

---

### 6. Verify Deployment

After NPM configuration completes (SSL certificates can take 2-5 minutes):

```bash
# Test Frontend
curl -I https://meteo-app.example.com

# Test Backend API
curl https://api.meteo-app.example.com/api/health

# Expected response:
# {
#   "status": "ok",
#   "message": "Meteo API is running",
#   "database": "connected",
#   "visualCrossingApi": "configured",
#   "timestamp": "2025-10-26T..."
# }
```

Open your browser and navigate to:
- **Frontend:** https://meteo-app.example.com
- **API Health:** https://api.meteo-app.example.com/api/health

---

## Database Management

### Initialize Database Schema

The database schema is automatically initialized on first start via `docker-entrypoint-initdb.d`.

To manually reinitialize (⚠️ **DESTRUCTIVE** - drops all data):

```bash
docker exec -i meteo-mysql-prod mysql -u root -p${DB_ROOT_PASSWORD} ${DB_NAME} < database/schema.sql
docker exec -i meteo-mysql-prod mysql -u root -p${DB_ROOT_PASSWORD} ${DB_NAME} < database/seed.sql
```

### Backup Database

```bash
# Create backup
docker exec meteo-mysql-prod mysqldump -u root -p${DB_ROOT_PASSWORD} ${DB_NAME} > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore from backup
docker exec -i meteo-mysql-prod mysql -u root -p${DB_ROOT_PASSWORD} ${DB_NAME} < backup_20251026_120000.sql
```

### Connect to Database

```bash
docker exec -it meteo-mysql-prod mysql -u meteo_user -p${DB_PASSWORD} meteo_app
```

---

## Maintenance

### View Logs

```bash
# All services
docker-compose -f docker-compose.prod.yml logs -f

# Specific service
docker-compose -f docker-compose.prod.yml logs -f backend

# Last 100 lines
docker-compose -f docker-compose.prod.yml logs --tail=100
```

### Update Application

```bash
# Pull latest code
git pull origin main

# Rebuild and restart
docker-compose -f docker-compose.prod.yml up -d --build

# View rolling restart
docker-compose -f docker-compose.prod.yml logs -f
```

### Restart Services

```bash
# Restart all
docker-compose -f docker-compose.prod.yml restart

# Restart specific service
docker-compose -f docker-compose.prod.yml restart backend
```

### Stop Services

```bash
# Stop all (keeps volumes)
docker-compose -f docker-compose.prod.yml down

# Stop and remove volumes (⚠️ DESTROYS DATA)
docker-compose -f docker-compose.prod.yml down -v
```

---

## Monitoring

### Health Checks

Docker Compose includes health checks for all services:

```bash
# Check service health status
docker ps --format "table {{.Names}}\t{{.Status}}"

# Expected output:
# meteo-frontend-prod    Up 5 minutes (healthy)
# meteo-backend-prod     Up 5 minutes (healthy)
# meteo-mysql-prod       Up 5 minutes (healthy)
```

### Resource Usage

```bash
# Container resource usage
docker stats meteo-frontend-prod meteo-backend-prod meteo-mysql-prod

# Disk usage
docker system df
```

---

## Troubleshooting

### Frontend Not Loading

1. Check container is running:
   ```bash
   docker ps | grep meteo-frontend-prod
   ```

2. Check nginx logs:
   ```bash
   docker logs meteo-frontend-prod
   ```

3. Verify NPM proxy host is configured correctly
4. Check DNS propagation: `dig meteo-app.example.com`

### Backend API Errors

1. Check backend logs:
   ```bash
   docker logs -f meteo-backend-prod
   ```

2. Verify database connection:
   ```bash
   curl http://localhost:5001/api/health
   ```

3. Check environment variables:
   ```bash
   docker exec meteo-backend-prod env | grep -E 'DB_|API_KEY'
   ```

### Database Connection Issues

1. Check MySQL is running:
   ```bash
   docker exec meteo-mysql-prod mysqladmin ping
   ```

2. Verify backend can reach MySQL:
   ```bash
   docker exec meteo-backend-prod ping -c 3 mysql-prod
   ```

3. Check MySQL logs:
   ```bash
   docker logs meteo-mysql-prod
   ```

### CORS Errors

If you see CORS errors in the browser console:

1. Verify `CORS_ORIGIN` in `.env.production` matches your frontend domain exactly
2. Restart backend: `docker-compose -f docker-compose.prod.yml restart backend`
3. Check backend CORS configuration in logs

### SSL Certificate Issues

1. Verify DNS records are pointing to your server
2. Check NPM logs: `docker logs nginx-proxy-manager`
3. Ensure ports 80 and 443 are open on your firewall
4. Try regenerating SSL certificate in NPM admin panel

---

## Security Considerations

1. **Environment Variables:**
   - Never commit `.env.production` to version control
   - Use strong, unique passwords (minimum 32 characters)
   - Rotate secrets periodically

2. **Database Security:**
   - MySQL is only accessible on internal network (not exposed to NPM)
   - Use strong root and user passwords
   - Regular backups recommended

3. **API Security:**
   - CORS is restricted to production frontend domain
   - Rate limiting should be implemented for production
   - API keys are never exposed to frontend

4. **SSL/TLS:**
   - Force HTTPS on all domains
   - HSTS enabled for security
   - Let's Encrypt auto-renewal via NPM

---

## Performance Optimization

### API Caching

The backend implements intelligent API caching in MySQL:
- Current weather: 30 minutes TTL
- Forecasts: 6 hours TTL
- Historical data: 7 days TTL
- Air quality: 60 minutes TTL

Check cache statistics:
```bash
curl https://api.meteo-app.example.com/api/cache/stats
```

### Frontend Optimization

- Static assets cached for 1 year (nginx)
- Gzip compression enabled
- React production build with minification

### Database Optimization

MySQL is configured with:
- InnoDB buffer pool size optimized for container
- Query caching enabled
- Indexes on frequently queried columns

---

## Scaling Considerations

### Horizontal Scaling

To scale frontend or backend:

```bash
docker-compose -f docker-compose.prod.yml up -d --scale backend=3 --scale frontend=2
```

**Note:** This requires additional NPM configuration for load balancing.

### Database Scaling

For production workloads, consider:
- Moving MySQL to dedicated server
- Implementing read replicas
- Using managed database service (AWS RDS, DigitalOcean)

---

## Support

For issues or questions:
- Check logs first: `docker-compose -f docker-compose.prod.yml logs -f`
- Review troubleshooting section above
- Check GitHub issues: [repository URL]

---

## Quick Reference

```bash
# Start production
docker-compose -f docker-compose.prod.yml --env-file .env.production up -d

# Stop production
docker-compose -f docker-compose.prod.yml down

# View logs
docker-compose -f docker-compose.prod.yml logs -f

# Update app
git pull && docker-compose -f docker-compose.prod.yml up -d --build

# Backup database
docker exec meteo-mysql-prod mysqldump -u root -p${DB_ROOT_PASSWORD} ${DB_NAME} > backup.sql

# Check health
curl https://api.meteo-app.example.com/api/health
```
