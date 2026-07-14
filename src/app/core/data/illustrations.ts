/**
 * Category-matched SVG illustrations for the Jiaranest catalog.
 *
 * We have no way to ship real product photography, so instead of random
 * placeholder photos every product/category gets a clean, on-theme vector
 * illustration (teddy, blocks, dress, …) rendered on a soft pastel background
 * and embedded as a `data:` URI — no external files, no network, no copyright.
 *
 * Add a new look by adding a `Kind` + an entry in `ART`.
 */

export type Illustration =
  | 'teddy'
  | 'blocks'
  | 'magnet-tiles'
  | 'doll'
  | 'action-figure'
  | 'rc-car'
  | 'ride-on'
  | 'dinosaur'
  | 'puzzle'
  | 'board-game'
  | 'abc'
  | 'microscope'
  | 'planet'
  | 'flashcards'
  | 'tshirt'
  | 'dungaree'
  | 'tracksuit'
  | 'frock'
  | 'tutu'
  | 'jacket'
  | 'onesie'
  | 'booties'
  | 'romper'
  | 'kurta'
  | 'lehenga'
  | 'pyjama'
  | 'nightdress';

// Cozy, warm backgrounds tuned to the honey & moss theme — soft honeyed cream
// and muted sage tones, rotated so adjacent cards differ pleasantly.
const BG = ['#f6f0e0', '#eef1e2', '#faf2df', '#f1f0e0', '#f7efdc', '#edf0df'];

/**
 * Each entry is the *inner* SVG markup (paths/shapes) drawn inside a
 * 240×240 viewBox. The wrapper (background + framing) is added by `illus()`.
 */
