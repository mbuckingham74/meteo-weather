const cron = require('node-cron');
const { pool } = require('../config/database');
const emailService = require('./emailService');
const weatherService = require('./weatherService');

/**
 * Email Scheduler Service
 * Manages automated email delivery via cron jobs
 * Checks user preferences and sends scheduled weather reports and alerts
 */

let dailyReportJob = null;
let weeklyReportJob = null;
let weatherAlertJob = null;

/**
 * Initialize all email schedulers
 */
function initializeSchedulers() {
  if (!process.env.EMAIL_ENABLED || process.env.EMAIL_ENABLED === 'false') {
    console.log('[EmailScheduler] Email notifications disabled - schedulers not started');
    return;
  }

  console.log('[EmailScheduler] Initializing email schedulers...');

  // Start daily weather report checker
  startDailyReportScheduler();

  // Start weekly summary scheduler
  startWeeklySummaryScheduler();

  // Start weather alert checker
  startWeatherAlertScheduler();

  console.log('[EmailScheduler] All schedulers initialized successfully');
}

/**
 * Daily Weather Report Scheduler
 * Checks every 15 minutes for users who need daily reports
 */
function startDailyReportScheduler() {
  const interval = process.env.DAILY_REPORT_CHECK_INTERVAL || '*/15 * * * *';

  dailyReportJob = cron.schedule(interval, async () => {
    try {
      console.log('[EmailScheduler] Running daily report check...');

      // Get users with daily reports enabled
      const [users] = await pool.query(
        `SELECT u.id, u.email, u.name, up.report_time, up.report_locations, up.temperature_unit
         FROM users u
         JOIN user_preferences up ON u.id = up.user_id
         WHERE up.email_notifications = TRUE
           AND up.daily_weather_report = TRUE
           AND up.report_locations IS NOT NULL
           AND JSON_LENGTH(up.report_locations) > 0`
      );

      const now = new Date();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();

      for (const user of users) {
        // Parse user's preferred report time
        const [reportHour, reportMinute] = user.report_time.split(':').map(Number);

        // Check if it's time to send (within 15-minute window)
        const timeDiff = Math.abs((currentHour * 60 + currentMinute) - (reportHour * 60 + reportMinute));

        if (timeDiff < 15) {
          // Check if already sent today
          const [sent] = await pool.query(
            `SELECT id FROM sent_emails
             WHERE user_id = ?
               AND email_type = 'daily_report'
               AND DATE(sent_at) = CURDATE()`,
            [user.id]
          );

          if (sent.length === 0) {
            await sendDailyReport(user);
          } else {
            console.log(`[EmailScheduler] Daily report already sent to ${user.email} today`);
          }
        }
      }

      console.log(`[EmailScheduler] Daily report check complete - processed ${users.length} users`);
    } catch (error) {
      console.error('[EmailScheduler] Daily report scheduler error:', error);
    }
  });

  console.log(`[EmailScheduler] Daily report scheduler started (interval: ${interval})`);
}

/**
 * Weekly Summary Scheduler
 * Runs every 15 minutes but only sends on configured day/time
 */
