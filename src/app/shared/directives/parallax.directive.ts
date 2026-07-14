import {
  AfterViewInit,
  Directive,
  ElementRef,
  NgZone,
  OnDestroy,
  inject,
  input,
} from '@angular/core';
import { gsap } from '../../core/gsap';
import { MotionService } from '../../core/motion.service';

/**
 * Scroll-linked parallax: the host drifts vertically while it travels
 * through the viewport, scrubbed by GSAP ScrollTrigger (transform-only,
 * GPU-composited). speed 1 ≈ ±120px total drift; negative reverses.
 *
 * Don't combine with [appReveal] on the same element — both write `y`.
 * Nest instead: <div appParallax><div appReveal>…</div></div>
 */
@Directive({ selector: '[appParallax]' })
export class ParallaxDirective implements AfterViewInit, OnDestroy {
  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly zone = inject(NgZone);
  private readonly motion = inject(MotionService);

  /** Drift intensity; keep between 0.15 and 0.5 for an editorial feel. */
  readonly speed = input(0.3);

  private tween?: gsap.core.Tween;

  ngAfterViewInit(): void {
    if (this.motion.reducedMotion()) {
      return;
    }

    this.zone.runOutsideAngular(() => {
      const drift = 120 * this.speed();
      this.tween = gsap.fromTo(
        this.el.nativeElement,
        { y: drift },
        {
          y: -drift,
          ease: 'none',
          scrollTrigger: {
            trigger: this.el.nativeElement,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
            invalidateOnRefresh: true,
          },
        },
      );
    });
  }

  ngOnDestroy(): void {
    this.tween?.scrollTrigger?.kill();
    this.tween?.kill();
  }
}
