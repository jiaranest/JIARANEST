import { ChangeDetectionStrategy, Component, computed, inject, input, output, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Product, discountPercent } from '../../core/models/product.model';
import { CartService } from '../../core/state/cart.service';
import { WishlistService } from '../../core/state/wishlist.service';
import { inr } from '../../core/util/format';
import { StarRatingComponent } from '../star-rating/star-rating.component';
import { QuantitySelectorComponent } from '../quantity-selector/quantity-selector.component';

@Component({
  selector: 'jiara-product-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, StarRatingComponent, QuantitySelectorComponent],
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

  readonly discount = computed(() => discountPercent(this.product()));
  readonly saved = computed(() => this.wishlist.has(this.product().id));

  inr = inr;

  addToCart(e: Event): void {
    e.stopPropagation();
    this.cart.add(this.product(), this.qty());
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
