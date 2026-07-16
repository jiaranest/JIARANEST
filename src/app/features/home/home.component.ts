import { ChangeDetectionStrategy, ChangeDetectorRef, Component, NgZone, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { combineLatest, map } from 'rxjs';
import { CatalogService } from '../../core/data/catalog.service';
import { RecentlyViewedService } from '../../core/state/recently-viewed.service';
import { AGE_GROUPS, Category, Product } from '../../core/models/product.model';
import { avatar, illus } from '../../core/data/illustrations';
import { loadable } from '../../core/util/loadable';
import { ProductRailComponent } from '../../shared/product-rail/product-rail.component';
import { RevealDirective } from '../../shared/reveal/reveal.directive';

interface Slide {
  eyebrow: string;
  title: string;
  subtitle: string;
  cta: string;
  link: string[];
  bg: string;
  accent: string;
}

@Component({
  selector: 'jiara-home',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, ProductRailComponent, RevealDirective],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit, OnDestroy {
  private readonly catalog = inject(CatalogService);
  private readonly recent = inject(RecentlyViewedService);
  /** Products the shopper viewed before (localStorage) — empty for new visitors. */
  readonly recentlyViewed = this.recent.items;

  // Each source is a Loadable so the template can shimmer while pending.
  readonly categoriesL = loadable(this.catalog.getCategories(), [] as Category[]);
  /** Subcategories (the ones with a parent) make the best browsable tiles. */
  readonly browseCategories = computed(() => this.categoriesL().data.filter((c) => c.parentId));
  readonly categoriesLoading = computed(() => this.categoriesL().loading);
  readonly ageGroups = AGE_GROUPS;
  readonly featured = loadable(this.catalog.getFeatured(), []);
  readonly newArrivals = loadable(this.catalog.getNewArrivals(), []);
  readonly bestSellers = loadable(this.catalog.getBestSellers(), []);
  readonly trending = loadable(this.catalog.getTrending(), []);

  // "Deal card" collections — 4 cards, each a 2×2 grid of product illustrations
  // + a "See more" link. Sources are chosen to reliably have ≥4 products so the
  // grids fill: two top categories (Toys/Clothing aggregate all subcategories),
  // educational toys (4), and a cross-catalog "deals" query.
  private readonly COLLECTIONS = [
    { title: 'Toys for every little one', link: ['/category', 'toys'], query: { categoryId: 'c-toys', pageSize: 4 } },
    { title: 'Adorable kids’ clothing', link: ['/category', 'clothing'], query: { categoryId: 'c-clothing', pageSize: 4 } },
    { title: 'Learn & grow — educational', link: ['/category', 'educational-toys'], query: { categoryId: 'c-educational', pageSize: 4 } },
    { title: 'Up to 45% off — top deals', link: ['/search'], queryParams: { discount: 30 }, query: { minDiscount: 30, sort: 'popular' as const, pageSize: 4 } },
  ];
  readonly collections = loadable(
    combineLatest(
      this.COLLECTIONS.map((c) =>
        this.catalog.queryProducts(c.query).pipe(
          map((res) => ({
            title: c.title,
            link: c.link,
            queryParams: (c as { queryParams?: Record<string, unknown> }).queryParams ?? {},
            products: res.items,
          })),
        ),
      ),
    ),
    [] as { title: string; link: string[]; queryParams: Record<string, unknown>; products: Product[] }[],
  );

  readonly slides: Slide[] = [
    {
      eyebrow: 'Big Toy Sale',
      title: 'Playtime, upgraded',
      subtitle: 'Up to 45% off building blocks, soft toys, dolls & more.',
      cta: 'Shop Toys',
      link: ['/category', 'toys'],
      bg: 'linear-gradient(125deg, #808e5c 0%, #6e7b4f 55%, #57623d 100%)',
      accent: illus('teddy', 0),
    },
    {
      eyebrow: 'New Season',
      title: 'Cute little outfits',
      subtitle: 'Fresh kids\' clothing for every occasion — soft, comfy, adorable.',
      cta: 'Shop Clothing',
      link: ['/category', 'clothing'],
      bg: 'linear-gradient(125deg, #b57a1e 0%, #d99a34 60%, #e8b95c 100%)',
      accent: illus('frock', 2),
    },
    {
      eyebrow: 'Festive Ready',
      title: 'Dress up the little stars',
      subtitle: 'Kurtas, lehengas & party frocks for your tiny celebrations.',
      cta: 'Shop Ethnic Wear',
      link: ['/category', 'ethnic-wear'],
      bg: 'linear-gradient(125deg, #57623d 0%, #6e7b4f 45%, #d99a34 135%)',
      accent: illus('lehenga', 3),
    },
  ];

  private readonly cdr = inject(ChangeDetectorRef);
  private readonly zone = inject(NgZone);
  readonly current = signal(0);
  private timer?: ReturnType<typeof setInterval>;

  readonly testimonials = [
    { name: 'Pavithra', text: 'The soft toys are so cuddly and the delivery was quick. My kids adore them!', avatar: avatar('Pavithra', 0), rating: 5 },
    { name: 'Sudhakanna', text: 'Ordered a party frock for my daughter — beautiful stitching and true to size. Loved it.', avatar: avatar('Sudhakanna', 1), rating: 5 },
    { name: 'Aradhya', text: 'Returns were painless and the toys feel genuinely safe and well-made. My go-to kids store.', avatar: avatar('Aradhya', 2), rating: 4 },
  ];

  ngOnInit(): void {
    // Run the autoplay timer outside Angular so it doesn't wake CD every 5s
    // needlessly; the go() call marks the view for check itself.
    this.zone.runOutsideAngular(() => {
      this.timer = setInterval(() => this.zone.run(() => this.next()), 5000);
    });
  }

  ngOnDestroy(): void {
    if (this.timer) clearInterval(this.timer);
  }

  go(i: number): void {
    this.current.set((i + this.slides.length) % this.slides.length);
    // Belt-and-suspenders for OnPush + zoneless: ensure the view repaints even
    // if the change came from a source CD didn't automatically observe.
    this.cdr.markForCheck();
  }
  next(): void {
    this.go(this.current() + 1);
  }
  prev(): void {
    this.go(this.current() - 1);
  }
}
