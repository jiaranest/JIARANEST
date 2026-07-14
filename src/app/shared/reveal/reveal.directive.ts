import {
  AfterViewInit,
  Directive,
  ElementRef,
  Input,
  NgZone,
  OnDestroy,
  inject,
} from '@angular/core';

/**
 * `jiaraReveal` — Jiaranest's signature scroll-reveal.
 *
 * When the element scrolls into view it plays a soft "settle onto the shelf"
 * motion: rise + un-blur + a gentle over-shoot scale. Applied to a container
 * with `[jiaraReveal]="'stagger'"`, its direct children cascade in one-by-one.
 *
 * Motion lives in global CSS (the `.reveal*` classes in styles.scss); this
 * directive only toggles `is-in` via IntersectionObserver + sets child delays.
 * Honours `prefers-reduced-motion` by revealing instantly.
 */
@Directive({
  selector: '[jiaraReveal]',
  standalone: true,
})
export class RevealDirective implements AfterViewInit, OnDestroy {
  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly zone = inject(NgZone);
  private observer?: IntersectionObserver;
  private mutation?: MutationObserver;

  /** '' | 'stagger' — stagger cascades direct children. */
  @Input('jiaraReveal') mode: '' | 'stagger' = '';
  /** Optional per-child stagger step in ms (stagger mode). */
  @Input() revealStep = 80;
  /** Optional delay before the whole element reveals, ms. */
  @Input() revealDelay = 0;
  /** Re-arm each time it enters (default: reveal once). */
  @Input() revealRepeat = false;

  ngAfterViewInit(): void {
    const el = this.host.nativeElement;

    const reduced =
      typeof matchMedia !== 'undefined' &&
      matchMedia('(prefers-reduced-motion: reduce)').matches;

    el.classList.add('reveal');
    if (this.mode === 'stagger') {
      el.classList.add('reveal-stagger');
      this.indexChildren();
      // Children can arrive after view init (async lists). Re-index when the
      // child list changes so the cascade delays stay correct.
      this.zone.runOutsideAngular(() => {
        this.mutation = new MutationObserver(() => this.indexChildren());
        this.mutation.observe(el, { childList: true });
      });
    }
    if (this.revealDelay) {
      el.style.setProperty('--reveal-delay', `${this.revealDelay}ms`);
    }

    // No IO support or reduced motion → show immediately, no animation.
    if (reduced || typeof IntersectionObserver === 'undefined') {
      el.classList.add('is-in');
      return;
    }

    // Run the observer outside Angular; toggling a class needs no CD.
    this.zone.runOutsideAngular(() => {
      this.observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) {
              (entry.target as HTMLElement).classList.add('is-in');
              if (!this.revealRepeat) this.observer?.unobserve(entry.target);
            } else if (this.revealRepeat) {
              (entry.target as HTMLElement).classList.remove('is-in');
            }
          }
        },
        // Trigger a touch before fully in view so it feels responsive,
        // and only once ~12% is showing so it doesn't fire off-screen.
        { threshold: 0.12, rootMargin: '0px 0px -8% 0px' },
      );
      this.observer.observe(el);
    });
  }

  private indexChildren(): void {
    const children = Array.from(this.host.nativeElement.children) as HTMLElement[];
    children.forEach((c, i) => {
      c.style.setProperty('--reveal-i', String(i));
      c.style.setProperty('--reveal-step', `${this.revealStep}ms`);
    });
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
    this.mutation?.disconnect();
  }
}
