import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'zylo-star-rating',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span class="stars" [attr.aria-label]="value() + ' out of 5 stars'" role="img">
      @for (star of stars; track star) {
        <span class="star" [class.filled]="value() >= star" [class.half]="isHalf(star)">
          <span class="material-icons">{{ icon(star) }}</span>
        </span>
      }
      @if (showValue()) {
        <span class="val">{{ value().toFixed(1) }}</span>
      }
      @if (count() != null) {
        <span class="count">({{ count()!.toLocaleString('en-IN') }})</span>
      }
    </span>
  `,
  styles: [
    `
      .stars {
        display: inline-flex;
        align-items: center;
        gap: 1px;
        line-height: 1;
      }
      .star .material-icons {
        font-size: var(--size, 16px);
        color: #d7dbe0;
      }
      .star.filled .material-icons,
      .star.half .material-icons {
        color: var(--zylo-accent);
      }
      .val {
        margin-left: 6px;
        font-weight: 700;
        font-size: 12px;
        color: var(--zylo-ink);
      }
      .count {
        margin-left: 4px;
        font-size: 12px;
        color: var(--zylo-ink-3);
      }
    `,
  ],
})
export class StarRatingComponent {
  readonly value = input.required<number>();
  readonly count = input<number | null>(null);
  readonly showValue = input<boolean>(false);
  readonly stars = [1, 2, 3, 4, 5];

  isHalf(star: number): boolean {
    return this.value() >= star - 0.5 && this.value() < star;
  }

  icon(star: number): string {
    if (this.value() >= star) return 'star';
    if (this.isHalf(star)) return 'star_half';
    return 'star_border';
  }
}
