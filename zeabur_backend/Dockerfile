# FAQ System Backend - Zeabur Optimized
FROM node:22-slim

# Set working directory
WORKDIR /src

# Copy package files
COPY backend/package*.json ./
RUN npm ci --only=production

# Copy backend source
COPY backend/src ./src

# Copy data directory (faq_kb.json)
COPY data /data

# Create backup directory
RUN mkdir -p /data/backups && chmod 777 /data/backups

# Expose port
EXPOSE 8080

# Environment variables
ENV NODE_ENV=production \
    PORT=8080 \
    FAQ_DATA_DIR=/data

# Start server
CMD ["node", "src/server.js"]
