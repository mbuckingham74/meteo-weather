# Video Tutorial Guide

Complete guide for creating video tutorials for Meteo Weather App, including scripts, recording tips, and production guidelines.

**Target Audience:** New users, contributors, and self-hosters
**Duration:** 3-5 minutes per tutorial
**Format:** Screen recording with voiceover

---

## 🎬 Tutorial Series Overview

### Recommended Tutorial Videos

1. **Quick Start** (3 minutes) - Get the app running with Docker
2. **API Setup** (4 minutes) - Obtain and configure API keys
3. **Feature Overview** (5 minutes) - Tour of all features
4. **Location Comparison** (3 minutes) - Compare weather between cities
5. **AI Features** (4 minutes) - Using AI Weather Assistant and Location Finder
6. **Deployment** (8 minutes) - Deploy to production server
7. **Contributing** (5 minutes) - How to contribute code

---

## 📝 Tutorial Scripts

### Tutorial 1: Quick Start (3 minutes)

**Title:** "Get Meteo Weather App Running in 3 Minutes"

**Script:**

```
[0:00 - Introduction]
Hi! In this video, I'll show you how to get Meteo Weather App running on your local machine in just 3 minutes.

Meteo is a self-hostable weather dashboard with features like:
- Real-time weather and forecasts
- Historical climate data
- AI-powered weather questions
- Location comparison tools

Let's get started!

[0:20 - Prerequisites]
Before we begin, make sure you have:
- Docker Desktop installed and running
- Git installed
- A text editor (VS Code recommended)
- Two free API keys (I'll show you where to get them)

[0:35 - Clone Repository]
First, open your terminal and clone the repository:

git clone https://github.com/mbuckingham74/meteo-weather.git
cd meteo-weather

[Shows terminal with commands]

[0:50 - API Keys]
Now, you'll need two FREE API keys. Open your browser and:

1. Visual Crossing Weather API - go to visualcrossing.com/weather-api
   - Click "Sign Up"
   - Free tier: 1,000 records per day
   - Copy your API key

2. OpenWeather API - go to openweathermap.org/api
   - Click "Sign Up"
   - Free tier: 1,000 calls per day
   - Copy your API key
   - Note: Can take 10 minutes to activate

[Shows signing up on both sites]

[1:40 - Configure Environment]
Back in your terminal, create the environment file:

cp .env.example backend/.env

[Shows command]

Now open backend/.env in your text editor and paste your API keys:

VISUAL_CROSSING_API_KEY=your_key_here
OPENWEATHER_API_KEY=your_key_here

[Shows editing .env file with keys]

[2:05 - Start Application]
Save the file, then start the application with Docker:

docker-compose up

[Shows docker-compose output]

Wait for all services to start... you'll see:
- MySQL database initializing
- Backend server starting on port 5001
- Frontend building and starting on port 3000

[2:30 - Access Application]
Once you see "webpack compiled successfully", open your browser to:

http://localhost:3000

[Shows browser loading the app]

And there it is! The Meteo Weather App is now running.

[2:45 - Quick Test]
Let's test it:
- Search for a city like "Seattle, WA"
- View current weather and forecast
- Click on the radar map
- Try comparing two locations

[Shows clicking through features]

[2:55 - Closing]
That's it! You now have Meteo Weather App running locally.

Check out the documentation at github.com/mbuckingham74/meteo-weather for:
- Detailed setup guides
- Feature tutorials
- Deployment instructions
- Contributing guidelines

Thanks for watching!

[3:00 - End]
```

**Screen Recording Checklist:**
- [ ] Clean desktop with minimal distractions
- [ ] Browser with only relevant tabs
- [ ] Terminal with increased font size (16-18pt)
- [ ] Text editor with clear font
- [ ] Slow, deliberate mouse movements
- [ ] Pause between sections

---

### Tutorial 2: Feature Overview (5 minutes)

**Title:** "Meteo Weather App - Complete Feature Tour"

**Script:**

