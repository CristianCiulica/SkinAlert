import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  NgZone,
  OnDestroy,
  inject,
  viewChild,
} from '@angular/core';
import { gsap } from '../../../core/gsap';
import { MotionService } from '../../../core/motion.service';
import { ScrollService } from '../../../core/scroll.service';
import { RevealDirective } from '../../../shared/directives/reveal.directive';
import { RippleDirective } from '../../../shared/directives/ripple.directive';
import { HeroSceneComponent } from './hero-scene.component';

@Component({
  selector: 'app-hero',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RevealDirective, RippleDirective, HeroSceneComponent],
  template: `
    <section #wrap id="top" class="relative flex min-h-svh flex-col items-center justify-center overflow-hidden bg-mesh pt-16">
      <!-- Neural orb: translucent glass sphere behind the headline -->
      <app-hero-scene aria-hidden="true" class="pointer-events-none opacity-80" />

      <div #content class="relative z-10 mx-auto flex w-full max-w-5xl flex-col items-center px-6 text-center">
        <h1 class="text-balance text-5xl font-semibold leading-[1.05] tracking-tight text-ink sm:text-7xl lg:text-[5.5rem]">
          <span appReveal mode="words" [stagger]="0.07" class="block">Descoperă ce îți</span>
          <span appReveal mode="blur" [delay]="0.45" class="block text-gradient">spune pielea.</span>
        </h1>

        <p appReveal mode="fade" [delay]="0.7" class="mt-8 max-w-xl text-lg leading-relaxed text-ink/60 sm:text-xl">
          Fotografiază o aluniță și primește în câteva secunde o estimare a riscului,
          explicată vizual — mereu cu îndrumare către un medic dermatolog.
        </p>

        <div appReveal mode="fade" [delay]="0.9" class="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <a href="#analyzer" (click)="go($event, '#analyzer')" appRipple class="btn-accent px-9 py-4 text-base">
            Analizează Acum
          </a>
          <a href="#how-it-works" (click)="go($event, '#how-it-works')" appRipple class="btn-ghost px-8 py-4 text-base">
            Cum funcționează
          </a>
        </div>
      </div>

      <!-- Scroll hint -->
      <div #hint aria-hidden="true" class="absolute bottom-8 left-1/2 z-10 hidden -translate-x-1/2 flex-col items-center gap-3 [@media(min-height:700px)]:flex">
        <span class="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-ink/40">Derulează</span>
        <span class="scroll-hint block h-8 w-px bg-ink/30"></span>
      </div>
    </section>
  `,
})
export class HeroComponent implements AfterViewInit, OnDestroy {
  private readonly scroll = inject(ScrollService);
  private readonly zone = inject(NgZone);
  private readonly motion = inject(MotionService);

  private readonly wrap = viewChild.required<ElementRef<HTMLElement>>('wrap');
  private readonly content = viewChild.required<ElementRef<HTMLElement>>('content');
  private readonly hint = viewChild.required<ElementRef<HTMLElement>>('hint');

  private timeline?: gsap.core.Timeline;

  ngAfterViewInit(): void {
    if (this.motion.reducedMotion()) {
      return;
    }

    // Exit parallax: while the hero scrolls out, the copy drifts down
    // slower than the page and softens — the orb appears to overtake it.
    this.zone.runOutsideAngular(() => {
      this.timeline = gsap
        .timeline({
          scrollTrigger: {
            trigger: this.wrap().nativeElement,
            start: 'top top',
            end: 'bottom top',
            scrub: true,
          },
        })
        .to(this.content().nativeElement, { yPercent: 22, autoAlpha: 0.2, ease: 'none' }, 0)
        .to(this.hint().nativeElement, { autoAlpha: 0, ease: 'none', duration: 0.25 }, 0);
    });
  }

  ngOnDestroy(): void {
    this.timeline?.scrollTrigger?.kill();
    this.timeline?.kill();
  }

  go(event: Event, anchor: string): void {
    event.preventDefault();
    this.scroll.scrollTo(anchor);
  }
}
