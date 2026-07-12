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
            <p appReveal mode="fade" class="section-label">De ce SkinAlert</p>
            <h2 id="why-heading" appReveal mode="words" [stagger]="0.05" class="mt-6 text-4xl font-bold tracking-tighter text-black sm:text-5xl">
              Modul modern de a-ți monitoriza pielea.
            </h2>
            <p appReveal mode="fade" [delay]="0.2" class="mt-6 max-w-lg text-lg leading-relaxed font-medium text-black/60">
              Majoritatea oamenilor își verifică pielea rar și neregulat. SkinAlert
              transformă o fotografie de cinci secunde într-un obicei care susține
              depistarea timpurie — cu o tehnologie care îți respectă atât inteligența, cât și intimitatea.
            </p>

            <ul class="mt-10 space-y-5">
              @for (row of rows; track row.label; let i = $index) {
                <li appReveal mode="fade" [delay]="0.1 + i * 0.1" class="flex items-start gap-4">
                  <span class="mt-1 grid size-6 shrink-0 place-items-center rounded-full bg-black/5 text-black">
                    <svg viewBox="0 0 24 24" class="size-3.5" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 13l4 4 10-10"/></svg>
                  </span>
                  <div>
                    <p class="font-bold text-black">{{ row.label }}</p>
                    <p class="mt-0.5 text-sm font-medium text-black/60">{{ row.detail }}</p>
                  </div>
                </li>
              }
            </ul>
          </div>

          <!-- Visual: traditional vs SkinAlert -->
          <div appReveal mode="scale" [delay]="0.2" class="card relative overflow-hidden rounded-[2.5rem] p-8 sm:p-10">
            <div aria-hidden="true" class="absolute -top-24 -right-24 size-64 rounded-full bg-black/5 blur-3xl"></div>
            <div class="relative space-y-6">
              <div class="rounded-3xl border border-black/5 bg-black/5 p-6 opacity-60">
                <p class="text-xs font-bold tracking-[0.2em] text-black/40">FĂRĂ SKINALERT</p>
                <ul class="mt-4 space-y-3 text-sm font-medium text-black/60">
                  <li class="flex items-center gap-3"><span class="size-1.5 rounded-full bg-black/20"></span>Observi o aluniță "la un moment dat"</li>
                  <li class="flex items-center gap-3"><span class="size-1.5 rounded-full bg-black/20"></span>Aștepți săptămâni pentru o programare</li>
                  <li class="flex items-center gap-3"><span class="size-1.5 rounded-full bg-black/20"></span>Fără un istoric al modificărilor</li>
                </ul>
              </div>

              <div class="rounded-3xl border border-black/10 bg-white p-6 shadow-xl">
                <p class="text-xs font-bold tracking-[0.2em] text-black">CU SKINALERT</p>
                <ul class="mt-4 space-y-3 text-sm font-bold text-black/80">
                  <li class="flex items-center gap-3"><span class="size-1.5 rounded-full bg-black"></span>Scanezi în secunde, ori de câte ori observi ceva</li>
                  <li class="flex items-center gap-3"><span class="size-1.5 rounded-full bg-black"></span>Estimare instantă a riscului cu explicație vizuală</li>
                  <li class="flex items-center gap-3"><span class="size-1.5 rounded-full bg-black"></span>Istoric fotografic complet pentru dermatologul tău</li>
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
    { label: 'Analiză rapidă asistată de AI', detail: 'O estimare calibrată a riscului în mai puțin de cinci secunde.' },
    { label: 'Vedere artificială modernă', detail: 'Arhitecturi CNN antrenate pe seturi de date din dermatologia clinică.' },
    { label: 'Focus pe intimitate', detail: 'Criptat, complet ștergibil, niciodată vândut. Pielea ta, datele tale.' },
    { label: 'Simplu de utilizat', detail: 'Dacă poți face o fotografie, poți folosi SkinAlert.' },
    { label: 'Susține depistarea timpurie', detail: 'Completează — niciodată nu înlocuiește — îngrijirea profesională.' },
  ];
}
