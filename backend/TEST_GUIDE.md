# API Testing Guide

Complete guide for testing the Automated Security Scanner backend and Kestra workflow integration.

## Prerequisites

1. **Backend Server Running**
   ```bash
   cd backend
   npm install
   npm start
   ```
   Server should be running on `http://localhost:3000`

2. **Kestra Server Running**
   - Kestra should be running on `http://localhost:8080`
   - Workflow `security-scan-flow` should be deployed in namespace `company.team`

3. **Environment Variables**
   Ensure your `.env` file has:
   ```env
   GITHUB_TOKEN=your_token_here
   KESTRA_URL=http://localhost:8080
   AI_API_KEY=your_gemini_api_key
   ```

## Test Scripts

### Option 1: Node.js Test Script (Recommended)

**Features:**
- Comprehensive test coverage
- Colored output
- Detailed error reporting
- JSON response validation
- Workflow monitoring

**Installation:**
```bash
npm install
```

**Run Tests:**
```bash
# Run all tests
npm run test:api

# Or directly
node test-api.js
```

**Custom Configuration:**
```bash
# Test against different backend
BASE_URL=http://localhost:4000 npm run test:api

# Test with different repository
TEST_REPO=https://github.com/your-org/your-repo npm run test:api

# Full custom configuration
BASE_URL=http://localhost:4000 \
KESTRA_URL=http://localhost:9090 \
TEST_REPO=https://github.com/your-org/your-repo \
TEST_BRANCH=develop \
npm run test:api
```

### Option 2: Bash Script (Quick Testing)

**Features:**
- No dependencies required
- Fast execution
- Simple output
- Good for CI/CD

**Run Tests:**
```bash
# Make executable (first time only)
chmod +x test-api.sh

# Run tests
./test-api.sh

# Or with npm
npm run test:api:bash
```

**Custom Configuration:**
```bash
BASE_URL=http://localhost:4000 ./test-api.sh
```

## Test Suites

### 1. Health Checks
Tests basic connectivity and service availability.

**Tests:**
- ✓ Backend server health (`GET /`)
- ✓ Health endpoint (`GET /api/health`)
- ✓ Kestra server health (`GET /api/v1/health`)

**Expected Results:**
- All services return 200 OK
- Backend returns status information
- Kestra health check passes

### 2. Scan Endpoints
Tests the core scanning functionality.

**Tests:**
- ✓ Initiate scan with invalid data (should fail)
- ✓ Initiate scan with valid data
- ✓ Get scan status
- ✓ Get non-existent scan (should return 404)

**Expected Results:**
- Invalid requests return 400 with validation errors
- Valid scan returns `scanId` and `kestraExecutionId`
- Scan status is retrievable
- Non-existent scans return 404

**Example Valid Request:**
```bash
curl -X POST http://localhost:3000/api/scan \
  -H "Content-Type: application/json" \
  -d '{
    "repoUrl": "https://github.com/octocat/Hello-World",
    "branch": "master"
  }'
```

**Example Response:**
```json
{
  "scanId": "abc123",
  "status": "initiated",
  "kestraExecutionId": "xyz789",
  "message": "Scan workflow started"
}
```

### 3. GitHub Endpoints
Tests GitHub integration functionality.

**Tests:**
- ✓ Create branch with invalid data (should fail)
- ✓ Create PR with invalid data (should fail)
- ✓ Commit changes with invalid data (should fail)

**Expected Results:**
- All invalid requests return 400 with validation errors
- Proper error messages for missing fields

### 4. Fix Endpoint
Tests AI-powered security fix generation.

**Tests:**
- ✓ Fix issue with invalid data (should fail)
- ✓ Fix issue with valid data

**Expected Results:**
- Invalid requests return 400
- Valid requests return fix suggestions with:
  - `fixed` (boolean)
  - `patch` (code changes)
  - `explanation` (fix description)
  - `recommendations` (additional suggestions)

