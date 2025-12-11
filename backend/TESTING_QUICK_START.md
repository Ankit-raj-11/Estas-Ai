# Testing Quick Start

## 🚀 Quick Commands

```bash
# 1. Setup environment
bash setup-test-env.sh

# 2. Start backend (if not running)
npm start

# 3. Run tests
npm run test:api
```

## ✅ Pre-flight Checklist

- [ ] Node.js installed
- [ ] Dependencies installed (`npm install`)
- [ ] `.env` file configured with real values
- [ ] Backend running on port 3000
- [ ] Kestra running on port 8080
- [ ] Workflow deployed in Kestra

## 🧪 Test Commands

| Command | Description | Use Case |
|---------|-------------|----------|
| `npm run test:api` | Full Node.js test suite | Comprehensive testing with detailed output |
| `npm run test:api:bash` | Quick bash test | Fast testing, CI/CD pipelines |
| `bash setup-test-env.sh` | Environment check | Verify setup before testing |

## 🎯 Quick Validation

### Check Backend
```bash
curl http://localhost:3000/
# Expected: {"name":"Automated Security Scanner API","version":"1.0.0","status":"running"}
```

### Check Kestra
```bash
curl http://localhost:8080/api/v1/health
# Expected: 200 OK
```

### Check Workflow
```bash
curl http://localhost:8080/api/v1/flows/company.team/security-scan-flow
# Expected: Workflow JSON
```

## 🔧 Custom Test Configuration

```bash
# Different backend URL
BASE_URL=http://localhost:4000 npm run test:api

# Different Kestra URL
KESTRA_URL=http://kestra.example.com npm run test:api

# Different test repository
TEST_REPO=https://github.com/your-org/your-repo npm run test:api

# Different branch
TEST_BRANCH=develop npm run test:api

# All together
BASE_URL=http://localhost:4000 \
KESTRA_URL=http://kestra.example.com \
TEST_REPO=https://github.com/your-org/your-repo \
TEST_BRANCH=develop \
npm run test:api
```

## 📊 Expected Output

### Success
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

### Failure
```
✗ FAILED: Backend Server Health - connect ECONNREFUSED

Failed Tests:
  - Backend Server Health: connect ECONNREFUSED
```

## 🐛 Common Issues

| Issue | Solution |
|-------|----------|
| `ECONNREFUSED` on port 3000 | Start backend: `npm start` |
| `ECONNREFUSED` on port 8080 | Start Kestra: `docker run -p 8080:8080 kestra/kestra:latest` |
| Workflow not found | Deploy workflow in Kestra UI |
| GitHub auth failed | Check `GITHUB_TOKEN` in `.env` |
| AI API error | Check `AI_API_KEY` in `.env` |

## 📖 More Information

- **Detailed Guide**: [TEST_GUIDE.md](./TEST_GUIDE.md)
- **API Documentation**: [README.md](./README.md)
- **Workflow Changes**: [workflows/WORKFLOW_CHANGES.md](./workflows/WORKFLOW_CHANGES.md)

## 🎬 Complete Test Flow

```bash
# 1. Clone and setup
git clone <repo>
cd backend
npm install

# 2. Configure
cp .env.example .env
# Edit .env with your credentials

# 3. Start services
npm start                                    # Terminal 1
docker run -p 8080:8080 kestra/kestra:latest # Terminal 2

# 4. Deploy workflow
# Open http://localhost:8080/ui
# Create flow: company.team/security-scan-flow
# Paste content from workflows/security-scan-workflow.yml

# 5. Verify setup
bash setup-test-env.sh

# 6. Run tests
npm run test:api

# 7. Review results
cat logs/combined.log  # If needed
```

## 💡 Tips

1. **Run setup script first** - It checks everything you need
2. **Check logs** - `logs/combined.log` has detailed information
3. **Test incrementally** - Start with health checks, then full suite
4. **Use bash version for CI** - Faster and no dependencies
5. **Monitor Kestra UI** - Watch workflow execution in real-time

## 🔗 Useful URLs

- Backend: http://localhost:3000
- Backend Health: http://localhost:3000/api/health
- Kestra UI: http://localhost:8080/ui
- Kestra API: http://localhost:8080/api/v1
- Kestra Health: http://localhost:8080/api/v1/health
- Workflow: http://localhost:8080/ui/flows/company.team/security-scan-flow

## 📞 Need Help?

1. Run `bash setup-test-env.sh` to diagnose issues
2. Check `logs/error.log` for backend errors
3. Check Kestra UI for workflow errors
4. Review [TEST_GUIDE.md](./TEST_GUIDE.md) for detailed troubleshooting
