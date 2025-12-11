# Automated Security Scanner Backend

Production-grade Node.js backend API for automated security scanning with Kestra orchestration and AI-powered fixes.

## Features

- 🔍 Multi-tool security scanning (Semgrep, ESLint, Bandit, Gitleaks)
- 🤖 AI-powered automatic fix generation using Google Gemini 2.0 Flash
- 🔄 Kestra workflow orchestration
- 🔀 Automated branch creation and pull requests
- 📊 Real-time scan status tracking
- 🔐 Secure GitHub integration

## Prerequisites

- Node.js v18+
- npm or yarn
- GitHub Personal Access Token
- Google Gemini API Key
- Kestra instance (running on http://localhost:8080)
- Security scanning tools installed:
  - semgrep
  - eslint
  - bandit
  - gitleaks

## Installation

1. Clone the repository
2. Install dependencies:

```bash
cd backend
npm install
```

3. Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

4. Edit `.env` with your credentials:
   - `GITHUB_TOKEN`: Your GitHub personal access token
   - `AI_API_KEY`: Your Google Gemini API key (get it from https://aistudio.google.com/apikey)
   - `KESTRA_URL`: Kestra instance URL

## Running the Server

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

The server will start on `http://localhost:3000` by default.

## API Endpoints

### Health Check
```bash
GET /api/health
```

### Initiate Scan
```bash
POST /api/scan
Content-Type: application/json

{
  "repoUrl": "https://github.com/owner/repo",
  "branch": "main"
}
```

### Get Scan Status
```bash
GET /api/scan/:scanId
```

### Fix Security Issue (Internal)
```bash
POST /api/scan/fix
Content-Type: application/json

{
  "scanId": "uuid",
  "finding": { ... },
  "fileContent": "..."
}
```

### Create Pull Request
```bash
POST /api/github/create-pr
Content-Type: application/json

{
  "repoUrl": "https://github.com/owner/repo",
  "head": "security-fixes-branch",
  "base": "main",
  "title": "Security Fixes",
  "body": "Automated security fixes"
}
```

## Architecture

```
backend/
├── server.js              # Express server setup
├── config/                # Configuration management
├── routes/                # API route definitions
├── controllers/           # Request handlers
├── services/              # Business logic
│   ├── kestra.service.js  # Kestra integration
│   ├── scanner.service.js # Security scanning
│   ├── ai-fix.service.js  # AI fix generation
│   ├── github.service.js  # GitHub API
│   └── storage.service.js # In-memory storage
├── utils/                 # Utilities
│   ├── logger.js          # Winston logger
│   ├── errors.js          # Custom errors
│   ├── validator.js       # Input validation
│   └── git.js             # Git operations
└── workflows/             # Kestra workflows
```

## Workflow

1. User initiates scan via POST /api/scan
2. Backend validates repository access
3. Kestra workflow is triggered
4. Repository is cloned
5. Security scans run in parallel
6. Results are aggregated
7. AI generates fixes for each issue
8. Fixes are committed to new branch
9. Pull request is created
10. Backend is notified via webhook

## Security

- Rate limiting: 100 requests per 15 minutes
- Helmet.js security headers
- Input validation with Joi
- Secure token handling
- No sensitive data in logs

## Error Handling

All errors are properly handled and logged:
- ValidationError (400)
- UnauthorizedError (401)
- NotFoundError (404)
- InternalServerError (500)
- ExternalServiceError (503)

## Logging

Logs are written to:
- Console (all levels)
- `logs/error.log` (errors only)
- `logs/combined.log` (all logs)

## Development

### Linting
```bash
npm run lint
```

### Testing

#### Quick Setup
```bash
# Setup test environment (checks dependencies, services, etc.)
bash setup-test-env.sh
```

#### Run Tests
```bash
# Node.js test suite (recommended - comprehensive with colored output)
npm run test:api

# Bash test suite (quick - no dependencies)
npm run test:api:bash

# Custom configuration
BASE_URL=http://localhost:4000 npm run test:api
TEST_REPO=https://github.com/your-org/your-repo npm run test:api
```

#### Test Coverage
The test suite validates:
- ✓ Backend server health and connectivity
- ✓ Kestra server health and workflow deployment
- ✓ All API endpoints (scan, fix, GitHub, webhooks)
- ✓ Input validation and error handling
- ✓ Workflow execution and monitoring
- ✓ End-to-end scan workflow

#### Test Documentation
See [TEST_GUIDE.md](./TEST_GUIDE.md) for:
- Detailed test descriptions
- Troubleshooting guide
- Manual testing examples
- CI/CD integration
- Performance testing

#### Prerequisites for Testing
1. Backend server running on port 3000
2. Kestra server running on port 8080
3. Workflow deployed: `company.team/security-scan-flow`
4. Valid environment variables in `.env`

## Environment Variables

See `.env.example` for all available configuration options.

## Troubleshooting

### Backend won't start
- Check if port 3000 is available
- Verify all environment variables are set
- Check logs in `logs/error.log`

### Kestra connection fails
- Ensure Kestra is running: `curl http://localhost:8080/api/v1/health`
- Verify `KESTRA_URL` in `.env`
- Check Kestra logs

### GitHub API errors
- Verify `GITHUB_TOKEN` has correct permissions
- Check token hasn't expired
- Test token: `curl -H "Authorization: token YOUR_TOKEN" https://api.github.com/user`

### AI fix generation fails
- Verify `AI_API_KEY` is valid
- Check Google Gemini API quota
- Review logs for detailed error messages

## License

ISC
