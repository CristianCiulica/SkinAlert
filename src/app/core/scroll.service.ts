import { Injectable, NgZone, OnDestroy, inject, signal } from '@angular/core';
import Lenis from 'lenis';
import { gsap, ScrollTrigger } from './gsap';
import { MotionService } from './motion.service';

/**
 * Owns the Lenis smooth-scroll instance and keeps GSAP ScrollTrigger
 * in sync with it. Everything runs outside the Angular zone so the
 * per-frame work never triggers change detection.
 */
@Injectable({ providedIn: 'root' })
export class ScrollService implements OnDestroy {
  private readonly zone = inject(NgZone);
  private readonly motion = inject(MotionService);

  private lenis: Lenis | null = null;
  private tickerFn: ((time: number) => void) | null = null;

  /** Current scroll position in px, updated on every Lenis scroll event. */
  readonly scrollY = signal(0);
  /** Scroll direction: 1 down, -1 up. */
  readonly direction = signal<1 | -1>(1);

  init(): void {
    if (this.lenis || this.motion.reducedMotion()) {
      // Reduced motion: native scrolling, but ScrollTrigger still works.
      return;
    }

    this.zone.runOutsideAngular(() => {
      this.lenis = new Lenis({
        duration: 1.15,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        touchMultiplier: 1.5,
      });

      this.lenis.on('scroll', (e: Lenis) => {
        ScrollTrigger.update();
        this.scrollY.set(e.scroll);
        this.direction.set(e.direction >= 0 ? 1 : -1);
      });

      // Drive Lenis from the GSAP ticker so both share one rAF loop.
      this.tickerFn = (time: number) => this.lenis?.raf(time * 1000);
      gsap.ticker.add(this.tickerFn);
      gsap.ticker.lagSmoothing(0);
    });

    // Fallback signal updates for reduced-motion / native scroll.
    window.addEventListener('scroll', this.onNativeScroll, { passive: true });
  }

  private onNativeScroll = (): void => {
    if (!this.lenis) {
      const y = window.scrollY;
      this.direction.set(y >= this.scrollY() ? 1 : -1);
      this.scrollY.set(y);
    }
  };

  scrollTo(target: string | number): void {
    if (this.lenis) {
      this.lenis.scrollTo(target, { offset: -96, duration: 1.4 });
    } else {
      const el = typeof target === 'string' ? document.querySelector(target) : null;
      if (el) {
        el.scrollIntoView({ behavior: 'auto', block: 'start' });
      } else if (typeof target === 'number') {
        window.scrollTo({ top: target });
      }
    }
  }

  ngOnDestroy(): void {
    window.removeEventListener('scroll', this.onNativeScroll);
    if (this.tickerFn) {
      gsap.ticker.remove(this.tickerFn);
    }
    this.lenis?.destroy();
    this.lenis = null;
  }
}
