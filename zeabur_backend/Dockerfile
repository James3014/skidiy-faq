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

# Copy data directory if it exists
COPY data ./data || true

# Set environment variables
ENV NODE_ENV=production \
    PORT=8080

# Expose port
EXPOSE 8080

# Start server
CMD ["node", "src/server.js"]
