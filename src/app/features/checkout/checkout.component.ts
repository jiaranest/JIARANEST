import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { UpperCasePipe } from '@angular/common';
import { CartService } from '../../core/state/cart.service';
import { AuthService } from '../../core/state/auth.service';
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
  selector: 'zylo-checkout',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, FormsModule, UpperCasePipe],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.scss',
})
export class CheckoutComponent {
  readonly cart = inject(CartService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  inr = inr;

  readonly step = signal<1 | 2 | 3>(1);
  readonly placed = signal(false);
  readonly orderNumber = signal('');

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
    // Deterministic mock order id from cart contents + pincode (no Date.now()).
    const seed = this.cart.count() * 7919 + parseInt(this.address().pincode || '0', 10);
    this.orderNumber.set('ZYL' + (100000 + (seed % 900000)).toString());
    this.placed.set(true);
    this.cart.clear();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  backToShop(): void {
    this.router.navigate(['/']);
  }
}
