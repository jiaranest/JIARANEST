import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { WishlistService } from '../../core/state/wishlist.service';
import { CartService } from '../../core/state/cart.service';
import { discountPercent } from '../../core/models/product.model';
import { inr } from '../../core/util/format';
import { StarRatingComponent } from '../../shared/star-rating/star-rating.component';

@Component({
  selector: 'jiara-wishlist',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, StarRatingComponent],
  templateUrl: './wishlist.component.html',
  styleUrl: './wishlist.component.scss',
})
export class WishlistComponent {
  readonly wishlist = inject(WishlistService);
  private readonly cart = inject(CartService);
  inr = inr;
  discountPercent = discountPercent;

  moveToCart(id: string): void {
    const product = this.wishlist.items().find((p) => p.id === id);
    if (product) {
      this.cart.add(product, 1);
      this.wishlist.remove(id);
    }
  }
}
