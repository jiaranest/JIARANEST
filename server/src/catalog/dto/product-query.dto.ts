import { Transform } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

const SORTS = ['latest', 'popular', 'price-asc', 'price-desc'] as const;
export type SortOption = (typeof SORTS)[number];

/** Coerce a query param that may arrive as ["a","b"], "a,b", or "a" into string[]. */
function toStringArray(value: unknown): string[] | undefined {
  if (value == null) return undefined;
  const arr = Array.isArray(value) ? value : String(value).split(',');
  const cleaned = arr.map((v) => String(v).trim()).filter((v) => v.length > 0);
  return cleaned.length ? cleaned : undefined;
}

/** Coerce "true"/"1" (and real booleans) to boolean. */
function toBoolean(value: unknown): boolean | undefined {
  if (value == null || value === '') return undefined;
  if (typeof value === 'boolean') return value;
  return value === 'true' || value === '1';
}

/**
 * Validated + coerced query params for GET /api/products (and /facets).
 * Mirrors the storefront's `ProductQuery` shape one-to-one.
 */
export class ProductQueryDto {
  @IsOptional()
  @IsString()
  categoryId?: string;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsIn(SORTS)
  sort?: SortOption;

  @IsOptional()
  @Transform(({ value }) => (value === '' || value == null ? undefined : Number(value)))
  @IsInt()
  minPrice?: number;

  @IsOptional()
  @Transform(({ value }) => (value === '' || value == null ? undefined : Number(value)))
  @IsInt()
  maxPrice?: number;

  @IsOptional()
  @Transform(({ value }) => toStringArray(value))
  @IsArray()
  brands?: string[];

  @IsOptional()
  @Transform(({ value }) => toStringArray(value))
  @IsArray()
  colors?: string[];

  @IsOptional()
  @Transform(({ value }) => toStringArray(value))
  @IsArray()
  sizes?: string[];

  @IsOptional()
  @Transform(({ value }) => toStringArray(value))
  @IsArray()
  ageGroups?: string[];

  @IsOptional()
  @IsIn(['boys', 'girls', 'unisex'])
  gender?: 'boys' | 'girls' | 'unisex';

  @IsOptional()
  @Transform(({ value }) => (value === '' || value == null ? undefined : Number(value)))
  minRating?: number;

  @IsOptional()
  @Transform(({ value }) => toBoolean(value))
  @IsBoolean()
  inStockOnly?: boolean;

  @IsOptional()
  @Transform(({ value }) => (value === '' || value == null ? undefined : Number(value)))
  @IsInt()
  minDiscount?: number;

  @IsOptional()
  @Transform(({ value }) => (value === '' || value == null ? undefined : Number(value)))
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Transform(({ value }) => (value === '' || value == null ? undefined : Number(value)))
  @IsInt()
  @Min(1)
  pageSize?: number;
}
