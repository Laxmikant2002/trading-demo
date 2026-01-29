#!/bin/bash

# XPro Trading Platform - Production Deployment Script
# This script handles production deployment with PM2, nginx, SSL, and monitoring

set -e

echo "🚀 XPro Trading Platform - Production Deployment"
echo "==============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
DOMAIN="${DOMAIN:-yourdomain.com}"
EMAIL="${EMAIL:-admin@yourdomain.com}"
NODE_ENV="production"

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

# Check if running as root or with sudo
check_permissions() {
    if [ "$EUID" -ne 0 ]; then
        print_error "Please run this script with sudo privileges"
        echo "Usage: sudo $0"
        exit 1
    fi
}

# Check system requirements
check_system() {
    print_status "Checking system requirements..."

    # Check OS
    if [[ "$OSTYPE" != "linux-gnu"* ]]; then
        print_error "This script is designed for Linux systems"
        exit 1
    fi

    # Check if Node.js is installed
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed"
        exit 1
    fi

    # Check if PM2 is installed
    if ! command -v pm2 &> /dev/null; then
        print_error "PM2 is not installed. Install with: npm install -g pm2"
        exit 1
    fi

    # Check if nginx is installed
    if ! command -v nginx &> /dev/null; then
        print_error "nginx is not installed"
        exit 1
    fi

    # Check if certbot is installed
    if ! command -v certbot &> /dev/null; then
        print_warning "certbot is not installed. SSL certificates will not be automatically obtained."
        echo "Install with: apt install certbot python3-certbot-nginx"
    fi

    print_success "System requirements check passed"
}

# Install system dependencies
install_dependencies() {
    print_status "Installing system dependencies..."

    # Update package list
    apt update

    # Install required packages
    apt install -y curl wget git build-essential postgresql-client redis-tools

    # Install Node.js (if not already installed)
    if ! command -v node &> /dev/null; then
        curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
        apt install -y nodejs
    fi

    # Install PM2 globally
    if ! command -v pm2 &> /dev/null; then
        npm install -g pm2
    fi

    # Install nginx
    if ! command -v nginx &> /dev/null; then
        apt install -y nginx
    fi

    # Install certbot for SSL
    if ! command -v certbot &> /dev/null; then
        apt install -y certbot python3-certbot-nginx
    fi

    print_success "Dependencies installed"
}

# Setup application directory
setup_app_directory() {
    print_status "Setting up application directory..."

    # Create application directory
    mkdir -p /var/www/xpro-trading
    chown -R $SUDO_USER:$SUDO_USER /var/www/xpro-trading

    # Create logs directory
    mkdir -p /var/www/xpro-trading/logs
    chown -R $SUDO_USER:$SUDO_USER /var/www/xpro-trading/logs

    print_success "Application directory created"
}

# Configure nginx
configure_nginx() {
    print_status "Configuring nginx..."

    # Copy nginx configuration
    cp nginx/nginx.conf /etc/nginx/sites-available/xpro-trading

    # Update domain in nginx config
    sed -i "s/yourdomain.com/$DOMAIN/g" /etc/nginx/sites-available/xpro-trading

    # Enable site
    ln -sf /etc/nginx/sites-available/xpro-trading /etc/nginx/sites-enabled/

    # Remove default site
    rm -f /etc/nginx/sites-enabled/default

    # Test nginx configuration
    nginx -t

    # Reload nginx
    systemctl reload nginx

    print_success "nginx configured"
}

# Setup SSL certificates
setup_ssl() {
    print_status "Setting up SSL certificates..."

    if command -v certbot &> /dev/null; then
        # Obtain SSL certificate
        certbot --nginx -d $DOMAIN -d www.$DOMAIN --email $EMAIL --agree-tos --non-interactive

        # Setup auto-renewal
        (crontab -l ; echo "0 12 * * * /usr/bin/certbot renew --quiet") | crontab -

        print_success "SSL certificates obtained and auto-renewal configured"
    else
        print_warning "certbot not available. Please manually configure SSL certificates"
    fi
}

# Deploy application
deploy_app() {
    print_status "Deploying application..."

    # Switch to application user
    su - $SUDO_USER << EOF
        cd /var/www/xpro-trading

        # Clone or update repository
        if [ -d ".git" ]; then
            git pull origin main
        else
            git clone https://github.com/yourusername/xpro-trading.git .
        fi

        # Install dependencies
        npm ci --production=false

        # Build application
        npm run build

        # Generate Prisma client
        npx prisma generate

        # Run database migrations
        npx prisma migrate deploy

        # Seed database (if needed)
        npm run seed
EOF

    print_success "Application deployed"
}

