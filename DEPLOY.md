# Deploying Jiaranest

Two pieces deploy to two places:

| Piece | Host | Result |
|---|---|---|
| **Frontend** (Angular) | GitHub Pages | `https://<you>.github.io/JIARANEST/` |
| **Backend** (NestJS + Postgres) | Render (free) | `https://jiaranest-api.onrender.com` |

The frontend talks to the backend over HTTPS. Do the backend first (you need its
URL for the frontend).

> **Free-tier caveats (Render):** the web service **sleeps after ~15 min idle**
> and takes ~30–60s to wake on the next request. The free Postgres instance
> **expires after ~90 days**. Fine for a demo/portfolio; upgrade for real traffic.

---

## Part 0 — Push the repo to GitHub (one time)

Render and GitHub Pages both deploy *from* GitHub, so the code must be there.

```bash
# from the repo root
git init
git add .
git commit -m "Jiaranest: Phase 1 storefront + Phase 2 backend"
# create an empty repo on github.com first (e.g. named JIARANEST), then:
git remote add origin https://github.com/<you>/JIARANEST.git
git branch -M main
git push -u origin main
```

Check that **`node_modules/` and `.env` are NOT committed** (they're in
`.gitignore` / `server/.gitignore`). `git status` should not list them.

---

## Part 1 — Backend on Render

1. Go to **https://render.com** → sign up / log in **with GitHub**.
2. **New + → Blueprint**.
3. Pick your **JIARANEST** repo. Render reads `render.yaml` and shows two
   resources: **jiaranest-db** (Postgres) and **jiaranest-api** (web service).
4. Click **Apply**. Render will:
   - create the free Postgres DB,
   - build the API (`npm run render:build`),
   - start it (`npm run render:start`), which runs `prisma migrate deploy`,
     seeds the 30 products, then serves.
5. Wait for the API service to go **Live**. Note its URL, e.g.
   `https://jiaranest-api.onrender.com`.
6. **Verify:** open `https://jiaranest-api.onrender.com/api/categories` — you
   should see the 11 categories as JSON. (First hit may take ~40s if asleep.)

### Set CORS to your GitHub Pages URL
The API must allow your frontend's origin.

7. In Render → **jiaranest-api → Environment** → edit **CORS_ORIGIN** to your
   GitHub Pages origin **without a trailing slash**:
   ```
   https://<you>.github.io
   ```
8. Save — the service redeploys. (Do this after Part 2 if you don't know the URL
   yet; it's just your github username.)

---

## Part 2 — Frontend on GitHub Pages

1. **Point the app at your API.** Edit
   `src/app/core/config/environment.ts` and set `PROD_API_URL` to your Render
   URL **including `/api`**:
   ```ts
   const PROD_API_URL = 'https://jiaranest-api.onrender.com/api';
   ```
   (On localhost the app still uses the local API automatically.)

2. Commit + push that change:
   ```bash
   git add src/app/core/config/environment.ts
   git commit -m "Point frontend at deployed API"
   git push
   ```

3. **Build + publish** to GitHub Pages (existing scripts):
   ```bash
   npm run deploy
   ```
   This bumps the version, builds with base-href `/JIARANEST/`, adds the SPA
   404 fallback, and publishes to the `gh-pages` branch.

4. In your GitHub repo → **Settings → Pages** → ensure the source is the
   **`gh-pages`** branch. Your site goes live at
   `https://<you>.github.io/JIARANEST/`.

---

## Part 3 — Verify end-to-end

Open `https://<you>.github.io/JIARANEST/` and check:

- **Products load** → catalog API reachable + CORS OK.
- **Login** (Buy Now → OTP `123456`) → auth API OK.
- **Place an order** at checkout → order API OK (order number starts `JN`).

If products don't load, open DevTools → Network:
- **CORS error** → fix `CORS_ORIGIN` on Render (Part 1, step 7) — no trailing slash.
- **calls go to `localhost:3000`** → `PROD_API_URL` wasn't set / not rebuilt (Part 2, step 1).
- **slow first load** → the free API was asleep; retry after ~40s.

---

## Notes
- **Repo/base-href name:** the frontend build uses base-href `/JIARANEST/`, so
  the GitHub repo (and Pages path) must be **JIARANEST**. If you name the repo
  differently, change `--base-href` in `package.json`'s `build:gh` script to
  `/<your-repo-name>/`.
- **Switching off the backend:** set `useApi: false` in `environment.ts` to make
  the deployed site run entirely on mock data (no backend needed) — handy if the
  free DB expires.
- **Re-seeding prod:** the start command seeds every boot (idempotent — it
  clears + reloads the catalog). Fine for a demo; remove `npm run seed` from
  `render:start` once you don't want the catalog reset on each deploy.
