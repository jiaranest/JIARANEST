import { AgeGroup } from './product.model';

export type SortOption = 'latest' | 'popular' | 'price-asc' | 'price-desc';

export interface ProductQuery {
  categoryId?: string;
  search?: string;
  sort?: SortOption;
  minPrice?: number;
  maxPrice?: number;
  brands?: string[];
  colors?: string[];
  sizes?: string[];
  ageGroups?: AgeGroup[];
  gender?: 'boys' | 'girls' | 'unisex';
  minRating?: number;
  inStockOnly?: boolean;
  minDiscount?: number;
  page?: number;
  pageSize?: number;
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

/** Facet values available for the current result set, used to render filters. */
export interface ProductFacets {
  brands: { value: string; count: number }[];
  colors: string[];
  sizes: string[];
  ageGroups: AgeGroup[];
  priceRange: { min: number; max: number };
}
