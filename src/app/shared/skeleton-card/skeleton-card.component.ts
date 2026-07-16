import { ChangeDetectionStrategy, Component } from '@angular/core';

/**
 * A shimmer placeholder shaped like a product-card (1:1 media, brand line, two
 * name lines, price line, button) — shown while catalog data is loading. Uses
 * the global `.jiara-sk*` shimmer classes from styles.scss.
 */
@Component({
  selector: 'jiara-skeleton-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="sk-card" aria-hidden="true">
      <div class="jiara-sk sk-media"></div>
      <div class="sk-body">
        <div class="jiara-sk jiara-sk--line jiara-sk-w40"></div>
        <div class="jiara-sk jiara-sk--line jiara-sk-w90"></div>
        <div class="jiara-sk jiara-sk--line jiara-sk-w60"></div>
        <div class="jiara-sk jiara-sk--line sk-price jiara-sk-w50"></div>
        <div class="jiara-sk sk-btn"></div>
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        height: 100%;
      }
      .sk-card {
        display: flex;
        flex-direction: column;
        height: 100%;
        background: var(--jiara-surface);
        border: 1px solid var(--jiara-line);
        border-radius: var(--jiara-radius);
        overflow: hidden;
      }
      .sk-media {
        width: 100%;
        aspect-ratio: 1 / 1;
        border-radius: 0;
      }
      .sk-body {
        display: flex;
        flex-direction: column;
        gap: 10px;
        padding: 12px;
        flex: 1;
      }
      .sk-price {
        height: 16px;
        margin-top: 2px;
      }
      .sk-btn {
        height: 36px;
        border-radius: var(--jiara-radius-sm);
        margin-top: auto;
      }
    `,
  ],
})
export class SkeletonCardComponent {}
