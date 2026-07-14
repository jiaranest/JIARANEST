import { Injectable, computed, effect, signal } from '@angular/core';
import { Product } from '../models/product.model';

const KEY = 'zylo.wishlist.v1';

@Injectable({ providedIn: 'root' })
export class WishlistService {
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

  has(id: string): boolean {
    return this._items().some((p) => p.id === id);
  }

  toggle(product: Product): void {
    this._items.update((items) =>
      items.some((p) => p.id === product.id)
        ? items.filter((p) => p.id !== product.id)
        : [...items, product],
    );
  }

  remove(id: string): void {
    this._items.update((items) => items.filter((p) => p.id !== id));
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
