import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, Product as ProductRow } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ProductQueryDto, SortOption } from './dto/product-query.dto';

/**
 * Catalog logic — the server-side mirror of the storefront's
 * `MockCatalogService`. Filter/sort/facet/scope/rail semantics are replicated
 * exactly so swapping mock → HTTP is invisible to the UI.
 *
 * Postgres: array facets are text[], blobs are JSON columns. Scalar + array +
 * text filters run in SQL; only the computed `minDiscount` is post-filtered in
 * memory (it derives from (mrp - price) / mrp).
 */

const AGE_ORDER = ['0-2', '3-5', '6-8', '9-12'];

export interface ProductDto {
  id: string;
  slug: string;
  name: string;
  brand: string;
  categoryId: string;
  description: string;
  images: unknown;
  price: number;
  mrp: number;
  rating: number;
  ratingCount: number;
  inStock: boolean;
  stockCount: number;
  colors?: string[];
  sizes?: string[];
  specs?: unknown;
  variantOptions?: unknown;
  badges?: string[];
  ageGroup?: string;
  gender?: string;
  reviews?: unknown;
  createdAt: string;
  soldCount: number;
}

function discountPercent(price: number, mrp: number): number {
  if (!mrp || mrp <= price) return 0;
  return Math.round(((mrp - price) / mrp) * 100);
}

@Injectable()
export class CatalogService {
  constructor(private readonly prisma: PrismaService) {}

  // ---- Categories ----

  async getCategories() {
    const cats = await this.prisma.category.findMany();
    const countByCat = await this.countByCategory();
    return cats.map((c) => this.mapCategory(c, cats, countByCat));
  }

  async getCategoryBySlug(slug: string) {
    const cat = await this.prisma.category.findUnique({ where: { slug } });
    if (!cat) return undefined;
    const cats = await this.prisma.category.findMany();
    const countByCat = await this.countByCategory();
    return this.mapCategory(cat, cats, countByCat);
  }

  private async countByCategory(): Promise<Map<string, number>> {
    const products = await this.prisma.product.findMany({ select: { categoryId: true } });
    const map = new Map<string, number>();
    for (const p of products) map.set(p.categoryId, (map.get(p.categoryId) ?? 0) + 1);
    return map;
  }

  // ---- Products ----

  async queryProducts(q: ProductQueryDto) {
    const filtered = await this.filteredRows(q);
    const sorted = this.applySort(filtered, q.sort);
    const page = q.page ?? 1;
    const pageSize = q.pageSize ?? 12;
    const start = (page - 1) * pageSize;
    return {
      items: sorted.slice(start, start + pageSize).map((p) => this.mapProduct(p)),
      total: sorted.length,
      page,
      pageSize,
    };
  }

  async getFacets(q: ProductQueryDto) {
    // Facets from products matching everything EXCEPT the facet fields.
    const base = await this.filteredRows({ categoryId: q.categoryId, search: q.search });

    const brandCounts = new Map<string, number>();
    const colors = new Set<string>();
    const sizes = new Set<string>();
    const ageGroups = new Set<string>();
    let min = Infinity;
    let max = 0;
    for (const p of base) {
      brandCounts.set(p.brand, (brandCounts.get(p.brand) ?? 0) + 1);
      p.colors.forEach((c) => colors.add(c));
      p.sizes.forEach((s) => sizes.add(s));
      if (p.ageGroup) ageGroups.add(p.ageGroup);
      min = Math.min(min, p.price);
      max = Math.max(max, p.price);
    }

    return {
      brands: [...brandCounts.entries()]
        .map(([value, count]) => ({ value, count }))
        .sort((a, b) => a.value.localeCompare(b.value)),
      colors: [...colors].sort(),
      sizes: [...sizes],
      ageGroups: AGE_ORDER.filter((a) => ageGroups.has(a)),
      priceRange: { min: Number.isFinite(min) ? min : 0, max },
    };
  }

  async getProductBySlug(slug: string) {
    const p = await this.prisma.product.findUnique({ where: { slug } });
    return p ? this.mapProduct(p) : undefined;
  }

  async getRelated(slug: string, limit = 6) {
    const product = await this.prisma.product.findUnique({ where: { slug } });
    if (!product) throw new NotFoundException(`Product '${slug}' not found`);
    const related = await this.prisma.product.findMany({
      where: { categoryId: product.categoryId, id: { not: product.id } },
      take: limit,
    });
    return related.map((p) => this.mapProduct(p));
  }

  // ---- Home rails ----

  async getFeatured() {
    return (await this.byBadge('deal', 8, (p) => p.rating >= 4.3)).map((p) => this.mapProduct(p));
  }

  async getNewArrivals() {
    const rows = await this.prisma.product.findMany({ orderBy: { createdAt: 'desc' }, take: 8 });
    return rows.map((p) => this.mapProduct(p));
  }

  async getBestSellers() {
    const rows = await this.prisma.product.findMany({ orderBy: { soldCount: 'desc' }, take: 8 });
    return rows.map((p) => this.mapProduct(p));
  }

  async getTrending() {
    return (await this.byBadge('trending', 8)).map((p) => this.mapProduct(p));
  }

  // ---- Search suggest ----

