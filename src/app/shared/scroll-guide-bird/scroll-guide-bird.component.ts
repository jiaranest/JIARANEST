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

    // Mobile/tablet: always keep the bird perched on the header wordmark with
    // its fly-across animation; never travel down to section titles.
    if (this.headerOnly()) {
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

    const r = this.titles[bestIndex].getBoundingClientRect();
    const birdW = bird.offsetWidth || 30;
    const birdH = bird.offsetHeight || 24;
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

  // Park the bird over the header wordmark and let its own header animation run
  // (fly across "JIARANEST"). The bird position tracks the wordmark's box so it
  // stays correct if the header layout shifts.
  private moveToHeader(bird: HTMLElement): void {
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