```
[0:00 - Introduction]
Welcome! In this video, I'll give you a complete tour of Meteo Weather App's features.

[0:10 - Current Weather]
Let's start by searching for a city. Type "Seattle, WA" in the search box.

[Shows search]

You can see:
- Current temperature and conditions
- Feels like temperature
- Humidity and wind speed
- Sunrise and sunset times
- 24-hour precipitation amount

[Points to each element]

[0:35 - Forecast]
Scroll down to see the 7-day forecast with:
- Daily high and low temperatures
- Precipitation probability
- Weather conditions
- Wind speed

Click on any day to see hourly details.

[Shows expanding a day]

[0:55 - Weather Radar]
The interactive radar map shows:
- Precipitation layers
- Temperature maps
- Cloud coverage
- Animated radar

Use the layer controls to switch views.

[Shows changing map layers]

[1:20 - Historical Data]
Scroll to "This Day in History" to see:
- Weather from previous years on this date
- Climate averages
- Record temperatures

Great for understanding patterns!

[Shows historical data]

[1:40 - Location Comparison]
Click "Compare Locations" in the header.

[Shows navigation]

Select two cities to compare:
- Side-by-side weather
- Temperature charts
- Climate analysis

Perfect for planning moves or vacations!

[Shows comparison features]

[2:15 - AI Weather Assistant]
Click the AI button in the header.

[Shows AI modal]

Ask natural language questions like:
- "Will it rain this weekend?"
- "Is today warmer than usual?"
- "Should I bring a jacket?"

The AI analyzes weather data and gives detailed answers.

[Shows typing and getting answer]

[2:50 - AI Location Finder]
Switch to "Location Finder" tab.

Describe your ideal climate:
- "I want somewhere 15 degrees cooler"
- "Less humid and less rain"
- "Good for outdoor activities"

The AI suggests matching cities with climate data.

[Shows location finder]

[3:25 - User Accounts]
Create a free account to unlock:
- Cloud-synced favorites
- Custom preferences
- Weather notifications

Click "Sign In" then "Register".

[Shows registration]

[3:45 - Favorites]
Save favorite locations for quick access:
- Click the star icon on any location
- Access from the favorites dropdown
- Drag to reorder

[Shows adding and managing favorites]

[4:10 - Settings]
Click your profile icon and go to Settings:
- Temperature units (Celsius/Fahrenheit)
- Default forecast days (3, 7, or 14)
- Dark/light theme
- Notification preferences

[Shows settings panel]

[4:35 - Mobile Responsive]
The app is fully responsive:
- Works great on phones
- Optimized touch controls
- Same features on all devices

[Shows resizing browser or mobile view]

[4:50 - Closing]
That's the complete feature tour!

Explore more at:
- Documentation: github.com/mbuckingham74/meteo-weather/docs
- Live demo: meteo-beta.tachyonfuture.com

Thanks for watching!

[5:00 - End]
```

---

### Tutorial 3: Deployment Guide (8 minutes)

**Title:** "Deploy Meteo Weather App to Production"

**Script:**

