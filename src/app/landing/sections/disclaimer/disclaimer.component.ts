import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RevealDirective } from '../../../shared/directives/reveal.directive';

@Component({
  selector: 'app-disclaimer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RevealDirective],
  template: `
    <section class="section bg-surface" aria-labelledby="disclaimer-heading">
      <div class="mx-auto max-w-4xl px-6 text-center">
        <div appReveal mode="scale" class="mx-auto mb-10 grid size-16 place-items-center rounded-2xl border border-warning/30 bg-warning/10 text-warning">
          <svg viewBox="0 0 24 24" class="size-8" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M12 3l9.5 16.5h-19L12 3z"/><path d="M12 10v4m0 3.5v.01"/>
          </svg>
        </div>

        <p appReveal mode="fade" class="section-label justify-center">Important</p>
        <h2 id="disclaimer-heading" appReveal mode="words" [stagger]="0.06" class="mt-6 text-4xl font-bold tracking-tight sm:text-5xl">
          SkinAlert is an assistant, not a doctor.
        </h2>

        <div appReveal mode="fade" [delay]="0.25" class="mx-auto mt-10 max-w-2xl space-y-6 text-lg leading-relaxed text-muted">
          <p>
            SkinAlert is an <strong class="font-semibold text-ink">AI-powered assistant</strong>.
            It <strong class="font-semibold text-ink">does not diagnose cancer</strong> or any
            other medical condition. It estimates risk based on image analysis and is intended
            solely to support early awareness.
          </p>
          <p>
            AI estimates can be wrong — in both directions. A low risk score never rules out
            disease, and a high score is not a diagnosis.
          </p>
          <p class="rounded-2xl border border-line bg-surface px-8 py-6 font-medium text-ink/80">
            Always consult a qualified dermatologist for medical diagnosis, and seek care
            promptly for any lesion that changes, bleeds, or concerns you — whatever this
            or any app says.
          </p>
        </div>
      </div>
    </section>
  `,
})
export class DisclaimerComponent {}