const ART: Record<Illustration, string> = {
  teddy: `
    <circle cx="120" cy="86" r="40" fill="#c98a5e"/>
    <circle cx="88" cy="52" r="16" fill="#c98a5e"/>
    <circle cx="152" cy="52" r="16" fill="#c98a5e"/>
    <circle cx="88" cy="52" r="8" fill="#a9713f"/>
    <circle cx="152" cy="52" r="8" fill="#a9713f"/>
    <ellipse cx="120" cy="160" rx="46" ry="42" fill="#c98a5e"/>
    <circle cx="108" cy="82" r="5" fill="#3a2a1a"/>
    <circle cx="132" cy="82" r="5" fill="#3a2a1a"/>
    <ellipse cx="120" cy="96" rx="11" ry="8" fill="#e9c9a8"/>
    <circle cx="120" cy="92" r="4" fill="#3a2a1a"/>
    <path d="M112 100 q8 8 16 0" stroke="#3a2a1a" stroke-width="2.5" fill="none" stroke-linecap="round"/>
    <ellipse cx="82" cy="150" rx="14" ry="20" fill="#c98a5e"/>
    <ellipse cx="158" cy="150" rx="14" ry="20" fill="#c98a5e"/>
    <circle cx="120" cy="150" r="16" fill="#e9c9a8"/>`,

  blocks: `
    <rect x="70" y="150" width="46" height="46" rx="6" fill="#ef4444"/>
    <rect x="120" y="150" width="46" height="46" rx="6" fill="#3b82f6"/>
    <rect x="95" y="104" width="46" height="46" rx="6" fill="#f59e0b"/>
    <rect x="145" y="104" width="30" height="46" rx="6" fill="#22c55e"/>
    <rect x="108" y="58" width="46" height="46" rx="6" fill="#a855f7"/>
    <circle cx="86" cy="146" r="5" fill="#fff" opacity=".5"/>
    <circle cx="136" cy="146" r="5" fill="#fff" opacity=".5"/>
    <circle cx="122" cy="100" r="5" fill="#fff" opacity=".5"/>
    <circle cx="126" cy="54" r="5" fill="#fff" opacity=".5"/>`,

  'magnet-tiles': `
    <polygon points="120,52 168,140 72,140" fill="#f472b6" opacity=".85"/>
    <rect x="80" y="140" width="52" height="52" fill="#38bdf8" opacity=".85"/>
    <rect x="132" y="140" width="52" height="52" fill="#facc15" opacity=".85"/>
    <polygon points="120,52 168,140 120,140" fill="#fb7185" opacity=".7"/>`,

  doll: `
    <ellipse cx="120" cy="168" rx="40" ry="34" fill="#f9a8d4"/>
    <rect x="104" y="120" width="32" height="40" rx="10" fill="#fbcfe8"/>
    <circle cx="120" cy="92" r="30" fill="#ffe0c7"/>
    <path d="M90 92 a30 30 0 0 1 60 0 q0 -34 -30 -34 q-30 0 -30 34z" fill="#8b5a2b"/>
    <circle cx="110" cy="90" r="4" fill="#3a2a1a"/>
    <circle cx="130" cy="90" r="4" fill="#3a2a1a"/>
    <circle cx="106" cy="98" r="4" fill="#fb7185" opacity=".6"/>
    <circle cx="134" cy="98" r="4" fill="#fb7185" opacity=".6"/>
    <path d="M112 102 q8 6 16 0" stroke="#e11d48" stroke-width="2.5" fill="none" stroke-linecap="round"/>`,

  'action-figure': `
    <circle cx="120" cy="64" r="22" fill="#ffd7b0"/>
    <path d="M98 60 a22 22 0 0 1 44 0z" fill="#1e3a8a"/>
    <rect x="100" y="86" width="40" height="54" rx="10" fill="#2563eb"/>
    <path d="M120 96 l10 20 -10 6 -10 -6z" fill="#facc15"/>
    <rect x="86" y="92" width="16" height="40" rx="8" fill="#ffd7b0"/>
    <rect x="138" y="92" width="16" height="40" rx="8" fill="#ffd7b0"/>
    <rect x="104" y="140" width="14" height="46" rx="7" fill="#1e3a8a"/>
    <rect x="122" y="140" width="14" height="46" rx="7" fill="#1e3a8a"/>`,

  'rc-car': `
    <rect x="60" y="118" width="120" height="40" rx="12" fill="#ef4444"/>
    <path d="M86 118 l16 -26 h40 l16 26z" fill="#f87171"/>
    <rect x="98" y="100" width="44" height="20" rx="6" fill="#bfdbfe"/>
    <circle cx="90" cy="162" r="18" fill="#1f2937"/><circle cx="90" cy="162" r="7" fill="#9ca3af"/>
    <circle cx="152" cy="162" r="18" fill="#1f2937"/><circle cx="152" cy="162" r="7" fill="#9ca3af"/>
    <rect x="150" y="86" width="6" height="30" rx="3" fill="#6b7280"/><circle cx="153" cy="84" r="5" fill="#f59e0b"/>`,

  'ride-on': `
    <circle cx="82" cy="164" r="24" fill="#1f2937"/><circle cx="82" cy="164" r="9" fill="#e5e7eb"/>
    <circle cx="162" cy="164" r="24" fill="#1f2937"/><circle cx="162" cy="164" r="9" fill="#e5e7eb"/>
    <path d="M64 150 q30 -46 84 -30 l14 30z" fill="#f59e0b"/>
    <rect x="96" y="104" width="30" height="20" rx="6" fill="#fbbf24"/>
    <rect x="150" y="96" width="8" height="34" rx="4" fill="#6b7280"/>
    <circle cx="154" cy="94" r="8" fill="#374151"/>`,

  dinosaur: `
    <path d="M70 170 q-6 -70 60 -74 q50 -2 44 40 q-2 20 -26 22 l6 26 -18 0 -6 -22 -22 0 -6 22 -18 0z" fill="#22c55e"/>
    <path d="M118 100 l10 -14 8 12 10 -12 6 14z" fill="#16a34a"/>
    <circle cx="150" cy="112" r="5" fill="#0f172a"/>
    <path d="M150 128 q10 2 16 -4" stroke="#0f172a" stroke-width="2" fill="none" stroke-linecap="round"/>`,

  puzzle: `
    <g fill="#f472b6"><rect x="70" y="70" width="52" height="52" rx="6"/></g>
    <rect x="122" y="70" width="52" height="52" rx="6" fill="#38bdf8"/>
    <rect x="70" y="122" width="52" height="52" rx="6" fill="#facc15"/>
    <rect x="122" y="122" width="52" height="52" rx="6" fill="#34d399"/>
    <circle cx="122" cy="96" r="9" fill="#fff" opacity=".55"/>
    <circle cx="96" cy="122" r="9" fill="#fff" opacity=".55"/>`,

  'board-game': `
    <rect x="66" y="66" width="108" height="108" rx="10" fill="#fff" stroke="#e5e7eb" stroke-width="3"/>
    <g fill="#f472b6">
      <rect x="78" y="78" width="24" height="24"/><rect x="126" y="78" width="24" height="24"/>
      <rect x="102" y="102" width="24" height="24"/><rect x="78" y="126" width="24" height="24"/>
      <rect x="126" y="126" width="24" height="24"/></g>
    <circle cx="150" cy="150" r="12" fill="#3b82f6"/>
    <circle cx="90" cy="150" r="12" fill="#22c55e"/>`,

  abc: `
    <rect x="70" y="80" width="46" height="46" rx="8" fill="#ef4444"/>
    <rect x="124" y="80" width="46" height="46" rx="8" fill="#3b82f6"/>
    <rect x="70" y="132" width="46" height="46" rx="8" fill="#22c55e"/>
    <rect x="124" y="132" width="46" height="46" rx="8" fill="#f59e0b"/>
    <text x="93" y="112" font-family="Arial" font-size="26" font-weight="700" fill="#fff" text-anchor="middle">A</text>
    <text x="147" y="112" font-family="Arial" font-size="26" font-weight="700" fill="#fff" text-anchor="middle">B</text>
    <text x="93" y="164" font-family="Arial" font-size="26" font-weight="700" fill="#fff" text-anchor="middle">1</text>
    <text x="147" y="164" font-family="Arial" font-size="26" font-weight="700" fill="#fff" text-anchor="middle">2</text>`,

  microscope: `
    <rect x="86" y="176" width="80" height="10" rx="5" fill="#64748b"/>
    <rect x="112" y="150" width="60" height="8" rx="4" fill="#94a3b8" transform="rotate(-8 142 154)"/>
    <rect x="120" y="70" width="14" height="70" rx="7" fill="#475569" transform="rotate(18 127 105)"/>
    <circle cx="150" cy="72" r="12" fill="#38bdf8"/>
    <rect x="96" y="150" width="40" height="14" rx="4" fill="#cbd5e1"/>`,

  planet: `
    <circle cx="120" cy="120" r="42" fill="#6366f1"/>
    <circle cx="106" cy="108" r="10" fill="#818cf8"/>
    <circle cx="138" cy="132" r="7" fill="#a5b4fc"/>
    <ellipse cx="120" cy="120" rx="70" ry="22" fill="none" stroke="#f59e0b" stroke-width="6" transform="rotate(-20 120 120)"/>
    <circle cx="176" cy="70" r="5" fill="#fbbf24"/><circle cx="66" cy="150" r="4" fill="#fbbf24"/>`,

  flashcards: `
    <rect x="72" y="86" width="76" height="96" rx="8" fill="#fff" stroke="#e5e7eb" stroke-width="3" transform="rotate(-8 110 134)"/>
    <rect x="92" y="72" width="76" height="96" rx="8" fill="#fff" stroke="#e5e7eb" stroke-width="3" transform="rotate(6 130 120)"/>
    <circle cx="130" cy="104" r="16" fill="#f472b6"/>
    <rect x="108" y="130" width="44" height="7" rx="3" fill="#cbd5e1"/>
    <rect x="108" y="144" width="30" height="7" rx="3" fill="#e2e8f0"/>`,

  tshirt: `
    <path d="M92 74 l-30 24 16 22 18 -12 v70 h48 v-70 l18 12 16 -22 -30 -24 -12 0 a14 14 0 0 1 -32 0z" fill="#38bdf8"/>
    <circle cx="120" cy="120" r="14" fill="#fff" opacity=".7"/>`,

  dungaree: `
    <path d="M96 70 v18 M144 70 v18" stroke="#2563eb" stroke-width="10" stroke-linecap="round"/>
    <path d="M84 96 h72 v70 h-24 v-40 h-24 v40 h-24z" fill="#2563eb"/>
    <rect x="104" y="104" width="32" height="24" rx="4" fill="#1d4ed8"/>
    <circle cx="96" cy="90" r="4" fill="#fbbf24"/><circle cx="144" cy="90" r="4" fill="#fbbf24"/>`,

  tracksuit: `
    <path d="M92 74 l-26 20 14 20 16 -10 v76 h48 v-76 l16 10 14 -20 -26 -20 -12 0 a14 14 0 0 1 -32 0z" fill="#1e293b"/>
    <path d="M92 90 v90 M148 90 v90" stroke="#f59e0b" stroke-width="4"/>`,

  frock: `
    <path d="M104 68 a16 16 0 0 0 32 0 l16 20 -12 12 v6 l24 74 h-88 l24 -74 v-6 l-12 -12z" fill="#f472b6"/>
    <circle cx="112" cy="130" r="4" fill="#fff"/><circle cx="130" cy="150" r="4" fill="#fff"/>
    <circle cx="120" cy="170" r="4" fill="#fff"/><circle cx="104" cy="160" r="4" fill="#fff"/>`,

  tutu: `
    <rect x="108" y="70" width="24" height="34" rx="6" fill="#f9a8d4"/>
    <path d="M84 104 h72 l22 40 q-58 24 -116 0z" fill="#f472b6"/>
    <path d="M84 104 l-8 34 M104 104 v40 M120 104 v44 M136 104 v40 M156 104 l8 34" stroke="#fbcfe8" stroke-width="3"/>`,

  jacket: `
    <path d="M92 74 l-28 22 16 22 14 -10 v74 h52 v-74 l14 10 16 -22 -28 -22 -12 0 -14 10 -14 -10z" fill="#60a5fa"/>
    <path d="M120 84 v98" stroke="#1e40af" stroke-width="4" stroke-dasharray="6 5"/>
    <circle cx="110" cy="150" r="6" fill="#1e40af"/>`,

  onesie: `
    <path d="M100 72 a14 14 0 0 0 40 0 l14 16 -10 18 -10 -6 v34 h4 l-8 40 h-44 l-8 -40 h4 v-34 l-10 6 -10 -18z" fill="#fbcfe8"/>
    <circle cx="108" cy="150" r="3.5" fill="#f472b6"/><circle cx="120" cy="158" r="3.5" fill="#f472b6"/>
    <circle cx="132" cy="150" r="3.5" fill="#f472b6"/>`,

  booties: `
    <path d="M70 120 q0 -22 22 -22 h10 v22 h14 q14 0 14 14 v14 h-60z" fill="#93c5fd"/>
    <path d="M120 120 q0 -22 22 -22 h10 v22 h14 q14 0 14 14 v14 h-60z" fill="#f9a8d4"/>
    <rect x="66" y="146" width="64" height="10" rx="5" fill="#60a5fa"/>
    <rect x="116" y="146" width="64" height="10" rx="5" fill="#f472b6"/>`,

  romper: `
    <path d="M98 74 a12 12 0 0 0 44 0 l14 14 -10 16 -8 -4 v18 l10 8 -10 40 h-46 l-10 -40 10 -8 v-18 l-8 4 -10 -16z" fill="#fcd34d"/>
    <circle cx="120" cy="118" r="10" fill="#fff" opacity=".7"/>`,

  kurta: `
    <path d="M96 72 l-26 20 14 22 14 -10 v80 h44 v-80 l14 10 14 -22 -26 -20 -10 0 a12 12 0 0 1 -28 0z" fill="#fcd34d"/>
    <path d="M120 82 v96" stroke="#b45309" stroke-width="3"/>
    <circle cx="120" cy="100" r="3" fill="#b45309"/><circle cx="120" cy="120" r="3" fill="#b45309"/>
    <path d="M84 92 h72" stroke="#f59e0b" stroke-width="3"/>`,

  lehenga: `
    <path d="M106 70 a14 14 0 0 0 28 0 l6 20 h-40z" fill="#ec4899"/>
    <path d="M96 96 h48 l30 84 q-54 22 -108 0z" fill="#db2777"/>
    <path d="M96 96 l-30 84 M120 96 v84 M144 96 l30 84" stroke="#f9a8d4" stroke-width="2.5"/>
    <circle cx="120" cy="150" r="4" fill="#fde68a"/><circle cx="100" cy="164" r="3" fill="#fde68a"/><circle cx="140" cy="164" r="3" fill="#fde68a"/>`,

  pyjama: `
    <path d="M88 74 h64 v40 h-64z" fill="#4f46e5"/>
    <path d="M88 118 h64 l-6 64 h-22 l-4 -40 -4 40 h-22z" fill="#6366f1"/>
    <circle cx="108" cy="90" r="4" fill="#fde68a"/><circle cx="132" cy="98" r="4" fill="#fde68a"/>
    <path d="M100 100 l4 4 M128 84 l4 4" stroke="#fde68a" stroke-width="3" stroke-linecap="round"/>`,

  nightdress: `
    <path d="M106 70 a14 14 0 0 0 28 0 l14 18 -10 10 v6 l16 68 h-64 l16 -68 v-6 l-10 -10z" fill="#c4b5fd"/>
    <path d="M120 96 l6 10 -6 4 -6 -4z" fill="#a78bfa"/>
    <circle cx="104" cy="150" r="3" fill="#fff"/><circle cx="136" cy="156" r="3" fill="#fff"/>`,
};

