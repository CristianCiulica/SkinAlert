import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RevealDirective } from '../../../shared/directives/reveal.directive';
import { RippleDirective } from '../../../shared/directives/ripple.directive';

@Component({
  selector: 'app-cta',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RevealDirective, RippleDirective],
  template: `
    <section id="cta" class="section overflow-hidden" aria-labelledby="cta-heading">
      <div aria-hidden="true" class="pointer-events-none absolute inset-0">
        <div class="absolute bottom-0 left-1/2 h-[32rem] w-[70rem] -translate-x-1/2 translate-y-1/2 rounded-full bg-primary/12 blur-[140px]"></div>
        <div class="absolute top-0 left-1/4 h-64 w-64 rounded-full bg-secondary/8 blur-[100px]"></div>
      </div>

      <div class="relative mx-auto max-w-4xl px-6 text-center">
        <h2 id="cta-heading" appReveal mode="words" [stagger]="0.07" class="text-balance text-5xl font-bold tracking-tight sm:text-6xl">
          Take Control of Your Skin Health.
        </h2>
        <p appReveal mode="fade" [delay]="0.3" class="mx-auto mt-8 max-w-xl text-lg leading-relaxed text-gray-400">
          Checking a mole shouldn't take a month. Make responsible skin monitoring
          a five-second habit — and bring better information to your next
          dermatologist visit.
        </p>

        <div appReveal mode="scale" [delay]="0.5" class="mt-12">
          <a
            href="#top"
            appRipple
            class="btn-primary group relative inline-flex items-center gap-3 rounded-2xl px-12 py-5 text-lg font-semibold"
          >
            Start Analysis
            <svg viewBox="0 0 24 24" class="size-5 transition-transform duration-500 group-hover:translate-x-1.5" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M5 12h14m-6-6 6 6-6 6"/>
            </svg>
          </a>
        </div>

        <p appReveal mode="fade" [delay]="0.7" class="mt-8 text-sm text-gray-600">
          Free to try · No account required · Your photos stay private
        </p>
      </div>
    </section>
  `,
})
export class CtaComponent {}
