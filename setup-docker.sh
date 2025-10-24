#!/bin/bash

# HRM System Docker Setup Script
# This script sets up the HRM system using Docker

set -e

echo "🐳 HRM System Docker Setup"
echo "=========================="

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

# Check if Docker is installed
check_docker() {
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker from https://docs.docker.com/get-docker/"
        exit 1
    fi
    print_success "Docker $(docker --version) is installed"
}

# Check if Docker Compose is installed
check_docker_compose() {
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed. Please install Docker Compose from https://docs.docker.com/compose/install/"
        exit 1
    fi
    print_success "Docker Compose $(docker-compose --version) is installed"
}

# Check if Docker daemon is running
check_docker_daemon() {
    if ! docker info &> /dev/null; then
        print_error "Docker daemon is not running. Please start Docker."
        exit 1
    fi
    print_success "Docker daemon is running"
}

# Create necessary directories
create_directories() {
    print_status "Creating necessary directories..."
    
    mkdir -p backend/uploads
    mkdir -p postgres_data
    
    print_success "Directories created"
}

# Build and start services
start_services() {
    print_status "Building and starting services..."
    
    # Build and start all services
    docker-compose up -d --build
    
    print_success "Services started"
}

# Wait for services to be ready
wait_for_services() {
    print_status "Waiting for services to be ready..."
    
    # Wait for PostgreSQL
    print_status "Waiting for PostgreSQL..."
    timeout=60
    while ! docker-compose exec postgres pg_isready -U postgres &> /dev/null; do
        sleep 2
        timeout=$((timeout - 2))
        if [ $timeout -le 0 ]; then
            print_error "PostgreSQL failed to start within 60 seconds"
            exit 1
        fi
    done
    print_success "PostgreSQL is ready"
    
    # Wait for backend
    print_status "Waiting for backend..."
    timeout=60
    while ! curl -f http://localhost:3000/api/docs &> /dev/null; do
        sleep 2
        timeout=$((timeout - 2))
        if [ $timeout -le 0 ]; then
            print_error "Backend failed to start within 60 seconds"
            exit 1
        fi
    done
    print_success "Backend is ready"
    
    # Wait for frontend
    print_status "Waiting for frontend..."
    timeout=60
    while ! curl -f http://localhost:5173 &> /dev/null; do
        sleep 2
        timeout=$((timeout - 2))
        if [ $timeout -le 0 ]; then
            print_error "Frontend failed to start within 60 seconds"
            exit 1
        fi
    done
    print_success "Frontend is ready"
}

# Seed the database
seed_database() {
    print_status "Seeding the database..."
    
    # Wait a bit more for the backend to be fully ready
    sleep 10
    
    # Run the seed command
    docker-compose exec backend npm run seed
    
    print_success "Database seeded with initial data"
}

# Show service status
show_status() {
    print_status "Service Status:"
    echo
    docker-compose ps
    echo
}

# Show access information
show_access_info() {
    print_success "🎉 HRM System is ready!"
    echo
    echo "Access URLs:"
    echo "  Frontend:     http://localhost:5173"
    echo "  Backend API:  http://localhost:3000"
    echo "  API Docs:     http://localhost:3000/api/docs"
    echo "  Database:     localhost:5432"
    echo "  PgAdmin:      http://localhost:5050"
    echo
    echo "Default Login:"
    echo "  Email:    admin@company.com"
    echo "  Password: admin123"
    echo
    echo "PgAdmin Login:"
    echo "  Email:    admin@admin.com"
    echo "  Password: admin"
    echo
    echo "Useful Commands:"
    echo "  View logs:     docker-compose logs -f"
    echo "  Stop services: docker-compose down"
    echo "  Restart:       docker-compose restart"
    echo "  Rebuild:       docker-compose up -d --build"
}

# Cleanup function
cleanup() {
    print_status "Cleaning up..."
    docker-compose down
    print_success "Cleanup complete"
}

# Main setup function
main() {
    echo "Starting HRM System Docker setup..."
    echo
    
    # Check prerequisites
    check_docker
    check_docker_compose
    check_docker_daemon
    
    echo
    
    # Create directories
    create_directories
    
    echo
    
    # Start services
    start_services
    
    echo
    
    # Wait for services
    wait_for_services
    
    echo
    
    # Seed database
    seed_database
    
    echo
    
    # Show status
    show_status
    
    echo
    
    # Show access info
    show_access_info
}

# Handle script interruption
trap cleanup EXIT

# Parse command line arguments
case "${1:-}" in
    "cleanup")
        cleanup
        exit 0
        ;;
    "status")
        show_status
        exit 0
        ;;
    "logs")
        docker-compose logs -f
        exit 0
        ;;
    "restart")
        docker-compose restart
        exit 0
        ;;
    "rebuild")
        docker-compose down
        docker-compose up -d --build
        exit 0
        ;;
    *)
        main "$@"
        ;;
esac
