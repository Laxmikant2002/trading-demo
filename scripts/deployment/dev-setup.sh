#!/bin/bash

# XPro Trading Platform - Development Environment Setup
# This script sets up the complete development environment using Docker Compose

set -e

echo "🚀 Setting up XPro Trading Platform - Development Environment"
echo "=========================================================="

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

# Check if Docker is installed and running
check_docker() {
    print_status "Checking Docker installation..."
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker Desktop for Windows."
        exit 1
    fi

    if ! docker info &> /dev/null; then
        print_error "Docker is not running. Please start Docker Desktop."
        exit 1
    fi

    print_success "Docker is installed and running"
}

# Check if Docker Compose is available
check_docker_compose() {
    print_status "Checking Docker Compose..."
    if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
        print_error "Docker Compose is not available."
        exit 1
    fi
    print_success "Docker Compose is available"
}

# Clean up existing containers and volumes (optional)
cleanup() {
    print_status "Cleaning up existing containers and volumes..."
    docker-compose down -v --remove-orphans 2>/dev/null || true
    print_success "Cleanup completed"
}

# Build and start services
start_services() {
    print_status "Building and starting services..."

    # Build images
    docker-compose build --no-cache

    # Start services
    docker-compose up -d

    print_success "Services started successfully"
}

# Wait for services to be healthy
wait_for_services() {
    print_status "Waiting for services to be healthy..."

    # Wait for PostgreSQL
    print_status "Waiting for PostgreSQL..."
    timeout=60
    while [ $timeout -gt 0 ]; do
        if docker-compose exec -T postgres pg_isready -U postgres -h localhost &>/dev/null; then
            break
        fi
        sleep 2
        timeout=$((timeout - 2))
    done

    if [ $timeout -le 0 ]; then
        print_error "PostgreSQL failed to start"
        exit 1
    fi
    print_success "PostgreSQL is ready"

    # Wait for Redis
    print_status "Waiting for Redis..."
    timeout=30
    while [ $timeout -gt 0 ]; do
        if docker-compose exec -T redis redis-cli ping | grep -q PONG; then
            break
        fi
        sleep 2
        timeout=$((timeout - 2))
    done

    if [ $timeout -le 0 ]; then
        print_error "Redis failed to start"
        exit 1
    fi
    print_success "Redis is ready"

    # Wait for Node.js API
    print_status "Waiting for Node.js API..."
    timeout=60
    while [ $timeout -gt 0 ]; do
        if curl -f http://localhost:3001/health &>/dev/null; then
            break
        fi
        sleep 2
        timeout=$((timeout - 2))
    done

    if [ $timeout -le 0 ]; then
        print_warning "Node.js API health check failed, but continuing..."
    else
        print_success "Node.js API is ready"
    fi

    # Wait for Python Trading Engine
    print_status "Waiting for Python Trading Engine..."
    timeout=60
    while [ $timeout -gt 0 ]; do
        if curl -f http://localhost:8000/health &>/dev/null; then
            break
        fi
        sleep 2
        timeout=$((timeout - 2))
    done

    if [ $timeout -le 0 ]; then
        print_warning "Python Trading Engine health check failed, but continuing..."
    else
        print_success "Python Trading Engine is ready"
    fi
}

# Run database migrations
run_migrations() {
    print_status "Running database migrations..."

    # Generate Prisma client
    docker-compose exec -T node-api npx prisma generate

    # Run migrations
    docker-compose exec -T node-api npx prisma migrate deploy

    print_success "Database migrations completed"
}

# Seed the database
seed_database() {
    print_status "Seeding database with initial data..."

    # Run seed script
    docker-compose exec -T node-api npm run seed

    print_success "Database seeding completed"
}

# Run tests
run_tests() {
    print_status "Running test suite..."

    # Run Node.js tests
    docker-compose exec -T node-api npm test

    # Run Python tests
    docker-compose exec -T python-engine python -m pytest tests/ -v

    print_success "All tests passed"
}

# Display service information
show_info() {
    echo ""
    echo "🎉 Development environment is ready!"
    echo "====================================="
    echo ""
    echo "Services running:"
    echo "• PostgreSQL: localhost:5432"
    echo "• Redis: localhost:6379"
    echo "• Node.js API: http://localhost:3001"
    echo "• Python Trading Engine: http://localhost:8000"
    echo "• Nginx (Reverse Proxy): http://localhost:8080"
    echo "• WebSocket: ws://localhost:8080"
    echo ""
    echo "Useful commands:"
    echo "• View logs: docker-compose logs -f"
    echo "• Stop services: docker-compose down"
    echo "• Restart services: docker-compose restart"
    echo "• Run tests: docker-compose exec node-api npm test"
    echo ""
    echo "API Documentation:"
    echo "• Swagger UI: http://localhost:3001/api-docs"
    echo ""
}

# Main execution
main() {
    check_docker
    check_docker_compose

    # Ask user if they want to clean up
    read -p "Do you want to clean up existing containers and volumes? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        cleanup
    fi

    start_services
    wait_for_services
    run_migrations
    seed_database

    # Ask user if they want to run tests
    read -p "Do you want to run the test suite? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        run_tests
    fi

    show_info
}

# Run main function
main "$@"