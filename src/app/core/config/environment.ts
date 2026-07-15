/**
 * Runtime configuration for the storefront.
 *
 * `dataMode` decides which service implementations app.config binds:
 *   - 'api'      → Http* only (real NestJS API; errors if it's down)
 *   - 'mock'     → Mock* only (in-memory Phase-1 data/auth/orders; no backend)
 *   - 'fallback' → try the API, transparently use the mock if it errors/times out
 *
 * 'fallback' is the safe default for a deployed demo: live data when the backend
 * is up, static data when it's down/asleep — the site always works.
 *
 * `apiUrl` is chosen at runtime by host: local dev targets the local API;
 * anywhere else (e.g. GitHub Pages) targets the deployed API.
 */

// ⬇️ After deploying the backend to Render, paste its URL here (with /api).
const PROD_API_URL = 'https://jiaranest-api.onrender.com/api';

const LOCAL_API_URL = 'http://localhost:3000/api';

function isLocalHost(): boolean {
  if (typeof location === 'undefined') return true;
  const h = location.hostname;
  return h === 'localhost' || h === '127.0.0.1' || h === '';
}

export type DataMode = 'api' | 'mock' | 'fallback';

export const environment = {
  /** 'api' | 'mock' | 'fallback' — see the doc comment above. */
  dataMode: 'fallback' as DataMode,
  /** Base URL of the catalog/auth/orders API — local in dev, deployed in prod. */
  apiUrl: isLocalHost() ? LOCAL_API_URL : PROD_API_URL,
};
