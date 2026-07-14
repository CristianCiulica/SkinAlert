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


@Directive({ selector: '[appMagnetic]' })
export class MagneticDirective implements AfterViewInit, OnDestroy {
  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly zone = inject(NgZone);
  private readonly motion = inject(MotionService);

  readonly strength = input(0.25);

  private xTo?: gsap.QuickToFunc;
  private yTo?: gsap.QuickToFunc;
  private cleanup?: () => void;

  ngAfterViewInit(): void {
    if (this.motion.reducedMotion() || !window.matchMedia('(pointer: fine)').matches) {
      return;
    }

    this.zone.runOutsideAngular(() => {
      const host = this.el.nativeElement;
      this.xTo = gsap.quickTo(host, 'x', { duration: 0.8, ease: 'elastic.out(1, 0.4)' });
      this.yTo = gsap.quickTo(host, 'y', { duration: 0.8, ease: 'elastic.out(1, 0.4)' });

      const onMove = (e: MouseEvent): void => {
        const rect = host.getBoundingClientRect();
        const dx = e.clientX - (rect.left + rect.width / 2);
        const dy = e.clientY - (rect.top + rect.height / 2);
        this.xTo!(dx * this.strength());
        this.yTo!(dy * this.strength());
      };
      const onLeave = (): void => {
        this.xTo!(0);
        this.yTo!(0);
      };

      host.addEventListener('mousemove', onMove);
      host.addEventListener('mouseleave', onLeave);
      this.cleanup = () => {
        host.removeEventListener('mousemove', onMove);
        host.removeEventListener('mouseleave', onLeave);
      };
    });
  }

  ngOnDestroy(): void {
    this.cleanup?.();
  }
}
