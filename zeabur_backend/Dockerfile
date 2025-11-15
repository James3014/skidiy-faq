# FAQ System Backend
FROM node:22-slim

WORKDIR /app

# Copy package files
COPY backend/package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY backend/src ./src
COPY backend/.env.example ./.env.example

# Copy data directory (includes JSON files and initial database)
COPY zeabur_backend/data ./data

# Set environment variables
# SQLITE_DB_PATH must be absolute path to prevent __dirname resolution issues
ENV NODE_ENV=production \
    PORT=8080 \
    SQLITE_DB_PATH=/app/data/analytics.db

# Expose port
EXPOSE 8080

# Create data directory with proper permissions
RUN mkdir -p /app/data && chmod 755 /app/data

# Start server
CMD ["node", "src/server.js"]
