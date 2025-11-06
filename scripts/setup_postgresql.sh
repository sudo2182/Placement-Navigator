#!/bin/bash

# PostgreSQL Setup Script for Placement Navigator
# This script sets up PostgreSQL database for the project

echo "🚀 Setting up PostgreSQL database for Placement Navigator..."

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Get current user
DB_USER=$(whoami)
DB_NAME="placement_navigator"
DB_PASSWORD="placement123"  # Change this in production!

echo -e "${YELLOW}Creating database: $DB_NAME${NC}"

# Try to create database (will fail if it exists, which is fine)
psql -U $DB_USER -c "CREATE DATABASE $DB_NAME;" 2>/dev/null || echo "Database might already exist or using different user..."

# Check if database was created
if psql -U $DB_USER -lqt | cut -d \| -f 1 | grep -qw $DB_NAME; then
    echo -e "${GREEN}✅ Database '$DB_NAME' is ready!${NC}"
else
    echo -e "${RED}❌ Could not create database. Trying alternative method...${NC}"
    
    # Try with postgres user
    psql -U postgres -c "CREATE DATABASE $DB_NAME;" 2>/dev/null && \
    psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;" 2>/dev/null && \
    echo -e "${GREEN}✅ Database created with postgres user${NC}" || \
    echo -e "${YELLOW}⚠️  Please create database manually:${NC}"
    echo "   psql -U postgres"
    echo "   CREATE DATABASE placement_navigator;"
fi

# Create connection string
echo ""
echo -e "${YELLOW}Database connection string:${NC}"
echo "postgresql://$DB_USER@localhost:5432/$DB_NAME"
echo ""
echo -e "${GREEN}✅ Setup complete!${NC}"
echo ""
echo "Next steps:"
echo "1. Update .env file with: DATABASE_URL=postgresql://$DB_USER@localhost:5432/$DB_NAME"
echo "2. Install psycopg2: pip install psycopg2-binary"
echo "3. Run migrations: alembic upgrade head"
echo "4. Seed database: python seed_database.py"