// A tiny cache so identical (kind,index) pairs reuse the same encoded string.
const cache = new Map<string, string>();

// Friendly avatar palette for customer testimonials.
const AVATAR_BG = ['#6e7b4f', '#d99a34', '#808e5c', '#b57a1e', '#57623d'];

/**
 * A simple initial-in-a-circle avatar for a person's name — used for
 * testimonials/reviews instead of an unrelated stock face.
 */
export function avatar(name: string, index = 0): string {
  const key = `avatar:${name}:${index}`;
  const hit = cache.get(key);
  if (hit) return hit;
  const initial = (name.trim()[0] ?? '?').toUpperCase();
  const bg = AVATAR_BG[index % AVATAR_BG.length];
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80" width="80" height="80">`
    + `<rect width="80" height="80" rx="40" fill="${bg}"/>`
    + `<text x="40" y="40" font-family="Arial, sans-serif" font-size="36" font-weight="700" `
    + `fill="#ffffff" text-anchor="middle" dominant-baseline="central">${initial}</text>`
    + `</svg>`;
  const uri = 'data:image/svg+xml,' + encodeURIComponent(svg);
  cache.set(key, uri);
  return uri;
}

/**
 * Returns a `data:image/svg+xml` URI for the given illustration, rendered with
 * a soft "3D / clay" treatment applied globally so every art definition gains
 * depth for free:
 *   - a raised, gradient-shaded pedestal disc (light top-left → shaded bottom);
 *   - a soft drop-shadow filter on the artwork so it lifts off the surface;
 *   - a top glossy highlight overlay for a moulded, clay-like sheen.
 */
