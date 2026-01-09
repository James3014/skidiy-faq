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

# Copy FAQ data to /app/faq_data (separate from Volume at /data)
# Volume at /data is for analytics.db only
COPY zeabur_backend/data /app/faq_data
RUN ls -la /app/faq_data && head -c 500 /app/faq_data/faq_kb.phase0a.json

# Set environment variables
# SQLITE_DB_PATH must be absolute path to prevent __dirname resolution issues
ENV NODE_ENV=production \
    PORT=8080 \
    SQLITE_DB_PATH=/data/analytics.db \
    FAQ_DATA_PATH=/app/faq_data/faq_kb.phase0a.json \
    FAQ_DATA_DIR=/app/faq_data

# Expose port
EXPOSE 8080

# Start server
CMD ["node", "src/server.js"]
