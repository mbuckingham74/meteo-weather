/**
 * AI Weather Analysis Service
 * Supports multiple AI providers via centralized provider registry
 * Uses user-provided API keys when available, falls back to system keys
 */

const { callProvider } = require('../config/aiProviders');
const { getApiKeyForProvider, updateApiKeyUsage } = require('./userApiKeyService');

/**
 * Detect query intent and suggest relevant visualizations
 * @param {string} query - User's question
 * @param {Object} weatherData - Current weather context
 * @returns {Array} Suggested visualization objects
 */
function detectVisualizationIntent(query, _weatherData) {
  const suggestions = [];

  // Rain/Precipitation queries
  if (/\b(rain|rainy|raining|precipitation|drizzle|shower|storm|wet|umbrella)\b/i.test(query)) {
    suggestions.push({
      type: 'radar',
      priority: 1,
      reason: 'Shows current precipitation activity in your area',
      component: 'RadarMap',
    });

    // Check if asking about today/specific date
    const isToday = /\b(today|tonight|this evening)\b/i.test(query);
    if (isToday) {
      const today = new Date();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate()).padStart(2, '0');

      suggestions.push({
        type: 'historical-precipitation',
        priority: 2,
        reason: 'Historical rainfall patterns for this date over the past 25 years',
        component: 'HistoricalRainTable',
        params: {
          date: `${month}-${day}`,
          years: 25,
        },
      });
    }
  }

  // Temperature queries
  if (/\b(temperature|temp|hot|cold|warm|cool|freeze|heat|degree)\b/i.test(query)) {
    suggestions.push({
      type: 'chart-temperature',
      priority: 1,
      reason: 'Temperature trends and forecast',
      component: 'TemperatureBandChart',
    });
  }

  // Wind queries
  if (/\b(wind|windy|gust|breeze)\b/i.test(query)) {
    suggestions.push({
      type: 'chart-wind',
      priority: 1,
      reason: 'Wind speed and direction patterns',
      component: 'WindChart',
    });
  }

  // Multi-day forecast queries
  if (/\b(week|weekend|tomorrow|days|forecast|outlook|upcoming)\b/i.test(query)) {
    suggestions.push({
      type: 'chart-hourly',
      priority: 1,
      reason: '48-hour detailed forecast',
      component: 'HourlyForecastChart',
    });
  }

  return suggestions.sort((a, b) => a.priority - b.priority);
}

/**
 * Generate contextual follow-up questions based on the original query
 * Encourages exploration and showcases different features
 * @param {string} query - Original user query
 * @param {Array} visualizations - Suggested visualizations from intent detection
 * @param {Object} weatherData - Weather context
 * @returns {Array} Array of follow-up question strings
 */
function generateFollowUpQuestions(query, _visualizations, _weatherData) {
  const followUps = [];

  // Rain/Precipitation follow-ups
  if (/\b(rain|rainy|precipitation|umbrella)\b/i.test(query)) {
    if (/\b(today|tonight)\b/i.test(query)) {
      followUps.push('How does today compare to historical averages?');
      followUps.push("What's the hourly rain forecast?");
      followUps.push('Is this typical for this time of year?');
    } else if (/\b(weekend|week)\b/i.test(query)) {
      followUps.push('Will it rain today?');
      followUps.push("What's the total rainfall expected this week?");
      followUps.push('Which day will be the driest?');
    }
  }

  // Temperature follow-ups
  if (/\b(temperature|temp|hot|cold|warm|cool)\b/i.test(query)) {
    followUps.push('How windy will it be?');
    followUps.push("What's the UV index forecast?");
    followUps.push('Will it rain this week?');
  }

  // Wind follow-ups
  if (/\b(wind|windy|gust)\b/i.test(query)) {
    followUps.push("What's the temperature trend?");
    followUps.push('Is it a good day for outdoor activities?');
    followUps.push('How humid will it be?');
  }

  // Forecast/Planning follow-ups
  if (/\b(forecast|outlook|week|weekend)\b/i.test(query)) {
    followUps.push("What's the best day for outdoor plans?");
    followUps.push('Will temperatures stay consistent?');
    followUps.push('Any chance of storms?');
  }

  // General follow-ups if nothing specific matched
  if (followUps.length === 0) {
    followUps.push("What's the 48-hour forecast?");
    followUps.push('How does today compare historically?');
    followUps.push("What's the temperature trend this week?");
  }

  // Return up to 3 unique follow-ups
  return [...new Set(followUps)].slice(0, 3);
}

/**
 * Call AI provider using the centralized registry
 * This replaces 7 individual provider functions with a single call
 * @param {string} provider - AI provider (anthropic, openai, grok, google, mistral, cohere, ollama)
 * @param {string} apiKey - API key for the provider
 * @param {string} systemPrompt - System prompt/instructions
 * @param {string} userMessage - User's message
 * @param {number} maxTokens - Maximum tokens to generate
 * @returns {Promise<{text: string, tokensUsed: number, model: string}>}
 */
