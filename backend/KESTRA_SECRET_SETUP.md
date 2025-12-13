# Kestra Secret Setup Guide

## Problem

Your workflow is failing with:
```
Cannot find secret for key 'GITHUB_TOKEN'
```

This means Kestra doesn't have access to your GitHub token.

## Solution: Add GitHub Token to Kestra

### Method 1: Using Kestra UI (Easiest) ⭐

1. **Open Kestra UI**
   ```
   http://localhost:8080/ui
   ```

2. **Navigate to Secrets**
   - Click the **gear icon** (⚙️) in the left sidebar (Settings)
   - Click **"Secrets"** in the settings menu

3. **Create New Secret**
   - Click **"Create"** or **"+ New Secret"** button
   - Fill in the form:
     - **Namespace**: `company.team`
     - **Key**: `GITHUB_TOKEN`
     - **Value**: `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` (your token from .env)
   - Click **"Save"**

4. **Verify**
   - You should see `GITHUB_TOKEN` listed under `company.team` namespace
   - The value will be hidden (shown as `***`)

### Method 2: Using Kestra CLI (If installed)

```bash
kestra secrets create \
  --namespace company.team \
  --key GITHUB_TOKEN \
  --value "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"
```

### Method 3: Using Environment Variables (Docker)

If running Kestra in Docker, you can pass secrets as environment variables:

```bash
docker run -p 8080:8080 \
  -e KESTRA_SECRET_GITHUB_TOKEN="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" \
  kestra/kestra:latest
```

Then in your workflow, use:
```yaml
password: "{{envs.KESTRA_SECRET_GITHUB_TOKEN}}"
```

### Method 4: Using Docker Compose

Update your `docker-compose.yml`:

```yaml
version: '3.8'

services:
  kestra:
    image: kestra/kestra:latest
    ports:
      - "8080:8080"
    environment:
      - KESTRA_SECRET_GITHUB_TOKEN=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
    volumes:
      - kestra-data:/app/storage

volumes:
  kestra-data:
```

## Verification

After adding the secret, test it:

1. **Check in Kestra UI**
   - Go to Settings → Secrets
   - Verify `GITHUB_TOKEN` exists under `company.team`

2. **Run a Test Workflow**
   ```bash
   curl -X POST http://localhost:3001/api/scan \
     -H "Content-Type: application/json" \
     -d '{
       "repoUrl": "https://github.com/octocat/Hello-World",
       "branch": "master"
     }'
   ```

3. **Check Workflow Execution**
   - Open Kestra UI: http://localhost:8080/ui
   - Go to Executions
   - Check the latest execution
   - The `clone_repo` task should now succeed

## Troubleshooting

### Secret Not Found After Adding

**Problem**: Still getting "Cannot find secret" error

**Solutions**:
1. **Check namespace**: Secret must be in `company.team` namespace
2. **Check key name**: Must be exactly `GITHUB_TOKEN` (case-sensitive)
3. **Restart Kestra**: Sometimes requires restart to pick up new secrets
   ```bash
   docker restart <kestra-container-id>
   ```

### Wrong Namespace

**Problem**: Secret added to wrong namespace

**Solution**: Delete and recreate in correct namespace:
1. Go to Settings → Secrets
2. Find the secret
3. Click Delete
4. Create new secret in `company.team` namespace

### Token Invalid

**Problem**: Token doesn't work even after adding

**Solutions**:
1. **Verify token**: Test it manually
   ```bash
   curl -H "Authorization: token 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" \
     https://api.github.com/user
   ```
2. **Check permissions**: Token needs `repo` scope
3. **Generate new token**: If expired, create new one at https://github.com/settings/tokens

### Cannot Access Kestra UI

**Problem**: Can't open http://localhost:8080/ui

**Solutions**:
1. **Check if Kestra is running**:
   ```bash
   curl http://localhost:8080/api/v1/health
   ```
2. **Check Docker container**:
   ```bash
   docker ps | grep kestra
   ```
3. **Check logs**:
   ```bash
   docker logs <kestra-container-id>
   ```

## Security Best Practices

1. **Never commit secrets** to version control
2. **Use different tokens** for different environments
3. **Rotate tokens regularly**
4. **Use minimal permissions** - only grant necessary scopes
5. **Monitor token usage** in GitHub settings

## Alternative: Use Personal Access Token

If you don't want to use secrets, you can use a Personal Access Token directly in the workflow (NOT RECOMMENDED for production):

```yaml
# NOT RECOMMENDED - Only for testing
- id: clone_repo
  type: io.kestra.plugin.git.Clone
  url: "https://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@github.com/owner/repo.git"
```

⚠️ **Warning**: This exposes your token in workflow logs!

## Next Steps

After adding the secret:

1. ✅ Verify secret is added in Kestra UI
2. ✅ Update workflow if needed (already uses `{{secret('GITHUB_TOKEN')}}`)
3. ✅ Test workflow execution
4. ✅ Check execution logs for success

## Quick Reference

| Item | Value |
|------|-------|
| Kestra UI | http://localhost:8080/ui |
| Secrets Page | http://localhost:8080/ui/settings/secrets |
| Namespace | `company.team` |
| Secret Key | `GITHUB_TOKEN` |
| Secret Value | Your GitHub token from `.env` |

## Summary

The workflow needs the GitHub token to clone repositories. Add it to Kestra's secret management using the UI (easiest method), and your workflow will be able to access it securely using `{{secret('GITHUB_TOKEN')}}`.

---

**Status**: ⚠️ Action Required
**Priority**: High - Workflow cannot run without this
**Estimated Time**: 2 minutes
