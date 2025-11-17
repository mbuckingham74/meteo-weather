# Email Notifications System - Implementation Plan

**Status:** Ready to Implement (80% infrastructure complete)
**Priority:** Critical - Tier 1 Feature
**Estimated Time:** 8-10 hours
**Target:** Week 1 (Immediate)

---

## 📊 Current Status Assessment

### ✅ Already Complete (80%)
1. **Database Schema** - `user_preferences` table has all required columns:
   - `email_notifications` (BOOLEAN)
   - `daily_weather_report` (BOOLEAN)
   - `weather_alert_notifications` (BOOLEAN)
   - `weekly_summary` (BOOLEAN)
   - `report_time` (TIME)
   - `report_locations` (JSON array)

2. **Frontend UI** - `UserPreferencesPage.jsx` fully implemented:
   - Email notification toggles
   - Report time picker
   - Location search and management
   - Form validation and submission

3. **Backend Routes** - Basic preferences CRUD in place:
   - GET `/user-preferences` (reads preferences)
   - PUT `/user-preferences` (saves preferences)

### ❌ Missing Components (20%)
1. **SMTP Service Integration** - Email sending infrastructure
2. **Email Templates** - HTML templates for weather reports
3. **Cron Jobs** - Scheduled tasks for sending reports
4. **Queue System** - Background job processing
5. **Weather Data Aggregation** - Fetch weather for report locations
6. **Alert Detection** - Monitor for severe weather conditions

---

## 🎯 Implementation Plan

### Phase 1: SMTP Service Setup (2 hours)

#### 1.1 Choose SMTP Provider
**Recommendation:** SendGrid (best for transactional emails)
- **Free Tier:** 100 emails/day (sufficient for beta testing)
- **Pricing:** $19.95/month for 50,000 emails
- **Features:** Templates, analytics, deliverability monitoring
- **Alternative:** AWS SES ($0.10 per 1000 emails, more cost-effective at scale)

#### 1.2 Update Environment Variables
Add to `.env.example` and `.env.production`:

```bash
# Email Service Configuration (SendGrid)
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=SG.your_sendgrid_api_key_here
FROM_EMAIL=noreply@meteo-beta.tachyonfuture.com
FROM_NAME=Meteo Weather

# Email Settings
EMAIL_ENABLED=true
EMAIL_RATE_LIMIT=100  # Max emails per hour
EMAIL_RETRY_ATTEMPTS=3
EMAIL_RETRY_DELAY=300000  # 5 minutes in ms
```

#### 1.3 Install Dependencies
```bash
cd backend
npm install nodemailer nodemailer-sendgrid-transport node-cron bull
```

**Package Justification:**
- `nodemailer` - Email sending library (industry standard)
- `nodemailer-sendgrid-transport` - SendGrid integration
- `node-cron` - Cron job scheduler
- `bull` - Redis-based queue for background jobs (optional, can defer)

---

### Phase 2: Email Service Module (3 hours)

#### 2.1 Create `backend/services/emailService.js`

