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
    <section class="section" aria-labelledby="grid-heading">
      <div class="mx-auto max-w-7xl px-6">
        <p appReveal mode="fade" class="section-label">Everything included</p>
        <h2 id="grid-heading" appReveal mode="words" [stagger]="0.05" class="mt-6 max-w-2xl text-4xl font-bold tracking-tight sm:text-5xl">
          Built like a medical instrument. Designed like a consumer product.
        </h2>

        <div class="mt-16 grid auto-rows-[11rem] grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-6">
          @for (card of cards; track card.title; let i = $index) {
            <div
              appReveal
              mode="scale"
              [delay]="(i % 4) * 0.08"
              appTilt
              [strength]="4"
              class="bento glass glass-hover group relative overflow-hidden rounded-3xl p-6 {{ card.span }}"
            >
              <div
                aria-hidden="true"
                class="absolute -top-16 -right-16 size-40 rounded-full opacity-0 blur-3xl transition-opacity duration-700 group-hover:opacity-100"
                [style.background]="card.glow"
              ></div>
              <span class="relative text-primary transition-transform duration-500 group-hover:scale-110" [innerHTML]="card.icon | safeHtml" aria-hidden="true"></span>
              <div class="relative mt-auto">
                <h3 class="font-semibold">{{ card.title }}</h3>
                <p class="mt-1.5 text-sm leading-relaxed text-muted">{{ card.description }}</p>
              </div>
            </div>
          }
        </div>
      </div>
    </section>
  `,
  styles: `
    .bento {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 0.75rem;
    }
  `,
})
export class FeatureGridComponent {
  private icon(path: string): string {
    return `<svg viewBox="0 0 24 24" class="size-7" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${path}</svg>`;
  }

  readonly cards: BentoCard[] = [
    {
      title: 'AI Heatmaps',
      description: 'See which regions of the lesion influenced the risk estimate — transparency you can trust.',
      span: 'col-span-2 row-span-2',
      glow: 'rgba(0,122,255,0.10)',
      icon: this.icon('<rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="11" cy="11" r="4.5" stroke-dasharray="2 2"/><circle cx="11" cy="11" r="1.8"/>'),
    },
    {
      title: 'Fast Analysis',
      description: 'Results in under five seconds.',
      span: 'col-span-2',
      glow: 'rgba(90,200,250,0.14)',
      icon: this.icon('<path d="M13 2 4.5 13.5H11L9.5 22 19 10h-6.5L13 2z"/>'),
    },
    {
      title: 'Privacy First',
      description: 'Your images stay yours. End-to-end encryption, deletable anytime.',
      span: 'col-span-2 row-span-2',
      glow: 'rgba(0,122,255,0.08)',
      icon: this.icon('<path d="M12 2l7 4v6c0 4.5-3 8.5-7 10-4-1.5-7-5.5-7-10V6l7-4z"/><path d="M9 12l2 2 4-4"/>'),
    },
    {
      title: 'Secure Cloud Storage',
      description: 'AES-256 at rest, TLS in transit.',
      span: 'col-span-2',
      glow: 'rgba(90,200,250,0.12)',
      icon: this.icon('<path d="M7 18a4.5 4.5 0 1 1 .5-8.97 6 6 0 0 1 11.4 1.72A4 4 0 0 1 18 18H7z"/><path d="M12 12v4m0 0-1.6-1.6M12 16l1.6-1.6"/>'),
    },
    {
      title: 'Progress Tracking',
      description: 'Watch lesions change over weeks and months.',
      span: 'col-span-2',
      glow: 'rgba(90,200,250,0.10)',
      icon: this.icon('<path d="M3 20h18"/><path d="M5 20v-6l4-4 4 3 6-7v14"/>'),
    },
    {
      title: 'Compare Images',
      description: 'Side-by-side change detection between any two scans.',
      span: 'col-span-2',
      glow: 'rgba(90,200,250,0.12)',
      icon: this.icon('<rect x="3" y="5" width="8" height="14" rx="1.5"/><rect x="13" y="5" width="8" height="14" rx="1.5"/><path d="M7 9v6m10-6v6" stroke-dasharray="2 2"/>'),
    },
    {
      title: 'Medical Reports',
      description: 'Exportable PDF summaries for your dermatologist.',
      span: 'col-span-2 md:col-span-4 lg:col-span-2',
      glow: 'rgba(0,122,255,0.08)',
      icon: this.icon('<path d="M6 2h9l5 5v15H6V2z"/><path d="M15 2v5h5M9 13h6M9 17h6M9 9h2"/>'),
    },
  ];
}
