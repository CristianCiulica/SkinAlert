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
import { RevealDirective } from '../../../shared/directives/reveal.directive';

interface TimelineStep {
  index: string;
  title: string;
  description: string;
}

/**
 * "02 — Cum Funcționează" — card-stacking on scroll, kept as it works:
 * each step is a sticky card; as the next one scrolls over it, the one
 * underneath shrinks, dims and blurs slightly. Scale is scrubbed by a
 * single ScrollTrigger timeline over the container.
 */
@Component({
  selector: 'app-timeline',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RevealDirective],
  template: `
    <section id="how-it-works" class="section bg-base" aria-labelledby="how-heading">
      <div class="container-edit">
        <div class="rule flex items-baseline justify-between pt-6">
          <p appReveal mode="fade" class="index-label">02</p>
          <p appReveal mode="fade" class="index-label">Cum funcționează</p>
        </div>

        <h2
          id="how-heading"
          appReveal
          mode="words"
          [stagger]="0.04"
          class="headline mt-16 max-w-3xl text-[clamp(2.5rem,6vw,4.5rem)] text-ink"
        >
          De la fotografie la răspuns.
        </h2>
        <p appReveal mode="fade" [delay]="0.15" class="mt-6 max-w-lg text-lg text-ink/60">
          Patru pași simpli, de la poză la recomandare.
        </p>
      </div>

      <div #stack class="container-edit mt-12 max-w-4xl">
        <ol>
          @for (step of steps; track step.index; let i = $index; let last = $last) {
            <!-- Every card needs sticky travel so it rises and covers the one
                 before it. The last card gets just its own height plus a short
                 hold (not a full 70vh) — it still stacks on top, but without
                 leaving a big white gap before the next section. -->
            <li
              class="stack-wrap sticky flex items-start"
              [class]="last ? 'h-[calc(320px+24vh)] md:h-[calc(420px+24vh)]' : 'h-[70vh]'"
              [style.--i]="i"
            >
              <div
                #card
                class="flex min-h-[320px] w-full flex-col justify-between rounded-[2.5rem] border border-ink/8 bg-surface p-8 sm:p-12 md:min-h-[420px] md:p-16"
                style="transform-origin: top center"
              >
                <span class="index-label" aria-hidden="true">{{ step.index }}</span>
                <div>
                  <h3 class="headline mt-10 text-3xl text-ink sm:text-4xl md:text-5xl">
                    {{ step.title }}
                  </h3>
                  <p class="mt-5 max-w-xl text-lg leading-relaxed text-ink/60 md:text-xl">
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
      title: 'Fă o poză',
      description:
        'Găsește un loc luminos și fă o fotografie clară a semnului de pe piele folosind camera telefonului tău.',
    },
    {
      index: '02',
      title: 'Analiză inteligentă',
      description:
        'Imaginea e curățată automat — fire de păr, culori — apoi două rețele neurale o analizează în opt variante și își combină răspunsurile.',
    },
    {
      index: '03',
      title: 'Evaluarea riscului',
      description:
        'Primești în câteva secunde un scor de risc calibrat și un verdict clar — benign sau suspect — cu o recomandare pe înțelesul tău.',
    },
    {
      index: '04',
      title: 'Consultă un medic',
      description:
        'Dacă riscul e crescut, nu amâna: mergi cu rezultatul la un dermatolog. Doar consultul și, la nevoie, biopsia pun un diagnostic.',
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
        const targetScale = 1 - depth * 0.05;
        const targetBrightness = 1 - depth * 0.2;
        const targetBlur = depth * 3;

        this.timeline!.fromTo(
          card,
          { scale: 1, filter: 'brightness(1) blur(0px)' },
          {
            scale: targetScale,
            filter: `brightness(${targetBrightness}) blur(${targetBlur}px)`,
            duration: duration,
            ease: 'none',
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