```
[0:00 - Introduction]
In this video, I'll show you how to deploy Meteo Weather App to a production server.

We'll use:
- A VPS (DigitalOcean, Linode, or Hostinger)
- Docker and Docker Compose
- Nginx Proxy Manager for HTTPS

[0:20 - Prerequisites]
You'll need:
- A VPS with Ubuntu 20.04+ or Debian 11+
- A domain name pointed to your server
- SSH access to your server
- Basic command line knowledge

[0:35 - Server Setup]
SSH into your server:

ssh root@your-server-ip

[Shows SSH connection]

Install Docker and Docker Compose:

curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
apt-get install docker-compose-plugin

[Shows installation]

[1:15 - Clone Repository]
Clone the repository to your server:

cd /home/your-user
git clone https://github.com/mbuckingham74/meteo-weather.git
cd meteo-weather

[Shows commands]

[1:35 - Environment Configuration]
Create production environment file:

cp .env.example .env.production

Edit with your production settings:

nano .env.production

[Shows editing file]

Important settings:
- NODE_ENV=production
- Strong JWT secrets
- Production CORS origins
- Your API keys

[2:15 - Docker Compose Production]
We'll use the production Docker Compose file:

docker-compose -f docker-compose.prod.yml up -d

[Shows starting containers]

This starts:
- MySQL database (persistent volume)
- Backend API (port 5001)
- Frontend (built for production)

[2:45 - Nginx Proxy Manager]
Install Nginx Proxy Manager for easy HTTPS:

[Shows NPM installation steps]

Access NPM at http://your-ip:81
Default login: admin@example.com / changeme

[Shows NPM interface]

[3:15 - Add Proxy Hosts]
In NPM, add two proxy hosts:

1. Frontend (meteo.yourdomain.com):
   - Forward to: localhost:3000
   - Enable SSL with Let's Encrypt
   - Force SSL

2. API (api.meteo.yourdomain.com):
   - Forward to: localhost:5001
   - Enable SSL
   - Force SSL

[Shows configuring proxy hosts]

[4:15 - SSL Certificates]
NPM automatically provisions SSL certificates:
- Click "Request SSL Certificate"
- Agree to Let's Encrypt TOS
- Wait 30-60 seconds
- SSL is ready!

[Shows SSL setup]

[4:45 - Update CORS]
Update .env.production with your domains:

CORS_ALLOWED_ORIGINS=https://meteo.yourdomain.com

Restart backend:

docker-compose -f docker-compose.prod.yml restart backend

[Shows restart]

[5:10 - Database Backup]
Set up automatic backups:

Create backup script: /home/your-user/backup.sh

[Shows backup script]

Add to cron:

crontab -e

# Daily backup at 2 AM
0 2 * * * /home/your-user/backup.sh

[Shows cron setup]

[5:50 - Testing]
Test your deployment:

1. Visit https://meteo.yourdomain.com
2. Search for a location
3. Create an account
4. Test AI features
5. Check error logs

[Shows testing]

[6:20 - Monitoring]
Monitor your deployment:

# Check container status
docker ps

# View logs
docker-compose -f docker-compose.prod.yml logs -f

# Check disk usage
df -h

[Shows monitoring commands]

[6:50 - Security Checklist]
Ensure security:
- [ ] Strong passwords and JWT secrets
- [ ] HTTPS enabled for all endpoints
- [ ] Firewall configured (ports 80, 443, 22 only)
- [ ] Regular backups enabled
- [ ] Rate limiting active (check logs)
- [ ] Database not publicly accessible

[Shows checklist]

[7:25 - Maintenance]
Regular maintenance tasks:
- Update dependencies monthly: docker-compose pull
- Review logs weekly
- Monitor disk space
- Test backups quarterly

[7:45 - Closing]
Your Meteo Weather App is now deployed!

For detailed deployment docs:
github.com/mbuckingham74/meteo-weather/docs/deployment

For troubleshooting:
github.com/mbuckingham74/meteo-weather/docs/troubleshooting

Thanks for watching!

[8:00 - End]
```

---

## 🎥 Recording Guidelines

### Equipment & Software

**Screen Recording:**
- **Mac:** QuickTime, OBS Studio, or ScreenFlow
- **Windows:** OBS Studio, Camtasia, or ShareX
- **Linux:** OBS Studio or SimpleScreenRecorder

**Microphone:**
- USB microphone (Blue Yeti, Rode NT-USB)
- Or good quality headset mic
- Avoid laptop built-in mics

**Audio Recording:**
- Record in quiet room
- Use pop filter
- Record in Audacity or OBS
- Export as high-quality MP3 or AAC

### Recording Settings

**Video:**
- Resolution: 1920x1080 (1080p) or 1280x720 (720p)
- Frame rate: 30 fps
- Bitrate: 5-8 Mbps for 1080p
- Format: MP4 (H.264 codec)

**Audio:**
- Sample rate: 48 kHz
- Bitrate: 192 kbps or higher
- Format: AAC or MP3

**Screen Recording:**
- Record full screen or specific window
- Hide desktop clutter
- Close unnecessary applications
- Disable notifications
- Increase terminal/editor font size

### Production Tips

**Before Recording:**
1. Write and rehearse script
2. Set up recording environment
3. Test audio levels
4. Close unnecessary apps
5. Clear browser history/cache
6. Prepare example data

**During Recording:**
7. Speak clearly and slowly
8. Pause between sections
9. Move mouse deliberately
10. Wait for animations to complete
11. Record in segments (easier editing)
12. Re-record mistakes

**After Recording:**
13. Edit in video editor (DaVinci Resolve, iMovie, Premiere)
14. Add title cards and end screen
15. Color correct if needed
16. Normalize audio levels
17. Add background music (optional, low volume)
18. Export with recommended settings

### Editing Checklist

- [ ] Trim dead air and long pauses
- [ ] Cut mistakes and restarts
- [ ] Add intro title card (3-5 seconds)
- [ ] Add section titles (optional)
- [ ] Highlight mouse cursor (if needed)
- [ ] Add zoom effects for small text
- [ ] Normalize audio (consistent volume)
- [ ] Remove background noise
- [ ] Add outro with links
- [ ] Export with correct settings

---

## 📤 Publishing Guidelines

### YouTube

**Title Format:**
- "Meteo Weather App - [Feature Name] Tutorial"
- Example: "Meteo Weather App - Quick Start Guide"