function startWeeklySummaryScheduler() {
  const interval = process.env.DAILY_REPORT_CHECK_INTERVAL || '*/15 * * * *';
  const weeklyDay = parseInt(process.env.WEEKLY_SUMMARY_DAY || 1); // Default: Monday
  const weeklyHour = parseInt(process.env.WEEKLY_SUMMARY_HOUR || 8); // Default: 8am

  weeklyReportJob = cron.schedule(interval, async () => {
    try {
      const now = new Date();
      const currentDay = now.getDay();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();

      // Only run on the configured day and hour (±15 min window)
      if (currentDay !== weeklyDay) {
        return;
      }

      const timeDiff = Math.abs((currentHour * 60 + currentMinute) - (weeklyHour * 60));
      if (timeDiff >= 15) {
        return;
      }

      console.log('[EmailScheduler] Running weekly summary check...');

      // Get users with weekly summaries enabled
      const [users] = await pool.query(
        `SELECT u.id, u.email, u.name, up.report_locations, up.temperature_unit
         FROM users u
         JOIN user_preferences up ON u.id = up.user_id
         WHERE up.email_notifications = TRUE
           AND up.weekly_summary = TRUE
           AND up.report_locations IS NOT NULL
           AND JSON_LENGTH(up.report_locations) > 0`
      );

      for (const user of users) {
        // Check if already sent this week
        const [sent] = await pool.query(
          `SELECT id FROM sent_emails
           WHERE user_id = ?
             AND email_type = 'weekly_summary'
             AND YEARWEEK(sent_at) = YEARWEEK(CURDATE())`,
          [user.id]
        );

        if (sent.length === 0) {
          await sendWeeklySummary(user);
        } else {
          console.log(`[EmailScheduler] Weekly summary already sent to ${user.email} this week`);
        }
      }

      console.log(`[EmailScheduler] Weekly summary check complete - processed ${users.length} users`);
    } catch (error) {
      console.error('[EmailScheduler] Weekly summary scheduler error:', error);
    }
  });

  console.log(`[EmailScheduler] Weekly summary scheduler started (Day: ${weeklyDay}, Hour: ${weeklyHour})`);
}

/**
 * Weather Alert Scheduler
 * Checks for severe weather alerts every 15 minutes
 */
function startWeatherAlertScheduler() {
  const interval = process.env.ALERT_CHECK_INTERVAL || '*/15 * * * *';

  weatherAlertJob = cron.schedule(interval, async () => {
    try {
      console.log('[EmailScheduler] Running weather alert check...');

      // Get users with alert notifications enabled
      const [users] = await pool.query(
        `SELECT u.id, u.email, u.name, up.report_locations
         FROM users u
         JOIN user_preferences up ON u.id = up.user_id
         WHERE up.email_notifications = TRUE
           AND up.weather_alert_notifications = TRUE
           AND up.report_locations IS NOT NULL
           AND JSON_LENGTH(up.report_locations) > 0`
      );

      for (const user of users) {
        const locations = JSON.parse(user.report_locations || '[]');

        for (const location of locations) {
          await checkAndSendAlerts(user, location);
        }
      }

      console.log(`[EmailScheduler] Weather alert check complete - processed ${users.length} users`);
    } catch (error) {
      console.error('[EmailScheduler] Weather alert scheduler error:', error);
    }
  });

  console.log(`[EmailScheduler] Weather alert scheduler started (interval: ${interval})`);
}

/**
 * Send daily weather report to a user
 */
async function sendDailyReport(user) {
  try {
    console.log(`[EmailScheduler] Sending daily report to ${user.email}...`);

    const locations = JSON.parse(user.report_locations || '[]');
    const weatherData = [];

    // Fetch weather for each location
    for (const location of locations) {
      try {
        const weather = await weatherService.getWeatherByCoordinates(
          location.latitude,
          location.longitude,
          { days: 7 }
        );

        weatherData.push({
          location_name: location.name,
          ...weather.current,
          forecast: weather.forecast || [],
        });
      } catch (error) {
        console.error(`[EmailScheduler] Error fetching weather for ${location.name}:`, error.message);
      }
    }

    if (weatherData.length === 0) {
      console.log(`[EmailScheduler] No weather data available for ${user.email}, skipping`);
      return;
    }

    // Send email
    const result = await emailService.sendDailyWeatherReport(
      user,
      { temperature_unit: user.temperature_unit },
      weatherData
    );

    if (result.success) {
      // Record sent email
      await pool.query(
        `INSERT INTO sent_emails (user_id, email_type, sent_at)
         VALUES (?, 'daily_report', NOW())`,
        [user.id]
      );

      console.log(`[EmailScheduler] Daily report sent successfully to ${user.email}`);
    } else {
      console.error(`[EmailScheduler] Failed to send daily report to ${user.email}:`, result.error);
    }
  } catch (error) {
    console.error(`[EmailScheduler] Error sending daily report to ${user.email}:`, error);
  }
}

