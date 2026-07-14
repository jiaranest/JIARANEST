import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { combineLatest, switchMap } from 'rxjs';
import { map } from 'rxjs/operators';
import { CatalogService } from '../../core/data/catalog.service';
import { LoginGateService } from '../../core/state/login-gate.service';
import { AGE_GROUPS, AgeGroup, Product } from '../../core/models/product.model';
import { ProductQuery, SortOption } from '../../core/models/filter.model';
import { ProductCardComponent } from '../../shared/product-card/product-card.component';
import { QuickViewComponent } from '../../shared/quick-view/quick-view.component';
import { StarRatingComponent } from '../../shared/star-rating/star-rating.component';
import { inr } from '../../core/util/format';

const SORTS: { value: SortOption; label: string }[] = [
  { value: 'popular', label: 'Popularity' },
  { value: 'latest', label: 'Latest' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
];

@Component({
  selector: 'zylo-listing',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, ProductCardComponent, StarRatingComponent],
  templateUrl: './listing.component.html',
  styleUrl: './listing.component.scss',
})
export class ListingComponent {
  private readonly catalog = inject(CatalogService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);
  private readonly gate = inject(LoginGateService);

  readonly sorts = SORTS;
  readonly view = signal<'grid' | 'list'>('grid');
  readonly filtersOpen = signal(false);
  inr = inr;

  readonly allAgeGroups = AGE_GROUPS;
  readonly genders: { value: 'boys' | 'girls'; label: string }[] = [
    { value: 'boys', label: 'Boys' },
    { value: 'girls', label: 'Girls' },
  ];

  // Local filter state (applied on top of route params).
  readonly sort = signal<SortOption>('popular');
  readonly selectedBrands = signal<Set<string>>(new Set());
  readonly selectedColors = signal<Set<string>>(new Set());
  readonly selectedSizes = signal<Set<string>>(new Set());
  readonly selectedAges = signal<Set<AgeGroup>>(new Set());
  readonly gender = signal<'boys' | 'girls' | null>(null);
  readonly minRating = signal<number>(0);
  readonly inStockOnly = signal(false);
  readonly minDiscount = signal<number>(0);
  readonly maxPrice = signal<number | null>(null);

  // Route context: category slug + search term + age query param as one signal.
  private readonly ctx = toSignal(
    combineLatest([this.route.paramMap, this.route.queryParamMap]).pipe(
      map(([p, q]) => ({
        slug: p.get('slug'),
        search: q.get('q') ?? undefined,
        age: (q.get('age') as AgeGroup | null) ?? undefined,
      })),
    ),
    {
      initialValue: {
        slug: null as string | null,
        search: undefined as string | undefined,
        age: undefined as AgeGroup | undefined,
      },
    },
  );

  private readonly categorySig = toSignal(
    toObservable(computed(() => this.ctx().slug)).pipe(
      switchMap((slug) => this.catalog.getCategory(slug ?? '')),
    ),
    { initialValue: undefined },
  );

  readonly heading = computed(() => {
    const c = this.categorySig();
    if (c) return c.name;
    const s = this.ctx().search;
    if (s) return `Results for "${s}"`;
    const age = this.ctx().age;
    if (age) {
      const label = AGE_GROUPS.find((a) => a.id === age)?.label ?? age;
      return `Shop for ${label}`;
    }
    return 'All Products';
  });

  private readonly baseQuery = computed<ProductQuery>(() => ({
    categoryId: this.categorySig()?.id,
    search: this.ctx().search,
    // Age from the URL scopes the base result set (used by "Shop by Age").
    ageGroups: this.ctx().age ? [this.ctx().age!] : undefined,
  }));

  readonly facets = toSignal(
    toObservable(this.baseQuery).pipe(switchMap((q) => this.catalog.getFacets(q))),
    {
      initialValue: {
        brands: [],
        colors: [],
        sizes: [],
        ageGroups: [],
        priceRange: { min: 0, max: 0 },
      },
    },
  );

  private readonly fullQuery = computed<ProductQuery>(() => {
    // Merge age from the URL with any ages picked in the sidebar.
    const ages = new Set<AgeGroup>(this.selectedAges());
    if (this.ctx().age) ages.add(this.ctx().age!);
    return {
      ...this.baseQuery(),
      sort: this.sort(),
      brands: [...this.selectedBrands()],
      colors: [...this.selectedColors()],
      sizes: [...this.selectedSizes()],
      ageGroups: ages.size ? [...ages] : undefined,
      gender: this.gender() ?? undefined,
      minRating: this.minRating() || undefined,
      inStockOnly: this.inStockOnly() || undefined,
      minDiscount: this.minDiscount() || undefined,
      maxPrice: this.maxPrice() ?? undefined,
      pageSize: 24,
    };
  });

  readonly result = toSignal(
    toObservable(this.fullQuery).pipe(switchMap((q) => this.catalog.queryProducts(q))),
    { initialValue: { items: [] as Product[], total: 0, page: 1, pageSize: 24 } },
  );

  readonly loading = computed(() => this.result().items.length === 0 && this.result().total === 0);

  readonly activeFilterCount = computed(
    () =>
      this.selectedBrands().size +
      this.selectedColors().size +
      this.selectedSizes().size +
      this.selectedAges().size +
      (this.gender() ? 1 : 0) +
      (this.minRating() ? 1 : 0) +
      (this.inStockOnly() ? 1 : 0) +
      (this.minDiscount() ? 1 : 0) +
      (this.maxPrice() != null ? 1 : 0),
  );

  toggle(which: 'brand' | 'color' | 'size', value: string): void {
    const sig =
      which === 'brand'
        ? this.selectedBrands
        : which === 'color'
          ? this.selectedColors
          : this.selectedSizes;
    sig.update((s) => {
      const next = new Set(s);
      if (next.has(value)) next.delete(value);
      else next.add(value);
      return next;
    });
  }

  isSelected(which: 'brand' | 'color' | 'size', value: string): boolean {
    const set =
      which === 'brand'
        ? this.selectedBrands()
        : which === 'color'
          ? this.selectedColors()
          : this.selectedSizes();
    return set.has(value);
  }

  toggleAge(age: AgeGroup): void {
    this.selectedAges.update((s) => {
      const next = new Set(s);
      if (next.has(age)) next.delete(age);
      else next.add(age);
      return next;
    });
  }

  isAgeSelected(age: AgeGroup): boolean {
    return this.selectedAges().has(age);
  }

  setGender(g: 'boys' | 'girls'): void {
    this.gender.set(this.gender() === g ? null : g);
  }

  setSort(value: string): void {
    this.sort.set(value as SortOption);
  }

  clearFilters(): void {
    this.selectedBrands.set(new Set());
    this.selectedColors.set(new Set());
    this.selectedSizes.set(new Set());
    this.selectedAges.set(new Set());
    this.gender.set(null);
    this.minRating.set(0);
    this.inStockOnly.set(false);
    this.minDiscount.set(0);
    this.maxPrice.set(null);
  }

  openQuickView(product: Product): void {
    const ref = this.dialog.open(QuickViewComponent, {
      data: product,
      panelClass: 'zylo-dialog',
      autoFocus: false,
    });
    ref.afterClosed().subscribe((r) => {
      if (r === 'buy') this.goCheckout();
    });
  }

  async onBuyNow(): Promise<void> {
    await this.goCheckout();
  }

  private async goCheckout(): Promise<void> {
    if (await this.gate.ensureLoggedIn()) {
      this.router.navigate(['/checkout']);
    }
  }
}
