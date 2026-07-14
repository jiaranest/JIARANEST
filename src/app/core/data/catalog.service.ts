import { Observable } from 'rxjs';
import { InjectionToken } from '@angular/core';
import { Category, Product } from '../models/product.model';
import { Paginated, ProductFacets, ProductQuery } from '../models/filter.model';

/**
 * The single seam between the UI and its data source.
 *
 * Phase 1 binds this token to `MockCatalogService` (in-memory data). When the
 * NestJS backend exists, an `HttpCatalogService` implementing the same contract
 * is bound instead — no component changes required.
 */
export abstract class CatalogService {
  abstract getCategories(): Observable<Category[]>;
  abstract getCategory(slug: string): Observable<Category | undefined>;

  abstract queryProducts(query: ProductQuery): Observable<Paginated<Product>>;
  abstract getFacets(query: ProductQuery): Observable<ProductFacets>;

  abstract getProduct(slug: string): Observable<Product | undefined>;
  abstract getRelated(product: Product, limit?: number): Observable<Product[]>;

  /** Curated home-page rails. */
  abstract getFeatured(): Observable<Product[]>;
  abstract getNewArrivals(): Observable<Product[]>;
  abstract getBestSellers(): Observable<Product[]>;
  abstract getTrending(): Observable<Product[]>;

  /** Search autosuggest — returns lightweight matches. */
  abstract suggest(term: string): Observable<Product[]>;
}

export const CATALOG_SERVICE = new InjectionToken<CatalogService>('CATALOG_SERVICE');
