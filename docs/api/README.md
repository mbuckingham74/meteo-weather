# API Documentation

Complete API documentation for Meteo Weather App with multiple formats for different use cases.

---

## 📚 Available Documentation Formats

### 1. **[API_REFERENCE.md](API_REFERENCE.md)** - Human-Readable Documentation
**Best for:** Reading, learning, understanding the API

- Complete endpoint documentation with examples
- Request/response payloads in JSON
- Authentication and rate limiting guides
- Error handling documentation
- Searchable markdown format
- **1,681 lines** of comprehensive docs

**Start here if you're new to the API!**

---

### 2. **[openapi.yaml](openapi.yaml)** - OpenAPI 3.0 Specification
**Best for:** Interactive API exploration, code generation, API tools

**Features:**
- Machine-readable API specification
- OpenAPI 3.0.3 compliant
- Complete schema definitions
- Request/response examples
- Authentication schemes

**How to use:**

#### Option A: Swagger UI (Interactive Documentation)
1. Go to [Swagger Editor](https://editor.swagger.io/)
2. Upload `openapi.yaml`
3. Click "Try it out" to test endpoints live!

#### Option B: Swagger UI (Local)
```bash
# Install Swagger UI globally
npm install -g swagger-ui-watcher

# Serve API docs
swagger-ui-watcher docs/api/openapi.yaml

# Open http://localhost:8080
```

#### Option C: Redoc (Beautiful Documentation)
```bash
# Install Redoc CLI
npm install -g redoc-cli

# Generate static HTML
redoc-cli bundle docs/api/openapi.yaml -o api-docs.html

# Open api-docs.html in browser
```

#### Option D: Code Generation
Generate client libraries in any language:
```bash
# Install OpenAPI Generator
npm install @openapitools/openapi-generator-cli -g

# Generate JavaScript client
openapi-generator-cli generate \
  -i docs/api/openapi.yaml \
  -g javascript \
  -o generated/js-client

# Generate Python client
openapi-generator-cli generate \
  -i docs/api/openapi.yaml \
  -g python \
  -o generated/python-client

# Generate TypeScript client
openapi-generator-cli generate \
  -i docs/api/openapi.yaml \
  -g typescript-axios \
  -o generated/ts-client
```

**Supported languages:** JavaScript, Python, Java, Go, Ruby, PHP, C#, Swift, Kotlin, and 50+ more!

---

### 3. **[postman_collection.json](postman_collection.json)** - Postman Collection
**Best for:** API testing, development, debugging

**Features:**
- All 60+ endpoints included
- Auto-authentication with test scripts
- Environment variable management
- Example requests with realistic data
- Ready to import into Postman

**How to use:**

#### Import into Postman
1. Open Postman
2. Click "Import" button
3. Select `docs/api/postman_collection.json`
4. Collection loads with all endpoints!

#### Set up Environment
Create a Postman environment with these variables:
```
baseUrl: http://localhost:5001/api (dev) or https://api.meteo-beta.tachyonfuture.com/api (prod)
accessToken: (leave empty - auto-filled after login)
refreshToken: (leave empty - auto-filled after login)
```

#### Usage Workflow
1. Run "Auth > Login" or "Auth > Register" first
2. Access token auto-populates from response
3. All subsequent requests use the token automatically
4. Test any endpoint with example data

#### Features
- **Auto-authentication:** Login sets token for all requests
- **Test scripts:** Validate responses automatically
- **Example data:** Realistic payloads for testing
- **Organized folders:** Endpoints grouped by category

---

## 🚀 Quick Start

### For API Consumers

**1. Start with the human-readable docs:**
```bash
# Read the API reference
open docs/api/API_REFERENCE.md
```

**2. Test endpoints with Postman:**
```bash
# Import Postman collection
# File → Import → docs/api/postman_collection.json
```

**3. Generate a client library:**
```bash
# Generate JavaScript client from OpenAPI spec
openapi-generator-cli generate \
  -i docs/api/openapi.yaml \
  -g javascript \
  -o my-weather-client
```

### For API Developers

**1. Update the OpenAPI spec when adding endpoints:**
```yaml
# Edit docs/api/openapi.yaml
paths:
  /your/new/endpoint:
    get:
      tags: [Your Category]
      summary: Your endpoint description
      # ... rest of definition
```

**2. Regenerate documentation:**
```bash
# Update API_REFERENCE.md manually (or use tooling)
# Update Postman collection (export from Postman)
```

**3. Validate OpenAPI spec:**
```bash
# Install validator
npm install -g @apidevtools/swagger-cli

# Validate spec
swagger-cli validate docs/api/openapi.yaml
```

---

## 📖 Documentation Comparison

| Format | Best For | Interactive | Code Gen | Searchable |
|--------|----------|-------------|----------|------------|
| **API_REFERENCE.md** | Learning, reading | ❌ | ❌ | ✅ |
| **openapi.yaml** | Tools, automation | ✅ (via Swagger UI) | ✅ | ❌ |
| **postman_collection.json** | Testing, debugging | ✅ | ❌ | ✅ (in Postman) |

**Recommendation:**
- **New to the API?** Start with [API_REFERENCE.md](API_REFERENCE.md)
- **Building an integration?** Use [openapi.yaml](openapi.yaml) to generate a client
- **Testing endpoints?** Import [postman_collection.json](postman_collection.json)

---

## 🔗 API Endpoints Overview

### Categories

- **Authentication** (6 endpoints) - User registration, login, profile management
- **Weather** (4 endpoints) - Current weather, forecasts, alerts
- **Climate Data** (5 endpoints) - Historical data, climate normals, records
- **Locations** (5 endpoints) - Search, geocoding, reverse geocoding
- **Air Quality** (2 endpoints) - AQI data by coordinates or location
- **AI Features** (4 endpoints) - AI weather questions, location finder
- **User Preferences** (4 endpoints) - Settings, notifications
- **Favorites** (4 endpoints) - Saved locations management
- **Cache** (3 endpoints) - Cache statistics and management

**Total:** 37+ documented endpoints (60+ including all variations)

---

## 🛠️ Tools & Resources

### Interactive Documentation
- [Swagger Editor](https://editor.swagger.io/) - Edit and test OpenAPI specs
- [Swagger UI](https://swagger.io/tools/swagger-ui/) - Beautiful interactive docs
- [Redoc](https://redoc.ly/) - Three-panel API documentation
- [Postman](https://www.postman.com/) - API testing and development

### Code Generation
- [OpenAPI Generator](https://openapi-generator.tech/) - Generate clients in 50+ languages
- [Swagger Codegen](https://swagger.io/tools/swagger-codegen/) - Alternative code generator
- [AutoRest](https://github.com/Azure/autorest) - Microsoft's code generator

### Validation & Testing
- [Swagger CLI](https://github.com/APIDevTools/swagger-cli) - Validate OpenAPI specs
- [Spectral](https://stoplight.io/open-source/spectral) - OpenAPI linter
- [Dredd](https://dredd.org/) - API testing against OpenAPI specs

---

## 📚 Additional Resources

### Related Documentation
- [Getting Started Guide](../getting-started/QUICKSTART.md) - Set up the app
- [Authentication Guide](../../SECURITY.md) - Security and auth details
- [Database Schema](../database/SCHEMA.md) - Database structure
- [Deployment Guide](../deployment/DEPLOYMENT_GUIDE.md) - Deploy to production

### External APIs Used
- [Visual Crossing Weather API](https://www.visualcrossing.com/weather-api) - Primary weather data
- [OpenWeather API](https://openweathermap.org/api) - Radar overlays
- [Anthropic Claude API](https://console.anthropic.com/) - AI features

---

## 🤝 Contributing

Help us improve the API documentation!

**To add new endpoints:**
1. Update [openapi.yaml](openapi.yaml) with new endpoint definition
2. Update [API_REFERENCE.md](API_REFERENCE.md) with examples
3. Add to [postman_collection.json](postman_collection.json)
4. Submit a pull request

**To report issues:**
- Incorrect documentation: [Open an issue](https://github.com/mbuckingham74/meteo-weather/issues)
- Missing examples: [Submit a PR](https://github.com/mbuckingham74/meteo-weather/pulls)
- Typos or unclear docs: [Quick fix PR](https://github.com/mbuckingham74/meteo-weather)

---

## ⚡ Quick Links

- **Live API:** [https://api.meteo-beta.tachyonfuture.com/api](https://api.meteo-beta.tachyonfuture.com/api)
- **Health Check:** [https://api.meteo-beta.tachyonfuture.com/api/health](https://api.meteo-beta.tachyonfuture.com/api/health)
- **GitHub Repository:** [https://github.com/mbuckingham74/meteo-weather](https://github.com/mbuckingham74/meteo-weather)
- **Live Demo:** [https://meteo-beta.tachyonfuture.com](https://meteo-beta.tachyonfuture.com)

---

**Last Updated:** November 7, 2025
**API Version:** 1.0
**Maintained by:** Michael Buckingham
