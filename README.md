<p align="center">
  <a href="#-estas-ai">
    <img src="https://img.shields.io/badge/🏆_Hackathon-AI_Agents_Assemble-gold?style=for-the-badge&logo=github&labelColor=24292e" alt="AI Agents Assemble"/>
  </a>
  <img src="https://img.shields.io/badge/Kestra-AI_Agent-purple?style=for-the-badge&logo=kestra&logoColor=fff" alt="Kestra AI Agent"/>
  <img src="https://img.shields.io/badge/AI-Powered_Fixes-blueviolet?style=for-the-badge&logo=google&logoColor=fff" alt="AI Powered"/>
  <img src="https://img.shields.io/badge/Security-Scanner-red?style=for-the-badge&logo=shield&logoColor=fff" alt="Security Scanner"/>
</p>

# 🛡 Estas-AI: The Autonomous Security Agent

<p align="center">
  <strong>AI-Powered Automated Security Scanner with Intelligent Fix Generation and Kestra Orchestration</strong>
</p>

<p align="center">
  <em>Scan repositories • Detect vulnerabilities • Generate AI fixes • Create pull requests — <strong>fully automated</strong> in a robust pipeline.</em>
</p>

<p align="center">
  <sub>🎯 Built for <strong>AI Agents Assemble</strong> Hackathon — Leveraging Kestra's AI Agent for intelligent data summarization & autonomous decision-making.</sub>
</p>

---

## 📑 Table of Contents

