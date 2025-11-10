# API Reference

Complete API documentation for Meteo Weather App backend.

**Base URL:** `http://localhost:5001/api` (development) | `https://api.meteo-beta.tachyonfuture.com/api` (production)

**Last Updated:** November 7, 2025

---

## 📋 Table of Contents

- [Authentication](#authentication)
  - [Register User](#post-apiauthregister)
  - [Login User](#post-apiauthlogin)
  - [Refresh Token](#post-apiauthrefresh)
  - [Get Current User](#get-apiauthme)
  - [Update Profile](#put-apiauthprofile)
  - [Change Password](#post-apiauthchange-password)
- [Weather](#weather)
  - [Test API Connection](#get-apiweathertest)
  - [Get Current Weather](#get-apiweathercurrentlocation)
  - [Get Forecast](#get-apiweatherforecastlocation)
  - [Get Hourly Forecast](#get-apiweatherhourlylocation)
  - [Get Weather Alerts](#get-apiweatheralertslocation)
- [Climate Data](#climate-data)
  - [Get Climate Normals](#get-apiweatherclimatenormalslocation)
  - [Get Record Temperatures](#get-apiweatherclimaterecordslocation)
  - [Compare Forecast to Historical](#post-apiweatherclimatecomparelocation)
  - [Get This Day in History](#get-apiweatherclimatethis-daylocation)
  - [Get Temperature Probability](#get-apiweatherclimateprobabilitylocation)
- [Locations](#locations)
  - [Search Locations](#get-apilocationsgeocodeqquery)
  - [Reverse Geocode](#get-apilocationsreverselatlatitudelonlongitude)
  - [Get Popular Locations](#get-apilocationspopular)
  - [Search Locations (Database)](#get-apilocationssearchqquery)
  - [Get Location by ID](#get-apilocationsid)
- [Air Quality](#air-quality)
  - [Get Air Quality](#get-apiair-qualitylatlatitudelonlongitude)
  - [Get Air Quality by Location](#get-apiair-qualitylocationlocation)
- [AI Features](#ai-features)
  - [Validate Weather Query](#post-apiai-weathervalidate)
  - [Analyze Weather Question](#post-apiai-weatheranalyze)
  - [Validate Location Query](#post-apiai-location-findervalidate-query)
  - [Parse Location Query](#post-apiai-location-finderparse-query)
  - [Share AI Answer](#post-apiai-weathershare)
- [User Preferences](#user-preferences)
  - [Get Preferences](#get-apiuserpreferences)
  - [Update Preferences](#put-apiuserpreferences)
  - [Get Notification Settings](#get-apiuserpreferencesnotifications)
  - [Update Notification Settings](#put-apiuserpreferencesnotifications)
- [Favorites](#favorites)
  - [Get Favorites](#get-apiuserfavorites)
  - [Add Favorite](#post-apiuserfavorites)
  - [Remove Favorite](#delete-apiuserfavoritesid)
  - [Import Favorites](#post-apiuserfavoritesimport)
- [Cache Management](#cache-management)
  - [Get Cache Statistics](#get-apicachestats)
  - [Clear Expired Cache](#delete-apicacheexpired)
  - [Clear Location Cache](#delete-apicachelocationid)

---

## Authentication

### POST /api/auth/register

Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"
}
```

**Validation Rules:**
- Email: Valid email format required
- Password: Minimum 6 characters
- Name: Required, non-empty string

**Success Response (201 Created):**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe",
    "created_at": "2025-11-07T12:00:00.000Z"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Responses:**
- `400 Bad Request`: Missing required fields or validation failure
- `409 Conflict`: Email already registered
- `500 Internal Server Error`: Server error

---

### POST /api/auth/login

Authenticate user and receive JWT tokens.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Success Response (200 OK):**
```json
{
  "message": "Login successful",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Responses:**
- `400 Bad Request`: Missing email or password
- `401 Unauthorized`: Invalid credentials
- `500 Internal Server Error`: Server error

---

### POST /api/auth/refresh

Refresh access token using refresh token.

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Success Response (200 OK):**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Responses:**
- `400 Bad Request`: Missing refresh token
- `401 Unauthorized`: Invalid or expired refresh token
- `500 Internal Server Error`: Server error

---

### GET /api/auth/me

Get current authenticated user profile.

**Authentication:** Required (Bearer token)

**Success Response (200 OK):**
```json
{
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe",
    "created_at": "2025-11-07T12:00:00.000Z"
  }
}
```

**Error Responses:**
- `401 Unauthorized`: Missing or invalid token
- `404 Not Found`: User not found
- `500 Internal Server Error`: Server error

---

### PUT /api/auth/profile

Update user profile information.

**Authentication:** Required (Bearer token)

**Request Body:**
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com"
}
```

**Success Response (200 OK):**
```json
{
  "message": "Profile updated successfully",
  "user": {
    "id": 1,
    "email": "jane@example.com",
    "name": "Jane Doe"
  }
}
```

**Error Responses:**
- `400 Bad Request`: Validation error
- `401 Unauthorized`: Missing or invalid token
- `409 Conflict`: Email already in use
- `500 Internal Server Error`: Server error

---

### POST /api/auth/change-password

Change user password.

**Authentication:** Required (Bearer token)

**Request Body:**
```json
{
  "currentPassword": "oldpassword123",
  "newPassword": "newpassword456"
}
```

**Success Response (200 OK):**
```json
{
  "message": "Password changed successfully"
}
```

**Error Responses:**
- `400 Bad Request`: Missing passwords or new password too short
- `401 Unauthorized`: Current password incorrect or missing token
- `500 Internal Server Error`: Server error

---

## Weather

### GET /api/weather/test

Test Visual Crossing API connection.

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Visual Crossing API connection successful",
  "data": {
    "location": "London, UK",
    "currentTemp": 15.5,
    "queryCost": 1
  }
}
```

**Error Responses:**
- `500 Internal Server Error`: API connection failed

---

### GET /api/weather/current/:location

Get current weather conditions for a location.

**Parameters:**
- `location` (path): City name, coordinates, or address (e.g., "London,UK", "51.5074,-0.1278")

**Example Request:**
```
GET /api/weather/current/Seattle,WA
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "location": {
    "address": "Seattle, WA, United States",
    "latitude": 47.6062,
    "longitude": -122.3321,
    "timezone": "America/Los_Angeles"
  },
  "currentConditions": {
    "datetime": "2025-11-07T12:00:00",
    "temp": 12.5,
    "feelslike": 11.0,
    "humidity": 75,
    "precip": 0.0,
    "precipprob": 20,
    "preciptype": null,
    "snow": 0.0,
    "snowdepth": 0.0,
    "windgust": 15.0,
    "windspeed": 10.0,
    "winddir": 180,
    "pressure": 1013.25,
    "visibility": 10.0,
    "cloudcover": 50,
    "solarradiation": 200,
    "solarenergy": 1.5,
    "uvindex": 3,
    "sunrise": "07:30:00",
    "sunset": "17:00:00",
    "moonphase": 0.5,
    "conditions": "Partly cloudy",
    "description": "Partly cloudy throughout the day.",
    "icon": "partly-cloudy-day"
  },
  "cacheStatus": "miss",
  "queryCost": 1
}
```

**Error Responses:**
- `400 Bad Request`: Missing or invalid location parameter
- `404 Not Found`: Location not found
- `500 Internal Server Error`: API error

---

### GET /api/weather/forecast/:location

Get multi-day weather forecast.

**Parameters:**
- `location` (path): Location identifier
- `days` (query, optional): Number of forecast days (3, 7, or 14, default: 7)

**Example Request:**
```
GET /api/weather/forecast/Seattle,WA?days=7
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "location": {
    "address": "Seattle, WA, United States",
    "latitude": 47.6062,
    "longitude": -122.3321,
    "timezone": "America/Los_Angeles"
  },
  "days": [
    {
      "datetime": "2025-11-07",
      "datetimeEpoch": 1730937600,
      "tempmax": 15.0,
      "tempmin": 8.0,
      "temp": 11.5,
      "feelslikemax": 14.0,
      "feelslikemin": 7.0,
      "feelslike": 11.0,
      "humidity": 70,
      "precip": 2.5,
      "precipprob": 80,
      "preciptype": ["rain"],
      "snow": 0.0,
      "snowdepth": 0.0,
      "windgust": 20.0,
      "windspeed": 15.0,
      "winddir": 180,
      "pressure": 1010.0,
      "cloudcover": 75,
      "visibility": 8.0,
      "solarradiation": 150,
      "solarenergy": 1.2,
      "uvindex": 2,
      "sunrise": "07:30:00",
      "sunset": "17:00:00",
      "moonphase": 0.5,
      "conditions": "Rain, Overcast",
      "description": "Rainy throughout the day.",
      "icon": "rain"
    }
  ],
  "cacheStatus": "miss",
  "queryCost": 1
}
```

**Error Responses:**
- `400 Bad Request`: Invalid location or days parameter
- `404 Not Found`: Location not found
- `500 Internal Server Error`: API error

---

### GET /api/weather/hourly/:location

Get hourly forecast for a location.

**Parameters:**
- `location` (path): Location identifier
- `hours` (query, optional): Number of hours (default: 48, max: 240)

**Example Request:**
```
GET /api/weather/hourly/Seattle,WA?hours=48
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "location": {
    "address": "Seattle, WA, United States",
    "latitude": 47.6062,
    "longitude": -122.3321
  },
  "hours": [
    {
      "datetime": "2025-11-07T13:00:00",
      "datetimeEpoch": 1730988000,
      "temp": 12.5,
      "feelslike": 11.0,
      "humidity": 75,
      "precip": 0.5,
      "precipprob": 60,
      "preciptype": ["rain"],
      "snow": 0.0,
      "windgust": 18.0,
      "windspeed": 12.0,
      "winddir": 190,
      "pressure": 1012.0,
      "visibility": 9.0,
      "cloudcover": 70,
      "solarradiation": 180,
      "solarenergy": 0.5,
      "uvindex": 2,
      "conditions": "Rain, Overcast",
      "icon": "rain"
    }
  ],
  "cacheStatus": "hit"
}
```

**Error Responses:**
- `400 Bad Request`: Invalid parameters
- `404 Not Found`: Location not found
- `500 Internal Server Error`: API error

---

### GET /api/weather/alerts/:location

Get active weather alerts for a location.

**Parameters:**
- `location` (path): Location identifier

**Example Request:**
```
GET /api/weather/alerts/Seattle,WA
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "location": {
    "address": "Seattle, WA, United States",
    "latitude": 47.6062,
    "longitude": -122.3321
  },
  "alerts": [
    {
      "event": "Winter Storm Warning",
      "headline": "Winter Storm Warning issued November 7 at 6:00AM PST",
      "description": "Heavy snow expected. Total snow accumulations of 6 to 12 inches.",
      "onset": "2025-11-07T18:00:00",
      "ends": "2025-11-08T12:00:00",
      "severity": "Moderate",
      "urgency": "Expected",
      "certainty": "Likely"
    }
  ]
}
```

**Error Responses:**
- `400 Bad Request`: Invalid location
- `404 Not Found`: No alerts for location
- `500 Internal Server Error`: API error

---

## Climate Data

### GET /api/weather/climate/normals/:location

Get climate normals (historical averages) for a specific date.

**Parameters:**
- `location` (path): Location identifier
- `date` (query, optional): Date in MM-DD format (default: today)
- `years` (query, optional): Number of years to analyze (default: 10)

**Example Request:**
```
GET /api/weather/climate/normals/Seattle,WA?date=07-15&years=10
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "location": {
    "address": "Seattle, WA, United States"
  },
  "date": "07-15",
  "years": 10,
  "normals": {
    "tempAvg": 22.5,
    "tempMin": 15.0,
    "tempMax": 28.0,
    "tempP10": 18.0,
    "tempP25": 20.0,
    "tempP50": 22.5,
    "tempP75": 25.0,
    "tempP90": 27.0,
    "precipAvg": 0.5,
    "humidityAvg": 65
  }
}
```

**Error Responses:**
- `400 Bad Request`: Invalid date format or years
- `500 Internal Server Error`: API error

---

### GET /api/weather/climate/records/:location

Get record high/low temperatures for a date range.

**Parameters:**
- `location` (path): Location identifier
- `start` (query): Start date in MM-DD format
- `end` (query): End date in MM-DD format
- `years` (query, optional): Years to analyze (default: 10)

**Example Request:**
```
GET /api/weather/climate/records/Seattle,WA?start=07-01&end=07-31&years=10
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "location": {
    "address": "Seattle, WA, United States"
  },
  "dateRange": {
    "start": "07-01",
    "end": "07-31"
  },
  "records": [
    {
      "date": "07-15",
      "recordHigh": 35.0,
      "recordHighYear": 2015,
      "recordLow": 10.0,
      "recordLowYear": 2018
    }
  ]
}
```

**Error Responses:**
- `400 Bad Request`: Missing or invalid dates
- `500 Internal Server Error`: API error

---

### POST /api/weather/climate/compare/:location

Compare current forecast against historical climate normals.

**Parameters:**
- `location` (path): Location identifier

**Request Body:**
```json
{
  "forecastData": [
    {
      "datetime": "2025-11-07",
      "temp": 12.5,
      "tempmax": 15.0,
      "tempmin": 8.0
    }
  ]
}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "location": {
    "address": "Seattle, WA, United States"
  },
  "comparison": [
    {
      "date": "2025-11-07",
      "forecast": {
        "temp": 12.5,
        "tempmax": 15.0,
        "tempmin": 8.0
      },
      "normals": {
        "tempAvg": 11.0,
        "tempMax": 14.0,
        "tempMin": 7.5
      },
      "deviation": {
        "temp": 1.5,
        "tempmax": 1.0,
        "tempmin": 0.5
      }
    }
  ]
}
```

**Error Responses:**
- `400 Bad Request`: Missing or invalid forecast data
- `500 Internal Server Error`: API error

---

### GET /api/weather/climate/this-day/:location

Get historical weather data for this day in previous years.

**Parameters:**
- `location` (path): Location identifier
- `date` (query, optional): Date in MM-DD format (default: today)
- `years` (query, optional): Number of years (default: 10)

**Example Request:**
```
GET /api/weather/climate/this-day/Seattle,WA?date=11-07&years=10
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "location": {
    "address": "Seattle, WA, United States"
  },
  "date": "11-07",
  "historicalData": [
    {
      "year": 2024,
      "date": "2024-11-07",
      "temp": 11.0,
      "tempmax": 14.0,
      "tempmin": 8.0,
      "precip": 3.5,
      "conditions": "Rain, Overcast"
    }
  ],
  "statistics": {
    "avgTemp": 11.5,
    "avgHigh": 14.5,
    "avgLow": 8.0,
    "avgPrecip": 2.5,
    "recordHigh": 18.0,
    "recordLow": 4.0
  }
}
```

**Error Responses:**
- `400 Bad Request`: Invalid date or years
- `500 Internal Server Error`: API error

---

### GET /api/weather/climate/probability/:location

Get temperature probability distribution for a date range.

**Parameters:**
- `location` (path): Location identifier
- `start` (query): Start date (MM-DD)
- `end` (query): End date (MM-DD)
- `years` (query, optional): Years to analyze (default: 10)

**Example Request:**
```
GET /api/weather/climate/probability/Seattle,WA?start=11-01&end=11-30&years=10
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "location": {
    "address": "Seattle, WA, United States"
  },
  "dateRange": {
    "start": "11-01",
    "end": "11-30"
  },
  "probability": {
    "bins": [
      { "range": "< 0°C", "probability": 5 },
      { "range": "0-5°C", "probability": 15 },
      { "range": "5-10°C", "probability": 30 },
      { "range": "10-15°C", "probability": 35 },
      { "range": "> 15°C", "probability": 15 }
    ],
    "mean": 10.5,
    "median": 11.0,
    "stdDev": 3.5
  }
}
```

**Error Responses:**
- `400 Bad Request`: Invalid dates
- `500 Internal Server Error`: API error

---

## Locations

### GET /api/locations/geocode?q={query}

Search for locations by name (autocomplete).

**Query Parameters:**
- `q` (required): Search query (city name, address)
- `limit` (optional): Max results (default: 5)

**Example Request:**
```
GET /api/locations/geocode?q=Seattle&limit=5
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "results": [
    {
      "name": "Seattle",
      "state": "Washington",
      "country": "United States",
      "latitude": 47.6062,
      "longitude": -122.3321,
      "display_name": "Seattle, Washington, United States"
    }
  ]
}
```

**Error Responses:**
- `400 Bad Request`: Missing query parameter
- `404 Not Found`: No locations found
- `500 Internal Server Error`: API error

---

### GET /api/locations/reverse?lat={latitude}&lon={longitude}

Reverse geocode coordinates to location name.

**Query Parameters:**
- `lat` (required): Latitude
- `lon` (required): Longitude

**Example Request:**
```
GET /api/locations/reverse?lat=47.6062&lon=-122.3321
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "location": {
    "name": "Seattle",
    "state": "Washington",
    "country": "United States",
    "latitude": 47.6062,
    "longitude": -122.3321,
    "display_name": "Seattle, Washington, United States",
    "address": {
      "city": "Seattle",
      "state": "Washington",
      "country": "United States",
      "postcode": "98101"
    }
  }
}
```

**Error Responses:**
- `400 Bad Request`: Missing or invalid coordinates
- `404 Not Found`: Location not found
- `500 Internal Server Error`: API error

---

### GET /api/locations/popular

Get list of popular/pre-populated locations.

**Success Response (200 OK):**
```json
{
  "success": true,
  "locations": [
    {
      "id": 1,
      "city_name": "New York",
      "state": "New York",
      "country": "United States",
      "latitude": 40.7128,
      "longitude": -74.0060,
      "timezone": "America/New_York"
    }
  ],
  "count": 148
}
```

**Error Responses:**
- `500 Internal Server Error`: Database error

---

### GET /api/locations/search?q={query}

Search locations in database (FULLTEXT search).

**Query Parameters:**
- `q` (required): Search term
- `limit` (optional): Max results (default: 10)

**Example Request:**
```
GET /api/locations/search?q=Seattle&limit=5
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "results": [
    {
      "id": 45,
      "city_name": "Seattle",
      "state": "Washington",
      "country": "United States",
      "latitude": 47.6062,
      "longitude": -122.3321,
      "timezone": "America/Los_Angeles",
      "relevance": 0.95
    }
  ]
}
```

**Error Responses:**
- `400 Bad Request`: Missing query
- `404 Not Found`: No results
- `500 Internal Server Error`: Database error

---

### GET /api/locations/:id

Get location details by ID.

**Parameters:**
- `id` (path): Location ID

**Example Request:**
```
GET /api/locations/45
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "location": {
    "id": 45,
    "city_name": "Seattle",
    "state": "Washington",
    "country": "United States",
    "latitude": 47.6062,
    "longitude": -122.3321,
    "timezone": "America/Los_Angeles",
    "population": 737015,
    "elevation": 56
  }
}
```

**Error Responses:**
- `400 Bad Request`: Invalid ID
- `404 Not Found`: Location not found
- `500 Internal Server Error`: Database error

---

## Air Quality

### GET /api/air-quality?lat={latitude}&lon={longitude}

Get air quality data for coordinates.

**Query Parameters:**
- `lat` (required): Latitude
- `lon` (required): Longitude
- `days` (optional): Forecast days (default: 5, max: 5)

**Example Request:**
```
GET /api/air-quality?lat=47.6062&lon=-122.3321&days=5
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "location": {
    "latitude": 47.6062,
    "longitude": -122.3321
  },
  "current": {
    "time": "2025-11-07T12:00",
    "us_aqi": 45,
    "european_aqi": 18,
    "pm2_5": 10.5,
    "pm10": 18.2,
    "carbon_monoxide": 245.5,
    "nitrogen_dioxide": 12.8,
    "sulphur_dioxide": 3.2,
    "ozone": 65.3,
    "aqi_level": "Good",
    "aqi_color": "#00E400",
    "health_recommendation": "Air quality is satisfactory."
  },
  "forecast": [
    {
      "time": "2025-11-08T00:00",
      "us_aqi": 48,
      "pm2_5": 11.2
    }
  ]
}
```

**Error Responses:**
- `400 Bad Request`: Missing or invalid coordinates
- `500 Internal Server Error`: API error

---

### GET /api/air-quality/location/:location

Get air quality by location name.

**Parameters:**
- `location` (path): Location identifier

**Query Parameters:**
- `lat` (optional): Override latitude
- `lon` (optional): Override longitude
- `days` (optional): Forecast days (default: 5)

**Example Request:**
```
GET /api/air-quality/location/Seattle,WA?days=3
```

**Success Response:** Same as [GET /api/air-quality](#get-apiair-qualitylatlatitudelonlongitude)

**Error Responses:**
- `400 Bad Request`: Invalid location
- `500 Internal Server Error`: API error

---

## AI Features

### POST /api/ai-weather/validate

Validate if query is weather-related (quick validation).

**Request Body:**
```json
{
  "query": "Will it rain today?",
  "location": "Seattle, WA"
}
```

**Success Response (200 OK):**
```json
{
  "isValid": true,
  "reason": "Query is weather-related",
  "tokensUsed": 275
}
```

**Error Responses:**
- `400 Bad Request`: Missing query or location
- `408 Request Timeout`: Validation timeout (10s)
- `500 Internal Server Error`: API error

---

### POST /api/ai-weather/analyze

Analyze weather question with AI (full analysis).

**Request Body:**
```json
{
  "query": "Will it rain this weekend in Seattle?",
  "location": "Seattle, WA",
  "days": 7
}
```

**Success Response (200 OK):**
```json
{
  "answer": "Based on the forecast, Seattle will experience rain on Saturday with 80% chance of precipitation...",
  "confidence": "high",
  "tokensUsed": 825,
  "cost": "$0.0082",
  "weatherData": {
    "location": "Seattle, WA",
    "currentConditions": "Partly cloudy",
    "temperature": 12.5,
    "conditions": "Rain expected"
  }
}
```

**Error Responses:**
- `400 Bad Request`: Invalid query or location
- `408 Request Timeout`: Analysis timeout (20s overall, 30s total)
- `500 Internal Server Error`: API error

**Cost:** ~$0.005-0.01 per query

---

### POST /api/ai-location-finder/validate-query

Validate if query is climate-related (quick spam check).

**Request Body:**
```json
{
  "userInput": "I want somewhere warmer"
}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "isValid": true,
  "reason": "Query is climate-related",
  "tokensUsed": 275
}
```

**Error Responses:**
- `400 Bad Request`: Missing user input
- `500 Internal Server Error`: API error

**Cost:** ~$0.001 per query

---

### POST /api/ai-location-finder/parse-query

Parse natural language climate preferences with AI.

**Request Body:**
```json
{
  "userInput": "I want somewhere 15 degrees cooler from June-October, less humid, not rainy",
  "currentLocation": {
    "lat": 29.0258,
    "lng": -80.9270,
    "city": "New Smyrna Beach, FL"
  }
}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "criteria": {
    "current_location": "New Smyrna Beach, FL",
    "time_period": {
      "start": "June",
      "end": "October"
    },
    "temperature_delta": -15,
    "humidity": "lower",
    "precipitation": "less",
    "lifestyle_factors": [],
    "deal_breakers": []
  },
  "tokensUsed": 572,
  "cost": "$0.0051"
}
```

**Error Responses:**
- `400 Bad Request`: Missing user input
- `500 Internal Server Error`: API error

**Cost:** ~$0.005 per query

---

### POST /api/ai-weather/share

Create shareable link for AI answer.

**Request Body:**
```json
{
  "query": "Will it rain today?",
  "answer": "Based on the forecast...",
  "location": "Seattle, WA",
  "confidence": "high"
}
```

**Success Response (201 Created):**
```json
{
  "success": true,
  "shareId": "abc123xyz",
  "shareUrl": "https://meteo-beta.tachyonfuture.com/share/abc123xyz",
  "expiresAt": "2025-11-14T12:00:00.000Z"
}
```

**Error Responses:**
- `400 Bad Request`: Missing required fields
- `500 Internal Server Error`: Database error

---

## User Preferences

### GET /api/user/preferences

Get user preferences.

**Authentication:** Required (Bearer token)

**Success Response (200 OK):**
```json
{
  "preferences": {
    "temperature_unit": "celsius",
    "default_forecast_days": 7,
    "theme": "dark",
    "language": "en",
    "timezone": "America/Los_Angeles"
  }
}
```

**Error Responses:**
- `401 Unauthorized`: Missing or invalid token
- `500 Internal Server Error`: Database error

---

### PUT /api/user/preferences

Update user preferences.

**Authentication:** Required (Bearer token)

**Request Body:**
```json
{
  "temperature_unit": "fahrenheit",
  "default_forecast_days": 14,
  "theme": "light",
  "language": "en"
}
```

**Success Response (200 OK):**
```json
{
  "message": "Preferences updated successfully",
  "preferences": {
    "temperature_unit": "fahrenheit",
    "default_forecast_days": 14,
    "theme": "light",
    "language": "en"
  }
}
```

**Error Responses:**
- `400 Bad Request`: Invalid preference values
- `401 Unauthorized`: Missing or invalid token
- `500 Internal Server Error`: Database error

---

### GET /api/user/preferences/notifications

Get email notification settings.

**Authentication:** Required (Bearer token)

**Success Response (200 OK):**
```json
{
  "notifications": {
    "dailyReports": true,
    "weeklyReports": false,
    "weatherAlerts": true,
    "reportTime": "08:00",
    "reportLocations": [
      {
        "id": 1,
        "locationName": "Seattle, WA",
        "latitude": 47.6062,
        "longitude": -122.3321
      }
    ]
  }
}
```

**Error Responses:**
- `401 Unauthorized`: Missing or invalid token
- `500 Internal Server Error`: Database error

---

### PUT /api/user/preferences/notifications

Update email notification settings.

**Authentication:** Required (Bearer token)

**Request Body:**
```json
{
  "dailyReports": true,
  "weeklyReports": true,
  "weatherAlerts": true,
  "reportTime": "09:00",
  "reportLocations": [
    {
      "locationName": "Seattle, WA",
      "latitude": 47.6062,
      "longitude": -122.3321,
      "timezone": "America/Los_Angeles"
    }
  ]
}
```

**Success Response (200 OK):**
```json
{
  "message": "Notification settings updated successfully",
  "notifications": {
    "dailyReports": true,
    "weeklyReports": true,
    "weatherAlerts": true,
    "reportTime": "09:00"
  }
}
```

**Error Responses:**
- `400 Bad Request`: Invalid settings
- `401 Unauthorized`: Missing or invalid token
- `500 Internal Server Error`: Database error

---

## Favorites

### GET /api/user/favorites

Get user's favorite locations.

**Authentication:** Required (Bearer token)

**Success Response (200 OK):**
```json
{
  "favorites": [
    {
      "id": 1,
      "user_id": 123,
      "location_name": "Seattle, WA",
      "address": "Seattle, Washington, United States",
      "latitude": 47.6062,
      "longitude": -122.3321,
      "timezone": "America/Los_Angeles",
      "created_at": "2025-11-07T12:00:00.000Z"
    }
  ]
}
```

**Error Responses:**
- `401 Unauthorized`: Missing or invalid token
- `500 Internal Server Error`: Database error

---

### POST /api/user/favorites

Add location to favorites.

**Authentication:** Required (Bearer token)

**Request Body:**
```json
{
  "location_name": "Seattle, WA",
  "latitude": 47.6062,
  "longitude": -122.3321,
  "address": "Seattle, Washington, United States",
  "timezone": "America/Los_Angeles"
}
```

**Success Response (201 Created):**
```json
{
  "message": "Favorite added successfully",
  "favorite": {
    "id": 1,
    "location_name": "Seattle, WA",
    "latitude": 47.6062,
    "longitude": -122.3321
  }
}
```

**Error Responses:**
- `400 Bad Request`: Missing required fields
- `401 Unauthorized`: Missing or invalid token
- `409 Conflict`: Location already in favorites
- `500 Internal Server Error`: Database error

---

### DELETE /api/user/favorites/:id

Remove location from favorites.

**Authentication:** Required (Bearer token)

**Parameters:**
- `id` (path): Favorite ID

**Success Response (200 OK):**
```json
{
  "message": "Favorite removed successfully"
}
```

**Error Responses:**
- `401 Unauthorized`: Missing or invalid token
- `404 Not Found`: Favorite not found
- `500 Internal Server Error`: Database error

---

### POST /api/user/favorites/import

Import multiple favorites (e.g., from localStorage migration).

**Authentication:** Required (Bearer token)

**Request Body:**
```json
{
  "favorites": [
    {
      "location_name": "Seattle, WA",
      "latitude": 47.6062,
      "longitude": -122.3321,
      "address": "Seattle, Washington, United States",
      "timezone": "America/Los_Angeles"
    }
  ]
}
```

**Success Response (200 OK):**
```json
{
  "message": "Favorites imported successfully",
  "imported": 5,
  "skipped": 2,
  "total": 7
}
```

**Error Responses:**
- `400 Bad Request`: Invalid favorites array
- `401 Unauthorized`: Missing or invalid token
- `500 Internal Server Error`: Database error

---

## Cache Management

### GET /api/cache/stats

Get cache statistics.

**Success Response (200 OK):**
```json
{
  "totalEntries": 1234,
  "hitRate": 0.99,
  "missRate": 0.01,
  "totalHits": 9876,
  "totalMisses": 124,
  "avgResponseTime": "3ms",
  "cacheSize": "15.5 MB",
  "oldestEntry": "2025-11-01T12:00:00.000Z",
  "newestEntry": "2025-11-07T12:00:00.000Z"
}
```

**Error Responses:**
- `500 Internal Server Error`: Database error

---

### DELETE /api/cache/expired

Clear expired cache entries.

**Success Response (200 OK):**
```json
{
  "message": "Expired cache entries cleared",
  "deletedCount": 45
}
```

**Error Responses:**
- `500 Internal Server Error`: Database error

---

### DELETE /api/cache/location/:id

Clear all cache for a specific location.

**Parameters:**
- `id` (path): Location ID

**Success Response (200 OK):**
```json
{
  "message": "Location cache cleared",
  "deletedCount": 12
}
```

**Error Responses:**
- `400 Bad Request`: Invalid location ID
- `500 Internal Server Error`: Database error

---

## Error Response Format

All error responses follow this standard format:

```json
{
  "success": false,
  "error": "Error message description",
  "code": "ERROR_CODE",
  "details": {
    "field": "Additional context"
  }
}
```

**Common Error Codes:**
- `INVALID_REQUEST`: Malformed request body or parameters
- `UNAUTHORIZED`: Missing or invalid authentication token
- `FORBIDDEN`: Insufficient permissions
- `NOT_FOUND`: Resource not found
- `CONFLICT`: Resource already exists
- `VALIDATION_ERROR`: Input validation failed
- `RATE_LIMIT_EXCEEDED`: Too many requests
- `INTERNAL_ERROR`: Server error
- `EXTERNAL_API_ERROR`: Third-party API error

---

## Rate Limiting

The API implements rate limiting to prevent abuse:

**Limits:**
- **General API:** 100 requests per 15 minutes per IP
- **Authentication endpoints:** 5 requests per 15 minutes per IP
- **AI endpoints:** 10 requests per hour per user

**Rate Limit Headers:**
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1699368000
```

**Rate Limit Exceeded Response (429):**
```json
{
  "success": false,
  "error": "Rate limit exceeded. Please try again later.",
  "retryAfter": 300
}
```

---

## Authentication

Most endpoints require JWT authentication. Include the access token in the `Authorization` header:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Token Expiration:**
- Access Token: 24 hours
- Refresh Token: 7 days

**Token Refresh:** Use [POST /api/auth/refresh](#post-apiauthrefresh) to obtain a new access token.

---

## Caching

The API implements MySQL-based caching for external API calls:

**Cache Hit Response Example:**
```json
{
  "success": true,
  "data": { ... },
  "cacheStatus": "hit",
  "cacheAge": "5 minutes"
}
```

**Cache Miss Response Example:**
```json
{
  "success": true,
  "data": { ... },
  "cacheStatus": "miss",
  "queryCost": 1
}
```

**Cache TTL:**
- Current Weather: 30 minutes
- Forecasts: 6 hours
- Historical Data: 7 days
- Air Quality: 60 minutes
- Climate Stats: 30 days

---

## Pagination

Some endpoints support pagination:

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Results per page (default: 20, max: 100)

**Paginated Response Example:**
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8,
    "hasNext": true,
    "hasPrev": false
  }
}
```

---

## CORS

The API supports Cross-Origin Resource Sharing (CORS) for allowed origins:

**Allowed Origins (Development):**
- `http://localhost:3000`
- `http://localhost:3001`

**Allowed Origins (Production):**
- `https://meteo-beta.tachyonfuture.com`

---

## Changelog

**November 7, 2025:**
- Initial API documentation created
- Documented all 12 route modules
- Added examples for all endpoints
- Documented authentication and rate limiting

---

## Support

For API questions or issues:
- **Documentation:** [docs/README.md](../README.md)
- **GitHub Issues:** [github.com/mbuckingham74/meteo-weather/issues](https://github.com/mbuckingham74/meteo-weather/issues)
- **Email:** michael.buckingham74@gmail.com

---

**Last Updated:** November 7, 2025
**API Version:** 1.0
**Maintained by:** Michael Buckingham
