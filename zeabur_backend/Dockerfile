# FAQ System Backend
FROM node:22-slim

WORKDIR /app

# Copy everything from zeabur_backend
COPY . .

# Install dependencies in backend directory
WORKDIR /app/backend
RUN npm ci --only=production

# Set environment variables
ENV NODE_ENV=production \
    PORT=8080 \
    FAQ_DATA_DIR=/app/data

# Expose port
EXPOSE 8080

# Start server
CMD ["node", "src/server.js"]
