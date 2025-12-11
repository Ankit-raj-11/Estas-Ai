# Test Files Summary

This document provides an overview of all testing files created for the Automated Security Scanner backend.

## 📁 Test Files Created

### 1. `test-api.js` - Comprehensive Node.js Test Suite
**Purpose**: Full-featured API testing with detailed reporting

**Features**:
- ✅ Colored console output (using chalk)
- ✅ Comprehensive test coverage (20+ tests)
- ✅ JSON response validation
- ✅ Workflow execution monitoring
- ✅ Detailed error reporting
- ✅ Test result summary with pass rates
- ✅ Configurable via environment variables

**Usage**:
```bash
npm run test:api
# or
node test-api.js
```

**Test Suites**:
1. Health Checks (Backend, Kestra)
2. Scan Endpoints (Initiate, Status, Validation)
3. GitHub Endpoints (Branch, PR, Commit)
4. Fix Endpoint (AI-powered fixes)
5. Webhook Endpoint (Kestra callbacks)
6. Kestra Workflow Integration
7. Error Handling

---

### 2. `test-api.sh` - Quick Bash Test Script
**Purpose**: Fast testing without Node.js dependencies

**Features**:
- ✅ No dependencies (pure bash + curl)
- ✅ Fast execution
- ✅ Colored output
- ✅ Good for CI/CD pipelines
- ✅ Simple pass/fail reporting

**Usage**:
```bash
npm run test:api:bash
# or
bash test-api.sh
# or (if executable)
./test-api.sh
```

**Best For**:
- Quick smoke tests
- CI/CD pipelines
- Environments without Node.js
- Rapid validation

---

### 3. `setup-test-env.sh` - Environment Setup Script
**Purpose**: Validates and prepares testing environment

**Features**:
- ✅ Checks Node.js and npm installation
- ✅ Installs required dependencies
- ✅ Validates .env configuration
- ✅ Checks if backend is running
- ✅ Checks if Kestra is running
- ✅ Verifies workflow deployment
- ✅ Makes test scripts executable
- ✅ Provides setup guidance

**Usage**:
```bash
bash setup-test-env.sh
```

**When to Use**:
- First time setup
- Before running tests
- Troubleshooting environment issues
- CI/CD environment preparation

---

### 4. `TEST_GUIDE.md` - Comprehensive Testing Documentation
**Purpose**: Complete guide for testing the application

**Contents**:
- Prerequisites and setup instructions
- Detailed test suite descriptions
- Expected results for each test
- Troubleshooting guide
- Manual testing examples (cURL, Postman)
- CI/CD integration examples
- Performance testing guide
- Best practices

**Sections**:
1. Prerequisites
2. Test Scripts Overview
3. Test Suites (7 suites detailed)
4. Interpreting Results
5. Troubleshooting
6. CI/CD Integration
7. Manual Testing
8. Performance Testing
9. Best Practices

---

### 5. `TESTING_QUICK_START.md` - Quick Reference Guide
**Purpose**: Fast reference for common testing tasks

**Contents**:
- Quick commands
- Pre-flight checklist
- Test command reference table
- Quick validation commands
- Custom configuration examples
- Common issues and solutions
- Complete test flow walkthrough
- Useful URLs

**Best For**:
- Quick reference
- New team members
- Daily testing tasks
- Quick troubleshooting

---

### 6. `workflows/WORKFLOW_CHANGES.md` - Workflow Update Documentation
**Purpose**: Documents changes made to Kestra workflow

**Contents**:
- Detailed list of workflow changes
- Backend compatibility notes
- Configuration requirements
- Testing recommendations
- Benefits of changes

---

## 🎯 Which File to Use When

| Scenario | Recommended File |
|----------|------------------|
| First time setup | `setup-test-env.sh` |
| Daily testing | `test-api.js` (npm run test:api) |
| Quick validation | `test-api.sh` |
| CI/CD pipeline | `test-api.sh` |
| Learning the system | `TEST_GUIDE.md` |
| Quick reference | `TESTING_QUICK_START.md` |
| Troubleshooting | `TEST_GUIDE.md` + `setup-test-env.sh` |
| Understanding workflow | `workflows/WORKFLOW_CHANGES.md` |

## 📊 Test Coverage

