# BureauFree

BureauFree is a full-stack platform for discovering verified Indian government portals with expert guidance, realtime catalogue insights, and resilient fallback behavior.

No API keys are required for local development.

## What Is Implemented
- Cross-state and central government portal discovery.
- Expert-system recommendations with explanation, confidence score, and matched signals.
- Inter-State Equivalent Finder: when selected-state results are sparse, it suggests central and other-state equivalents.
- Realtime catalogue intelligence via REST snapshot and SSE stream.
- Primary portal directory for each state and union territory.
- Resilient frontend data access with retry, timeout, cache fallback, and stream-to-polling fallback.

## Monorepo Layout
- `apps/backend`: NestJS API and expert-system orchestration.
- `apps/frontend`: React + Vite user interface.
- `packages/rules-engine`: shared rules engine wrapper and validation utilities.
- `docs/`: architecture, journeys, and running instructions.

## Quick Start
Prerequisites:
- Node.js 20+
- pnpm 9+

Install dependencies from workspace root:

```bash
pnpm install
```

Start backend and frontend together:

```bash
pnpm dev
```

Expected runtime:
- Backend: `http://localhost:3000`
- Frontend: `http://localhost:5173` (or next available port such as `5174`)

## Verify Runtime Output
PowerShell checks:

```powershell
Invoke-RestMethod http://localhost:3000/health
Invoke-RestMethod http://localhost:3000/api/services/live-snapshot
```

Equivalent finder check:

```powershell
$body = @{ state = 'Ladakh'; query = 'driving licence renewal'; category = 'Transport' } | ConvertTo-Json
Invoke-RestMethod -Method Post -Uri http://localhost:3000/api/services/search -ContentType 'application/json' -Body $body
```

## Key Backend Endpoints
- `GET /health`
- `GET /api/services/states`
- `GET /api/services/categories`
- `GET /api/services/state-portals`
- `GET /api/services/summary`
- `GET /api/services/live-snapshot`
- `GET /api/services/live` (SSE stream)
- `GET /api/services/state-catalogue?state=<STATE>`
- `GET /api/services/category-directory`
- `POST /api/services/search`

## Common Scripts
From repository root:

```bash
pnpm dev
pnpm build
pnpm test
pnpm lint
pnpm validate
```

## Additional Docs
- Local run guide: `docs/running-project.md/README.md`
- Backend details: `apps/backend/README.md`
- Frontend details: `apps/frontend/README.md`
- Rules engine package: `packages/rules-engine/README.md`
