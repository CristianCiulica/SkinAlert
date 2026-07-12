import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RevealDirective } from '../../../shared/directives/reveal.directive';
import { SafeHtmlPipe } from '../../../shared/pipes/safe-html.pipe';

interface TimelineStep {
  index: string;
  title: string;
  description: string;
  icon: string;
}

/**
 * "How SkinAlert Works" — flat editorial process list: numbered rows
 * separated by hairlines, no pinning, no scroll hijacking.
 */
@Component({
  selector: 'app-timeline',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RevealDirective, SafeHtmlPipe],
  template: `
    <section id="how-it-works" class="section bg-base" aria-labelledby="how-heading">
      <div class="mx-auto max-w-7xl px-6">
        <div class="grid gap-10 lg:grid-cols-[1fr_1.6fr] lg:gap-20">
          <div>
            <p appReveal mode="fade" class="section-label">02 — Cum funcționează</p>
            <h2 id="how-heading" appReveal mode="words" [stagger]="0.05" class="mt-6 text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
              De la fotografie la rezultat în cinci pași.
            </h2>
            <p appReveal mode="fade" [delay]="0.2" class="mt-6 max-w-md text-lg leading-relaxed text-ink/60">
              Fără spreadsheet-uri, fără ghicit. Un flux clinic simplu, criptat
              de la un capăt la altul, care se termină mereu cu o recomandare clară.
            </p>
          </div>

          <ol class="mt-2">
            @for (step of steps; track step.index; let i = $index) {
              <li
                appReveal
                mode="fade"
                [delay]="i * 0.06"
                class="group grid grid-cols-[3.5rem_1fr] items-baseline gap-4 border-t border-ink/10 py-7 transition-colors duration-300 last:border-b hover:bg-ink/[0.02] sm:grid-cols-[5rem_16rem_1fr] sm:gap-8"
              >
                <span class="text-sm font-semibold tabular-nums text-ink/40 transition-colors duration-300 group-hover:text-ink" aria-hidden="true">
                  {{ step.index }}
                </span>
                <h3 class="flex items-center gap-3 text-xl font-semibold tracking-tight text-ink">
                  <span class="grid size-9 shrink-0 place-items-center rounded-full bg-sage text-accent" [innerHTML]="step.icon | safeHtml" aria-hidden="true"></span>
                  {{ step.title }}
                </h3>
                <p class="col-span-2 mt-3 leading-relaxed text-ink/60 sm:col-span-1 sm:mt-0">
                  {{ step.description }}
                </p>
              </li>
            }
          </ol>
        </div>
      </div>
    </section>
  `,
})
export class TimelineComponent {
  readonly steps: TimelineStep[] = [
    {
      index: '01',
      title: 'Fotografiază leziunea',
      description: 'Folosește camera telefonului într-o lumină bună. Ghidul de captură te ajută să obții o imagine utilă clinic.',
      icon: `<svg viewBox="0 0 24 24" class="size-4.5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 8h2l2-3h8l2 3h2a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z"/><circle cx="12" cy="13" r="3.5"/></svg>`,
    },
    {
      index: '02',
      title: 'Încarcă imaginea',
      description: 'Fotografia este criptată și procesată privat, cu verificare instantă a calității. Nu ai nevoie de cont.',
      icon: `<svg viewBox="0 0 24 24" class="size-4.5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 16V4m0 0 4 4m-4-4-4 4"/><path d="M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3"/></svg>`,
    },
    {
      index: '03',
      title: 'Analiza AI',
      description: 'O rețea neurală antrenată pe seturi de date clinice examinează forma, culoarea și textura în câteva secunde.',
      icon: `<svg viewBox="0 0 24 24" class="size-4.5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="6" width="12" height="12" rx="2"/><path d="M9 2v4M15 2v4M9 18v4M15 18v4M2 9h4M2 15h4M18 9h4M18 15h4"/></svg>`,
    },
    {
      index: '04',
      title: 'Rezultat explicabil',
      description: 'Primești o estimare calibrată a riscului, cu harta termică a regiunilor care au influențat scorul.',
      icon: `<svg viewBox="0 0 24 24" class="size-4.5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 20h18"/><path d="M5 20v-6l4-4 4 3 6-7v14"/></svg>`,
    },
    {
      index: '05',
      title: 'Recomandare medicală',
      description: 'Dacă ceva pare suspect, SkinAlert te îndrumă către un dermatolog — cu istoricul fotografic pregătit.',
      icon: `<svg viewBox="0 0 24 24" class="size-4.5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s-7-4.5-9-9a5 5 0 0 1 9-3 5 5 0 0 1 9 3c-2 4.5-9 9-9 9z"/><path d="M7 12h3l1.5-2.5L14 14l1.5-2H17"/></svg>`,
    },
  ];
}
