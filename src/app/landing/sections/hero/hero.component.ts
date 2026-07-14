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
import { MagneticDirective } from '../../../shared/directives/magnetic.directive';

/**
 * Centered, single-column opening. One statement, one action, one quiet
 * line of reassurance — no rules, no panels, whitespace does the layout.
 * Masked headline lines rise on load; the block drifts softly on exit.
 */
@Component({
  selector: 'app-hero',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MagneticDirective],
  template: `
    <section
      #wrap
      id="top"
      class="relative flex min-h-svh flex-col overflow-hidden bg-base"
    >
      <div
        #content
        class="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center px-6 pb-20 pt-32 text-center"
      >
        <p class="mask-line index-label">
          <span #intro>Screening dermatologic asistat de AI</span>
        </p>

        <h1 class="display mt-9 text-[clamp(3rem,7.5vw,5.75rem)] text-ink">
          <span class="mask-line"><span #line1>O fotografie.</span></span>
          <span class="mask-line"><span #line2>Mai multă claritate.</span></span>
        </h1>

        <div #deck class="flex flex-col items-center">
          <p class="mt-8 max-w-[26rem] text-pretty text-[1.0625rem] leading-[1.7] text-ink/55 sm:max-w-[30rem] sm:text-lg">
            SkinAlert analizează alunițele cu un model antrenat pe peste 15.000 de imagini
            medicale și îți spune dacă merită văzute de un medic.
          </p>

          <a
            href="#upload"
            (click)="go($event, '#upload')"
            appMagnetic
            [strength]="0.2"
            class="btn-pill mt-12 inline-flex px-8 py-4 text-base shadow-[0_16px_40px_-16px_rgba(29,29,31,0.55)]"
          >
            <span class="btn-label">
              <span>Analizează o fotografie</span>
              <span aria-hidden="true">Analizează o fotografie</span>
            </span>
          </a>

          <a
            href="#how-it-works"
            (click)="go($event, '#how-it-works')"
            class="link-draw mt-7 text-sm font-medium text-ink/45 hover:text-ink"
          >
            Cum funcționează
          </a>
        </div>

        <p #reassure class="mt-16 text-[0.8125rem] leading-relaxed text-ink/35">
          Fără cont&ensp;·&ensp;Gratuit&ensp;·&ensp;Fotografia nu e salvată
        </p>
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
  private readonly intro = viewChild.required<ElementRef<HTMLElement>>('intro');
  private readonly line1 = viewChild.required<ElementRef<HTMLElement>>('line1');
  private readonly line2 = viewChild.required<ElementRef<HTMLElement>>('line2');
  private readonly deck = viewChild.required<ElementRef<HTMLElement>>('deck');
  private readonly reassure = viewChild.required<ElementRef<HTMLElement>>('reassure');

  private entrance?: gsap.core.Timeline;
  private exit?: gsap.core.Timeline;

  ngAfterViewInit(): void {
    if (this.motion.reducedMotion()) {
      return;
    }

    this.zone.runOutsideAngular(() => {
      this.entrance = gsap
        .timeline({ defaults: { ease: 'expo.out' } })
        .from(this.intro().nativeElement, { yPercent: 120, duration: 1 }, 0.1)
        .from(this.line1().nativeElement, { yPercent: 115, duration: 1.4 }, 0.2)
        .from(this.line2().nativeElement, { yPercent: 115, duration: 1.4 }, 0.34)
        .from(
          this.deck().nativeElement.children,
          { y: 24, autoAlpha: 0, duration: 1.1, stagger: 0.12 },
          0.7,
        )
        .from(this.reassure().nativeElement, { autoAlpha: 0, duration: 1.2 }, 1.1);

      this.exit = gsap
        .timeline({
          scrollTrigger: {
            trigger: this.wrap().nativeElement,
            start: 'top top',
            end: 'bottom top',
            scrub: true,
          },
        })
        .to(this.content().nativeElement, { yPercent: 18, autoAlpha: 0.15, ease: 'none' }, 0);
    });
  }

  ngOnDestroy(): void {
    this.entrance?.kill();
    this.exit?.scrollTrigger?.kill();
    this.exit?.kill();
  }

  go(event: Event, anchor: string): void {
    event.preventDefault();
    this.scroll.scrollTo(anchor);
  }
}
