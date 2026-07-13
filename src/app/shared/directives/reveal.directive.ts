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
import { splitWords } from '../split-text';

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
        targets = splitWords(host, 'reveal-word');
        if (mode === 'letters') {
          targets = targets.flatMap((word) => this.explode(word as HTMLElement));
        }
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

  /** Splits a word span into per-letter spans (letters mode only). */
  private explode(word: HTMLElement): Element[] {
    const letters = [...(word.textContent ?? '')];
    word.textContent = '';
    return letters.map((letter) => {
      const span = document.createElement('span');
      span.className = 'reveal-word';
      span.textContent = letter;
      word.appendChild(span);
      return span;
    });
  }

  ngOnDestroy(): void {
    this.trigger?.kill();
  }
}
