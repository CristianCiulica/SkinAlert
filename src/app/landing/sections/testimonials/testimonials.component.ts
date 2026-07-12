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
    <section class="section bg-white" aria-labelledby="testimonials-heading">
      <div class="mx-auto max-w-7xl px-6">
        <p appReveal mode="fade" class="section-label">Voci de încredere</p>
        <h2 id="testimonials-heading" appReveal mode="words" [stagger]="0.05" class="mt-6 max-w-2xl text-4xl font-bold tracking-tighter text-black sm:text-5xl">
          Ce spun experții și utilizatorii despre SkinAlert.
        </h2>

        <div class="mt-16 grid gap-6 md:grid-cols-3">
          @for (t of testimonials; track t.name; let i = $index) {
            <figure
              appReveal
              mode="fade"
              [delay]="i * 0.15"
              appTilt
              [strength]="4"
              class="float-card card flex flex-col rounded-3xl p-8"
              [style.animationDelay]="i * 1.3 + 's'"
            >
              <svg viewBox="0 0 24 24" class="size-8 text-black/10" fill="currentColor" aria-hidden="true">
                <path d="M10 8v6a4 4 0 0 1-4 4H5a1 1 0 0 1 0-2h1a2 2 0 0 0 2-2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2zm11 0v6a4 4 0 0 1-4 4h-1a1 1 0 0 1 0-2h1a2 2 0 0 0 2-2h-3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2z"/>
              </svg>
              <blockquote class="mt-5 flex-1 font-medium leading-relaxed text-black/80">{{ t.quote }}</blockquote>
              <figcaption class="mt-8 flex items-center gap-4 border-t border-black/5 pt-6">
                <span class="grid size-11 place-items-center rounded-full bg-gradient-to-br from-black to-gray-700 text-sm font-bold text-white shadow-md">{{ t.initials }}</span>
                <div>
                  <p class="text-sm font-bold text-black">{{ t.name }}</p>
                  <p class="text-xs font-medium text-black/50">{{ t.role }}</p>
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
      quote: 'Am observat o aluniță care își schimba forma, iar SkinAlert mi-a recomandat să o verific. Medicul meu dermatolog a confirmat necesitatea eliminării ei. Acea scanare de cinci secunde a contat enorm.',
      name: 'Maya R.',
      role: 'Utilizator, București',
      initials: 'MR',
    },
    {
      quote: 'Ca medic, apreciez onestitatea aplicației: este un instrument excelent de triaj care îndrumă pacienții spre îngrijire profesională din timp, fără a oferi verdicte finale false.',
      name: 'Dr. Andrei Popescu',
      role: 'Medic Dermatolog',
      initials: 'AP',
    },
    {
      quote: 'Hărțile termice sunt extraordinare. Poți vedea exact de ce inteligența artificială consideră o zonă suspectă, în loc să ai încredere oarbă într-un număr.',
      name: 'Jonas K.',
      role: 'Inginer ML',
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
