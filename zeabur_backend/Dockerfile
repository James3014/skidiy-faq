# FAQ System Backend
FROM node:22-slim

WORKDIR /app

# Copy package files (paths relative to repository root)
COPY zeabur_backend/backend/package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY zeabur_backend/backend/src ./src
COPY zeabur_backend/backend/.env.example ./.env.example

# Copy data directory to match backend path resolution
# Backend uses: path.join(__dirname, '../../../data/') from /app/src/routes/
# This resolves to /data/ in container, so we copy there
# Force rebuild: 2026-01-07
COPY zeabur_backend/data /data

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
