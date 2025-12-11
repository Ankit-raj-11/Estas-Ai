# Complete Testing Documentation

## 📋 Overview

This directory contains a comprehensive testing suite for the Automated Security Scanner backend API and Kestra workflow integration.

## 🎯 Quick Start

### For Windows Users (Recommended)
```cmd
REM Option 1: Node.js test (best output)
npm run test:api

REM Option 2: Windows batch script (no dependencies)
npm run test:api:windows
REM or
test-api.bat
```

### For Linux/Mac Users
```bash
# Option 1: Node.js test (best output)
npm run test:api

# Option 2: Bash script (fast)
npm run test:api:bash
# or
./test-api.sh
```

### First Time Setup
```bash
# Check environment and dependencies
bash setup-test-env.sh  # Linux/Mac
# or manually check on Windows
```

## 📁 Test Files

| File | Platform | Purpose | Best For |
|------|----------|---------|----------|
| `test-api.js` | All | Comprehensive Node.js test suite | Development, detailed testing |
| `test-api.sh` | Linux/Mac | Quick bash test script | CI/CD, quick validation |
| `test-api.bat` | Windows | Windows batch test script | Windows users, quick testing |
| `setup-test-env.sh` | Linux/Mac | Environment validation | First-time setup, troubleshooting |

## 📚 Documentation Files

| File | Purpose |
|------|---------|
| `TEST_GUIDE.md` | Complete testing guide with examples |
| `TESTING_QUICK_START.md` | Quick reference for common tasks |
| `TEST_FILES_SUMMARY.md` | Overview of all test files |
| `TESTING_README.md` | This file - main testing documentation |

## 🚀 Running Tests

### Prerequisites
1. ✅ Backend server running on port 3000
2. ✅ Kestra server running on port 8080
3. ✅ Valid `.env` file with credentials
4. ✅ Workflow deployed in Kestra

### Test Commands

#### Node.js Test Suite (Recommended)
```bash
# Install dependencies first
npm install

# Run tests
npm run test:api

# With custom configuration
BASE_URL=http://localhost:4000 npm run test:api
TEST_REPO=https://github.com/your-org/repo npm run test:api
```

**Features**:
- ✅ Colored output
- ✅ Detailed error messages
- ✅ JSON validation
- ✅ Workflow monitoring
- ✅ Pass rate calculation

#### Bash Test Suite (Linux/Mac)
```bash
# Make executable (first time)
chmod +x test-api.sh

# Run tests
./test-api.sh
# or
npm run test:api:bash

# With custom configuration
BASE_URL=http://localhost:4000 ./test-api.sh
```

**Features**:
- ✅ No Node.js dependencies
- ✅ Fast execution
- ✅ Good for CI/CD
- ✅ Simple output

#### Windows Batch Test Suite
```cmd
REM Run tests
test-api.bat
REM or
npm run test:api:windows

REM With custom configuration
set BASE_URL=http://localhost:4000
test-api.bat
```

**Features**:
- ✅ Native Windows support
- ✅ No bash required
- ✅ Simple CMD output
- ✅ Fast execution

## 🧪 What Gets Tested

### 1. Health Checks
- Backend server connectivity
- Kestra server connectivity
- Service availability

### 2. Scan Endpoints
- Scan initiation (valid/invalid data)
- Scan status retrieval
- Error handling

### 3. GitHub Integration
- Branch creation validation
- Pull request validation
- Commit validation

### 4. AI Fix Generation
- Fix endpoint validation
- AI response handling
- Error scenarios

### 5. Webhook Handling
- Kestra callback processing
- Data validation
- Error handling

### 6. Workflow Integration
- Workflow execution
- Status monitoring
- Workflow deployment

### 7. Error Handling
- 404 responses
- 400 validation errors
- Invalid JSON handling

## 📊 Test Results

### Success Example
```
============================================================
  Test Summary
============================================================

Total Tests: 20
Passed: 20
Failed: 0
Skipped: 0
Pass Rate: 100.00%

✓ All tests passed! 🎉
```

### Failure Example
```
✗ FAILED: Backend Server Health - connect ECONNREFUSED

Total Tests: 20
Passed: 15
Failed: 5
Pass Rate: 75.00%

Failed Tests:
  - Backend Server Health: connect ECONNREFUSED
```

## 🔧 Configuration

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `BASE_URL` | `http://localhost:3000` | Backend API URL |
| `KESTRA_URL` | `http://localhost:8080` | Kestra server URL |
| `TEST_REPO` | `https://github.com/octocat/Hello-World` | Test repository |
| `TEST_BRANCH` | `master` | Test branch |

### Windows Configuration
```cmd
set BASE_URL=http://localhost:4000
set KESTRA_URL=http://kestra.example.com
set TEST_REPO=https://github.com/your-org/repo
set TEST_BRANCH=develop
npm run test:api
```

### Linux/Mac Configuration
```bash
export BASE_URL=http://localhost:4000
export KESTRA_URL=http://kestra.example.com
export TEST_REPO=https://github.com/your-org/repo
export TEST_BRANCH=develop
npm run test:api
```

## 🐛 Troubleshooting

### Backend Not Running
**Symptom**: `ECONNREFUSED` on port 3000

**Solution**:
```bash
# Check if running
curl http://localhost:3000

# Start backend
npm start

# Check logs
cat logs/combined.log  # Linux/Mac
type logs\combined.log  # Windows
```

### Kestra Not Running
**Symptom**: `ECONNREFUSED` on port 8080

