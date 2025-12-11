# Code Generation Prompt: Automated Security Scanner Backend

Copy and paste this entire prompt into your code generator (Claude, ChatGPT, etc.):

---

**INSTRUCTIONS: You are an expert full-stack developer building a production-grade Node.js backend application. Follow these requirements precisely and generate complete, working code.**

## Project: Automated Security Scanner with Kestra Orchestration

### Overview
Build a Node.js/Express backend API that:
1. Clones GitHub repositories
2. Scans for security vulnerabilities using Semgrep, ESLint, Bandit, and Gitleaks
3. Uses Claude AI to automatically fix security issues
4. Creates branches and pull requests with the fixes
5. Orchestrates everything via Kestra workflow engine

---

## Technical Stack

**Backend:**
- Runtime: Node.js v18+
- Framework: Express.js
- Language: JavaScript (or TypeScript if you prefer)
- Package Manager: npm

**Required Dependencies:**
```json
{
  "@octokit/rest": "^20.0.0",
  "axios": "^1.6.0",
  "simple-git": "^3.20.0",
  "dotenv": "^16.3.0",
  "joi": "^17.11.0",
  "winston": "^3.11.0",
  "uuid": "^9.0.1",
  "express": "^4.18.2",
  "cors": "^2.8.5",
  "helmet": "^7.1.0",
  "express-rate-limit": "^7.1.0"
}
```

---

## File Structure to Generate

Create the following complete file structure:

```
backend/
├── server.js
├── package.json
├── .env.example
├── .gitignore
├── routes/
│   ├── index.js
│   ├── scan.routes.js
│   ├── github.routes.js
│   ├── health.routes.js
│   └── webhook.routes.js
├── controllers/
│   ├── scan.controller.js
│   ├── fix.controller.js
│   ├── github.controller.js
│   └── kestra.controller.js
├── services/
│   ├── kestra.service.js
│   ├── scanner.service.js
│   ├── ai-fix.service.js
│   ├── github.service.js
│   └── storage.service.js
├── utils/
│   ├── git.js
│   ├── validator.js
│   ├── logger.js
│   └── errors.js
├── config/
│   └── index.js
└── workflows/
    └── security-scan-workflow.yml
```

---

## API Endpoints to Implement

### 1. Health Check
```
GET /api/health
Response: {
  "status": "healthy",
  "version": "1.0.0",
  "services": {
    "kestra": "connected",
    "github": "authenticated",
    "ai_engine": "operational"
  }
}
```

### 2. Initiate Scan
```
POST /api/scan
Body: {
  "repoUrl": "https://github.com/owner/repo",
  "branch": "main"
}
Response: {
  "scanId": "uuid-v4",
  "status": "initiated",
  "kestraExecutionId": "kestra-exec-id",
  "message": "Scan workflow started"
}
```

### 3. Get Scan Status
```
GET /api/scan/:scanId
Response: {
  "scanId": "uuid-v4",
  "status": "scanning|fixing|creating_pr|completed|failed",
  "progress": {
    "cloned": true,
    "scanned": true,
    "issuesFound": 15,
    "issuesFixed": 12,
    "prCreated": false
  },
  "results": { ... }
}
```

### 4. Fix Security Issue (Internal API)
```
POST /api/scan/fix
Body: {
  "scanId": "uuid",
  "finding": {
    "file": "src/auth.js",
    "line": 42,
    "severity": "high",
    "rule": "sql-injection",
    "message": "SQL injection vulnerability detected"
  },
  "fileContent": "const query = ...",
  "context": {}
}
Response: {
  "fixed": true,
  "patch": "unified diff format",
  "explanation": "..."
}
```

### 5. Kestra Webhook
```
POST /api/webhooks/kestra
Body: {
  "executionId": "...",
  "status": "success|failure",
  "scanId": "...",
  "outputs": {
    "issuesFound": 15,
    "issuesFixed": 12,
    "prUrl": "https://github.com/..."
  }
}
```

---

## Environment Variables (.env.example)

```env
# Server Configuration
NODE_ENV=development
PORT=3000
HOST=0.0.0.0

# GitHub Configuration
GITHUB_TOKEN=your_github_personal_access_token_here
GITHUB_API_URL=https://api.github.com

# Kestra Configuration
KESTRA_URL=http://localhost:8080
KESTRA_NAMESPACE=company.team
KESTRA_FLOW_ID=security-scan-flow

# AI Configuration (Anthropic Claude)
AI_API_KEY=your_anthropic_api_key_here
AI_MODEL=claude-sonnet-4-20250514
AI_MAX_TOKENS=4096

# Storage
TEMP_REPO_DIR=/tmp/repos

# Logging
LOG_LEVEL=info
```

---

## Detailed Implementation Requirements

### 1. server.js
- Initialize Express app
- Setup middleware: cors, helmet, rate limiting, json parser
- Mount all routes under `/api`
- Global error handler
- Graceful shutdown handling
- Start server on configured PORT

### 2. config/index.js
- Load environment variables using dotenv
- Validate required environment variables
- Export configuration object with all settings
- Throw error if required variables are missing

