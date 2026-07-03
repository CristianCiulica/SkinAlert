import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  NgZone,
  OnDestroy,
  inject,
} from '@angular/core';
import { gsap } from '../../../core/gsap';
import { MotionService } from '../../../core/motion.service';
import { RevealDirective } from '../../../shared/directives/reveal.directive';
import { TiltDirective } from '../../../shared/directives/tilt.directive';

interface Testimonial {
  quote: string;
  name: string;
  role: string;
  initials: string;
}

@Component({
  selector: 'app-testimonials',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RevealDirective, TiltDirective],
  template: `
    <section class="section" aria-labelledby="testimonials-heading">
      <div class="mx-auto max-w-7xl px-6">
        <p appReveal mode="fade" class="section-label">Trusted voices</p>
        <h2 id="testimonials-heading" appReveal mode="words" [stagger]="0.05" class="mt-6 max-w-2xl text-4xl font-bold tracking-tight sm:text-5xl">
          What people say about SkinAlert.
        </h2>

        <div class="mt-16 grid gap-6 md:grid-cols-3">
          @for (t of testimonials; track t.name; let i = $index) {
            <figure
              appReveal
              mode="fade"
              [delay]="i * 0.15"
              appTilt
              [strength]="4"
              class="float-card glass glass-hover flex flex-col rounded-3xl p-8"
              [style.animationDelay]="i * 1.3 + 's'"
            >
              <svg viewBox="0 0 24 24" class="size-8 text-primary/40" fill="currentColor" aria-hidden="true">
                <path d="M10 8v6a4 4 0 0 1-4 4H5a1 1 0 0 1 0-2h1a2 2 0 0 0 2-2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2zm11 0v6a4 4 0 0 1-4 4h-1a1 1 0 0 1 0-2h1a2 2 0 0 0 2-2h-3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2z"/>
              </svg>
              <blockquote class="mt-5 flex-1 leading-relaxed text-ink/80">{{ t.quote }}</blockquote>
              <figcaption class="mt-8 flex items-center gap-4 border-t border-line pt-6">
                <span class="grid size-11 place-items-center rounded-full bg-gradient-to-br from-primary to-secondary text-sm font-bold text-white">{{ t.initials }}</span>
                <div>
                  <p class="text-sm font-semibold">{{ t.name }}</p>
                  <p class="text-xs text-muted">{{ t.role }}</p>
                </div>
              </figcaption>
            </figure>
          }
        </div>
      </div>
    </section>
  `,
})
export class TestimonialsComponent implements AfterViewInit, OnDestroy {
  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly zone = inject(NgZone);
  private readonly motion = inject(MotionService);
  private tweens: gsap.core.Tween[] = [];

  readonly testimonials: Testimonial[] = [
    {
      quote: 'I noticed a mole changing and SkinAlert flagged it as worth checking. My dermatologist confirmed it needed removal. That five-second scan genuinely mattered.',
      name: 'Maya R.',
      role: 'Early user, Barcelona',
      initials: 'MR',
    },
    {
      quote: 'As a GP, I appreciate that SkinAlert is honest about what it is: a triage aid that pushes people toward professional care instead of away from it.',
      name: 'Dr. Andrei Popescu',
      role: 'General Practitioner',
      initials: 'AP',
    },
    {
      quote: 'The heatmaps are what sold me. You can actually see why the model is concerned, instead of trusting a mystery number.',
      name: 'Jonas K.',
      role: 'ML Engineer & melanoma survivor',
      initials: 'JK',
    },
  ];

  ngAfterViewInit(): void {
    if (this.motion.reducedMotion()) {
      return;
    }
    // Soft perpetual float, staggered per card.
    this.zone.runOutsideAngular(() => {
      this.el.nativeElement.querySelectorAll<HTMLElement>('.float-card').forEach((card, i) => {
        this.tweens.push(
          gsap.to(card, {
            y: i % 2 === 0 ? -10 : 10,
            duration: 3.6 + i * 0.5,
            ease: 'sine.inOut',
            yoyo: true,
            repeat: -1,
            delay: i * 0.6,
          }),
        );
      });
    });
  }

  ngOnDestroy(): void {
    this.tweens.forEach((t) => t.kill());
  }
}
