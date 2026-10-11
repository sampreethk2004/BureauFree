# Backend (NestJS API)

Backend service that powers search, expert recommendations, realtime catalogue snapshots, and state/central portal directories.

## Implemented Modules
- `ServicesController`: public API endpoints under `/api/services`.
- `GovernmentServicesService`: state/category catalogues, live snapshot generation, and equivalent-service suggestions.
- `ExpertSystemService`: intent detection and rules-engine evaluation with explanation and confidence output.
- Static service data and rule bundles in `src/data`.

## API Endpoints
- `GET /health`
- `GET /api/services/states`
- `GET /api/services/categories`
- `GET /api/services/state-portals`
- `GET /api/services/summary`
- `GET /api/services/live-snapshot`
- `GET /api/services/live` (Server-Sent Events)
- `GET /api/services/state-catalogue?state=<STATE>`
- `GET /api/services/category-directory`
- `POST /api/services/search`

Search response includes:
- direct `results`
- `recommendations` from expert system
- `equivalents` from Inter-State Equivalent Finder when local results are limited

## Run Locally
From workspace root:

```bash
pnpm --filter @bureaufree/backend run start:dev
```

Build:

```bash
pnpm --filter @bureaufree/backend run build
```

Tests:

```bash
pnpm --filter @bureaufree/backend test
```

## Key Data Sources
- `src/data/government-services.ts`: service catalogue and search index.
- `src/data/service-rule-bundle.ts`: expert-system rule definitions.

## Notes
- Backend runs on port `3000` by default.
- CORS is enabled for local frontend development.
