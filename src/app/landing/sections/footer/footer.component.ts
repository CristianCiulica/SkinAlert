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
import { ScrollService } from '../../../core/scroll.service';

/**
 * Shares the CTA's ink ground so the page ends in one quiet block.
 * Text links only, then the wordmark set at viewport width rises
 * letter by letter as it enters.
 */
@Component({
  selector: 'app-footer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <footer class="overflow-hidden bg-ink pb-8 text-base">
      <div class="container-edit">
        <div class="grid gap-10 border-t border-base/15 pt-14 sm:grid-cols-3">
          <nav aria-label="Pagina">
            <h3 class="text-xs font-medium uppercase tracking-[0.14em] text-base/35">Pagina</h3>
            <ul class="mt-5 space-y-3">
              @for (link of pageLinks; track link.label) {
                <li>
                  <a
                    [href]="link.anchor"
                    (click)="go($event, link.anchor)"
                    class="link-draw text-sm text-base/60 hover:text-base"
                  >{{ link.label }}</a>
                </li>
              }
            </ul>
          </nav>

          <nav aria-label="Contact">
            <h3 class="text-xs font-medium uppercase tracking-[0.14em] text-base/35">Contact</h3>
            <ul class="mt-5 space-y-3">
              <li>
                <a href="mailto:cristianciulica2024@gmail.com" class="link-draw text-sm text-base/60 hover:text-base">
                  cristianciulica2024&#64;gmail.com
                </a>
              </li>
            </ul>
          </nav>

          <div>
            <h3 class="text-xs font-medium uppercase tracking-[0.14em] text-base/35">Declarație medicală</h3>
            <p class="mt-5 text-sm leading-relaxed text-base/50">
              SkinAlert nu este un dispozitiv medical de diagnosticare. Evaluarea de risc sprijină,
              nu înlocuiește, judecata clinică. Consultă întotdeauna un dermatolog.
            </p>
          </div>
        </div>

        <p class="mt-14 text-xs text-base/35">© {{ year }} SkinAlert. Toate drepturile rezervate.</p>
      </div>

      <p
        #wordmark
        class="mt-10 select-none whitespace-nowrap text-center font-semibold leading-none tracking-tighter text-base/90"
        style="font-size: clamp(4rem, 15.5vw, 15rem)"
        aria-hidden="true"
      >
        @for (letter of letters; track $index) {
          <span class="mask-line !inline-block align-bottom"><span class="wm-letter">{{ letter }}</span></span>
        }
      </p>
    </footer>
  `,
})
export class FooterComponent implements AfterViewInit, OnDestroy {
  private readonly scroll = inject(ScrollService);
  private readonly zone = inject(NgZone);
  private readonly motion = inject(MotionService);

  private readonly wordmark = viewChild.required<ElementRef<HTMLElement>>('wordmark');

  private trigger?: ScrollTrigger;

  readonly year = new Date().getFullYear();
  readonly letters = [...'SkinAlert'];

  readonly pageLinks = [
    { label: 'Analiză', anchor: '#analyzer' },
    { label: 'Cum funcționează', anchor: '#how-it-works' },
    { label: 'Precizie', anchor: '#accuracy' },
    { label: 'Tehnologie', anchor: '#technology' },
    { label: 'Întrebări', anchor: '#faq' },
  ];

  ngAfterViewInit(): void {
    if (this.motion.reducedMotion()) {
      return;
    }

    this.zone.runOutsideAngular(() => {
      const host = this.wordmark().nativeElement;
      const tween = gsap.from(host.querySelectorAll('.wm-letter'), {
        yPercent: 110,
        duration: 1.2,
        ease: 'expo.out',
        stagger: 0.045,
        paused: true,
      });

      this.trigger = ScrollTrigger.create({
        trigger: host,
        start: 'top 95%',
        once: true,
        onEnter: () => tween.play(),
      });
    });
  }

  ngOnDestroy(): void {
    this.trigger?.kill();
  }

  go(event: Event, anchor: string): void {
    event.preventDefault();
    this.scroll.scrollTo(anchor);
  }
}
