import { AgeGroup, Category, Product, Review } from '../models/product.model';
import { Illustration, illus } from './illustrations';

/**
 * In-memory catalog for Jiaranest — a kids-only store selling TOYS and
 * KIDS' CLOTHING exclusively. Two top categories (Toys, Clothing) with
 * subcategories, plus an age-group facet (0-2 / 3-5 / 6-8 / 9-12).
 *
 * Product/category images are on-theme SVG illustrations (see illustrations.ts)
 * embedded as data URIs — relevant to what's being sold, no external files.
 */

/**
 * Pick the best illustration for a product from its name (keyword match first)
 * then its subcategory. Keeps images relevant without hand-tagging every seed.
 */
function illustrationFor(name: string, categoryId: string): Illustration {
  const n = name.toLowerCase();
  // Name keywords win — they're the most specific signal.
  if (n.includes('teddy') || n.includes('bunny') || n.includes('plush')) return 'teddy';
  if (n.includes('magnetic')) return 'magnet-tiles';
  if (n.includes('block') || n.includes('blox')) return 'blocks';
  if (n.includes('dinosaur')) return 'dinosaur';
  if (n.includes('ride-on') || n.includes('racer')) return 'ride-on';
  if (n.includes('car')) return 'rc-car';
  if (n.includes('superhero') || n.includes('action')) return 'action-figure';
  if (n.includes('doll')) return 'doll';
  if (n.includes('microscope') || n.includes('science')) return 'microscope';
  if (n.includes('solar') || n.includes('planet')) return 'planet';
  if (n.includes('flash card') || n.includes('flashcard')) return 'flashcards';
  if (n.includes('abc') || n.includes('learning board')) return 'abc';
  if (n.includes('board game')) return 'board-game';
  if (n.includes('puzzle') || n.includes('jigsaw')) return 'puzzle';
  if (n.includes('dungaree')) return 'dungaree';
  if (n.includes('track suit') || n.includes('tracksuit')) return 'tracksuit';
  if (n.includes('jacket')) return 'jacket';
  if (n.includes('tutu')) return 'tutu';
  if (n.includes('frock') || (n.includes('dress') && n.includes('party'))) return 'frock';
  if (n.includes('onesie')) return 'onesie';
  if (n.includes('bootie') || n.includes('cap set')) return 'booties';
  if (n.includes('romper')) return 'romper';
  if (n.includes('kurta')) return 'kurta';
  if (n.includes('lehenga')) return 'lehenga';
  if (n.includes('pyjama') || n.includes('pajama')) return 'pyjama';
  if (n.includes('nightdress') || n.includes('nightie')) return 'nightdress';
  if (n.includes('t-shirt') || n.includes('tshirt')) return 'tshirt';

  // Fall back to the subcategory's representative look.
  const byCat: Record<string, Illustration> = {
    'c-blocks': 'blocks',
    'c-softtoys': 'teddy',
    'c-educational': 'abc',
    'c-dolls': 'doll',
    'c-rc': 'rc-car',
    'c-games': 'puzzle',
    'c-boys': 'tshirt',
    'c-girls': 'frock',
    'c-infants': 'onesie',
    'c-ethnic': 'kurta',
    'c-nightwear': 'pyjama',
  };
  return byCat[categoryId] ?? 'teddy';
}

/** Build the 4-image gallery for a product, varying the pastel background. */
function galleryFor(name: string, categoryId: string) {
  const kind = illustrationFor(name, categoryId);
  return [0, 1, 2, 3].map((i) => ({
    url: illus(kind, i),
    alt: `${name} — illustration ${i + 1}`,
  }));
}

