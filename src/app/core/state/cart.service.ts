import { Injectable, computed, effect, signal } from '@angular/core';
import { CartItem, Coupon, OrderSummary } from '../models/cart.model';
import { Product, discountPercent } from '../models/product.model';

const CART_KEY = 'zylo.cart.v1';
const SAVED_KEY = 'zylo.saved.v1';

/** Demo coupons the checkout/cart accepts. */
export const COUPONS: Coupon[] = [
  { code: 'PLAY10', type: 'percent', value: 10, description: '10% off your order' },
  { code: 'FLAT300', type: 'flat', value: 300, minSubtotal: 1499, description: '₹300 off orders over ₹1,499' },
  { code: 'WELCOME', type: 'percent', value: 15, minSubtotal: 999, description: '15% off (min ₹999)' },
];

const FREE_SHIP_THRESHOLD = 999;
const SHIP_FLAT = 79;
const TAX_RATE = 0.18; // GST for the mock summary

@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly _items = signal<CartItem[]>(this.load(CART_KEY));
  private readonly _saved = signal<CartItem[]>(this.load(SAVED_KEY));
  private readonly _coupon = signal<Coupon | null>(null);

  readonly items = this._items.asReadonly();
  readonly saved = this._saved.asReadonly();
  readonly coupon = this._coupon.asReadonly();

  readonly count = computed(() => this._items().reduce((n, i) => n + i.quantity, 0));

  readonly summary = computed<OrderSummary>(() => {
    const items = this._items();
    const subtotal = items.reduce((s, i) => s + i.product.price * i.quantity, 0);
    const coupon = this._coupon();
    let discount = 0;
    if (coupon && (!coupon.minSubtotal || subtotal >= coupon.minSubtotal)) {
      discount = coupon.type === 'flat' ? coupon.value : Math.round((subtotal * coupon.value) / 100);
    }
    const afterDiscount = Math.max(0, subtotal - discount);
    const shipping = subtotal === 0 || subtotal >= FREE_SHIP_THRESHOLD ? 0 : SHIP_FLAT;
    const tax = Math.round(afterDiscount * TAX_RATE);
    return {
      subtotal,
      discount,
      shipping,
      tax,
      total: afterDiscount + shipping + tax,
      itemCount: items.reduce((n, i) => n + i.quantity, 0),
    };
  });

  constructor() {
    // Persist on any change.
    effect(() => this.save(CART_KEY, this._items()));
    effect(() => this.save(SAVED_KEY, this._saved()));
  }

  add(product: Product, quantity = 1, selectedOptions?: Record<string, string>): void {
    this._items.update((items) => {
      const idx = items.findIndex((i) => i.product.id === product.id && sameOptions(i.selectedOptions, selectedOptions));
      if (idx >= 0) {
        const copy = [...items];
        copy[idx] = { ...copy[idx], quantity: copy[idx].quantity + quantity };
        return copy;
      }
      return [...items, { product, quantity, selectedOptions }];
    });
  }

  setQuantity(productId: string, quantity: number): void {
    if (quantity <= 0) {
      this.remove(productId);
      return;
    }
    this._items.update((items) =>
      items.map((i) => (i.product.id === productId ? { ...i, quantity } : i)),
    );
  }

  remove(productId: string): void {
    this._items.update((items) => items.filter((i) => i.product.id !== productId));
  }

  saveForLater(productId: string): void {
    const item = this._items().find((i) => i.product.id === productId);
    if (!item) return;
    this.remove(productId);
    this._saved.update((s) => (s.some((x) => x.product.id === productId) ? s : [...s, { ...item, quantity: 1 }]));
  }

  moveToCart(productId: string): void {
    const item = this._saved().find((i) => i.product.id === productId);
    if (!item) return;
    this._saved.update((s) => s.filter((i) => i.product.id !== productId));
    this.add(item.product, 1, item.selectedOptions);
  }

  removeSaved(productId: string): void {
    this._saved.update((s) => s.filter((i) => i.product.id !== productId));
  }

  applyCoupon(code: string): { ok: boolean; message: string } {
    const found = COUPONS.find((c) => c.code.toLowerCase() === code.trim().toLowerCase());
    if (!found) {
      return { ok: false, message: 'Invalid coupon code.' };
    }
    const subtotal = this.summary().subtotal;
    if (found.minSubtotal && subtotal < found.minSubtotal) {
      return { ok: false, message: `Add more to reach the minimum for ${found.code}.` };
    }
    this._coupon.set(found);
    return { ok: true, message: `${found.code} applied — ${found.description}.` };
  }

  removeCoupon(): void {
    this._coupon.set(null);
  }

  clear(): void {
    this._items.set([]);
    this._coupon.set(null);
  }

  private load(key: string): CartItem[] {
    try {
      const raw = localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as CartItem[]) : [];
    } catch {
      return [];
    }
  }

  private save(key: string, items: CartItem[]): void {
    try {
      localStorage.setItem(key, JSON.stringify(items));
    } catch {
      /* storage unavailable — ignore for the mock */
    }
  }
}

function sameOptions(a?: Record<string, string>, b?: Record<string, string>): boolean {
  return JSON.stringify(a ?? {}) === JSON.stringify(b ?? {});
}

/** Re-export so components can show savings without importing the model util. */
export { discountPercent };
