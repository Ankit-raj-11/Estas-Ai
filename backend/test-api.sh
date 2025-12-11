#!/bin/bash

# Automated Security Scanner - Quick API Test Script
# Simple bash version for quick testing

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
BASE_URL="${BASE_URL:-http://localhost:3000}"
KESTRA_URL="${KESTRA_URL:-http://localhost:8080}"
TEST_REPO="${TEST_REPO:-https://github.com/octocat/Hello-World}"
TEST_BRANCH="${TEST_BRANCH:-master}"

# Counters
PASSED=0
FAILED=0

# Functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[✓]${NC} $1"
    ((PASSED++))
}

log_error() {
    echo -e "${RED}[✗]${NC} $1"
    ((FAILED++))
}

log_warning() {
    echo -e "${YELLOW}[⚠]${NC} $1"
}

print_header() {
    echo ""
    echo "============================================================"
    echo "  $1"
    echo "============================================================"
    echo ""
}

# Test function
test_endpoint() {
    local name="$1"
    local method="$2"
    local url="$3"
    local data="$4"
    local expected_status="${5:-200}"
    
    log_info "Testing: $name"
    
    if [ "$method" = "GET" ]; then
        response=$(curl -s -w "\n%{http_code}" "$url" 2>&1)
    else
        response=$(curl -s -w "\n%{http_code}" -X "$method" "$url" \
            -H "Content-Type: application/json" \
            -d "$data" 2>&1)
    fi
    
    status_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    if [ "$status_code" = "$expected_status" ]; then
        log_success "$name (Status: $status_code)"
        echo "$body"
        return 0
    else
        log_error "$name (Expected: $expected_status, Got: $status_code)"
        echo "$body"
        return 1
    fi
}

# Main tests
main() {
    print_header "Automated Security Scanner - API Test Suite"
    
    log_info "Backend URL: $BASE_URL"
    log_info "Kestra URL: $KESTRA_URL"
    log_info "Test Repository: $TEST_REPO"
    log_info "Test Branch: $TEST_BRANCH"
    
    # Health Checks
    print_header "Health Checks"
    
    test_endpoint "Backend Server Health" "GET" "$BASE_URL/" "" 200 || true
    test_endpoint "Health Endpoint" "GET" "$BASE_URL/api/health" "" 200 || true
    test_endpoint "Kestra Health" "GET" "$KESTRA_URL/api/v1/health" "" 200 || true
    
    # Scan Endpoints
    print_header "Scan Endpoints"
    
    # Invalid scan request
    test_endpoint "Initiate Scan - Invalid Data" "POST" "$BASE_URL/api/scan" '{}' 400 || true
    
    # Valid scan request
    log_info "Testing: Initiate Scan - Valid Data"
    scan_response=$(curl -s -X POST "$BASE_URL/api/scan" \
        -H "Content-Type: application/json" \
        -d "{\"repoUrl\":\"$TEST_REPO\",\"branch\":\"$TEST_BRANCH\"}")
    
    if echo "$scan_response" | grep -q "scanId"; then
        log_success "Initiate Scan - Valid Data"
        SCAN_ID=$(echo "$scan_response" | grep -o '"scanId":"[^"]*"' | cut -d'"' -f4)
        EXECUTION_ID=$(echo "$scan_response" | grep -o '"kestraExecutionId":"[^"]*"' | cut -d'"' -f4)
        log_info "Scan ID: $SCAN_ID"
        log_info "Execution ID: $EXECUTION_ID"
    else
        log_error "Initiate Scan - Valid Data"
        echo "$scan_response"
    fi
    
    # Get scan status
    if [ -n "$SCAN_ID" ]; then
        test_endpoint "Get Scan Status" "GET" "$BASE_URL/api/scan/$SCAN_ID" "" 200 || true
    fi
    
    # Non-existent scan
    test_endpoint "Get Non-existent Scan" "GET" "$BASE_URL/api/scan/non-existent-id" "" 404 || true
    
    # GitHub Endpoints
    print_header "GitHub Endpoints"
    
    test_endpoint "Create Branch - Invalid Data" "POST" "$BASE_URL/api/github/create-branch" '{}' 400 || true
    test_endpoint "Create PR - Invalid Data" "POST" "$BASE_URL/api/github/create-pr" '{}' 400 || true
    test_endpoint "Commit Changes - Invalid Data" "POST" "$BASE_URL/api/github/commit" '{}' 400 || true
    
    # Fix Endpoint
    print_header "Fix Endpoint"
    
    test_endpoint "Fix Issue - Invalid Data" "POST" "$BASE_URL/api/scan/fix" '{}' 400 || true
    
    fix_data='{
        "scanId": "test-scan-id",
        "finding": {
            "file": "test.js",
            "line": 10,
            "rule": "no-eval",
            "message": "eval() is dangerous"
        },
        "fileContent": "const result = eval(\"1 + 1\");"
    }'
    test_endpoint "Fix Issue - Valid Data" "POST" "$BASE_URL/api/scan/fix" "$fix_data" 200 || true
    
    # Webhook Endpoint
    print_header "Webhook Endpoint"
    
    webhook_data='{
        "executionId": "test-execution-id",
        "status": "success",
        "scanId": "test-scan-id",
        "outputs": {
            "issuesFound": 5,
            "issuesFixed": 3,
            "prUrl": "https://github.com/test/test/pull/1"
        }
    }'
    test_endpoint "Kestra Webhook - Valid Data" "POST" "$BASE_URL/api/webhooks/kestra" "$webhook_data" 200 || true
    
    # Kestra Workflow
    print_header "Kestra Workflow Integration"
    
    if [ -n "$EXECUTION_ID" ]; then
        test_endpoint "Kestra Execution Exists" "GET" "$KESTRA_URL/api/v1/executions/$EXECUTION_ID" "" 200 || true
    else
        log_warning "Skipping Kestra execution test - no execution ID"
    fi
    
    test_endpoint "Workflow Definition Exists" "GET" "$KESTRA_URL/api/v1/flows/company.team/security-scan-flow" "" 200 || true
    
    # Error Handling
    print_header "Error Handling"
    
    test_endpoint "404 Not Found" "GET" "$BASE_URL/api/non-existent-endpoint" "" 404 || true
    
    # Summary
    print_header "Test Summary"
    
    TOTAL=$((PASSED + FAILED))
    if [ $TOTAL -gt 0 ]; then
        PASS_RATE=$(awk "BEGIN {printf \"%.2f\", ($PASSED/$TOTAL)*100}")
    else
        PASS_RATE="0.00"
    fi
    
    echo "Total Tests: $TOTAL"
    echo -e "${GREEN}Passed: $PASSED${NC}"
    echo -e "${RED}Failed: $FAILED${NC}"
    echo "Pass Rate: $PASS_RATE%"
    echo ""
    
    if [ $FAILED -eq 0 ]; then
        log_success "All tests passed! 🎉"
        exit 0
    else
        log_error "Some tests failed. Please review the errors above."
        exit 1
    fi
}

# Run tests
main
