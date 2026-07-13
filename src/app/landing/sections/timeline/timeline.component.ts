import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  NgZone,
  OnDestroy,
  inject,
  viewChild,
  viewChildren,
} from '@angular/core';
import { gsap } from '../../../core/gsap';
import { MotionService } from '../../../core/motion.service';
import { ParallaxDirective } from '../../../shared/directives/parallax.directive';
import { RevealDirective } from '../../../shared/directives/reveal.directive';
import { SafeHtmlPipe } from '../../../shared/pipes/safe-html.pipe';

interface TimelineStep {
  index: string;
  title: string;
  description: string;
  icon: string;
}

/**
 * "How SkinAlert Works" — card-stacking on scroll: each step is a sticky
 * card; as the next one scrolls over it, the one underneath shrinks
 * slightly (top edges stay visible in steps). Scale is scrubbed by a
 * single ScrollTrigger timeline over the container — the exact intervals
 * of the portfolio's useTransform(progress, [i/n, 1], [1, target]).
 * No manual scroll listeners, no per-frame re-render.
 */
@Component({
  selector: 'app-timeline',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ParallaxDirective, RevealDirective, SafeHtmlPipe],
  template: `
    <section id="how-it-works" class="section bg-base" aria-labelledby="how-heading">
      <div class="mx-auto max-w-7xl px-6">
        <div class="max-w-2xl" appParallax [speed]="0.15">
          <p appReveal mode="fade" class="section-label">02 — Cum funcționează</p>
          <h2 id="how-heading" appReveal mode="words" [stagger]="0.05" class="mt-6 text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
            De la fotografie la rezultat în cinci pași.
          </h2>
          <p appReveal mode="fade" [delay]="0.2" class="mt-6 max-w-md text-lg leading-relaxed text-ink/60">
            Un flux simplu, criptat de la un capăt la altul, care se termină
            întotdeauna cu o recomandare clară.
          </p>
        </div>
      </div>

      <div #stack class="mx-auto mt-10 max-w-4xl px-6">
        <ol>
          @for (step of steps; track step.index; let i = $index) {
            <li class="stack-wrap sticky flex h-[70vh] items-start" [style.--i]="i">
              <div
                #card
                class="w-full min-h-[320px] md:min-h-[420px] flex flex-col justify-between rounded-[40px] border border-ink/5 bg-white/70 p-8 shadow-[0_24px_48px_-12px_rgba(0,0,0,0.05)] backdrop-blur-3xl sm:p-12 md:rounded-[54px] md:p-16 transition-colors"
                style="transform-origin: top center"
              >
                <div class="flex items-center justify-between">
                  <span class="text-base md:text-lg font-semibold tabular-nums text-ink/40" aria-hidden="true">{{ step.index }}</span>
                  <span class="grid size-12 shrink-0 place-items-center rounded-full bg-sage text-accent [&>svg]:size-6" [innerHTML]="step.icon | safeHtml" aria-hidden="true"></span>
                </div>
                <div>
                  <h3 class="mt-10 text-3xl font-semibold tracking-tight text-ink sm:text-4xl md:text-5xl">
                    {{ step.title }}
                  </h3>
                  <p class="mt-4 max-w-xl text-xl leading-relaxed text-ink/60 md:text-2xl">
                    {{ step.description }}
                  </p>
                </div>
              </div>
            </li>
          }
        </ol>
      </div>
    </section>
  `,
  styles: `
    .stack-wrap {
      top: calc(80px + var(--i) * 16px);
    }
    @media (min-width: 768px) {
      .stack-wrap {
        top: calc(100px + var(--i) * 24px);
      }
    }
  `,
})
export class TimelineComponent implements AfterViewInit, OnDestroy {
  private readonly zone = inject(NgZone);
  private readonly motion = inject(MotionService);

  private readonly stack = viewChild.required<ElementRef<HTMLElement>>('stack');
  private readonly cards = viewChildren<ElementRef<HTMLElement>>('card');

  private timeline?: gsap.core.Timeline;

  readonly steps: TimelineStep[] = [
    {
      index: '01',
      title: 'Fotografiază leziunea',
      description: 'Folosește camera telefonului într-o lumină bună. Ghidul de captură te ajută să obții o imagine utilă clinic.',
      icon: `<svg viewBox="0 0 24 24" class="size-4.5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 8h2l2-3h8l2 3h2a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z"/><circle cx="12" cy="13" r="3.5"/></svg>`,
    },
    {
      index: '02',
      title: 'Încarcă imaginea',
      description: 'Fotografia este criptată și procesată privat, cu verificare instantă a calității. Nu ai nevoie de cont.',
      icon: `<svg viewBox="0 0 24 24" class="size-4.5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 16V4m0 0 4 4m-4-4-4 4"/><path d="M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3"/></svg>`,
    },
    {
      index: '03',
      title: 'Analiza AI',
      description: 'O rețea neurală antrenată pe seturi de date clinice examinează forma, culoarea și textura în câteva secunde.',
      icon: `<svg viewBox="0 0 24 24" class="size-4.5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="6" width="12" height="12" rx="2"/><path d="M9 2v4M15 2v4M9 18v4M15 18v4M2 9h4M2 15h4M18 9h4M18 15h4"/></svg>`,
    },
    {
      index: '04',
      title: 'Rezultat explicabil',
      description: 'Primești o estimare calibrată a riscului, cu harta termică a regiunilor care au influențat scorul.',
      icon: `<svg viewBox="0 0 24 24" class="size-4.5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 20h18"/><path d="M5 20v-6l4-4 4 3 6-7v14"/></svg>`,
    },
    {
      index: '05',
      title: 'Recomandare medicală',
      description: 'Dacă ceva pare suspect, SkinAlert te îndrumă către un dermatolog — cu istoricul fotografic pregătit.',
      icon: `<svg viewBox="0 0 24 24" class="size-4.5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s-7-4.5-9-9a5 5 0 0 1 9-3 5 5 0 0 1 9 3c-2 4.5-9 9-9 9z"/><path d="M7 12h3l1.5-2.5L14 14l1.5-2H17"/></svg>`,
    },
  ];

  ngAfterViewInit(): void {
    if (this.motion.reducedMotion()) {
      return;
    }

    this.zone.runOutsideAngular(() => {
      const cards = this.cards().map((c) => c.nativeElement);
      const total = cards.length;

      // One scrubbed timeline (duration 1 == container progress 0→1);
      // each card shrinks over [i/total, 1], the last one stays at 1.
      this.timeline = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: this.stack().nativeElement,
          start: 'top top',
          end: 'bottom bottom',
          scrub: true,
          invalidateOnRefresh: true,
        },
      });
      this.timeline.duration(1);

      cards.forEach((card, i) => {
        if (i === total - 1) return;

        // Card i starts shrinking when Card i+1 is about to cover it
        const startTime = (i + 0.5) / total; 
        const duration = 1 - startTime;
        
        const depth = total - 1 - i;
        const targetScale = 1 - depth * 0.05; // Stronger scale
        const targetBrightness = 1 - depth * 0.2; // Stronger dimming
        const targetBlur = depth * 3; // Add depth of field blur

        this.timeline!.fromTo(
          card,
          { scale: 1, filter: 'brightness(1) blur(0px)' },
          { 
            scale: targetScale, 
            filter: `brightness(${targetBrightness}) blur(${targetBlur}px)`,
            duration: duration,
            ease: 'none'
          },
          startTime,
        );
      });
    });
  }

  ngOnDestroy(): void {
    this.timeline?.scrollTrigger?.kill();
    this.timeline?.kill();
  }
}
