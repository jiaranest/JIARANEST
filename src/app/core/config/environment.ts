/**
 * Runtime configuration for the storefront.
 *
 * `useApi` decides which service implementations app.config binds:
 *   - true  → Http* (the real NestJS API at apiUrl)
 *   - false → Mock* (the in-memory Phase-1 data / auth / order stubs)
 *
 * The mocks stay in the codebase as a fallback, so flipping useApi to false
 * instantly restores a fully working (mock) app if the backend is unavailable.
 *
 * `apiUrl` is chosen at runtime by host: on localhost it targets the local
 * dev API; anywhere else (e.g. GitHub Pages) it targets the deployed API.
 * Set PROD_API_URL below to your Render URL after deploying the backend.
 */

// ⬇️ After you deploy the backend to Render, paste its URL here (with /api).
//    e.g. 'https://jiaranest-api.onrender.com/api'
const PROD_API_URL = 'https://jiaranest-api.onrender.com/api';

const LOCAL_API_URL = 'http://localhost:3000/api';

function isLocalHost(): boolean {
  if (typeof location === 'undefined') return true;
  const h = location.hostname;
  return h === 'localhost' || h === '127.0.0.1' || h === '';
}

export const environment = {
  /** Use the real API (true) or the in-memory mocks (false). */
  useApi: true,
  /** Base URL of the catalog/auth/orders API — local in dev, deployed in prod. */
  apiUrl: isLocalHost() ? LOCAL_API_URL : PROD_API_URL,
};