### 3. utils/logger.js
- Setup Winston logger with console and file transports
- Log levels: error, warn, info, debug
- Format: timestamp, level, message, metadata
- Export logger instance

### 4. utils/errors.js
- Create custom error classes:
  - `ValidationError` (400)
  - `NotFoundError` (404)
  - `UnauthorizedError` (401)
  - `InternalServerError` (500)
  - `ExternalServiceError` (503)
- Each error should have statusCode, message, and details

### 5. utils/validator.js
- Use Joi to create validation schemas for:
  - Repository URL validation
  - Branch name validation
  - Scan ID validation
- Export validation functions

### 6. utils/git.js
- Functions using simple-git:
  - `cloneRepository(repoUrl, targetDir, token)` - Clone repo with auth
  - `createBranch(repoDir, branchName)` - Create and checkout branch
  - `commitChanges(repoDir, message)` - Stage all and commit
  - `pushBranch(repoDir, branchName, token)` - Push branch to remote
- Handle errors properly

### 7. services/storage.service.js
- In-memory storage using Map
- Functions:
  - `createScan(scanData)` - Store new scan, return scanId
  - `getScan(scanId)` - Retrieve scan data
  - `updateScan(scanId, updates)` - Update scan data
  - `getAllScans()` - List all scans
- Store scan objects with: scanId, repoUrl, branch, status, progress, results, timestamps

### 8. services/github.service.js
- Use @octokit/rest
- Initialize Octokit with GitHub token
- Functions:
  - `validateRepoAccess(repoUrl)` - Check if repo exists and accessible
  - `createBranch(owner, repo, branchName, fromBranch)` - Create branch via API
  - `commitFile(owner, repo, branch, path, content, message)` - Commit file changes
  - `createPullRequest(owner, repo, head, base, title, body)` - Create PR
  - `getDefaultBranch(owner, repo)` - Get default branch name
- Parse owner/repo from GitHub URLs

### 9. services/scanner.service.js
- Functions to run security tools:
  - `runSemgrep(repoDir)` - Execute `semgrep --config auto --json -o results.json`
  - `runESLint(repoDir)` - Execute `eslint . --format json -o results.json`
  - `runBandit(repoDir)` - Execute `bandit -r . -f json -o results.json`
  - `runGitleaks(repoDir)` - Execute `gitleaks detect --report-format json`
  - `parseResults(toolName, jsonOutput)` - Parse and normalize findings
  - `aggregateResults(allResults)` - Combine and deduplicate findings
- Return normalized format:
```javascript
{
  file: "path/to/file.js",
  line: 42,
  severity: "high|medium|low",
  rule: "rule-id",
  message: "Description",
  tool: "semgrep|eslint|bandit|gitleaks"
}
```

### 10. services/ai-fix.service.js
- Use Anthropic Claude API
- Function: `generateFix(finding, fileContent, context)`
- Create detailed prompt:
```
You are a security expert fixing code vulnerabilities.

File: {filename}
Language: {language}
Security Issue:
- Rule: {rule}
- Severity: {severity}
- Line: {line}
- Description: {message}

Current Code:
{code_snippet}

Provide:
1. Fixed code that can directly replace the vulnerable code
2. Brief explanation of the fix
3. Security recommendations

Return the response in this JSON format:
{
  "fixedCode": "...",
  "explanation": "...",
  "recommendations": "..."
}
```
- Call Claude API with axios
- Parse response and validate fixed code
- Return fix object with patch in unified diff format

### 11. services/kestra.service.js
- Use axios to call Kestra API
- Functions:
  - `triggerWorkflow(flowId, inputs)` - Trigger Kestra workflow, return executionId
  - `getExecutionStatus(executionId)` - Get workflow execution status
  - `getExecutionLogs(executionId)` - Retrieve execution logs
- Handle Kestra API errors

### 12. controllers/scan.controller.js
- `initiateScan(req, res, next)`:
  - Validate request body (repoUrl, branch)
  - Generate unique scanId
  - Create scan record in storage
  - Trigger Kestra workflow with scan inputs
  - Return scanId and status
- `getScanStatus(req, res, next)`:
  - Get scanId from params
  - Retrieve scan from storage
  - Return scan data with current status

### 13. controllers/fix.controller.js
- `fixSecurityIssue(req, res, next)`:
  - Extract finding, fileContent from request
  - Call AI fix service
  - Return generated fix

### 14. controllers/github.controller.js
- `createBranch(req, res, next)` - Create branch via GitHub API
- `createPullRequest(req, res, next)` - Create PR with description
- `commitChanges(req, res, next)` - Commit files to branch

### 15. controllers/kestra.controller.js
- `handleWebhook(req, res, next)`:
  - Receive callback from Kestra
  - Extract executionId, status, outputs
  - Find scan by executionId
  - Update scan status and results
  - Log the completion
  - Return 200 OK

### 16. routes/health.routes.js
- GET `/` - Health check endpoint
- Check connectivity to:
  - Kestra (ping API)
  - GitHub (validate token)
  - AI service (check API key)
- Return status of all services

