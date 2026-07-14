import { Product } from './product.model';

export interface CartItem {
  product: Product;
  quantity: number;
  /** Selected variant choices, keyed by option name e.g. { Color: 'Black', Size: 'M' }. */
  selectedOptions?: Record<string, string>;
}

export interface Coupon {
  code: string;
  /** 'flat' subtracts a rupee amount; 'percent' subtracts a percentage of the subtotal. */
  type: 'flat' | 'percent';
  value: number;
  minSubtotal?: number;
  description: string;
}

export interface OrderSummary {
  subtotal: number;
  discount: number;
  shipping: number;
  tax: number;
  total: number;
  itemCount: number;
}
