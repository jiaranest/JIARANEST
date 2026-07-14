import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { CatalogService } from '../../core/data/catalog.service';
import { AGE_GROUPS, Category } from '../../core/models/product.model';
import { avatar, illus } from '../../core/data/illustrations';
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
  selector: 'zylo-home',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, ProductRailComponent, RevealDirective],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit, OnDestroy {
  private readonly catalog = inject(CatalogService);

  readonly categories = toSignal(this.catalog.getCategories(), { initialValue: [] as Category[] });
  /** Subcategories (the ones with a parent) make the best browsable tiles. */
  readonly browseCategories = computed(() => this.categories().filter((c) => c.parentId));
  readonly ageGroups = AGE_GROUPS;
  readonly featured = toSignal(this.catalog.getFeatured(), { initialValue: [] });
  readonly newArrivals = toSignal(this.catalog.getNewArrivals(), { initialValue: [] });
  readonly bestSellers = toSignal(this.catalog.getBestSellers(), { initialValue: [] });
  readonly trending = toSignal(this.catalog.getTrending(), { initialValue: [] });

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

  readonly current = signal(0);
  private timer?: ReturnType<typeof setInterval>;

  readonly testimonials = [
    { name: 'Pavithra', text: 'The soft toys are so cuddly and the delivery was quick. My kids adore them!', avatar: avatar('Pavithra', 0), rating: 5 },
    { name: 'Sudhakanna', text: 'Ordered a party frock for my daughter — beautiful stitching and true to size. Loved it.', avatar: avatar('Sudhakanna', 1), rating: 5 },
    { name: 'Aradhya', text: 'Returns were painless and the toys feel genuinely safe and well-made. My go-to kids store.', avatar: avatar('Aradhya', 2), rating: 4 },
  ];

  ngOnInit(): void {
    this.timer = setInterval(() => this.next(), 5000);
  }

  ngOnDestroy(): void {
    if (this.timer) clearInterval(this.timer);
  }

  go(i: number): void {
    this.current.set((i + this.slides.length) % this.slides.length);
  }
  next(): void {
    this.go(this.current() + 1);
  }
  prev(): void {
    this.go(this.current() - 1);
  }
}