// Two top-level categories + their subcategories. parentId links children.
export const CATEGORIES: Category[] = [
  // ---- Top level ----
  { id: 'c-toys', slug: 'toys', name: 'Toys', image: illus('teddy', 0), productCount: 0 },
  { id: 'c-clothing', slug: 'clothing', name: 'Clothing', image: illus('frock', 1), productCount: 0 },

  // ---- Toys subcategories ----
  { id: 'c-blocks', slug: 'building-blocks', name: 'Building Blocks', image: illus('blocks', 0), productCount: 0, parentId: 'c-toys' },
  { id: 'c-softtoys', slug: 'soft-toys', name: 'Soft Toys', image: illus('teddy', 1), productCount: 0, parentId: 'c-toys' },
  { id: 'c-educational', slug: 'educational-toys', name: 'Educational Toys', image: illus('abc', 2), productCount: 0, parentId: 'c-toys' },
  { id: 'c-dolls', slug: 'dolls-figures', name: 'Dolls & Figures', image: illus('doll', 3), productCount: 0, parentId: 'c-toys' },
  { id: 'c-rc', slug: 'remote-control', name: 'Remote Control & Ride-ons', image: illus('rc-car', 4), productCount: 0, parentId: 'c-toys' },
  { id: 'c-games', slug: 'games-puzzles', name: 'Games & Puzzles', image: illus('puzzle', 5), productCount: 0, parentId: 'c-toys' },

  // ---- Clothing subcategories ----
  { id: 'c-boys', slug: 'boys-clothing', name: 'Boys', image: illus('tshirt', 1), productCount: 0, parentId: 'c-clothing' },
  { id: 'c-girls', slug: 'girls-clothing', name: 'Girls', image: illus('frock', 0), productCount: 0, parentId: 'c-clothing' },
  { id: 'c-infants', slug: 'infants', name: 'Infants (0-2)', image: illus('onesie', 2), productCount: 0, parentId: 'c-clothing' },
  { id: 'c-ethnic', slug: 'ethnic-wear', name: 'Ethnic Wear', image: illus('lehenga', 3), productCount: 0, parentId: 'c-clothing' },
  { id: 'c-nightwear', slug: 'nightwear', name: 'Nightwear', image: illus('pyjama', 4), productCount: 0, parentId: 'c-clothing' },
];

function reviews(seed: string, avg: number, kind: Illustration): Review[] {
  const names = ['Priya (mom of 2)', 'Arjun\'s dad', 'Sneha M.', 'Little Riya\'s mum', 'Karthik R.'];
  const titles = ['My kid loves it!', 'Great quality', 'Perfect gift', 'Worth every rupee', 'Cute and safe'];
  const bodies = [
    'My little one hasn\'t put it down since it arrived. Well made and safe.',
    'Lovely quality material, stitching is neat and colours are bright.',
    'Bought this as a birthday gift — the child was thrilled. Highly recommend.',
    'Sturdy and non-toxic. Survived a week of rough play without any damage.',
    'True to size and very comfortable. My daughter wants to wear it every day.',
  ];
  return Array.from({ length: 3 }).map((_, i) => ({
    id: `${seed}-r${i}`,
    author: names[i % names.length],
    rating: Math.max(3, Math.round(avg + (i === 1 ? -1 : 0))),
    title: titles[i % titles.length],
    body: bodies[i % bodies.length],
    date: `2026-0${(i % 6) + 1}-1${i}`,
    verifiedPurchase: i !== 2,
    helpfulCount: 12 - i * 3,
    images: i === 0 ? [illus(kind, 3)] : undefined,
  }));
}

interface Seed {
  name: string;
  brand: string;
  categoryId: string;
  price: number;
  mrp: number;
  rating: number;
  ratingCount: number;
  soldCount: number;
  stockCount: number;
  ageGroup: AgeGroup;
  gender?: 'boys' | 'girls' | 'unisex';
  colors?: string[];
  sizes?: string[];
  badges?: Product['badges'];
  specs?: { label: string; value: string }[];
  daysAgo: number;
}

