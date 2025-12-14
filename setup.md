# Estas-AI: Automated Security Scanner - Complete Setup Guide

This guide walks you through setting up the Automated Security Scanner with Kestra orchestration and AI-powered fixes.

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Step 1: Clone the Repository](#step-1-clone-the-repository)
4. [Step 2: Install Node.js Dependencies](#step-2-install-nodejs-dependencies)
5. [Step 3: Configure Environment Variables](#step-3-configure-environment-variables)
6. [Step 4: Set Up Kestra with Docker](#step-4-set-up-kestra-with-docker)
7. [Step 5: Deploy the Kestra Workflow](#step-5-deploy-the-kestra-workflow)
8. [Step 6: Start the Backend Server](#step-6-start-the-backend-server)
9. [Step 7: Start the Frontend](#step-7-start-the-frontend)
10. [Step 8: Verify the Setup](#step-8-verify-the-setup)
11. [Step 9: Run Your First Scan](#step-9-run-your-first-scan)
12. [Troubleshooting](#troubleshooting)

---

## Overview

This project is an automated security scanning system that:
- Scans GitHub repositories for security vulnerabilities using multiple tools (Semgrep, Bandit, ESLint, Gitleaks)
- Uses Google Gemini AI to automatically generate fixes for detected issues
- Creates pull requests with the fixes via Kestra workflow orchestration
- Provides a REST API for triggering scans and monitoring progress

### Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   REST API      │────▶│     Kestra      │────▶│    GitHub       │
│   (Express.js)  │◀────│   (Workflow)    │◀────│    Repository   │
└─────────────────┘     └─────────────────┘     └─────────────────┘
        │                       │
        │                       │
        ▼                       ▼
┌─────────────────┐     ┌─────────────────┐
│   Google        │     │   Security      │
│   Gemini AI     │     │   Scanners      │
└─────────────────┘     └─────────────────┘
```

---

## Prerequisites

Before starting, ensure you have the following installed:

### Required Software

| Software | Version | Purpose |
|----------|---------|---------|
| Node.js | v18+ | Backend runtime |
| npm | v9+ | Package manager |
| Docker | Latest | Running Kestra |
| Docker Compose | Latest | Container orchestration |
| Git | Latest | Version control |

### Required API Keys/Tokens

| Token | Where to Get | Required Permissions |
|-------|--------------|---------------------|
| GitHub Personal Access Token | [GitHub Settings](https://github.com/settings/tokens) | `repo` (full control of private repositories) |
| Google Gemini API Key | [Google AI Studio](https://aistudio.google.com/apikey) | Default access |

---

## Step 1: Clone the Repository

```bash
# Clone the repository
git clone <your-repository-url>
cd Estas-Ai
```

---

## Step 2: Install Node.js Dependencies

```bash
# Navigate to the backend directory
cd backend

# Install dependencies
npm install
```

This installs the following key packages:
- `express` - Web framework
- `@google/generative-ai` - Google Gemini AI SDK
- `@octokit/rest` - GitHub API client
- `axios` - HTTP client for Kestra communication
- `winston` - Logging
- `joi` - Input validation

---

## Step 3: Configure Environment Variables

### 3.1 Create the Backend `.env` File

```bash
# Copy the example environment file
cp .env.example .env
```

### 3.2 Edit the `.env` File

Open `.env` in your editor and configure:

```env
# Server Configuration
NODE_ENV=development
PORT=3000
HOST=0.0.0.0

# GitHub Configuration
GITHUB_TOKEN=ghp_your_github_personal_access_token_here
GITHUB_API_URL=https://api.github.com

# Kestra Configuration
KESTRA_URL=http://localhost:8080
KESTRA_NAMESPACE=company.team
KESTRA_FLOW_ID=security-scan-flow

# AI Configuration (Google Gemini)
AI_API_KEY=your_google_gemini_api_key_here
AI_MODEL=gemini-2.0-flash-exp
AI_MAX_TOKENS=8192

# Storage
TEMP_REPO_DIR=/tmp/repos

# Logging
LOG_LEVEL=info

# Optional: Supabase for persistent storage (if not set, uses in-memory storage)
# SUPABASE_URL=https://your-project.supabase.co
# SUPABASE_KEY=your_supabase_anon_key
```

### 3.3 Generate GitHub Token

1. Go to [GitHub Settings > Developer Settings > Personal Access Tokens](https://github.com/settings/tokens)
2. Click "Generate new token (classic)"
3. Select scopes:
   - `repo` (Full control of private repositories)
4. Copy the generated token to `GITHUB_TOKEN` in `.env`

### 3.4 Get Google Gemini API Key

1. Go to [Google AI Studio](https://aistudio.google.com/apikey)
2. Click "Create API Key"
3. Copy the key to `AI_API_KEY` in `.env`

---

## Step 4: Set Up Kestra with Docker

### 4.1 Configure Docker Environment

```bash
# Navigate to the docker directory
cd docker

# Copy the example environment file
cp .env.example .env
```

### 4.2 Encode Your GitHub Token

The Kestra workflow requires a Base64-encoded GitHub token:

```bash
# Option 1: Use the provided script (from backend directory)
cd ..
node scripts/encode-github-token.js

# Option 2: Manual encoding (PowerShell)
[Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes("your_github_token"))

# Option 3: Manual encoding (Bash/Linux/Mac)
echo -n "your_github_token" | base64
```

### 4.3 Update Docker `.env`

Edit `docker/.env` with your Base64-encoded token:

```env
SECRET_GITHUB_TOKEN=your_base64_encoded_github_token_here
```

### 4.4 Start Kestra

```bash
# From the docker directory
cd docker

# Start Kestra and PostgreSQL
docker-compose up -d

# Verify containers are running
docker-compose ps
```

Wait 30-60 seconds for Kestra to fully initialize.

### 4.5 Verify Kestra is Running

Open your browser and navigate to: **http://localhost:8080**

You should see the Kestra UI dashboard.

---

## Step 5: Deploy the Kestra Workflow

### 5.1 Access Kestra UI

1. Open **http://localhost:8080** in your browser
2. Navigate to **Flows** in the left sidebar

### 5.2 Create the Workflow

1. Click **Create** or the **+** button
2. Copy the contents of `backend/workflows/security-scan-complete.yml`
3. Paste into the Kestra flow editor
4. Click **Save**

The workflow should appear as:
- **Namespace:** `company.team`
- **Flow ID:** `security-scan-flow`

### 5.3 Verify Workflow Deployment

```bash
# Test via API
curl http://localhost:8080/api/v1/flows/company.team/security-scan-flow
```

---

## Step 6: Start the Backend Server

### 6.1 Development Mode (with auto-reload)

```bash
# From the backend directory
cd backend
npm run dev
```

### 6.2 Production Mode

```bash
npm start
```

The server starts on **http://localhost:3000**

---

## Step 7: Start the Frontend

### 7.1 Install Frontend Dependencies

```bash
# From the project root
cd frontend

# Install dependencies
npm install
```

### 7.2 Start Development Server

```bash
npm run dev
```

The frontend starts on **http://localhost:3001**

### 7.3 Frontend Features

- **Dashboard** - Overview of all scans with real-time status
- **New Scan** - Start security scans on GitHub repositories
- **Scan Details** - View vulnerabilities and AI-generated fixes
- **Health** - Monitor system status
- **Logs** - View execution logs

---

## Step 8: Verify the Setup

### 8.1 Run the Connection Diagnostic Tool

```bash
npm run check
```

This checks:
- Backend server status
- Kestra server connectivity
- GitHub token validity
- Backend ↔ Kestra connection
- Workflow deployment

### 7.2 Check Health Endpoint

```bash
curl http://localhost:3000/api/health
```

Expected response:
```json
{
  "status": "healthy",
  "version": "1.0.0",
  "services": {
    "kestra": "connected",
    "github": "authenticated",
    "ai_engine": "operational"
  }
}
```

### 7.3 Verify GitHub Permissions

```bash
node scripts/check-github-permissions.js
```

This shows:
- Your authenticated GitHub user
- Repositories you have access to
- Required permissions status

---

## Step 9: Run Your First Scan

### 9.1 Using the Frontend (Recommended)

1. Open **http://localhost:3001** in your browser
2. Click **"New Scan"** or navigate to `/scan`
3. Enter your GitHub repository URL
4. Select the branch to scan
5. Click **"Start Security Scan"**
6. Monitor progress on the scan details page

### 9.2 Using the API

```bash
curl -X POST http://localhost:3000/api/scan \
  -H "Content-Type: application/json" \
  -d '{
    "repoUrl": "https://github.com/your-username/your-repo",
    "branch": "main"
  }'
```

Response:
```json
{
  "scanId": "uuid-here",
  "status": "initiated",
  "kestraExecutionId": "execution-id",
  "message": "Scan workflow started"
}
```

### 8.2 Check Scan Status

```bash
curl http://localhost:3000/api/scan/{scanId}
```

### 8.3 Monitor in Kestra UI

1. Open **http://localhost:8080**
2. Go to **Executions**
3. Find your execution and click to view logs

---

## Troubleshooting

### Backend Won't Start

**Error:** `Missing required environment variables`
```bash
# Verify .env file exists and has all required variables
cat .env | grep -E "GITHUB_TOKEN|KESTRA_URL|AI_API_KEY"
```

**Error:** `Port 3000 already in use`
```bash
# Find and kill the process using port 3000
# Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/Mac:
lsof -i :3000
kill -9 <PID>
```

### Kestra Connection Fails

**Error:** `Kestra health check failed`
```bash
# Check if Kestra is running
docker-compose ps

# View Kestra logs
docker-compose logs kestra

# Restart Kestra
docker-compose restart kestra
```

**Error:** `ECONNREFUSED`
- Ensure Docker is running
- Wait 30-60 seconds after starting containers
- Verify `KESTRA_URL` in `.env` is `http://localhost:8080`

### GitHub API Errors

**Error:** `401 Unauthorized`
- Token may be expired - generate a new one
- Verify token has `repo` scope

**Error:** `404 Not Found`
- Repository doesn't exist or is private
- Token doesn't have access to the repository

```bash
# Test your token
curl -H "Authorization: token YOUR_TOKEN" https://api.github.com/user
```

### AI Fix Generation Fails

**Error:** `AI service unavailable`
- Verify `AI_API_KEY` is valid
- Check Google Gemini API quota at [Google AI Studio](https://aistudio.google.com)

### Workflow Execution Fails

**Error:** `GitHub token secret is empty`
1. Verify `SECRET_GITHUB_TOKEN` in `docker/.env`
2. Ensure it's Base64 encoded
3. Restart Kestra: `docker-compose restart kestra`

**Error:** `Failed to clone repository`
- Check GitHub token permissions
- Verify repository URL format: `https://github.com/owner/repo`

### Docker Issues

**Error:** `Cannot connect to Docker daemon`
```bash
# Start Docker Desktop (Windows/Mac)
# Or start Docker service (Linux):
sudo systemctl start docker
```

**Error:** `Port 8080 already in use`
```bash
# Find what's using port 8080
# Windows:
netstat -ano | findstr :8080

# Linux/Mac:
lsof -i :8080
```

---

## API Reference

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check with service status |
| POST | `/api/scan` | Initiate a new security scan |
| GET | `/api/scan/all` | Get all scans |
| GET | `/api/scan/:scanId` | Get scan status and results |
| GET | `/api/scan/:scanId/findings` | Get findings for a scan |
| POST | `/api/scan/fix` | Generate AI fix (internal) |
| POST | `/api/chat` | AI chat for security questions |
| POST | `/api/github/create-branch` | Create a new branch |
| POST | `/api/github/create-pr` | Create a pull request |
| POST | `/api/github/commit-changes` | Commit file changes |
| POST | `/api/webhooks/kestra` | Kestra completion webhook |

### Example: Full Scan Flow

```bash
# 1. Start a scan
SCAN_RESPONSE=$(curl -s -X POST http://localhost:3000/api/scan \
  -H "Content-Type: application/json" \
  -d '{"repoUrl": "https://github.com/owner/repo", "branch": "main"}')

SCAN_ID=$(echo $SCAN_RESPONSE | jq -r '.scanId')
echo "Scan ID: $SCAN_ID"

# 2. Poll for status
curl http://localhost:3000/api/scan/$SCAN_ID
```

---

## Directory Structure

```
backend/
├── server.js              # Express server entry point
├── config/
│   └── index.js           # Configuration management
├── controllers/
│   ├── chat.controller.js # AI chat functionality
│   ├── fix.controller.js  # AI fix generation
│   ├── github.controller.js
│   ├── kestra.controller.js
│   └── scan.controller.js
├── routes/
│   ├── index.js           # Route aggregator
│   ├── chat.routes.js     # AI chat routes
│   ├── github.routes.js
│   ├── health.routes.js
│   ├── scan.routes.js
│   └── webhook.routes.js
├── services/
│   ├── ai-chat.service.js # AI chat service
│   ├── ai-fix.service.js  # Google Gemini integration
│   ├── github.service.js  # GitHub API operations
│   ├── kestra.service.js  # Kestra workflow management
│   ├── scanner.service.js # Security scanning tools
│   ├── storage.service.js # In-memory scan storage
│   └── supabase.service.js # Supabase persistence (optional)
├── utils/
│   ├── errors.js          # Custom error classes
│   ├── git.js             # Git operations
│   ├── logger.js          # Winston logger
│   └── validator.js       # Input validation
├── workflows/
│   ├── security-scan-complete.yml    # Full workflow (recommended)
│   ├── security-scan-flow.yml        # Main workflow file
│   ├── security-scan-workflow.yml    # Alternative workflow
│   └── security-scan-workflow-simple.yml
├── scripts/
│   ├── check-github-permissions.js
│   ├── encode-github-token.js
│   ├── setup-kestra-secrets.js
│   └── ...
├── docker/
│   ├── docker-compose.yml
│   └── .env.example
├── .env.example
└── package.json
```

---

## Quick Start Checklist

- [ ] Node.js v18+ installed
- [ ] Docker and Docker Compose installed
- [ ] Repository cloned
- [ ] `npm install` completed in `backend/`
- [ ] `npm install` completed in `frontend/`
- [ ] `.env` configured with GitHub token and Gemini API key
- [ ] `docker/.env` configured with Base64-encoded GitHub token
- [ ] Kestra started with `docker-compose up -d`
- [ ] Workflow deployed in Kestra UI
- [ ] Backend started with `npm run dev` (port 3000)
- [ ] Frontend started with `npm run dev` (port 3001)
- [ ] Health check passes: `curl http://localhost:3000/api/health`
- [ ] Frontend accessible at: `http://localhost:3001`
- [ ] Connection diagnostic passes: `npm run check`

---

## Support

For issues:
1. Check the [Troubleshooting](#troubleshooting) section
2. Review logs in `backend/logs/`
3. Check Kestra execution logs in the UI
4. Run `npm run check` for diagnostics
