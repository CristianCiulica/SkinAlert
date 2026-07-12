import { NgTemplateOutlet } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  Directive,
  ElementRef,
  NgZone,
  OnDestroy,
  TemplateRef,
  inject,
  signal,
  viewChild,
  viewChildren,
} from '@angular/core';
import { ScrollTrigger } from '../../../core/gsap';
import { RevealDirective } from '../../../shared/directives/reveal.directive';

interface ShowcaseStep {
  title: string;
  caption: string;
}

/**
 * Marks a phone-screen template. A bare viewChildren(TemplateRef) would
 * also match Angular's control-flow block templates, so screens are
 * tagged explicitly.
 */
@Directive({ selector: 'ng-template[appScreen]' })
export class ScreenTemplateDirective {
  readonly template = inject(TemplateRef<unknown>);
}

/**
 * Apple-style sticky showcase: the phone mockup stays pinned while
 * vertical scroll drives which app screen is visible. Screen switching
 * is pure CSS transitions keyed off the active index, so scrubbing
 * stays cheap. Screen templates are declared in step order and picked
 * up positionally via viewChildren(ScreenTemplateDirective).
 */
@Component({
  selector: 'app-sticky-showcase',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RevealDirective, NgTemplateOutlet, ScreenTemplateDirective],
  template: `
    <section id="showcase" #wrap class="relative bg-surface" [style.height]="'calc(' + steps.length + ' * 90vh)'" aria-labelledby="showcase-heading">
      <div class="sticky top-0 flex min-h-svh items-center overflow-hidden">
        <div aria-hidden="true" class="pointer-events-none absolute inset-0">
          <div class="absolute top-1/2 left-1/2 h-[36rem] w-[36rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-black/5 blur-[160px]"></div>
        </div>

        <div class="relative mx-auto grid w-full max-w-7xl items-center gap-16 px-6 py-20 lg:grid-cols-2">
          <!-- Copy column -->
          <div>
            <p appReveal mode="fade" class="section-label">În interiorul aplicației</p>
            <h2 id="showcase-heading" appReveal mode="words" [stagger]="0.05" class="mt-6 text-4xl font-bold tracking-tighter text-black sm:text-5xl">
              Un ghid pas cu pas, clar și intuitiv.
            </h2>

            <ol class="mt-12 space-y-1" aria-label="App walkthrough steps">
              @for (step of steps; track step.title; let i = $index) {
                <li
                  class="flex items-start gap-4 rounded-2xl px-4 py-3.5 transition-all duration-500"
                  [class.bg-white]="active() === i"
                  [class.shadow-md]="active() === i"
                  [class.opacity-40]="active() !== i"
                  [attr.aria-current]="active() === i ? 'step' : null"
                >
                  <span
                    class="mt-0.5 grid size-7 shrink-0 place-items-center rounded-full text-xs font-bold transition-colors duration-500"
                    [class]="active() >= i ? 'bg-black text-white' : 'border border-line text-black/50'"
                  >{{ i + 1 }}</span>
                  <div>
                    <p class="font-bold" [class.text-black]="active() === i">{{ step.title }}</p>
                    @if (active() === i) {
                      <p class="mt-1 text-sm text-black/60">{{ step.caption }}</p>
                    }
                  </div>
                </li>
              }
            </ol>
          </div>

          <!-- Phone mockup -->
          <div class="flex justify-center">
            <!-- Silver iPhone frame -->
            <div class="relative w-[19rem] rounded-[3rem] border border-[#d2d2d7] bg-gradient-to-b from-[#ffffff] to-[#f2f2f7] p-2.5 shadow-[0_32px_80px_-24px_rgba(0,0,0,0.15),0_2px_8px_rgba(0,0,0,0.06)]">
              <!-- Dynamic Island -->
              <div aria-hidden="true" class="absolute top-[1.15rem] left-1/2 z-30 flex h-[1.65rem] w-[6.25rem] -translate-x-1/2 items-center justify-end rounded-full bg-black pr-2 shadow-[0_1px_3px_rgba(0,0,0,0.45)]">
                <span class="size-2.5 rounded-full bg-[#0a0a0a] ring-1 ring-white/15"></span>
              </div>
              <div class="relative aspect-[9/19] overflow-hidden rounded-[2.4rem] border border-black/5 bg-white">
                @for (step of steps; track step.title; let i = $index) {
                  <div
                    class="absolute inset-0 flex flex-col px-6 pt-14 pb-8 transition-all duration-700 ease-out"
                    [class]="active() === i ? 'opacity-100 scale-100 blur-0' : (active() > i ? 'opacity-0 scale-105 blur-sm' : 'opacity-0 scale-95 blur-sm')"
                    [attr.aria-hidden]="active() !== i"
                  >
                    @if (screens().length > i) {
                      <ng-container [ngTemplateOutlet]="screens()[i].template" />
                    }
                  </div>
                }
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ===== Phone screens ===== -->
      <ng-template appScreen>
        <div class="flex flex-1 flex-col items-center justify-center text-center">
          <span class="grid size-16 place-items-center rounded-2xl bg-black text-white shadow-lg shadow-black/20">
            <svg viewBox="0 0 24 24" class="size-8" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 2l7 4v6c0 4.5-3 8.5-7 10-4-1.5-7-5.5-7-10V6l7-4z"/><circle cx="12" cy="11" r="2.6"/></svg>
          </span>
          <p class="mt-6 text-xl font-bold text-black">Bun venit în SkinAlert</p>
          <p class="mt-2 text-sm text-black/60">Detecție timpurie. Decizii informate.</p>
          <span class="btn-primary mt-8 rounded-xl px-6 py-2.5 text-sm font-semibold">Începe</span>
        </div>
      </ng-template>

      <ng-template appScreen>
        <p class="text-sm font-bold text-black/50">Fotografiază</p>
        <div class="mt-4 flex flex-1 flex-col items-center justify-center rounded-2xl border border-dashed border-line bg-surface">
          <div class="relative size-28 rounded-full border-2 border-black/60">
            <span class="absolute inset-3 rounded-full bg-gradient-to-br from-amber-200/30 to-amber-900/40"></span>
            <span class="absolute top-8 left-10 size-6 rounded-full bg-amber-950/80"></span>
            <span class="absolute inset-0 animate-ping rounded-full border border-black/40 [animation-duration:2.5s]"></span>
          </div>
          <p class="mt-6 text-xs text-black/60 font-medium">Centrează leziunea în cadru</p>
        </div>
        <span class="mx-auto mt-6 grid size-14 place-items-center rounded-full border-4 border-[#d2d2d7]"><span class="size-10 rounded-full bg-white shadow-[0_1px_4px_rgba(0,0,0,0.15)]"></span></span>
      </ng-template>

      <ng-template appScreen>
        <p class="text-sm font-bold text-black/50">Încărcare</p>
        <div class="mt-4 flex flex-1 flex-col justify-center gap-4">
          <div class="card rounded-2xl p-4">
            <div class="flex items-center gap-3">
              <span class="size-11 rounded-xl bg-gradient-to-br from-amber-200/30 to-amber-900/40"></span>
              <div class="flex-1">
                <p class="text-sm font-bold text-black">leziune_0142.jpg</p>
                <div class="mt-2 h-1.5 overflow-hidden rounded-full bg-black/10">
                  <div class="h-full w-3/4 rounded-full bg-gradient-to-r from-black to-gray-500"></div>
                </div>
              </div>
              <span class="text-xs font-bold text-black">76%</span>
            </div>
          </div>
          <p class="text-center text-xs font-medium text-black/50">Criptat end-to-end · TLS 1.3</p>
        </div>
      </ng-template>

      <ng-template appScreen>
        <p class="text-sm font-bold text-black/50">Procesare AI</p>
        <div class="flex flex-1 flex-col items-center justify-center">
          <div class="relative size-28">
            <span class="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-black [animation-duration:1.4s]"></span>
            <span class="absolute inset-3 animate-spin rounded-full border-2 border-transparent border-b-gray-400 [animation-duration:2s]"></span>
            <span class="absolute inset-0 grid place-items-center text-sm font-bold text-black">AI</span>
          </div>
          <p class="mt-6 text-sm font-medium text-black/60">Se analizează 14,082 parametri…</p>
        </div>
      </ng-template>

      <ng-template appScreen>
        <p class="text-sm font-bold text-black/50">Harta Termică</p>
        <div class="mt-4 flex flex-1 items-center justify-center">
          <div class="relative size-44 overflow-hidden rounded-2xl bg-gradient-to-br from-amber-200/20 to-amber-900/30">
            <span class="absolute top-8 left-10 size-20 rounded-full bg-danger/50 blur-xl"></span>
            <span class="absolute top-12 left-14 size-12 rounded-full bg-warning/60 blur-lg"></span>
            <span class="absolute top-14 left-16 size-7 rounded-full bg-danger/90 blur-md"></span>
            <span class="absolute right-3 bottom-3 rounded-md bg-white px-2 py-1 text-[0.6rem] font-bold text-black shadow-sm">Grad-CAM</span>
          </div>
        </div>
        <p class="mt-4 text-center text-xs font-medium text-black/60">Regiunile care au influențat rezultatul</p>
      </ng-template>

      <ng-template appScreen>
        <p class="text-sm font-bold text-black/50">Scor de Risc</p>
        <div class="flex flex-1 flex-col items-center justify-center">
          <div class="relative grid size-36 place-items-center rounded-full" style="background: conic-gradient(#ff9500 0deg 245deg, rgba(0,0,0,0.05) 245deg)">
            <div class="grid size-28 place-items-center rounded-full bg-white text-center shadow-[inset_0_1px_4px_rgba(0,0,0,0.1)]">
              <div>
                <p class="text-3xl font-bold text-warning">68</p>
                <p class="text-[0.65rem] tracking-widest text-black/50 font-bold">MODERAT</p>
              </div>
            </div>
          </div>
          <p class="mt-6 text-center text-xs leading-relaxed font-medium text-black/60">A fost detectată o asimetrie și o margine neregulată</p>
        </div>
      </ng-template>

      <ng-template appScreen>
        <p class="text-sm font-bold text-black/50">Recomandare</p>
        <div class="flex flex-1 flex-col justify-center gap-3">
          <div class="rounded-2xl border border-warning/30 bg-warning/10 p-4">
            <p class="text-sm font-bold text-warning">Consultă un dermatolog</p>
            <p class="mt-1.5 text-xs font-medium leading-relaxed text-black/70">Această leziune prezintă trăsături care necesită evaluare profesională. Programează-te în decurs de 2-4 săptămâni.</p>
          </div>
          <span class="btn-primary rounded-xl px-5 py-3 text-center text-sm font-semibold">Găsește specialiști</span>
          <p class="text-center text-[0.65rem] font-medium text-black/40">Acesta nu este un diagnostic medical</p>
        </div>
      </ng-template>
    </section>
  `,
})
export class StickyShowcaseComponent implements AfterViewInit, OnDestroy {
  private readonly zone = inject(NgZone);

