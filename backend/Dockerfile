FROM node:24-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (use ci for production, clean install)
RUN npm ci --only=production

# Copy application code
COPY . .

# Set environment variables
ENV PORT=5001
ENV NODE_ENV=production

# Expose port
EXPOSE 5001

# Add health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5001/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Run in production mode
CMD ["npm", "start"]
