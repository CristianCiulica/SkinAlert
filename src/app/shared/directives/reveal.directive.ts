import {
  AfterViewInit,
  Directive,
  ElementRef,
  NgZone,
  OnDestroy,
  inject,
  input,
} from '@angular/core';
import { gsap, ScrollTrigger } from '../../core/gsap';
import { MotionService } from '../../core/motion.service';

export type RevealMode = 'fade' | 'blur' | 'words' | 'letters' | 'scale';

/**
 * Scroll-linked entrance animation.
 *
 * Usage:
 *   <h2 appReveal>fades + rises</h2>
 *   <h1 appReveal mode="words" [stagger]="0.06">word-by-word blur reveal</h1>
 */
@Directive({ selector: '[appReveal]' })
export class RevealDirective implements AfterViewInit, OnDestroy {
  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly zone = inject(NgZone);
  private readonly motion = inject(MotionService);

  readonly mode = input<RevealMode>('blur');
  readonly delay = input(0);
  readonly stagger = input(0.05);
  readonly startAt = input('top 85%');

  private trigger?: ScrollTrigger;

  ngAfterViewInit(): void {
    if (this.motion.reducedMotion()) {
      return;
    }

    this.zone.runOutsideAngular(() => {
      const host = this.el.nativeElement;
      const mode = this.mode();

      let targets: Element[] | HTMLElement = host;
      if (mode === 'words' || mode === 'letters') {
        targets = this.split(host, mode === 'words' ? 'word' : 'letter');
      }

      const from: gsap.TweenVars = {
        opacity: 0,
        y: mode === 'scale' ? 0 : 32,
        scale: mode === 'scale' ? 0.92 : 1,
        filter: mode === 'fade' ? 'none' : 'blur(12px)',
      };

      const tween = gsap.from(targets, {
        ...from,
        duration: 1.1,
        ease: 'power3.out',
        delay: this.delay(),
        stagger: Array.isArray(targets) ? this.stagger() : 0,
        clearProps: 'filter',
        paused: true,
      });

      this.trigger = ScrollTrigger.create({
        trigger: host,
        start: this.startAt(),
        once: true,
        onEnter: () => tween.play(),
      });
    });
  }

  /** Splits text nodes into spans; keeps element children intact. */
  private split(host: HTMLElement, unit: 'word' | 'letter'): Element[] {
    const text = host.textContent ?? '';
    const parts = unit === 'word' ? text.split(/\s+/).filter(Boolean) : [...text.trim()];
    host.setAttribute('aria-label', text.trim());
    host.textContent = '';
    return parts.map((part, i) => {
      const span = document.createElement('span');
      span.className = 'reveal-word';
      span.setAttribute('aria-hidden', 'true');
      span.textContent = part === ' ' ? ' ' : part;
      host.appendChild(span);
      if (unit === 'word' && i < parts.length - 1) {
        host.appendChild(document.createTextNode(' '));
      }
      return span;
    });
  }

  ngOnDestroy(): void {
    this.trigger?.kill();
  }
}
