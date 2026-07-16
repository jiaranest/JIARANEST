import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CartService } from '../../core/state/cart.service';
import { WishlistService } from '../../core/state/wishlist.service';

/**
 * Amazon-style mobile bottom navigation bar. Fixed to the viewport bottom on
 * phones/tablets (≤900px), hidden on desktop where the header nav is enough.
 * Five icon+label destinations; Cart/Wishlist show live count badges. Respects
 * the iOS home-indicator safe area.
 */
@Component({
  selector: 'jiara-bottom-nav',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <nav class="bnav" aria-label="Primary">
      <a
        class="bnav-item"
        routerLink="/"
        routerLinkActive="active"
        [routerLinkActiveOptions]="{ exact: true }"
      >
        <span class="material-icons">home</span>
        <span class="bnav-label">Home</span>
      </a>
      <a class="bnav-item" routerLink="/search" routerLinkActive="active">
        <span class="material-icons">grid_view</span>
        <span class="bnav-label">Categories</span>
      </a>
      <a class="bnav-item" routerLink="/orders" routerLinkActive="active">
        <span class="material-icons">receipt_long</span>
        <span class="bnav-label">Orders</span>
      </a>
      <a class="bnav-item" routerLink="/wishlist" routerLinkActive="active">
        <span class="bnav-icon-wrap">
          <span class="material-icons">favorite_border</span>
          @if (wishlist.count() > 0) {
            <span class="bnav-badge">{{ wishlist.count() }}</span>
          }
        </span>
        <span class="bnav-label">Wishlist</span>
      </a>
      <a class="bnav-item" routerLink="/cart" routerLinkActive="active">
        <span class="bnav-icon-wrap">
          <span class="material-icons">shopping_bag</span>
          @if (cart.count() > 0) {
            <span class="bnav-badge">{{ cart.count() }}</span>
          }
        </span>
        <span class="bnav-label">Cart</span>
      </a>
    </nav>
  `,
  styleUrl: './bottom-nav.component.scss',
})
export class BottomNavComponent {
  readonly cart = inject(CartService);
  readonly wishlist = inject(WishlistService);
}
