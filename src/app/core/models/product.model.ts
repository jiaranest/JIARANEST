/**
 * Domain models for the Jiaranest storefront.
 *
 * These are deliberately framework-agnostic plain interfaces so that the
 * mock data layer today and a real REST API later can both satisfy them
 * without any change to the components that consume them.
 */

export interface ProductImage {
  url: string;
  alt: string;
}

export interface ProductVariantOption {
  /** e.g. "Color" or "Size" */
  name: string;
  /** e.g. ["Black", "White"] or ["S", "M", "L"] */
  values: string[];
}

export interface ProductSpec {
  label: string;
  value: string;
}

export interface Review {
  id: string;
  author: string;
  rating: number; // 1..5
  title: string;
  body: string;
  date: string; // ISO
  verifiedPurchase: boolean;
  images?: string[];
  helpfulCount: number;
}

export type ProductBadge = 'new' | 'bestseller' | 'trending' | 'deal';

/** Age bands used for "Shop by Age" browsing in the kids store. */
export type AgeGroup = '0-2' | '3-5' | '6-8' | '9-12';

export const AGE_GROUPS: { id: AgeGroup; label: string }[] = [
  { id: '0-2', label: '0–2 yrs' },
  { id: '3-5', label: '3–5 yrs' },
  { id: '6-8', label: '6–8 yrs' },
  { id: '9-12', label: '9–12 yrs' },
];

export interface Product {
  id: string;
  slug: string;
  name: string;
  brand: string;
  categoryId: string;
  description: string;
  images: ProductImage[];
  /** Current selling price in INR (paise-free, whole rupees for the mock). */
  price: number;
  /** Original price before discount; when > price we show a strike-through + %. */
  mrp: number;
  rating: number; // average, 0..5
  ratingCount: number;
  inStock: boolean;
  stockCount: number;
  colors?: string[];
  sizes?: string[];
  specs?: ProductSpec[];
  variantOptions?: ProductVariantOption[];
  badges?: ProductBadge[];
  /** Age band this product suits, for "Shop by Age" browsing. */
  ageGroup?: AgeGroup;
  /** 'boys' | 'girls' | 'unisex' — used for clothing/gender facets. */
  gender?: 'boys' | 'girls' | 'unisex';
  reviews?: Review[];
  /** ISO date used to compute "new arrivals" ordering. */
  createdAt: string;
  /** Denormalised popularity score used for "best sellers" / "trending". */
  soldCount: number;
}

export interface Category {
  id: string;
  slug: string;
  name: string;
  image: string;
  productCount: number;
  parentId?: string;
}

/** How the discount percentage is derived, kept in one place. */
export function discountPercent(product: Pick<Product, 'price' | 'mrp'>): number {
  if (!product.mrp || product.mrp <= product.price) {
    return 0;
  }
  return Math.round(((product.mrp - product.price) / product.mrp) * 100);
}