const SEEDS: Seed[] = [
  // ================= TOYS =================

  // Building blocks
  { name: 'GalaxyBlox 1200-Piece Building Set', brand: 'PlayLab', categoryId: 'c-blocks', price: 2499, mrp: 3999, rating: 4.7, ratingCount: 1300, soldCount: 5600, stockCount: 60, ageGroup: '6-8', gender: 'unisex', badges: ['bestseller'], daysAgo: 38, specs: [{ label: 'Pieces', value: '1200' }, { label: 'Material', value: 'BPA-free ABS' }, { label: 'Safety', value: 'Non-toxic, tested' }] },
  { name: 'JumboBlocks Starter Bucket (80 Pcs)', brand: 'PlayLab', categoryId: 'c-blocks', price: 899, mrp: 1499, rating: 4.5, ratingCount: 2100, soldCount: 9400, stockCount: 140, ageGroup: '3-5', gender: 'unisex', badges: ['deal'], daysAgo: 22, specs: [{ label: 'Pieces', value: '80' }, { label: 'Age', value: '3+' }] },
  { name: 'Magnetic Tiles Rainbow Set (60 Pcs)', brand: 'BrightMinds', categoryId: 'c-blocks', price: 1799, mrp: 2999, rating: 4.6, ratingCount: 780, soldCount: 3100, stockCount: 45, ageGroup: '3-5', gender: 'unisex', badges: ['trending'], daysAgo: 9 },

  // Soft toys
  { name: 'Cuddles the Plush Teddy Bear (Large)', brand: 'SnuggleCo', categoryId: 'c-softtoys', price: 999, mrp: 1799, rating: 4.8, ratingCount: 3400, soldCount: 15000, stockCount: 200, ageGroup: '0-2', gender: 'unisex', colors: ['Brown', 'Cream', 'Pink'], badges: ['bestseller', 'deal'], daysAgo: 55, specs: [{ label: 'Height', value: '45 cm' }, { label: 'Filling', value: 'Hypoallergenic fibre' }, { label: 'Wash', value: 'Machine washable' }] },
  { name: 'Bunny Buddy Soft Toy', brand: 'SnuggleCo', categoryId: 'c-softtoys', price: 599, mrp: 999, rating: 4.6, ratingCount: 1200, soldCount: 6800, stockCount: 90, ageGroup: '0-2', gender: 'unisex', colors: ['White', 'Grey'], daysAgo: 30 },
  { name: 'Jungle Friends Plush Pack (Set of 3)', brand: 'SnuggleCo', categoryId: 'c-softtoys', price: 1299, mrp: 2199, rating: 4.7, ratingCount: 640, soldCount: 2400, stockCount: 38, ageGroup: '0-2', gender: 'unisex', badges: ['new'], daysAgo: 4 },

  // Educational
  { name: 'ABC & 123 Wooden Learning Board', brand: 'BrightMinds', categoryId: 'c-educational', price: 749, mrp: 1299, rating: 4.5, ratingCount: 1900, soldCount: 8600, stockCount: 110, ageGroup: '3-5', gender: 'unisex', badges: ['bestseller'], daysAgo: 42, specs: [{ label: 'Material', value: 'Pinewood' }, { label: 'Skills', value: 'Letters, numbers, motor' }] },
  { name: 'My First Microscope Science Kit', brand: 'CuriousKid', categoryId: 'c-educational', price: 1499, mrp: 2499, rating: 4.4, ratingCount: 520, soldCount: 2100, stockCount: 34, ageGroup: '6-8', gender: 'unisex', badges: ['trending'], daysAgo: 16 },
  { name: 'Solar System Build & Learn Model', brand: 'CuriousKid', categoryId: 'c-educational', price: 1199, mrp: 1999, rating: 4.6, ratingCount: 410, soldCount: 1500, stockCount: 26, ageGroup: '9-12', gender: 'unisex', badges: ['new'], daysAgo: 7 },
  { name: 'Flash Cards Mega Pack (200 Cards)', brand: 'BrightMinds', categoryId: 'c-educational', price: 399, mrp: 699, rating: 4.3, ratingCount: 2600, soldCount: 12000, stockCount: 300, ageGroup: '3-5', gender: 'unisex', badges: ['deal'], daysAgo: 60 },

  // Dolls & figures
  { name: 'Aria Fashion Doll with Wardrobe', brand: 'DreamDolls', categoryId: 'c-dolls', price: 1299, mrp: 2199, rating: 4.5, ratingCount: 1100, soldCount: 5200, stockCount: 55, ageGroup: '6-8', gender: 'girls', badges: ['bestseller'], daysAgo: 28 },
  { name: 'Superhero Action Figure Squad (Set of 5)', brand: 'HeroVerse', categoryId: 'c-dolls', price: 999, mrp: 1799, rating: 4.4, ratingCount: 1450, soldCount: 6100, stockCount: 70, ageGroup: '6-8', gender: 'boys', badges: ['trending', 'deal'], daysAgo: 19 },
  { name: 'Baby Doll with Sounds & Accessories', brand: 'DreamDolls', categoryId: 'c-dolls', price: 899, mrp: 1499, rating: 4.3, ratingCount: 830, soldCount: 3900, stockCount: 48, ageGroup: '3-5', gender: 'girls', daysAgo: 33 },

  // Remote control & ride-ons
  { name: 'Turbo RC Stunt Car 2.4GHz', brand: 'ZoomToys', categoryId: 'c-rc', price: 1799, mrp: 2999, rating: 4.2, ratingCount: 900, soldCount: 4200, stockCount: 48, ageGroup: '6-8', gender: 'unisex', colors: ['Red', 'Blue'], badges: ['deal'], daysAgo: 16, specs: [{ label: 'Range', value: '30 m' }, { label: 'Battery', value: 'Rechargeable' }] },
  { name: 'Little Racer Foot-to-Floor Ride-on', brand: 'ZoomToys', categoryId: 'c-rc', price: 2299, mrp: 3499, rating: 4.5, ratingCount: 560, soldCount: 2000, stockCount: 22, ageGroup: '0-2', gender: 'unisex', colors: ['Red', 'Yellow'], badges: ['new'], daysAgo: 6 },
  { name: 'RC Dinosaur with Lights & Roar', brand: 'ZoomToys', categoryId: 'c-rc', price: 1599, mrp: 2699, rating: 4.4, ratingCount: 480, soldCount: 1800, stockCount: 0, ageGroup: '3-5', gender: 'unisex', daysAgo: 24 },

  // Games & puzzles
  { name: 'Wooden Jigsaw Puzzle Bundle (4-in-1)', brand: 'PuzzlePlay', categoryId: 'c-games', price: 649, mrp: 1099, rating: 4.6, ratingCount: 1700, soldCount: 7400, stockCount: 95, ageGroup: '3-5', gender: 'unisex', badges: ['bestseller'], daysAgo: 40 },
  { name: 'Family Board Game Night Collection', brand: 'PuzzlePlay', categoryId: 'c-games', price: 1299, mrp: 1999, rating: 4.5, ratingCount: 620, soldCount: 2600, stockCount: 40, ageGroup: '9-12', gender: 'unisex', badges: ['trending'], daysAgo: 12 },
  { name: '1000-Piece World Map Puzzle', brand: 'PuzzlePlay', categoryId: 'c-games', price: 899, mrp: 1499, rating: 4.7, ratingCount: 390, soldCount: 1400, stockCount: 30, ageGroup: '9-12', gender: 'unisex', daysAgo: 35 },

  // ================= CLOTHING =================

  // Boys
  { name: 'Dino Print Cotton T-Shirt (Pack of 2)', brand: 'TinyThreads', categoryId: 'c-boys', price: 699, mrp: 1199, rating: 4.4, ratingCount: 1400, soldCount: 8200, stockCount: 120, ageGroup: '3-5', gender: 'boys', colors: ['Blue', 'Green', 'Grey'], sizes: ['2-3Y', '4-5Y', '6-7Y'], badges: ['bestseller'], daysAgo: 35, specs: [{ label: 'Fabric', value: '100% cotton' }, { label: 'Care', value: 'Machine wash cold' }] },
  { name: 'Boys Denim Dungaree Set', brand: 'TinyThreads', categoryId: 'c-boys', price: 1199, mrp: 1999, rating: 4.5, ratingCount: 520, soldCount: 2400, stockCount: 55, ageGroup: '3-5', gender: 'boys', colors: ['Blue'], sizes: ['2-3Y', '4-5Y', '6-7Y', '8-9Y'], badges: ['deal'], daysAgo: 20 },
  { name: 'Boys Sporty Track Suit', brand: 'ActiveKids', categoryId: 'c-boys', price: 999, mrp: 1699, rating: 4.3, ratingCount: 680, soldCount: 3100, stockCount: 70, ageGroup: '6-8', gender: 'boys', colors: ['Navy', 'Black'], sizes: ['4-5Y', '6-7Y', '8-9Y', '10-11Y'], daysAgo: 14 },

  // Girls
  { name: 'Aria Floral Party Frock', brand: 'BelleKids', categoryId: 'c-girls', price: 1299, mrp: 2299, rating: 4.6, ratingCount: 980, soldCount: 4600, stockCount: 60, ageGroup: '3-5', gender: 'girls', colors: ['Pink', 'Peach', 'Lavender'], sizes: ['2-3Y', '4-5Y', '6-7Y'], badges: ['bestseller', 'deal'], daysAgo: 3, specs: [{ label: 'Fabric', value: 'Cotton blend' }, { label: 'Occasion', value: 'Party / festive' }] },
  { name: 'Rainbow Tutu Skirt & Top Set', brand: 'BelleKids', categoryId: 'c-girls', price: 899, mrp: 1599, rating: 4.5, ratingCount: 740, soldCount: 3400, stockCount: 48, ageGroup: '3-5', gender: 'girls', colors: ['Multi'], sizes: ['2-3Y', '4-5Y', '6-7Y'], badges: ['trending'], daysAgo: 11 },
  { name: 'Girls Denim Jacket', brand: 'ActiveKids', categoryId: 'c-girls', price: 1099, mrp: 1899, rating: 4.4, ratingCount: 420, soldCount: 1900, stockCount: 44, ageGroup: '6-8', gender: 'girls', colors: ['Light Blue', 'Pink'], sizes: ['4-5Y', '6-7Y', '8-9Y'], daysAgo: 26 },

  // Infants
  { name: 'Newborn Organic Cotton Onesie (Pack of 5)', brand: 'TinyThreads', categoryId: 'c-infants', price: 899, mrp: 1499, rating: 4.7, ratingCount: 2600, soldCount: 14000, stockCount: 220, ageGroup: '0-2', gender: 'unisex', colors: ['White', 'Pastel Mix'], sizes: ['0-3M', '3-6M', '6-12M'], badges: ['bestseller'], daysAgo: 50, specs: [{ label: 'Fabric', value: 'GOTS organic cotton' }, { label: 'Feature', value: 'Gentle on skin' }] },
  { name: 'Baby Winter Booties & Cap Set', brand: 'SnuggleCo', categoryId: 'c-infants', price: 499, mrp: 899, rating: 4.5, ratingCount: 1100, soldCount: 5200, stockCount: 130, ageGroup: '0-2', gender: 'unisex', colors: ['Cream', 'Blue', 'Pink'], badges: ['deal'], daysAgo: 33 },
  { name: 'Infant Romper with Cartoon Print', brand: 'TinyThreads', categoryId: 'c-infants', price: 599, mrp: 999, rating: 4.4, ratingCount: 890, soldCount: 4100, stockCount: 85, ageGroup: '0-2', gender: 'unisex', sizes: ['0-3M', '3-6M', '6-12M', '12-18M'], badges: ['new'], daysAgo: 8 },

  // Ethnic wear
  { name: 'Boys Festive Kurta Pyjama Set', brand: 'UtsavKids', categoryId: 'c-ethnic', price: 1499, mrp: 2699, rating: 4.6, ratingCount: 610, soldCount: 2300, stockCount: 40, ageGroup: '6-8', gender: 'boys', colors: ['Cream', 'Maroon', 'Royal Blue'], sizes: ['2-3Y', '4-5Y', '6-7Y', '8-9Y'], badges: ['bestseller'], daysAgo: 18 },
  { name: 'Girls Lehenga Choli Festive Set', brand: 'UtsavKids', categoryId: 'c-ethnic', price: 1899, mrp: 3499, rating: 4.7, ratingCount: 430, soldCount: 1600, stockCount: 28, ageGroup: '6-8', gender: 'girls', colors: ['Pink', 'Teal', 'Yellow'], sizes: ['3-4Y', '5-6Y', '7-8Y', '9-10Y'], badges: ['deal', 'trending'], daysAgo: 13 },

  // Nightwear
  { name: 'Kids Glow-in-the-Dark Pyjama Set', brand: 'DreamyNights', categoryId: 'c-nightwear', price: 799, mrp: 1399, rating: 4.5, ratingCount: 1300, soldCount: 6100, stockCount: 95, ageGroup: '6-8', gender: 'unisex', colors: ['Navy', 'Grey'], sizes: ['4-5Y', '6-7Y', '8-9Y', '10-11Y'], badges: ['trending'], daysAgo: 21 },
  { name: 'Girls Unicorn Print Nightdress', brand: 'DreamyNights', categoryId: 'c-nightwear', price: 599, mrp: 999, rating: 4.4, ratingCount: 720, soldCount: 3300, stockCount: 60, ageGroup: '3-5', gender: 'girls', colors: ['Lilac', 'Pink'], sizes: ['2-3Y', '4-5Y', '6-7Y'], badges: ['new'], daysAgo: 9 },
];

