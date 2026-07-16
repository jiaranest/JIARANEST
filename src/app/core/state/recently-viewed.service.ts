import { Injectable, computed, effect, signal } from '@angular/core';
import { Product } from '../models/product.model';

const KEY = 'jiara.recent.v1';
const MAX = 12; // keep the most recent N

/**
 * Tracks products the shopper has recently viewed, newest first, in
 * localStorage (`jiara.recent.v1`). Mirrors WishlistService's pattern — stores
 * full Product objects so the rails render with no re-fetch. Purely client-side.
 */
@Injectable({ providedIn: 'root' })
export class RecentlyViewedService {
  private readonly _items = signal<Product[]>(this.load());
  readonly items = this._items.asReadonly();
  readonly count = computed(() => this._items().length);

  constructor() {
    effect(() => {
      try {
        localStorage.setItem(KEY, JSON.stringify(this._items()));
      } catch {
        /* ignore */
      }
    });
  }

  /** Record a view: move the product to the front, dedupe, cap at MAX. */
  add(product: Product): void {
    this._items.update((items) => {
      const rest = items.filter((p) => p.id !== product.id);
      return [product, ...rest].slice(0, MAX);
    });
  }

  /** Recently viewed, optionally excluding one product id (e.g. the current page). */
  list(excludeId?: string): Product[] {
    const items = this._items();
    return excludeId ? items.filter((p) => p.id !== excludeId) : items;
  }

  private load(): Product[] {
    try {
      const raw = localStorage.getItem(KEY);
      return raw ? (JSON.parse(raw) as Product[]) : [];
    } catch {
      return [];
    }
  }
}
