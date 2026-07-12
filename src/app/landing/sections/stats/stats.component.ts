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

@Component({
  selector: 'app-stats',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RevealDirective],
  template: `
    <section class="section bg-surface" aria-labelledby="stats-heading">
      <h2 id="stats-heading" class="sr-only">Performanță absolută.</h2>
      <div class="mx-auto max-w-7xl px-6">
        <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          @for (stat of stats; track stat.label; let i = $index) {
            <div
              appReveal
              mode="scale"
              [delay]="i * 0.12"
              class="card group relative overflow-hidden rounded-[2rem] p-8 text-center flex flex-col items-center justify-center transition-transform hover:scale-[1.02]"
            >
              <p class="text-[4rem] font-bold tracking-tighter tabular-nums leading-none">
                <span class="text-black/50">{{ stat.prefix }}</span
                ><span
                  class="counter text-gradient-titanium"
                  [attr.data-target]="stat.value"
                  [attr.data-decimals]="stat.decimals"
                  >0</span
                ><span class="text-gradient-titanium">{{ stat.suffix }}</span>
              </p>
              <p class="mt-4 text-lg font-bold text-black">{{ stat.label }}</p>
              <p class="mt-1 text-sm text-black/60">{{ stat.detail }}</p>
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

  readonly stats: Stat[] = [
    { value: 98, prefix: '', suffix: '%', decimals: 0, label: 'Acuratețe AI', detail: '' },
    { value: 500, prefix: '', suffix: 'K+', decimals: 0, label: 'Analize Efectuate', detail: '' },
    { value: 24, prefix: '', suffix: '/7', decimals: 0, label: 'Disponibilitate', detail: '' },
    { value: 5, prefix: '<', suffix: 's', decimals: 0, label: 'Timp de Răspuns', detail: '' },
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
