#!/bin/bash

# HRM System Setup Script
# This script sets up the HRM system for development

set -e

echo "🚀 HRM System Setup"
echo "=================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Node.js is installed
check_node() {
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js 18+ from https://nodejs.org/"
        exit 1
    fi
    
    NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        print_error "Node.js version 18+ is required. Current version: $(node -v)"
        exit 1
    fi
    
    print_success "Node.js $(node -v) is installed"
}

# Check if npm is installed
check_npm() {
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed"
        exit 1
    fi
    print_success "npm $(npm -v) is installed"
}

# Check if PostgreSQL is installed
check_postgres() {
    if ! command -v psql &> /dev/null; then
        print_warning "PostgreSQL is not installed. You can:"
        echo "  1. Install PostgreSQL locally"
        echo "  2. Use Docker for database only: docker run --name hrm-postgres -e POSTGRES_DB=hrm_db -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=password -p 5432:5432 -d postgres:15-alpine"
        echo "  3. Use the full Docker setup: docker-compose up -d"
        read -p "Do you want to continue without PostgreSQL? (y/n): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    else
        print_success "PostgreSQL is installed"
    fi
}

# Install dependencies
install_dependencies() {
    print_status "Installing root dependencies..."
    npm install
    
    print_status "Installing backend dependencies..."
    cd backend
    npm install
    cd ..
    
    print_status "Installing frontend dependencies..."
    cd frontend
    npm install
    cd ..
    
    print_success "All dependencies installed"
}

# Setup environment files
setup_environment() {
    print_status "Setting up environment files..."
    
    # Backend environment
    if [ ! -f backend/.env ]; then
        cp backend/env.example backend/.env
        print_success "Created backend/.env from template"
    else
        print_warning "backend/.env already exists"
    fi
    
    # Frontend environment
    if [ ! -f frontend/.env ]; then
        cp frontend/env.example frontend/.env
        print_success "Created frontend/.env from template"
    else
        print_warning "frontend/.env already exists"
    fi
}

# Setup database
setup_database() {
    print_status "Setting up database..."
    
    # Check if PostgreSQL is running
    if command -v psql &> /dev/null; then
        # Try to connect to PostgreSQL
        if psql -h localhost -U postgres -d postgres -c '\q' 2>/dev/null; then
            print_status "Creating database..."
            psql -h localhost -U postgres -c "CREATE DATABASE hrm_db;" 2>/dev/null || print_warning "Database might already exist"
            print_success "Database setup complete"
        else
            print_warning "Cannot connect to PostgreSQL. Please ensure it's running and accessible."
        fi
    else
        print_warning "PostgreSQL not available. Please set up the database manually or use Docker."
    fi
}

# Build applications
build_applications() {
    print_status "Building applications..."
    
    # Build backend
    cd backend
    npm run build
    cd ..
    
    # Build frontend
    cd frontend
    npm run build
    cd ..
    
    print_success "Applications built successfully"
}

# Run database migrations and seeds
setup_database_data() {
    print_status "Setting up database data..."
    
    cd backend
    
    # Run migrations (if available)
    if [ -f "src/migrations" ]; then
        npm run migration:run
    fi
    
    # Seed the database
    npm run seed
    
    cd ..
    
    print_success "Database seeded with initial data"
}

# Main setup function
main() {
    echo "Starting HRM System setup..."
    echo
    
    # Check prerequisites
    check_node
    check_npm
    check_postgres
    
    echo
    
    # Install dependencies
    install_dependencies
    
    echo
    
    # Setup environment
    setup_environment
    
    echo
    
    # Setup database
    setup_database
    
    echo
    
    # Build applications
    build_applications
    
    echo
    
    # Setup database data
    setup_database_data
    
    echo
    print_success "🎉 HRM System setup complete!"
    echo
    echo "Next steps:"
    echo "1. Start the backend: cd backend && npm run start:dev"
    echo "2. Start the frontend: cd frontend && npm run dev"
    echo "3. Access the application: http://localhost:5173"
    echo "4. Login with: admin@company.com / admin123"
    echo
    echo "Or use Docker: docker-compose up -d"
}

# Run main function
main "$@"