**Solution**:
```bash
# Check if running
curl http://localhost:8080/api/v1/health

# Start Kestra
docker run -p 8080:8080 kestra/kestra:latest
```

### Workflow Not Found
**Symptom**: 404 when checking workflow

**Solution**:
1. Open Kestra UI: http://localhost:8080/ui
2. Navigate to Flows
3. Create flow in namespace `company.team`
4. Copy content from `workflows/security-scan-workflow.yml`
5. Save and deploy

### GitHub Authentication Failed
**Symptom**: GitHub API errors

**Solution**:
1. Check `GITHUB_TOKEN` in `.env`
2. Verify token has repo access
3. Test token:
   ```bash
   curl -H "Authorization: token YOUR_TOKEN" https://api.github.com/user
   ```

### AI API Errors
**Symptom**: Fix generation fails

**Solution**:
1. Check `AI_API_KEY` in `.env`
2. Verify Gemini API quota
3. Check logs for detailed error

## 📖 Detailed Documentation

For more information, see:

- **[TEST_GUIDE.md](./TEST_GUIDE.md)** - Comprehensive testing guide
  - Detailed test descriptions
  - Manual testing examples
  - CI/CD integration
  - Performance testing

- **[TESTING_QUICK_START.md](./TESTING_QUICK_START.md)** - Quick reference
  - Quick commands
  - Common issues
  - Useful URLs

- **[TEST_FILES_SUMMARY.md](./TEST_FILES_SUMMARY.md)** - File overview
  - All test files explained
  - When to use each file
  - Configuration details

## 🔄 CI/CD Integration

### GitHub Actions
```yaml
name: API Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: cd backend && npm install
      - run: cd backend && npm start &
      - run: sleep 5
      - run: cd backend && npm run test:api
```

### GitLab CI
```yaml
test:
  stage: test
  script:
    - cd backend
    - npm install
    - npm start &
    - sleep 5
    - npm run test:api
```

### Jenkins
```groovy
stage('Test') {
    steps {
        dir('backend') {
            sh 'npm install'
            sh 'npm start &'
            sh 'sleep 5'
            sh 'npm run test:api'
        }
    }
}
```

## 💡 Best Practices

1. **Run tests before commits** - Catch issues early
2. **Use Node.js tests for development** - Better output and debugging
3. **Use bash/batch tests for CI** - Faster and simpler
4. **Check logs on failures** - Detailed error information
5. **Keep test data separate** - Don't use production repos
6. **Update tests with features** - Maintain coverage
7. **Run full suite before deployment** - Ensure stability

## 🎓 Testing Workflow

### Development Workflow
```bash
# 1. Make code changes
vim backend/services/scanner.service.js

# 2. Start backend (if not running)
npm start

# 3. Run tests
npm run test:api

# 4. Fix any failures
# Review logs, fix code, repeat

# 5. Commit when all tests pass
git commit -am "Add new feature"
```

### Deployment Workflow
```bash
# 1. Pull latest code
git pull origin main

# 2. Install dependencies
npm install

# 3. Update .env if needed
vim .env

# 4. Start services
npm start  # Backend
docker run -p 8080:8080 kestra/kestra:latest  # Kestra

# 5. Run full test suite
npm run test:api

# 6. Deploy if tests pass
# Deploy to production
```

## 🔗 Useful URLs

- **Backend**: http://localhost:3000
- **Backend Health**: http://localhost:3000/api/health
- **Kestra UI**: http://localhost:8080/ui
- **Kestra API**: http://localhost:8080/api/v1
- **Kestra Health**: http://localhost:8080/api/v1/health
- **Workflow**: http://localhost:8080/ui/flows/company.team/security-scan-flow

## 📞 Getting Help

1. **Check documentation**:
   - Read [TEST_GUIDE.md](./TEST_GUIDE.md)
   - Check [TESTING_QUICK_START.md](./TESTING_QUICK_START.md)

2. **Run diagnostics**:
   ```bash
   bash setup-test-env.sh  # Linux/Mac
   ```

3. **Check logs**:
   ```bash
   cat logs/error.log      # Linux/Mac
   type logs\error.log     # Windows
   ```

4. **Verify services**:
   ```bash
   curl http://localhost:3000
   curl http://localhost:8080/api/v1/health
   ```

5. **Check Kestra UI**:
   - Open http://localhost:8080/ui
   - Check workflow execution logs

## 🎉 Success Criteria

Tests are successful when:
- ✅ All health checks pass
- ✅ Scan can be initiated
- ✅ Scan status is retrievable
- ✅ Fix generation works
- ✅ Webhooks are processed
- ✅ Workflow executes successfully
- ✅ Error handling works correctly
- ✅ Pass rate is 100%

## 📝 Notes

- Tests use a public GitHub repository by default (octocat/Hello-World)
- No actual changes are made to repositories during testing
- Tests are safe to run multiple times
- Each test run is independent
- Tests clean up after themselves

## 🔐 Security

- Never commit `.env` files with real credentials
- Use test tokens with minimal permissions
- Don't use production repositories for testing
- Review test output before sharing (may contain sensitive data)
- Keep test credentials separate from production

## 📅 Maintenance

- Update tests when adding new endpoints
- Review test coverage regularly
- Keep documentation in sync with code
- Update test data as needed
- Monitor test execution times
- Archive old test results

---

**Last Updated**: December 2024
**Version**: 1.0.0
**Maintainer**: Development Team
