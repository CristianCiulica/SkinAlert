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
import { gsap, ScrollTrigger } from '../../../core/gsap';
import { MotionService } from '../../../core/motion.service';
import { RevealDirective } from '../../../shared/directives/reveal.directive';
import { SafeHtmlPipe } from '../../../shared/pipes/safe-html.pipe';

interface TimelineStep {
  index: string;
  title: string;
  description: string;
  icon: string;
}

/**
 * "How SkinAlert Works" — a pinned section whose horizontal track of
 * steps scrubs with vertical scroll, Apple-keynote style. Falls back to
 * a vertical list on small screens / reduced motion.
 */
@Component({
  selector: 'app-timeline',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RevealDirective, SafeHtmlPipe],
  template: `
    <section id="how-it-works" class="section overflow-hidden bg-surface" aria-labelledby="how-heading">
      <div class="mx-auto max-w-7xl px-6">
        <p appReveal mode="fade" class="section-label">How it works</p>
        <h2 id="how-heading" appReveal mode="words" [stagger]="0.05" class="mt-6 max-w-2xl text-4xl font-bold tracking-tight sm:text-5xl">
          From photo to insight in five steps.
        </h2>
      </div>

      <div #pinWrap class="relative mt-16">
        <!-- Progress rail -->
        <div aria-hidden="true" class="absolute top-[4.4rem] right-0 left-0 hidden h-px bg-line lg:block">
          <div #progress class="h-full origin-left scale-x-0 bg-gradient-to-r from-primary to-secondary shadow-[0_0_12px_rgba(0,122,255,0.35)]"></div>
        </div>

        <ol
          #track
          class="flex flex-col gap-6 px-6 lg:w-max lg:flex-row lg:gap-8 lg:px-[12vw]"
        >
          @for (step of steps; track step.index; let i = $index) {
            <li
              appReveal
              mode="fade"
              [delay]="i * 0.08"
              class="glass glass-hover relative w-full shrink-0 rounded-3xl p-8 lg:w-[26rem]"
            >
              <div class="mb-6 flex items-center gap-4">
                <span class="grid size-12 place-items-center rounded-2xl border border-primary/30 bg-primary/10 text-primary" [innerHTML]="step.icon | safeHtml" aria-hidden="true"></span>
                <span class="text-sm font-semibold tracking-[0.2em] text-muted">STEP {{ step.index }}</span>
              </div>
              <h3 class="text-xl font-semibold">{{ step.title }}</h3>
              <p class="mt-3 leading-relaxed text-muted">{{ step.description }}</p>
              @if (i < steps.length - 1) {
                <span aria-hidden="true" class="absolute top-1/2 -right-7 hidden -translate-y-1/2 text-primary/60 lg:block">
                  <svg viewBox="0 0 24 24" class="size-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14m-6-6 6 6-6 6"/></svg>
                </span>
              }
            </li>
          }
        </ol>
      </div>
    </section>
  `,
})
export class TimelineComponent implements AfterViewInit, OnDestroy {
  private readonly zone = inject(NgZone);
  private readonly motion = inject(MotionService);

  private readonly pinWrap = viewChild.required<ElementRef<HTMLElement>>('pinWrap');
  private readonly track = viewChild.required<ElementRef<HTMLElement>>('track');
  private readonly progress = viewChild.required<ElementRef<HTMLElement>>('progress');

  private matchMedia?: gsap.MatchMedia;

  readonly steps: TimelineStep[] = [
    {
      index: '01',
      title: 'Capture a clear photo',
      description: 'Use your phone camera in good lighting. Frame the lesion closely and keep the image sharp.',
      icon: `<svg viewBox="0 0 24 24" class="size-6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 8h2l2-3h8l2 3h2a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z"/><circle cx="12" cy="13" r="3.5"/></svg>`,
    },
    {
      index: '02',
      title: 'Upload the image',
      description: 'Your photo is encrypted in transit and processed privately. No account required to try it.',
      icon: `<svg viewBox="0 0 24 24" class="size-6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 16V4m0 0 4 4m-4-4-4 4"/><path d="M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3"/></svg>`,
    },
    {
      index: '03',
      title: 'AI performs analysis',
      description: 'A convolutional neural network trained on clinical datasets examines shape, border, color and texture.',
      icon: `<svg viewBox="0 0 24 24" class="size-6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="6" width="12" height="12" rx="2"/><path d="M9 2v4M15 2v4M9 18v4M15 18v4M2 9h4M2 15h4M18 9h4M18 15h4"/></svg>`,
    },
    {
      index: '04',
      title: 'Risk assessment generated',
      description: 'You receive a clear risk estimate with an AI heatmap showing which regions influenced the result.',
      icon: `<svg viewBox="0 0 24 24" class="size-6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 20h18"/><path d="M5 20v-6l4-4 4 3 6-7v14"/></svg>`,
    },
    {
      index: '05',
      title: 'Professional follow-up',
      description: 'If anything looks suspicious, SkinAlert recommends a dermatologist evaluation — early checks save lives.',
      icon: `<svg viewBox="0 0 24 24" class="size-6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s-7-4.5-9-9a5 5 0 0 1 9-3 5 5 0 0 1 9 3c-2 4.5-9 9-9 9z"/><path d="M7 12h3l1.5-2.5L14 14l1.5-2H17"/></svg>`,
    },
  ];

  ngAfterViewInit(): void {
    if (this.motion.reducedMotion()) {
      return;
    }

    this.zone.runOutsideAngular(() => {
      this.matchMedia = gsap.matchMedia();
      // Horizontal scrub only on desktop; mobile keeps the vertical list.
      this.matchMedia.add('(min-width: 1024px)', () => {
        const track = this.track().nativeElement;
        const distance = () => track.scrollWidth - window.innerWidth;

        gsap.to(track, {
          x: () => -distance(),
          ease: 'none',
          scrollTrigger: {
            trigger: this.pinWrap().nativeElement,
            start: 'center center',
            end: () => `+=${distance()}`,
            pin: true,
            scrub: 1,
            invalidateOnRefresh: true,
            anticipatePin: 1,
          },
        });

        gsap.to(this.progress().nativeElement, {
          scaleX: 1,
          ease: 'none',
          scrollTrigger: {
            trigger: this.pinWrap().nativeElement,
            start: 'center center',
            end: () => `+=${distance()}`,
            scrub: 1,
            invalidateOnRefresh: true,
          },
        });
      });
    });
  }

  ngOnDestroy(): void {
    this.matchMedia?.revert();
  }
}
