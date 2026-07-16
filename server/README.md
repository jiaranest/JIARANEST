# Jiaranest Catalog API (Phase 2a)

NestJS + Prisma + PostgreSQL backend that serves the storefront's catalog. It
implements the exact `CatalogService` contract the Angular app already consumes,
seeded from the same data as the Phase-1 mock — so switching the frontend from
mock to API is invisible to the UI.

## Prerequisites
- Node 22+
- **Docker Desktop** (for local Postgres) — or a local/hosted Postgres you point
  `DATABASE_URL` at.

## First-time setup

Easiest: from `server/`, run **`setup.cmd`** (does steps 1–5 below, stopping on
any error). Then `npm run start:dev`.

Or manually:

```bash
cd server

docker compose up -d            # start local Postgres
copy .env.example .env          # create .env (Windows; use cp on mac/linux)
npm install                     # install deps
npx prisma db push              # create tables from schema
npm run seed                    # 32 products, 13 categories (identical to the mock)
npm run start:dev               # run the API (watch mode)
```

The API is then at **http://localhost:3000/api**.

> **Deployment:** see `../DEPLOY.md` for hosting the API on Render (with managed
> Postgres) + the frontend on GitHub Pages.

## Point the storefront at it
In `src/app/core/config/environment.ts` (Angular app), `useApi` is already
`true`, so `npm start` in the repo root will hit this API. Set `useApi: false`
to fall back to the in-memory mock (e.g. if the backend isn't running).

## Endpoints
All under `/api`:

| Method | Route | Purpose |
|---|---|---|
| GET | `/categories` | all categories (with productCount) |
| GET | `/categories/:slug` | one category |
| GET | `/products` | filtered/sorted/paginated list (query params below) |
| GET | `/products/facets` | facet values for the current scope |
| GET | `/products/:slug` | product detail |
| GET | `/products/:slug/related` | related products (`?limit=`) |
| GET | `/rails/featured` `/new` `/best` `/trending` | home rails |
| GET | `/suggest?q=` | search autosuggest |

**Product query params:** `categoryId, search, sort (latest|popular|price-asc|price-desc),
minPrice, maxPrice, brands, colors, sizes, ageGroups, gender, minRating,
inStockOnly, minDiscount, page, pageSize`. Array params accept repeated
(`brands=A&brands=B`) or comma-separated (`brands=A,B`) forms.

### Auth (Phase 2b)

| Method | Route | Body / Auth | Purpose |
|---|---|---|---|
| POST | `/auth/otp/request` | `{ email }` | generate + email the OTP (via Brevo) |
| POST | `/auth/otp/verify` | `{ email, code }` | verify → `{ token, user }` |
| GET | `/auth/me` | `Authorization: Bearer <token>` | current user |

**Email OTP delivery:** a real 6-digit code is generated and emailed via
**[Brevo](https://brevo.com)** (HTTP API — works on hosts that block SMTP ports
like Render). Set `BREVO_API_KEY` + `MAIL_FROM_EMAIL` + `MAIL_FROM_NAME` in
`.env` (and on Render). The `MAIL_FROM_EMAIL` must be verified as a sender in
Brevo (Senders & IPs). If `BREVO_API_KEY` is empty, the code is **logged to the
API console** instead (dev). Codes expire in 5 minutes; 5 wrong attempts locks
that code.

> Brevo free tier: 300 emails/day to **any** address, no domain needed. There is
> no hardcoded bypass code; login requires the real emailed code (or the
> console-logged one if the key is unset).

**Test with curl:**
```bash
curl -X POST http://localhost:3000/api/auth/otp/request \
  -H "Content-Type: application/json" -d "{\"email\":\"you@example.com\"}"
# → { "ok": true }   (check your inbox, or the API console if no BREVO_API_KEY)

curl -X POST http://localhost:3000/api/auth/otp/verify \
  -H "Content-Type: application/json" -d "{\"email\":\"you@example.com\",\"code\":\"THE_CODE_FROM_EMAIL\"}"
# → { "token": "...", "user": { ... } }

curl http://localhost:3000/api/auth/me -H "Authorization: Bearer <token-from-above>"
# → { "id": "...", "name": "Shopper", "email": "you@example.com", "method": "otp" }
```

### Orders (Phase 2c)

All order routes require `Authorization: Bearer <token>` and belong to that user.
Totals are **recomputed on the server** from real prices — client totals are
never trusted.

| Method | Route | Purpose |
|---|---|---|
| POST | `/orders` | create an order from `{ items, address, delivery, paymentMethod, couponCode? }` |
| GET | `/orders` | the logged-in user's order history |
| GET | `/orders/:orderNumber` | one of the user's orders |

**Test with curl** (use a token from the auth verify step above):
```bash
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" -H "Authorization: Bearer <token>" \
  -d "{\"items\":[{\"slug\":\"cuddles-the-plush-teddy-bear-large\",\"quantity\":2}],\"address\":{\"name\":\"Test\",\"phone\":\"9876543210\",\"line1\":\"1 Main St\",\"city\":\"Chennai\",\"state\":\"TN\",\"pincode\":\"600001\"},\"delivery\":\"standard\",\"paymentMethod\":\"upi\",\"couponCode\":\"PLAY10\"}"
# → { "orderNumber": "JN...", "total": ..., "items": [...], ... }  (totals computed server-side)

curl http://localhost:3000/api/orders -H "Authorization: Bearer <token>"
# → [ { the order above } ]
```

## Notes
- The seed imports `CATEGORIES`/`PRODUCTS` directly from the Angular app's
  `mock-data.ts` (framework-agnostic TS), so the DB is byte-identical to the
  mock — including the SVG data-URI galleries. Real photo upload is a later phase.
- Filter/sort/facet/scope/rail semantics mirror `MockCatalogService` exactly.
- Common commands: `npm run db:reset` (drop + recreate + reseed),
  `npm run migrate` (new migration), `npm run build && npm run start:prod`.
```
