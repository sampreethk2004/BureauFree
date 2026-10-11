# Running BureauFree locally

## Prerequisites
- Node.js 20 or newer.
- pnpm 9 or newer.

## One-time setup
- Install dependencies from the workspace root:
  ```bash
  pnpm install
  ```

## Start full stack in one command
- From the workspace root run:
  ```bash
  pnpm dev
  ```
- This starts backend and frontend together.
- Wait for backend log: `BureauFree backend running on port 3000`.
- Vite usually starts on `http://localhost:5173/`.
- If 5173 is busy, Vite will pick the next free port (for example `http://localhost:5174/`).

## Alternative: run each app separately
- Backend:
  ```bash
  pnpm --filter @bureaufree/backend run start:dev
  ```
- Frontend (second terminal):
  ```bash
  pnpm --filter @bureaufree/frontend run dev
  ```

## Configure the API base URL
- Development uses Vite's proxy to forward `/api` calls to `http://localhost:3000`, so no extra setup is needed when running both apps locally.
- To point the dashboard at a different backend (for example, a deployed Nest instance), create `apps/frontend/.env` with:
  ```bash
  VITE_BACKEND_URL=https://your-backend.example.com
  ```
- The helper now tolerates trailing slashes or pre-set `/api` segments, so the value can be either the bare origin (`https://api.example.com`) or a scoped path (`https://api.example.com/api`).
- If you see "Catalogue insights are unavailable right now", confirm the backend summary endpoint is reachable from the browser.

## Verify backend and realtime features
- Health check:
  ```powershell
  Invoke-RestMethod http://localhost:3000/health
  ```
- Realtime snapshot check:
  ```powershell
  Invoke-RestMethod http://localhost:3000/api/services/live-snapshot
  ```
- Equivalent finder check:
  ```powershell
  $body = @{ state = 'Ladakh'; query = 'driving licence renewal'; category = 'Transport' } | ConvertTo-Json
  Invoke-RestMethod -Method Post -Uri http://localhost:3000/api/services/search -ContentType 'application/json' -Body $body
  ```
- In the response, `counts.equivalents` should be greater than 0 for sparse-state searches.

## View the dashboard
- Open the Vite URL printed in terminal.
- The frontend proxies API calls to `http://localhost:3000/`, so keep both servers running.

## Shut everything down
- Stop each server with `Ctrl + C` in its terminal when you're done.

## Troubleshooting startup issues
- Make sure commands run from the workspace root (`Get-Location` should show `C:\PBL-(3-2)`).
- If the backend fails with `EADDRINUSE` on port 3000, free the port before retrying:
  ```powershell
  Get-NetTCPConnection -LocalPort 3000
  taskkill /F /PID <PID_FROM_ABOVE>
  ```
- Replace `<PID_FROM_ABOVE>` with the exact OwningProcess value returned (for example `taskkill /F /PID 22420`).
- If frontend picks a different port, use the URL shown by Vite instead of assuming 5173.
- After killing processes or changing `VITE_BACKEND_URL`, restart the dev command so changes are applied.

