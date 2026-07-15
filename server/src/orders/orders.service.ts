import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';

/**
 * Order logic. Totals are RECOMPUTED here from real DB prices — the client's
 * numbers are never trusted. The money formula mirrors the storefront's
 * CartService.summary() (free ship >= 999 else 79, 18% GST on the discounted
 * subtotal) plus checkout's express-delivery override (flat 149).
 */

const FREE_SHIP_THRESHOLD = 999;
const SHIP_FLAT = 79;
const EXPRESS_FEE = 149;
const TAX_RATE = 0.18;

// Demo coupons — must match src/app/core/state/cart.service.ts COUPONS.
const COUPONS: Record<
  string,
  { type: 'flat' | 'percent'; value: number; minSubtotal?: number }
> = {
  PLAY10: { type: 'percent', value: 10 },
  FLAT300: { type: 'flat', value: 300, minSubtotal: 1499 },
  WELCOME: { type: 'percent', value: 15, minSubtotal: 999 },
};

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateOrderDto) {
    // 1. Look up the real products for the submitted slugs.
    const slugs = dto.items.map((i) => i.slug);
    const products = await this.prisma.product.findMany({ where: { slug: { in: slugs } } });
    const bySlug = new Map(products.map((p) => [p.slug, p]));

    // 2. Build line items from REAL prices; reject anything unknown/out of stock.
    const lineItems = dto.items.map((i) => {
      const p = bySlug.get(i.slug);
      if (!p) throw new BadRequestException(`Unknown product: ${i.slug}`);
      if (!p.inStock) throw new BadRequestException(`Out of stock: ${p.name}`);
      return {
        productId: p.id,
        slug: p.slug,
        name: p.name,
        brand: p.brand,
        image: this.firstImage(p.images),
        unitPrice: p.price,
        quantity: i.quantity,
        selectedOptions: i.selectedOptions ?? undefined,
      };
    });

    // 3. Recompute totals server-side.
    const subtotal = lineItems.reduce((s, li) => s + li.unitPrice * li.quantity, 0);
    const discount = this.couponDiscount(dto.couponCode, subtotal);
    const afterDiscount = Math.max(0, subtotal - discount);
    const baseShip = subtotal === 0 || subtotal >= FREE_SHIP_THRESHOLD ? 0 : SHIP_FLAT;
    const shipping = dto.delivery === 'express' ? EXPRESS_FEE : baseShip;
    const tax = Math.round(afterDiscount * TAX_RATE);
    const total = afterDiscount + shipping + tax;

    // 4. Persist.
    const orderNumber = this.generateOrderNumber();
    const order = await this.prisma.order.create({
      data: {
        orderNumber,
        userId,
        name: dto.address.name,
        phone: dto.address.phone,
        line1: dto.address.line1,
        line2: dto.address.line2 ?? null,
        city: dto.address.city,
        state: dto.address.state,
        pincode: dto.address.pincode,
        delivery: dto.delivery,
        paymentMethod: dto.paymentMethod,
        subtotal,
        discount,
        shipping,
        tax,
        total,
        couponCode: discount > 0 ? (dto.couponCode ?? null) : null,
        items: { create: lineItems },
      },
      include: { items: true },
    });

    return this.mapOrder(order);
  }

  async listForUser(userId: string) {
    const orders = await this.prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: { items: true },
    });
    return orders.map((o) => this.mapOrder(o));
  }

  async getForUser(userId: string, orderNumber: string) {
    const order = await this.prisma.order.findFirst({
      where: { userId, orderNumber },
      include: { items: true },
    });
    return order ? this.mapOrder(order) : undefined;
  }

  // ---- helpers ----

  private couponDiscount(code: string | undefined, subtotal: number): number {
    if (!code) return 0;
    const c = COUPONS[code.toUpperCase()];
    if (!c) return 0;
    if (c.minSubtotal && subtotal < c.minSubtotal) return 0;
    return c.type === 'flat' ? c.value : Math.round((subtotal * c.value) / 100);
  }

  private generateOrderNumber(): string {
    // Human-readable, unique enough for the store: JN + 8 base36 chars.
    const rand = Math.random().toString(36).slice(2, 10).toUpperCase();
    return `JN${rand}`;
  }

  private firstImage(images: unknown): string {
    const arr = images as { url: string }[] | null;
    return arr?.[0]?.url ?? '';
  }

  private mapOrder(o: {
    orderNumber: string;
    status: string;
    name: string;
    phone: string;
    line1: string;
    line2: string | null;
    city: string;
    state: string;
    pincode: string;
    delivery: string;
    paymentMethod: string;
    subtotal: number;
    discount: number;
    shipping: number;
    tax: number;
    total: number;
    couponCode: string | null;
    createdAt: Date;
    items: {
      productId: string;
      slug: string;
      name: string;
      brand: string;
      image: string;
      unitPrice: number;
      quantity: number;
      selectedOptions: unknown;
    }[];
  }) {
    return {
      orderNumber: o.orderNumber,
      status: o.status,
      address: {
        name: o.name,
        phone: o.phone,
        line1: o.line1,
        line2: o.line2 ?? '',
        city: o.city,
        state: o.state,
        pincode: o.pincode,
      },
      delivery: o.delivery,
      paymentMethod: o.paymentMethod,
      subtotal: o.subtotal,
      discount: o.discount,
      shipping: o.shipping,
      tax: o.tax,
      total: o.total,
      couponCode: o.couponCode ?? undefined,
      createdAt: o.createdAt.toISOString(),
      items: o.items.map((li) => ({
        productId: li.productId,
        slug: li.slug,
        name: li.name,
        brand: li.brand,
        image: li.image,
        unitPrice: li.unitPrice,
        quantity: li.quantity,
        selectedOptions: li.selectedOptions ?? undefined,
      })),
    };
  }
}