**Description Template:**
```
[Brief description of tutorial - 2-3 sentences]

⏱️ Timestamps:
0:00 - Introduction
0:20 - [Section 1]
1:15 - [Section 2]
...

🔗 Links:
- GitHub Repository: https://github.com/mbuckingham74/meteo-weather
- Documentation: https://github.com/mbuckingham74/meteo-weather/tree/main/docs
- Live Demo: https://meteo-beta.tachyonfuture.com
- API Reference: https://github.com/mbuckingham74/meteo-weather/blob/main/docs/api/API_REFERENCE.md

📚 Additional Resources:
- Quick Start Guide: [link]
- Deployment Guide: [link]
- Contributing Guide: [link]

💬 Questions? Ask in the comments or open an issue on GitHub!

#weather #programming #docker #opensource #react #nodejs
```

**Tags:**
weather app, tutorial, open source, self-hosted, docker, react, nodejs, express, mysql, programming, web development, api, weather api

**Thumbnail:**
- 1280x720 pixels
- Clear, readable text
- App screenshot
- High contrast

### README.md Video Section

Add videos to README:

```markdown
## 🎥 Video Tutorials

- **[Quick Start Guide](https://youtube.com/watch?v=...)** (3 minutes) - Get running in 3 minutes
- **[Feature Overview](https://youtube.com/watch?v=...)** (5 minutes) - Complete tour
- **[Deployment Guide](https://youtube.com/watch?v=...)** (8 minutes) - Deploy to production
```

---

## 📋 Quality Checklist

Before publishing, verify:

**Audio:**
- [ ] Clear, audible voice
- [ ] No background noise
- [ ] Consistent volume levels
- [ ] No pops or clicks

**Video:**
- [ ] Clear, readable text (14pt minimum)
- [ ] Smooth screen recording
- [ ] No lag or stuttering
- [ ] Proper resolution (720p or 1080p)

**Content:**
- [ ] Follows script accurately
- [ ] All steps shown clearly
- [ ] No errors or mistakes
- [ ] Links work and are current
- [ ] Information is accurate

**Production:**
- [ ] Intro and outro included
- [ ] Timestamps in description
- [ ] Proper title and tags
- [ ] Thumbnail created
- [ ] Links to resources

---

## 🎬 Future Tutorial Ideas

**Advanced Tutorials:**
- Custom Theme Development
- API Integration with Home Assistant
- Database Optimization
- Custom Deployment (Kubernetes, AWS)
- Contributing Code (Pull Request Walkthrough)
- Testing Guide (Running Tests, Writing Tests)
- Security Best Practices
- Performance Tuning

**Feature Deep Dives:**
- Climate Comparison Analysis
- Historical Weather Trends
- AI Location Finder Advanced Usage
- Creating Custom Visualizations
- Building on the API

---

## 📚 Resources

**Screen Recording:**
- [OBS Studio](https://obsproject.com/) - Free, cross-platform
- [ScreenFlow](https://www.telestream.net/screenflow/) - Mac, paid
- [Camtasia](https://www.techsmith.com/video-editor.html) - Cross-platform, paid

**Video Editing:**
- [DaVinci Resolve](https://www.blackmagicdesign.com/products/davinciresolve) - Free, professional
- [iMovie](https://www.apple.com/imovie/) - Mac, free
- [OpenShot](https://www.openshot.org/) - Free, cross-platform

**Audio Editing:**
- [Audacity](https://www.audacityteam.org/) - Free, cross-platform
- [Adobe Audition](https://www.adobe.com/products/audition.html) - Paid
- [GarageBand](https://www.apple.com/mac/garageband/) - Mac, free

**Stock Music (Royalty-Free):**
- [YouTube Audio Library](https://www.youtube.com/audiolibrary)
- [Free Music Archive](https://freemusicarchive.org/)
- [Incompetech](https://incompetech.com/music/royalty-free/)

---

## 🤝 Contributing Videos

Want to create a tutorial? We'd love your help!

1. Check [existing tutorials](https://github.com/mbuckingham74/meteo-weather#video-tutorials)
2. Choose a topic from "Future Tutorial Ideas"
3. Follow this guide
4. Submit video link in a GitHub issue or PR
5. We'll add it to official documentation

**Benefits:**
- Credit in README
- Link to your channel
- Help the community!

---

**Last Updated:** November 7, 2025
**Maintained by:** Michael Buckingham
