# Jiaranest Storefront — project guide

**Jiaranest** is a **kids-only** e-commerce storefront selling **toys and children's clothing exclusively** — no other product categories. Built with **Angular 22** (standalone components, signals, zoneless) and **Angular Material 3** with a custom theme. **Phase 1** delivered the customer-facing storefront over a **mock data layer**. **Phase 2a (in progress)** adds a real **catalog backend** (NestJS + Prisma + PostgreSQL in `server/`) behind the same `CatalogService` seam; the storefront switches mock→API via `environment.useApi` (see `core/config/environment.ts`). Real auth, payments, orders, and the admin panel remain later phases.

> The internal CSS/DI namespace prefix `zylo-` / `--zylo-` and the `ZyloTestingApp` folder are retained from the original scaffold — they are internal only and not shown to users. All user-facing text says "Jiaranest".

**Catalog shape:** two top categories — **Toys** and **Clothing** — each with subcategories (see `mock-data.ts`), plus an **age-group** facet (`0-2` / `3-5` / `6-8` / `9-12`, from `AGE_GROUPS` in `product.model.ts`) surfaced as "Shop by Age" (via the `?age=` query param on `/search`) and a Gender filter (boys/girls/unisex). A **top** category listing includes all of its subcategories' products (see `categoryScope()` in `mock-catalog.service.ts`). Demo coupons: `PLAY10`, `FLAT300`, `WELCOME`. Free shipping over ₹999.

## Run

```bash
# Node 22+ required (this machine uses a per-user install at %LOCALAPPDATA%\node)
npm start          # ng serve on http://localhost:4200
npm run build      # production build to dist/
npm test           # vitest
```

**Backend (Phase 2a catalog API)** — see `server/README.md`. Local dev uses
**SQLite** (a single file, no Docker/DB server). Easiest: `cd server` then run
`setup.cmd`, then `npm run start:dev`. Manual:

```bash
cd server
copy .env.example .env         # create .env
npm install
npx prisma migrate dev --name init   # creates prisma/dev.db + tables
npm run seed                   # load the 30 products (identical to the mock)
npm run start:dev              # API on http://localhost:3000/api
```

With the API running and `environment.useApi === true`, the storefront serves
live data. Set `useApi: false` to fall back to the in-memory mock. (Postgres is
the production target — swap the Prisma provider when deploying.)

## Architecture

```
src/app/
  core/
    models/        Plain interfaces (Product, Category, Cart, filters). Framework-agnostic.
    data/
      catalog.service.ts        ABSTRACT CatalogService + CATALOG_SERVICE token — the API seam.
      mock-catalog.service.ts   In-memory impl (filter/sort/facet/paginate). Bound in app.config.ts.
      mock-data.ts              The seed catalog (categories + products + reviews).
    state/         Signal-based stores: cart, wishlist, auth (stub), login-gate.
    util/          format.ts (inr()).
  shared/          Reusable UI: header, footer, product-card, product-rail, star-rating,
                   quantity-selector, quick-view (dialog), login-dialog (dialog).
  features/        Route components (lazy-loaded): home, listing, product, cart, wishlist, checkout.
```

### The one seam that matters
`CatalogService` is an **abstract class** used as a DI token. `app.config.ts` binds it to
`MockCatalogService`. To go live, implement `HttpCatalogService` against the real API and change
that single provider line — no component touches change.

### Conventions
- Standalone components only, `ChangeDetectionStrategy.OnPush`, signals for state.
- New Angular control flow (`@if` / `@for` / `@switch`), not `*ngIf` / `*ngFor`.
- Design tokens are CSS custom properties (`--zylo-*`) defined in `src/styles.scss`.
- Money is whole rupees; format with `inr()` from `core/util/format.ts`.
- Login is **not** required to browse or add to cart. It is gated only at Buy Now /
  Proceed to Checkout via `LoginGateService.ensureLoggedIn()`.
- Cart/wishlist/auth persist to `localStorage` (`jiara.*` keys).

### Mock behaviours worth knowing
- Product/category images: on-theme **SVG illustrations** from `core/data/illustrations.ts` (teddy, blocks, dress, kurta, …), embedded as `data:` URIs — no external files or photos. `illustrationFor(name, categoryId)` maps each product to a look; `avatar(name)` makes initial-in-circle avatars for testimonials/reviews. To use real product photos later, replace `galleryFor()` in `mock-data.ts` (and the category `image` fields) with real URLs.
- OTP login accepts any 4–6 digit code; Google login is a one-click stub.
- Coupons: `PLAY10` (10% off), `FLAT300` (₹300 off over ₹1,499), `WELCOME` (15% off, min ₹999) — see `cart.service.ts`.
- Order numbers / delivery ETAs are derived deterministically (no `Date.now()`), so the app
  behaves predictably.

## Phases
- **Phase 1 (done):** storefront over the in-memory mock (`MockCatalogService`).
- **Phase 2a (in progress):** catalog backend — NestJS + Prisma + PostgreSQL in
  `server/`, serving the `CatalogService` contract; `HttpCatalogService` bound
  via `environment.useApi`. Cart/auth/orders still client-side.

## Not yet built (future phases)
Server-side cart/orders & checkout API · real OTP/Google SSO · Razorpay/Stripe ·
S3 image upload · admin panel · Google Analytics + Meta Pixel · SSR for SEO.
```
