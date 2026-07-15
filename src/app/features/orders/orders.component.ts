import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { KeyValuePipe } from '@angular/common';
import { OrderService, Order } from '../../core/data/order.service';
import { AuthService } from '../../core/state/auth.service';
import { LoginGateService } from '../../core/state/login-gate.service';
import { inr } from '../../core/util/format';

@Component({
  selector: 'jiara-orders',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, KeyValuePipe],
  templateUrl: './orders.component.html',
  styleUrl: './orders.component.scss',
})
export class OrdersComponent {
  private readonly orders = inject(OrderService);
  readonly auth = inject(AuthService);
  private readonly gate = inject(LoginGateService);
  inr = inr;

  readonly loading = signal(false);
  readonly error = signal('');
  readonly list = signal<Order[]>([]);

  constructor() {
    if (this.auth.isLoggedIn()) {
      this.load();
    }
  }

  /** Prompt login, then load orders if it succeeds. */
  async login(): Promise<void> {
    if (await this.gate.ensureLoggedIn()) {
      this.load();
    }
  }

  /** Sign out and clear the shown orders. */
  logout(): void {
    this.auth.logout();
    this.list.set([]);
    this.error.set('');
  }

  private load(): void {
    this.loading.set(true);
    this.error.set('');
    this.orders.listOrders().subscribe({
      next: (orders) => {
        this.list.set(orders);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Could not load your orders. Please try again.');
        this.loading.set(false);
      },
    });
  }

  /** e.g. "Jul 15, 2026" from the order's ISO createdAt. */
  formatDate(iso: string): string {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  itemCount(o: Order): number {
    return o.items.reduce((n, i) => n + i.quantity, 0);
  }
}
