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
    <section id="top" class="relative flex min-h-svh items-center overflow-hidden">
      <!-- Ambient gradients -->
      <div aria-hidden="true" class="pointer-events-none absolute inset-0">
        <div class="absolute -top-40 left-1/2 h-[38rem] w-[60rem] -translate-x-1/2 rounded-full bg-primary/10 blur-[140px]"></div>
        <div class="absolute top-1/3 -left-40 h-96 w-96 rounded-full bg-secondary/10 blur-[120px] animate-pulse [animation-duration:6s]"></div>
        <div class="absolute right-0 bottom-0 h-80 w-80 rounded-full bg-primary/5 blur-[100px]"></div>
        <!-- Subtle grid -->
        <div
          class="absolute inset-0 opacity-[0.35] [background-image:linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] [background-size:72px_72px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_40%,black,transparent)]"
        ></div>
      </div>

      <!-- 3D scene, deferred so first paint is instant -->
      @defer (on idle) {
        <div class="absolute inset-0 opacity-60 sm:opacity-80 lg:left-[22%] lg:opacity-95" aria-hidden="true">
          <app-hero-scene />
        </div>
      }

      <div class="relative z-10 mx-auto grid w-full max-w-7xl gap-16 px-6 pt-40 pb-24 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:pt-32">
        <div>
          <p appReveal mode="fade" class="section-label mb-8">AI-Powered Skin Health</p>

          <h1 class="text-balance text-5xl font-bold leading-[1.04] tracking-tight sm:text-6xl xl:text-7xl">
            <span appReveal mode="words" [stagger]="0.07" class="block">Early Detection.</span>
            <!-- Whole-line reveal: word-splitting would break background-clip:text -->
            <span appReveal mode="blur" [delay]="0.45" class="text-gradient text-glow block">
              Powered by Artificial Intelligence.
            </span>
          </h1>

          <p appReveal mode="fade" [delay]="0.9" class="mt-8 max-w-xl text-lg leading-relaxed text-gray-400">
            SkinAlert helps you analyze skin lesion images using advanced AI to identify
            potentially suspicious lesions in seconds. Designed to support early
            awareness — not to replace professional medical diagnosis.
          </p>

          <div appReveal mode="fade" [delay]="1.1" class="mt-10 flex flex-wrap items-center gap-4">
            <a href="#cta" (click)="go($event, '#cta')" appRipple class="btn-primary rounded-2xl px-8 py-4 text-base font-semibold">
              Start Analysis
            </a>
            <a href="#how-it-works" (click)="go($event, '#how-it-works')" appRipple class="btn-ghost rounded-2xl px-8 py-4 text-base font-medium text-gray-200">
              Learn More
            </a>
          </div>

          <div appReveal mode="fade" [delay]="1.3" class="mt-12 flex items-center gap-3 text-sm text-gray-500">
            <svg viewBox="0 0 24 24" class="size-4 text-primary" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M12 2l7 4v6c0 4.5-3 8.5-7 10-4-1.5-7-5.5-7-10V6l7-4z" />
              <path d="M9 12l2 2 4-4" />
            </svg>
            Supports awareness. A dermatologist confirms the diagnosis.
          </div>
        </div>

        <!-- Reserved space so the orb reads as the visual column on desktop -->
        <div class="hidden min-h-[28rem] lg:block" aria-hidden="true"></div>
      </div>

      <!-- Scroll cue -->
      <div aria-hidden="true" class="absolute bottom-8 left-1/2 -translate-x-1/2">
        <div class="flex h-10 w-6 items-start justify-center rounded-full border border-white/15 p-1.5">
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