async function callAIProvider(provider, apiKey, systemPrompt, userMessage, maxTokens = 500) {
  return await callProvider(provider, apiKey, systemPrompt, userMessage, { maxTokens });
}

/**
 * Validate that a user query is a legitimate weather question
 * Quick, low-cost validation before expensive parsing
 *
 * @param {string} query - User's natural language question
 * @param {Object} weatherData - Current weather/forecast data for context
 * @param {number|null} userId - User ID (optional, for user API key support)
 * @param {string} provider - AI provider to use (default: 'anthropic')
 * @returns {Promise<Object>} { isValid: boolean, reason: string, tokensUsed: number }
 */
async function validateWeatherQuery(query, weatherData, userId = null, provider = 'anthropic') {
  const systemPrompt = `You are a query validator for a weather application. Determine if the user's question is a legitimate weather-related query.

Valid queries include:
- Weather conditions (rain, snow, temperature, wind, etc.)
- Forecast questions (will it rain, when is the warmest day, etc.)
- Weather planning (should I bring an umbrella, good day for outdoor activities, etc.)
- Weather comparisons (warmer than yesterday, colder next week, etc.)

Invalid queries include:
- Spam or nonsense
- Unrelated topics (politics, sports, general knowledge, etc.)
- Personal questions unrelated to weather
- Harmful or malicious content

Respond with ONLY a JSON object: { "isValid": true/false, "reason": "brief explanation" }`;

  try {
    // Get API key (user's key or system fallback)
    const keyInfo = await getApiKeyForProvider(userId, provider);

    const userMessage = `Query: "${query}"\n\nWeather context: ${weatherData.location.address}, Current: ${weatherData.current.conditions}, ${weatherData.current.temperature}°C`;

    const response = await callAIProvider(provider, keyInfo.apiKey, systemPrompt, userMessage, 200);

    // Strip markdown code blocks if present
    let jsonText = response.text;
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.replace(/^```json\n/, '').replace(/\n```$/, '');
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/^```\n/, '').replace(/\n```$/, '');
    }

    const result = JSON.parse(jsonText);

    // Update usage if using user's key
    if (keyInfo.isUserKey) {
      await updateApiKeyUsage(keyInfo.keyId, response.tokensUsed);
    }

    return {
      isValid: result.isValid === true,
      reason: result.reason || 'Unknown',
      tokensUsed: response.tokensUsed,
      provider: provider,
      usingUserKey: keyInfo.isUserKey,
    };
  } catch (error) {
    console.error('Error validating weather query:', error);
    throw new Error('Failed to validate query: ' + error.message);
  }
}

/**
 * Analyze weather data and answer a natural language question
 *
 * @param {string} query - User's natural language question
 * @param {Object} weatherData - Complete weather data (current, forecast, location)
 * @param {number|null} userId - User ID (optional, for user API key support)
 * @param {string} provider - AI provider to use (default: 'anthropic')
 * @returns {Promise<Object>} { answer: string, confidence: string, tokensUsed: number, model: string, suggestedVisualizations: Array, followUpQuestions: Array }
 */
async function analyzeWeatherQuestion(query, weatherData, userId = null, provider = 'anthropic') {
  // Detect visualization intent FIRST
  const suggestedVisualizations = detectVisualizationIntent(query, weatherData);

  const systemPrompt = `You are Meteo Weather AI, an expert weather analyst. Answer weather questions based on the provided data.

Guidelines:
- Be concise and direct (2-3 sentences)
- Use natural, conversational language
- Include specific data (temperatures, percentages, times)
- If data is insufficient, say so clearly
- Focus on actionable insights
- Use the user's preferred temperature unit
${suggestedVisualizations.length > 0 ? `\n- Note: Interactive visualizations will be displayed below your answer: ${suggestedVisualizations.map((v) => v.component).join(', ')}. You can reference them naturally (e.g., "Check the radar map below for current precipitation...")` : ''}

Weather Data Available:
${JSON.stringify(weatherData, null, 2)}`;

  try {
    // Get API key (user's key or system fallback)
    const keyInfo = await getApiKeyForProvider(userId, provider);

    const response = await callAIProvider(provider, keyInfo.apiKey, systemPrompt, query, 500);

    // Generate contextual follow-up questions
    const followUpQuestions = generateFollowUpQuestions(
      query,
      suggestedVisualizations,
      weatherData
    );

    // Update usage if using user's key
    if (keyInfo.isUserKey) {
      await updateApiKeyUsage(keyInfo.keyId, response.tokensUsed);
    }

    return {
      answer: response.text,
      confidence: 'high',
      tokensUsed: response.tokensUsed,
      model: response.model,
      suggestedVisualizations,
      followUpQuestions,
      provider: provider,
      usingUserKey: keyInfo.isUserKey,
      keyName: keyInfo.keyName,
    };
  } catch (error) {
    console.error('Error analyzing weather question:', error);
    throw new Error('Failed to analyze weather: ' + error.message);
  }
}

module.exports = {
  validateWeatherQuery,
  analyzeWeatherQuestion,
  // Exported for testing
  detectVisualizationIntent,
  generateFollowUpQuestions,
  callAIProvider,
};
