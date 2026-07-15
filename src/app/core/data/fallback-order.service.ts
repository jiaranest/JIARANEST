import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { CreateOrderRequest, Order, OrderService } from './order.service';
import { HttpOrderService } from './http-order.service';
import { MockOrderService } from './mock-order.service';
import { withFallback } from './fallback.util';

/**
 * Orders that prefer the real API but fall back to the mock when it's down —
 * so checkout still completes (with a demo order) if the backend is asleep.
 */
@Injectable({ providedIn: 'root' })
export class FallbackOrderService extends OrderService {
  private readonly api = inject(HttpOrderService);
  private readonly mock = inject(MockOrderService);

  createOrder(req: CreateOrderRequest): Observable<Order> {
    return withFallback(() => this.api.createOrder(req), () => this.mock.createOrder(req));
  }

  listOrders(): Observable<Order[]> {
    return withFallback(() => this.api.listOrders(), () => this.mock.listOrders());
  }

  getOrder(orderNumber: string): Observable<Order | undefined> {
    return withFallback(() => this.api.getOrder(orderNumber), () => this.mock.getOrder(orderNumber));
  }
}
