# Error Message Style Guide

**Comprehensive guide for writing user-friendly error messages in the Meteo Weather App**

**Created:** November 5, 2025
**Part of:** Error Message Improvement Initiative (Phase 3)

---

## 📚 Table of Contents

- [Overview](#overview)
- [Voice & Tone](#voice--tone)
- [Message Structure](#message-structure)
- [Display Modes](#display-modes)
- [Writing Guidelines](#writing-guidelines)
- [Examples](#examples)
- [Accessibility](#accessibility)
- [Emoji Guidelines](#emoji-guidelines)
- [Context-Specific Messages](#context-specific-messages)
- [Technical Reference](#technical-reference)

---

## Overview

Error messages are critical touchpoints in the user experience. They should:
- **Inform** - Clearly explain what went wrong
- **Guide** - Suggest actionable next steps
- **Reassure** - Maintain user confidence
- **Respect** - Never blame the user

### Core Principles

1. **Be human, not robotic** - Write like you're helping a friend
2. **Be specific, not vague** - Avoid generic "Error occurred" messages
3. **Be helpful, not technical** - Focus on solutions, not error codes
4. **Be concise, not verbose** - Respect the user's time
5. **Be positive, not negative** - Focus on what can be done

---

## Voice & Tone

### ✅ Do

- **Be conversational** - "We couldn't find that location"
- **Be empathetic** - "Something went wrong on our end"
- **Be direct** - "Password must be at least 8 characters"
- **Be solution-focused** - "Try searching for a city name instead"

### ❌ Don't

- **Be overly formal** - "An error has occurred in the system"
- **Be cold** - "Invalid input"
- **Be vague** - "Error 500"
- **Be patronizing** - "Oops! You made a mistake"
- **Be technical** - "ECONNREFUSED at 192.168.1.1:5001"

---

## Message Structure

### Three-Part Format

Every error message should ideally contain:

1. **What happened** (required)
2. **Why it happened** (optional, if known)
3. **What to do next** (recommended)

### Template

```
[What happened]. [Why it happened]. [What to do next].
```

### Examples

#### Basic Error
```
❌ Bad: "Error"
✅ Good: "Weather data unavailable. Please try again in a moment."
```

#### With Context
```
❌ Bad: "Invalid input"
✅ Good: "Email format is invalid. Please enter a valid email address like user@example.com."
```

#### With Reason
```
❌ Bad: "Request failed"
✅ Good: "Weather service is temporarily unavailable. We're experiencing high traffic. Please try again in a few minutes."
```

---

## Display Modes

Choose the right display mode based on severity and context:

### 1. Inline Error

**When to use:**
- Form validation errors
- Input field errors
- Non-blocking issues
- Single field problems

**Characteristics:**
- Display near the problematic element
- Red border on input field
- Small red text below field
- No action required to dismiss

**Example:**
```jsx
<input className="error" />
<span className="error-text">Email format is invalid</span>
```

**Message style:**
- Short and direct
- No emoji
- Focus on the specific field
- Suggest correction

**Examples:**
```
✅ "Password must be at least 8 characters"
✅ "Email address is required"
✅ "City name cannot be empty"
```

---

### 2. Toast Notification

**When to use:**
- Temporary status updates
- Non-critical errors
- Background operation failures
- Auto-dismissible messages

**Characteristics:**
- Appears in corner or center
- Auto-dismiss after 3-5 seconds
- Optional close button
- Slide-in animation

**Example:**
```jsx
<Toast
  message="Failed to save favorite. Please try again."
  duration={5000}
/>
```

**Message style:**
- Medium length (1-2 sentences)
- Can include emoji (⚠️, ❌)
- Include brief action hint
- Conversational tone

**Examples:**
```
✅ "⚠️ Couldn't save your favorite. Please try again."
✅ "❌ Screenshot failed. Check your browser permissions."
✅ "⚠️ Location update failed. Retrying..."
```

---

### 3. Banner

**When to use:**
- Persistent warnings
- System-wide issues
- Network connectivity problems
- Important non-blocking info

**Characteristics:**
- Full-width at top or bottom
- Stays until dismissed or resolved
- Yellow/orange background for warnings
- Includes action button if applicable

**Example:**
```jsx
<Banner
  type="warning"
  message="You're offline. Some features may be unavailable."
  dismissible={true}
/>
```

**Message style:**
- Clear and informative
- Explain impact on functionality
- Suggest workaround if available
- Professional tone

**Examples:**
```
✅ "You're offline. Weather data will update when connection is restored."
✅ "Rate limit reached. You can make 100 more requests in 15 minutes."
✅ "Your session will expire in 5 minutes. Save your work."
```

---

### 4. Modal Dialog

**When to use:**
- Critical errors requiring immediate attention
- Errors that block further action
- Errors requiring user decision
- Data loss warnings

**Characteristics:**
- Blocks the interface
- Requires explicit action (OK, Retry, Cancel)
- Center of screen with backdrop
- Should be rare

**Example:**
```jsx
<Modal
  title="Session Expired"
  message="Your session has expired for security reasons. Please log in again to continue."
  actions={[
    { label: "Log In", primary: true },
    { label: "Cancel" }
  ]}
/>
```

**Message style:**
- Formal but friendly
- Explain consequences clearly
- Provide clear action options
- No emoji

**Examples:**
```
✅ Title: "Session Expired"
   Message: "Your session has expired for security reasons. Please log in again to continue."
   Actions: [Log In] [Cancel]

✅ Title: "Connection Lost"
   Message: "Unable to reach the weather service. Check your internet connection and try again."
   Actions: [Retry] [Cancel]

✅ Title: "Unsaved Changes"
   Message: "You have unsaved changes that will be lost. Do you want to continue?"
   Actions: [Discard] [Keep Editing]
```

---

## Writing Guidelines

### 1. Start with the Problem

Begin with what went wrong, not with "Error:" or "Oops!"

```
❌ "Error: Unable to process request"
✅ "Weather data unavailable"
```

### 2. Avoid Jargon

Use plain language that anyone can understand.

```
❌ "HTTP 503: External API gateway timeout on upstream server"
✅ "Weather service is temporarily unavailable"
```

### 3. Be Specific

Tell the user exactly what failed.

```
❌ "Something went wrong"
✅ "Failed to save your location preferences"
```

### 4. Suggest Solutions

Always try to include next steps.

```
❌ "Location not found"
✅ "Location not found. Try entering a city name like 'Seattle' or 'New York'"
```

### 5. Use Active Voice

Make it clear and direct.

```
❌ "The request could not be completed"
✅ "We couldn't complete your request"
```

### 6. Avoid Blame

Never make the user feel at fault.

```
❌ "You entered an invalid email"
✅ "Email format is invalid"
```

### 7. Be Honest

Don't oversell or make promises you can't keep.

```
❌ "This will never happen again!"
✅ "We're working to prevent this issue"
```

### 8. Keep It Short

Respect the user's time and attention.

```
❌ "We're very sorry, but unfortunately we were unable to establish a connection to our weather data provider's servers at this time due to temporary network issues"
✅ "Weather service unavailable. Please try again in a moment."
```

---

## Examples

### Authentication Errors

#### Login Failed
```
❌ "Authentication error"
✅ "Email or password is incorrect. Please try again."
```

#### Session Expired
```
❌ "Token expired"
✅ "Your session has expired. Please log in again."
```

#### Account Locked
```
❌ "Too many attempts"
✅ "Too many login attempts. Please wait 15 minutes and try again."
```

---

### Weather Data Errors

#### Location Not Found
```
❌ "404 not found"
✅ "We couldn't find that location. Try entering a city name or ZIP code."
```

#### Service Unavailable
```
❌ "Service error"
✅ "Weather service is temporarily unavailable. Please try again in a few minutes."
```

#### Timeout
```
❌ "Request timeout"
✅ "Request took too long. Check your internet connection and try again."
```

#### Rate Limited
```
❌ "429 too many requests"
✅ "You've made too many requests. Please wait 15 minutes before trying again."
```

---

### Form Validation Errors

#### Required Field
```
❌ "Field required"
✅ "Email address is required"
```

#### Invalid Format
```
❌ "Invalid"
✅ "Please enter a valid email address like user@example.com"
```

#### Password Too Weak
```
❌ "Password invalid"
✅ "Password must be at least 8 characters with one number and one letter"
```

#### Duplicate Entry
```
❌ "Already exists"
✅ "This email is already registered. Try logging in instead."
```

---

### Network Errors

#### Offline
```
❌ "No connection"
✅ "You're offline. Check your internet connection."
```

#### Connection Failed
```
❌ "ECONNREFUSED"
✅ "Unable to connect. Please check your internet connection and try again."
```

#### DNS Error
```
❌ "ENOTFOUND"
✅ "Unable to reach the weather service. Please check your connection."
```

---

### File Operation Errors

#### Save Failed
```
❌ "Write error"
✅ "Failed to save your preferences. Please try again."
```

#### Permission Denied
```
❌ "403 forbidden"
✅ "You don't have permission to access this feature. Please log in."
```

#### File Too Large
```
❌ "Size limit exceeded"
✅ "File is too large. Please choose a file smaller than 5MB."
```

---

## Accessibility

### Screen Reader Support

1. **Use ARIA labels** for all error messages
2. **Associate errors with inputs** using `aria-describedby`
3. **Announce errors** using `role="alert"` for critical messages
4. **Provide context** - don't rely on color alone

### Example
```jsx
<input
  id="email"
  aria-invalid="true"
  aria-describedby="email-error"
/>
<span id="email-error" role="alert">
  Email format is invalid
</span>
```

### Keyboard Navigation

1. **Focus management** - Move focus to error message or first error field
2. **Dismissible** - Errors must be dismissible via keyboard (Escape key)
3. **Action buttons** - All buttons must be keyboard accessible

### Color Contrast

1. **Minimum contrast** - 4.5:1 for normal text, 3:1 for large text
2. **Don't rely on color alone** - Use icons, text, or borders
3. **Test in grayscale** - Ensure errors are visible without color

---

## Emoji Guidelines

### When to Use Emojis

✅ **Do use emojis:**
- In toast notifications (casual, temporary)
- For status indicators (✅ success, ⚠️ warning, ❌ error)
- When it adds clarity quickly

❌ **Don't use emojis:**
- In inline form validation (too informal)
- In modal dialogs (too casual for critical errors)
- When it could be confusing
- In production error logs
- For professional/enterprise contexts

### Recommended Emojis

- ✅ Success / Completed
- ⚠️ Warning / Caution
- ❌ Error / Failed
- 🔄 Loading / Retry
- 🔒 Security / Locked
- 📡 Network / Connection
- 📍 Location
- 🌤️ Weather

### Examples

**Toast (Good use):**
```
✅ "⚠️ Couldn't save favorite. Please try again."
✅ "✅ Location saved successfully!"
```

**Inline (Avoid):**
```
❌ "❌ Email format is invalid"
✅ "Email format is invalid" (no emoji)
```

**Modal (Avoid):**
```
❌ Title: "❌ Error"
✅ Title: "Connection Lost" (no emoji)
```

---

## Context-Specific Messages

### Development vs Production

#### Development Mode
```javascript
// Show detailed technical info
if (process.env.NODE_ENV === 'development') {
  return `Location service failed: ${error.code} - ${error.message}`;
}
```

#### Production Mode
```javascript
// Show user-friendly message
return "Unable to detect your location. Please enter it manually.";
```

### User-Facing vs Developer Logs

#### User Message
```
"Weather data unavailable. Please try again."
```

#### Developer Log
```javascript
logger.error('Weather API', 'Request failed', {
  endpoint: '/weather/current/Seattle',
  statusCode: 503,
  error: 'Service Unavailable',
  retryCount: 3,
  duration: 5000
});
```

---

## Technical Reference

### Error Code Mapping

Map backend error codes to user-friendly messages:

```javascript
const ERROR_MESSAGES = {
  VALIDATION_ERROR: "Please check your input and try again",
  UNAUTHORIZED: "Please log in to continue",
  TOKEN_EXPIRED: "Your session has expired. Please log in again",
  FORBIDDEN: "You don't have permission to access this feature",
  NOT_FOUND: "We couldn't find what you're looking for",
  CONFLICT: "This item already exists",
  RATE_LIMITED: "Too many requests. Please wait a moment",
  SERVER_ERROR: "Something went wrong on our end",
  DATABASE_ERROR: "Unable to save your data. Please try again",
  EXTERNAL_API_ERROR: "Weather service is temporarily unavailable",
  TIMEOUT_ERROR: "Request took too long. Please try again",
  LOCATION_NOT_FOUND: "Location not found. Try a different search term",
  WEATHER_DATA_UNAVAILABLE: "Weather data unavailable right now"
};
```

### Context-Aware Messages

Customize messages based on what the user was trying to do:

```javascript
function getErrorMessage(error, context) {
  switch (error.code) {
    case 'TIMEOUT_ERROR':
      switch (context) {
        case 'weather':
          return "Weather data took too long to load. Please try again.";
        case 'auth':
          return "Login request timed out. Please check your connection.";
        case 'save':
          return "Save operation timed out. Please try again.";
        default:
          return "Request took too long. Please try again.";
      }

    case 'LOCATION_NOT_FOUND':
      return `We couldn't find "${context}". Try entering a city name or ZIP code.`;

    default:
      return error.message || "Something went wrong. Please try again.";
  }
}
```

### Retry Logic Messages

Show progress when retrying:

```javascript
// First attempt
"Loading weather data..."

// First retry
"Still loading... (retrying 1 of 3)"

// Second retry
"Still loading... (retrying 2 of 3)"

// Final failure
"Weather data unavailable. Please try again later."
```

---

## Testing Your Messages

### Checklist

Before deploying a new error message, verify:

- [ ] **Clear** - Can a non-technical user understand it?
- [ ] **Specific** - Does it explain what went wrong?
- [ ] **Actionable** - Does it suggest what to do next?
- [ ] **Concise** - Is it under 100 characters (for toasts)?
- [ ] **Human** - Does it sound natural when read aloud?
- [ ] **Accessible** - Does it work with screen readers?
- [ ] **Consistent** - Does it match our style guide?

### User Testing

Test your error messages by:

1. **Triggering the error** - Make sure it displays correctly
2. **Reading it aloud** - Does it sound natural?
3. **Following the instructions** - Can you recover from the error?
4. **Testing on mobile** - Does it fit on small screens?
5. **Testing with screen reader** - Is it announced properly?

---

## Quick Reference

### Message Templates

Copy and customize these templates:

#### Generic Error
```
"[Action] failed. Please try again."
```

#### Validation Error
```
"[Field] [requirement]. Please [suggested action]."
```

#### Service Unavailable
```
"[Service] is temporarily unavailable. Please try again in [timeframe]."
```

#### Not Found
```
"We couldn't find [resource]. Try [alternative action]."
```

#### Permission Error
```
"You don't have permission to [action]. [Alternative or explanation]."
```

---

## Related Documentation

- [Backend Error Handling Guide](../backend/docs/ERROR_HANDLING_GUIDE.md) - Backend error patterns
- [ERROR_MESSAGE_IMPROVEMENT_STATUS.md](../ERROR_MESSAGE_IMPROVEMENT_STATUS.md) - Project status
- [TROUBLESHOOTING.md](../TROUBLESHOOTING.md) - Common issues and fixes

---

## Examples by Component

### WeatherDashboard
```
✅ "Unable to load weather for [location]. Please try again."
✅ "Weather forecast unavailable. Showing cached data."
✅ "Location not found. Try 'Seattle' or 'New York, NY'."
```

### AuthContext
```
✅ "Email or password is incorrect. Please try again."
✅ "Your session has expired. Please log in again."
✅ "Too many login attempts. Please wait 15 minutes."
```

### LocationSearch
```
✅ "No results found for '[query]'. Try a city name or ZIP code."
✅ "Search timed out. Please try again."
✅ "Unable to detect your location. Please enter it manually."
```

### RadarMap
```
✅ "⚠️ Failed to load radar imagery. Please try again."
✅ "⚠️ Screenshot failed. Check your browser permissions."
✅ "⚠️ Unable to update radar. Showing last known data."
```

### FavoritesList
```
✅ "Failed to save favorite. Please try again."
✅ "Failed to remove favorite. Please try again."
✅ "Unable to load favorites. Showing local data."
```

---

## Conclusion

Great error messages are:
1. **Human** - Written for people, not machines
2. **Helpful** - Guide users to solutions
3. **Honest** - Don't hide or sugarcoat issues
4. **Humble** - Take responsibility when it's our fault
5. **Hopeful** - Reassure users that problems can be solved

Remember: **Error messages are not interruptions—they're opportunities to build trust.**

---

**Last Updated:** November 5, 2025
**Maintained By:** Michael Buckingham
**Part of:** Error Message Improvement Initiative
**Related:** Phase 3 - Consistency & UX
