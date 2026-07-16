import { ChangeDetectionStrategy, Component, ElementRef, computed, inject, input, viewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Product } from '../../core/models/product.model';
import { LoginGateService } from '../../core/state/login-gate.service';
import { ProductCardComponent } from '../product-card/product-card.component';
import { SkeletonCardComponent } from '../skeleton-card/skeleton-card.component';
import { QuickViewComponent } from '../quick-view/quick-view.component';

@Component({
  selector: 'jiara-product-rail',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ProductCardComponent, SkeletonCardComponent],
  template: `
    <div class="rail-wrap">
      <button class="nav prev" type="button" aria-label="Scroll left" (click)="scroll(-1)">
        <span class="material-icons">chevron_left</span>
      </button>
      <div class="rail" #rail>
        @if (loading()) {
          @for (s of placeholders(); track s) {
            <div class="cell"><jiara-skeleton-card /></div>
          }
        } @else {
          @for (p of products(); track p.id) {
            <div class="cell">
              <jiara-product-card
                [product]="p"
                (quickView)="openQuickView($event)"
                (buyNow)="onBuyNow($event)"
              />
            </div>
          }
        }
      </div>
      <button class="nav next" type="button" aria-label="Scroll right" (click)="scroll(1)">
        <span class="material-icons">chevron_right</span>
      </button>
    </div>
  `,
  styleUrl: './product-rail.component.scss',
})
export class ProductRailComponent {
  private readonly dialog = inject(MatDialog);
  private readonly gate = inject(LoginGateService);
  private readonly router = inject(Router);
  private readonly rail = viewChild<ElementRef<HTMLElement>>('rail');

  readonly products = input.required<Product[]>();
  /** When true, show shimmer skeleton cells instead of products. */
  readonly loading = input(false);
  /** How many skeleton cells to show while loading. */
  readonly count = input(6);

  /** Array of the right length to drive the skeleton @for. */
  readonly placeholders = computed(() => Array.from({ length: this.count() }, (_, i) => i));

  scroll(dir: number): void {
    const el = this.rail()?.nativeElement;
    if (el) {
      el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: 'smooth' });
    }
  }

  openQuickView(product: Product): void {
    const ref = this.dialog.open(QuickViewComponent, {
      data: product,
      panelClass: 'jiara-dialog',
      autoFocus: false,
    });
    ref.afterClosed().subscribe((r) => {
      if (r === 'buy') this.goCheckout();
    });
  }

  async onBuyNow(_product: Product): Promise<void> {
    await this.goCheckout();
  }

  private async goCheckout(): Promise<void> {
    if (await this.gate.ensureLoggedIn()) {
      this.router.navigate(['/checkout']);
    }
  }
}
