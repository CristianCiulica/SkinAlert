import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ScrollService } from '../../../core/scroll.service';
import { RevealDirective } from '../../../shared/directives/reveal.directive';
import { MagneticDirective } from '../../../shared/directives/magnetic.directive';

/**
 * The page's single dark moment: one question, one action, one honest
 * caveat. Flows straight into the footer, which shares the ink ground.
 */
@Component({
  selector: 'app-cta',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RevealDirective, MagneticDirective],
  template: `
    <section class="bg-ink py-[clamp(7rem,14vw,12rem)] text-base" aria-labelledby="cta-heading">
      <div class="container-edit flex flex-col items-center text-center">
        <h2
          id="cta-heading"
          appReveal
          mode="words"
          [stagger]="0.05"
          class="display max-w-4xl text-[clamp(2.75rem,7vw,6rem)] text-base"
        >
          Ai o aluniță care te preocupă?
        </h2>

        <p appReveal mode="fade" [delay]="0.25" class="mt-8 max-w-md text-lg text-base/60">
          Verific-o în câteva secunde. Dacă e ceva, afli devreme.
        </p>

        <a
          appReveal
          mode="scale"
          [delay]="0.4"
          href="#upload"
          (click)="go($event)"
          appMagnetic
          [strength]="0.3"
          class="btn-invert mt-12 inline-flex items-center justify-center overflow-hidden rounded-full bg-base px-10 py-5 text-lg font-medium tracking-tight text-ink transition-transform duration-500 hover:scale-[1.03] active:scale-[0.97]"
        >
          <span class="btn-label">
            <span>Analizează acum</span>
            <span aria-hidden="true">Analizează acum</span>
          </span>
        </a>

        <p appReveal mode="fade" [delay]="0.5" class="mt-16 max-w-lg text-sm leading-relaxed text-base/40">
          SkinAlert nu pune diagnostice și poate greși în ambele direcții. Orice leziune care își
          schimbă forma, sângerează sau te îngrijorează merită văzută de un dermatolog — indiferent
          de rezultatul de aici.
        </p>
      </div>
    </section>
  `,
})
export class CtaComponent {
  private readonly scroll = inject(ScrollService);

  go(event: Event): void {
    event.preventDefault();
    this.scroll.scrollTo('#upload');
  }
}
