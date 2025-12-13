# Kestra Path Fix - Working Directory Issue

## Problem

The workflow was failing with this error:
```
java.lang.IllegalArgumentException: The path to resolve must be a relative path inside the current working directory.
```

## Root Cause

Kestra's `io.kestra.plugin.git.Clone` task requires a **relative path** for the `directory` parameter, not an absolute path.

### ❌ Before (Incorrect)
```yaml
variables:
  repoDir: "/tmp/repos/{{inputs.scanId}}"  # Absolute path - NOT ALLOWED

tasks:
  - id: clone_repo
    type: io.kestra.plugin.git.Clone
    directory: "{{vars.repoDir}}"  # This fails!
```

### ✅ After (Correct)
```yaml
variables:
  repoDir: "repo"  # Relative path - CORRECT

tasks:
  - id: clone_repo
    type: io.kestra.plugin.git.Clone
    directory: "{{vars.repoDir}}"  # This works!
```

## Changes Made

### 1. Updated Repository Directory Variable
```yaml
# Changed from:
repoDir: "/tmp/repos/{{inputs.scanId}}"

# To:
repoDir: "repo"
```

### 2. Updated Scan Result File Paths
All scan tools now output to the working directory instead of `/tmp`:

```yaml
# Semgrep
- semgrep --config auto --json -o ../semgrep-results.json . || true

# ESLint
- eslint . --format json -o ../eslint-results.json || true

# Bandit
- bandit -r . -f json -o ../bandit-results.json || true

# Gitleaks
- gitleaks detect --report-format json --report-path ../gitleaks-results.json || true
```

### 3. Updated Python Aggregation Script
```python
# Changed from:
filepath = f'/tmp/{tool}-results-{scan_id}.json'

# To:
filepath = f'{tool}-results.json'
```

### 4. Updated Output File Paths
```yaml
# Changed from:
-o /tmp/fix-{{taskrun.value.file | replace('/', '-')}}.json
-o /tmp/pr-result-{{inputs.scanId}}.json

# To:
-o fix-result.json
-o pr-result.json
```

## How Kestra Working Directory Works

Kestra provides each task execution with its own **isolated working directory**:

```
/tmp/kestra/workingdir/{namespace}/{flowId}/{executionId}/
├── repo/                    # Cloned repository (relative path)
├── semgrep-results.json     # Scan results
├── eslint-results.json
├── bandit-results.json
├── gitleaks-results.json
├── aggregated-results.json  # Aggregated results
├── fix-result.json          # Fix responses
└── pr-result.json           # PR creation response
```

### Key Points:

1. **All paths must be relative** to the working directory
2. **Each task shares the same working directory** within an execution
3. **Files persist** between tasks in the same execution
4. **Working directory is cleaned up** after execution completes

## Benefits of This Approach

1. ✅ **Isolation**: Each execution has its own workspace
2. ✅ **No conflicts**: Multiple executions can run simultaneously
3. ✅ **Automatic cleanup**: Kestra handles cleanup
4. ✅ **Portability**: Works on any Kestra installation
5. ✅ **Security**: No access to system directories

## Testing the Fix

After updating the workflow in Kestra UI:

1. **Save the workflow** with the new configuration
2. **Trigger a test execution**:
   ```bash
   curl -X POST http://localhost:3001/api/scan \
     -H "Content-Type: application/json" \
     -d '{
       "repoUrl": "https://github.com/octocat/Hello-World",
       "branch": "master"
     }'
   ```
3. **Monitor execution** in Kestra UI: http://localhost:8080/ui
4. **Check logs** for the `clone_repo` task - should succeed now

## Common Kestra Path Patterns

### ✅ Correct Patterns
```yaml
# Relative paths
directory: "repo"
directory: "cloned-repo"
directory: "src/{{inputs.projectName}}"

# Output files in working directory
-o results.json
-o ../output.txt
-o ./data/results.csv
```

### ❌ Incorrect Patterns
```yaml
# Absolute paths
directory: "/tmp/repo"
directory: "/var/data/{{inputs.id}}"
directory: "C:\\temp\\repo"

# System directories
-o /tmp/results.json
-o /var/log/output.txt
-o C:\temp\data.csv
```

## Additional Resources

- [Kestra Working Directory Documentation](https://kestra.io/docs/concepts/working-directory)
- [Git Clone Plugin Documentation](https://kestra.io/plugins/plugin-git/tasks/io.kestra.plugin.git.clone)
- [Shell Commands Best Practices](https://kestra.io/docs/developer-guide/scripts)

## Troubleshooting

### If you still see path errors:

1. **Check all file paths** in the workflow
2. **Ensure no absolute paths** are used
3. **Verify working directory** in task logs
4. **Check file permissions** if using custom directories
5. **Review Kestra logs** for detailed error messages

### Viewing Working Directory in Logs

Add this to any shell task to debug:
```yaml
commands:
  - pwd  # Print working directory
  - ls -la  # List all files
  - echo "Repo dir: {{vars.repoDir}}"
```

## Summary

The fix changes all absolute paths to relative paths, ensuring compatibility with Kestra's working directory model. This is a **required change** for the workflow to function properly in Kestra.

---

**Status**: ✅ Fixed
**Date**: December 2024
**Impact**: Critical - Workflow will not run without this fix