export function illus(kind: Illustration, index = 0): string {
  const key = `${kind}:${index}`;
  const hit = cache.get(key);
  if (hit) return hit;

  const bg = BG[index % BG.length];
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240" width="240" height="240">` +
    `<defs>` +
    // Soft drop shadow that makes the artwork float above the pedestal.
    `<filter id="s3d" x="-30%" y="-30%" width="160%" height="160%">` +
    `<feDropShadow dx="0" dy="6" stdDeviation="6" flood-color="#2a1e0e" flood-opacity="0.22"/>` +
    `</filter>` +
    // Pedestal volume: light at top-left, shaded at bottom-right.
    `<radialGradient id="ped" cx="38%" cy="32%" r="75%">` +
    `<stop offset="0%" stop-color="#ffffff" stop-opacity="0.95"/>` +
    `<stop offset="55%" stop-color="#ffffff" stop-opacity="0.35"/>` +
    `<stop offset="100%" stop-color="#8a6d3b" stop-opacity="0.16"/>` +
    `</radialGradient>` +
    // Glossy top highlight for the clay sheen.
    `<radialGradient id="gloss" cx="42%" cy="26%" r="45%">` +
    `<stop offset="0%" stop-color="#ffffff" stop-opacity="0.6"/>` +
    `<stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>` +
    `</radialGradient>` +
    `</defs>` +
    // Background + contact shadow under the pedestal.
    `<rect width="240" height="240" fill="${bg}"/>` +
    `<ellipse cx="120" cy="196" rx="74" ry="16" fill="#2a1e0e" opacity="0.12"/>` +
    // Raised, shaded pedestal disc.
    `<circle cx="120" cy="118" r="98" fill="#ffffff" opacity="0.5"/>` +
    `<circle cx="120" cy="118" r="98" fill="url(#ped)"/>` +
    // Artwork lifted with a soft drop shadow.
    `<g filter="url(#s3d)">` +
    (ART[kind] ?? '') +
    `</g>` +
    // Clay-like top sheen over everything.
    `<ellipse cx="102" cy="74" rx="70" ry="46" fill="url(#gloss)"/>` +
    `</svg>`;
  const uri = 'data:image/svg+xml,' + encodeURIComponent(svg.replace(/\n\s*/g, ' ').trim());
  cache.set(key, uri);
  return uri;
}
