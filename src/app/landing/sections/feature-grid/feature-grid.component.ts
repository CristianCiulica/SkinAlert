import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RevealDirective } from '../../../shared/directives/reveal.directive';
import { TiltDirective } from '../../../shared/directives/tilt.directive';
import { SafeHtmlPipe } from '../../../shared/pipes/safe-html.pipe';

interface BentoCard {
  title: string;
  description: string;
  icon: string;
  span: string;
  glow: string;
}

@Component({
  selector: 'app-feature-grid',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RevealDirective, TiltDirective, SafeHtmlPipe],
  template: `
    <section id="features" class="section bg-surface" aria-labelledby="grid-heading">
      <div class="mx-auto max-w-7xl px-6">
        <div class="text-center mb-16">
          <p appReveal mode="fade" class="section-label mb-4">Funcționalități</p>
          <h2 id="grid-heading" appReveal mode="words" [stagger]="0.05" class="mx-auto max-w-3xl text-5xl font-bold tracking-tighter sm:text-7xl text-black">
            Acuratețe medicală.<br/>Design impecabil.
          </h2>
        </div>

        <div class="grid auto-rows-[16rem] grid-cols-2 gap-6 md:grid-cols-4 lg:grid-cols-6">
          @for (card of cards; track card.title; let i = $index) {
            <div
              appReveal
              mode="scale"
              [delay]="(i % 4) * 0.08"
              appTilt
              [strength]="4"
              class="card group relative overflow-hidden rounded-[2.5rem] p-8 {{ card.span }} flex flex-col justify-end transition-all duration-500 hover:shadow-xl"
            >
              <div
                aria-hidden="true"
                class="absolute -top-16 -right-16 size-40 rounded-full opacity-0 blur-3xl transition-opacity duration-700 group-hover:opacity-100"
                [style.background]="card.glow"
              ></div>
              <span class="absolute top-8 left-8 text-black/30 transition-all duration-500 group-hover:scale-110 group-hover:text-black" [innerHTML]="card.icon | safeHtml" aria-hidden="true"></span>
              <div class="relative z-10">
                <h3 class="text-2xl font-bold tracking-tight text-black">{{ card.title }}</h3>
              </div>
            </div>
          }
        </div>
      </div>
    </section>
  `,
})
export class FeatureGridComponent {
  private icon(path: string): string {
    return `<svg viewBox="0 0 24 24" class="size-10" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${path}</svg>`;
  }

  readonly cards: BentoCard[] = [
    {
      title: 'Hărți Termice AI',
      description: '',
      span: 'col-span-2 row-span-2',
      glow: 'rgba(0,122,255,0.05)',
      icon: this.icon('<rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="11" cy="11" r="4.5" stroke-dasharray="2 2"/><circle cx="11" cy="11" r="1.8"/>'),
    },
    {
      title: 'Instant',
      description: '',
      span: 'col-span-2',
      glow: 'rgba(52,199,89,0.05)',
      icon: this.icon('<path d="M13 2 4.5 13.5H11L9.5 22 19 10h-6.5L13 2z"/>'),
    },
    {
      title: 'Intimitate Absolută',
      description: '',
      span: 'col-span-2 row-span-2',
      glow: 'rgba(255,149,0,0.05)',
      icon: this.icon('<path d="M12 2l7 4v6c0 4.5-3 8.5-7 10-4-1.5-7-5.5-7-10V6l7-4z"/><path d="M9 12l2 2 4-4"/>'),
    },
    {
      title: 'Stocare Securizată',
      description: '',
      span: 'col-span-2',
      glow: 'rgba(0,122,255,0.05)',
      icon: this.icon('<path d="M7 18a4.5 4.5 0 1 1 .5-8.97 6 6 0 0 1 11.4 1.72A4 4 0 0 1 18 18H7z"/><path d="M12 12v4m0 0-1.6-1.6M12 16l1.6-1.6"/>'),
    },
    {
      title: 'Urmărire Evoluție',
      description: '',
      span: 'col-span-2',
      glow: 'rgba(52,199,89,0.05)',
      icon: this.icon('<path d="M3 20h18"/><path d="M5 20v-6l4-4 4 3 6-7v14"/>'),
    },
    {
      title: 'Comparație Vizuală',
      description: '',
      span: 'col-span-2',
      glow: 'rgba(255,59,48,0.05)',
      icon: this.icon('<rect x="3" y="5" width="8" height="14" rx="1.5"/><rect x="13" y="5" width="8" height="14" rx="1.5"/><path d="M7 9v6m10-6v6" stroke-dasharray="2 2"/>'),
    },
    {
      title: 'Rapoarte Medicale',
      description: '',
      span: 'col-span-2 md:col-span-4 lg:col-span-2',
      glow: 'rgba(0,122,255,0.05)',
      icon: this.icon('<path d="M6 2h9l5 5v15H6V2z"/><path d="M15 2v5h5M9 13h6M9 17h6M9 9h2"/>'),
    },
  ];
}