/**
 * Send weekly summary to a user
 */
async function sendWeeklySummary(user) {
  try {
    console.log(`[EmailScheduler] Sending weekly summary to ${user.email}...`);

    const locations = JSON.parse(user.report_locations || '[]');
    const weatherData = [];

    // Fetch 7-day forecast for each location
    for (const location of locations) {
      try {
        const weather = await weatherService.getWeatherByCoordinates(
          location.latitude,
          location.longitude,
          { days: 7 }
        );

        weatherData.push({
          location_name: location.name,
          forecast: weather.forecast || [],
        });
      } catch (error) {
        console.error(`[EmailScheduler] Error fetching weather for ${location.name}:`, error.message);
      }
    }

    if (weatherData.length === 0) {
      console.log(`[EmailScheduler] No weather data available for ${user.email}, skipping`);
      return;
    }

    // Send email
    const result = await emailService.sendWeeklySummary(
      user,
      { temperature_unit: user.temperature_unit },
      weatherData
    );

    if (result.success) {
      // Record sent email
      await pool.query(
        `INSERT INTO sent_emails (user_id, email_type, sent_at)
         VALUES (?, 'weekly_summary', NOW())`,
        [user.id]
      );

      console.log(`[EmailScheduler] Weekly summary sent successfully to ${user.email}`);
    } else {
      console.error(`[EmailScheduler] Failed to send weekly summary to ${user.email}:`, result.error);
    }
  } catch (error) {
    console.error(`[EmailScheduler] Error sending weekly summary to ${user.email}:`, error);
  }
}

/**
 * Check for weather alerts and send if needed
 */
async function checkAndSendAlerts(user, location) {
  try {
    // Fetch weather data with alerts
    const weather = await weatherService.getWeatherByCoordinates(
      location.latitude,
      location.longitude,
      { includeAlerts: true }
    );

    const alerts = weather.alerts || [];

    for (const alert of alerts) {
      // Check if we've already sent this alert
      const alertHash = `${alert.event}_${alert.onset}_${location.latitude}_${location.longitude}`;

      const [sent] = await pool.query(
        `SELECT id FROM sent_alerts
         WHERE user_id = ?
           AND alert_hash = ?
           AND sent_at > DATE_SUB(NOW(), INTERVAL 24 HOUR)`,
        [user.id, alertHash]
      );

      if (sent.length === 0) {
        // Send alert email
        const alertData = {
          ...alert,
          location: location.name,
        };

        const result = await emailService.sendWeatherAlert(user, alertData);

        if (result.success) {
          // Record sent alert
          await pool.query(
            `INSERT INTO sent_alerts (user_id, alert_hash, sent_at)
             VALUES (?, ?, NOW())`,
            [user.id, alertHash]
          );

          // Record in sent_emails for analytics
          await pool.query(
            `INSERT INTO sent_emails (user_id, email_type, sent_at)
             VALUES (?, 'weather_alert', NOW())`,
            [user.id]
          );

          console.log(`[EmailScheduler] Weather alert sent to ${user.email}: ${alert.event}`);
        } else {
          console.error(`[EmailScheduler] Failed to send alert to ${user.email}:`, result.error);
        }
      }
    }
  } catch (error) {
    console.error(`[EmailScheduler] Error checking alerts for ${location.name}:`, error);
  }
}

/**
 * Stop all schedulers (for graceful shutdown)
 */
function stopAllSchedulers() {
  console.log('[EmailScheduler] Stopping all schedulers...');

  if (dailyReportJob) {
    dailyReportJob.stop();
    console.log('[EmailScheduler] Daily report scheduler stopped');
  }

  if (weeklyReportJob) {
    weeklyReportJob.stop();
    console.log('[EmailScheduler] Weekly summary scheduler stopped');
  }

  if (weatherAlertJob) {
    weatherAlertJob.stop();
    console.log('[EmailScheduler] Weather alert scheduler stopped');
  }
}

module.exports = {
  initializeSchedulers,
  stopAllSchedulers,
};
