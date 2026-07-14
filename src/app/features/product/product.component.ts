import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { switchMap } from 'rxjs';
import { map } from 'rxjs/operators';
import { CatalogService } from '../../core/data/catalog.service';
import { CartService } from '../../core/state/cart.service';
import { WishlistService } from '../../core/state/wishlist.service';
import { LoginGateService } from '../../core/state/login-gate.service';
import { Product, discountPercent } from '../../core/models/product.model';
import { inr } from '../../core/util/format';
import { StarRatingComponent } from '../../shared/star-rating/star-rating.component';
import { QuantitySelectorComponent } from '../../shared/quantity-selector/quantity-selector.component';
import { ProductRailComponent } from '../../shared/product-rail/product-rail.component';
import { RevealDirective } from '../../shared/reveal/reveal.directive';

@Component({
  selector: 'zylo-product',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    StarRatingComponent,
    QuantitySelectorComponent,
    ProductRailComponent,
    RevealDirective,
  ],
  templateUrl: './product.component.html',
  styleUrl: './product.component.scss',
})
export class ProductComponent {
  private readonly catalog = inject(CatalogService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly cart = inject(CartService);
  private readonly wishlist = inject(WishlistService);
  private readonly gate = inject(LoginGateService);

  inr = inr;

  private readonly slug = toSignal(this.route.paramMap.pipe(map((p) => p.get('slug') ?? '')), {
    initialValue: '',
  });

  readonly product = toSignal(
    toObservable(this.slug).pipe(switchMap((s) => this.catalog.getProduct(s))),
    { initialValue: undefined },
  );

  readonly related = toSignal(
    toObservable(computed(() => this.product())).pipe(
      switchMap((p) => (p ? this.catalog.getRelated(p) : Promise.resolve([]))),
    ),
    { initialValue: [] as Product[] },
  );

  // Local UI state
  readonly activeImage = signal(0);
  readonly qty = signal(1);
  readonly selectedOptions = signal<Record<string, string>>({});
  readonly pincode = signal('');
  readonly pinResult = signal<string | null>(null);
  readonly activeTab = signal<'desc' | 'specs' | 'reviews' | 'qa'>('desc');
  readonly zoom = signal(false);
  readonly zoomPos = signal({ x: 50, y: 50 });

  readonly discount = computed(() => (this.product() ? discountPercent(this.product()!) : 0));
  readonly saved = computed(() => (this.product() ? this.wishlist.has(this.product()!.id) : false));

  readonly frequentlyBought = computed(() => {
    const p = this.product();
    if (!p) return [];
    return [p, ...this.related().slice(0, 2)];
  });

  readonly fbtTotal = computed(() =>
    this.frequentlyBought().reduce((sum, p) => sum + p.price, 0),
  );

  selectOption(name: string, value: string): void {
    this.selectedOptions.update((o) => ({ ...o, [name]: value }));
  }

  addToCart(): void {
    const p = this.product();
    if (p) this.cart.add(p, this.qty(), this.selectedOptions());
  }

  async buyNow(): Promise<void> {
    const p = this.product();
    if (!p) return;
    this.cart.add(p, this.qty(), this.selectedOptions());
    if (await this.gate.ensureLoggedIn()) {
      this.router.navigate(['/checkout']);
    }
  }

  toggleWishlist(): void {
    const p = this.product();
    if (p) this.wishlist.toggle(p);
  }

  checkPincode(pin: string): void {
    if (!/^\d{6}$/.test(pin)) {
      this.pinResult.set('Enter a valid 6-digit pincode.');
      return;
    }
    this.pincode.set(pin);
    // Deterministic mock: derive a delivery estimate from the pincode.
    const days = (parseInt(pin.slice(-1), 10) % 4) + 2;
    this.pinResult.set(`Delivery by ${days}–${days + 1} days · COD available`);
  }

  onZoomMove(e: MouseEvent): void {
    const el = e.currentTarget as HTMLElement;
    const rect = el.getBoundingClientRect();
    this.zoomPos.set({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  }

  share(): void {
    // Web Share API where available; otherwise no-op friendly.
    const p = this.product();
    if (p && (navigator as Navigator & { share?: unknown }).share) {
      (navigator as unknown as { share: (d: unknown) => Promise<void> })
        .share({ title: p.name, text: p.name, url: location.href })
        .catch(() => {});
    }
  }

  addFbtToCart(): void {
    this.frequentlyBought().forEach((p) => this.cart.add(p, 1));
  }
}
