import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CatalogService } from './catalog.service';
import { Category, Product } from '../models/product.model';
import { Paginated, ProductFacets, ProductQuery } from '../models/filter.model';
import { environment } from '../config/environment';

/**
 * Real catalog data source — talks to the NestJS API (see server/).
 *
 * Implements the same `CatalogService` contract as `MockCatalogService`, so
 * binding this in app.config is the only change needed to go live. Response
 * shapes match the domain models exactly (the API mirrors them field-for-field).
 */
@Injectable({ providedIn: 'root' })
export class HttpCatalogService extends CatalogService {
  private readonly http = inject(HttpClient);
  private readonly base = environment.apiUrl;

  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.base}/categories`);
  }

  getCategory(slug: string): Observable<Category | undefined> {
    return this.http.get<Category | undefined>(`${this.base}/categories/${slug}`);
  }

  queryProducts(query: ProductQuery): Observable<Paginated<Product>> {
    return this.http.get<Paginated<Product>>(`${this.base}/products`, {
      params: this.toParams(query),
    });
  }

  getFacets(query: ProductQuery): Observable<ProductFacets> {
    // Only the scope fields matter for facets; the API ignores the rest.
    return this.http.get<ProductFacets>(`${this.base}/products/facets`, {
      params: this.toParams({ categoryId: query.categoryId, search: query.search }),
    });
  }

  getProduct(slug: string): Observable<Product | undefined> {
    return this.http.get<Product | undefined>(`${this.base}/products/${slug}`);
  }

  getRelated(product: Product, limit = 6): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.base}/products/${product.slug}/related`, {
      params: new HttpParams().set('limit', limit),
    });
  }

  getFeatured(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.base}/rails/featured`);
  }

  getNewArrivals(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.base}/rails/new`);
  }

  getBestSellers(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.base}/rails/best`);
  }

  getTrending(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.base}/rails/trending`);
  }

  suggest(term: string): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.base}/suggest`, {
      params: new HttpParams().set('q', term),
    });
  }

  /** Build query params from a ProductQuery, omitting empty values. Arrays are
   *  sent as repeated params (e.g. brands=A&brands=B); the API's DTO accepts
   *  both repeated and comma-separated forms. */
  private toParams(query: ProductQuery): HttpParams {
    let params = new HttpParams();
    const set = (key: string, value: unknown) => {
      if (value == null || value === '') return;
      params = params.set(key, String(value));
    };
    const setArr = (key: string, value?: unknown[]) => {
      if (!value?.length) return;
      for (const v of value) params = params.append(key, String(v));
    };

    set('categoryId', query.categoryId);
    set('search', query.search);
    set('sort', query.sort);
    set('minPrice', query.minPrice);
    set('maxPrice', query.maxPrice);
    setArr('brands', query.brands);
    setArr('colors', query.colors);
    setArr('sizes', query.sizes);
    setArr('ageGroups', query.ageGroups);
    set('gender', query.gender);
    set('minRating', query.minRating);
    if (query.inStockOnly) set('inStockOnly', true);
    set('minDiscount', query.minDiscount);
    set('page', query.page);
    set('pageSize', query.pageSize);
    return params;
  }
}