function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

// A fixed reference date so "daysAgo" produces stable createdAt without Date.now().
const REF = Date.parse('2026-07-14T00:00:00Z');

export const PRODUCTS: Product[] = SEEDS.map((s, i) => {
  const slug = slugify(s.name);
  const created = new Date(REF - s.daysAgo * 86400000).toISOString();
  return {
    id: `p-${i + 1}`,
    slug,
    name: s.name,
    brand: s.brand,
    categoryId: s.categoryId,
    description:
      `The ${s.name} by ${s.brand} is made just for little ones — safe, durable, and designed to delight. ` +
      `Child-safe materials, thoughtfully finished, and backed by Jiaranest's easy 7-day returns. ` +
      `A wonderful pick for everyday play and gifting alike.`,
    images: galleryFor(s.name, s.categoryId),
    price: s.price,
    mrp: s.mrp,
    rating: s.rating,
    ratingCount: s.ratingCount,
    inStock: s.stockCount > 0,
    stockCount: s.stockCount,
    colors: s.colors,
    sizes: s.sizes,
    specs: s.specs,
    variantOptions: [
      ...(s.colors ? [{ name: 'Color', values: s.colors }] : []),
      ...(s.sizes ? [{ name: 'Size', values: s.sizes }] : []),
    ],
    badges: s.badges,
    ageGroup: s.ageGroup,
    gender: s.gender,
    reviews: reviews(slug, s.rating, illustrationFor(s.name, s.categoryId)),
    createdAt: created,
    soldCount: s.soldCount,
  };
});

// Fill in category product counts. For a TOP category, count all products whose
// category is itself or any of its subcategories.
const childrenOf = (parentId: string) =>
  CATEGORIES.filter((c) => c.parentId === parentId).map((c) => c.id);

for (const c of CATEGORIES) {
  const ids = c.parentId ? [c.id] : [c.id, ...childrenOf(c.id)];
  c.productCount = PRODUCTS.filter((p) => ids.includes(p.categoryId)).length;
}
