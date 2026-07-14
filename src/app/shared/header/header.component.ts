import { ChangeDetectionStrategy, Component, ElementRef, HostListener, computed, effect, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { Subject, debounceTime, switchMap } from 'rxjs';
import { CatalogService } from '../../core/data/catalog.service';
import { CartService } from '../../core/state/cart.service';
import { WishlistService } from '../../core/state/wishlist.service';
import { AGE_GROUPS, Category } from '../../core/models/product.model';
import { inr } from '../../core/util/format';

@Component({
  selector: 'jiara-header',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  private readonly catalog = inject(CatalogService);
  private readonly router = inject(Router);
  private readonly host = inject(ElementRef<HTMLElement>);
  readonly cart = inject(CartService);
  readonly wishlist = inject(WishlistService);

  readonly categories = toSignal(this.catalog.getCategories(), { initialValue: [] as Category[] });

  /** Top-level categories (Toys, Clothing) for the nav. */
  readonly topCategories = computed(() => this.categories().filter((c) => !c.parentId));
  readonly ageGroups = AGE_GROUPS;

  /** Subcategories of a given top category, for the hover mega-menu. */
  subCategories(parentId: string): Category[] {
    return this.categories().filter((c) => c.parentId === parentId);
  }

  readonly openMenu = signal<string | null>(null);

  readonly term = signal('');
  readonly searchOpen = signal(false);
  readonly mobileMenuOpen = signal(false);

  private readonly term$ = new Subject<string>();
  readonly suggestions = toSignal(
    this.term$.pipe(
      debounceTime(180),
      switchMap((t) => this.catalog.suggest(t)),
    ),
    { initialValue: [] },
  );

  inr = inr;

  constructor() {
    // Lock body scroll while the search overlay or mobile drawer is open.
    effect(() => {
      const lock = this.searchOpen() || this.mobileMenuOpen();
      if (typeof document !== 'undefined') {
        document.body.style.overflow = lock ? 'hidden' : '';
      }
    });
  }

  openSearch(): void {
    this.searchOpen.set(true);
  }

  closeSearch(): void {
    this.searchOpen.set(false);
  }

  onInput(value: string): void {
    this.term.set(value);
    this.term$.next(value);
  }

  submitSearch(): void {
    const q = this.term().trim();
    if (q) {
      this.closeSearch();
      this.router.navigate(['/search'], { queryParams: { q } });
    }
  }

  pickSuggestion(slug: string): void {
    this.closeSearch();
    this.term.set('');
    this.router.navigate(['/product', slug]);
  }

  toggleMobileMenu(): void {
    this.mobileMenuOpen.update((v) => !v);
  }

  closeMobileMenu(): void {
    this.mobileMenuOpen.set(false);
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.closeSearch();
    this.mobileMenuOpen.set(false);
  }
}
