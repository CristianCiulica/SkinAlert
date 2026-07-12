import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ParallaxDirective } from '../../../shared/directives/parallax.directive';
import { RevealDirective } from '../../../shared/directives/reveal.directive';
import { RippleDirective } from '../../../shared/directives/ripple.directive';

@Component({
  selector: 'app-cta',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ParallaxDirective, RevealDirective, RippleDirective],
  template: `
    <section id="cta" class="overflow-hidden bg-forest py-[clamp(5rem,10vw,9rem)] text-paper" aria-labelledby="cta-heading">
      <div class="relative mx-auto max-w-4xl px-6 text-center" appParallax [speed]="0.25">
        <h2 id="cta-heading" appReveal mode="words" [stagger]="0.06" class="text-balance text-4xl font-semibold tracking-tight sm:text-6xl">
          Preia controlul asupra sănătății pielii tale.
        </h2>
        <p appReveal mode="fade" [delay]="0.3" class="mx-auto mt-7 max-w-xl text-lg leading-relaxed text-paper/60">
          Verificarea unei alunițe nu ar trebui să dureze o lună. Transformă monitorizarea
          pielii într-un obicei de cinci secunde.
        </p>

        <div appReveal mode="fade" [delay]="0.5" class="mt-10">
          <a
            href="#analyzer"
            appRipple
            class="btn-accent group inline-flex items-center gap-3 px-10 py-4 text-base"
          >
            Începe Analiza
            <svg viewBox="0 0 24 24" class="size-5 transition-transform duration-500 group-hover:translate-x-1.5" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M5 12h14m-6-6 6 6-6 6"/>
            </svg>
          </a>
        </div>

        <p appReveal mode="fade" [delay]="0.7" class="mt-8 text-sm font-medium text-paper/40">
          Gratuit de încercat · Fără cont necesar · Fotografiile rămân private
        </p>
      </div>
    </section>
  `,
})
export class CtaComponent {}