**Example Valid Request:**
```bash
curl -X POST http://localhost:3000/api/scan/fix \
  -H "Content-Type: application/json" \
  -d '{
    "scanId": "test-scan",
    "finding": {
      "file": "app.js",
      "line": 10,
      "rule": "no-eval",
      "message": "eval() is dangerous"
    },
    "fileContent": "const result = eval(\"1 + 1\");"
  }'
```

### 5. Webhook Endpoint
Tests Kestra callback handling.

**Tests:**
- ✓ Webhook with valid data
- ✓ Webhook without scanId (should still accept)

**Expected Results:**
- All webhooks return 200 OK
- Scan records are updated with webhook data
- Missing scanId is handled gracefully

**Example Webhook:**
```bash
curl -X POST http://localhost:3000/api/webhooks/kestra \
  -H "Content-Type: application/json" \
  -d '{
    "executionId": "exec-123",
    "status": "success",
    "scanId": "scan-123",
    "outputs": {
      "issuesFound": 5,
      "issuesFixed": 3,
      "prUrl": "https://github.com/org/repo/pull/1"
    }
  }'
```

### 6. Kestra Workflow Integration
Tests workflow execution and monitoring.

**Tests:**
- ✓ Kestra execution exists
- ✓ Monitor execution status
- ✓ Workflow definition exists

**Expected Results:**
- Execution is created in Kestra
- Execution progresses through states (RUNNING → SUCCESS/FAILED)
- Workflow definition is deployed correctly

**Manual Workflow Check:**
```bash
# Check workflow exists
curl http://localhost:8080/api/v1/flows/company.team/security-scan-flow

# Check execution status
curl http://localhost:8080/api/v1/executions/{executionId}

# View execution logs
curl http://localhost:8080/api/v1/logs/{executionId}
```

### 7. Error Handling
Tests error handling and edge cases.

**Tests:**
- ✓ 404 for non-existent endpoints
- ✓ 400 for invalid JSON

**Expected Results:**
- Proper HTTP status codes
- Meaningful error messages
- No server crashes

## Interpreting Results

### Success Output
```
✓ [2024-12-12T10:30:00.000Z] PASSED: Backend Server Health
✓ [2024-12-12T10:30:01.000Z] PASSED: Health Endpoint
✓ [2024-12-12T10:30:02.000Z] PASSED: Kestra Server Health
...

============================================================
  Test Summary
============================================================

Total Tests: 20
Passed: 20
Failed: 0
Skipped: 0
Pass Rate: 100.00%

✓ [2024-12-12T10:30:30.000Z] All tests passed! 🎉
```

### Failure Output
```
✗ [2024-12-12T10:30:00.000Z] FAILED: Backend Server Health - connect ECONNREFUSED
  Status: undefined
  Data: undefined

============================================================
  Test Summary
============================================================

Total Tests: 20
Passed: 15
Failed: 5
Skipped: 0
Pass Rate: 75.00%

Failed Tests:
  - Backend Server Health: connect ECONNREFUSED
  - Kestra Server Health: connect ECONNREFUSED
  ...
```

## Troubleshooting

### Backend Not Responding
```
✗ FAILED: Backend Server Health - connect ECONNREFUSED
```

**Solutions:**
1. Check if backend is running: `curl http://localhost:3000`
2. Check logs: `tail -f backend/logs/combined.log`
3. Verify port: Check `PORT` in `.env`
4. Start server: `npm start`

### Kestra Not Responding
```
✗ FAILED: Kestra Server Health - connect ECONNREFUSED
```

**Solutions:**
1. Check if Kestra is running: `curl http://localhost:8080/api/v1/health`
2. Start Kestra: Follow Kestra installation guide
3. Verify URL: Check `KESTRA_URL` in `.env`

### Workflow Not Found
```
✗ FAILED: Workflow Definition Exists - 404
```

**Solutions:**
1. Deploy workflow to Kestra
2. Verify namespace: Should be `company.team`
3. Verify flow ID: Should be `security-scan-flow`
4. Check Kestra UI: `http://localhost:8080/ui/flows`

### GitHub Token Issues
```
✗ FAILED: Initiate Scan - GitHub authentication failed
```

