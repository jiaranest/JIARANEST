/**
 * Dev-only tool: snapshots the storefront's mock catalog into a plain JSON file
 * (`seed-data.json`) that the deploy-time seed reads. This keeps the seed
 * self-contained — no cross-folder TS import, no ts-node needed on the host.
 *
 * Re-run locally whenever the mock catalog changes:
 *   npm run gen:seed
 */
import { writeFileSync } from 'fs';
import { join } from 'path';
import { CATEGORIES, PRODUCTS } from '../../src/app/core/data/mock-data';

const out = join(__dirname, 'seed-data.json');
writeFileSync(out, JSON.stringify({ categories: CATEGORIES, products: PRODUCTS }, null, 2));
console.log(`Wrote ${CATEGORIES.length} categories + ${PRODUCTS.length} products to ${out}`);
