import { Observable } from 'rxjs';

/** An order line as stored/returned by the API (product snapshot at order time). */
export interface OrderLine {
  productId: string;
  slug: string;
  name: string;
  brand: string;
  image: string;
  unitPrice: number;
  quantity: number;
  selectedOptions?: Record<string, string>;
}

export interface OrderAddress {
  name: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
}

/** Payload the checkout sends to place an order (server recomputes totals). */
export interface CreateOrderRequest {
  items: { slug: string; quantity: number; selectedOptions?: Record<string, string> }[];
  address: OrderAddress;
  delivery: 'standard' | 'express';
  paymentMethod: 'upi' | 'card' | 'netbanking' | 'wallet' | 'cod';
  couponCode?: string;
}

export interface Order {
  orderNumber: string;
  status: string;
  address: OrderAddress;
  delivery: 'standard' | 'express';
  paymentMethod: string;
  subtotal: number;
  discount: number;
  shipping: number;
  tax: number;
  total: number;
  couponCode?: string;
  createdAt: string;
  items: OrderLine[];
}

/**
 * The orders seam — mirrors CatalogService/AuthService. Bound to `HttpOrderService`
 * (real API) or `MockOrderService` (offline fallback) via environment.useApi.
 */
export abstract class OrderService {
  abstract createOrder(req: CreateOrderRequest): Observable<Order>;
  abstract listOrders(): Observable<Order[]>;
  abstract getOrder(orderNumber: string): Observable<Order | undefined>;
}
