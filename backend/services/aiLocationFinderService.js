const Anthropic = require('@anthropic-ai/sdk');

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.METEO_ANTHROPIC_API_KEY,
});

const MODEL = 'claude-sonnet-4-5-20250929';

/**
 * Validate if a user query is a legitimate location/climate search query
 * @param {string} userInput - The user's natural language query
 * @returns {Promise<{isValid: boolean, reason: string, tokensUsed: number}>}
 */
async function validateQuery(userInput) {
  const startTime = Date.now();

  try {
    const systemPrompt = `You are a query validator for a weather and location comparison application.
Your task is to determine if the user's input is a legitimate location or climate-related search query.

Valid queries include:
- Weather preferences (e.g., "I want somewhere cooler", "less humid climate")
- Climate needs (e.g., "mild winters", "dry summers")
- City characteristics (e.g., "good community feel", "walkable city")
- Temperature preferences (e.g., "15 degrees cooler", "warmer year-round")
- Seasonal preferences (e.g., "better fall weather", "avoid hot summers")

Invalid queries include:
- Random questions unrelated to location/weather
- Jokes or memes
- Abuse or profanity
- Nonsensical input
- General knowledge questions
- Technical support requests

Return ONLY valid JSON in this exact format:
{
  "isValid": true or false,
  "reason": "Brief explanation (max 50 words)"
}`;

    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 200,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: userInput
        }
      ]
    });

    const duration = Date.now() - startTime;
    const tokensUsed = response.usage.input_tokens + response.usage.output_tokens;

    // Parse the response
    let textContent = response.content[0].text;

    // Strip markdown code blocks if present
    textContent = textContent.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    const result = JSON.parse(textContent);

    console.log(`[AI Validation] Query: "${userInput.substring(0, 50)}..." | Valid: ${result.isValid} | Tokens: ${tokensUsed} | Duration: ${duration}ms`);

    return {
      isValid: result.isValid,
      reason: result.reason,
      tokensUsed
    };

  } catch (error) {
    console.error('[AI Validation Error]', error.message);

    // If there's an API error, default to allowing the query
    // to avoid blocking legitimate users
    return {
      isValid: true,
      reason: 'Validation service unavailable, proceeding with query',
      tokensUsed: 0,
      error: error.message
    };
  }
}

/**
 * Parse natural language location query into structured criteria
 * @param {string} userInput - The user's natural language query
 * @param {Object} currentLocation - Optional current location {lat, lng, city}
 * @returns {Promise<{criteria: Object, tokensUsed: number}>}
 */
async function parseLocationQuery(userInput, currentLocation = null) {
  const startTime = Date.now();

  try {
    const systemPrompt = `You are an AI assistant for a weather comparison application. Your task is to parse natural language queries about location and climate preferences into structured JSON.

Extract the following information when available:
- Current location (from explicit mention or context)
- Time periods/seasons of concern (e.g., "June-October", "summer", "winter")
- Temperature preferences (delta from current, absolute ranges, or descriptive terms)
- Humidity preferences (less humid, dry, humid, etc.)
- Precipitation preferences (rainy, dry, moderate rain, etc.)
- Lifestyle factors (community feel, walkability, nature access, etc.)
- Deal breakers (things to avoid)

Return ONLY valid JSON in this exact format:
{
  "current_location": "City, State/Country or null if not specified",
  "time_period": {
    "start": "month name or season",
    "end": "month name or season"
  },
  "temperature_delta": number in Fahrenheit or null,
  "temperature_range": {
    "min": number or null,
    "max": number or null
  },
  "humidity": "lower|higher|moderate|null",
  "precipitation": "less|more|moderate|null",
  "lifestyle_factors": ["factor1", "factor2", ...],
  "deal_breakers": ["dealbreaker1", "dealbreaker2", ...],
  "additional_notes": "any other relevant context"
}

If information is not specified, use null. Be conservative - only extract what is clearly stated or strongly implied.`;

    const userMessage = currentLocation
      ? `Current location context: ${currentLocation.city || `${currentLocation.lat}, ${currentLocation.lng}`}\n\nUser query: ${userInput}`
      : `User query: ${userInput}`;

    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 5000,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: userMessage
        }
      ]
    });

    const duration = Date.now() - startTime;
    const tokensUsed = response.usage.input_tokens + response.usage.output_tokens;

    // Parse the response
    let textContent = response.content[0].text;

    // Strip markdown code blocks if present
    textContent = textContent.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    const criteria = JSON.parse(textContent);

    console.log(`[AI Parse] Query: "${userInput.substring(0, 50)}..." | Tokens: ${tokensUsed} | Duration: ${duration}ms`);
    console.log(`[AI Parse] Criteria:`, JSON.stringify(criteria, null, 2));

    return {
      criteria,
      tokensUsed,
      cost: calculateCost(tokensUsed)
    };

  } catch (error) {
    console.error('[AI Parse Error]', error.message);
    throw new Error(`Failed to parse location query: ${error.message}`);
  }
}

/**
 * Calculate approximate cost based on token usage
 * Claude Sonnet 4.0 pricing: $3 per million input tokens, $15 per million output tokens
 * Assuming roughly 50/50 split for estimation
 * @param {number} tokens - Total tokens used
 * @returns {string} Formatted cost string
 */
function calculateCost(tokens) {
  // Average cost: ~$9 per million tokens (rough estimate)
  const costPerToken = 0.000009;
  const cost = tokens * costPerToken;
  return `$${cost.toFixed(4)}`;
}

module.exports = {
  validateQuery,
  parseLocationQuery,
};
