import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RevealDirective } from '../../../shared/directives/reveal.directive';

@Component({
  selector: 'app-disclaimer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RevealDirective],
  template: `
    <section class="section bg-surface" aria-labelledby="disclaimer-heading">
      <div class="mx-auto max-w-4xl px-6 text-center">
        <div appReveal mode="scale" class="mx-auto mb-10 grid size-16 place-items-center rounded-2xl border border-black/10 bg-white text-black shadow-sm">
          <svg viewBox="0 0 24 24" class="size-8" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M12 3l9.5 16.5h-19L12 3z"/><path d="M12 10v4m0 3.5v.01"/>
          </svg>
        </div>

        <p appReveal mode="fade" class="section-label justify-center">Important</p>
        <h2 id="disclaimer-heading" appReveal mode="words" [stagger]="0.06" class="mt-6 text-4xl font-bold tracking-tighter text-black sm:text-5xl">
          SkinAlert este un asistent, nu un doctor.
        </h2>

        <div appReveal mode="fade" [delay]="0.25" class="mx-auto mt-10 max-w-2xl space-y-6 text-lg leading-relaxed font-medium text-black/60">
          <p>
            SkinAlert este un <strong class="font-bold text-black">asistent bazat pe AI</strong>.
            Acesta <strong class="font-bold text-black">nu diagnostichează cancerul</strong> sau orice
            altă afecțiune medicală. Estimează un risc bazat pe analiza imaginii și are scopul
            exclusiv de a sprijini conștientizarea timpurie.
          </p>
          <p>
            Estimările AI pot fi greșite — în ambele direcții. Un scor de risc scăzut nu exclude niciodată
            boala, iar un scor ridicat nu reprezintă un diagnostic.
          </p>
          <p class="rounded-[2rem] card p-8 font-bold text-black/80">
            Consultă întotdeauna un dermatolog calificat pentru un diagnostic medical și solicită
            îngrijire imediată pentru orice leziune care își schimbă forma, sângerează sau te îngrijorează — 
            indiferent de ceea ce indică această aplicație.
          </p>
        </div>
      </div>
    </section>
  `,
})
export class DisclaimerComponent {}
