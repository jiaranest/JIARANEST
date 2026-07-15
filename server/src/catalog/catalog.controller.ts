import { Controller, Get, Param, Query } from '@nestjs/common';
import { CatalogService } from './catalog.service';
import { ProductQueryDto } from './dto/product-query.dto';

/**
 * REST surface for the catalog. Routes map 1:1 to the storefront's
 * `CatalogService` contract. NOTE: the static `/products/facets` route is
 * declared BEFORE `/products/:slug` so "facets" isn't matched as a slug.
 */
@Controller()
export class CatalogController {
  constructor(private readonly catalog: CatalogService) {}

  @Get('categories')
  getCategories() {
    return this.catalog.getCategories();
  }

  @Get('categories/:slug')
  getCategory(@Param('slug') slug: string) {
    return this.catalog.getCategoryBySlug(slug);
  }

  @Get('products/facets')
  getFacets(@Query() query: ProductQueryDto) {
    return this.catalog.getFacets(query);
  }

  @Get('products')
  queryProducts(@Query() query: ProductQueryDto) {
    return this.catalog.queryProducts(query);
  }

  @Get('products/:slug')
  getProduct(@Param('slug') slug: string) {
    return this.catalog.getProductBySlug(slug);
  }

  @Get('products/:slug/related')
  getRelated(@Param('slug') slug: string, @Query('limit') limit?: string) {
    return this.catalog.getRelated(slug, limit ? Number(limit) : undefined);
  }

  @Get('rails/featured')
  getFeatured() {
    return this.catalog.getFeatured();
  }

  @Get('rails/new')
  getNewArrivals() {
    return this.catalog.getNewArrivals();
  }

  @Get('rails/best')
  getBestSellers() {
    return this.catalog.getBestSellers();
  }

  @Get('rails/trending')
  getTrending() {
    return this.catalog.getTrending();
  }

  @Get('suggest')
  suggest(@Query('q') q?: string) {
    return this.catalog.suggest(q ?? '');
  }
}
