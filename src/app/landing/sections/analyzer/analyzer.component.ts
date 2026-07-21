import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  effect,
  inject,
  signal,
  untracked,
} from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { gsap } from '../../../core/gsap';
import { MotionService } from '../../../core/motion.service';
import { AnalyzerService, AnalysisResult } from '../../../core/analyzer.service';
import { RevealDirective } from '../../../shared/directives/reveal.directive';

/**
 * The product itself, embedded in the page. Upload → analysis → verdict.
 * Every state is designed: idle dropzone, drag-over, scanning, low-quality,
 * error, and the two verdicts. The verdict number counts up and the risk
 * bar draws — driven imperatively with GSAP when the result lands.
 */
@Component({
  selector: 'app-analyzer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DecimalPipe, RevealDirective],
  template: `
    <section id="analyzer" class="section bg-surface" aria-labelledby="analyzer-heading">
      <div class="container-edit">
        <div class="rule flex items-baseline justify-between pt-6">
          <p appReveal mode="fade" class="index-label">01</p>
          <p appReveal mode="fade" class="index-label">Analiză</p>
        </div>

        <h2
          id="analyzer-heading"
          appReveal
          mode="words"
          [stagger]="0.04"
          class="headline mt-16 max-w-3xl text-[clamp(2.5rem,6vw,4.5rem)] text-ink"
        >
          Încearcă acum.
        </h2>
        <p appReveal mode="fade" [delay]="0.15" class="mt-6 max-w-lg text-lg text-ink/60">
          Încarcă o fotografie clară a aluniței. Fără cont, fără așteptare.
        </p>

        <div id="upload" appReveal mode="scale" [delay]="0.2" class="mx-auto mt-16 max-w-4xl">
          <!-- Idle / drag-over -->
          @if (!preview()) {
            <label
              class="focus-ring-within group relative flex cursor-pointer flex-col items-center justify-center gap-8 rounded-[2rem] bg-base px-8 py-28 text-center transition-[transform,background-color] duration-500 sm:py-36"
              [class]="dragOver() ? 'scale-[0.985] bg-white' : 'hover:bg-white'"
              (dragover)="onDragOver($event)"
              (dragleave)="onDragLeave($event)"
              (drop)="onDrop($event)"
            >
              <!-- Hairline frame that tightens on hover — the only ornament. -->
              <span
                aria-hidden="true"
                class="pointer-events-none absolute rounded-[1.6rem] border border-ink/12 transition-all duration-500"
                [class]="dragOver() ? 'inset-3 border-ink' : 'inset-6 group-hover:inset-4 group-hover:border-ink/30'"
              ></span>

              <span class="text-[3.5rem] font-light leading-none text-ink/30 transition-colors duration-500 group-hover:text-ink" aria-hidden="true">+</span>
              <span class="space-y-3">
                <span class="headline block text-2xl text-ink sm:text-3xl">
                  {{ dragOver() ? 'Eliberează fotografia' : 'Trage fotografia aici' }}
                </span>
                <span class="block text-base text-ink/45">
                  sau atinge pentru a alege · JPEG, PNG, WebP
                </span>
              </span>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                class="sr-only"
                aria-label="Încarcă o fotografie a aluniței"
                (change)="onFile($event)"
              />
            </label>

            @if (error()) {
              <p class="mt-6 text-center text-base font-medium text-danger" role="alert">
                {{ error() }}
              </p>
            }
          }

          <!-- Preview + verdict -->
          @if (preview()) {
            <div class="grid gap-2 overflow-hidden rounded-[2rem] bg-base p-2 sm:grid-cols-2">
              <div class="relative min-h-[360px] overflow-hidden rounded-[1.6rem] sm:min-h-[460px]">
                <img
                  [src]="preview()"
                  alt="Fotografia încărcată"
                  class="absolute inset-0 h-full w-full object-cover"
                  [class.scale-105]="loading()"
                  style="transition: transform 2.4s cubic-bezier(0.22, 1, 0.36, 1)"
                />
                @if (loading()) {
                  <div class="absolute inset-0 bg-ink/20"></div>
                  <div class="scan-sweep" aria-hidden="true"></div>
                }
<!-- Wrapper owns the absolute placement; .btn-pill keeps its own
                     position:relative for the label-slide animation. (In Tailwind v4
                     the unlayered .btn-pill wins over the "absolute" utility, so the
                     button element itself cannot be positioned directly.) -->
                <div class="pointer-events-none absolute inset-x-0 bottom-5 flex justify-center">
                  <button
                    type="button"
                    (click)="reset()"
                    class="btn-pill pointer-events-auto inline-flex whitespace-nowrap px-6 py-3 text-sm"
                    style="box-shadow: 0 0 0 1px rgba(255,255,255,0.18), 0 10px 28px -8px rgba(0,0,0,0.55)"
                  >
                    <span class="btn-label">
                      <span>Altă fotografie</span>
                      <span aria-hidden="true">Altă fotografie</span>
                    </span>
                  </button>
                </div>
              </div>

              <div
                class="flex flex-col justify-center rounded-[1.6rem] bg-white p-8 sm:p-12"
                aria-live="polite"
                [attr.aria-busy]="loading()"
              >
                @if (loading()) {
                  <div class="flex items-center gap-3 text-ink">
                    <span class="pulse-dot" aria-hidden="true"></span>
                    <span class="text-sm font-medium uppercase tracking-[0.14em]">{{
                      phase() === 'downloading' ? 'Se pregătește' : 'Analizăm'
                    }}</span>
                  </div>
                  @if (phase() === 'downloading') {
                    <p class="headline mt-6 text-3xl text-ink">Pregătim modelul AI pe dispozitivul tău.</p>
                    <p class="mt-4 text-base text-ink/50">Se descarcă o singură dată (~45&nbsp;MB), apoi rămâne salvat în browser.</p>
                  } @else {
                    <p class="headline mt-6 text-3xl text-ink">Citim fiecare detaliu al imaginii.</p>
                    <p class="mt-4 text-base text-ink/50">Totul rulează local — poza nu părăsește dispozitivul.</p>
                  }
                } @else if (error()) {
                  <p class="index-label text-danger" role="alert">Eroare</p>
                  <p class="headline mt-6 text-3xl text-ink">Nu am putut analiza fotografia.</p>
                  <p class="mt-4 text-base text-ink/60">{{ error() }}</p>
                  <button type="button" (click)="reset()" class="btn-line mt-10 inline-flex self-start px-7 py-3.5 text-sm">
                    <span class="btn-label">
                      <span>Încearcă din nou</span>
                      <span aria-hidden="true">Încearcă din nou</span>
                    </span>
                  </button>
                } @else if (result(); as r) {
                  @if (r.status === 'low_quality') {
                    <p class="index-label text-warning">Calitate insuficientă</p>
                    <p class="headline mt-6 text-3xl text-ink">Fotografia nu e destul de clară.</p>
                    <p class="mt-4 text-base leading-relaxed text-ink/60">{{ r.message }}</p>
                    <button type="button" (click)="reset()" class="btn-line mt-10 inline-flex self-start px-7 py-3.5 text-sm">
                      <span class="btn-label">
                        <span>Reîncearcă</span>
                        <span aria-hidden="true">Reîncearcă</span>
                      </span>
                    </button>
                  } @else {
                    <p class="index-label">Rezultat</p>
                    <p
                      class="headline mt-6 text-5xl sm:text-6xl"
                      [class]="r.label === 'suspect' ? 'text-warning' : 'text-success'"
                    >
                      {{ r.label === 'suspect' ? 'Suspect' : 'Benign' }}
                    </p>

                    <div class="mt-10">
                      <div class="flex items-baseline justify-between">
                        <p class="text-sm text-ink/50">Probabilitate de risc</p>
                        <p class="text-2xl font-semibold tabular-nums tracking-tight text-ink">
                          <span data-verdict-count>{{ r.probability_malignant * 100 | number: '1.0-1' }}</span>%
                        </p>
                      </div>
                      <div class="mt-3 h-px w-full bg-ink/10">
                        <div
                          data-verdict-bar
                          class="h-[3px] -translate-y-[1px] origin-left"
                          [class]="r.label === 'suspect' ? 'bg-warning' : 'bg-success'"
                          [style.width.%]="r.probability_malignant * 100"
                        ></div>
                      </div>
                    </div>

                    <p class="rule mt-10 pt-6 text-base leading-relaxed text-ink/70">
                      {{ r.recommendation }}
                    </p>
                    <p class="mt-6 text-sm text-ink/40">
                      Orientativ, nu diagnostic. Decizia finală aparține medicului.
                    </p>
                  }
                }
              </div>
            </div>
          }
        </div>
      </div>
    </section>
  `,
})
export class AnalyzerComponent {
  private readonly analyzer = inject(AnalyzerService);
  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly motion = inject(MotionService);

