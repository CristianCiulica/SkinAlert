import { Directive, ElementRef, HostListener, inject } from '@angular/core';
import { MotionService } from '../../core/motion.service';

/** Material-style soft ripple emitted from the click point. */
@Directive({ selector: '[appRipple]' })
export class RippleDirective {
  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly motion = inject(MotionService);

  @HostListener('click', ['$event'])
  onClick(e: MouseEvent): void {
    if (this.motion.reducedMotion()) {
      return;
    }
    const host = this.el.nativeElement;
    const rect = host.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);

    const ripple = document.createElement('span');
    ripple.className = 'ripple';
    ripple.style.width = ripple.style.height = `${size}px`;
    ripple.style.left = `${e.clientX - rect.left - size / 2}px`;
    ripple.style.top = `${e.clientY - rect.top - size / 2}px`;

    host.appendChild(ripple);
    ripple.addEventListener('animationend', () => ripple.remove(), { once: true });
  }
}
