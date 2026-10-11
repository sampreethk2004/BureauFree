# Frontend (React + Vite)

User-facing dashboard for discovering official portals with expert guidance and realtime catalogue awareness.

## Implemented Features
- Search across state and central services.
- Expert-system recommendations with:
	- confidence percentage
	- explanation text
	- matched intent signals
- Inter-State Equivalent Finder section for sparse-result scenarios.
- Primary state/UT portal directory.
- Category directory across central and state services.
- Realtime live-status strip and insights backed by backend snapshot + SSE stream.
- Resilient data behavior using retry, timeout, and cache fallback.

## Run Locally
From workspace root:

```bash
pnpm --filter @bureaufree/frontend run dev
```

Build:

```bash
pnpm --filter @bureaufree/frontend run build
```

Preview production build:

```bash
pnpm --filter @bureaufree/frontend run preview
```

## Environment
Optional override file: `apps/frontend/.env`

```bash
VITE_BACKEND_URL=https://your-backend.example.com
```

If omitted, local development uses Vite proxy to `http://localhost:3000`.

## UX Notes
- App works best with backend running for realtime updates.
- If live stream fails temporarily, UI falls back to polling mode automatically.
- If Vite port `5173` is busy, it uses the next available port.