# Configure PM2
configure_pm2() {
    print_status "Configuring PM2..."

    # Switch to application user
    su - $SUDO_USER << EOF
        cd /var/www/xpro-trading

        # Copy PM2 configuration
        cp scripts/deployment/pm2.config.js .

        # Update environment variables in PM2 config
        # Note: You should set these environment variables properly
        sed -i "s|process.env.DATABASE_URL|\"$DATABASE_URL\"|g" pm2.config.js
        sed -i "s|process.env.REDIS_URL|\"$REDIS_URL\"|g" pm2.config.js
        sed -i "s|process.env.JWT_SECRET|\"$JWT_SECRET\"|g" pm2.config.js
        sed -i "s|https://yourdomain.com|https://$DOMAIN|g" pm2.config.js

        # Start applications with PM2
        pm2 start pm2.config.js --env production

        # Save PM2 configuration
        pm2 save

        # Setup PM2 startup script
        pm2 startup
EOF

    print_success "PM2 configured and applications started"
}

# Setup log rotation
setup_log_rotation() {
    print_status "Setting up log rotation..."

    # Create logrotate configuration
    cat > /etc/logrotate.d/xpro-trading << EOF
/var/www/xpro-trading/logs/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 $SUDO_USER $SUDO_USER
    postrotate
        pm2 reloadLogs
    endscript
}
EOF

    print_success "Log rotation configured"
}

# Setup database backup
setup_database_backup() {
    print_status "Setting up database backup..."

    # Create backup script
    cat > /var/www/xpro-trading/scripts/backup-db.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/var/www/xpro-trading/backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="$BACKUP_DIR/backup_$TIMESTAMP.sql"

mkdir -p $BACKUP_DIR

# Create backup
pg_dump $DATABASE_URL > $BACKUP_FILE

# Compress backup
gzip $BACKUP_FILE

# Keep only last 7 days of backups
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +7 -delete

echo "Backup created: $BACKUP_FILE.gz"
EOF

    chmod +x /var/www/xpro-trading/scripts/backup-db.sh
    chown $SUDO_USER:$SUDO_USER /var/www/xpro-trading/scripts/backup-db.sh

    # Add to crontab for daily backups at 2 AM
    (crontab -l ; echo "0 2 * * * /var/www/xpro-trading/scripts/backup-db.sh") | crontab -

    print_success "Database backup configured"
}

# Setup monitoring
setup_monitoring() {
    print_status "Setting up monitoring..."

    # Install monitoring tools (optional)
    apt install -y htop iotop sysstat

    # Setup PM2 monitoring
    su - $SUDO_USER -c "pm2 install pm2-logrotate"
    su - $SUDO_USER -c "pm2 set pm2-logrotate:max_size 10M"
    su - $SUDO_USER -c "pm2 set pm2-logrotate:retain 7"

    print_success "Monitoring configured"
}

# Setup firewall
setup_firewall() {
    print_status "Setting up firewall..."

    # Install ufw if not present
    apt install -y ufw

    # Allow SSH, HTTP, HTTPS
    ufw allow ssh
    ufw allow 'Nginx Full'
    ufw --force enable

    print_success "Firewall configured"
}

# Display deployment information
show_info() {
    echo ""
    echo "🎉 Production deployment completed!"
    echo "==================================="
    echo ""
    echo "Application URL: https://$DOMAIN"
    echo "API Documentation: https://$DOMAIN/api-docs"
    echo "WebSocket: wss://$DOMAIN"
    echo ""
    echo "Useful commands:"
    echo "• Check PM2 status: pm2 status"
    echo "• View PM2 logs: pm2 logs"
    echo "• Restart services: pm2 restart all"
    echo "• Monitor resources: htop"
    echo ""
    echo "Log files:"
    echo "• Application logs: /var/www/xpro-trading/logs/"
    echo "• nginx logs: /var/log/nginx/"
    echo ""
    echo "Backup location: /var/www/xpro-trading/backups/"
    echo ""
    echo "Next steps:"
    echo "1. Update your DNS to point to this server"
    echo "2. Set environment variables in PM2 config"
    echo "3. Configure database connection"
    echo "4. Test the application"
    echo ""
}

# Main execution
main() {
    check_permissions
    check_system

    # Get domain and email if not set
    if [ "$DOMAIN" = "yourdomain.com" ]; then
        read -p "Enter your domain name: " DOMAIN
    fi

    if [ "$EMAIL" = "admin@yourdomain.com" ]; then
        read -p "Enter admin email for SSL: " EMAIL
    fi

    install_dependencies
    setup_app_directory
    configure_nginx
    setup_ssl
    deploy_app
    configure_pm2
    setup_log_rotation
    setup_database_backup
    setup_monitoring
    setup_firewall

    show_info
}

# Run main function
main "$@"