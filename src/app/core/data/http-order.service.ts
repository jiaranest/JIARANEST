import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CreateOrderRequest, Order, OrderService } from './order.service';
import { environment } from '../config/environment';

/**
 * Real orders — talks to the NestJS API. The auth interceptor attaches the JWT,
 * so these calls are authenticated automatically. The server recomputes totals.
 */
@Injectable({ providedIn: 'root' })
export class HttpOrderService extends OrderService {
  private readonly http = inject(HttpClient);
  private readonly base = environment.apiUrl;

  createOrder(req: CreateOrderRequest): Observable<Order> {
    return this.http.post<Order>(`${this.base}/orders`, req);
  }

  listOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.base}/orders`);
  }

  getOrder(orderNumber: string): Observable<Order | undefined> {
    return this.http.get<Order | undefined>(`${this.base}/orders/${orderNumber}`);
  }
}
