const nodemailer = require('nodemailer');
const Handlebars = require('handlebars');
const fs = require('fs').promises;
const path = require('path');

/**
 * Email Service
 * Handles sending transactional and notification emails
 * Uses SendGrid SMTP for reliable delivery
 */

// Configure SMTP transporter
let transporter = null;

function initializeTransporter() {
  if (!process.env.EMAIL_ENABLED || process.env.EMAIL_ENABLED === 'false') {
    console.log('[EmailService] Email notifications disabled (EMAIL_ENABLED=false)');
    return null;
  }

  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || 587),
    secure: false, // Use TLS
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  // Verify SMTP connection on startup
  transporter.verify((error, success) => {
    if (error) {
      console.error('[EmailService] SMTP connection error:', error);
    } else {
      console.log('[EmailService] SMTP ready - email notifications enabled');
    }
  });

  return transporter;
}

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

  try {
    const templateSource = await fs.readFile(templatePath, 'utf-8');
    const template = Handlebars.compile(templateSource);
    templateCache[templateName] = template;
    return template;
  } catch (error) {
    console.error(`[EmailService] Error loading template ${templateName}:`, error);
    throw new Error(`Email template not found: ${templateName}`);
  }
}

/**
 * Strip HTML tags for plain text fallback
 */
function stripHtmlTags(html) {
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Send email with retry logic
 */
async function sendEmail({ to, subject, html, text, retryCount = 0 }) {
  if (!transporter) {
    transporter = initializeTransporter();
    if (!transporter) {
      console.log('[EmailService] Skipping email send - service disabled');
      return { success: false, error: 'Email service disabled' };
    }
  }

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

    console.log('[EmailService] Email sent successfully:', {
      to,
      subject,
      messageId: info.messageId,
    });

    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('[EmailService] Email send error:', error.message);

    // Retry logic
    if (retryCount < maxRetries) {
      const delay = parseInt(process.env.EMAIL_RETRY_DELAY || 300000);
      console.log(`[EmailService] Retrying email send (${retryCount + 1}/${maxRetries}) after ${delay}ms`);

      await new Promise(resolve => setTimeout(resolve, delay));
      return sendEmail({ to, subject, html, text, retryCount: retryCount + 1 });
    }

    return { success: false, error: error.message };
  }
}

/**
 * Get weather emoji icon
 */
function getWeatherIcon(conditions) {
  if (!conditions) return '🌤️';

  const conditionsLower = conditions.toLowerCase();

  if (conditionsLower.includes('clear') || conditionsLower.includes('sunny')) {
    return '☀️';
  } else if (conditionsLower.includes('partly cloudy') || conditionsLower.includes('partly')) {
    return '⛅';
  } else if (conditionsLower.includes('cloud')) {
    return '☁️';
  } else if (conditionsLower.includes('rain') || conditionsLower.includes('shower') || conditionsLower.includes('drizzle')) {
    return '🌧️';
  } else if (conditionsLower.includes('storm') || conditionsLower.includes('thunder')) {
    return '⛈️';
  } else if (conditionsLower.includes('snow')) {
    return '❄️';
  } else if (conditionsLower.includes('fog') || conditionsLower.includes('mist')) {
    return '🌫️';
  } else if (conditionsLower.includes('wind')) {
    return '💨';
  }

  return '🌤️';
}

/**
 * Get day name with offset
 */
function getDayName(offset = 0) {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const today = new Date();
  const targetDate = new Date(today);
  targetDate.setDate(today.getDate() + offset);

  if (offset === 0) return 'Today';
  if (offset === 1) return 'Tomorrow';

  return days[targetDate.getDay()];
}

/**
 * Generate daily report HTML
 */
