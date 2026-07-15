import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { CatalogService } from './catalog.service';
import { HttpCatalogService } from './http-catalog.service';
import { MockCatalogService } from './mock-catalog.service';
import { Category, Product } from '../models/product.model';
import { Paginated, ProductFacets, ProductQuery } from '../models/filter.model';
import { withFallback } from './fallback.util';

/**
 * Catalog that prefers the real API but transparently falls back to the mock
 * when the API errors or times out — so the storefront keeps working (on static
 * data) if the backend is down/asleep. Each method wraps both impls.
 */
@Injectable({ providedIn: 'root' })
export class FallbackCatalogService extends CatalogService {
  private readonly api = inject(HttpCatalogService);
  private readonly mock = inject(MockCatalogService);

  getCategories(): Observable<Category[]> {
    return withFallback(() => this.api.getCategories(), () => this.mock.getCategories());
  }

  getCategory(slug: string): Observable<Category | undefined> {
    return withFallback(() => this.api.getCategory(slug), () => this.mock.getCategory(slug));
  }

  queryProducts(query: ProductQuery): Observable<Paginated<Product>> {
    return withFallback(() => this.api.queryProducts(query), () => this.mock.queryProducts(query));
  }

  getFacets(query: ProductQuery): Observable<ProductFacets> {
    return withFallback(() => this.api.getFacets(query), () => this.mock.getFacets(query));
  }

  getProduct(slug: string): Observable<Product | undefined> {
    return withFallback(() => this.api.getProduct(slug), () => this.mock.getProduct(slug));
  }

  getRelated(product: Product, limit?: number): Observable<Product[]> {
    return withFallback(
      () => this.api.getRelated(product, limit),
      () => this.mock.getRelated(product, limit),
    );
  }

  getFeatured(): Observable<Product[]> {
    return withFallback(() => this.api.getFeatured(), () => this.mock.getFeatured());
  }

  getNewArrivals(): Observable<Product[]> {
    return withFallback(() => this.api.getNewArrivals(), () => this.mock.getNewArrivals());
  }

  getBestSellers(): Observable<Product[]> {
    return withFallback(() => this.api.getBestSellers(), () => this.mock.getBestSellers());
  }

  getTrending(): Observable<Product[]> {
    return withFallback(() => this.api.getTrending(), () => this.mock.getTrending());
  }

  suggest(term: string): Observable<Product[]> {
    return withFallback(() => this.api.suggest(term), () => this.mock.suggest(term));
  }
}
