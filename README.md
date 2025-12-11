# Security AutoFix

Automated security vulnerability scanner and fixer using Kestra, Gemini AI, and multiple security tools.

## Architecture

- **Kestra** - Workflow orchestration
- **Backend** - Node.js/Express API proxy
- **Frontend** - React dashboard

## Security Tools Used

- Semgrep - Static analysis
- Bandit - Python security linter
- Gitleaks - Secret detection
- ESLint - JavaScript linting

## Quick Start

```bash
# Start all services
cd docker
docker-compose up -d

# Access
# - Frontend: http://localhost:3000
# - Kestra UI: http://localhost:8080
# - Backend API: http://localhost:3001
```

## Local Development

```bash
# Backend
cd backend
npm install
cp .env.example .env
npm run dev

# Frontend
cd frontend
npm install
npm run dev
```

## Environment Variables

### Backend (.env)
- `KESTRA_API_URL` - Kestra API endpoint
- `KESTRA_API_TOKEN` - Optional auth token
- `PORT` - Server port (default: 3001)

### Kestra Secrets
- `GEMINI_API_KEY` - Google Gemini API key
- `GITHUB_TOKEN` - GitHub PAT for PR creation
