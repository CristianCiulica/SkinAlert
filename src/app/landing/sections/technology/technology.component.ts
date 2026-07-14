import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RevealDirective } from '../../../shared/directives/reveal.directive';

interface TechRow {
  title: string;
  detail: string;
}

/**
 * "04 — Tehnologie" — four hairline rows, one sentence each. The system
 * explained the way you'd explain it to a friend, not a conference.
 */
@Component({
  selector: 'app-technology',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RevealDirective],
  template: `
    <section id="technology" class="section bg-surface" aria-labelledby="tech-heading">
      <div class="container-edit">
        <div class="rule flex items-baseline justify-between pt-6">
          <p appReveal mode="fade" class="index-label">04</p>
          <p appReveal mode="fade" class="index-label">Tehnologie</p>
        </div>

        <h2
          id="tech-heading"
          appReveal
          mode="words"
          [stagger]="0.04"
          class="headline mt-16 max-w-3xl text-[clamp(2.5rem,6vw,4.5rem)] text-ink"
        >
          Construit ca un instrument medical.
        </h2>

        <ul class="mt-20">
          @for (row of rows; track row.title; let i = $index) {
            <li appReveal mode="fade" [delay]="i * 0.06" class="rule group last:border-b last:border-b-ink/12">
              <div class="grid gap-3 py-9 sm:grid-cols-[4rem_1fr_1.2fr] sm:items-baseline sm:gap-8">
                <span class="index-label" aria-hidden="true">{{ pad(i) }}</span>
                <h3
                  class="headline text-2xl text-ink transition-transform duration-500 group-hover:translate-x-2 sm:text-3xl"
                >
                  {{ row.title }}
                </h3>
                <p class="text-base leading-relaxed text-ink/55 sm:text-lg">{{ row.detail }}</p>
              </div>
            </li>
          }
        </ul>
      </div>
    </section>
  `,
})
export class TechnologyComponent {
  readonly rows: TechRow[] = [
    {
      title: 'Două modele, opt priviri',
      detail:
        'Două rețele neurale EfficientNet analizează imaginea în opt variante — oglindită, rotită — iar verdictul e media lor. Ca o a doua opinie, automată.',
    },
    {
      title: 'Imaginea e curățată întâi',
      detail:
        'Firele de păr sunt șterse digital, iar culorile sunt aduse la neutru, ca lumina din cameră să nu păcălească analiza.',
    },
    {
      title: 'Pozele slabe sunt refuzate',
      detail:
        'Claritatea, lumina și contrastul sunt verificate înainte. Dacă nu ajung, primești sfaturi concrete în loc de un verdict nesigur.',
    },
    {
      title: 'Reglat să nu rateze',
      detail:
        'Pragul de decizie e ales prudent, iar probabilitățile sunt calibrate: preferăm o alarmă falsă în locul unui risc trecut cu vederea.',
    },
  ];

  pad(i: number): string {
    return String(i + 1).padStart(2, '0');
  }
}