### API Endpoints Tested
- ✅ `GET /` - Root endpoint
- ✅ `GET /api/health` - Health check
- ✅ `POST /api/scan` - Initiate scan
- ✅ `GET /api/scan/:scanId` - Get scan status
- ✅ `POST /api/scan/fix` - Generate fix
- ✅ `POST /api/github/create-branch` - Create branch
- ✅ `POST /api/github/create-pr` - Create PR
- ✅ `POST /api/github/commit` - Commit changes
- ✅ `POST /api/webhooks/kestra` - Kestra webhook

### Integration Tests
- ✅ Kestra server connectivity
- ✅ Workflow deployment verification
- ✅ Workflow execution monitoring
- ✅ End-to-end scan workflow

### Validation Tests
- ✅ Input validation (invalid data)
- ✅ Error handling (404, 400, 500)
- ✅ Authentication (GitHub token)
- ✅ Response format validation

## 🚀 Quick Start Workflow

```bash
# 1. Setup (first time only)
bash setup-test-env.sh

# 2. Run tests
npm run test:api

# 3. If issues, check logs
cat logs/combined.log
```

## 📦 Dependencies

### For Node.js Tests (`test-api.js`)
- `axios` - HTTP client (already in package.json)
- `chalk` - Colored output (added to devDependencies)

### For Bash Tests (`test-api.sh`)
- `curl` - HTTP client (usually pre-installed)
- `bash` - Shell (usually pre-installed)

### For Setup Script (`setup-test-env.sh`)
- `bash` - Shell
- `curl` - For connectivity checks

## 🔧 Configuration

All test scripts support these environment variables:

| Variable | Default | Description |
|----------|---------|-------------|
| `BASE_URL` | `http://localhost:3000` | Backend API URL |
| `KESTRA_URL` | `http://localhost:8080` | Kestra server URL |
| `TEST_REPO` | `https://github.com/octocat/Hello-World` | Test repository |
| `TEST_BRANCH` | `master` | Test branch |

**Example**:
```bash
BASE_URL=http://staging.example.com npm run test:api
```

## 📝 Package.json Scripts Added

```json
{
  "scripts": {
    "test:api": "node test-api.js",
    "test:api:bash": "bash test-api.sh",
    "test:quick": "node test-api.js"
  }
}
```

## 🎨 Output Examples

### Successful Test Run
```
============================================================
  Health Checks
============================================================

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

✓ All tests passed! 🎉
```

### Failed Test Run
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
```

## 🔍 Troubleshooting

### Tests Won't Run
1. Run `bash setup-test-env.sh` to diagnose
2. Check if dependencies are installed: `npm install`
3. Verify Node.js version: `node --version` (should be v18+)

### All Tests Failing
1. Check if backend is running: `curl http://localhost:3000`
2. Check if Kestra is running: `curl http://localhost:8080/api/v1/health`
3. Review `.env` file for correct configuration

### Some Tests Failing
1. Check logs: `cat logs/combined.log`
2. Review specific test output
3. Verify environment variables
4. Check service connectivity

## 📚 Additional Resources

- **Backend README**: [README.md](./README.md)
- **Environment Setup**: [.env.example](./.env.example)
- **Workflow Documentation**: [workflows/WORKFLOW_CHANGES.md](./workflows/WORKFLOW_CHANGES.md)
- **API Logs**: `logs/combined.log`

## 🎓 Best Practices

1. **Always run setup script first** on new environments
2. **Use Node.js tests for development** (better output)
3. **Use bash tests for CI/CD** (faster, no dependencies)
4. **Check logs when tests fail** for detailed error info
5. **Keep test data separate** from production data
6. **Run tests before deployment** to catch issues early
7. **Update tests when adding features** to maintain coverage

## 🤝 Contributing

When adding new endpoints or features:

1. Add tests to `test-api.js` (Node.js version)
2. Add tests to `test-api.sh` (bash version)
3. Update `TEST_GUIDE.md` with new test descriptions
4. Update this summary if adding new test files
5. Run full test suite to ensure nothing breaks

## 📞 Support

If you encounter issues:

1. Run `bash setup-test-env.sh` for diagnostics
2. Check `TEST_GUIDE.md` troubleshooting section
3. Review logs in `logs/` directory
4. Check Kestra UI for workflow issues
5. Verify all environment variables are set correctly
