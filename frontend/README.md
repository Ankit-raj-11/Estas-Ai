# Estas-AI Frontend

Modern, developer-focused SaaS frontend for the AI-powered security scanner.

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui components
- Lucide Icons
- React Query (TanStack Query)
- Sonner for notifications

## Getting Started

### Prerequisites

- Node.js 18+
- Backend server running on port 3000

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The frontend will be available at **http://localhost:3001**

### Environment Variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Configure:
```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

## Pages

| Route | Description |
|-------|-------------|
| `/` | Landing page with features overview |
| `/dashboard` | Overview of all scans with stats |
| `/scan` | Start a new security scan |
| `/scan/[scanId]` | View scan details and findings |
| `/health` | System health monitoring |
| `/logs` | Execution logs viewer |

## Features

- Real-time scan status polling
- Dark theme with cyber/security aesthetic
- Responsive design
- Timeline visualization for scan progress
- Severity badges for vulnerabilities
- Copy-to-clipboard support
- Toast notifications

## Development

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

## API Integration

The frontend connects to these backend endpoints:

- `GET /api/health` - System health check
- `POST /api/scan` - Initiate new scan
- `GET /api/scan/all` - List all scans
- `GET /api/scan/:scanId` - Get scan details
- `GET /api/scan/:scanId/findings` - Get scan findings

API requests are proxied through Next.js rewrites to avoid CORS issues.
