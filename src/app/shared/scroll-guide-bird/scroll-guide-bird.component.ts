import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  NgZone,
  OnDestroy,
  inject,
  viewChild,
} from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

/**
 * A sparrow that "guides" the reader down the page: it starts in the header's
 * top-right corner and, as the user scrolls, flies to sit beside whichever
 * section title (`[data-guide-title]`) is currently active — easing smoothly
 * from one heading to the next, and back to the header at the top.
 *
 * Mechanics: a `position: fixed` bird whose `transform: translate(x,y)` is set
 * from measured heading positions on scroll (rAF-throttled, outside Angular);
 * a CSS transition on `transform` does the smooth travel. Desktop only.
 */
@Component({
  selector: 'jiara-scroll-guide-bird',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './scroll-guide-bird.component.html',
  styleUrl: './scroll-guide-bird.component.scss',
})
export class ScrollGuideBirdComponent implements AfterViewInit, OnDestroy {
  private readonly zone = inject(NgZone);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly birdRef = viewChild.required<ElementRef<HTMLElement>>('bird');

  private titles: HTMLElement[] = [];
  private rafId = 0;
  private ticking = false;
  private lastIndex = -2; // -1 = header home; 0..n = a title; -2 = uninitialised
  private enabled = true;
  private readonly onScroll = () => this.requestUpdate();
  private readonly onResize = () => {
    this.collectTitles();
    this.requestUpdate();
  };

  constructor() {
    // Re-scan headings after route changes (subscribed in the constructor so
    // takeUntilDestroyed runs in a valid injection context). Different routes
    // have different sections; the home page holds the 7 guide titles.
    this.router.events
      .pipe(
        filter((e) => e instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => {
        setTimeout(() => {
          this.collectTitles();
          this.requestUpdate();
        }, 60);
      });
  }

  ngAfterViewInit(): void {
    // Respect reduced-motion and skip on small screens (desktop-only feature).
    const reduced =
      typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
      this.enabled = false;
      this.birdRef().nativeElement.style.display = 'none';
      return;
    }

    this.zone.runOutsideAngular(() => {
      this.collectTitles();
      this.requestUpdate();
      window.addEventListener('scroll', this.onScroll, { passive: true });
      window.addEventListener('resize', this.onResize, { passive: true });
    });
  }

  private collectTitles(): void {
    this.titles = Array.from(
      document.querySelectorAll<HTMLElement>('[data-guide-title]'),
    );
  }

  private requestUpdate(): void {
    if (!this.enabled || this.ticking) return;
    this.ticking = true;
    this.rafId = requestAnimationFrame(() => {
      this.ticking = false;
      this.update();
    });
  }

  /** On mobile/tablet the bird stays in the header only — no guide-to-title. */
  private headerOnly(): boolean {
    return typeof matchMedia !== 'undefined' && matchMedia('(max-width: 900px)').matches;
  }

  private update(): void {
    const bird = this.birdRef().nativeElement;

    // Once the footer comes into view, the bird belongs back in the header — it
    // should never sit beside the footer or linger on the last section. This
    // takes priority over every other placement (desktop and mobile alike).
    if (this.footerInView()) {
      this.moveToHeader(bird);
      this.lastIndex = -1;
      return;
    }

    // Mobile/tablet: the bird normally stays perched on the header wordmark and
    // never travels down to section titles. The ONE exception is the nest: when
    // the testimonials nest is comfortably in view, the bird flies down to
    // perch beside the mother (the same delightful moment as on desktop), then
    // returns to the header when you scroll away.
    if (this.headerOnly()) {
      const nest = this.visibleNest();
      if (nest) {
        if (bird.classList.contains('is-in-header')) {
          bird.classList.remove('is-in-header', 'flat');
          bird.style.transform = 'none';
        }
        this.placeAtNest(bird, nest);
        return;
      }
      this.moveToHeader(bird);
      this.lastIndex = -1;
      return;
    }

    // If we're above the first title (near the page top) — or there are no
    // titles on this route — the bird rests IN THE HEADER and plays its own
    // fly-across-the-wordmark animation.
    const refLine = 140; // px from viewport top (clears the sticky header)
    const firstTitleTop = this.titles.length
      ? this.titles[0].getBoundingClientRect().top
      : Infinity;

    if (firstTitleTop - refLine > 0) {
      this.moveToHeader(bird);
      this.lastIndex = -1;
      return;
    }

    // Otherwise (scrolled into the sections) the bird detaches from the header
    // and sits beside the title whose top is NEAREST the reference line — the
    // section you're currently reading. Approaching the next heading, that one
    // becomes nearest and the bird eases across to it.
    if (bird.classList.contains('is-in-header')) {
      bird.classList.remove('is-in-header');
      bird.style.transform = 'none'; // clear the header fly-across transform
    }
    let bestIndex = 0;
    let bestDist = Infinity;
    for (let i = 0; i < this.titles.length; i++) {
      const rect = this.titles[i].getBoundingClientRect();
      const dist = Math.abs(rect.top - refLine);
      if (dist < bestDist) {
        bestDist = dist;
        bestIndex = i;
      }
    }

    const birdW = bird.offsetWidth || 30;
    const birdH = bird.offsetHeight || 24;

    // Special case: if the active section carries a nest landing marker
    // (`[data-guide-nest]`, e.g. the testimonials), the bird flies to PERCH ON
    // THE NEST beside the mother sparrow instead of sitting left of the title.
    const nest = this.nestFor(this.titles[bestIndex]);
    if (nest) {
      this.placeAtNest(bird, nest);
      this.lastIndex = bestIndex;
      return;
    }
    bird.classList.remove('at-nest');

    const r = this.titles[bestIndex].getBoundingClientRect();
    // Sit just LEFT of the heading, vertically centred on it. Clamp Y so the
    // bird never drifts off-screen even mid-transition on very tall sections.
    const x = Math.max(4, r.left - birdW - 8);
    const y = Math.min(
      window.innerHeight - birdH - 8,
      Math.max(refLine - birdH, r.top + r.height / 2 - birdH / 2),
    );
    this.place(bird, x, y);
    this.lastIndex = bestIndex;
  }

