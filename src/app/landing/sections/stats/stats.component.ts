import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  NgZone,
  OnDestroy,
  inject,
} from '@angular/core';
import { gsap, ScrollTrigger } from '../../../core/gsap';
import { MotionService } from '../../../core/motion.service';
import { RevealDirective } from '../../../shared/directives/reveal.directive';

interface Stat {
  value: number;
  prefix: string;
  suffix: string;
  decimals: number;
  label: string;
  detail: string;
}

/**
 * "03 — Precizie" — the numbers, measured not promised. Counters ride a
 * GSAP tween triggered once per stat; each figure gets one plain-language
 * sentence so a non-medical reader knows what it means.
 */
@Component({
  selector: 'app-stats',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RevealDirective],
  template: `
    <section id="accuracy" class="section bg-base" aria-labelledby="stats-heading">
      <div class="container-edit">
        <div class="rule flex items-baseline justify-between pt-6">
          <p appReveal mode="fade" class="index-label">03</p>
          <p appReveal mode="fade" class="index-label">Precizie</p>
        </div>

        <h2
          id="stats-heading"
          appReveal
          mode="words"
          [stagger]="0.04"
          class="headline mt-16 max-w-3xl text-[clamp(2.5rem,6vw,4.5rem)] text-ink"
        >
          Cât este modelul de precis?
        </h2>

        <div class="mt-20 grid gap-x-10 gap-y-14 sm:grid-cols-2 lg:grid-cols-4">
          @for (stat of stats; track stat.label; let i = $index) {
            <div appReveal mode="fade" [delay]="i * 0.08" class="rule pt-6">
              <p class="text-5xl font-semibold tracking-tighter tabular-nums text-ink sm:text-6xl">
                <span class="text-ink/30">{{ stat.prefix }}</span
                ><span
                  class="counter"
                  [attr.data-target]="stat.value"
                  [attr.data-decimals]="stat.decimals"
                  >0</span
                >{{ stat.suffix }}
              </p>
              <p class="mt-5 text-base font-semibold text-ink">{{ stat.label }}</p>
              <p class="mt-2 text-sm leading-relaxed text-ink/50">{{ stat.detail }}</p>
            </div>
          }
        </div>

        <p appReveal mode="fade" class="mt-14 text-sm text-ink/40">
          Rezultate măsurate pe 2.359 de imagini de test pe care modelul nu le mai văzuse.
        </p>
      </div>
    </section>
  `,
})
export class StatsComponent implements AfterViewInit, OnDestroy {
  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly zone = inject(NgZone);
  private readonly motion = inject(MotionService);
  private triggers: ScrollTrigger[] = [];

  /** Real metrics from ml/README.md — explained simply in Romanian */
  readonly stats: Stat[] = [
    {
      value: 15700,
      prefix: '',
      suffix: '+',
      decimals: 0,
      label: 'Imagini de antrenament',
      detail:
        'Dermatoscopice și clinice, din ISIC Archive — cea mai mare arhivă publică de leziuni cutanate.',
    },
    {
      value: 94.2,
      prefix: '',
      suffix: '%',
      decimals: 1,
      label: 'Rată de detectare',
      detail: 'Din leziunile cu adevărat periculoase, atâtea sunt semnalate corect drept suspecte.',
    },
    {
      value: 0.968,
      prefix: '',
      suffix: '',
      decimals: 3,
      label: 'Scor AUC',
      detail: 'Cât de bine separă modelul benign de suspect — 1.000 ar fi perfect.',
    },
    {
      value: 2,
      prefix: '<',
      suffix: 's',
      decimals: 0,
      label: 'Timp de răspuns',
      detail: 'De la încărcarea fotografiei până la rezultat.',
    },
  ];

  ngAfterViewInit(): void {
    this.zone.runOutsideAngular(() => {
      const counters = this.el.nativeElement.querySelectorAll<HTMLElement>('.counter');
      counters.forEach((counter) => {
        const target = Number(counter.dataset['target']);
        const decimals = Number(counter.dataset['decimals'] ?? 0);

        const format = (v: number): string =>
          v.toLocaleString('ro-RO', {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals,
          });

        if (this.motion.reducedMotion()) {
          counter.textContent = format(target);
          return;
        }

        const state = { value: 0 };
        const tween = gsap.to(state, {
          value: target,
          duration: 2,
          ease: 'power2.out',
          paused: true,
          onUpdate: () => (counter.textContent = format(state.value)),
        });

        this.triggers.push(
          ScrollTrigger.create({
            trigger: counter,
            start: 'top 85%',
            once: true,
            onEnter: () => tween.play(),
          }),
        );
      });
    });
  }

  ngOnDestroy(): void {
    this.triggers.forEach((t) => t.kill());
  }
}
