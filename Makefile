# HRM System Makefile
# Provides convenient commands for development and deployment

.PHONY: help install dev build test clean docker-up docker-down docker-build docker-logs seed

# Default target
help:
	@echo "HRM System - Available Commands:"
	@echo ""
	@echo "Development:"
	@echo "  install     Install all dependencies"
	@echo "  dev         Start development servers"
	@echo "  build       Build all applications"
	@echo "  test        Run all tests"
	@echo "  clean       Clean build artifacts"
	@echo ""
	@echo "Docker:"
	@echo "  docker-up   Start all services with Docker"
	@echo "  docker-down Stop all Docker services"
	@echo "  docker-build Build and start Docker services"
	@echo "  docker-logs Show Docker service logs"
	@echo ""
	@echo "Database:"
	@echo "  seed        Seed the database with initial data"
	@echo ""
	@echo "Utilities:"
	@echo "  setup       Run full setup (install + build + seed)"
	@echo "  status      Show service status"

# Install all dependencies
install:
	@echo "Installing root dependencies..."
	npm install
	@echo "Installing backend dependencies..."
	cd backend && npm install
	@echo "Installing frontend dependencies..."
	cd frontend && npm install

# Start development servers
dev:
	@echo "Starting development servers..."
	npm run dev

# Build all applications
build:
	@echo "Building backend..."
	cd backend && npm run build
	@echo "Building frontend..."
	cd frontend && npm run build

# Run all tests
test:
	@echo "Running backend tests..."
	cd backend && npm run test
	@echo "Running frontend tests..."
	cd frontend && npm run test

# Clean build artifacts
clean:
	@echo "Cleaning build artifacts..."
	rm -rf backend/dist
	rm -rf frontend/dist
	rm -rf backend/node_modules
	rm -rf frontend/node_modules
	rm -rf node_modules

# Docker commands
docker-up:
	@echo "Starting Docker services..."
	docker-compose up -d

docker-down:
	@echo "Stopping Docker services..."
	docker-compose down

docker-build:
	@echo "Building and starting Docker services..."
	docker-compose up -d --build

docker-logs:
	@echo "Showing Docker service logs..."
	docker-compose logs -f

# Database commands
seed:
	@echo "Seeding database..."
	cd backend && npm run seed

# Full setup
setup: install build seed
	@echo "Setup complete!"

# Show service status
status:
	@echo "Service Status:"
	docker-compose ps

# Development shortcuts
dev-backend:
	@echo "Starting backend development server..."
	cd backend && npm run start:dev

dev-frontend:
	@echo "Starting frontend development server..."
	cd frontend && npm run dev

# Production commands
prod-build:
	@echo "Building for production..."
	docker-compose -f docker-compose.yml build

prod-up:
	@echo "Starting production services..."
	docker-compose -f docker-compose.yml up -d

# Database management
db-reset:
	@echo "Resetting database..."
	docker-compose down -v
	docker-compose up -d postgres
	sleep 10
	cd backend && npm run seed

# Backup and restore
backup:
	@echo "Creating database backup..."
	docker-compose exec postgres pg_dump -U postgres hrm_db > backup_$(shell date +%Y%m%d_%H%M%S).sql

restore:
	@echo "Restoring database from backup..."
	@read -p "Enter backup filename: " file; \
	docker-compose exec -T postgres psql -U postgres hrm_db < $$file