```javascript
const nodemailer = require('nodemailer');
const { debugLog, LogLevel } = require('../utils/debugLogger');

/**
 * Email Service
 * Handles sending transactional and notification emails
 */

// Configure SMTP transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT),
  secure: false, // Use TLS
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Verify SMTP connection on startup
transporter.verify((error, success) => {
  if (error) {
    console.error('SMTP connection error:', error);
  } else {
    debugLog('EmailService', { status: 'SMTP ready' }, LogLevel.INFO);
  }
});

/**
 * Send email with retry logic
 */
async function sendEmail({ to, subject, html, text, retryCount = 0 }) {
  const maxRetries = parseInt(process.env.EMAIL_RETRY_ATTEMPTS || 3);

  try {
    const mailOptions = {
      from: {
        name: process.env.FROM_NAME || 'Meteo Weather',
        address: process.env.FROM_EMAIL,
      },
      to,
      subject,
      html,
      text: text || stripHtmlTags(html), // Fallback plain text
    };

    const info = await transporter.sendMail(mailOptions);

    debugLog('EmailService', {
      to,
      subject,
      messageId: info.messageId,
      status: 'sent'
    }, LogLevel.INFO);

    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Email send error:', error);

    // Retry logic
    if (retryCount < maxRetries) {
      const delay = parseInt(process.env.EMAIL_RETRY_DELAY || 300000);
      debugLog('EmailService', {
        retry: retryCount + 1,
        maxRetries,
        delayMs: delay
      }, LogLevel.WARN);

      await new Promise(resolve => setTimeout(resolve, delay));
      return sendEmail({ to, subject, html, text, retryCount: retryCount + 1 });
    }

    throw error;
  }
}

/**
 * Strip HTML tags for plain text fallback
 */
function stripHtmlTags(html) {
  return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
}

/**
 * Send daily weather report
 */
async function sendDailyWeatherReport(user, preferences, weatherData) {
  const html = generateDailyReportTemplate(user, weatherData, preferences);

  return sendEmail({
    to: user.email,
    subject: `Daily Weather Report - ${new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric'
    })}`,
    html,
  });
}

/**
 * Send weekly weather summary
 */
async function sendWeeklySummary(user, preferences, weatherData) {
  const html = generateWeeklySummaryTemplate(user, weatherData, preferences);

  return sendEmail({
    to: user.email,
    subject: `Weekly Weather Summary - Week of ${new Date().toLocaleDateString()}`,
    html,
  });
}

/**
 * Send severe weather alert
 */
async function sendWeatherAlert(user, alert) {
  const html = generateAlertTemplate(user, alert);

  return sendEmail({
    to: user.email,
    subject: `⚠️ Weather Alert: ${alert.event} - ${alert.location}`,
    html,
  });
}

module.exports = {
  sendEmail,
  sendDailyWeatherReport,
  sendWeeklySummary,
  sendWeatherAlert,
};
```

#### 2.2 Create Email Templates

