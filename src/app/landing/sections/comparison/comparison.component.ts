import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ParallaxDirective } from '../../../shared/directives/parallax.directive';
import { RevealDirective } from '../../../shared/directives/reveal.directive';

interface ComparisonRow {
  label: string;
  detail: string;
}

@Component({
  selector: 'app-comparison',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ParallaxDirective, RevealDirective],
  template: `
    <section id="about" class="section bg-base" aria-labelledby="why-heading">
      <div class="mx-auto max-w-7xl px-6">
        <div class="grid gap-16 lg:grid-cols-2 lg:items-center">
          <div>
            <p appReveal mode="fade" class="section-label">05 — De ce SkinAlert</p>
            <h2 id="why-heading" appReveal mode="words" [stagger]="0.05" class="mt-6 text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
              Modul modern de a-ți monitoriza pielea.
            </h2>
            <p appReveal mode="fade" [delay]="0.2" class="mt-6 max-w-lg text-lg leading-relaxed font-medium text-ink/60">
              Majoritatea oamenilor își verifică pielea rar și neregulat. SkinAlert
              transformă o fotografie de cinci secunde într-un obicei care susține
              depistarea timpurie, cu datele tale criptate și private.
            </p>

            <ul class="mt-10 space-y-5">
              @for (row of rows; track row.label; let i = $index) {
                <li appReveal mode="fade" [delay]="0.1 + i * 0.1" class="flex items-start gap-4">
                  <span class="mt-1 grid size-6 shrink-0 place-items-center rounded-full bg-accent text-white">
                    <svg viewBox="0 0 24 24" class="size-3.5" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 13l4 4 10-10"/></svg>
                  </span>
                  <div>
                    <p class="font-bold text-ink">{{ row.label }}</p>
                    <p class="mt-0.5 text-sm font-medium text-ink/60">{{ row.detail }}</p>
                  </div>
                </li>
              }
            </ul>
          </div>

          <!-- Visual: traditional vs SkinAlert -->
          <div appParallax [speed]="0.3">
          <div appReveal mode="fade" [delay]="0.2" class="card relative overflow-hidden rounded-3xl p-8 sm:p-10">
            <div class="relative space-y-4">
              <div class="rounded-2xl border border-ink/5 bg-ink/[0.03] p-6 opacity-70">
                <p class="text-xs font-semibold uppercase tracking-[0.14em] text-ink/40">Fără SkinAlert</p>
                <ul class="mt-4 space-y-3 text-sm text-ink/60">
                  <li class="flex items-center gap-3"><span class="size-1.5 rounded-full bg-ink/20"></span>Observi o aluniță "la un moment dat"</li>
                  <li class="flex items-center gap-3"><span class="size-1.5 rounded-full bg-ink/20"></span>Aștepți săptămâni pentru o programare</li>
                  <li class="flex items-center gap-3"><span class="size-1.5 rounded-full bg-ink/20"></span>Fără un istoric al modificărilor</li>
                </ul>
              </div>

              <div class="rounded-2xl bg-forest p-6 text-paper">
                <p class="text-xs font-semibold uppercase tracking-[0.14em] text-[#2997ff]">Cu SkinAlert</p>
                <ul class="mt-4 space-y-3 text-sm font-medium">
                  <li class="flex items-center gap-3"><span class="size-1.5 rounded-full bg-[#2997ff]"></span>Scanezi în secunde, ori de câte ori observi ceva</li>
                  <li class="flex items-center gap-3"><span class="size-1.5 rounded-full bg-[#2997ff]"></span>Estimare instantă a riscului cu explicație vizuală</li>
                  <li class="flex items-center gap-3"><span class="size-1.5 rounded-full bg-[#2997ff]"></span>Istoric fotografic complet pentru dermatologul tău</li>
                </ul>
              </div>
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
    { label: 'Analiză rapidă asistată de AI', detail: 'O estimare calibrată a riscului în mai puțin de cinci secunde.' },
    { label: 'Vedere artificială modernă', detail: 'Arhitecturi CNN antrenate pe seturi de date din dermatologia clinică.' },
    { label: 'Focus pe intimitate', detail: 'Criptat, complet ștergibil, niciodată vândut. Pielea ta, datele tale.' },
    { label: 'Simplu de utilizat', detail: 'Dacă poți face o fotografie, poți folosi SkinAlert.' },
    { label: 'Susține depistarea timpurie', detail: 'Completează — niciodată nu înlocuiește — îngrijirea profesională.' },
  ];
}
