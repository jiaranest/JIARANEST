import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { RouterLink } from '@angular/router';
import { Product, discountPercent } from '../../core/models/product.model';
import { CartService } from '../../core/state/cart.service';
import { WishlistService } from '../../core/state/wishlist.service';
import { inr } from '../../core/util/format';
import { StarRatingComponent } from '../star-rating/star-rating.component';
import { QuantitySelectorComponent } from '../quantity-selector/quantity-selector.component';

@Component({
  selector: 'zylo-quick-view',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatDialogModule, RouterLink, StarRatingComponent, QuantitySelectorComponent],
  templateUrl: './quick-view.component.html',
  styleUrl: './quick-view.component.scss',
})
export class QuickViewComponent {
  private readonly cart = inject(CartService);
  private readonly wishlist = inject(WishlistService);
  private readonly ref = inject(MatDialogRef<QuickViewComponent, 'buy' | null>);
  readonly product = inject<Product>(MAT_DIALOG_DATA);

  readonly qty = signal(1);
  readonly activeImage = signal(0);
  readonly discount = computed(() => discountPercent(this.product));
  readonly saved = computed(() => this.wishlist.has(this.product.id));

  inr = inr;

  addToCart(): void {
    this.cart.add(this.product, this.qty());
    this.ref.close(null);
  }

  buyNow(): void {
    this.cart.add(this.product, this.qty());
    this.ref.close('buy');
  }

  toggleWishlist(): void {
    this.wishlist.toggle(this.product);
  }

  close(): void {
    this.ref.close(null);
  }
}
