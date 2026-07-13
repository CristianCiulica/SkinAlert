import { ChangeDetectionStrategy, Component, ElementRef, AfterViewInit, ViewChildren, QueryList, ViewChild, OnDestroy } from '@angular/core';
import { SafeHtmlPipe } from '../../../shared/pipes/safe-html.pipe';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface BentoCard {
  title: string;
  description: string;
  icon: string;
}

@Component({
  selector: 'app-feature-grid',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SafeHtmlPipe],
  template: `
    <section id="features" class="section bg-base overflow-hidden" aria-labelledby="grid-heading">
      <div class="mx-auto max-w-7xl px-6">
        <div class="mb-14">
          <p class="section-label">04 — Funcționalități</p>
          <h2 id="grid-heading" class="mt-6 max-w-3xl text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
            Instrumente clare, gândite pentru prevenție.
          </h2>
        </div>

        <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" style="perspective: 1000px;">
          @for (card of cards; track card.title; let i = $index) {
            <div #featureCard class="flex will-change-transform">
              <div
                class="card group relative flex min-h-[14rem] flex-1 flex-col justify-between rounded-2xl p-7 bg-white/40 shadow-sm border border-ink/5 backdrop-blur-md"
              >
                <span
                  class="grid size-12 place-items-center rounded-full bg-sage text-accent transition-colors duration-300 group-hover:bg-accent group-hover:text-white"
                  [innerHTML]="card.icon | safeHtml"
                  aria-hidden="true"
                ></span>
                <div class="mt-8">
                  <h3 class="text-xl font-semibold tracking-tight text-ink">{{ card.title }}</h3>
                  <p class="mt-2 text-[0.95rem] leading-relaxed text-ink/60">{{ card.description }}</p>
                </div>
              </div>
            </div>
          }
        </div>
      </div>
    </section>
  `,
})
export class FeatureGridComponent implements AfterViewInit, OnDestroy {
  @ViewChildren('featureCard') featureCards!: QueryList<ElementRef<HTMLElement>>;

  private triggers: ScrollTrigger[] = [];

  ngAfterViewInit() {
    const cards = this.featureCards.map(c => c.nativeElement);

    cards.forEach((card, index) => {
      // Premium initial state: pushed down, scaled down slightly, rotated back, blurred
      gsap.set(card, {
        y: 120,
        opacity: 0,
        scale: 0.9,
        rotationX: 15,
        filter: 'blur(12px)'
      });

      // Individual scroll-linked animation for organic waterfall effect
      const trigger = ScrollTrigger.create({
        trigger: card,
        start: 'top 95%', // Begin when card is just entering viewport
        end: 'top 65%',   // Complete when card is comfortably in view
        scrub: 1.5,       // High smoothing for premium "Apple-like" feel
        animation: gsap.to(card, {
          y: 0,
          opacity: 1,
          scale: 1,
          rotationX: 0,
          filter: 'blur(0px)',
          ease: 'power3.out'
        })
      });

      this.triggers.push(trigger);
    });
  }

  ngOnDestroy() {
    this.triggers.forEach(t => t.kill());
  }

  private icon(path: string): string {
    return `<svg viewBox="0 0 24 24" class="size-5" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${path}</svg>`;
  }

  readonly cards: BentoCard[] = [
    {
      title: 'Hărți Termice AI',
      description: 'Vezi exact regiunile care au influențat scorul de risc — inteligență artificială explicabilă, nu o cutie neagră.',
      icon: this.icon('<rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="11" cy="11" r="4.5" stroke-dasharray="2 2"/><circle cx="11" cy="11" r="1.8"/>'),
    },
    {
      title: 'Rezultat Instant',
      description: 'De la fotografie la estimare de risc în mai puțin de cinci secunde.',
      icon: this.icon('<path d="M13 2 4.5 13.5H11L9.5 22 19 10h-6.5L13 2z"/>'),
    },
    {
      title: 'Intimitate Absolută',
      description: 'Fotografiile sunt criptate, nu sunt vândute niciodată și pot fi șterse definitiv oricând.',
      icon: this.icon('<path d="M12 2l7 4v6c0 4.5-3 8.5-7 10-4-1.5-7-5.5-7-10V6l7-4z"/><path d="M9 12l2 2 4-4"/>'),
    },
    {
      title: 'Urmărire Evoluție',
      description: 'Istoric fotografic complet — observă modificările leziunilor de la o scanare la alta.',
      icon: this.icon('<path d="M3 20h18"/><path d="M5 20v-6l4-4 4 3 6-7v14"/>'),
    },
    {
      title: 'Comparație Vizuală',
      description: 'Pune două scanări față în față și vezi imediat ce s-a schimbat.',
      icon: this.icon('<rect x="3" y="5" width="8" height="14" rx="1.5"/><rect x="13" y="5" width="8" height="14" rx="1.5"/><path d="M7 9v6m10-6v6" stroke-dasharray="2 2"/>'),
    },
    {
      title: 'Rapoarte Medicale',
      description: 'Exportă un raport clar, pregătit pentru următoarea vizită la dermatolog.',
      icon: this.icon('<path d="M6 2h9l5 5v15H6V2z"/><path d="M15 2v5h5M9 13h6M9 17h6M9 9h2"/>'),
    },
  ];
}
