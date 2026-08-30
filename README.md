# next-items

Next.js inventory UI for the [`pymongo-items`](https://github.com/chandan632/pymongo-items) FastAPI backend.

## Included

| Area | Implementation |
|------|----------------|
| Auth | Login / logout / refresh; access token in memory; CSRF from API body + `sessionStorage`; admin **Users** at `/admin/users`; change password at `/account/change-password` |
| Roles | `viewer` (read/export), `editor` (mutations), `admin` (seed + user admin) |
| Table | Server-driven list: search, filters, sort, **cursor** pagination (10 / 50 / 100 / 500) |
| UX | Column hide/reorder, row virtualization, URL-synced state, toasts, password show/hide |
| Actions | Create / edit / archive / delete; multi-select and bulk; CSV export |
| Security | Session flag cookie + Next middleware; forced logout on `PRIVILEGES_CHANGED` / `ACCOUNT_INACTIVE`; CSP / clickjacking headers |
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
│   ├── app/
│   │   ├── page.tsx                 # items table
│   │   ├── login/
│   │   ├── account/change-password/ # any logged-in user
│   │   └── admin/users/             # admin only
│   ├── components/
│   │   ├── items/
│   │   ├── users/
│   │   └── ui/                      # Modal, PasswordInput, …
│   ├── contexts/
│   ├── hooks/                       # useCursorPagination, useRequireAdmin, …
│   ├── lib/                         # API client, env, types, columns
│   └── middleware.ts
├── vitest.config.mts
└── .env.example
```

## Quick start

Requirements: Node.js 20.9+, [`pymongo-items`](https://github.com/chandan632/pymongo-items) running on port 8000 with an admin user.

Full stack (Mongo/Redis + API + this UI): see **Fresh local run** in the [`pymongo-items` README](https://github.com/chandan632/pymongo-items#fresh-local-run-api--ui).

UI only (API already up):

```bash
git clone https://github.com/chandan632/next-items.git
cd next-items
cp --update=none .env.example .env.local
npm ci
npm run dev
npx pre-commit install   # optional
```

| URL | Purpose |
|-----|---------|
| http://localhost:3000 | Items table — login `admin@example.com` / `AdminPass123` |
| http://localhost:3000/admin/users | User management (admin only) |
| http://localhost:3000/account/change-password | Change password (all roles) |

Admin-created users use `DEFAULT_USER_PASSWORD` / `NEXT_PUBLIC_DEFAULT_USER_PASSWORD` (must match) until they change it.

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
| `NEXT_PUBLIC_DEFAULT_USER_PASSWORD` | `password` | UI copy for create/reset; must match backend |

`NEXT_PUBLIC_API_URL` is required in production builds.

## Auth flow

1. `/login` → `POST /api/v1/auth/login` (stores access token + `csrf_token` from JSON; refresh cookie from API)
2. Access token in memory; CSRF also kept in `sessionStorage` so hard reloads can refresh
3. Mutating calls send Bearer + CSRF; single-flight refresh on 401
4. `PRIVILEGES_CHANGED` / `ACCOUNT_INACTIVE` → clear session and redirect to login (no refresh retry)
5. Logout / successful password change clears client session and cookies

## URL state

Synced query params: `cursor`, `page_size`, `sort_by`, `sort_order`, `q`, `category`, `status`, `min_price`, `max_price`, `min_quantity`, `max_quantity`.

Example: `/?q=lamp&status=active&sort_by=price&sort_order=asc&cursor=...`

Pager is previous/next via cursor stack (not page numbers).

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

Use the **Fresh local run** section in [`pymongo-items`](https://github.com/chandan632/pymongo-items#fresh-local-run-api--ui), then open this app.
