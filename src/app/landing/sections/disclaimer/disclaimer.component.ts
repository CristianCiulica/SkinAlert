import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ParallaxDirective } from '../../../shared/directives/parallax.directive';
import { RevealDirective } from '../../../shared/directives/reveal.directive';

@Component({
  selector: 'app-disclaimer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ParallaxDirective, RevealDirective],
  template: `
    <section class="section bg-base" aria-labelledby="disclaimer-heading">
      <div class="mx-auto max-w-7xl px-6" appParallax [speed]="0.2">
        <div appReveal mode="fade" class="rounded-3xl bg-sage p-8 sm:p-14">
          <div class="grid gap-10 lg:grid-cols-[1fr_1.4fr] lg:gap-20">
            <div>
              <p class="section-label text-ink/60">Important</p>
              <h2 id="disclaimer-heading" class="mt-6 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
                SkinAlert este un asistent, nu un doctor.
              </h2>
            </div>

            <div class="space-y-5 leading-relaxed text-ink/70">
              <p>
                SkinAlert este un <strong class="font-semibold text-ink">asistent bazat pe AI</strong>.
                Acesta <strong class="font-semibold text-ink">nu diagnostichează cancerul</strong> sau orice
                altă afecțiune medicală. Estimează un risc bazat pe analiza imaginii și are scopul
                exclusiv de a sprijini conștientizarea timpurie.
              </p>
              <p>
                Estimările AI pot fi greșite — în ambele direcții. Un scor de risc scăzut nu exclude niciodată
                boala, iar un scor ridicat nu reprezintă un diagnostic.
              </p>
              <p class="border-l-2 border-ink/30 pl-5 font-medium text-ink">
                Consultă întotdeauna un dermatolog calificat pentru un diagnostic medical și solicită
                îngrijire imediată pentru orice leziune care își schimbă forma, sângerează sau te îngrijorează —
                indiferent de ceea ce indică această aplicație.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  `,
})
export class DisclaimerComponent {}
