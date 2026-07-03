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
    <section class="section" aria-labelledby="stats-heading">
      <h2 id="stats-heading" class="sr-only">SkinAlert in numbers</h2>
      <div class="mx-auto max-w-7xl px-6">
        <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          @for (stat of stats; track stat.label; let i = $index) {
            <div
              appReveal
              mode="scale"
              [delay]="i * 0.12"
              class="glass glass-hover stat-card group relative overflow-hidden rounded-3xl p-8"
            >
              <div
                aria-hidden="true"
                class="absolute -top-12 -right-12 size-32 rounded-full bg-primary/10 blur-2xl transition-opacity duration-700 opacity-0 group-hover:opacity-100"
              ></div>
              <p class="text-5xl font-bold tracking-tight tabular-nums">
                <span>{{ stat.prefix }}</span
                ><span
                  class="counter text-gradient"
                  [attr.data-target]="stat.value"
                  [attr.data-decimals]="stat.decimals"
                  >0</span
                ><span class="text-primary">{{ stat.suffix }}</span>
              </p>
              <p class="mt-3 text-sm font-semibold text-white">{{ stat.label }}</p>
              <p class="mt-1 text-sm text-gray-500">{{ stat.detail }}</p>
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
    { value: 98, prefix: '', suffix: '%', decimals: 0, label: 'AI Accuracy', detail: 'On benchmark dermatology datasets' },
    { value: 500, prefix: '', suffix: 'K+', decimals: 0, label: 'Images Processed', detail: 'Analyzed securely in the cloud' },
    { value: 24, prefix: '', suffix: '/7', decimals: 0, label: 'Availability', detail: 'Anytime, on any device' },
    { value: 5, prefix: '<', suffix: ' sec', decimals: 0, label: 'Average Analysis Time', detail: 'From upload to risk estimate' },
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