### 17. routes/scan.routes.js
- POST `/` - initiateScan
- GET `/:scanId` - getScanStatus
- POST `/fix` - fixSecurityIssue (internal)

### 18. routes/github.routes.js
- POST `/create-branch` - createBranch
- POST `/create-pr` - createPullRequest
- POST `/commit-changes` - commitChanges

### 19. routes/webhook.routes.js
- POST `/kestra` - handleWebhook

### 20. routes/index.js
- Import all route modules
- Export router with all routes mounted:
  - `/health` → health.routes
  - `/scan` → scan.routes
  - `/github` → github.routes
  - `/webhooks` → webhook.routes

---

## Kestra Workflow (workflows/security-scan-workflow.yml)

Create a complete Kestra workflow YAML with these steps:

**Step 1: Clone Repository**
- Use `io.kestra.plugin.git.Clone` task
- Input: repoUrl, branch, scanId
- Clone to `/tmp/repos/{{scanId}}`
- Use GitHub token for authentication

**Step 2: Install Dependencies (if needed)**
- Use `io.kestra.plugin.scripts.shell.Commands`
- Install npm packages if package.json exists
- Install pip packages if requirements.txt exists

**Step 3: Run Security Scans (Parallel)**
- Use `io.kestra.core.tasks.flows.Parallel` for concurrent execution
- Task 3a: Run Semgrep
  - Command: `semgrep --config auto --json -o /tmp/semgrep-results.json`
- Task 3b: Run ESLint
  - Command: `eslint . --format json -o /tmp/eslint-results.json`
- Task 3c: Run Bandit
  - Command: `bandit -r . -f json -o /tmp/bandit-results.json`
- Task 3d: Run Gitleaks
  - Command: `gitleaks detect --report-format json -l /tmp/gitleaks-results.json`

**Step 4: Aggregate Results**
- Use `io.kestra.plugin.scripts.python.Commands`
- Python script to:
  - Read all JSON result files
  - Normalize findings to common format
  - Save to `/tmp/aggregated-results.json`

**Step 5: AI Fix Generation Loop**
- Use `io.kestra.core.tasks.flows.EachSequential`
- For each finding:
  - Read file content
  - POST to `{{backendUrl}}/api/scan/fix`
  - Receive fix patch
  - Apply patch to file
  - Track success/failure

**Step 6: Create Branch**
- Use `io.kestra.plugin.git.Commit`
- Create branch: `security-fixes-{{timestamp}}`
- Commit all changes with message
- Push to origin

**Step 7: Create Pull Request**
- Use `io.kestra.plugin.scripts.shell.Commands`
- Call backend API: POST `{{backendUrl}}/api/github/create-pr`
- Body: owner, repo, head branch, base branch, title, description

**Step 8: Notify Backend**
- Use `io.kestra.plugin.scripts.shell.Commands`
- POST to `{{backendUrl}}/api/webhooks/kestra`
- Body: executionId, status, scanId, outputs

**Workflow Features:**
- Error handling with retry (maxAttempts: 3)
- Timeouts for each step
- Conditional execution (only create PR if fixes exist)
- Comprehensive logging
- Output variables

---

## Additional Requirements

1. **Error Handling:**
   - Wrap all async functions in try-catch
   - Use Express error handling middleware
   - Return proper HTTP status codes
   - Log all errors with stack traces

2. **Input Validation:**
   - Validate all API inputs using Joi
   - Check GitHub URL format
   - Validate branch names
   - Sanitize user inputs

3. **Security:**
   - Use helmet for security headers
   - Implement rate limiting (max 100 requests/15min)
   - Never log sensitive data (tokens, API keys)
   - Validate file paths to prevent traversal attacks

4. **Logging:**
   - Log all API requests (method, path, status)
   - Log workflow triggers and completions
   - Log errors with context
   - Use structured logging (JSON format)

5. **Code Quality:**
   - Add JSDoc comments to all functions
   - Use async/await (no callback hell)
   - Follow consistent naming conventions
   - Add TODO comments where improvements needed

6. **Package.json Scripts:**
```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "test": "jest",
    "lint": "eslint ."
  }
}
```

---

## Expected Output

Generate ALL files with complete, production-ready code. Each file should be:
- Fully functional and ready to run
- Well-commented with JSDoc
- Error-handled properly
- Following best practices

**Start generating code for each file now, beginning with:**
1. package.json
2. .env.example
3. .gitignore
4. config/index.js
5. utils/logger.js
6. utils/errors.js
7. utils/validator.js
8. utils/git.js
9. services/storage.service.js
10. services/github.service.js
11. services/scanner.service.js
12. services/ai-fix.service.js
13. services/kestra.service.js
14. controllers/scan.controller.js
15. controllers/fix.controller.js
16. controllers/github.controller.js
17. controllers/kestra.controller.js
18. routes/health.routes.js
19. routes/scan.routes.js
20. routes/github.routes.js
21. routes/webhook.routes.js
22. routes/index.js
23. server.js
24. workflows/security-scan-workflow.yml

**Generate complete, working code for all files. Do not use placeholders or TODO comments for core functionality.**

---

End of prompt. Generate all files now.