  readonly preview = signal<string | null>(null);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly result = signal<AnalysisResult | null>(null);
  readonly dragOver = signal(false);
  /** 'downloading' la prima analiză (aduce modelul), apoi 'running'. */
  readonly phase = this.analyzer.phase;

  private readonly accepted = ['image/jpeg', 'image/png', 'image/webp'];

  constructor() {
    // When a verdict lands, count the percentage up and draw the bar.
    effect(() => {
      const r = this.result();
      if (!r || r.status !== 'ok' || untracked(() => this.motion.reducedMotion())) return;

      requestAnimationFrame(() => {
        const host = this.el.nativeElement;
        const counter = host.querySelector<HTMLElement>('[data-verdict-count]');
        const bar = host.querySelector<HTMLElement>('[data-verdict-bar]');
        const target = r.probability_malignant * 100;

        if (counter) {
          const state = { value: 0 };
          gsap.to(state, {
            value: target,
            duration: 1.6,
            ease: 'power3.out',
            onUpdate: () => (counter.textContent = state.value.toFixed(1)),
          });
        }
        if (bar) {
          gsap.from(bar, { scaleX: 0, duration: 1.6, ease: 'power3.out' });
        }
      });
    });
  }

  onFile(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.handleFile(input.files?.[0]);
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.dragOver.set(true);
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.dragOver.set(false);
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.dragOver.set(false);
    this.handleFile(event.dataTransfer?.files?.[0]);
  }

  private async handleFile(file: File | undefined | null): Promise<void> {
    if (!file) return;
    if (!this.accepted.includes(file.type)) {
      this.error.set('Format neacceptat. Folosește o imagine JPEG, PNG sau WebP.');
      this.preview.set(null);
      this.result.set(null);
      return;
    }

    this.error.set(null);
    this.result.set(null);
    this.preview.set(URL.createObjectURL(file));
    this.loading.set(true);

    try {
      const res = await this.analyzer.analyze(file);
      this.result.set(res);
    } catch (e) {
      this.error.set(e instanceof Error ? e.message : 'Eroare necunoscută');
    } finally {
      this.loading.set(false);
    }
  }

  reset(): void {
    const url = this.preview();
    if (url) URL.revokeObjectURL(url);
    this.preview.set(null);
    this.result.set(null);
    this.error.set(null);
  }
}
