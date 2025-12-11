#!/bin/bash

# Setup Test Environment Script
# Prepares the environment for running API tests

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo "============================================================"
echo "  Setting Up Test Environment"
echo "============================================================"
echo ""

# Check Node.js
echo -n "Checking Node.js... "
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo -e "${GREEN}✓${NC} Found $NODE_VERSION"
else
    echo -e "${RED}✗${NC} Node.js not found"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

# Check npm
echo -n "Checking npm... "
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    echo -e "${GREEN}✓${NC} Found v$NPM_VERSION"
else
    echo -e "${RED}✗${NC} npm not found"
    exit 1
fi

# Install dependencies
echo ""
echo "Installing dependencies..."
npm install

# Check if chalk is installed (needed for test script)
if ! npm list chalk &> /dev/null; then
    echo "Installing chalk for colored output..."
    npm install --save-dev chalk@4.1.2
fi

# Check .env file
echo ""
echo -n "Checking .env file... "
if [ -f ".env" ]; then
    echo -e "${GREEN}✓${NC} Found"
    
    # Check required variables
    echo "Checking required environment variables:"
    
    check_env_var() {
        local var_name=$1
        if grep -q "^${var_name}=" .env && ! grep -q "^${var_name}=$" .env && ! grep -q "^${var_name}=your_" .env; then
            echo -e "  ${GREEN}✓${NC} $var_name"
            return 0
        else
            echo -e "  ${YELLOW}⚠${NC} $var_name (not set or using placeholder)"
            return 1
        fi
    }
    
    MISSING_VARS=0
    check_env_var "GITHUB_TOKEN" || ((MISSING_VARS++))
    check_env_var "KESTRA_URL" || ((MISSING_VARS++))
    check_env_var "AI_API_KEY" || ((MISSING_VARS++))
    
    if [ $MISSING_VARS -gt 0 ]; then
        echo ""
        echo -e "${YELLOW}Warning:${NC} Some environment variables are not configured."
        echo "Please update your .env file with actual values."
        echo "See .env.example for reference."
    fi
else
    echo -e "${YELLOW}⚠${NC} Not found"
    echo "Creating .env from .env.example..."
    cp .env.example .env
    echo -e "${YELLOW}Warning:${NC} Please update .env with your actual credentials"
fi

# Check if backend is running
echo ""
echo -n "Checking if backend is running... "
if curl -s http://localhost:3000/ > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} Backend is running on port 3000"
else
    echo -e "${YELLOW}⚠${NC} Backend is not running"
    echo ""
    echo "To start the backend:"
    echo "  npm start"
    echo ""
    echo "Or in development mode:"
    echo "  npm run dev"
fi

# Check if Kestra is running
echo -n "Checking if Kestra is running... "
if curl -s http://localhost:8080/api/v1/health > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} Kestra is running on port 8080"
    
    # Check if workflow is deployed
    echo -n "Checking if workflow is deployed... "
    if curl -s http://localhost:8080/api/v1/flows/company.team/security-scan-flow > /dev/null 2>&1; then
        echo -e "${GREEN}✓${NC} Workflow 'security-scan-flow' is deployed"
    else
        echo -e "${YELLOW}⚠${NC} Workflow not found"
        echo ""
        echo "To deploy the workflow:"
        echo "  1. Open Kestra UI: http://localhost:8080/ui"
        echo "  2. Go to Flows"
        echo "  3. Create new flow in namespace 'company.team'"
        echo "  4. Copy content from workflows/security-scan-workflow.yml"
        echo "  5. Save the flow"
    fi
else
    echo -e "${YELLOW}⚠${NC} Kestra is not running"
    echo ""
    echo "To start Kestra:"
    echo "  docker run --rm -p 8080:8080 kestra/kestra:latest"
    echo ""
    echo "Or with docker-compose:"
    echo "  docker-compose up kestra"
fi

# Make test scripts executable
echo ""
echo "Making test scripts executable..."
chmod +x test-api.sh 2>/dev/null || true
chmod +x test-api.js 2>/dev/null || true

# Summary
echo ""
echo "============================================================"
echo "  Setup Complete!"
echo "============================================================"
echo ""
echo "Next steps:"
echo ""
echo "1. Ensure backend is running:"
echo "   ${GREEN}npm start${NC}"
echo ""
echo "2. Ensure Kestra is running:"
echo "   ${GREEN}docker run -p 8080:8080 kestra/kestra:latest${NC}"
echo ""
echo "3. Run tests:"
echo "   ${GREEN}npm run test:api${NC}     (Node.js version - recommended)"
echo "   ${GREEN}npm run test:api:bash${NC} (Bash version - quick)"
echo ""
echo "4. View test guide:"
echo "   ${GREEN}cat TEST_GUIDE.md${NC}"
echo ""

# Check if everything is ready
READY=true
if ! curl -s http://localhost:3000/ > /dev/null 2>&1; then
    READY=false
fi
if ! curl -s http://localhost:8080/api/v1/health > /dev/null 2>&1; then
    READY=false
fi

if [ "$READY" = true ]; then
    echo -e "${GREEN}✓ All services are running! You can run tests now.${NC}"
else
    echo -e "${YELLOW}⚠ Some services are not running. Please start them before running tests.${NC}"
fi

echo ""