  private readonly wrap = viewChild.required<ElementRef<HTMLElement>>('wrap');
  readonly screens = viewChildren(ScreenTemplateDirective);

  private trigger?: ScrollTrigger;

  readonly active = signal(0);

  readonly steps: ShowcaseStep[] = [
    { title: 'Bun venit', caption: 'Un început simplu, fără distracții.' },
    { title: 'Fotografiază', caption: 'Ghidul nostru te ajută să obții o imagine utilă clinic.' },
    { title: 'Încărcare Securizată', caption: 'Fișiere criptate cu verificare instantă a calității imaginii.' },
    { title: 'Procesare AI', caption: 'Rețeaua evaluează mii de trăsături vizuale în câteva secunde.' },
    { title: 'Harta Termică', caption: 'Inteligența artificială explicabilă îți arată ce a detectat.' },
    { title: 'Scor de Risc', caption: 'O estimare clară — niciodată o alertă fără context adecvat.' },
    { title: 'Recomandare Medicală', caption: 'Pași concreți de urmat, îndrumându-te mereu către profesioniști.' },
  ];

  ngAfterViewInit(): void {
    this.zone.runOutsideAngular(() => {
      this.trigger = ScrollTrigger.create({
        trigger: this.wrap().nativeElement,
        start: 'top top',
        end: 'bottom bottom',
        onUpdate: (self) => {
          const idx = Math.min(
            this.steps.length - 1,
            Math.floor(self.progress * this.steps.length),
          );
          if (idx !== this.active()) {
            this.zone.run(() => this.active.set(idx));
          }
        },
      });
    });
  }

  ngOnDestroy(): void {
    this.trigger?.kill();
  }
}
