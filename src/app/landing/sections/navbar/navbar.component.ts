import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { ScrollService } from '../../../core/scroll.service';
import { RippleDirective } from '../../../shared/directives/ripple.directive';

interface NavLink {
  label: string;
  anchor: string;
}

@Component({
  selector: 'app-navbar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RippleDirective],
  template: `
    <header
      class="glass fixed inset-x-0 top-0 z-50 border-b transition-[border-color,box-shadow] duration-300"
      [class]="scrolled() ? 'border-black/10 shadow-[0_1px_12px_rgba(0,0,0,0.05)]' : 'border-transparent'"
    >
      <nav
        class="mx-auto flex h-16 max-w-7xl items-center justify-between gap-8 px-6"
        aria-label="Navigație principală"
      >
        <a
          href="#top"
          (click)="go($event, '#top')"
          class="flex items-center gap-2.5 text-lg font-semibold tracking-tight text-ink"
          aria-label="SkinAlert — pagina principală"
        >
          <span class="grid size-7 place-items-center rounded-lg bg-accent text-white">
            <svg viewBox="0 0 24 24" class="size-4" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M12 2l7 4v6c0 4.5-3 8.5-7 10-4-1.5-7-5.5-7-10V6l7-4z"/><circle cx="12" cy="11" r="2.6"/>
            </svg>
          </span>
          SkinAlert
        </a>

        <ul class="hidden items-center gap-1 lg:flex">
          @for (link of links; track link.anchor) {
            <li>
              <a
                [href]="link.anchor"
                (click)="go($event, link.anchor)"
                class="whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium text-ink/70 transition-colors hover:bg-black/5 hover:text-ink"
              >
                {{ link.label }}
              </a>
            </li>
          }
        </ul>

        <div class="flex items-center gap-2">
          <a
            href="#analyzer"
            (click)="go($event, '#analyzer')"
            appRipple
            class="btn-accent hidden whitespace-nowrap px-5 py-2 text-sm lg:inline-flex"
          >
            Analizează
          </a>

          <button
            type="button"
            class="grid size-10 place-items-center rounded-full text-ink transition-colors hover:bg-black/5 lg:hidden"
            (click)="menuOpen.set(!menuOpen())"
            [attr.aria-expanded]="menuOpen()"
            aria-controls="mobile-menu"
            aria-label="Deschide sau închide meniul"
          >
            <svg viewBox="0 0 24 24" class="size-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
              @if (menuOpen()) {
                <path d="M6 6l12 12M18 6L6 18" />
              } @else {
                <path d="M4 7h16M4 12h16M4 17h16" />
              }
            </svg>
          </button>
        </div>
      </nav>

      @if (menuOpen()) {
        <div id="mobile-menu" class="border-t border-black/5 px-6 pb-6 pt-3 lg:hidden">
          <ul class="flex flex-col gap-1">
            @for (link of links; track link.anchor) {
               <li>
                <a
                  [href]="link.anchor"
                  (click)="go($event, link.anchor)"
                  class="block rounded-xl px-4 py-3 text-base font-medium text-ink/80 transition-colors hover:bg-black/5 hover:text-ink"
                >
                  {{ link.label }}
                </a>
              </li>
            }
            <li class="mt-2">
              <a
                href="#analyzer"
                (click)="go($event, '#analyzer')"
                appRipple
                class="btn-accent block rounded-xl px-5 py-3.5 text-center text-base"
              >
                Analizează Acum
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
    { label: 'Platformă AI', anchor: '#analyzer' },
    { label: 'Cum funcționează', anchor: '#how-it-works' },
    { label: 'Tehnologie', anchor: '#technology' },
    { label: 'Funcționalități', anchor: '#features' },
    { label: 'FAQ', anchor: '#faq' },
  ];

  readonly menuOpen = signal(false);

  readonly scrolled = computed(() => this.scroll.scrollY() > 24);

  go(event: Event, anchor: string): void {
    event.preventDefault();
    this.menuOpen.set(false);
    this.scroll.scrollTo(anchor === '#top' ? 0 : anchor);
  }
}
