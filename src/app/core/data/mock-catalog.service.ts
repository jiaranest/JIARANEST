import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { CatalogService } from './catalog.service';
import { Category, Product, discountPercent } from '../models/product.model';
import { Paginated, ProductFacets, ProductQuery, SortOption } from '../models/filter.model';
import { CATEGORIES, PRODUCTS } from './mock-data';

/** Simulated network latency so loading states are exercised in development. */
const LATENCY = 250;

@Injectable({ providedIn: 'root' })
export class MockCatalogService extends CatalogService {
  private readonly products = PRODUCTS;
  private readonly categories = CATEGORIES;

  getCategories(): Observable<Category[]> {
    return this.emit(this.categories);
  }

  getCategory(slug: string): Observable<Category | undefined> {
    return this.emit(this.categories.find((c) => c.slug === slug));
  }

  queryProducts(query: ProductQuery): Observable<Paginated<Product>> {
    const filtered = this.applyFilters(query);
    const sorted = this.applySort(filtered, query.sort);
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 12;
    const start = (page - 1) * pageSize;
    return this.emit({
      items: sorted.slice(start, start + pageSize),
      total: sorted.length,
      page,
      pageSize,
    });
  }

  getFacets(query: ProductQuery): Observable<ProductFacets> {
    // Facets are computed from products matching everything EXCEPT the facet
    // fields themselves, so a category listing shows all its brands/colors.
    const base = this.applyFilters({ categoryId: query.categoryId, search: query.search });
    const brandCounts = new Map<string, number>();
    const colors = new Set<string>();
    const sizes = new Set<string>();
    const ageGroups = new Set<string>();
    let min = Infinity;
    let max = 0;
    for (const p of base) {
      brandCounts.set(p.brand, (brandCounts.get(p.brand) ?? 0) + 1);
      p.colors?.forEach((c) => colors.add(c));
      p.sizes?.forEach((s) => sizes.add(s));
      if (p.ageGroup) ageGroups.add(p.ageGroup);
      min = Math.min(min, p.price);
      max = Math.max(max, p.price);
    }
    // Keep age groups in canonical order.
    const AGE_ORDER = ['0-2', '3-5', '6-8', '9-12'];
    return this.emit({
      brands: [...brandCounts.entries()]
        .map(([value, count]) => ({ value, count }))
        .sort((a, b) => a.value.localeCompare(b.value)),
      colors: [...colors].sort(),
      sizes: [...sizes],
      ageGroups: AGE_ORDER.filter((a) => ageGroups.has(a)) as ProductFacets['ageGroups'],
      priceRange: { min: Number.isFinite(min) ? min : 0, max },
    });
  }

  getProduct(slug: string): Observable<Product | undefined> {
    return this.emit(this.products.find((p) => p.slug === slug));
  }

  getRelated(product: Product, limit = 6): Observable<Product[]> {
    const related = this.products
      .filter((p) => p.categoryId === product.categoryId && p.id !== product.id)
      .slice(0, limit);
    return this.emit(related);
  }

  getFeatured(): Observable<Product[]> {
    return this.emit(this.byBadge('deal', 8, (p) => p.rating >= 4.3));
  }

  getNewArrivals(): Observable<Product[]> {
    return this.emit(
      [...this.products].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 8),
    );
  }

  getBestSellers(): Observable<Product[]> {
    return this.emit([...this.products].sort((a, b) => b.soldCount - a.soldCount).slice(0, 8));
  }

  getTrending(): Observable<Product[]> {
    return this.emit(this.byBadge('trending', 8));
  }

  suggest(term: string): Observable<Product[]> {
    const t = term.trim().toLowerCase();
    if (!t) {
      return this.emit([]);
    }
    const matches = this.products
      .filter(
        (p) =>
          p.name.toLowerCase().includes(t) ||
          p.brand.toLowerCase().includes(t) ||
          this.categoryName(p.categoryId).toLowerCase().includes(t),
      )
      .slice(0, 8);
    return of(matches).pipe(delay(120));
  }

  // ---- helpers ----

  private byBadge(
    badge: NonNullable<Product['badges']>[number],
    limit: number,
    also: (p: Product) => boolean = () => true,
  ): Product[] {
    const withBadge = this.products.filter((p) => p.badges?.includes(badge) && also(p));
    // Backfill with high-rated products if a badge is sparse.
    if (withBadge.length >= limit) {
      return withBadge.slice(0, limit);
    }
    const rest = [...this.products]
      .filter((p) => !withBadge.includes(p))
      .sort((a, b) => b.rating - a.rating);
    return [...withBadge, ...rest].slice(0, limit);
  }

  /** Category ids that count as "in" a given category: itself + any children. */
  private categoryScope(categoryId: string): string[] {
    const children = this.categories
      .filter((c) => c.parentId === categoryId)
      .map((c) => c.id);
    return [categoryId, ...children];
  }

  private applyFilters(q: ProductQuery): Product[] {
    let list = this.products;
    if (q.categoryId) {
      const scope = this.categoryScope(q.categoryId);
      list = list.filter((p) => scope.includes(p.categoryId));
    }
    if (q.ageGroups?.length) {
      list = list.filter((p) => p.ageGroup && q.ageGroups!.includes(p.ageGroup));
    }
    if (q.gender) {
      list = list.filter((p) => p.gender === q.gender || p.gender === 'unisex');
    }
    if (q.search) {
      const t = q.search.toLowerCase();
      list = list.filter(
        (p) => p.name.toLowerCase().includes(t) || p.brand.toLowerCase().includes(t),
      );
    }
    if (q.minPrice != null) {
      list = list.filter((p) => p.price >= q.minPrice!);
    }
    if (q.maxPrice != null) {
      list = list.filter((p) => p.price <= q.maxPrice!);
    }
    if (q.brands?.length) {
      list = list.filter((p) => q.brands!.includes(p.brand));
    }
    if (q.colors?.length) {
      list = list.filter((p) => p.colors?.some((c) => q.colors!.includes(c)));
    }
    if (q.sizes?.length) {
      list = list.filter((p) => p.sizes?.some((s) => q.sizes!.includes(s)));
    }
    if (q.minRating != null) {
      list = list.filter((p) => p.rating >= q.minRating!);
    }
    if (q.inStockOnly) {
      list = list.filter((p) => p.inStock);
    }
    if (q.minDiscount != null) {
      list = list.filter((p) => discountPercent(p) >= q.minDiscount!);
    }
    return list;
  }

  private applySort(list: Product[], sort?: SortOption): Product[] {
    const copy = [...list];
    switch (sort) {
      case 'price-asc':
        return copy.sort((a, b) => a.price - b.price);
      case 'price-desc':
        return copy.sort((a, b) => b.price - a.price);
      case 'popular':
        return copy.sort((a, b) => b.soldCount - a.soldCount);
      case 'latest':
        return copy.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      default:
        return copy;
    }
  }

  private categoryName(id: string): string {
    return this.categories.find((c) => c.id === id)?.name ?? '';
  }

  private emit<T>(value: T): Observable<T> {
    return of(value).pipe(delay(LATENCY));
  }
}
