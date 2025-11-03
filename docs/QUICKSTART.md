# Quick Start Guide

## 🚀 Get Up and Running in 5 Minutes

### 1. Clone the Repository
```bash
git clone https://github.com/mbuckingham74/meteo-app.git
cd meteo-app
```

### 2. Create Environment File

For a new environment, create a `.env` file in the project root:

```bash
cat > .env << 'EOF'
# Server
PORT=5001
NODE_ENV=development

# Database
DB_USER=root
DB_PASSWORD=your_secure_db_password_here
DB_NAME=meteo_app

# External APIs
VISUAL_CROSSING_API_KEY=your_visual_crossing_api_key_here
# Optional:
# OPENWEATHER_API_KEY=your_openweather_key_here
# METEO_ANTHROPIC_API_KEY=your_anthropic_api_key_here

# JWT (required for auth flows)
JWT_SECRET=replace_me_with_strong_secret
JWT_REFRESH_SECRET=replace_me_with_stronger_secret
EOF
```

**⚠️ Security Note:** The `.env` file is in `.gitignore` and will NOT be pushed to GitHub.

### 3. Start the Application
```bash
docker-compose up -d
```

This starts:
- ✅ MySQL database on port **3307**
- ✅ Backend API on port **5001**
- ✅ Frontend React app on port **3000**

### 4. Initialize the Database
```bash
# Wait a few seconds for MySQL to start, then:
docker exec -it meteo-backend npm run db:init
```

This creates all tables and adds sample location data.

> ℹ️ Historical weather tables start empty. Data is fetched and cached on demand when you hit the API; we do not ship pre-populated historical records.

### 5. Verify Everything Works
```bash
# Check health endpoint
curl http://localhost:5001/api/health

# Expected output:
# {"status":"ok","database":"connected","message":"Meteo API is running",...}
```

### 6. Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5001
- **Database**: localhost:3307

## 📦 Your API Key is Safe

### ✅ What's Protected (NOT in Git)
- `backend/.env` - Your actual API key (gitignored)
- `.env` - Project root environment file (gitignored)

### ✅ What's in Git (Safe to Share)
- `config/examples/.env.backend.example` - Template without real keys
- `docs/DEPLOYMENT.md` - Instructions for deployment
- `docker-compose.yml` - Reads from `.env` file
- All source code

## 🔄 How It Works

1. **Local Development:**
   - Your API key is in `backend/.env` (gitignored)
   - Docker Compose reads from `.env` in project root
   - Environment variables are injected into containers

2. **Git Repository:**
   - Only example configs in `config/examples/` are committed (templates, no real keys)
   - `.gitignore` prevents `.env` from being committed
   - Your secrets stay local

3. **Deployment:**
   - Use GitHub Secrets, Heroku config vars, or cloud env variables
   - See `DEPLOYMENT.md` for platform-specific instructions

## 🛠️ Common Commands

```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f backend

# Restart backend after .env changes
docker-compose restart backend

# Initialize/reset database
docker exec -it meteo-backend npm run db:init

# Check if API key is loaded
docker exec meteo-backend printenv VISUAL_CROSSING_API_KEY
```

## 🆘 Troubleshooting

### API Key Not Working?
```bash
# Verify .env exists in project root
cat .env

# Verify environment variable in container
docker exec meteo-backend printenv VISUAL_CROSSING_API_KEY

# Restart to reload environment
docker-compose restart backend
```

### Database Connection Issues?
```bash
# Check MySQL is running
docker ps | grep mysql

# Check database logs
docker-compose logs mysql
```

## 📚 Next Steps

- Read `DEPLOYMENT.md` for production deployment
- Read `CLAUDE.md` for development guidance
- Check `database/README.md` for database schema details