async function generateDailyReportHtml(user, weatherData, preferences) {
  const template = await loadTemplate('dailyWeatherReport');

  const data = {
    USER_NAME: user.name || 'there',
    DATE: new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    }),
    LOCATIONS: weatherData.map(location => ({
      location_name: location.location_name || location.name,
      temperature: Math.round(location.temperature || location.temp),
      unit: preferences.temperature_unit || 'F',
      feels_like: Math.round(location.feels_like || location.feelsLike || location.temperature),
      conditions: location.conditions || location.weather_condition || 'Unknown',
      icon: getWeatherIcon(location.conditions || location.weather_condition),
      precip_chance: location.precipitation_probability || location.precipProbability || 0,
      wind_speed: Math.round(location.wind_speed || location.windSpeed || 0),
      humidity: location.humidity || 0,
      uv_index: location.uv_index || location.uvIndex || 0,
      forecast: (location.forecast || []).slice(0, 7).map((day, index) => ({
        day: getDayName(index),
        icon: getWeatherIcon(day.conditions || day.weather_condition),
        high: Math.round(day.temperature_high || day.tempHigh || day.temp),
        low: Math.round(day.temperature_low || day.tempLow || day.temp),
      })),
    })),
    UNSUBSCRIBE_URL: `https://meteo-beta.tachyonfuture.com/preferences?unsubscribe=daily`,
    PREFERENCES_URL: `https://meteo-beta.tachyonfuture.com/preferences`,
  };

  return template(data);
}

/**
 * Generate weekly summary HTML
 */
async function generateWeeklySummaryHtml(user, weatherData, preferences) {
  const template = await loadTemplate('weeklySummary');

  const data = {
    USER_NAME: user.name || 'there',
    WEEK_OF: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
    LOCATIONS: weatherData.map(location => ({
      location_name: location.location_name || location.name,
      unit: preferences.temperature_unit || 'F',
      forecast: (location.forecast || []).slice(0, 7).map((day, index) => ({
        day: getDayName(index),
        date: new Date(Date.now() + index * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        icon: getWeatherIcon(day.conditions || day.weather_condition),
        high: Math.round(day.temperature_high || day.tempHigh || day.temp),
        low: Math.round(day.temperature_low || day.tempLow || day.temp),
        precip: day.precipitation_probability || day.precipProbability || 0,
        conditions: day.conditions || day.weather_condition || 'Unknown',
      })),
    })),
    UNSUBSCRIBE_URL: `https://meteo-beta.tachyonfuture.com/preferences?unsubscribe=weekly`,
    PREFERENCES_URL: `https://meteo-beta.tachyonfuture.com/preferences`,
  };

  return template(data);
}

/**
 * Generate weather alert HTML
 */
async function generateWeatherAlertHtml(user, alert) {
  const template = await loadTemplate('weatherAlert');

  const data = {
    USER_NAME: user.name || 'there',
    EVENT: alert.event || 'Weather Alert',
    SEVERITY: alert.severity || 'moderate',
    LOCATION: alert.location || 'Your location',
    EFFECTIVE_TIME: new Date(alert.onset || Date.now()).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }),
    EXPIRATION_TIME: new Date(alert.ends || Date.now()).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }),
    DESCRIPTION: alert.description || 'A weather alert has been issued for your area.',
    INSTRUCTIONS: alert.instruction || null,
    VIEW_URL: `https://meteo-beta.tachyonfuture.com/dashboard`,
  };

  return template(data);
}

/**
 * Send daily weather report
 */
async function sendDailyWeatherReport(user, preferences, weatherData) {
  try {
    const html = await generateDailyReportHtml(user, weatherData, preferences);

    return sendEmail({
      to: user.email,
      subject: `Daily Weather Report - ${new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric'
      })}`,
      html,
    });
  } catch (error) {
    console.error('[EmailService] Error sending daily report:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Send weekly weather summary
 */
async function sendWeeklySummary(user, preferences, weatherData) {
  try {
    const html = await generateWeeklySummaryHtml(user, weatherData, preferences);

    return sendEmail({
      to: user.email,
      subject: `Weekly Weather Summary - Week of ${new Date().toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric'
      })}`,
      html,
    });
  } catch (error) {
    console.error('[EmailService] Error sending weekly summary:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Send severe weather alert
 */
async function sendWeatherAlert(user, alert) {
  try {
    const html = await generateWeatherAlertHtml(user, alert);

    return sendEmail({
      to: user.email,
      subject: `⚠️ Weather Alert: ${alert.event} - ${alert.location}`,
      html,
    });
  } catch (error) {
    console.error('[EmailService] Error sending weather alert:', error);
    return { success: false, error: error.message };
  }
}

// Initialize transporter on module load
initializeTransporter();

module.exports = {
  sendEmail,
  sendDailyWeatherReport,
  sendWeeklySummary,
  sendWeatherAlert,
  getWeatherIcon,
  getDayName,
};
