#!/bin/bash

# XPro Trading Platform - Database Management Script
# Handles database operations for development environment

set -e

echo "🗄️  XPro Trading Platform - Database Management"
echo "=============================================="

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

# Check if services are running
check_services() {
    if ! docker-compose ps | grep -q "Up"; then
        print_error "Services are not running. Please run './scripts/deployment/dev-setup.sh' first."
        exit 1
    fi
}

# Generate Prisma client
generate_prisma() {
    print_status "Generating Prisma client..."
    docker-compose exec -T node-api npx prisma generate
    print_success "Prisma client generated"
}

# Create and run migration
create_migration() {
    if [ -z "$1" ]; then
        print_error "Migration name is required"
        echo "Usage: $0 create-migration <migration-name>"
        exit 1
    fi

    print_status "Creating migration: $1"
    docker-compose exec -T node-api npx prisma migrate dev --name "$1"
    print_success "Migration created and applied"
}

# Run pending migrations
run_migrations() {
    print_status "Running pending migrations..."
    docker-compose exec -T node-api npx prisma migrate deploy
    print_success "Migrations completed"
}

# Reset database (WARNING: This will delete all data)
reset_database() {
    print_warning "⚠️  This will delete ALL data in the database!"
    read -p "Are you sure you want to reset the database? (yes/no): " confirm

    if [ "$confirm" != "yes" ]; then
        print_status "Database reset cancelled"
        exit 0
    fi

    print_status "Resetting database..."
    docker-compose exec -T node-api npx prisma migrate reset --force
    print_success "Database reset completed"
}

# Seed database
seed_database() {
    print_status "Seeding database..."
    docker-compose exec -T node-api npm run seed
    print_success "Database seeded"
}

# Show database status
show_status() {
    print_status "Database status:"
    echo ""

    # Show migration status
    echo "Migration Status:"
    docker-compose exec -T node-api npx prisma migrate status
    echo ""

    # Show database info
    echo "Database Info:"
    docker-compose exec -T postgres psql -U postgres -d xpro_trading -c "SELECT version();"
    docker-compose exec -T postgres psql -U postgres -d xpro_trading -c "SELECT schemaname, tablename FROM pg_tables WHERE schemaname = 'public';"
    echo ""

    # Show table counts
    echo "Table Record Counts:"
    docker-compose exec -T postgres psql -U postgres -d xpro_trading -c "
        SELECT
            schemaname,
            tablename,
            (SELECT count(*) FROM information_schema.columns WHERE table_schema = schemaname AND table_name = tablename) as columns,
            (SELECT count(*) FROM pg_stat_user_tables WHERE schemaname = schemaname AND relname = tablename) as records
        FROM pg_tables
        WHERE schemaname = 'public'
        ORDER BY tablename;
    "
}

# Backup database
backup_database() {
    local timestamp=$(date +"%Y%m%d_%H%M%S")
    local backup_file="backup_${timestamp}.sql"

    print_status "Creating database backup: $backup_file"

    docker-compose exec -T postgres pg_dump -U postgres xpro_trading > "$backup_file"

    if [ $? -eq 0 ]; then
        print_success "Backup created: $backup_file"
        echo "To restore: docker-compose exec -T postgres psql -U postgres xpro_trading < $backup_file"
    else
        print_error "Backup failed"
        exit 1
    fi
}

# Restore database from backup
restore_database() {
    if [ -z "$1" ]; then
        print_error "Backup file is required"
        echo "Usage: $0 restore <backup-file.sql>"
        exit 1
    fi

    if [ ! -f "$1" ]; then
        print_error "Backup file not found: $1"
        exit 1
    fi

    print_warning "⚠️  This will overwrite the current database!"
    read -p "Are you sure you want to restore from $1? (yes/no): " confirm

    if [ "$confirm" != "yes" ]; then
        print_status "Database restore cancelled"
        exit 0
    fi

    print_status "Restoring database from: $1"
    docker-compose exec -T postgres psql -U postgres xpro_trading < "$1"

    if [ $? -eq 0 ]; then
        print_success "Database restored successfully"
    else
        print_error "Database restore failed"
        exit 1
    fi
}

# Show usage
show_usage() {
    echo "Usage: $0 <command> [options]"
    echo ""
    echo "Commands:"
    echo "  generate          Generate Prisma client"
    echo "  create-migration  Create a new migration"
    echo "  migrate           Run pending migrations"
    echo "  reset             Reset database (WARNING: deletes all data)"
    echo "  seed              Seed database with initial data"
    echo "  status            Show database status and info"
    echo "  backup            Create database backup"
    echo "  restore <file>    Restore database from backup file"
    echo ""
    echo "Examples:"
    echo "  $0 migrate"
    echo "  $0 create-migration add-user-preferences"
    echo "  $0 backup"
    echo "  $0 restore backup_20231201_120000.sql"
}

# Main execution
main() {
    check_services

    case "${1:-}" in
        generate)
            generate_prisma
            ;;
        create-migration)
            create_migration "$2"
            ;;
        migrate)
            run_migrations
            ;;
        reset)
            reset_database
            ;;
        seed)
            seed_database
            ;;
        status)
            show_status
            ;;
        backup)
            backup_database
            ;;
        restore)
            restore_database "$2"
            ;;
        *)
            show_usage
            exit 1
            ;;
    esac
}

# Run main function
main "$@"