  /**
   * If the section owning `title` contains a `[data-guide-nest]` marker, return
   * it — that's the perch the bird should fly to (beside the mother sparrow).
   * Returns null for ordinary sections (bird sits left of the heading).
   */
  private nestFor(title: HTMLElement | undefined): HTMLElement | null {
    if (!title) return null;
    const section = title.closest('section');
    return section?.querySelector<HTMLElement>('[data-guide-nest]') ?? null;
  }

  /**
   * Position the bird on the nest marker, beside the mother sparrow. The bird
   * faces right there (its default facing) toward the mother; the `at-nest`
   * class swaps its flight animation for a calm settle-bob (see .scss).
   */
  private placeAtNest(bird: HTMLElement, nest: HTMLElement): void {
    const nr = nest.getBoundingClientRect();
    const birdW = bird.offsetWidth || 30;
    const birdH = bird.offsetHeight || 24;
    const nx = Math.max(4, Math.min(window.innerWidth - birdW - 4, nr.left - birdW / 2));
    const ny = Math.min(
      window.innerHeight - birdH - 8,
      Math.max(8, nr.top - birdH / 2),
    );
    bird.classList.add('at-nest');
    this.place(bird, nx, ny);
  }

  /**
   * The nest marker on the current route, but only once it's comfortably within
   * the viewport (used on mobile to decide when the bird should fly down to it
   * and when it should return to the header). A generous band avoids flicker.
   */
  /**
   * True once the page footer has scrolled up into the viewport — the cue to
   * send the bird home to the header rather than leaving it on the last
   * section. A small top margin means it triggers as the footer starts to
   * appear, not only when fully visible.
   */
  private footerInView(): boolean {
    const footer = document.querySelector<HTMLElement>('footer.footer');
    if (!footer) return false;
    const r = footer.getBoundingClientRect();
    // Trigger only once the footer has risen into the upper-middle of the
    // viewport — by then the last content section (and the nest) has clearly
    // scrolled away, so the bird isn't yanked off the nest prematurely on short
    // pages where the footer peeks in while the testimonials are still centred.
    return r.top < window.innerHeight * 0.5;
  }

  private visibleNest(): HTMLElement | null {
    const nest = document.querySelector<HTMLElement>('[data-guide-nest]');
    if (!nest) return null;
    const r = nest.getBoundingClientRect();
    const vh = window.innerHeight;
    // The marker is a 1px point, so test the point itself: is it within the
    // viewport's middle band (clear of the sticky header, above the fold)? A
    // generous band keeps the bird settled while the section is on-screen and
    // avoids flicker at the edges.
    const y = r.top + r.height / 2;
    return y > 90 && y < vh * 0.92 ? nest : null;
  }

  // Park the bird over the header wordmark and let its own header animation run
  // (fly across "JIARANEST"). The bird position tracks the wordmark's box so it
  // stays correct if the header layout shifts.
  private moveToHeader(bird: HTMLElement): void {
    bird.classList.remove('at-nest'); // not at the nest when parked in the header
    const home = document.querySelector<HTMLElement>('[data-bird-home]');
    if (home) {
      const r = home.getBoundingClientRect();
      const birdH = bird.offsetHeight || 24;
      const x = r.left;
      // Perch just above the letters. On mobile the fly-across runs at a FIXED
      // height (no vertical bob — the bird only glides left↔right), so this
      // height stays constant and the text stays clear.
      const y = this.headerOnly() ? r.top - birdH + 2 : r.top - birdH + 12;
      bird.style.setProperty('--home-w', `${Math.round(r.width)}px`);
      this.place(bird, x, y);
      bird.classList.add('is-in-header');
      // Mobile: flatten the animation to horizontal-only (no translateY dip).
      bird.classList.toggle('flat', this.headerOnly());
    } else {
      // Fallback: top-right corner if the wordmark isn't found.
      bird.classList.remove('is-in-header');
      this.place(bird, window.innerWidth - (bird.offsetWidth || 30) - 24, 46);
    }
  }

  private place(bird: HTMLElement, x: number, y: number): void {
    bird.style.left = `${Math.round(x)}px`;
    bird.style.top = `${Math.round(y)}px`;
  }

  ngOnDestroy(): void {
    window.removeEventListener('scroll', this.onScroll);
    window.removeEventListener('resize', this.onResize);
    if (this.rafId) cancelAnimationFrame(this.rafId);
  }
}
