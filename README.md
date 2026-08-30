# next-items

Next.js inventory UI for the [`pymongo-items`](../pymongo-items) FastAPI backend.

## Included

| Area | Implementation |
|------|----------------|
| Auth | Login / logout / refresh; access token in memory; HttpOnly refresh + CSRF cookies from API |
| Roles | `viewer` (read/export), `editor` (mutations), `admin` (seed when API allows) |
| Table | Server-driven list: search, filters, sort, pagination (10 / 50 / 100 / 500) |
| UX | Column hide/reorder, row virtualization, URL-synced state, toasts, empty/error states |
| Actions | Create / edit / archive / delete; multi-select and bulk; CSV export |
| Security | Session flag cookie + Next middleware gate; CSP / clickjacking headers; HSTS in production |
| Quality | ESLint, Prettier, TypeScript, Vitest, Playwright, pre-commit, GitHub Actions CI |

## Stack

| Piece | Choice |
|-------|--------|
| Framework | Next.js 16 (App Router, `output: "standalone"`) |
| Language | TypeScript, React 19 |
| Styling | Tailwind CSS |
| Tests | Vitest + Testing Library; Playwright E2E |

## Layout

```
next-items/
├── Dockerfile
├── playwright.config.ts
├── e2e/
├── src/
│   ├── app/                # /, /login, error / loading
│   ├── components/
│   │   ├── items/          # table, toolbar, filters, bulk
│   │   └── ui/
│   ├── contexts/
│   ├── hooks/
│   ├── lib/                # API client, env, types, columns
│   └── middleware.ts
├── vitest.config.mts
└── .env.example
```

## Quick start

Requirements: Node.js 20.9+, `pymongo-items` running on port 8000 with an admin user.

Full stack (Mongo/Redis + API + this UI): see **Fresh local run** in [`pymongo-items/README.md`](../pymongo-items/README.md).

UI only (API already up):

```bash
cd /home/chandan/workspace/Items/next-items
cp --update=none .env.example .env.local
npm ci
npm run dev
npx pre-commit install   # optional
```

App: http://localhost:3000 — login `admin@example.com` / `AdminPass123` (or the admin you created on the API)

## Environment

| Variable | Example | Purpose |
|----------|---------|---------|
| `NEXT_PUBLIC_API_URL` | `http://localhost:8000` | Backend origin |
| `NEXT_PUBLIC_API_PREFIX` | `/api/v1` | Must match backend `API_PREFIX` |
| `NEXT_PUBLIC_APP_NAME` | `Items` | UI title |
| `NEXT_PUBLIC_LOGIN_PATH` | `/login` | Auth redirect |
| `NEXT_PUBLIC_CSRF_COOKIE_NAME` | `csrf_token` | Must match backend |
| `NEXT_PUBLIC_CSRF_HEADER_NAME` | `X-CSRF-Token` | Must match backend |
| `NEXT_PUBLIC_SESSION_COOKIE_NAME` | `items_session` | Route middleware session flag |

`NEXT_PUBLIC_API_URL` is required in production builds.

## Auth flow

1. `/login` → `POST /api/v1/auth/login`
2. Access token held in memory; refresh cookie set by API
3. Client sends Bearer + CSRF on mutating calls; one refresh retry on 401
4. Logout clears local session and calls `POST /api/v1/auth/logout`

## URL state

Synced query params: `cursor`, `page_size`, `sort_by`, `sort_order`, `q`, `category`, `status`, `min_price`, `max_price`, `min_quantity`, `max_quantity`.

Example: `/?q=lamp&status=active&sort_by=price&sort_order=asc&cursor=...`

## Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Dev server |
| `npm run build` / `npm run start` | Production build and serve |
| `npm run lint` | ESLint |
| `npm run format` / `format:check` | Prettier |
| `npm run typecheck` | `tsc --noEmit` |
| `npm test` | Vitest |
| `npm run test:e2e` | Playwright |

```bash
npm test
npm run lint
npm run format:check
npm run typecheck
npm run build
```

E2E needs the API up (set `E2E_EMAIL` / `E2E_PASSWORD` if not using the default admin):

```bash
npx playwright install --with-deps chromium
npm run test:e2e
```

## Docker

```bash
docker build --build-arg NEXT_PUBLIC_API_URL=http://host.docker.internal:8000 -t next-items .
docker run --rm -p 3000:3000 next-items
```

## Backend

Use the **Fresh local run** section in [`pymongo-items`](../pymongo-items/README.md), then open this app.
