import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { CreateOrderRequest, Order, OrderService } from './order.service';

/**
 * Offline fallback for orders (environment.useApi === false). Computes totals
 * the same way the server does and echoes back a deterministic order — enough
 * for the checkout confirmation screen to work without a backend.
 */
@Injectable({ providedIn: 'root' })
export class MockOrderService extends OrderService {
  private readonly created: Order[] = [];

  createOrder(req: CreateOrderRequest): Observable<Order> {
    // No real catalog here, so trust the (mock) client — this path is only used
    // when the API is off. The HttpOrderService is the real, price-checked path.
    const subtotal = 0;
    const seed = req.items.reduce((n, i) => n + i.quantity, 0) * 7919 + parseInt(req.address.pincode || '0', 10);
    const order: Order = {
      orderNumber: 'JN' + (100000 + (seed % 900000)).toString(),
      status: 'confirmed',
      address: req.address,
      delivery: req.delivery,
      paymentMethod: req.paymentMethod,
      subtotal,
      discount: 0,
      shipping: req.delivery === 'express' ? 149 : 0,
      tax: 0,
      total: 0,
      couponCode: req.couponCode,
      createdAt: '2026-07-14T00:00:00.000Z',
      items: req.items.map((i) => ({
        productId: i.slug,
        slug: i.slug,
        name: i.slug,
        brand: '',
        image: '',
        unitPrice: 0,
        quantity: i.quantity,
        selectedOptions: i.selectedOptions,
      })),
    };
    this.created.unshift(order);
    return of(order).pipe(delay(250));
  }

  listOrders(): Observable<Order[]> {
    return of(this.created).pipe(delay(250));
  }

  getOrder(orderNumber: string): Observable<Order | undefined> {
    return of(this.created.find((o) => o.orderNumber === orderNumber)).pipe(delay(250));
  }
}
