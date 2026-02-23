# Ass Index

React + Vite front-end for the Ass Index experience: Better or Worse game, live WrestleTalk table, and hidden admin tooling.

## Getting Started

```bash
npm install
cp .env.example .env.local # optional – configure API + tokens
npm run dev
```

### Live Table API (shared backend)

To keep the WrestleTalk live table consistent across browsers, run the lightweight JSON API bundled with the repo:

```bash
LIVE_TABLE_TOKEN=dev-admin-token npm run live-table:server
```

This boots an Express server on `http://localhost:4000/live-table`. Point the client at it by setting `VITE_LIVE_TABLE_API` (see `.env.example`). Save operations send an `x-admin-token` header that must match `LIVE_TABLE_TOKEN`.

- Data persists to `live-data/live-table.json`.
- You can change the path via `LIVE_TABLE_PATH=/some/other.json`.
- Deploy the server as a standalone service (Fly.io, Render, etc.) for real shared usage.

### Environment Variables

| Variable | Description |
| --- | --- |
| `VITE_LIVE_TABLE_API` | Absolute URL to the live table endpoint. Defaults to `/api/live-table`. |
| `VITE_LIVE_TABLE_API_KEY` | Optional secret sent with each request (header `x-admin-token`). |
| `LIVE_TABLE_TOKEN` | Server-side copy of the shared secret required for PUT requests. |
| `LIVE_TABLE_PATH` | Override where the JSON payload is stored on disk. |

## Scripts

| Script | Description |
| --- | --- |
| `npm run dev` | Vite dev server (front-end only). |
| `npm run live-table:server` | Express API that stores/retrieves the live table JSON. |
| `npm run build` | Production build via Vite. |
| `npm run preview` | Preview the production build. |
| `npm run lint` | ESLint. |

## Hidden Admin Flow

- Click the navbar logo 4x to unlock the admin prompt (code `2105`).
- Use Manual Entry or Play Live to append picks.
- Updates now hit the shared API so everyone sees the same Better/Worse ledgers.
