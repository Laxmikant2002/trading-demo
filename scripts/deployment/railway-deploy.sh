#!/bin/bash

# XPro Trading Platform - Railway Deployment Script
# This script helps deploy to Railway for simpler cloud hosting

set -e

echo "🚂 XPro Trading Platform - Railway Deployment"
echo "============================================="

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

# Check Railway CLI
check_railway_cli() {
    print_status "Checking Railway CLI..."

    if ! command -v railway &> /dev/null; then
        print_error "Railway CLI is not installed."
        echo "Install it with: npm install -g @railway/cli"
        exit 1
    fi

    if ! railway status &> /dev/null; then
        print_error "Not logged in to Railway. Please run 'railway login' first."
        exit 1
    fi

    print_success "Railway CLI is configured"
}

# Create Railway project
create_project() {
    print_status "Creating Railway project..."

    PROJECT_NAME="xpro-trading-${ENVIRONMENT:-production}"

    # Create new project
    railway init --name $PROJECT_NAME --source . --yes

    print_success "Railway project created: $PROJECT_NAME"
}

# Configure environment variables
configure_environment() {
    print_status "Configuring environment variables..."

    # Database URL (Railway will provide PostgreSQL)
    railway variables set DATABASE_URL "\${{ PostgreSQL.DATABASE_URL }}"

    # Redis URL (Railway will provide Redis)
    railway variables set REDIS_URL "\${{ Redis.DATABASE_URL }}"

    # JWT Secret
    JWT_SECRET=$(openssl rand -base64 32)
    railway variables set JWT_SECRET "$JWT_SECRET"

    # Node environment
    railway variables set NODE_ENV "production"

    # CORS origin
    if [ -n "$DOMAIN" ]; then
        railway variables set CORS_ORIGIN "https://$DOMAIN"
    fi

    # Log level
    railway variables set LOG_LEVEL "info"

    print_success "Environment variables configured"
    print_warning "JWT Secret: $JWT_SECRET (save this securely!)"
}

# Configure services
configure_services() {
    print_status "Configuring Railway services..."

    # Add PostgreSQL database
    railway add postgresql

    # Add Redis
    railway add redis

    # Configure build settings
    railway domain --generate

    print_success "Services configured"
}

# Deploy application
deploy_app() {
    print_status "Deploying application..."

    # Deploy to Railway
    railway up

    print_success "Application deployed to Railway"
}

# Setup custom domain (optional)
setup_domain() {
    if [ -n "$DOMAIN" ]; then
        print_status "Setting up custom domain..."

        railway domain add $DOMAIN

        print_success "Custom domain configured: $DOMAIN"
        print_status "Don't forget to update your DNS records to point to Railway!"
    fi
}

# Display deployment information
show_info() {
    echo ""
    echo "🎉 Railway deployment completed!"
    echo "=================================="
    echo ""
    echo "Useful commands:"
    echo "• Check status: railway status"
    echo "• View logs: railway logs"
    echo "• Open dashboard: railway open"
    echo "• Update environment: railway variables set KEY value"
    echo ""
    echo "Railway Services:"
    echo "• PostgreSQL database"
    echo "• Redis cache"
    echo "• Automatic SSL certificates"
    echo "• Global CDN"
    echo "• Automatic scaling"
    echo ""
    echo "Next steps:"
    if [ -z "$DOMAIN" ]; then
        echo "1. Set up a custom domain: railway domain add yourdomain.com"
        echo "2. Update DNS records to point to Railway"
    fi
    echo "3. Configure monitoring and alerts in Railway dashboard"
    echo "4. Set up backup policies for your database"
    echo ""
}

# Main execution
main() {
    check_railway_cli

    # Get environment and domain
    ENVIRONMENT="${ENVIRONMENT:-production}"
    read -p "Enter your domain name (optional): " DOMAIN

    create_project
    configure_environment
    configure_services
    deploy_app
    setup_domain

    show_info
}

# Run main function
main "$@"