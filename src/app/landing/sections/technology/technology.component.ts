import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  NgZone,
  OnDestroy,
  inject,
  viewChild,
} from '@angular/core';
import { gsap } from '../../../core/gsap';
import { MotionService } from '../../../core/motion.service';
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
    <section id="technology" class="section overflow-hidden bg-forest text-paper" aria-labelledby="tech-heading">
      <div class="relative mx-auto max-w-7xl px-6">
        <div class="flex flex-col justify-between gap-6 lg:flex-row lg:items-end" appParallax [speed]="0.15">
          <div>
            <p appReveal mode="fade" class="section-label text-paper/50">03 — Tehnologia</p>
            <h2 id="tech-heading" appReveal mode="words" [stagger]="0.05" class="mt-6 max-w-2xl text-4xl font-semibold tracking-tight text-paper sm:text-5xl lg:text-6xl">
              Cum analizăm fiecare imagine.
            </h2>
          </div>
          <p appReveal mode="fade" [delay]="0.2" class="max-w-md text-xl leading-relaxed text-paper/60">
            Fiecare analiză trece printr-un flux modern de vedere artificială,
            conceput în jurul standardelor de imagistică clinică.
          </p>
        </div>
      </div>

      <!-- Horizontal Scroll Track -->
      <div #pinWrapper class="w-full pt-20 pb-10">
        <div #scrollTrack class="flex gap-6 px-6 sm:px-12 w-max items-stretch">
          @for (card of cards; track card.title; let i = $index) {
            <div
              class="relative overflow-hidden group flex flex-col justify-between rounded-[40px] p-8 sm:p-12 w-[85vw] sm:w-[420px] shrink-0 border border-paper/10 bg-paper/5 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)] backdrop-blur-2xl transition-all duration-500 hover:bg-paper/10 hover:border-paper/20 hover:-translate-y-2"
            >
              <!-- Ambient glow behind icon -->
              <div class="absolute -top-20 -left-20 size-40 rounded-full bg-[#2997ff]/20 blur-3xl transition-opacity group-hover:opacity-100 opacity-50"></div>
              
              <span
                class="relative grid size-16 shrink-0 place-items-center rounded-full bg-[#2997ff]/20 text-[#2997ff] transition-all duration-500 group-hover:scale-110 group-hover:bg-[#2997ff] group-hover:text-white group-hover:shadow-[0_0_20px_rgba(41,151,255,0.4)]"
                [innerHTML]="card.icon | safeHtml"
                aria-hidden="true"
              ></span>
              <div class="relative mt-20">
                <h3 class="text-3xl font-bold tracking-tight text-paper">{{ card.title }}</h3>
                <p class="mt-4 text-xl leading-relaxed text-paper/60">{{ card.description }}</p>
              </div>
            </div>
          }
        </div>
      </div>

      <div class="relative mx-auto max-w-7xl px-6 mt-10">
        <!-- Model facts: real numbers from the training pipeline -->
        <div class="grid gap-x-8 gap-y-10 border-t border-paper/10 pt-16 sm:grid-cols-2 lg:grid-cols-4">
          @for (fact of facts; track fact.label; let i = $index) {
            <div appParallax [speed]="0.12 + (i % 2) * 0.1">
              <div appReveal mode="fade" [delay]="i * 0.06">
                <p class="text-4xl font-bold tracking-tight text-[#2997ff] sm:text-5xl">{{ fact.value }}</p>
                <p class="mt-3 text-lg leading-relaxed text-paper/50">{{ fact.label }}</p>
              </div>
            </div>
          }
        </div>

        <!-- Tech-stack marquee -->
        <div class="mt-24">
          <p class="text-center text-sm font-semibold uppercase tracking-[0.2em] text-paper/40">Construit cu</p>
          <div class="marquee mt-10" aria-label="Tehnologii folosite: {{ stack.join(', ') }}">
            <div class="marquee-track">
              @for (copy of [0, 1]; track copy) {
                <div class="flex shrink-0 items-center" [attr.aria-hidden]="copy === 1">
                  @for (tech of stack; track tech) {
                    <span class="whitespace-nowrap px-8 text-4xl font-bold tracking-tight text-paper/20 transition-colors duration-500 hover:text-paper sm:text-5xl">
                      {{ tech }}
                    </span>
                    <span class="size-2 shrink-0 rounded-full bg-[#2997ff]/60" aria-hidden="true"></span>
                  }
                </div>
              }
            </div>
          </div>
        </div>
      </div>
    </section>
  `,
})
export class TechnologyComponent implements AfterViewInit, OnDestroy {
  private readonly zone = inject(NgZone);
  private readonly motion = inject(MotionService);

  private readonly pinWrapper = viewChild.required<ElementRef<HTMLElement>>('pinWrapper');
  private readonly scrollTrack = viewChild.required<ElementRef<HTMLElement>>('scrollTrack');

  private timeline?: gsap.core.Timeline;

  /** Real numbers from the ml/ training pipeline (see ml/README.md). */
  readonly facts: ModelFact[] = [
    { value: '2× EfficientNet', label: 'Ansamblu de rețele convoluționale, medie de logit-uri cu Test-Time Augmentation' },
    { value: '15.700+', label: 'Imagini de antrenament cross-domeniu din ISIC Archive — dermatoscopice și clinice' },
    { value: 'T = 0.79', label: 'Temperature scaling: probabilitățile sunt calibrate să fie oneste, nu umflate' },
    { value: 'AUC 0.92', label: 'Precizie ridicată pe poze făcute cu telefonul, față de 0.99 pe imagini dermatoscopice' },
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
      title: 'Ochi de expert',
      description: 'Aplicația se uită la poză la fel cum ar face-o un doctor cu lupă, căutând margini strâmbe sau culori anormale.',
      icon: `<svg viewBox="0 0 24 24" class="size-6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3.5-6.5 10-6.5S22 12 22 12s-3.5 6.5-10 6.5S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>`,
    },
    {
      title: 'Zeci de mii de cazuri',
      description: 'Tehnologia a "învățat" din mii de poze verificate de medici, așa că știe exact la ce detalii să fie atentă.',
      icon: `<svg viewBox="0 0 24 24" class="size-6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="5" cy="12" r="1.6"/><circle cx="12" cy="5" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="12" cy="19" r="1.6"/><circle cx="19" cy="12" r="1.6"/><path d="M6.4 11.2 10.5 6M6.4 12h4m-4 .8L10.5 18M13.5 6l4.1 5.2M13.6 12h4m-4.1.8 4 5.2"/></svg>`,
    },
    {
      title: 'Găsește tiparul periculos',
      description: 'Folosim cele mai noi sisteme de recunoaștere a imaginilor pentru a compara forma aluniței tale cu forme periculoase.',
      icon: `<svg viewBox="0 0 24 24" class="size-6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>`,
    },
    {
      title: 'Curăță poza pentru claritate',
      description: 'Aplicația scapă singură de umbre sau reflexii din poză, astfel încât alunița să se vadă perfect curat.',
      icon: `<svg viewBox="0 0 24 24" class="size-6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 15l4.5-4.5L12 15l3.5-3.5L21 17"/><circle cx="8.5" cy="8.5" r="1.5"/></svg>`,
    },
    {
      title: 'Îți explicăm de ce',
      description: 'Nu primești doar un rezultat la întâmplare. Îți colorăm exact zona din poză care ne face să credem că e o problemă.',
      icon: `<svg viewBox="0 0 24 24" class="size-6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.35-4.35"/><path d="M8.5 11h5M11 8.5v5"/></svg>`,
    },
    {
      title: 'Informații de la doctori',
      description: 'Tot sistemul este creat și verificat doar pe baza datelor reale confirmate de dermatologi din întreaga lume.',
      icon: `<svg viewBox="0 0 24 24" class="size-6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="5.5" rx="8" ry="2.8"/><path d="M4 5.5v6c0 1.55 3.58 2.8 8 2.8s8-1.25 8-2.8v-6"/><path d="M4 11.5v6c0 1.55 3.58 2.8 8 2.8s8-1.25 8-2.8v-6"/></svg>`,
    },
  ];

  ngAfterViewInit(): void {
    if (this.motion.reducedMotion()) {
      return;
    }

    this.zone.runOutsideAngular(() => {
      const track = this.scrollTrack().nativeElement;
      const wrapper = this.pinWrapper().nativeElement;

      const getScrollAmount = () => {
        const trackWidth = track.scrollWidth;
        const viewportWidth = window.innerWidth;
        // The distance to translate: track width minus viewport width plus some padding
        return Math.max(0, trackWidth - viewportWidth + 64);
      };

      this.timeline = gsap.timeline({
        scrollTrigger: {
          trigger: wrapper,
          pin: true,
          // Start pinning when the element hits a comfortable spot below the header
          start: 'center center',
          // The duration of the scroll (how long it stays pinned)
          end: () => `+=${getScrollAmount()}`,
          scrub: 1, // 1 second smoothing
          invalidateOnRefresh: true,
          anticipatePin: 1, // Prevents sudden jumps during pin
        },
      });

      this.timeline.to(track, {
        x: () => -getScrollAmount(),
        ease: 'none',
      });
    });
  }

  ngOnDestroy(): void {
    this.timeline?.scrollTrigger?.kill();
    this.timeline?.kill();
  }
}