  async suggest(term: string) {
    const t = term.trim();
    if (!t) return [];
    const cats = await this.prisma.category.findMany();
    const nameMatchCatIds = cats
      .filter((c) => c.name.toLowerCase().includes(t.toLowerCase()))
      .map((c) => c.id);
    const rows = await this.prisma.product.findMany({
      where: {
        OR: [
          { name: { contains: t, mode: 'insensitive' } },
          { brand: { contains: t, mode: 'insensitive' } },
          { categoryId: { in: nameMatchCatIds.length ? nameMatchCatIds : ['__none__'] } },
        ],
      },
      take: 8,
    });
    return rows.map((p) => this.mapProduct(p));
  }

  // ---- helpers ----

  private async categoryScope(categoryId: string): Promise<string[]> {
    const children = await this.prisma.category.findMany({
      where: { parentId: categoryId },
      select: { id: true },
    });
    return [categoryId, ...children.map((c) => c.id)];
  }

  /**
   * SQL-expressible filters go in `where`; only the computed `minDiscount` is
   * applied in memory afterward.
   */
  private async filteredRows(q: ProductQueryDto): Promise<ProductRow[]> {
    const where: Prisma.ProductWhereInput = {};

    if (q.categoryId) {
      where.categoryId = { in: await this.categoryScope(q.categoryId) };
    }
    if (q.ageGroups?.length) {
      where.ageGroup = { in: q.ageGroups };
    }
    if (q.gender) {
      where.gender = { in: [q.gender, 'unisex'] };
    }
    if (q.search) {
      where.OR = [
        { name: { contains: q.search, mode: 'insensitive' } },
        { brand: { contains: q.search, mode: 'insensitive' } },
      ];
    }
    if (q.minPrice != null || q.maxPrice != null) {
      where.price = {};
      if (q.minPrice != null) where.price.gte = q.minPrice;
      if (q.maxPrice != null) where.price.lte = q.maxPrice;
    }
    if (q.brands?.length) {
      where.brand = { in: q.brands };
    }
    if (q.colors?.length) {
      where.colors = { hasSome: q.colors };
    }
    if (q.sizes?.length) {
      where.sizes = { hasSome: q.sizes };
    }
    if (q.minRating != null) {
      where.rating = { gte: q.minRating };
    }
    if (q.inStockOnly) {
      where.inStock = true;
    }

    let rows = await this.prisma.product.findMany({ where });

    if (q.minDiscount != null) {
      rows = rows.filter((p) => discountPercent(p.price, p.mrp) >= q.minDiscount!);
    }
    return rows;
  }

  private applySort(rows: ProductRow[], sort?: SortOption): ProductRow[] {
    const copy = [...rows];
    switch (sort) {
      case 'price-asc':
        return copy.sort((a, b) => a.price - b.price);
      case 'price-desc':
        return copy.sort((a, b) => b.price - a.price);
      case 'popular':
        return copy.sort((a, b) => b.soldCount - a.soldCount);
      case 'latest':
        return copy.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      default:
        return copy;
    }
  }

  private async byBadge(
    badge: string,
    limit: number,
    also: (p: ProductRow) => boolean = () => true,
  ): Promise<ProductRow[]> {
    const all = await this.prisma.product.findMany();
    const withBadge = all.filter((p) => p.badges.includes(badge) && also(p));
    if (withBadge.length >= limit) return withBadge.slice(0, limit);
    const rest = all.filter((p) => !withBadge.includes(p)).sort((a, b) => b.rating - a.rating);
    return [...withBadge, ...rest].slice(0, limit);
  }

  private mapCategory(
    c: { id: string; slug: string; name: string; image: string; parentId: string | null },
    all: { id: string; parentId: string | null }[],
    countByCat: Map<string, number>,
  ) {
    let productCount: number;
    if (c.parentId) {
      productCount = countByCat.get(c.id) ?? 0;
    } else {
      const childIds = all.filter((x) => x.parentId === c.id).map((x) => x.id);
      productCount = [c.id, ...childIds].reduce((sum, id) => sum + (countByCat.get(id) ?? 0), 0);
    }
    return {
      id: c.id,
      slug: c.slug,
      name: c.name,
      image: c.image,
      productCount,
      ...(c.parentId ? { parentId: c.parentId } : {}),
    };
  }

  /** Prisma row → the exact `Product` interface (drop empty optionals like the mock). */
  private mapProduct(p: ProductRow): ProductDto {
    return {
      id: p.id,
      slug: p.slug,
      name: p.name,
      brand: p.brand,
      categoryId: p.categoryId,
      description: p.description,
      images: p.images,
      price: p.price,
      mrp: p.mrp,
      rating: p.rating,
      ratingCount: p.ratingCount,
      inStock: p.inStock,
      stockCount: p.stockCount,
      ...(p.colors.length ? { colors: p.colors } : {}),
      ...(p.sizes.length ? { sizes: p.sizes } : {}),
      ...(p.specs != null ? { specs: p.specs } : {}),
      ...(p.variantOptions != null ? { variantOptions: p.variantOptions } : {}),
      ...(p.badges.length ? { badges: p.badges } : {}),
      ...(p.ageGroup ? { ageGroup: p.ageGroup } : {}),
      ...(p.gender ? { gender: p.gender } : {}),
      ...(p.reviews != null ? { reviews: p.reviews } : {}),
      createdAt: p.createdAt.toISOString(),
      soldCount: p.soldCount,
    };
  }
}
