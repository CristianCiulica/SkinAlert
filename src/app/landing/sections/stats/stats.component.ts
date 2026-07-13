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
import { ParallaxDirective } from '../../../shared/directives/parallax.directive';
import { RevealDirective } from '../../../shared/directives/reveal.directive';

interface Stat {
  value: number;
  prefix: string;
  suffix: string;
  decimals: number;
  label: string;
  detail: string;
}

@Component({
  selector: 'app-stats',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ParallaxDirective, RevealDirective],
  template: `
    <section class="bg-base pb-[clamp(4.5rem,8vw,7.5rem)]" aria-labelledby="stats-heading">
      <h2 id="stats-heading" class="sr-only">Performanță</h2>
      <div class="mx-auto max-w-7xl px-6">
        <div class="grid gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
          @for (stat of stats; track stat.label; let i = $index) {
            <div appParallax [speed]="0.1 + (i % 2) * 0.15">
              <div appReveal mode="fade" [delay]="i * 0.08" class="border-t border-ink/15 pt-6">
                <p class="text-5xl font-semibold tracking-tight tabular-nums text-ink sm:text-6xl">
                  <span class="text-ink/40">{{ stat.prefix }}</span
                  ><span
                    class="counter"
                    [attr.data-target]="stat.value"
                    [attr.data-decimals]="stat.decimals"
                    >0</span
                  >{{ stat.suffix }}
                </p>
                <p class="mt-4 text-sm font-semibold uppercase tracking-[0.12em] text-ink">{{ stat.label }}</p>
                <p class="mt-1 text-sm text-ink/50">{{ stat.detail }}</p>
              </div>
            </div>
          }
        </div>
      </div>
    </section>
  `,
})
export class StatsComponent implements AfterViewInit, OnDestroy {
  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly zone = inject(NgZone);
  private readonly motion = inject(MotionService);
  private triggers: ScrollTrigger[] = [];

  /** Real metrics from ml/README.md — measured, not marketing. */
  readonly stats: Stat[] = [
    { value: 0.968, prefix: '', suffix: '', decimals: 3, label: 'AUC pe test', detail: 'măsurat pe 2.359 imagini nevăzute' },
    { value: 94.2, prefix: '', suffix: '%', decimals: 1, label: 'Sensibilitate', detail: 'pragul e ales să rateze cât mai puține leziuni maligne' },
    { value: 87.2, prefix: '', suffix: '%', decimals: 1, label: 'Specificitate', detail: 'estimările pot greși, de aceea te îndrumăm la medic' },
    { value: 5, prefix: '<', suffix: 's', decimals: 0, label: 'Timp de Răspuns', detail: 'de la fotografie la rezultat' },
  ];

  ngAfterViewInit(): void {
    this.zone.runOutsideAngular(() => {
      const counters = this.el.nativeElement.querySelectorAll<HTMLElement>('.counter');
      counters.forEach((counter) => {
        const target = Number(counter.dataset['target']);
        const decimals = Number(counter.dataset['decimals'] ?? 0);

        if (this.motion.reducedMotion()) {
          counter.textContent = target.toFixed(decimals);
          return;
        }

        const state = { value: 0 };
        const tween = gsap.to(state, {
          value: target,
          duration: 2,
          ease: 'power2.out',
          paused: true,
          onUpdate: () => (counter.textContent = state.value.toFixed(decimals)),
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