**Solutions:**
1. Verify `GITHUB_TOKEN` in `.env`
2. Check token permissions (repo access required)
3. Test token: `curl -H "Authorization: token YOUR_TOKEN" https://api.github.com/user`

### AI API Issues
```
✗ FAILED: Fix Issue - AI API error
```

**Solutions:**
1. Verify `AI_API_KEY` in `.env`
2. Check Google Gemini API quota
3. Verify API key permissions
4. Check logs for detailed error

## CI/CD Integration

### GitHub Actions Example
```yaml
name: API Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      kestra:
        image: kestra/kestra:latest
        ports:
          - 8080:8080
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: |
          cd backend
          npm install
      
      - name: Start backend
        run: |
          cd backend
          npm start &
          sleep 5
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          AI_API_KEY: ${{ secrets.AI_API_KEY }}
          KESTRA_URL: http://localhost:8080
      
      - name: Run tests
        run: |
          cd backend
          npm run test:api
```

### Docker Compose Testing
```yaml
version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "3000:3000"
    environment:
      - GITHUB_TOKEN=${GITHUB_TOKEN}
      - AI_API_KEY=${AI_API_KEY}
      - KESTRA_URL=http://kestra:8080
    depends_on:
      - kestra
  
  kestra:
    image: kestra/kestra:latest
    ports:
      - "8080:8080"
  
  test:
    build: ./backend
    command: npm run test:api
    environment:
      - BASE_URL=http://backend:3000
      - KESTRA_URL=http://kestra:8080
    depends_on:
      - backend
      - kestra
```

## Manual Testing

### Using cURL

**1. Test Backend Health:**
```bash
curl http://localhost:3000/
```

**2. Initiate Scan:**
```bash
curl -X POST http://localhost:3000/api/scan \
  -H "Content-Type: application/json" \
  -d '{
    "repoUrl": "https://github.com/octocat/Hello-World",
    "branch": "master"
  }'
```

**3. Check Scan Status:**
```bash
curl http://localhost:3000/api/scan/{scanId}
```

**4. Test Fix Generation:**
```bash
curl -X POST http://localhost:3000/api/scan/fix \
  -H "Content-Type: application/json" \
  -d '{
    "finding": {
      "file": "test.js",
      "line": 10,
      "rule": "no-eval",
      "message": "eval() is dangerous"
    },
    "fileContent": "const x = eval(\"1+1\");"
  }'
```

### Using Postman

Import this collection:

```json
{
  "info": {
    "name": "Security Scanner API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Health Check",
      "request": {
        "method": "GET",
        "url": "{{baseUrl}}/api/health"
      }
    },
    {
      "name": "Initiate Scan",
      "request": {
        "method": "POST",
        "url": "{{baseUrl}}/api/scan",
        "body": {
          "mode": "raw",
          "raw": "{\n  \"repoUrl\": \"https://github.com/octocat/Hello-World\",\n  \"branch\": \"master\"\n}"
        }
      }
    }
  ],
  "variable": [
    {
      "key": "baseUrl",
      "value": "http://localhost:3000"
    }
  ]
}
```

## Performance Testing

### Load Testing with Apache Bench
```bash
# Test health endpoint
ab -n 1000 -c 10 http://localhost:3000/api/health

# Test scan endpoint (requires file with POST data)
ab -n 100 -c 5 -p scan-data.json -T application/json http://localhost:3000/api/scan
```

### Monitoring During Tests
```bash
# Watch logs
tail -f backend/logs/combined.log

# Monitor system resources
htop

# Check Kestra executions
watch -n 2 'curl -s http://localhost:8080/api/v1/executions | jq ".total"'
```

## Best Practices

1. **Run tests before deployment**
2. **Test against staging environment first**
3. **Monitor logs during test execution**
4. **Keep test data separate from production**
5. **Update tests when adding new endpoints**
6. **Run tests in CI/CD pipeline**
7. **Document any test failures**
8. **Test error scenarios, not just happy paths**

## Support

For issues or questions:
1. Check logs in `backend/logs/`
2. Review Kestra execution logs in UI
3. Verify environment variables
4. Check service connectivity
5. Review API documentation in `backend/README.md`
