import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { UpperCasePipe } from '@angular/common';
import { CartService } from '../../core/state/cart.service';
import { AuthService } from '../../core/state/auth.service';
import { OrderService } from '../../core/data/order.service';
import { inr } from '../../core/util/format';

type PaymentMethod = 'upi' | 'card' | 'netbanking' | 'wallet' | 'cod';
type DeliveryMethod = 'standard' | 'express';

interface Address {
  name: string;
  phone: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  pincode: string;
}

@Component({
  selector: 'jiara-checkout',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, FormsModule, UpperCasePipe],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.scss',
})
export class CheckoutComponent {
  readonly cart = inject(CartService);
  private readonly auth = inject(AuthService);
  private readonly orders = inject(OrderService);
  private readonly router = inject(Router);
  inr = inr;

  readonly step = signal<1 | 2 | 3>(1);
  readonly placed = signal(false);
  readonly orderNumber = signal('');
  /** True while the order POST is in flight. */
  readonly placing = signal(false);
  /** Server/network error shown on the payment step if placing fails. */
  readonly placeError = signal('');

  readonly address = signal<Address>({
    name: '',
    phone: this.auth.user()?.phone ?? '',
    line1: '',
    line2: '',
    city: '',
    state: '',
    pincode: '',
  });
  readonly billingSame = signal(true);
  readonly delivery = signal<DeliveryMethod>('standard');
  readonly payment = signal<PaymentMethod>('upi');
  readonly errors = signal<string[]>([]);

  readonly deliveryFee = computed(() => (this.delivery() === 'express' ? 149 : this.cart.summary().shipping));
  readonly grandTotal = computed(() => {
    const s = this.cart.summary();
    // Express adds a flat fee on top of the summary's shipping baseline.
    const extra = this.delivery() === 'express' ? 149 - s.shipping : 0;
    return s.total + Math.max(0, extra);
  });

  readonly eta = computed(() => (this.delivery() === 'express' ? '1–2 days' : '4–6 days'));

  update<K extends keyof Address>(key: K, value: Address[K]): void {
    this.address.update((a) => ({ ...a, [key]: value }));
  }

  goToPayment(): void {
    const a = this.address();
    const errs: string[] = [];
    if (!a.name.trim()) errs.push('Full name is required.');
    if (!/^\d{10}$/.test(a.phone)) errs.push('A valid 10-digit phone is required.');
    if (!a.line1.trim()) errs.push('Address line 1 is required.');
    if (!a.city.trim()) errs.push('City is required.');
    if (!a.state.trim()) errs.push('State is required.');
    if (!/^\d{6}$/.test(a.pincode)) errs.push('A valid 6-digit pincode is required.');
    this.errors.set(errs);
    if (errs.length === 0) {
      this.step.set(2);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  placeOrder(): void {
    if (this.placing()) return;
    const items = this.cart.items();
    if (items.length === 0) return;

    this.placeError.set('');
    this.placing.set(true);

    // Server recomputes totals from real prices — we send items + address only.
    this.orders
      .createOrder({
        items: items.map((i) => ({
          slug: i.product.slug,
          quantity: i.quantity,
          selectedOptions: i.selectedOptions,
        })),
        address: this.address(),
        delivery: this.delivery(),
        paymentMethod: this.payment(),
        couponCode: this.cart.coupon()?.code,
      })
      .subscribe({
        next: (order) => {
          this.placing.set(false);
          this.orderNumber.set(order.orderNumber);
          this.placed.set(true);
          this.cart.clear();
          window.scrollTo({ top: 0, behavior: 'smooth' });
        },
        error: (e) => {
          this.placing.set(false);
          this.placeError.set(this.errMsg(e));
        },
      });
  }

  private errMsg(err: unknown): string {
    const e = err as { status?: number; error?: { message?: string | string[] } };
    if (e?.status === 401) return 'Your session expired. Please log in again.';
    const m = e?.error?.message;
    if (Array.isArray(m)) return m[0] ?? 'Could not place the order. Please try again.';
    return m ?? 'Could not place the order. Please try again.';
  }

  backToShop(): void {
    this.router.navigate(['/']);
  }
}
