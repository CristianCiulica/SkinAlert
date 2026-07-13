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
 * Purely typographic opening: two masked headline lines rise on load,
 * then the deck, actions and fact row follow. On scroll the whole
 * composition drifts up slightly slower than the page and fades.
 */
@Component({
  selector: 'app-hero',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MagneticDirective],
  template: `
    <section
      #wrap
      id="top"
      class="relative flex min-h-svh flex-col justify-between overflow-hidden bg-base pt-32 pb-10"
    >
      <!-- One quiet pool of light. Nothing else decorates this screen. -->
      <div
        aria-hidden="true"
        class="pointer-events-none absolute -top-[30%] left-1/2 h-[80vh] w-[120vw] -translate-x-1/2 rounded-full opacity-60"
        style="background: radial-gradient(closest-side, rgba(0, 113, 227, 0.07), transparent 70%)"
      ></div>

      <div #content class="container-edit relative flex flex-1 flex-col justify-center">
        <p class="mask-line index-label">
          <span #intro>Screening dermatologic asistat de AI</span>
        </p>

        <h1 class="display mt-8 text-[clamp(3.25rem,9vw,7.5rem)] text-ink">
          <span class="mask-line"><span #line1>O fotografie.</span></span>
          <span class="mask-line"><span #line2>Un răspuns <em class="serif-accent">clar</em>.</span></span>
        </h1>

        <div #deck class="mt-10 flex max-w-xl flex-col gap-10">
          <p class="text-pretty text-lg leading-relaxed text-ink/60 sm:text-xl">
            SkinAlert analizează alunițele cu un model antrenat pe peste 15.000 de imagini
            medicale și îți spune în câteva secunde dacă merită văzute de un medic.
          </p>

          <div class="flex flex-wrap items-center gap-6">
            <a
              href="#analyzer"
              (click)="go($event, '#analyzer')"
              appMagnetic
              class="btn-pill inline-flex px-8 py-4 text-base"
            >
              <span class="btn-label">
                <span>Analizează o fotografie</span>
                <span aria-hidden="true">Analizează o fotografie</span>
              </span>
            </a>
            <a
              href="#how-it-works"
              (click)="go($event, '#how-it-works')"
              class="link-draw text-base font-medium text-ink/70 hover:text-ink"
            >
              Cum funcționează
            </a>
          </div>
        </div>
      </div>

      <!-- Fact row: three plain truths, hairline above. -->
      <div #facts class="container-edit relative">
        <dl class="rule grid grid-cols-1 gap-x-10 gap-y-4 pt-6 sm:grid-cols-3">
          @for (fact of factRow; track fact.term) {
            <div class="flex items-baseline justify-between gap-4 sm:block">
              <dt class="text-sm text-ink/45">{{ fact.term }}</dt>
              <dd class="text-sm font-medium text-ink sm:mt-1">{{ fact.detail }}</dd>
            </div>
          }
        </dl>
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
  private readonly facts = viewChild.required<ElementRef<HTMLElement>>('facts');

  private entrance?: gsap.core.Timeline;
  private exit?: gsap.core.Timeline;

  readonly factRow = [
    { term: 'Fără cont', detail: 'Încarci și primești rezultatul' },
    { term: 'Timp de analiză', detail: 'Sub două secunde' },
    { term: 'Confidențialitate', detail: 'Fotografia nu e salvată după analiză' },
  ];

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
          { y: 28, autoAlpha: 0, duration: 1.1, stagger: 0.12 },
          0.7,
        )
        .from(this.facts().nativeElement, { autoAlpha: 0, duration: 1.2 }, 1.05);

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
