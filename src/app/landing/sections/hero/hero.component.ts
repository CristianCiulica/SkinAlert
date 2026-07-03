import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ScrollService } from '../../../core/scroll.service';
import { RevealDirective } from '../../../shared/directives/reveal.directive';
import { RippleDirective } from '../../../shared/directives/ripple.directive';
import { HeroSceneComponent } from './hero-scene.component';

@Component({
  selector: 'app-hero',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RevealDirective, RippleDirective, HeroSceneComponent],
  template: `
    <section id="top" class="relative flex min-h-svh flex-col items-center overflow-hidden">
      <!-- Airy ambient washes, barely there -->
      <div aria-hidden="true" class="pointer-events-none absolute inset-0">
        <div class="absolute -top-48 left-1/2 h-[36rem] w-[64rem] -translate-x-1/2 rounded-full bg-secondary/10 blur-[160px]"></div>
        <div class="absolute bottom-0 left-1/2 h-[28rem] w-[50rem] -translate-x-1/2 translate-y-1/3 rounded-full bg-primary/6 blur-[140px]"></div>
      </div>

      <!-- 3D scene sits beneath the copy, like a product on a stage -->
      @defer (on idle) {
        <div class="absolute inset-x-0 top-[38%] bottom-0 opacity-90" aria-hidden="true">
          <app-hero-scene />
          <!-- Soft fade so the object melts into the page -->
          <div class="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-base to-transparent"></div>
        </div>
      }

      <div class="relative z-10 mx-auto flex w-full max-w-4xl flex-col items-center px-6 pt-44 pb-[42vh] text-center sm:pt-52">
        <p appReveal mode="fade" class="section-label mb-8">AI-Powered Skin Health</p>

        <h1 class="text-balance text-5xl font-semibold leading-[1.05] tracking-tight sm:text-7xl">
          <span appReveal mode="words" [stagger]="0.07" class="block">Early Detection.</span>
          <!-- Whole-line reveal: word-splitting would break background-clip:text -->
          <span appReveal mode="blur" [delay]="0.45" class="text-gradient block">
            Powered by AI.
          </span>
        </h1>

        <p appReveal mode="fade" [delay]="0.9" class="mt-8 max-w-2xl text-lg leading-relaxed text-muted sm:text-xl">
          SkinAlert helps analyze skin lesion images with advanced artificial
          intelligence to support early awareness and encourage professional
          dermatological evaluation.
        </p>

        <div appReveal mode="fade" [delay]="1.1" class="mt-10 flex flex-wrap items-center justify-center gap-4">
          <a href="#cta" (click)="go($event, '#cta')" appRipple class="btn-primary rounded-full px-8 py-4 text-base font-semibold">
            Start Analysis
          </a>
          <a href="#how-it-works" (click)="go($event, '#how-it-works')" appRipple class="btn-ghost rounded-full px-8 py-4 text-base font-medium">
            Learn More
          </a>
        </div>

        <div appReveal mode="fade" [delay]="1.3" class="mt-10 flex items-center gap-2.5 text-sm text-muted">
          <svg viewBox="0 0 24 24" class="size-4 text-primary" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M12 2l7 4v6c0 4.5-3 8.5-7 10-4-1.5-7-5.5-7-10V6l7-4z" />
            <path d="M9 12l2 2 4-4" />
          </svg>
          Supports awareness. A dermatologist confirms the diagnosis.
        </div>
      </div>

      <!-- Scroll cue -->
      <div aria-hidden="true" class="absolute bottom-8 left-1/2 z-10 -translate-x-1/2">
        <div class="flex h-10 w-6 items-start justify-center rounded-full border border-line bg-white/60 p-1.5 backdrop-blur">
          <div class="size-1.5 animate-bounce rounded-full bg-primary"></div>
        </div>
      </div>
    </section>
  `,
})
export class HeroComponent {
  private readonly scroll = inject(ScrollService);

  go(event: Event, anchor: string): void {
    event.preventDefault();
    this.scroll.scrollTo(anchor);
  }
}
