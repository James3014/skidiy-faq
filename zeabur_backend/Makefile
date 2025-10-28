.PHONY: validate start-frontend start-backend test help

# Default target
help:
	@echo "FAQ System Upgrade - Available Commands:"
	@echo ""
	@echo "  make validate        - Validate FAQ data against JSON Schema"
	@echo "  make start-frontend  - Start frontend server on port 8080"
	@echo "  make start-backend   - Start backend API server on port 3000"
	@echo "  make test            - Run all tests (unit + integration)"
	@echo "  make help            - Show this help message"
	@echo ""

# Validate FAQ data against JSON Schema
validate:
	@echo "Validating FAQ data..."
	@node scripts/validate-faq-schema.js

# Start frontend server
start-frontend:
	@echo "Starting frontend server on http://localhost:8080"
	@cd frontend && python3 -m http.server 8080

# Start backend API server
start-backend:
	@echo "Starting backend API server on http://localhost:3000"
	@cd backend && npm run dev

# Run all tests
test:
	@echo "Running tests..."
	@cd backend && npm test

# Development mode (nodemon)
dev:
	@cd backend && npm run dev

# Install dependencies
install:
	@echo "Installing backend dependencies..."
	@cd backend && npm install

# Clean build artifacts
clean:
	@echo "Cleaning build artifacts..."
	@rm -rf backend/node_modules
	@rm -rf backend/coverage
	@rm -f data/analytics.db
	@rm -f data/analytics.db-shm
	@rm -f data/analytics.db-wal

# Generate FAQ insights summary
analytics-summary:
	@echo "Generating FAQ insights summary..."
	@cd apps/analytics-worker && node src/index.js
