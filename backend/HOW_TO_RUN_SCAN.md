# How to Run a Complete Security Scan

## 🎯 Quick Start

### Option 1: Trigger from Kestra UI (Recommended for now)

1. **Upload the workflow to Kestra:**
   - Open http://localhost:8080
   - Go to "Flows"
   - Click "Create"
   - Copy content from `backend/workflows/security-scan-complete.yml`
   - Save the flow

2. **Execute the workflow:**
   - Click "Execute" button
   - Fill in the inputs:
     ```
     scanId: test-scan-123
     repoUrl: https://github.com/Ankit-raj-11/T-race
     branch: main
     backendUrl: http://localhost:3001
     ```
   - Click "Execute"

3. **Monitor the execution:**
   - Watch the real-time logs in Kestra UI
   - See each step complete:
     - ✅ Clone and scan repository
     - ✅ Generate AI fixes
     - ✅ Create pull request
     - ✅ Notify backend

4. **View results:**
   - Check the "Outputs" tab for scan results
   - Download `scan-results.json` to see all findings
   - Check your backend logs for the webhook notification

---

## 📋 What the Complete Workflow Does

### Step 1: Clone & Scan (clone_and_scan)
- Clones the target repository
- Installs security scanning tools:
  - **Semgrep** - Multi-language static analysis
  - **Bandit** - Python security scanner
- Runs all scans in parallel
- Aggregates results into `scan-results.json`
- Outputs:
  - Total findings
  - Severity breakdown (high/medium/low)
  - Detailed findings with file, line, and description

### Step 2: Generate Fixes (generate_fixes)
- Reads the scan results
- For each critical finding:
  - Calls backend API `/api/scan/fix`
  - Uses Gemini AI to generate secure code
  - Creates patches for vulnerabilities

### Step 3: Create PR (create_pull_request)
- Creates a new branch with fixes
- Commits all changes
- Opens a pull request via GitHub API
- Includes:
  - Summary of issues fixed
  - Scan ID for tracking
  - Tool information

### Step 4: Notify Backend (notify_backend)
- Sends webhook to backend
- Updates scan status
- Includes:
  - Issues found count
  - Issues fixed count
  - PR URL

---

## 🔍 Example Output

```json
{
  "scanId": "test-scan-123",
  "findings": [
    {
      "tool": "semgrep",
      "file": "src/auth.js",
      "line": 42,
      "severity": "high",
      "rule": "javascript.lang.security.audit.sql-injection",
      "message": "Potential SQL injection vulnerability"
    },
    {
      "tool": "bandit",
      "file": "api/utils.py",
      "line": 15,
      "severity": "medium",
      "rule": "B201",
      "message": "Use of insecure pickle module"
    }
  ],
  "summary": {
    "total": 15,
    "high": 3,
    "medium": 8,
    "low": 4
  }
}
```

---

## 🐛 Troubleshooting

### Workflow fails at clone step
- **Issue:** Git authentication failed
- **Fix:** Check that `GITHUB_TOKEN` secret is properly configured in Kestra
- **Verify:** Run `docker logs docker-kestra-1 | grep SECRET`

### No scan results found
- **Issue:** Security tools not installed
- **Fix:** The workflow installs them automatically, check the logs
- **Verify:** Look for "Installing dependencies..." in execution logs

### Backend webhook fails
- **Issue:** Can't reach localhost from Docker
- **Fix:** The workflow uses `host.docker.internal` automatically
- **Verify:** Check backend logs for incoming webhook

### PR creation fails
- **Issue:** GitHub token doesn't have repo permissions
- **Fix:** Regenerate token with `repo` and `workflow` scopes
- **Verify:** Test with: `curl -H "Authorization: token YOUR_TOKEN" https://api.github.com/user`

---

## 📊 Monitoring

### View in Kestra UI
- Real-time execution logs
- Step-by-step progress
- Output files download
- Execution history

### View in Backend
```bash
# Check scan status
curl http://localhost:3001/api/scan/test-scan-123

# Check backend logs
# Look for: "Received Kestra webhook"
```

### View in GitHub
- Check the repository for new branch
- Look for open pull request
- Review the security fixes

---

## 🚀 Next Steps

1. **Add more security tools:**
   - ESLint with security plugins
   - Gitleaks for secrets
   - npm audit for dependencies
   - OWASP Dependency Check

2. **Enhance AI fixes:**
   - Better prompts for specific vulnerabilities
   - Code review before committing
   - Test generation for fixes

3. **Improve PR creation:**
   - Add screenshots/examples
   - Link to security documentation
   - Request specific reviewers

4. **Add notifications:**
   - Slack/Discord webhooks
   - Email alerts for critical issues
   - Dashboard for scan history

---

## ✅ Success Criteria

A successful scan should:
- ✅ Clone repository without errors
- ✅ Run all security scanners
- ✅ Find and report vulnerabilities
- ✅ Generate AI-powered fixes
- ✅ Create a pull request
- ✅ Notify backend with results

---

## 📝 Notes

- The workflow limits findings to 10 per tool to avoid overwhelming output
- Scans typically take 2-5 minutes depending on repository size
- AI fix generation adds 10-30 seconds per finding
- PR creation requires write access to the repository

---

**Need help?** Check the Kestra execution logs for detailed error messages!
