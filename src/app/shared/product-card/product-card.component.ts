import { ChangeDetectionStrategy, Component, computed, inject, input, output, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Product, discountPercent } from '../../core/models/product.model';
import { CartService } from '../../core/state/cart.service';
import { WishlistService } from '../../core/state/wishlist.service';
import { inr } from '../../core/util/format';
import { StarRatingComponent } from '../star-rating/star-rating.component';

@Component({
  selector: 'jiara-product-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, StarRatingComponent],
  templateUrl: './product-card.component.html',
  styleUrl: './product-card.component.scss',
})
export class ProductCardComponent {
  private readonly cart = inject(CartService);
  private readonly wishlist = inject(WishlistService);

  readonly product = input.required<Product>();
  /** Emitted so the parent (listing/home) can open the quick-view dialog. */
  readonly quickView = output<Product>();
  /** Emitted for "Buy Now" so the page can route to checkout with the login gate. */
  readonly buyNow = output<Product>();

  readonly qty = signal(1);
  /** Brief "Added" confirmation state after clicking Add to Cart. */
  readonly justAdded = signal(false);
  private addedTimer?: ReturnType<typeof setTimeout>;

  readonly discount = computed(() => discountPercent(this.product()));
  readonly saved = computed(() => this.wishlist.has(this.product().id));

  /**
   * A subtle background accent for "special" cards, keyed to the product's
   * badge (so the tint carries meaning — deal/bestseller/trending/new). Regular
   * products return '' and stay on the plain surface. Priority order matters:
   * a deal is the strongest signal, then bestseller, trending, new.
   */
  readonly accent = computed<'' | 'deal' | 'bestseller' | 'trending' | 'new'>(() => {
    const badges = this.product().badges ?? [];
    if (badges.includes('deal')) return 'deal';
    if (badges.includes('bestseller')) return 'bestseller';
    if (badges.includes('trending')) return 'trending';
    if (badges.includes('new')) return 'new';
    return '';
  });

  inr = inr;

  addToCart(e: Event): void {
    e.stopPropagation();
    if (this.justAdded()) return;
    this.cart.add(this.product(), this.qty());
    // Show "Added" + disable briefly, then revert so it can be added again.
    this.justAdded.set(true);
    clearTimeout(this.addedTimer);
    this.addedTimer = setTimeout(() => this.justAdded.set(false), 1500);
  }

  onBuyNow(e: Event): void {
    e.stopPropagation();
    this.cart.add(this.product(), this.qty());
    this.buyNow.emit(this.product());
  }

  toggleWishlist(e: Event): void {
    e.stopPropagation();
    e.preventDefault();
    this.wishlist.toggle(this.product());
  }

  openQuickView(e: Event): void {
    e.stopPropagation();
    e.preventDefault();
    this.quickView.emit(this.product());
  }
}
