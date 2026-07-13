import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { ScrollService } from '../../../core/scroll.service';

interface NavLink {
  label: string;
  anchor: string;
}

/**
 * Fixed hairline bar. Transparent over the hero; gains a blurred paper
 * background after the fold. Hides on scroll-down, returns on scroll-up.
 * Wordmark only — no logo glyph, no icons.
 */
@Component({
  selector: 'app-navbar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header
      class="fixed inset-x-0 top-0 z-50 transition-[transform,background-color,border-color,backdrop-filter] duration-500"
      [class]="hidden() ? '-translate-y-full' : 'translate-y-0'"
      [style.background]="scrolled() ? 'rgba(251,251,253,0.82)' : 'transparent'"
      [style.backdropFilter]="scrolled() ? 'blur(20px) saturate(1.6)' : 'none'"
      [style.borderBottom]="scrolled() ? '1px solid rgba(29,29,31,0.08)' : '1px solid transparent'"
    >
      <nav class="container-edit flex h-16 items-center justify-between" aria-label="Navigație principală">
        <a
          href="#top"
          (click)="go($event, '#top')"
          class="text-[1.0625rem] font-semibold tracking-tight text-ink"
          aria-label="SkinAlert — pagina principală"
        >
          SkinAlert
        </a>

        <ul class="hidden items-center gap-8 lg:flex">
          @for (link of links; track link.anchor) {
            <li>
              <a
                [href]="link.anchor"
                (click)="go($event, link.anchor)"
                class="link-draw text-sm font-medium text-ink/60 transition-colors hover:text-ink"
              >
                {{ link.label }}
              </a>
            </li>
          }
        </ul>

        <div class="flex items-center gap-3">
          <a
            href="#analyzer"
            (click)="go($event, '#analyzer')"
            class="btn-pill hidden items-center justify-center px-5 py-2 text-sm lg:inline-flex"
          >
            <span class="btn-label">
              <span>Analizează</span>
              <span aria-hidden="true">Analizează</span>
            </span>
          </a>

          <button
            type="button"
            class="relative flex h-10 w-10 flex-col items-center justify-center gap-[5px] lg:hidden"
            (click)="menuOpen.set(!menuOpen())"
            [attr.aria-expanded]="menuOpen()"
            aria-controls="mobile-menu"
            aria-label="Deschide sau închide meniul"
          >
            <span
              class="h-px w-5 bg-ink transition-transform duration-300"
              [class]="menuOpen() ? 'translate-y-[3px] rotate-45' : ''"
            ></span>
            <span
              class="h-px w-5 bg-ink transition-transform duration-300"
              [class]="menuOpen() ? '-translate-y-[3px] -rotate-45' : ''"
            ></span>
          </button>
        </div>
      </nav>

      @if (menuOpen()) {
        <div
          id="mobile-menu"
          class="border-t border-ink/8 bg-base/95 px-6 pb-8 pt-4 backdrop-blur-xl lg:hidden"
        >
          <ul class="flex flex-col">
            @for (link of links; track link.anchor) {
              <li class="rule first:border-t-0">
                <a
                  [href]="link.anchor"
                  (click)="go($event, link.anchor)"
                  class="block py-4 text-2xl font-semibold tracking-tight text-ink"
                >
                  {{ link.label }}
                </a>
              </li>
            }
            <li class="mt-6">
              <a
                href="#analyzer"
                (click)="go($event, '#analyzer')"
                class="btn-pill inline-flex w-full px-6 py-4 text-base"
              >
                Analizează o fotografie
              </a>
            </li>
          </ul>
        </div>
      }
    </header>
  `,
})
export class NavbarComponent {
  private readonly scroll = inject(ScrollService);

  readonly links: NavLink[] = [
    { label: 'Analiză', anchor: '#analyzer' },
    { label: 'Cum funcționează', anchor: '#how-it-works' },
    { label: 'Precizie', anchor: '#accuracy' },
    { label: 'Tehnologie', anchor: '#technology' },
    { label: 'Întrebări', anchor: '#faq' },
  ];

  readonly menuOpen = signal(false);

  readonly scrolled = computed(() => this.scroll.scrollY() > 24);
  readonly hidden = computed(
    () => !this.menuOpen() && this.scroll.direction() === 1 && this.scroll.scrollY() > 480,
  );

  go(event: Event, anchor: string): void {
    event.preventDefault();
    this.menuOpen.set(false);
    this.scroll.scrollTo(anchor === '#top' ? 0 : anchor);
  }
}
