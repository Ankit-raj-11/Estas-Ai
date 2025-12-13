# Docker Compose Setup for Kestra with GitHub Token

## ✅ Solution Applied

Your `docker-compose.yml` has been updated to pass the GitHub token to Kestra as an environment variable.

## What Changed

### 1. Docker Compose Configuration

Added `GITHUB_TOKEN` environment variable to the Kestra service:

```yaml
kestra:
  environment:
    # GitHub Token for workflow authentication
    GITHUB_TOKEN: ${GITHUB_TOKEN:-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}
    KESTRA_CONFIGURATION: |
      # ... rest of config
```

### 2. Workflow Configuration

Updated workflow to use environment variable instead of secret:

```yaml
# Before:
password: "{{secret('GITHUB_TOKEN')}}"

# After:
password: "{{envs.GITHUB_TOKEN}}"
```

## How to Use

### Option 1: Using Default Token (Current Setup)

The docker-compose.yml now includes your token as a default value. Simply restart Kestra:

```bash
cd backend/docker

# Stop current containers
docker-compose down

# Start with new configuration
docker-compose up -d

# Check logs
docker-compose logs -f kestra
```

### Option 2: Using .env File (Recommended for Security)

Create a `.env` file in the `backend/docker` directory:

```bash
cd backend/docker
cat > .env << EOF
GITHUB_TOKEN=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
EOF
```

Then update docker-compose.yml to remove the default:

```yaml
GITHUB_TOKEN: ${GITHUB_TOKEN}  # Will read from .env file
```

Restart:
```bash
docker-compose down
docker-compose up -d
```

### Option 3: Using Shell Environment Variable

Export the token in your shell before starting:

```bash
export GITHUB_TOKEN=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
cd backend/docker
docker-compose up -d
```

## Verification

### 1. Check Environment Variable in Container

```bash
docker-compose exec kestra env | grep GITHUB_TOKEN
```

Expected output:
```
GITHUB_TOKEN=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
```

### 2. Test the Workflow

```bash
cd backend
npm run test:api
```

### 3. Check Kestra Execution

1. Open Kestra UI: http://localhost:8080/ui
2. Go to Executions
3. Check the latest execution
4. The `clone_repo` task should now succeed

## Troubleshooting

### Issue: Token Not Available in Container

**Check if environment variable is set:**
```bash
docker-compose exec kestra env | grep GITHUB_TOKEN
```

**If not found:**
1. Make sure you restarted after updating docker-compose.yml
2. Check docker-compose.yml syntax
3. Try: `docker-compose down && docker-compose up -d`

### Issue: Workflow Still Fails

**Check workflow syntax:**
```yaml
# Make sure it uses envs, not secret
password: "{{envs.GITHUB_TOKEN}}"
```

**Update workflow in Kestra UI:**
1. Open http://localhost:8080/ui
2. Go to Flows → company.team → security-scan-flow
3. Replace content with updated workflow
4. Save

### Issue: Permission Denied

**Check token permissions:**
```bash
curl -H "Authorization: token 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" \
  https://api.github.com/user
```

Should return your GitHub user info.

## Security Best Practices

### ✅ DO:
- Use `.env` file for local development
- Add `.env` to `.gitignore`
- Use different tokens for different environments
- Rotate tokens regularly
- Use minimal permissions (only `repo` scope)

### ❌ DON'T:
- Commit tokens to version control
- Share tokens in plain text
- Use production tokens in development
- Give tokens unnecessary permissions

## Docker Compose Commands

```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f kestra

# Restart Kestra only
docker-compose restart kestra

# Check status
docker-compose ps

# Execute command in container
docker-compose exec kestra bash
```

## Complete Setup Steps

1. **Update docker-compose.yml** (✅ Already done)
   ```bash
   cd backend/docker
   # File already updated with GITHUB_TOKEN
   ```

2. **Update workflow** (✅ Already done)
   ```bash
   # Workflow already updated to use {{envs.GITHUB_TOKEN}}
   ```

3. **Restart Kestra**
   ```bash
   docker-compose down
   docker-compose up -d
   ```

4. **Update workflow in Kestra UI**
   - Open http://localhost:8080/ui
   - Go to Flows → company.team → security-scan-flow
   - Copy content from `backend/workflows/security-scan-workflow.yml`
   - Paste and Save

5. **Test**
   ```bash
   cd backend
   npm run test:api
   ```

## Alternative: Using Secrets (More Secure)

If you prefer using Kestra's secret management:

1. **Remove token from docker-compose.yml**
2. **Add secret via Kestra UI**:
   - Settings → Secrets
   - Create: `GITHUB_TOKEN` in `company.team` namespace
3. **Update workflow to use**:
   ```yaml
   password: "{{secret('GITHUB_TOKEN')}}"
   ```

## Environment Variables Available in Workflows

You can access any environment variable from docker-compose.yml:

```yaml
# In docker-compose.yml
environment:
  MY_VAR: "my_value"

# In workflow
{{envs.MY_VAR}}
```

## Next Steps

1. ✅ Restart Kestra: `docker-compose down && docker-compose up -d`
2. ✅ Update workflow in Kestra UI
3. ✅ Test: `npm run test:api`
4. ✅ Check execution in Kestra UI

---

**Status**: ✅ Configuration Updated
**Method**: Environment Variable via Docker Compose
**Security**: Token passed as environment variable
**Next Action**: Restart Kestra with `docker-compose down && docker-compose up -d`
