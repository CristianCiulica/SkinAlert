import { Directive, ElementRef, NgZone, OnDestroy, OnInit, inject, input } from '@angular/core';
import { gsap } from '../../core/gsap';
import { MotionService } from '../../core/motion.service';

/**
 * Subtle 3D tilt + inner parallax on pointer move, GPU-composited via GSAP.
 * Elements inside the host marked with [data-tilt-layer] get extra depth.
 */
@Directive({ selector: '[appTilt]' })
export class TiltDirective implements OnInit, OnDestroy {
  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly zone = inject(NgZone);
  private readonly motion = inject(MotionService);

  /** Max rotation in degrees. */
  readonly strength = input(6);

  private setRx?: (v: number) => void;
  private setRy?: (v: number) => void;

  ngOnInit(): void {
    if (this.motion.reducedMotion() || window.matchMedia('(hover: none)').matches) {
      return;
    }

    const host = this.el.nativeElement;
    host.style.transformStyle = 'preserve-3d';
    host.style.perspective = '800px';

    this.zone.runOutsideAngular(() => {
      this.setRx = gsap.quickTo(host, 'rotationX', { duration: 0.6, ease: 'power3.out' });
      this.setRy = gsap.quickTo(host, 'rotationY', { duration: 0.6, ease: 'power3.out' });

      host.addEventListener('pointermove', this.onMove, { passive: true });
      host.addEventListener('pointerleave', this.onLeave, { passive: true });
    });
  }

  private onMove = (e: PointerEvent): void => {
    const rect = this.el.nativeElement.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    const s = this.strength();
    this.setRx?.(-py * s);
    this.setRy?.(px * s);
  };

  private onLeave = (): void => {
    this.setRx?.(0);
    this.setRy?.(0);
  };

  ngOnDestroy(): void {
    const host = this.el.nativeElement;
    host.removeEventListener('pointermove', this.onMove);
    host.removeEventListener('pointerleave', this.onLeave);
  }
}
