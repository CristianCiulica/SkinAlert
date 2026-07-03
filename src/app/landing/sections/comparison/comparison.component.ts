import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RevealDirective } from '../../../shared/directives/reveal.directive';

interface ComparisonRow {
  label: string;
  detail: string;
}

@Component({
  selector: 'app-comparison',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RevealDirective],
  template: `
    <section id="about" class="section bg-surface" aria-labelledby="why-heading">
      <div class="mx-auto max-w-7xl px-6">
        <div class="grid gap-16 lg:grid-cols-2 lg:items-center">
          <div>
            <p appReveal mode="fade" class="section-label">Why SkinAlert</p>
            <h2 id="why-heading" appReveal mode="words" [stagger]="0.05" class="mt-6 text-4xl font-bold tracking-tight sm:text-5xl">
              The modern way to watch your skin.
            </h2>
            <p appReveal mode="fade" [delay]="0.2" class="mt-6 max-w-lg text-lg leading-relaxed text-gray-400">
              Most people check their skin rarely, and irregularly. SkinAlert turns
              a five-second photo into a habit that supports early awareness —
              with technology that respects both your intelligence and your privacy.
            </p>

            <ul class="mt-10 space-y-5">
              @for (row of rows; track row.label; let i = $index) {
                <li appReveal mode="fade" [delay]="0.1 + i * 0.1" class="flex items-start gap-4">
                  <span class="mt-1 grid size-6 shrink-0 place-items-center rounded-full bg-success/15 text-success">
                    <svg viewBox="0 0 24 24" class="size-3.5" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 13l4 4 10-10"/></svg>
                  </span>
                  <div>
                    <p class="font-semibold">{{ row.label }}</p>
                    <p class="mt-0.5 text-sm text-gray-500">{{ row.detail }}</p>
                  </div>
                </li>
              }
            </ul>
          </div>

          <!-- Visual: traditional vs SkinAlert -->
          <div appReveal mode="scale" [delay]="0.2" class="glass relative overflow-hidden rounded-3xl p-8 sm:p-10">
            <div aria-hidden="true" class="absolute -top-24 -right-24 size-64 rounded-full bg-primary/10 blur-3xl"></div>
            <div class="relative space-y-6">
              <div class="rounded-2xl border border-white/8 bg-white/3 p-6 opacity-60">
                <p class="text-xs font-semibold tracking-[0.2em] text-gray-500">WITHOUT SKINALERT</p>
                <ul class="mt-4 space-y-3 text-sm text-gray-400">
                  <li class="flex items-center gap-3"><span class="size-1.5 rounded-full bg-gray-600"></span>Notice a mole "at some point"</li>
                  <li class="flex items-center gap-3"><span class="size-1.5 rounded-full bg-gray-600"></span>Wait weeks for an appointment</li>
                  <li class="flex items-center gap-3"><span class="size-1.5 rounded-full bg-gray-600"></span>No record of how it changed</li>
                </ul>
              </div>

              <div class="rounded-2xl border border-primary/25 bg-primary/5 p-6 shadow-[0_0_48px_-12px_rgba(79,209,197,0.35)]">
                <p class="text-xs font-semibold tracking-[0.2em] text-primary">WITH SKINALERT</p>
                <ul class="mt-4 space-y-3 text-sm text-gray-200">
                  <li class="flex items-center gap-3"><span class="size-1.5 rounded-full bg-primary"></span>Scan in seconds, whenever you notice something</li>
                  <li class="flex items-center gap-3"><span class="size-1.5 rounded-full bg-primary"></span>Instant AI risk estimate with visual explanation</li>
                  <li class="flex items-center gap-3"><span class="size-1.5 rounded-full bg-primary"></span>Full photographic history for your dermatologist</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  `,
})
export class ComparisonComponent {
  readonly rows: ComparisonRow[] = [
    { label: 'Fast AI-assisted analysis', detail: 'A calibrated risk estimate in under five seconds.' },
    { label: 'Modern computer vision', detail: 'CNN architectures trained on clinical dermatology datasets.' },
    { label: 'Privacy-focused', detail: 'Encrypted, deletable, never sold. Your skin, your data.' },
    { label: 'Easy to use', detail: 'If you can take a photo, you can use SkinAlert.' },
    { label: 'Supports early awareness', detail: 'Complements — never replaces — professional care.' },
  ];
}
