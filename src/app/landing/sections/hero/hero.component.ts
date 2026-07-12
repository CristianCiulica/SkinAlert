import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ScrollService } from '../../../core/scroll.service';
import { RevealDirective } from '../../../shared/directives/reveal.directive';
import { RippleDirective } from '../../../shared/directives/ripple.directive';
import { HeroSceneComponent } from './hero-scene.component';

@Component({
  selector: 'app-hero',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RevealDirective, RippleDirective],
  template: `
    <section id="top" class="relative flex min-h-svh flex-col items-center justify-center overflow-hidden bg-mesh">
      <!-- Ambient light overlays -->
      <div aria-hidden="true" class="pointer-events-none absolute inset-0 mix-blend-overlay">
        <div class="absolute -top-40 left-1/2 h-[50rem] w-[80rem] -translate-x-1/2 rounded-full bg-white/40 blur-[100px]"></div>
      </div>

      <div class="relative z-10 mx-auto flex w-full max-w-5xl flex-col items-center px-6 text-center">
        <p appReveal mode="fade" class="section-label mb-6 text-black/50">O nouă eră a analizei dermatologice</p>

        <h1 class="text-balance text-[4.5rem] font-bold leading-[1.02] tracking-tighter sm:text-[6.5rem] lg:text-[8.5rem] text-black drop-shadow-sm">
          <span appReveal mode="words" [stagger]="0.07" class="block">Descoperă</span>
          <span appReveal mode="blur" [delay]="0.45" class="block text-gradient">
            ce îți spune pielea.
          </span>
        </h1>

        <div appReveal mode="fade" [delay]="0.9" class="mt-16 flex flex-col items-center justify-center gap-6 sm:flex-row">
          <a href="#analyzer" (click)="go($event, '#analyzer')" appRipple class="btn-primary px-12 py-5 text-xl backdrop-blur-md">
            Analizează Acum
          </a>
          <a href="#how-it-works" (click)="go($event, '#how-it-works')" appRipple class="btn-ghost px-10 py-5 text-xl font-medium text-black">
            Află Mai Multe
          </a>
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
