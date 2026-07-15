/**
 * Seed the catalog from the SAME source the storefront's mock layer uses.
 *
 * Rather than re-transcribing the 30 products (which would drift), we import
 * the canonical `CATEGORIES` and `PRODUCTS` straight from the Angular app's
 * `mock-data.ts`. Those modules (and `illustrations.ts`, `product.model.ts`)
 * are framework-agnostic plain TS with no Angular imports, so ts-node loads
 * them directly — the DB ends up byte-identical to the mock, including the
 * SVG data-URI galleries and generated reviews.
 */
import { PrismaClient } from '@prisma/client';
import { CATEGORIES, PRODUCTS } from '../../src/app/core/data/mock-data';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Jiaranest catalog…');

  // Clear existing rows so the seed is idempotent (safe to re-run).
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();

  // Categories first — insert parents before children so the self-relation FK
  // is satisfied (top categories have no parentId; subcategories reference one).
  const parents = CATEGORIES.filter((c) => !c.parentId);
  const children = CATEGORIES.filter((c) => c.parentId);
  for (const c of [...parents, ...children]) {
    await prisma.category.create({
      data: {
        id: c.id,
        slug: c.slug,
        name: c.name,
        image: c.image,
        parentId: c.parentId ?? null,
      },
    });
  }
  console.log(`  ${CATEGORIES.length} categories`);

  // Products — native Postgres arrays (text[]) and JSON columns.
  for (const p of PRODUCTS) {
    await prisma.product.create({
      data: {
        id: p.id,
        slug: p.slug,
        name: p.name,
        brand: p.brand,
        categoryId: p.categoryId,
        description: p.description,
        price: p.price,
        mrp: p.mrp,
        rating: p.rating,
        ratingCount: p.ratingCount,
        inStock: p.inStock,
        stockCount: p.stockCount,
        colors: p.colors ?? [],
        sizes: p.sizes ?? [],
        badges: p.badges ?? [],
        ageGroup: p.ageGroup ?? null,
        gender: p.gender ?? null,
        soldCount: p.soldCount,
        createdAt: new Date(p.createdAt),
        images: p.images as unknown as object,
        specs: (p.specs ?? undefined) as unknown as object,
        variantOptions: (p.variantOptions ?? undefined) as unknown as object,
        reviews: (p.reviews ?? undefined) as unknown as object,
      },
    });
  }
  console.log(`  ${PRODUCTS.length} products`);
  console.log('Done.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