- [Project Overview](#-project-overview)
- [Key Features](#-key-features)
- [System Architecture](#-system-architecture)
- [Technology Stack](#-technology-stack)
- [Project Structure](#-project-structure)
- [Prerequisites](#-prerequisites)
- [Setup Instructions](#-setup-instructions)
  - [1. Clone the Repository](#1-clone-the-repository)
  - [2. Backend Setup](#2-backend-setup)
  - [3. Kestra Setup (Docker)](#3-kestra-setup-docker)
  - [4. Frontend Setup](#4-frontend-setup)
  - [5. Deploy Kestra Workflow](#5-deploy-kestra-workflow)
- [Configuration Reference](#-configuration-reference)
- [API Endpoints](#-api-endpoints)
- [Workflow Flow](#-workflow-flow)
- [AI Agent Capabilities](#-ai-agent-capabilities)
- [Troubleshooting](#-troubleshooting)

---

## 🌟 Project Overview

Estas-AI is an autonomous security scanning platform that combines multiple security analysis tools with AI-powered fix generation. The system automatically:

1. *Scans* GitHub repositories using Semgrep, Bandit, and Gitleaks
2. *Analyzes* vulnerabilities and prioritizes them by severity
3. *Generates* intelligent code fixes using Google Gemini AI
4. *Creates* pull requests with the fixes automatically applied

### The Problem

| Challenge | Impact |
|:----------|:-------|
| Manual security reviews are time-consuming | Slows down development cycles |
| Vulnerabilities go undetected until production | Increases remediation cost |
| Fixing security issues requires specialized expertise | Many teams lack security knowledge |
| Security debt accumulates faster than teams can address | Creates significant operational risk |

### The Solution

| Feature | How It Works |
|:--------|:-------------|
| *Automated Parallel Scanning* | Runs Semgrep, Bandit, and Gitleaks simultaneously via Kestra |
| *AI-Driven Decision Making* | Google Gemini analyzes findings and generates context-aware fixes |
| *Intelligent Fix Generation* | AI produces secure, idiomatic code patches |
| *Autonomous Remediation* | Creates branches, commits fixes, and opens PRs automatically |

---

## ✨ Key Features

- *Multi-Tool Security Scanning*: Semgrep (SAST), Bandit (Python), Gitleaks (secrets)
- *AI-Powered Fix Generation*: Google Gemini 2.0 Flash generates secure code fixes
- *Kestra Workflow Orchestration*: Reliable, scalable workflow execution
- *Automatic PR Creation*: Fixes are committed and PRs opened automatically
- *Real-time Dashboard*: Monitor scans, view findings, track progress
- *AI Chat Assistant*: Ask questions about vulnerabilities and get explanations
- *Fork Support*: Works with repos you don't have write access to (auto-forks)

---

## 🏗 System Architecture


┌─────────────────────────────────────────────────────────────────────────────┐
│                              ESTAS-AI ARCHITECTURE                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌──────────────┐     ┌──────────────┐     ┌──────────────────────────┐    │
│  │   Frontend   │────▶│   Backend    │────▶│    Kestra Orchestrator   │    │
│  │  (Next.js)   │◀────│  (Express)   │◀────│    (Docker Container)    │    │
│  │  Port: 3001  │     │  Port: 3000  │     │      Port: 8080          │    │
│  └──────────────┘     └──────────────┘     └──────────────────────────┘    │
│         │                    │                         │                    │
│         │                    │                         ▼                    │
│         │                    │              ┌──────────────────────┐        │
│         │                    │              │   Security Scanners  │        │
│         │                    │              │  ┌────────────────┐  │        │
│         │                    │              │  │    Semgrep     │  │        │
│         │                    │              │  │    Bandit      │  │        │
│         │                    │              │  │    Gitleaks    │  │        │
│         │                    │              │  └────────────────┘  │        │
│         │                    │              └──────────────────────┘        │
│         │                    │                         │                    │
│         │                    ▼                         ▼                    │
│         │           ┌──────────────┐         ┌──────────────────┐          │
│         │           │  Google AI   │         │     GitHub       │          │
│         │           │   (Gemini)   │         │   (API + Git)    │          │
│         │           └──────────────┘         └──────────────────┘          │
│         │                    │                         │                    │
│         │                    └─────────┬───────────────┘                    │
│         │                              ▼                                    │
│         │                    ┌──────────────────┐                           │
│         └───────────────────▶│    Supabase      │ (Optional)                │
│                              │   (Database)     │                           │
│                              └──────────────────┘                           │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘


### Data Flow

mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant Backend
    participant Kestra
    participant Scanners
    participant AI
    participant GitHub

    User->>Frontend: Enter repo URL & start scan
    Frontend->>Backend: POST /api/scan
    Backend->>Kestra: Trigger workflow
    Kestra->>GitHub: Clone repository
    Kestra->>Scanners: Run Semgrep, Bandit, Gitleaks
    Scanners-->>Kestra: Return findings
    Kestra->>Backend: Request AI fixes
    Backend->>AI: Generate fix for each finding
    AI-->>Backend: Return fixed code
    Backend-->>Kestra: Return fixes
    Kestra->>GitHub: Create branch & commit fixes
    Kestra->>GitHub: Create Pull Request
    Kestra->>Backend: Notify completion
    Backend-->>Frontend: Update scan status
    Frontend-->>User: Show results & PR link


---

## 🛠 Technology Stack

| Component | Technology | Purpose |
|:----------|:-----------|:--------|
| *Frontend* | Next.js 16, React 19, TailwindCSS 4 | User interface & dashboard |
| *Backend* | Express.js, Node.js | API gateway & AI service |
| *Orchestration* | Kestra | Workflow management & task execution |
| *AI Engine* | Google Gemini 2.0 Flash | Code fix generation & analysis |
| *Security Scanners* | Semgrep, Bandit, Gitleaks | Vulnerability detection |
| *Database* | Supabase (optional) | Persistent storage |
| *Infrastructure* | Docker, PostgreSQL | Container orchestration |

---

## 📁 Project Structure


Estas-Ai/
├── backend/                    # Express.js API Server
│   ├── config/
│   │   └── index.js           # Configuration management
│   ├── controllers/
│   │   ├── chat.controller.js # AI chat endpoint
│   │   ├── fix.controller.js  # Fix generation endpoint
│   │   ├── github.controller.js # GitHub operations
│   │   ├── kestra.controller.js # Kestra management
│   │   └── scan.controller.js # Scan initiation & status
│   ├── docker/
│   │   ├── docker-compose.yml # Kestra + PostgreSQL setup
│   │   ├── .env.example       # Docker environment template
│   │   └── .env               # Docker environment (create this)
│   ├── routes/
│   │   ├── chat.routes.js     # /api/chat endpoints
│   │   ├── github.routes.js   # /api/github endpoints
│   │   ├── health.routes.js   # /api/health endpoints
│   │   ├── scan.routes.js     # /api/scan endpoints
│   │   └── webhook.routes.js  # /api/webhooks endpoints
│   ├── services/
│   │   ├── ai-chat.service.js # AI chat functionality
│   │   ├── ai-fix.service.js  # AI fix generation
│   │   ├── github.service.js  # GitHub API integration
│   │   ├── kestra.service.js  # Kestra API integration
│   │   ├── scanner.service.js # Scanner utilities
│   │   ├── storage.service.js # In-memory storage
│   │   └── supabase.service.js # Supabase integration
│   ├── workflows/
│   │   └── security-scan-flow.yml # Main Kestra workflow
│   ├── .env.example           # Backend environment template
│   ├── .env                   # Backend environment (create this)
│   ├── package.json
│   └── server.js              # Express server entry point
│
├── frontend/                   # Next.js Application
│   ├── src/
│   │   ├── app/
│   │   │   ├── api/           # API route handlers
│   │   │   ├── dashboard/     # Dashboard page
│   │   │   ├── scan/          # Scan pages
│   │   │   │   └── [scanId]/  # Individual scan view
│   │   │   ├── health/        # Health check page
│   │   │   ├── logs/          # Logs viewer
│   │   │   ├── layout.tsx     # Root layout
│   │   │   └── page.tsx       # Home page
│   │   ├── components/        # Reusable UI components
│   │   └── lib/               # Utilities & API client
│   ├── .env.example           # Frontend environment template
│   ├── .env.local             # Frontend environment (create this)
│   ├── package.json
│   └── next.config.ts
│
└── README.md                   # This file


---

## 📋 Prerequisites

Before setting up Estas-AI, ensure you have:

| Requirement | Version | Purpose |
|:------------|:--------|:--------|
| *Node.js* | v18+ | Backend & Frontend runtime |
| *npm* | v9+ | Package management |
| *Docker* | v20+ | Kestra container |
| *Docker Compose* | v2+ | Multi-container orchestration |
| *Git* | v2+ | Repository operations |

### Required API Keys & Tokens

| Service | How to Get | Required For |
|:--------|:-----------|:-------------|
| *GitHub Personal Access Token* | [GitHub Settings → Developer Settings → Personal Access Tokens](https://github.com/settings/tokens) | Repository access, PR creation |
| *Google Gemini API Key* | [Google AI Studio](https://aistudio.google.com/apikey) | AI fix generation |
| *Supabase* (Optional) | [Supabase Dashboard](https://supabase.com) | Persistent storage |

#### GitHub Token Permissions Required:
- repo (Full control of private repositories)
- workflow (Update GitHub Action workflows)
- read:org (Read org membership - if scanning org repos)

---

## 🚀 Setup Instructions

### 1. Clone the Repository

bash
git clone https://github.com/your-username/Estas-Ai.git
cd Estas-Ai


### 2. Backend Setup

bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create environment file
copy .env.example .env


Edit backend/.env with your configuration:

env
# Server Configuration
NODE_ENV=development
PORT=3000
HOST=0.0.0.0

# GitHub Configuration
GITHUB_TOKEN=ghp_your_github_personal_access_token_here

# Kestra Configuration
KESTRA_URL=http://localhost:8080
KESTRA_NAMESPACE=company.team
KESTRA_FLOW_ID=security-scan-flow

# AI Configuration (Google Gemini)
AI_API_KEY=your_google_gemini_api_key_here
AI_MODEL=gemini-2.0-flash-exp
AI_MAX_TOKENS=8192

# Supabase Configuration (Optional - for persistent storage)
# SUPABASE_URL=https://your-project.supabase.co
# SUPABASE_KEY=your-supabase-anon-key

# Logging
LOG_LEVEL=info


### 3. Kestra Setup (Docker)

bash
# Navigate to docker directory
cd backend/docker

# Create environment file
copy .env.example .env


Edit backend/docker/.env:

env
# Base64 encode your GitHub token for Kestra secrets
# On Windows PowerShell:
# [Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes("ghp_your_token"))
# On Linux/Mac:
# echo -n "ghp_your_token" | base64

SECRET_GITHUB_TOKEN=your_base64_encoded_github_token


*Start Kestra:*

bash
# From backend/docker directory
docker-compose up -d

# Verify Kestra is running
docker-compose ps

# View logs if needed
docker-compose logs -f kestra


Kestra UI will be available at: *http://localhost:8080*

### 4. Frontend Setup

bash
# Navigate to frontend directory (from project root)
cd frontend

# Install dependencies
npm install

# Create environment file
copy .env.example .env.local


Edit frontend/.env.local:

env
NEXT_PUBLIC_API_URL=http://localhost:3000


### 5. Deploy Kestra Workflow

The workflow needs to be deployed to Kestra. You can do this via:

*Option A: Kestra UI*
1. Open http://localhost:8080
2. Navigate to Flows → Create
3. Copy contents of backend/workflows/security-scan-flow.yml
4. Paste and Save

*Option B: Kestra API*
bash
curl -X POST "http://localhost:8080/api/v1/flows" \
  -H "Content-Type: application/x-yaml" \
  --data-binary @backend/workflows/security-scan-flow.yml


### 6. Start the Application

*Terminal 1 - Backend:*
bash
cd backend
npm run dev


*Terminal 2 - Frontend:*
bash
cd frontend
npm run dev


### 7. Access the Application

| Service | URL |
|:--------|:----|
| *Frontend* | http://localhost:3001 |
| *Backend API* | http://localhost:3000 |
| *Kestra UI* | http://localhost:8080 |

---

## ⚙ Configuration Reference

### Backend Environment Variables

| Variable | Required | Default | Description |
|:---------|:---------|:--------|:------------|
| NODE_ENV | No | development | Environment mode |
| PORT | No | 3000 | Backend server port |
| HOST | No | 0.0.0.0 | Server host |
| GITHUB_TOKEN | *Yes* | - | GitHub Personal Access Token |
| GITHUB_API_URL | No | https://api.github.com | GitHub API URL |
| KESTRA_URL | *Yes* | - | Kestra server URL |
| KESTRA_NAMESPACE | No | company.team | Kestra namespace |
| KESTRA_FLOW_ID | No | security-scan-flow | Kestra workflow ID |
| AI_API_KEY | *Yes* | - | Google Gemini API key |
| AI_MODEL | No | gemini-2.0-flash-exp | Gemini model to use |
| AI_MAX_TOKENS | No | 8192 | Max tokens for AI response |
| SUPABASE_URL | No | - | Supabase project URL |
| SUPABASE_KEY | No | - | Supabase anon key |
| LOG_LEVEL | No | info | Logging level |

### Frontend Environment Variables

| Variable | Required | Default | Description |
|:---------|:---------|:--------|:------------|
| NEXT_PUBLIC_API_URL | *Yes* | - | Backend API URL |

---

## 🔌 API Endpoints

### Scan Endpoints

| Method | Endpoint | Description |
|:-------|:---------|:------------|
| POST | /api/scan | Initiate a new security scan |
| GET | /api/scan/:scanId | Get scan status and results |
| GET | /api/scan | Get all scans |
| GET | /api/scan/:scanId/findings | Get findings for a scan |
| POST | /api/scan/fix | Generate AI fix for a finding |

### GitHub Endpoints

| Method | Endpoint | Description |
|:-------|:---------|:------------|
| POST | /api/github/branch | Create a new branch |
| POST | /api/github/commit | Commit changes to a branch |
| POST | /api/github/pr | Create a pull request |

### Chat Endpoints

| Method | Endpoint | Description |
|:-------|:---------|:------------|
| POST | /api/chat | Send message to AI assistant |

### Health Endpoints

| Method | Endpoint | Description |
|:-------|:---------|:------------|
| GET | /api/health | Check all service health |
| GET | /api/health/kestra | Check Kestra connection |

### Webhook Endpoints

| Method | Endpoint | Description |
|:-------|:---------|:------------|
| POST | /api/webhooks/kestra | Receive Kestra workflow callbacks |

---

## 🔄 Workflow Flow

### Complete Scan Lifecycle


1. USER INITIATES SCAN
   └── Frontend sends POST /api/scan with repoUrl and branch

2. BACKEND PROCESSES REQUEST
   ├── Validates GitHub repository access
   ├── Creates scan record (Supabase or in-memory)
   └── Triggers Kestra workflow

3. KESTRA WORKFLOW EXECUTES
   ├── Step 1: Clone & Scan
   │   ├── Clone repository (fork if no write access)
   │   ├── Run Semgrep scanner
   │   ├── Run Bandit scanner
   │   └── Aggregate findings
   │
   ├── Step 2: Generate Fixes
   │   ├── For each finding:
   │   │   ├── Call backend /api/scan/fix
   │   │   ├── Backend calls Gemini AI
   │   │   └── Apply fix to file
   │   ├── Create fix branch
   │   └── Commit all changes
   │
   └── Step 3: Create PR & Notify
       ├── Create Pull Request on GitHub
       └── Notify backend via webhook

4. BACKEND UPDATES STATUS
   └── Updates scan record with results and PR URL

5. FRONTEND DISPLAYS RESULTS
   └── User sees findings, fixes, and PR link


---

## 🧠 AI Agent Capabilities

### 1. Vulnerability Analysis
The AI analyzes each security finding with context:
- File content and surrounding code
- Vulnerability type and severity
- Scanner tool that detected it

### 2. Fix Generation
For each vulnerability, the AI:
- Understands the security risk
- Generates a complete fixed file
- Provides explanation of changes
- Suggests additional recommendations

### 3. Chat Assistant
Users can ask the AI about:
- Specific vulnerabilities found
- How to fix issues manually
- Security best practices
- Code explanations

### Example AI Fix

*Vulnerability:* SQL Injection (Bandit B608)

*Original Code:*
python
def get_user(user_id):
    query = f"SELECT * FROM users WHERE id = '{user_id}'"
    return db.execute(query)


*AI-Generated Fix:*
python
def get_user(user_id):
    query = "SELECT * FROM users WHERE id = ?"
    return db.execute(query, (user_id,))


---

## 🔧 Troubleshooting

### Common Issues

#### Kestra Connection Failed

Error: Kestra workflow trigger failed

*Solution:*
1. Verify Kestra is running: docker-compose ps
2. Check Kestra logs: docker-compose logs kestra
3. Ensure KESTRA_URL is correct in .env

#### GitHub Authentication Failed

Error: GitHub authentication failed

*Solution:*
1. Verify your GitHub token has required permissions
2. Check token hasn't expired
3. Ensure token is correctly set in both:
   - backend/.env (plain text)
   - backend/docker/.env (base64 encoded)

#### AI Fix Generation Failed

Error: AI service unavailable

*Solution:*
1. Verify AI_API_KEY is valid
2. Check Google AI Studio for quota limits
3. Ensure the model name is correct

#### Docker Network Issues

Error: Backend not accessible from Kestra

*Solution:*
The workflow automatically converts localhost to host.docker.internal for Docker networking. If issues persist:
1. Ensure Docker Desktop is running
2. Try restarting Docker
3. Check firewall settings

### Viewing Logs

*Backend Logs:*
bash
# Logs are in backend/logs/ directory
# Or view console output when running npm run dev


*Kestra Logs:*
bash
cd backend/docker
docker-compose logs -f kestra


*Workflow Execution Logs:*
1. Open Kestra UI (http://localhost:8080)
2. Navigate to Executions
3. Click on the execution to view detailed logs

---

## 🏆 Hackathon: AI Agents Assemble

Estas-AI demonstrates the power of Kestra's AI Agent capabilities:

| Requirement | Implementation |
|:------------|:---------------|
| ✅ AI Agent for Data Summarization | Aggregates findings from multiple scanners |
| ✅ Multi-System Data Aggregation | Normalizes Semgrep, Bandit, Gitleaks output |
| ✅ AI-Driven Decision Making | Gemini decides fix strategies |
| ✅ Autonomous Actions | Auto-creates branches, commits, and PRs |

---

## 📄 License

ISC License

---

<p align="center">
  <strong>Built with ❤ for the AI Agents Assemble Hackathon</strong>
</p>