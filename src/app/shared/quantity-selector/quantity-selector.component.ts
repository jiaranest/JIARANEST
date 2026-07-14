import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

@Component({
  selector: 'zylo-quantity-selector',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="qty" [class.sm]="size() === 'sm'">
      <button
        type="button"
        aria-label="Decrease quantity"
        [disabled]="value() <= min()"
        (click)="dec($event)"
      >
        <span class="material-icons">remove</span>
      </button>
      <span class="num" aria-live="polite">{{ value() }}</span>
      <button
        type="button"
        aria-label="Increase quantity"
        [disabled]="value() >= max()"
        (click)="inc($event)"
      >
        <span class="material-icons">add</span>
      </button>
    </div>
  `,
  styles: [
    `
      .qty {
        display: inline-flex;
        align-items: center;
        border: 1px solid var(--zylo-line);
        border-radius: 999px;
        overflow: hidden;
        background: #fff;
      }
      button {
        border: 0;
        background: transparent;
        width: 36px;
        height: 36px;
        display: grid;
        place-items: center;
        cursor: pointer;
        color: var(--zylo-ink);
        transition: background 0.15s var(--zylo-ease);
      }
      button:hover:not(:disabled) {
        background: var(--zylo-brand-tint);
        color: var(--zylo-brand);
      }
      button:disabled {
        color: var(--zylo-ink-3);
        cursor: not-allowed;
      }
      .material-icons {
        font-size: 18px;
      }
      .num {
        min-width: 34px;
        text-align: center;
        font-weight: 700;
        font-size: 14px;
      }
      .sm button {
        width: 30px;
        height: 30px;
      }
      .sm .material-icons {
        font-size: 16px;
      }
      .sm .num {
        min-width: 28px;
        font-size: 13px;
      }
    `,
  ],
})
export class QuantitySelectorComponent {
  readonly value = input.required<number>();
  readonly min = input<number>(1);
  readonly max = input<number>(99);
  readonly size = input<'sm' | 'md'>('md');
  readonly valueChange = output<number>();

  inc(e: Event): void {
    e.stopPropagation();
    if (this.value() < this.max()) this.valueChange.emit(this.value() + 1);
  }

  dec(e: Event): void {
    e.stopPropagation();
    if (this.value() > this.min()) this.valueChange.emit(this.value() - 1);
  }
}