**File:** `backend/templates/dailyWeatherReport.html`

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Daily Weather Report</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f5f5f5;
    }
    .container {
      background: white;
      border-radius: 12px;
      padding: 30px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    .header {
      text-align: center;
      border-bottom: 3px solid #667eea;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    .header h1 {
      margin: 0;
      color: #667eea;
      font-size: 28px;
    }
    .date {
      color: #666;
      font-size: 16px;
      margin-top: 8px;
    }
    .location {
      background: #f8f9fa;
      border-left: 4px solid #667eea;
      padding: 20px;
      margin: 20px 0;
      border-radius: 8px;
    }
    .location h2 {
      margin: 0 0 15px 0;
      color: #333;
      font-size: 22px;
    }
    .weather-summary {
      display: flex;
      align-items: center;
      margin: 15px 0;
    }
    .temp {
      font-size: 48px;
      font-weight: bold;
      color: #667eea;
      margin-right: 20px;
    }
    .conditions {
      flex: 1;
    }
    .stats {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 15px;
      margin-top: 20px;
    }
    .stat {
      background: white;
      padding: 12px;
      border-radius: 6px;
      border: 1px solid #e0e0e0;
    }
    .stat-label {
      color: #666;
      font-size: 13px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .stat-value {
      font-size: 20px;
      font-weight: 600;
      color: #333;
      margin-top: 4px;
    }
    .forecast {
      margin-top: 30px;
    }
    .forecast h3 {
      color: #333;
      border-bottom: 2px solid #e0e0e0;
      padding-bottom: 10px;
    }
    .forecast-days {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      gap: 8px;
      margin-top: 15px;
    }
    .forecast-day {
      text-align: center;
      padding: 12px 8px;
      background: #f8f9fa;
      border-radius: 6px;
      font-size: 13px;
    }
    .forecast-day-name {
      font-weight: 600;
      color: #667eea;
      margin-bottom: 6px;
    }
    .forecast-temp {
      font-size: 16px;
      font-weight: bold;
      color: #333;
    }
    .footer {
      text-align: center;
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #e0e0e0;
      color: #666;
      font-size: 13px;
    }
    .footer a {
      color: #667eea;
      text-decoration: none;
    }
    .unsubscribe {
      margin-top: 15px;
      font-size: 12px;
      color: #999;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🌤️ Daily Weather Report</h1>
      <div class="date">{{DATE}}</div>
    </div>

    {{#each LOCATIONS}}
    <div class="location">
      <h2>📍 {{location_name}}</h2>

      <div class="weather-summary">
        <div class="temp">{{temperature}}°{{unit}}</div>
        <div class="conditions">
          <div style="font-size: 24px; margin-bottom: 5px;">{{icon}}</div>
          <div style="font-size: 18px; font-weight: 600;">{{conditions}}</div>
          <div style="color: #666;">Feels like {{feels_like}}°{{unit}}</div>
        </div>
      </div>

      <div class="stats">
        <div class="stat">
          <div class="stat-label">☔ Precipitation</div>
          <div class="stat-value">{{precip_chance}}%</div>
        </div>
        <div class="stat">
          <div class="stat-label">💨 Wind</div>
          <div class="stat-value">{{wind_speed}} mph</div>
        </div>
        <div class="stat">
          <div class="stat-label">💧 Humidity</div>
          <div class="stat-value">{{humidity}}%</div>
        </div>
        <div class="stat">
          <div class="stat-label">☀️ UV Index</div>
          <div class="stat-value">{{uv_index}}</div>
        </div>
      </div>

      <div class="forecast">
        <h3>7-Day Forecast</h3>
        <div class="forecast-days">
          {{#each forecast}}
          <div class="forecast-day">
            <div class="forecast-day-name">{{day}}</div>
            <div style="font-size: 20px; margin: 8px 0;">{{icon}}</div>
            <div class="forecast-temp">{{high}}°</div>
            <div style="color: #666; font-size: 12px; margin-top: 4px;">{{low}}°</div>
          </div>
          {{/each}}
        </div>
      </div>
    </div>
    {{/each}}

    <div class="footer">
      <p>View detailed forecast at <a href="https://meteo-beta.tachyonfuture.com">meteo-beta.tachyonfuture.com</a></p>
      <p class="unsubscribe">
        <a href="{{UNSUBSCRIBE_URL}}">Unsubscribe</a> |
        <a href="{{PREFERENCES_URL}}">Manage preferences</a>
      </p>
    </div>
  </div>
</body>
</html>
```

**File:** `backend/templates/weatherAlert.html`

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Weather Alert</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f5f5f5;
    }
    .container {
      background: white;
      border-radius: 12px;
      padding: 30px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    .alert-header {
      background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
      color: white;
      padding: 25px;
      border-radius: 8px;
      margin-bottom: 25px;
      text-align: center;
    }
    .alert-header h1 {
      margin: 0;
      font-size: 28px;
    }
    .alert-severity {
      display: inline-block;
      padding: 8px 16px;
      border-radius: 20px;
      font-weight: 600;
      margin-top: 10px;
      text-transform: uppercase;
      font-size: 14px;
    }
    .severity-severe {
      background: #ff4757;
    }
    .severity-moderate {
      background: #ffa502;
    }
    .severity-minor {
      background: #ffd32a;
      color: #333;
    }
    .alert-body {
      padding: 20px 0;
    }
    .alert-info {
      display: grid;
      gap: 15px;
      margin: 20px 0;
    }
    .info-row {
      display: flex;
      padding: 12px;
      background: #f8f9fa;
      border-radius: 6px;
    }
    .info-label {
      font-weight: 600;
      color: #666;
      min-width: 120px;
    }
    .info-value {
      color: #333;
    }
    .alert-description {
      background: #fff3cd;
      border-left: 4px solid #ffc107;
      padding: 20px;
      border-radius: 6px;
      margin: 20px 0;
    }
    .cta-button {
      display: inline-block;
      background: #667eea;
      color: white;
      padding: 14px 28px;
      border-radius: 6px;
      text-decoration: none;
      font-weight: 600;
      margin-top: 20px;
    }
    .footer {
      text-align: center;
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #e0e0e0;
      color: #666;
      font-size: 13px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="alert-header">
      <h1>⚠️ Weather Alert</h1>
      <span class="alert-severity severity-{{SEVERITY}}">{{SEVERITY}} Alert</span>
    </div>

    <div class="alert-body">
      <h2>{{EVENT}}</h2>

      <div class="alert-info">
        <div class="info-row">
          <div class="info-label">📍 Location:</div>
          <div class="info-value">{{LOCATION}}</div>
        </div>
        <div class="info-row">
          <div class="info-label">⏰ Effective:</div>
          <div class="info-value">{{EFFECTIVE_TIME}}</div>
        </div>
        <div class="info-row">
          <div class="info-label">⏱️ Expires:</div>
          <div class="info-value">{{EXPIRATION_TIME}}</div>
        </div>
      </div>

      <div class="alert-description">
        <strong>Description:</strong>
        <p>{{DESCRIPTION}}</p>
      </div>

      {{#if INSTRUCTIONS}}
      <div style="background: #e3f2fd; border-left: 4px solid #2196f3; padding: 20px; border-radius: 6px;">
        <strong>⚡ Recommended Actions:</strong>
        <p>{{INSTRUCTIONS}}</p>
      </div>
      {{/if}}

      <div style="text-align: center;">
        <a href="{{VIEW_URL}}" class="cta-button">View Full Details</a>
      </div>
    </div>

    <div class="footer">
      <p>Stay safe and monitor weather conditions at
        <a href="https://meteo-beta.tachyonfuture.com" style="color: #667eea; text-decoration: none;">
          meteo-beta.tachyonfuture.com
        </a>
      </p>
    </div>
  </div>
</body>
</html>
```

---

### Phase 3: Cron Job Scheduler (2 hours)

#### 3.1 Create `backend/jobs/emailScheduler.js`

```javascript
const cron = require('node-cron');
const { pool } = require('../config/database');
const emailService = require('../services/emailService');
const weatherService = require('../services/weatherService');
const { debugLog, LogLevel } = require('../utils/debugLogger');

/**
 * Email Scheduler
 * Manages cron jobs for sending scheduled weather reports
 */

/**
 * Send daily reports to all subscribed users
 * Runs every hour and checks if users need reports at this time
 */
async function sendScheduledDailyReports() {
  try {
    const currentHour = new Date().getHours();
    const currentMinute = new Date().getMinutes();
    const currentTime = `${String(currentHour).padStart(2, '0')}:${String(currentMinute).padStart(2, '0')}`;

    debugLog('EmailScheduler', {
      task: 'daily_reports',
      currentTime,
      status: 'running'
    }, LogLevel.INFO);

    // Find users who want daily reports at this time (±15 minutes)
    const [users] = await pool.query(`
      SELECT u.id, u.email, u.name, up.*
      FROM users u
      JOIN user_preferences up ON u.id = up.user_id
      WHERE up.email_notifications = TRUE
        AND up.daily_weather_report = TRUE
        AND TIME(up.report_time) BETWEEN
          TIME_SUB('${currentTime}:00', INTERVAL 15 MINUTE) AND
          TIME_ADD('${currentTime}:00', INTERVAL 15 MINUTE)
    `);

    debugLog('EmailScheduler', {
      usersFound: users.length
    }, LogLevel.INFO);

    for (const user of users) {
      try {
        // Fetch weather data for user's report locations
        const reportLocations = JSON.parse(user.report_locations || '[]');

        if (reportLocations.length === 0) {
          debugLog('EmailScheduler', {
            userId: user.id,
            skip: 'no locations'
          }, LogLevel.WARN);
          continue;
        }

        const weatherData = await Promise.all(
          reportLocations.map(async (location) => {
            const weather = await weatherService.getCurrentWeather(
              location.latitude,
              location.longitude
            );
            return {
              location_name: location.name,
              ...weather,
            };
          })
        );

        // Send email
        await emailService.sendDailyWeatherReport(user, user, weatherData);

        debugLog('EmailScheduler', {
          userId: user.id,
          email: user.email,
          locations: reportLocations.length,
          status: 'sent'
        }, LogLevel.INFO);

      } catch (error) {
        console.error(`Error sending daily report to user ${user.id}:`, error);
      }
    }

  } catch (error) {
    console.error('Daily reports job error:', error);
  }
}

/**
 * Send weekly summaries
 * Runs every Monday morning
 */
async function sendScheduledWeeklySummaries() {
  try {
    const today = new Date().getDay(); // 0 = Sunday, 1 = Monday

    if (today !== 1) {
      return; // Only run on Mondays
    }

    debugLog('EmailScheduler', {
      task: 'weekly_summaries',
      status: 'running'
    }, LogLevel.INFO);

    const [users] = await pool.query(`
      SELECT u.id, u.email, u.name, up.*
      FROM users u
      JOIN user_preferences up ON u.id = up.user_id
      WHERE up.email_notifications = TRUE
        AND up.weekly_summary = TRUE
    `);

    for (const user of users) {
      try {
        const reportLocations = JSON.parse(user.report_locations || '[]');

        if (reportLocations.length === 0) continue;

        // Fetch 7-day forecast for each location
        const weatherData = await Promise.all(
          reportLocations.map(async (location) => {
            const forecast = await weatherService.getWeatherForecast(
              location.latitude,
              location.longitude,
              7
            );
            return {
              location_name: location.name,
              forecast,
            };
          })
        );

        await emailService.sendWeeklySummary(user, user, weatherData);

        debugLog('EmailScheduler', {
          userId: user.id,
          status: 'sent weekly summary'
        }, LogLevel.INFO);

      } catch (error) {
        console.error(`Error sending weekly summary to user ${user.id}:`, error);
      }
    }

  } catch (error) {
    console.error('Weekly summaries job error:', error);
  }
}

/**
 * Check for severe weather alerts
 * Runs every 15 minutes
 */
async function checkWeatherAlerts() {
  try {
    debugLog('EmailScheduler', {
      task: 'weather_alerts',
      status: 'checking'
    }, LogLevel.INFO);

    // Get users with alert notifications enabled
    const [users] = await pool.query(`
      SELECT u.id, u.email, u.name, up.report_locations
      FROM users u
      JOIN user_preferences up ON u.id = up.user_id
      WHERE up.email_notifications = TRUE
        AND up.weather_alert_notifications = TRUE
    `);

    for (const user of users) {
      try {
        const locations = JSON.parse(user.report_locations || '[]');

        for (const location of locations) {
          // Check for active alerts at this location
          const alerts = await weatherService.getWeatherAlerts(
            location.latitude,
            location.longitude
          );

          for (const alert of alerts) {
            // Check if we've already sent this alert to this user
            const [existing] = await pool.query(`
              SELECT id FROM sent_alerts
              WHERE user_id = ? AND alert_id = ?
            `, [user.id, alert.id]);

            if (existing.length === 0) {
              // Send alert email
              await emailService.sendWeatherAlert(user, {
                ...alert,
                location: location.name,
              });

              // Record that we sent this alert
              await pool.query(`
                INSERT INTO sent_alerts (user_id, alert_id, sent_at)
                VALUES (?, ?, NOW())
              `, [user.id, alert.id]);

              debugLog('EmailScheduler', {
                userId: user.id,
                alertType: alert.event,
                location: location.name,
                status: 'alert sent'
              }, LogLevel.INFO);
            }
          }
        }
      } catch (error) {
        console.error(`Error checking alerts for user ${user.id}:`, error);
      }
    }

  } catch (error) {
    console.error('Weather alerts job error:', error);
  }
}

/**
 * Initialize cron jobs
 */
function initializeScheduler() {
  if (!process.env.EMAIL_ENABLED || process.env.EMAIL_ENABLED === 'false') {
    debugLog('EmailScheduler', {
      status: 'disabled (EMAIL_ENABLED=false)'
    }, LogLevel.WARN);
    return;
  }

  debugLog('EmailScheduler', {
    status: 'initializing cron jobs'
  }, LogLevel.INFO);

  // Daily reports - check every hour
  cron.schedule('0 * * * *', async () => {
    await sendScheduledDailyReports();
  });

  // Weekly summaries - check every Monday at 8 AM
  cron.schedule('0 8 * * 1', async () => {
    await sendScheduledWeeklySummaries();
  });

  // Weather alerts - check every 15 minutes
  cron.schedule('*/15 * * * *', async () => {
    await checkWeatherAlerts();
  });

  debugLog('EmailScheduler', {
    status: 'cron jobs initialized',
    jobs: ['daily_reports', 'weekly_summaries', 'weather_alerts']
  }, LogLevel.INFO);
}

module.exports = {
  initializeScheduler,
  sendScheduledDailyReports,
  sendScheduledWeeklySummaries,
  checkWeatherAlerts,
};
```

---

### Phase 4: Database Migration (30 minutes)

#### 4.1 Create Migration for Alert Tracking

**File:** `database/migrations/009_add_sent_alerts_table.sql`

```sql
-- Migration 009: Add sent_alerts table for tracking sent weather alerts
-- Prevents duplicate alert emails to users

CREATE TABLE IF NOT EXISTS sent_alerts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    alert_id VARCHAR(255) NOT NULL COMMENT 'Unique alert identifier from weather API',
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_alert (user_id, alert_id),
    INDEX idx_sent_at (sent_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add index to user_preferences for efficient scheduling queries
ALTER TABLE user_preferences
ADD INDEX idx_report_time (report_time, email_notifications, daily_weather_report);

-- Migration complete
```

---

### Phase 5: Backend API Updates (1 hour)

#### 5.1 Update `userPreferencesService.js`

Add email notification fields to allowed updates:

```javascript
const allowedFields = [
  'temperature_unit',
  'default_forecast_days',
  'default_location',
  'theme',
  'language',
  'email_notifications',        // ADD
  'daily_weather_report',        // ADD
  'weather_alert_notifications', // ADD
  'weekly_summary',              // ADD
  'report_time',                 // ADD
  'report_locations',            // ADD (must be JSON)
];

// Add JSON parsing for report_locations
if (updates.report_locations && typeof updates.report_locations === 'object') {
  updates.report_locations = JSON.stringify(updates.report_locations);
}
```

#### 5.2 Update `server.js`

Add scheduler initialization:

```javascript
const emailScheduler = require('./jobs/emailScheduler');

// After all routes are defined
if (process.env.NODE_ENV === 'production') {
  emailScheduler.initializeScheduler();
}
```

---

### Phase 6: Template Rendering (1.5 hours)

#### 6.1 Install Handlebars

```bash
npm install handlebars
```

#### 6.2 Update `emailService.js` with Template Functions

```javascript
const Handlebars = require('handlebars');
const fs = require('fs').promises;
const path = require('path');

// Cache compiled templates
const templateCache = {};

/**
 * Load and compile email template
 */
async function loadTemplate(templateName) {
  if (templateCache[templateName]) {
    return templateCache[templateName];
  }

  const templatePath = path.join(__dirname, '../templates', `${templateName}.html`);
  const templateSource = await fs.readFile(templatePath, 'utf-8');
  const template = Handlebars.compile(templateSource);

  templateCache[templateName] = template;
  return template;
}

/**
 * Generate daily report HTML
 */
async function generateDailyReportTemplate(user, weatherData, preferences) {
  const template = await loadTemplate('dailyWeatherReport');

  const data = {
    DATE: new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    }),
    LOCATIONS: weatherData.map(location => ({
      location_name: location.location_name,
      temperature: Math.round(location.temperature),
      unit: preferences.temperature_unit,
      feels_like: Math.round(location.feels_like),
      conditions: location.conditions,
      icon: getWeatherIcon(location.conditions),
      precip_chance: location.precipitation_probability || 0,
      wind_speed: Math.round(location.wind_speed),
      humidity: location.humidity,
      uv_index: location.uv_index || 0,
      forecast: location.forecast?.slice(0, 7).map((day, index) => ({
        day: getDayName(index),
        icon: getWeatherIcon(day.conditions),
        high: Math.round(day.temperature_high),
        low: Math.round(day.temperature_low),
      })) || [],
    })),
    UNSUBSCRIBE_URL: `https://meteo-beta.tachyonfuture.com/preferences?unsubscribe=true`,
    PREFERENCES_URL: `https://meteo-beta.tachyonfuture.com/preferences`,
  };

  return template(data);
}

/**
 * Get weather emoji icon
 */
function getWeatherIcon(conditions) {
  const conditionsLower = (conditions || '').toLowerCase();

  if (conditionsLower.includes('clear') || conditionsLower.includes('sunny')) {
    return '☀️';
  } else if (conditionsLower.includes('cloud')) {
    return '☁️';
  } else if (conditionsLower.includes('rain') || conditionsLower.includes('shower')) {
    return '🌧️';
  } else if (conditionsLower.includes('storm') || conditionsLower.includes('thunder')) {
    return '⛈️';
  } else if (conditionsLower.includes('snow')) {
    return '❄️';
  } else if (conditionsLower.includes('fog') || conditionsLower.includes('mist')) {
    return '🌫️';
  } else if (conditionsLower.includes('partly')) {
    return '⛅';
  }

  return '🌤️';
}

/**
 * Get day name
 */
function getDayName(offset) {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const today = new Date();
  const targetDate = new Date(today);
  targetDate.setDate(today.getDate() + offset);

  if (offset === 0) return 'Today';
  if (offset === 1) return 'Tomorrow';

  return days[targetDate.getDay()];
}
```

---

## 🧪 Testing Plan

### Unit Tests
```bash
# Test email service
npm test -- emailService.test.js

# Test scheduler logic
npm test -- emailScheduler.test.js
```

### Integration Tests
1. **Manual Test - Daily Report:**
   ```bash
   # Update your user preferences via UI
   # Set report time to current time + 5 minutes
   # Wait for cron job to trigger
   # Check email inbox
   ```

2. **Manual Test - Weather Alert:**
   ```bash
   # Trigger alert check manually
   node -e "require('./backend/jobs/emailScheduler').checkWeatherAlerts()"
   ```

3. **Email Template Preview:**
   ```bash
   # Create test endpoint to preview templates
   GET /api/test/email-preview?type=daily
   ```

---

## 📊 Success Metrics

### Week 1 (Implementation)
- [ ] SMTP configuration complete
- [ ] Email service module functional
- [ ] Templates designed and tested
- [ ] Cron jobs running in production
- [ ] Database migration applied

### Week 2 (Beta Testing)
- [ ] 10+ users opt-in to daily reports
- [ ] Email deliverability > 95%
- [ ] Zero SMTP errors in logs
- [ ] Average open rate > 30%

### Month 1 (Optimization)
- [ ] 50+ active email subscribers
- [ ] Weekly summary feature tested
- [ ] Alert system validated with real weather events
- [ ] User feedback collected and documented

---

## 🚨 Potential Issues & Solutions

### Issue 1: SMTP Rate Limits
**Problem:** SendGrid free tier = 100 emails/day
**Solution:**
- Monitor daily send count
- Upgrade to paid tier before hitting 50+ users
- Implement graceful queue degradation

### Issue 2: Timezone Handling
**Problem:** Users in different timezones
**Solution:**
- Store user timezone in preferences
- Convert report_time to UTC for scheduling
- Use moment-timezone for accurate conversions

### Issue 3: Email Deliverability
**Problem:** Emails going to spam
**Solution:**
- Set up SPF, DKIM, DMARC records for meteo-beta.tachyonfuture.com
- Use SendGrid's domain authentication
- Include unsubscribe link (required by law)
- Monitor bounce rates

### Issue 4: Weather API Costs
**Problem:** Fetching weather for all users daily = high API usage
**Solution:**
- Batch requests for nearby locations
- Cache weather data for 1 hour
- Use existing api_cache table

---

## 💰 Cost Estimation

### Month 1 (Beta - 10 users)
- SendGrid: $0 (free tier)
- Weather API calls: ~300/day (within free tier)
- **Total: $0**

### Month 3 (100 users)
- SendGrid: $19.95/month (50K emails)
- Weather API: Still within free tier with caching
- **Total: ~$20/month**

### Month 6 (500 users)
- SendGrid: $19.95/month
- Weather API: $50/month (Visual Crossing paid tier)
- **Total: ~$70/month**

---

## 🎯 Next Steps

### Immediate (This Week)
1. Sign up for SendGrid account
2. Add SMTP credentials to `.env.production`
3. Create email service module
4. Test single email send

### Week 1 Implementation Order
**Day 1-2:** Email service + SMTP setup
**Day 3:** Email templates (daily, weekly, alerts)
**Day 4:** Cron scheduler + database migration
**Day 5:** Testing + bug fixes

### Post-Launch Enhancements
- [ ] Email analytics dashboard in Admin Panel
- [ ] A/B test email templates
- [ ] Add "What to Wear" section to daily reports
- [ ] Include AQI alerts
- [ ] Personalized weather tips based on user history

---

## 📚 Resources

- [SendGrid Docs](https://docs.sendgrid.com/)
- [Nodemailer Guide](https://nodemailer.com/about/)
- [node-cron Syntax](https://www.npmjs.com/package/node-cron)
- [Email HTML Best Practices](https://www.campaignmonitor.com/css/)

---

**Ready to implement?** Let me know and I can start building the email service module! 🚀
