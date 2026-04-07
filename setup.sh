#!/bin/bash
# =============================================================================
# Video Reverse Search Web App - Setup & Launch Script
# =============================================================================

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "============================================================"
echo " Video Reverse Search Web App - Setup"
echo "============================================================"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

print_step() {
    echo -e "\n${GREEN}==> $1${NC}"
}

print_warn() {
    echo -e "${YELLOW}WARNING: $1${NC}"
}

print_error() {
    echo -e "${RED}ERROR: $1${NC}"
}

# Check Docker
print_step "Checking Docker..."
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed. Install it first:"
    echo "  macOS: brew install --cask docker"
    echo "  Linux: https://docs.docker.com/engine/install/"
    exit 1
fi

if ! docker info &> /dev/null; then
    print_error "Docker is not running. Start Docker and try again."
    exit 1
fi

echo "  ✓ Docker is running"

# Check docker-compose
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    print_error "docker-compose is not installed."
    exit 1
fi

COMPOSE_CMD="docker-compose"
if docker compose version &> /dev/null; then
    COMPOSE_CMD="docker compose"
fi

echo "  ✓ docker-compose available"

# Setup .env
print_step "Setting up environment..."
if [ ! -f ".env" ]; then
    cp .env.example .env
    echo "  ✓ Created .env from .env.example"
    print_warn "Review .env and adjust settings if needed"
else
    echo "  ✓ .env already exists"
fi

# Build and start
print_step "Building and starting services..."
$COMPOSE_CMD up -d --build

echo ""
print_step "Services started!"
echo ""
echo "  Frontend:  http://localhost:3000"
echo "  Backend:   http://localhost:8000"
echo "  API Docs:  http://localhost:8000/docs"
echo "  Database:  localhost:5432"
echo "  Redis:     localhost:6379"
echo ""
print_step "View logs:"
echo "  $COMPOSE_CMD logs -f"
echo ""
print_step "Stop services:"
echo "  $COMPOSE_CMD down"
echo ""
print_step "Stop and remove data:"
echo "  $COMPOSE_CMD down -v"
echo ""
