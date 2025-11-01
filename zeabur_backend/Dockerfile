# Multi-stage build for FAQ System Backend
FROM node:22-slim AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Copy package files
COPY backend/package*.json ./
RUN npm ci --only=production

# Production stage
FROM base AS runner
WORKDIR /app

# Copy node_modules from deps
COPY --from=deps /app/node_modules ./node_modules

# Copy backend source code
COPY backend/src ./src
COPY backend/package*.json ./

# Copy data directory (contains faq_kb.json)
COPY data ../data

# Create directories for runtime data
RUN mkdir -p /data && \
    mkdir -p /data/backups && \
    chown -R node:node /data /app

# Use non-root user
USER node

# Expose port
EXPOSE 8080

# Set environment variables
ENV NODE_ENV=production \
    PORT=8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:8080/health', (r) => process.exit(r.statusCode === 200 ? 0 : 1))"

# Start the server
CMD ["node", "src/server.js"]
