import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { KeyValuePipe } from '@angular/common';
import { CartService, COUPONS } from '../../core/state/cart.service';
import { LoginGateService } from '../../core/state/login-gate.service';
import { discountPercent } from '../../core/models/product.model';
import { inr } from '../../core/util/format';
import { QuantitySelectorComponent } from '../../shared/quantity-selector/quantity-selector.component';

@Component({
  selector: 'zylo-cart',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, KeyValuePipe, QuantitySelectorComponent],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.scss',
})
export class CartComponent {
  readonly cart = inject(CartService);
  private readonly gate = inject(LoginGateService);
  private readonly router = inject(Router);

  readonly coupons = COUPONS;
  readonly couponMsg = signal<{ ok: boolean; text: string } | null>(null);
  inr = inr;
  discountPercent = discountPercent;

  readonly savings = computed(() =>
    this.cart.items().reduce((s, i) => s + (i.product.mrp - i.product.price) * i.quantity, 0),
  );

  applyCoupon(code: string): void {
    const res = this.cart.applyCoupon(code);
    this.couponMsg.set({ ok: res.ok, text: res.message });
  }

  async checkout(): Promise<void> {
    if (this.cart.items().length === 0) return;
    if (await this.gate.ensureLoggedIn()) {
      this.router.navigate(['/checkout']);
    }
  }
}
