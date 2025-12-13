#!/bin/bash

# Restart Kestra with GitHub Token
# This script restarts Kestra to apply the new environment variable configuration

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║         Restarting Kestra with GitHub Token                   ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Check if docker-compose is available
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Error: docker-compose not found"
    echo "Please install docker-compose first"
    exit 1
fi

# Navigate to docker directory
cd "$(dirname "$0")"

echo "📍 Current directory: $(pwd)"
echo ""

# Stop containers
echo "🛑 Stopping Kestra containers..."
docker-compose down

if [ $? -ne 0 ]; then
    echo "❌ Failed to stop containers"
    exit 1
fi

echo "✅ Containers stopped"
echo ""

# Start containers
echo "🚀 Starting Kestra with new configuration..."
docker-compose up -d

if [ $? -ne 0 ]; then
    echo "❌ Failed to start containers"
    exit 1
fi

echo "✅ Containers started"
echo ""

# Wait for Kestra to be ready
echo "⏳ Waiting for Kestra to be ready..."
sleep 5

# Check if Kestra is responding
for i in {1..30}; do
    if curl -s http://localhost:8080/api/v1/health > /dev/null 2>&1; then
        echo "✅ Kestra is ready!"
        break
    fi
    echo "   Waiting... ($i/30)"
    sleep 2
done

# Verify GitHub token is available
echo ""
echo "🔍 Verifying GitHub token..."
if docker-compose exec -T kestra env | grep -q "GITHUB_TOKEN"; then
    echo "✅ GitHub token is available in container"
    TOKEN_VALUE=$(docker-compose exec -T kestra env | grep "GITHUB_TOKEN" | cut -d'=' -f2 | head -c 15)
    echo "   Token: ${TOKEN_VALUE}..."
else
    echo "❌ GitHub token not found in container"
    echo "   Please check docker-compose.yml configuration"
fi

echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║                    Setup Complete!                             ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""
echo "Next steps:"
echo "1. Open Kestra UI: http://localhost:8080/ui"
echo "2. Update workflow: Flows → company.team → security-scan-flow"
echo "3. Copy content from: backend/workflows/security-scan-workflow.yml"
echo "4. Save the workflow"
echo "5. Test: cd ../backend && npm run test:api"
echo ""
echo "View logs: docker-compose logs -f kestra"
echo ""
