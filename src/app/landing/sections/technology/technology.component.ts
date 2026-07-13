import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ParallaxDirective } from '../../../shared/directives/parallax.directive';
import { RevealDirective } from '../../../shared/directives/reveal.directive';
import { SafeHtmlPipe } from '../../../shared/pipes/safe-html.pipe';

interface TechCard {
  title: string;
  description: string;
  icon: string;
}

interface ModelFact {
  value: string;
  label: string;
}

@Component({
  selector: 'app-technology',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ParallaxDirective, RevealDirective, SafeHtmlPipe],
  template: `
    <section id="technology" class="section bg-forest text-paper" aria-labelledby="tech-heading">
      <div class="relative mx-auto max-w-7xl px-6">
        <div class="flex flex-col justify-between gap-6 lg:flex-row lg:items-end" appParallax [speed]="0.15">
          <div>
            <p appReveal mode="fade" class="section-label text-paper/50">03 — Tehnologia</p>
            <h2 id="tech-heading" appReveal mode="words" [stagger]="0.05" class="mt-6 max-w-2xl text-4xl font-semibold tracking-tight text-paper sm:text-5xl">
              Cum analizăm fiecare imagine.
            </h2>
          </div>
          <p appReveal mode="fade" [delay]="0.2" class="max-w-md text-lg leading-relaxed text-paper/60">
            Fiecare analiză trece printr-un flux modern de vedere artificială,
            conceput în jurul standardelor de imagistică clinică.
          </p>
        </div>

        <div class="mt-14 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          @for (card of cards; track card.title; let i = $index) {
            <div
              appReveal
              mode="fade"
              [delay]="(i % 3) * 0.08"
              class="card-dark group rounded-2xl p-7"
            >
              <span
                class="grid size-12 place-items-center rounded-full bg-[#2997ff]/15 text-[#2997ff] transition-colors duration-300 group-hover:bg-accent group-hover:text-white"
                [innerHTML]="card.icon | safeHtml"
                aria-hidden="true"
              ></span>
              <h3 class="mt-8 text-lg font-semibold text-paper">{{ card.title }}</h3>
              <p class="mt-2.5 text-[0.95rem] leading-relaxed text-paper/55">{{ card.description }}</p>
            </div>
          }
        </div>

        <!-- Model facts: real numbers from the training pipeline -->
        <div class="mt-16 grid gap-x-8 gap-y-10 border-t border-paper/10 pt-10 sm:grid-cols-2 lg:grid-cols-4">
          @for (fact of facts; track fact.label; let i = $index) {
            <div appParallax [speed]="0.12 + (i % 2) * 0.1">
              <div appReveal mode="fade" [delay]="i * 0.06">
                <p class="text-3xl font-semibold tracking-tight text-[#2997ff] sm:text-4xl">{{ fact.value }}</p>
                <p class="mt-2 text-sm leading-relaxed text-paper/50">{{ fact.label }}</p>
              </div>
            </div>
          }
        </div>
      </div>

      <!-- Tech-stack marquee -->
      <div class="mt-16">
        <p class="px-6 text-center text-xs font-semibold uppercase tracking-[0.14em] text-paper/40">Construit cu</p>
        <div class="marquee mt-8" aria-label="Tehnologii folosite: {{ stack.join(', ') }}">
          <div class="marquee-track">
            @for (copy of [0, 1]; track copy) {
              <div class="flex shrink-0 items-center" [attr.aria-hidden]="copy === 1">
                @for (tech of stack; track tech) {
                  <span class="whitespace-nowrap px-7 text-3xl font-semibold tracking-tight text-paper/25 transition-colors duration-300 hover:text-paper sm:text-4xl">
                    {{ tech }}
                  </span>
                  <span class="size-1.5 shrink-0 rounded-full bg-[#2997ff]/60" aria-hidden="true"></span>
                }
              </div>
            }
          </div>
        </div>
      </div>
    </section>
  `,
})
export class TechnologyComponent {
  /** Real numbers from the ml/ training pipeline (see ml/README.md). */
  readonly facts: ModelFact[] = [
    { value: '2× EfficientNet-B3', label: 'Ansamblu de rețele convoluționale, medie de logit-uri cu Test-Time Augmentation ×4' },
    { value: '15.700+', label: 'Imagini de antrenament cross-domeniu din ISIC Archive — dermatoscopice și clinice' },
    { value: 'T = 0.79', label: 'Temperature scaling: probabilitățile sunt calibrate să fie oneste, nu umflate' },
    { value: 'AUC 0.921', label: 'Pe poze făcute cu telefonul, față de 0.993 pe imagini dermatoscopice' },
  ];

  readonly stack: string[] = [
    'PyTorch',
    'EfficientNet-B3',
    'FastAPI',
    'TorchVision',
    'scikit-learn',
    'ISIC Archive',
    'Angular',
    'TypeScript',
    'Three.js',
    'GSAP',
    'Tailwind CSS',
    'Lenis',
  ];

  readonly cards: TechCard[] = [
    {
      title: 'Vedere Artificială',
      description: 'Analiză la înaltă rezoluție care inspectează leziunile așa cum o face un ochi antrenat pentru asimetrie și margini neregulate.',
      icon: `<svg viewBox="0 0 24 24" class="size-5" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3.5-6.5 10-6.5S22 12 22 12s-3.5 6.5-10 6.5S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>`,
    },
    {
      title: 'Învățare Profundă',
      description: 'Rețele neurale multi-stratificate, distilate din milioane de parametri în predicții rapide și sigure.',
      icon: `<svg viewBox="0 0 24 24" class="size-5" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="5" cy="12" r="1.6"/><circle cx="12" cy="5" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="12" cy="19" r="1.6"/><circle cx="19" cy="12" r="1.6"/><path d="M6.4 11.2 10.5 6M6.4 12h4m-4 .8L10.5 18M13.5 6l4.1 5.2M13.6 12h4m-4.1.8 4 5.2"/></svg>`,
    },
    {
      title: 'Clasificare CNN',
      description: 'Arhitecturi convoluționale optimizate pentru modele dermatoscopice, clasificând leziunile conform categoriilor clinice.',
      icon: `<svg viewBox="0 0 24 24" class="size-5" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>`,
    },
    {
      title: 'Procesare Medicală',
      description: 'Echilibrarea culorilor, eliminarea artefactelor și segmentarea leziunii pregătesc fiecare fotografie pentru o analiză uniformă.',
      icon: `<svg viewBox="0 0 24 24" class="size-5" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 15l4.5-4.5L12 15l3.5-3.5L21 17"/><circle cx="8.5" cy="8.5" r="1.5"/></svg>`,
    },
    {
      title: 'AI Explicabil (XAI)',
      description: 'Hărțile termice de atenție indică fix zonele care au determinat estimarea riscului — fără cutii negre.',
      icon: `<svg viewBox="0 0 24 24" class="size-5" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.35-4.35"/><path d="M8.5 11h5M11 8.5v5"/></svg>`,
    },
    {
      title: 'Date Clinice Verificate',
      description: 'Antrenat și validat pe seturi de date dermatologice adnotate de experți, acoperind tonuri de piele diverse.',
      icon: `<svg viewBox="0 0 24 24" class="size-5" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="5.5" rx="8" ry="2.8"/><path d="M4 5.5v6c0 1.55 3.58 2.8 8 2.8s8-1.25 8-2.8v-6"/><path d="M4 11.5v6c0 1.55 3.58 2.8 8 2.8s8-1.25 8-2.8v-6"/></svg>`,
    },
  ];
}
