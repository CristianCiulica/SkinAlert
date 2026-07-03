import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RevealDirective } from '../../../shared/directives/reveal.directive';
import { TiltDirective } from '../../../shared/directives/tilt.directive';
import { SafeHtmlPipe } from '../../../shared/pipes/safe-html.pipe';

interface TechCard {
  title: string;
  description: string;
  icon: string;
  accent: string;
}

@Component({
  selector: 'app-technology',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RevealDirective, TiltDirective, SafeHtmlPipe],
  template: `
    <section id="technology" class="section" aria-labelledby="tech-heading">
      <div aria-hidden="true" class="pointer-events-none absolute inset-0 overflow-hidden">
        <div class="absolute top-1/4 right-0 h-[30rem] w-[30rem] translate-x-1/2 rounded-full bg-secondary/8 blur-[140px]"></div>
      </div>

      <div class="relative mx-auto max-w-7xl px-6">
        <p appReveal mode="fade" class="section-label">AI Technology</p>
        <h2 id="tech-heading" appReveal mode="words" [stagger]="0.05" class="mt-6 max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl">
          Research-grade intelligence, built for your skin.
        </h2>
        <p appReveal mode="fade" [delay]="0.2" class="mt-6 max-w-2xl text-lg text-gray-400">
          Every analysis runs through a modern computer-vision pipeline designed
          around clinical imaging practice.
        </p>

        <div class="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          @for (card of cards; track card.title; let i = $index) {
            <div
              appReveal
              mode="fade"
              [delay]="(i % 3) * 0.1"
              appTilt
              [strength]="5"
              class="glass glass-hover group rounded-3xl p-8"
            >
              <span
                class="tech-icon grid size-14 place-items-center rounded-2xl border transition-all duration-500 group-hover:scale-110 group-hover:rotate-3"
                [style.borderColor]="card.accent + '4d'"
                [style.background]="card.accent + '14'"
                [style.color]="card.accent"
                [style.boxShadow]="'0 0 0px ' + card.accent"
                [innerHTML]="card.icon | safeHtml"
                aria-hidden="true"
              ></span>
              <h3 class="mt-6 text-lg font-semibold" data-tilt-layer>{{ card.title }}</h3>
              <p class="mt-2.5 leading-relaxed text-gray-400">{{ card.description }}</p>
            </div>
          }
        </div>
      </div>
    </section>
  `,
  styles: `
    .group:hover .tech-icon {
      box-shadow: 0 0 32px -4px currentColor !important;
    }
    /* innerHTML SVG escapes emulated encapsulation, so pierce for .pulse */
    :host ::ng-deep .tech-icon svg .pulse {
      transform-origin: center;
      animation: iconPulse 2.6s ease-in-out infinite;
    }
    @keyframes iconPulse {
      0%, 100% { opacity: 0.4; transform: scale(0.92); }
      50% { opacity: 1; transform: scale(1.06); }
    }
    @media (prefers-reduced-motion: reduce) {
      :host ::ng-deep .tech-icon svg .pulse { animation: none; }
    }
  `,
})
export class TechnologyComponent {
  readonly cards: TechCard[] = [
    {
      title: 'Computer Vision',
      accent: '#4fd1c5',
      description: 'High-resolution image understanding that inspects lesions the way a trained eye scans for asymmetry and irregular borders.',
      icon: `<svg viewBox="0 0 24 24" class="size-7" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3.5-6.5 10-6.5S22 12 22 12s-3.5 6.5-10 6.5S2 12 2 12z"/><circle class="pulse" cx="12" cy="12" r="3"/></svg>`,
    },
    {
      title: 'Deep Learning',
      accent: '#60a5fa',
      description: 'Multi-layer neural networks distilled from millions of parameters into fast, reliable predictions.',
      icon: `<svg viewBox="0 0 24 24" class="size-7" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle class="pulse" cx="5" cy="12" r="1.6"/><circle cx="12" cy="5" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="12" cy="19" r="1.6"/><circle class="pulse" cx="19" cy="12" r="1.6"/><path d="M6.4 11.2 10.5 6M6.4 12h4m-4 .8L10.5 18M13.5 6l4.1 5.2M13.6 12h4m-4.1.8 4 5.2"/></svg>`,
    },
    {
      title: 'CNN Classification',
      accent: '#4fd1c5',
      description: 'Convolutional architectures tuned for dermoscopic patterns, classifying lesions across clinically relevant categories.',
      icon: `<svg viewBox="0 0 24 24" class="size-7" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect class="pulse" x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>`,
    },
    {
      title: 'Medical Image Processing',
      accent: '#60a5fa',
      description: 'Color constancy, artifact removal and lesion segmentation prepare every photo for consistent analysis.',
      icon: `<svg viewBox="0 0 24 24" class="size-7" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="16" rx="2"/><path class="pulse" d="M3 15l4.5-4.5L12 15l3.5-3.5L21 17"/><circle cx="8.5" cy="8.5" r="1.5"/></svg>`,
    },
    {
      title: 'Explainable AI',
      accent: '#22c55e',
      description: 'Attention heatmaps show exactly which regions drove the risk estimate — no black boxes.',
      icon: `<svg viewBox="0 0 24 24" class="size-7" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.35-4.35"/><path class="pulse" d="M8.5 11h5M11 8.5v5"/></svg>`,
    },
    {
      title: 'Clinical Dataset Training',
      accent: '#f59e0b',
      description: 'Trained and validated on curated, expert-annotated dermatology datasets spanning diverse skin tones.',
      icon: `<svg viewBox="0 0 24 24" class="size-7" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="5.5" rx="8" ry="2.8"/><path d="M4 5.5v6c0 1.55 3.58 2.8 8 2.8s8-1.25 8-2.8v-6"/><path class="pulse" d="M4 11.5v6c0 1.55 3.58 2.8 8 2.8s8-1.25 8-2.8v-6"/></svg>`,
    },
  ];
}
