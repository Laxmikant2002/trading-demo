# XPro Trading Platform - Deployment Scripts

This directory contains comprehensive deployment scripts for the XPro Trading Platform across different environments and cloud providers.

## 📁 Scripts Overview

### Development Environment

- **`dev-setup.sh`** - Complete development environment setup with Docker Compose
- **`dev-db.sh`** - Database management utilities for development

### Production Environment

- **`prod-deploy.sh`** - Full production deployment with PM2, nginx, SSL, and monitoring
- **`pm2.config.js`** - PM2 process manager configuration

### Cloud Deployment

- **`aws-setup.sh`** - AWS infrastructure setup (ECS, RDS, ElastiCache, VPC)
- **`railway-deploy.sh`** - Railway deployment for simpler cloud hosting

### CI/CD

- **`.github/workflows/ci-cd.yml`** - GitHub Actions CI/CD pipeline

## 🚀 Quick Start

### Development Setup

1. **Prerequisites:**
   - Docker and Docker Compose installed
   - Git repository cloned

2. **Run development setup:**

   ```bash
   cd scripts/deployment
   chmod +x dev-setup.sh dev-db.sh
   ./dev-setup.sh
   ```

3. **Access the application:**
   - Web App: http://localhost:8080
   - API: http://localhost:3001
   - API Docs: http://localhost:3001/api-docs
   - WebSocket: ws://localhost:8080

### Database Management

```bash
# Run migrations
./dev-db.sh migrate

# Create new migration
./dev-db.sh create-migration "add-user-preferences"

# Reset database (WARNING: deletes all data)
./dev-db.sh reset

# Seed database
./dev-db.sh seed

# Show database status
./dev-db.sh status

# Create backup
./dev-db.sh backup

# Restore from backup
./dev-db.sh restore backup_20231201_120000.sql
```

## 🏭 Production Deployment

### Option 1: Traditional Server (PM2 + nginx)

1. **Prerequisites:**
   - Ubuntu/Debian server with sudo access
   - Domain name pointing to server
   - SMTP credentials for SSL certificate

2. **Deploy:**

   ```bash
   # Set environment variables
   export DOMAIN=yourdomain.com
   export EMAIL=admin@yourdomain.com

   # Run deployment script
   sudo ./prod-deploy.sh
   ```

3. **Features included:**
   - PM2 process management
   - nginx reverse proxy with SSL
   - Automatic SSL certificate (Let's Encrypt)
   - Log rotation
   - Database backups
   - Monitoring setup
   - Firewall configuration

### Option 2: Railway (Simple Cloud)

1. **Prerequisites:**
   - Railway account
   - Railway CLI installed and logged in

2. **Deploy:**

   ```bash
   # Set domain (optional)
   export DOMAIN=yourdomain.com

   # Run deployment
   ./railway-deploy.sh
   ```

3. **Features included:**
   - PostgreSQL database
   - Redis cache
   - Automatic SSL
   - Global CDN
   - Auto-scaling

### Option 3: AWS (Enterprise)

1. **Prerequisites:**
   - AWS CLI configured
   - AWS account with appropriate permissions

2. **Setup infrastructure:**

   ```bash
   # Set AWS region
   export AWS_REGION=us-east-1

   # Run AWS setup
   ./aws-setup.sh
   ```

3. **Deploy via CI/CD:**
   - Push to main branch
   - GitHub Actions will handle deployment

## 🔄 CI/CD Pipeline

The GitHub Actions pipeline includes:

### Automated Testing

- Node.js and Python test suites
- Database integration tests
- Code coverage reporting

### Docker Build & Push

- Multi-stage Docker builds
- Image scanning for vulnerabilities
- Push to GitHub Container Registry

### Deployment

- Staging deployment on develop branch
- Production deployment on main branch
- AWS ECS deployment with migrations

### Security

- Trivy vulnerability scanning
- SARIF report generation
- Slack notifications

## 🔧 Configuration

### Environment Variables

Required environment variables for production:

```bash
# Database
DATABASE_URL=postgresql://user:password@host:5432/database

# Redis
REDIS_URL=redis://host:6379

# Authentication
JWT_SECRET=your-super-secret-jwt-key

# Application
NODE_ENV=production
PORT=3001
CORS_ORIGIN=https://yourdomain.com
LOG_LEVEL=info
```

### PM2 Configuration

The `pm2.config.js` file includes:

- Cluster mode for Node.js API
- Fork mode for Python trading engine
- Automatic restarts and memory limits
- Log management
- Environment-specific configurations

### nginx Configuration

Located in `nginx/nginx.conf`, includes:

- Reverse proxy setup
- SSL/TLS configuration
- Rate limiting
- Gzip compression
- WebSocket support
- Security headers

## 📊 Monitoring & Maintenance

### Production Monitoring

- PM2 monitoring dashboard
- Application logs in `/var/www/xpro-trading/logs/`
- nginx access/error logs
- System resource monitoring

### Database Maintenance

- Automatic daily backups
- Log rotation
- Connection pooling
- Performance monitoring

### Updates

- Zero-downtime deployments with PM2
- Database migrations with rollback capability
- Automated testing before deployment

## 🛠 Troubleshooting

### Common Issues

1. **Port conflicts:**
   - Check if ports 3001, 8000, 5432, 6379 are available
   - Use `netstat -tlnp | grep :PORT` to check

2. **SSL certificate issues:**
   - Ensure domain DNS is pointing to server
   - Check certbot logs: `journalctl -u certbot`

3. **Database connection issues:**
   - Verify DATABASE_URL format
   - Check database server status
   - Review connection limits

4. **Permission issues:**
   - Ensure scripts are executable: `chmod +x *.sh`
   - Check file ownership in production

### Logs and Debugging

```bash
# PM2 logs
pm2 logs

# nginx logs
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log

# Application logs
tail -f /var/www/xpro-trading/logs/*.log

# Docker logs (development)
docker-compose logs -f
```

## 🔒 Security Considerations

- SSL/TLS encryption for all connections
- Environment variables for secrets
- Minimal exposed ports
- Regular security updates
- Database encryption at rest
- Network security groups
- Regular backup verification

## 📞 Support

For deployment issues:

1. Check the troubleshooting section above
2. Review logs for error messages
3. Verify environment configuration
4. Test with development setup first

## 🤝 Contributing

When adding new deployment features:

1. Update relevant scripts
2. Test on all supported platforms
3. Update this README
4. Add appropriate error handling
5. Include rollback procedures
